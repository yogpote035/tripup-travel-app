const UserModel = require("../../models/UserModel");
const FlightModel = require("../../models/FlightModel");
const TrainModel = require("../../models/TrainModel");
const BusModel = require("../../models/BusModel");
const FlightBookingModel = require("../../models/FlightBookingModel");
const TrainBookingModel = require("../../models/TrainBookingModel");
const BusBookingModel = require("../../models/BusBookingModel");
const PostModel = require("../../models/SocialFeed/PostModel");
const SessionModel = require("../../models/SessionModel");
const bcrypt = require("bcrypt");
const PhoneNumberValidator = require("../../Middleware/PhoneNumberValidator");

const PAGE_SIZE_LIMIT = 100;
const parsePaging = (query) => ({
  page: Math.max(1, Number.parseInt(query.page, 10) || 1),
  limit: Math.min(PAGE_SIZE_LIMIT, Math.max(1, Number.parseInt(query.limit, 10) || 10)),
});
const monthStart = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const dateOnly = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const bookingDate = (booking) => booking.bookingDate || booking.bookedAt || booking.createdAt;
const bookingAmount = (booking) => Number(booking.totalFare ?? booking.fare ?? 0);

function dateRange(query) {
  const filter = {};
  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from && !Number.isNaN(Date.parse(query.from))) filter.createdAt.$gte = new Date(query.from);
    if (query.to && !Number.isNaN(Date.parse(query.to))) filter.createdAt.$lte = new Date(`${query.to}T23:59:59.999Z`);
  }
  return filter;
}

async function allBookings(filter = {}) {
  const [flights, trains, buses] = await Promise.all([
    FlightBookingModel.find(filter).populate("user", "name email").lean(),
    TrainBookingModel.find(filter).populate("user", "name email").lean(),
    BusBookingModel.find(filter).populate("userId", "name email").lean(),
  ]);
  return [
    ...flights.map((item) => ({ ...item, type: "flight", customer: item.user })),
    ...trains.map((item) => ({ ...item, type: "train", customer: item.user })),
    ...buses.map((item) => ({ ...item, type: "bus", customer: item.userId })),
  ];
}

exports.getDashboard = async (req, res) => {
  try {
    const since = new Date(); since.setMonth(since.getMonth() - 11); since.setDate(1); since.setHours(0, 0, 0, 0);
    const [users, activeUsers, flights, trains, buses, posts, bookings] = await Promise.all([
      UserModel.countDocuments(), UserModel.countDocuments({ isActive: { $ne: false } }), FlightModel.countDocuments(),
      TrainModel.countDocuments(), BusModel.countDocuments(), PostModel.countDocuments(), allBookings({ createdAt: { $gte: since } }),
    ]);
    const completed = bookings.filter((item) => item.status !== "cancelled");
    const monthMap = new Map();
    const dailyMap = new Map(); const destinationMap = new Map(); const typeMap = new Map(); const userMap = new Map();
    completed.forEach((item) => {
      const created = bookingDate(item); if (!created) return;
      const month = monthStart(new Date(created)).toISOString().slice(0, 7);
      const day = dateOnly(new Date(created)).toISOString().slice(0, 10);
      const amount = bookingAmount(item);
      monthMap.set(month, (monthMap.get(month) || 0) + amount);
      dailyMap.set(day, (dailyMap.get(day) || 0) + 1);
      const destination = item.to || item.destination || "Unknown";
      destinationMap.set(destination, (destinationMap.get(destination) || 0) + 1);
      typeMap.set(item.type, (typeMap.get(item.type) || 0) + 1);
      if (item.customer?._id) userMap.set(String(item.customer._id), { name: item.customer.name || "Unknown", bookings: (userMap.get(String(item.customer._id))?.bookings || 0) + 1 });
    });
    const monthlyRevenue = Array.from({ length: 12 }, (_, index) => {
      const d = new Date(since.getFullYear(), since.getMonth() + index, 1); const key = d.toISOString().slice(0, 7);
      return { label: d.toLocaleString("en", { month: "short" }), value: monthMap.get(key) || 0 };
    });
    const userGrowth = await UserModel.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, value: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
    const serialiseMap = (map, key) => [...map.entries()].map(([label, value]) => ({ [key]: label, value })).sort((a, b) => b.value - a.value);
    const recentActivity = completed.sort((a, b) => new Date(bookingDate(b)) - new Date(bookingDate(a))).slice(0, 8).map((item) => ({ id: item._id, type: item.type, customer: item.customer?.name || "Guest", destination: item.to || item.destination || "Unknown", amount: bookingAmount(item), createdAt: bookingDate(item) }));
    return res.json({ data: { metrics: { totalUsers: users, activeUsers, totalBookings: completed.length, flights, trains, buses, hotels: 0, posts, revenue: completed.reduce((sum, item) => sum + bookingAmount(item), 0) }, charts: { monthlyRevenue, dailyBookings: serialiseMap(dailyMap, "label").slice(0, 14).reverse(), userGrowth: userGrowth.map((item) => ({ label: item._id, value: item.value })), popularDestinations: serialiseMap(destinationMap, "label").slice(0, 5), bookingTypes: serialiseMap(typeMap, "label"), mostActiveUsers: [...userMap.values()].sort((a, b) => b.bookings - a.bookings).slice(0, 5) }, recentActivity } });
  } catch (error) { return res.status(500).json({ message: "Unable to load dashboard" }); }
};

exports.getUsers = async (req, res) => {
  try {
    const { page, limit } = parsePaging(req.query); const search = String(req.query.search || "").trim();
    const filter = { role: { $ne: "admin" }, ...dateRange(req.query) };
    if (req.query.status === "active") filter.isActive = { $ne: false };
    if (req.query.status === "inactive") filter.isActive = false;
    if (search) filter.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];
    const sortField = ["name", "email", "createdAt"].includes(req.query.sortBy) ? req.query.sortBy : "createdAt";
    const direction = req.query.order === "asc" ? 1 : -1;
    const [items, total] = await Promise.all([UserModel.find(filter).select("name email phone role isActive createdAt").sort({ [sortField]: direction }).skip((page - 1) * limit).limit(limit).lean(), UserModel.countDocuments(filter)]);
    return res.json({ data: { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
  } catch (error) { return res.status(500).json({ message: "Unable to load users" }); }
};

exports.updateUserStatus = async (req, res) => {
  if (typeof req.body.isActive !== "boolean") return res.status(400).json({ message: "isActive must be a boolean" });
  const user = await UserModel.findOneAndUpdate({ _id: req.params.id, role: { $ne: "admin" } }, { isActive: req.body.isActive }, { new: true }).select("name email isActive");
  return user ? res.json({ data: user }) : res.status(404).json({ message: "User not found" });
};

exports.getAdmins = async (req, res) => {
  try {
    const { page, limit } = parsePaging(req.query);
    const search = String(req.query.search || "").trim();
    const filter = { role: "admin" };
    if (req.query.status === "active") filter.isActive = { $ne: false };
    if (req.query.status === "inactive") filter.isActive = false;
    if (search) filter.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];
    const [items, total] = await Promise.all([
      UserModel.find(filter).select("name email phone isActive createdAt").sort({ createdAt: req.query.order === "asc" ? 1 : -1 }).skip((page - 1) * limit).limit(limit).lean(),
      UserModel.countDocuments(filter),
    ]);
    return res.json({ data: { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
  } catch (error) { return res.status(500).json({ message: "Unable to load administrators" }); }
};

exports.createAdmin = async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (![name, email, phone, password].every(Boolean)) return res.status(400).json({ message: "Name, email, phone, and password are required" });
  if (String(password).length < 8) return res.status(400).json({ message: "Administrator password must contain at least 8 characters" });
  const normalizedEmail = String(email).trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return res.status(400).json({ message: "A valid email is required" });
  const validatedPhone = PhoneNumberValidator(phone);
  if (!validatedPhone.isValid) return res.status(400).json({ message: "Invalid phone number" });
  try {
    const exists = await UserModel.findOne({ $or: [{ email: normalizedEmail }, { phone: validatedPhone.formatted }] }).lean();
    if (exists) return res.status(409).json({ message: "An account with this email or phone already exists" });
    const admin = await UserModel.create({ name: String(name).trim(), email: normalizedEmail, phone: validatedPhone.formatted, password: await bcrypt.hash(password, 12), role: "admin", isActive: true });
    return res.status(201).json({ data: { _id: admin._id, name: admin.name, email: admin.email, phone: admin.phone, isActive: admin.isActive, createdAt: admin.createdAt } });
  } catch (error) { return res.status(500).json({ message: "Unable to create administrator" }); }
};

exports.updateAdminStatus = async (req, res) => {
  if (typeof req.body.isActive !== "boolean") return res.status(400).json({ message: "isActive must be a boolean" });
  if (String(req.params.id) === String(req.user.userId)) return res.status(400).json({ message: "You cannot change your own administrator status" });
  try {
    if (!req.body.isActive) {
      const activeAdmins = await UserModel.countDocuments({ role: "admin", isActive: { $ne: false } });
      if (activeAdmins <= 1) return res.status(400).json({ message: "At least one active administrator is required" });
    }
    const admin = await UserModel.findOneAndUpdate({ _id: req.params.id, role: "admin" }, { isActive: req.body.isActive }, { new: true }).select("name email isActive");
    if (!admin) return res.status(404).json({ message: "Administrator not found" });
    if (!admin.isActive) await SessionModel.updateMany({ userId: admin._id, isRevoked: false }, { isRevoked: true, revokedAt: new Date(), revokeReason: "ADMIN_DEACTIVATED" });
    return res.json({ data: admin });
  } catch (error) { return res.status(500).json({ message: "Unable to update administrator status" }); }
};

exports.getBookings = async (req, res) => {
  try {
    const { page, limit } = parsePaging(req.query); const search = String(req.query.search || "").toLowerCase();
    let items = await allBookings(dateRange(req.query));
    if (req.query.type && ["flight", "train", "bus"].includes(req.query.type)) items = items.filter((item) => item.type === req.query.type);
    if (req.query.status && ["booked", "cancelled"].includes(req.query.status)) items = items.filter((item) => item.status === req.query.status);
    if (search) items = items.filter((item) => [item.customer?.name, item.customer?.email, item.from || item.source, item.to || item.destination].some((value) => String(value || "").toLowerCase().includes(search)));
    const field = req.query.sortBy === "amount" ? "amount" : "date"; const direction = req.query.order === "asc" ? 1 : -1;
    items.sort((a, b) => direction * (field === "amount" ? bookingAmount(a) - bookingAmount(b) : new Date(bookingDate(a)) - new Date(bookingDate(b))));
    const total = items.length;
    items = items.slice((page - 1) * limit, page * limit).map((item) => ({ id: item._id, type: item.type, status: item.status, customer: item.customer?.name || "Guest", email: item.customer?.email || "", route: `${item.from || item.source || "—"} → ${item.to || item.destination || "—"}`, amount: bookingAmount(item), date: bookingDate(item) }));
    return res.json({ data: { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
  } catch (error) { return res.status(500).json({ message: "Unable to load bookings" }); }
};

exports.getPosts = async (req, res) => {
  try { const { page, limit } = parsePaging(req.query); const search = String(req.query.search || "").trim(); const filter = { ...dateRange(req.query) }; if (search) filter.$or = [{ title: { $regex: search, $options: "i" } }, { location: { $regex: search, $options: "i" } }, { "author.name": { $regex: search, $options: "i" } }]; const [items, total] = await Promise.all([PostModel.find(filter).sort({ createdAt: req.query.order === "asc" ? 1 : -1 }).skip((page - 1) * limit).limit(limit).lean(), PostModel.countDocuments(filter)]); return res.json({ data: { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } }); } catch (error) { return res.status(500).json({ message: "Unable to load posts" }); }
};
exports.deletePost = async (req, res) => { const post = await PostModel.findByIdAndDelete(req.params.id); return post ? res.status(204).send() : res.status(404).json({ message: "Post not found" }); };
