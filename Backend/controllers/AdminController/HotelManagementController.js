const HotelModel = require("../../models/HotelModel");
const cloudinary = require("../../Middleware/cloudinary");

const pageOf = (query) => ({
    page: Math.max(1, Number.parseInt(query.page, 10) || 1),
    limit: Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 10)),
});

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseStringArray = (value) => {
    if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
    if (value === undefined || value === null || value === "") return [];
    return String(value)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
};

const uploadHotelImages = async (files = []) => {
    if (!files || files.length === 0) return [];
    const results = await Promise.all(files.map((file) => cloudinary.uploader.upload(file.path, { folder: "hotels" })));
    return results.map((result) => result.secure_url);
};

const normaliseHotel = (payload = {}, uploadedImages = []) => {
    const name = String(payload.name || "").trim();
    const city = String(payload.city || "").trim();
    if (!name) throw new Error("Hotel name is required");
    if (!city) throw new Error("City is required");

    const pricePerNight = Number(payload.pricePerNight);
    const availableRooms = Number(payload.availableRooms);
    if (!Number.isFinite(pricePerNight) || pricePerNight < 0) {
        throw new Error("Price per night must be a valid non-negative number");
    }
    if (!Number.isFinite(availableRooms) || availableRooms < 0) {
        throw new Error("Available rooms must be a valid non-negative number");
    }

    const images = uploadedImages.length > 0
        ? [...new Set([...(Array.isArray(payload.images) ? payload.images : parseStringArray(payload.images ?? payload.imagesText)), ...uploadedImages])]
        : (Array.isArray(payload.images) ? payload.images : parseStringArray(payload.images ?? payload.imagesText));

    return {
        name,
        city,
        address: String(payload.address || "").trim(),
        description: String(payload.description || "").trim(),
        starRating: Math.min(5, Math.max(0, Number(payload.starRating) || 0)),
        pricePerNight,
        availableRooms,
        amenities: Array.isArray(payload.amenities)
            ? payload.amenities.map((item) => String(item).trim()).filter(Boolean)
            : parseStringArray(payload.amenities ?? payload.amenitiesText),
        images: images.map((item) => String(item).trim()).filter(Boolean),
        roomTypes: Array.isArray(payload.roomTypes)
            ? payload.roomTypes.map((room) => ({
                type: String(room.type || "").trim() || "Standard",
                pricePerNight: Number(room.pricePerNight) || 0,
                totalRooms: Number(room.totalRooms) || 0,
                availableRooms: Number(room.availableRooms) || Number(room.totalRooms) || 0,
                amenities: Array.isArray(room.amenities)
                    ? room.amenities.map((item) => String(item).trim()).filter(Boolean)
                    : parseStringArray(room.amenities),
            }))
            : [],
        isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
    };
};

exports.listHotels = async (req, res) => {
    try {
        const { page, limit } = pageOf(req.query);
        const filter = {};

        const search = String(req.query.search || "").trim();
        if (search) {
            const regex = new RegExp(escapeRegex(search), "i");
            filter.$or = [{ name: regex }, { city: regex }, { address: regex }];
        }

        if (req.query.status === "active") filter.isActive = true;
        if (req.query.status === "inactive") filter.isActive = false;

        const [items, total] = await Promise.all([
            HotelModel.find(filter)
                .sort({ createdAt: req.query.order === "asc" ? 1 : -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            HotelModel.countDocuments(filter),
        ]);

        return res.json({ data: { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
    } catch (error) {
        console.error("Admin listHotels error", error);
        return res.status(500).json({ message: "Unable to load hotels" });
    }
};

exports.createHotel = async (req, res) => {
    try {
        const uploadedImages = await uploadHotelImages(req.files);
        const hotel = await HotelModel.create(normaliseHotel(req.body, uploadedImages));
        return res.status(201).json({ data: hotel });
    } catch (error) {
        console.error("Admin createHotel error", error);
        if (error.code === 11000) return res.status(409).json({ message: "Hotel with this name already exists" });
        return res.status(400).json({ message: error.message || "Unable to create hotel" });
    }
};

exports.updateHotel = async (req, res) => {
    try {
        const hotel = await HotelModel.findById(req.params.id);
        if (!hotel) return res.status(404).json({ message: "Hotel not found" });

        const uploadedImages = await uploadHotelImages(req.files);
        const payload = { ...hotel.toObject(), ...req.body };
        if (uploadedImages.length > 0) {
            payload.images = [...new Set([...(Array.isArray(payload.images) ? payload.images : parseStringArray(payload.images ?? payload.imagesText)), ...uploadedImages])];
        } else if (req.body.images !== undefined || req.body.imagesText !== undefined) {
            payload.images = parseStringArray(req.body.images ?? req.body.imagesText);
        } else {
            payload.images = Array.isArray(hotel.images) ? hotel.images : [];
        }

        Object.assign(hotel, normaliseHotel(payload));
        await hotel.save();
        return res.json({ data: hotel });
    } catch (error) {
        console.error("Admin updateHotel error", error);
        if (error.code === 11000) return res.status(409).json({ message: "Hotel with this name already exists" });
        return res.status(400).json({ message: error.message || "Unable to update hotel" });
    }
};

exports.deleteHotel = async (req, res) => {
    try {
        const hotel = await HotelModel.findByIdAndDelete(req.params.id);
        if (!hotel) return res.status(404).json({ message: "Hotel not found" });
        return res.json({ data: { id: req.params.id } });
    } catch (error) {
        console.error("Admin deleteHotel error", error);
        return res.status(400).json({ message: "Invalid hotel id" });
    }
};
