require("dotenv").config();
const axios = require("axios");

async function generateAIItinerary(
  destination,
  startDate,
  endDate,
  startTime,
  endTime,
  interests,
  tripType,
  transportMode,
  budget
) {
  if (
    !destination || !startDate || !endDate || !startTime || !endTime ||
    !interests || !tripType || !transportMode || !budget
  ) {
    throw new Error("Missing required itinerary parameters.");
  }

  const days =
    Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    ) + 1;

  const formattedStart = new Date(startDate).toDateString();
  const formattedEnd = new Date(endDate).toDateString();

  const prompt = `
You're a smart travel planner AI. Help me plan a detailed ${days}-day trip to ${destination}.

Details:
- Travel Dates: From ${formattedStart} to ${formattedEnd}
- Daily Time Range: ${startTime} to ${endTime}
- Interests: ${interests.join(", ")}
- Trip Type: ${tripType}
- Transport Mode: ${transportMode}
- Budget: ${budget}

Return a JSON array where each object has:
{
  "day": 1,
  "date": "YYYY-MM-DD",
  "activities": [
    "Activity 1",
    "Activity 2"
  ]
}

Only return the JSON. No explanation, no intro text.
`;

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await axios.post(url, {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    });

    const textResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) throw new Error("Empty response from Gemini");

    const jsonStart = textResponse.indexOf("[");
    const jsonEnd = textResponse.lastIndexOf("]") + 1;
    const jsonText = textResponse.slice(jsonStart, jsonEnd);

    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    throw new Error("Failed to generate itinerary");
  }
}

module.exports = generateAIItinerary;
