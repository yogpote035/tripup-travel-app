const LocationModel = require("../../models/LocationModel");
const PostModel = require("../../models/SocialFeed/PostModel");
const UserModel = require("../../models/UserModel");

// Get all locations with search & filter
module.exports.getLocations = async (req, res) => {
    try {
        const { search, category, sort = "-avgRating", page = 1, limit = 12 } = req.query;
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(50, Math.max(1, Number(limit)));

        const filter = {};
        if (search) {
            filter.$text = { $search: search };
        }
        if (category && category !== "All") {
            filter.category = category;
        }

        const [locations, total] = await Promise.all([
            LocationModel.find(filter)
                .sort(sort)
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum)
                .lean(),
            LocationModel.countDocuments(filter),
        ]);

        res.json({
            data: {
                items: locations,
                pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
            },
        });
    } catch (error) {
        console.error("Error fetching locations:", error);
        res.status(500).json({ message: "Error fetching locations" });
    }
};

// Get single location with posts and reviews
module.exports.getLocationDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const location = await LocationModel.findById(id)
            .populate("posts", "title images likes comments bookmarks")
            .populate("reviews.user.id", "name profileImage")
            .lean();

        if (!location) {
            return res.status(404).json({ message: "Location not found" });
        }

        res.json(location);
    } catch (error) {
        console.error("Error fetching location detail:", error);
        res.status(500).json({ message: "Error fetching location" });
    }
};

// Get posts for a location
module.exports.getLocationPosts = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 12 } = req.query;
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(30, Math.max(1, Number(limit)));

        const location = await LocationModel.findById(id).select("_id name").lean();
        if (!location) {
            return res.status(404).json({ message: "Location not found" });
        }

        const viewer = req.user?.userId;
        const followedAuthors = viewer
            ? (await UserModel.find({ followers: viewer }).select("_id").lean()).map((u) => u._id)
            : [];

        const visibility = viewer
            ? {
                $or: [
                    { visibility: "public" },
                    { "author.id": viewer },
                    { visibility: "followers", "author.id": { $in: followedAuthors } },
                ],
            }
            : { visibility: "public" };

        const [posts, total] = await Promise.all([
            PostModel.find({
                location: location.name,
                ...visibility,
            })
                .sort({ pinned: -1, createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum)
                .lean(),
            PostModel.countDocuments({
                location: location.name,
                ...visibility,
            }),
        ]);

        res.json({
            data: {
                items: posts,
                pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
            },
        });
    } catch (error) {
        console.error("Error fetching location posts:", error);
        res.status(500).json({ message: "Error fetching posts" });
    }
};

// Get location reviews
module.exports.getLocationReviews = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 12 } = req.query;
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(30, Math.max(1, Number(limit)));

        const location = await LocationModel.findById(id).select("reviews avgRating reviewCount").lean();

        if (!location) {
            return res.status(404).json({ message: "Location not found" });
        }

        const startIdx = (pageNum - 1) * limitNum;
        const paginatedReviews = location.reviews.slice(startIdx, startIdx + limitNum);

        res.json({
            avgRating: location.avgRating,
            reviewCount: location.reviewCount,
            reviews: paginatedReviews,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: location.reviewCount,
                pages: Math.ceil(location.reviewCount / limitNum),
            },
        });
    } catch (error) {
        console.error("Error fetching location reviews:", error);
        res.status(500).json({ message: "Error fetching reviews" });
    }
};

// Add location review
module.exports.addLocationReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, reviewText } = req.body;

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const location = await LocationModel.findById(id);
        if (!location) {
            return res.status(404).json({ message: "Location not found" });
        }

        const user = await UserModel.findById(req.user.userId).select("name profileImage").lean();

        // Remove existing review from same user if any
        location.reviews = location.reviews.filter(
            (r) => String(r.user.id) !== String(req.user.userId)
        );

        // Add new review
        location.reviews.push({
            user: {
                id: req.user.userId,
                name: user?.name || "Traveller",
                profileImage: user?.profileImage || "",
            },
            rating,
            reviewText: String(reviewText || "").slice(0, 1000),
        });

        // Recalculate average rating
        location.avgRating =
            location.reviews.reduce((sum, r) => sum + r.rating, 0) / location.reviews.length;
        location.reviewCount = location.reviews.length;

        await location.save();

        res.json({
            message: "Review added successfully",
            avgRating: location.avgRating,
            reviewCount: location.reviewCount,
        });
    } catch (error) {
        console.error("Error adding location review:", error);
        res.status(500).json({ message: "Error adding review" });
    }
};

const escapeForRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Search locations
module.exports.searchLocations = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length < 2) {
            return res.status(400).json({ message: "Search query must be at least 2 characters" });
        }

        const query = q.trim();
        const regex = new RegExp(escapeForRegex(query), "i");

        const locations = await LocationModel.find({
            $or: [
                { name: regex },
                { description: regex },
                { category: regex },
                { tags: regex },
            ],
        })
            .sort({ avgRating: -1, postCount: -1 })
            .limit(30)
            .lean();

        res.json(locations);
    } catch (error) {
        console.error("Error searching locations:", error);
        res.status(500).json({ message: "Error searching locations" });
    }
};

module.exports.createLocation = async (req, res) => {
    try {
        const { name, description = "", category = "Other" } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Location name is required" });
        }

        const normalizedName = String(name).trim();
        const existing = await LocationModel.findOne({
            name: new RegExp(`^${escapeForRegex(normalizedName)}$`, "i"),
        }).lean();

        if (existing) {
            return res.status(200).json(existing);
        }

        const location = await LocationModel.create({
            name: normalizedName,
            description: String(description || "").trim(),
            category: category || "Other",
        });

        res.status(201).json(location);
    } catch (error) {
        console.error("Error creating location:", error);
        res.status(500).json({ message: "Error creating location" });
    }
};

// Mark user as visitor (when they open location details)
module.exports.markVisitor = async (req, res) => {
    try {
        const { id } = req.params;
        const location = await LocationModel.findById(id);

        if (!location) {
            return res.status(404).json({ message: "Location not found" });
        }

        const userId = req.user.userId;
        if (!location.visitors.includes(userId)) {
            location.visitors.push(userId);
            location.visitorCount = location.visitors.length;
            await location.save();
        }

        res.json({ message: "Marked as visitor" });
    } catch (error) {
        console.error("Error marking visitor:", error);
        res.status(500).json({ message: "Error marking visitor" });
    }
};

// Get popular locations
module.exports.getPopularLocations = async (req, res) => {
    try {
        const locations = await LocationModel.find({ isPopular: true })
            .sort({ avgRating: -1, postCount: -1 })
            .limit(10)
            .lean();

        res.json(locations);
    } catch (error) {
        console.error("Error fetching popular locations:", error);
        res.status(500).json({ message: "Error fetching popular locations" });
    }
};
