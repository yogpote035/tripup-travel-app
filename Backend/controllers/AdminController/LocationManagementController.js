const LocationModel = require("../../models/LocationModel");
const cloudinary = require("../../Middleware/cloudinary");

const VALID_CATEGORIES = ["Beach", "Mountain", "City", "Heritage", "Adventure", "Cultural", "Nature", "Other"];

function parseLatitude(value) {
    if (value === undefined || value === null || value === "") return null;
    const numberValue = Number(String(value).trim());
    if (!Number.isFinite(numberValue)) throw new Error("Latitude must be a valid number");
    if (numberValue < -90 || numberValue > 90) throw new Error("Latitude must be between -90 and 90");
    return Number(numberValue.toFixed(8));
}

function parseLongitude(value) {
    if (value === undefined || value === null || value === "") return null;
    const numberValue = Number(String(value).trim());
    if (!Number.isFinite(numberValue)) throw new Error("Longitude must be a valid number");
    if (numberValue < -180 || numberValue > 180) throw new Error("Longitude must be between -180 and 180");
    return Number(numberValue.toFixed(8));
}

module.exports.listLocations = async (req, res) => {
    try {
        const { search, page = 1, limit = 50 } = req.query;
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(200, Math.max(1, Number(limit)));

        const filter = {};
        if (search) {
            filter.$text = { $search: search };
        }

        const [items, total] = await Promise.all([
            LocationModel.find(filter).sort({ name: 1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
            LocationModel.countDocuments(filter),
        ]);

        res.json({ data: { items, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } } });
    } catch (err) {
        console.error("Admin listLocations error", err);
        res.status(500).json({ message: "Error listing locations" });
    }
};

module.exports.createLocation = async (req, res) => {
    try {
        const { name, description = "", category = "Other", tags = [], latitude, longitude } = req.body;
        if (!name || !String(name).trim()) return res.status(400).json({ message: "Name is required" });
        if (category && !VALID_CATEGORIES.includes(category)) return res.status(400).json({ message: "Invalid category" });

        const normalized = String(name).trim();
        const exists = await LocationModel.findOne({ name: new RegExp(`^${normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }).lean();
        if (exists) return res.status(200).json(exists);

        const images = [];
        if (req.files && req.files.length > 0) {
            const results = await Promise.all(req.files.map((file) => cloudinary.uploader.upload(file.path, { folder: "locations" })));
            results.forEach((r) => images.push(r.secure_url));
        }

        const doc = {
            name: normalized,
            description: String(description || "").trim(),
            category: category || "Other",
            tags: Array.isArray(tags) ? tags : String(tags || "").split(",").map((t) => t.trim()).filter(Boolean),
            images,
        };
        try {
            const parsedLatitude = parseLatitude(latitude);
            const parsedLongitude = parseLongitude(longitude);
            if (parsedLatitude !== null) doc.latitude = parsedLatitude;
            if (parsedLongitude !== null) doc.longitude = parsedLongitude;
        } catch (validationError) {
            return res.status(400).json({ message: validationError.message });
        }

        const location = await LocationModel.create(doc);
        res.status(201).json(location);
    } catch (err) {
        console.error("Admin createLocation error", err);
        res.status(500).json({ message: "Error creating location" });
    }
};

module.exports.updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const payload = req.body || {};
        const location = await LocationModel.findById(id);
        if (!location) return res.status(404).json({ message: "Location not found" });

        // Remove images requested for deletion
        if (payload.imagesToRemove && Array.isArray(payload.imagesToRemove)) {
            for (const imageUrl of payload.imagesToRemove) {
                try {
                    const parts = imageUrl.split("/");
                    const publicIdWithExt = parts[parts.length - 1];
                    const publicId = `locations/${publicIdWithExt.split(".")[0]}`;
                    await cloudinary.uploader.destroy(publicId);
                } catch (err) {
                    console.error("Error deleting cloudinary image", err.message);
                }
            }
            location.images = (location.images || []).filter((i) => !payload.imagesToRemove.includes(i));
        }

        // Upload new images
        if (req.files && req.files.length > 0) {
            const results = await Promise.all(req.files.map((file) => cloudinary.uploader.upload(file.path, { folder: "locations" })));
            location.images = [...(location.images || []), ...results.map((r) => r.secure_url)];
        }

        const allowed = ["name", "description", "category", "tags", "latitude", "longitude", "isPopular"];
        allowed.forEach((field) => {
            if (payload[field] !== undefined) {
                if (field === "tags" && typeof payload[field] === "string") {
                    location[field] = payload[field].split(",").map((t) => t.trim()).filter(Boolean);
                } else if (field === "latitude" || field === "longitude") {
                    try {
                        location[field] = payload[field] === "" ? undefined : field === "latitude" ? parseLatitude(payload[field]) : parseLongitude(payload[field]);
                    } catch (validationError) {
                        throw validationError;
                    }
                } else {
                    location[field] = payload[field];
                }
            }
        });

        await location.save();
        res.json(location.toObject());
    } catch (err) {
        console.error("Admin updateLocation error", err);
        res.status(500).json({ message: "Error updating location" });
    }
};

module.exports.deleteLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await LocationModel.findByIdAndDelete(id).lean();
        if (!deleted) return res.status(404).json({ message: "Location not found" });
        res.json({ message: "Deleted" });
    } catch (err) {
        console.error("Admin deleteLocation error", err);
        res.status(500).json({ message: "Error deleting location" });
    }
};
