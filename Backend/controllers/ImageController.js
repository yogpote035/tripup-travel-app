const cloudinary = require("../Middleware/cloudinary");

module.exports.optimizeImage = async (req, res) => {
    try {
        const { url, width } = req.body || {};
        if (!url) return res.status(400).json({ message: "Image url is required" });

        // upload/fetch remote image to Cloudinary and apply automatic optimizations
        const options = {
            folder: "tripup_opt",
            quality: "auto",
            fetch_format: "auto",
        };
        if (width) options.width = width;

        const result = await cloudinary.uploader.upload(url, options);
        return res.status(200).json({ url: result.secure_url, raw: result });
    } catch (error) {
        console.error("Image optimize error:", error.message);
        res.status(500).json({ message: "Failed to optimize image", error: error.message });
    }
};
