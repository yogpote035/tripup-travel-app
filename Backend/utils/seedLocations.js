const connectToDatabase = require("../connectToDatabase");
const LocationModel = require("../models/LocationModel");

const popularLocations = [
    {
        name: "Mumbai, Maharashtra",
        description: "India's financial capital with vibrant street food, iconic beaches, and lively nightlife.",
        category: "City",
        avgRating: 4.8,
        reviewCount: 224,
        postCount: 162,
        tags: ["Mumbai", "Maharashtra", "beach", "food", "city", "Bollywood", "heritage"],
        isPopular: true,
    },
    {
        name: "Goa, India",
        description: "Sun-soaked beaches, beach parties, Portuguese heritage, and scenic coastal villages.",
        category: "Beach",
        avgRating: 4.9,
        reviewCount: 198,
        postCount: 134,
        tags: ["Goa", "beach", "party", "seafood", "sunset", "coast"],
        isPopular: true,
    },
    {
        name: "Jaipur, Rajasthan",
        description: "The Pink City is famous for its majestic forts, royal palaces, and cultural shopping bazaars.",
        category: "Heritage",
        avgRating: 4.7,
        reviewCount: 178,
        postCount: 121,
        tags: ["Jaipur", "Rajasthan", "fort", "palace", "shopping", "heritage"],
        isPopular: true,
    },
    {
        name: "Bengaluru, Karnataka",
        description: "A vibrant tech hub with craft breweries, lush parks, and a cosmopolitan food scene.",
        category: "City",
        avgRating: 4.6,
        reviewCount: 145,
        postCount: 98,
        tags: ["Bengaluru", "Karnataka", "city", "food", "tech", "culture"],
        isPopular: true,
    },
    {
        name: "Kerala Backwaters, Kerala",
        description: "Peaceful houseboats and emerald waterways set amid palm-lined villages and spice plantations.",
        category: "Nature",
        avgRating: 4.9,
        reviewCount: 190,
        postCount: 136,
        tags: ["Kerala", "backwaters", "houseboat", "nature", "relaxation", "spice"],
        isPopular: true,
    },
    {
        name: "Darjeeling, West Bengal",
        description: "Famous for scenic tea gardens, Himalayan views, and colonial reaches.",
        category: "Mountain",
        avgRating: 4.7,
        reviewCount: 132,
        postCount: 87,
        tags: ["Darjeeling", "West Bengal", "tea", "mountain", "himalayas", "scenic"],
        isPopular: true,
    },
    {
        name: "Shimla, Himachal Pradesh",
        description: "A charming hill station with pine forests, colonial architecture, and cool mountain air.",
        category: "Mountain",
        avgRating: 4.8,
        reviewCount: 148,
        postCount: 101,
        tags: ["Shimla", "Himachal Pradesh", "hill station", "mountain", "snow", "nature"],
        isPopular: true,
    },
    {
        name: "Rishikesh, Uttarakhand",
        description: "Spiritual yoga retreats, white-water rafting, and scenic riverside camping.",
        category: "Adventure",
        avgRating: 4.8,
        reviewCount: 153,
        postCount: 109,
        tags: ["Rishikesh", "Uttarakhand", "rafting", "yoga", "adventure", "spiritual"],
        isPopular: true,
    },
    {
        name: "New Delhi, Delhi",
        description: "India's capital with historic monuments, vibrant markets, and world-class cuisine.",
        category: "City",
        avgRating: 4.5,
        reviewCount: 190,
        postCount: 150,
        tags: ["New Delhi", "Delhi", "history", "food", "culture", "shopping"],
        isPopular: true,
    },
    {
        name: "Udaipur, Rajasthan",
        description: "The lake city of palaces, romantic boat rides, and classical Rajasthani charm.",
        category: "Heritage",
        avgRating: 4.8,
        reviewCount: 162,
        postCount: 115,
        tags: ["Udaipur", "Rajasthan", "lake", "palace", "romantic", "heritage"],
        isPopular: true,
    },
    {
        name: "Paris, France",
        description: "The city of lights with world-class museums, romance, and iconic architecture.",
        category: "City",
        avgRating: 4.9,
        reviewCount: 232,
        postCount: 184,
        tags: ["Paris", "France", "romance", "museum", "Eiffel", "cafe"],
        isPopular: true,
    },
    {
        name: "Tokyo, Japan",
        description: "A futuristic metropolis blending neon neighborhoods, sushi, temples, and pop culture.",
        category: "City",
        avgRating: 4.9,
        reviewCount: 215,
        postCount: 180,
        tags: ["Tokyo", "Japan", "city", "food", "technology", "culture"],
        isPopular: true,
    },
    {
        name: "New York, USA",
        description: "The city that never sleeps, full of iconic landmarks, dining, and arts.",
        category: "City",
        avgRating: 4.8,
        reviewCount: 260,
        postCount: 205,
        tags: ["New York", "USA", "city", "culture", "shopping", "entertainment"],
        isPopular: true,
    },
    {
        name: "Dubai, UAE",
        description: "Luxury shopping, desert adventures, and futuristic skyscrapers in a desert oasis.",
        category: "City",
        avgRating: 4.7,
        reviewCount: 180,
        postCount: 150,
        tags: ["Dubai", "UAE", "luxury", "desert", "shopping", "modern"],
        isPopular: true,
    },
    {
        name: "Bali, Indonesia",
        description: "Tropical beaches, rice terraces, spiritual retreats, and surf culture.",
        category: "Beach",
        avgRating: 4.9,
        reviewCount: 204,
        postCount: 170,
        tags: ["Bali", "Indonesia", "beach", "surf", "temple", "relaxation"],
        isPopular: true,
    },
    {
        name: "Rome, Italy",
        description: "Ancient monuments, piazzas, and world-famous cuisine in the heart of Italy.",
        category: "Heritage",
        avgRating: 4.9,
        reviewCount: 220,
        postCount: 190,
        tags: ["Rome", "Italy", "history", "food", "architecture", "culture"],
        isPopular: true,
    },
    {
        name: "Sydney, Australia",
        description: "A harborside metropolis known for surf beaches, opera house views, and outdoor living.",
        category: "City",
        avgRating: 4.8,
        reviewCount: 176,
        postCount: 148,
        tags: ["Sydney", "Australia", "beach", "harbor", "city", "outdoors"],
        isPopular: true,
    },
    {
        name: "Cape Town, South Africa",
        description: "Dramatic coastlines, vineyards, and Table Mountain scenery make it a global favorite.",
        category: "Nature",
        avgRating: 4.8,
        reviewCount: 168,
        postCount: 132,
        tags: ["Cape Town", "South Africa", "mountain", "coast", "wine", "nature"],
        isPopular: true,
    },
    {
        name: "Rio de Janeiro, Brazil",
        description: "Iconic Carnival parties, Copacabana beaches, and lush Tijuca forests.",
        category: "Beach",
        avgRating: 4.7,
        reviewCount: 155,
        postCount: 140,
        tags: ["Rio", "Brazil", "beach", "carnival", "city", "nature"],
        isPopular: true,
    },
];

async function seedLocations() {
    try {
        await connectToDatabase();
        console.log("Connected to database for location seeding.");

        for (const location of popularLocations) {
            await LocationModel.findOneAndUpdate(
                { name: location.name },
                { $set: location },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`Seeded location: ${location.name}`);
        }

        console.log(`Location seeding complete. ${popularLocations.length} locations seeded.`);
        process.exit(0);
    } catch (error) {
        console.error("Location seeding failed:", error);
        process.exit(1);
    }
}

seedLocations();
