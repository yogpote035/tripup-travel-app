const axios = require("axios");

function buildTemplateItinerary({
  origin,
  destination,
  startDate,
  endDate,
  startTime,
  endTime,
  interests = [],
  tripType,
  transportMode,
  budget,
  dayNumber = null,
}) {
  const days = Math.max(
    1,
    Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1
  );
  const interestList = Array.isArray(interests) && interests.length ? interests : ["culture"];
  const baseActivities = [
    `Begin from ${origin || "your starting location"} and enjoy a relaxed breakfast before heading toward ${destination}`,
    `Spend the afternoon exploring the most popular highlights for ${interestList[0]} around ${destination}`,
    `Wrap up with dinner and a scenic stop before returning to ${origin || "your base"}`,
  ];

  if (dayNumber) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayNumber - 1);
    return {
      day: dayNumber,
      date: date.toISOString().split("T")[0],
      activities: [
        `${tripType ? `For this ${tripType} trip` : "For this trip"}, begin with a flexible morning plan around ${destination}`,
        `${interestList.join(", ")} themed stops and local favourites`,
        `${transportMode || "local"} travel keeps the day easy and on schedule`,
      ],
      note: `${startTime} to ${endTime} pacing with a ${budget} budget`,
    };
  }

  return Array.from({ length: days }, (_, index) => ({
    day: index + 1,
    date: new Date(new Date(startDate).getTime() + index * 86400000).toISOString().split("T")[0],
    activities: [
      `${baseActivities[0]} (${index + 1}/${days})`,
      `${baseActivities[1]} with a focus on ${interestList.slice(0, 2).join(" and ")}`,
      `${baseActivities[2]} for a balanced ${budget} plan`,
    ],
  }));
}

async function callGemini(prompt) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY2 || process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) throw new Error("Gemini API key is not configured");

  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  console.log("[Gemini] starting request to Google AI");
  const response = await axios.post(
    url,
    {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    },
    { timeout: 20000 }
  );
  console.log("[Gemini] response received from Google AI", {
    status: response?.status,
    hasCandidates: !!response?.data?.candidates,
  });

  const textResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) throw new Error("Empty response from Gemini");

  const jsonStart = textResponse.indexOf("[");
  const jsonEnd = textResponse.lastIndexOf("]") + 1;
  const jsonText = textResponse.slice(jsonStart, jsonEnd);
  return JSON.parse(jsonText);
}

async function generateAIItinerary(payload, options = {}) {
  const {
    origin,
    destination,
    startDate,
    endDate,
    startTime,
    endTime,
    interests,
    tripType,
    transportMode,
    budget,
  } = payload;

  if (
    !origin ||
    !destination ||
    !startDate ||
    !endDate ||
    !startTime ||
    !endTime ||
    !interests ||
    !tripType ||
    !transportMode ||
    !budget
  ) {
    throw new Error("Missing required itinerary parameters.");
  }

  const days = Math.max(
    1,
    Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1
  );

  const formattedStart = new Date(startDate).toDateString();
  const formattedEnd = new Date(endDate).toDateString();

  const prompt = `
You are a smart travel planner AI. Help me plan a detailed ${days}-day trip from ${origin} to ${destination}.

Details:
- Travel Dates: From ${formattedStart} to ${formattedEnd}
- Daily Time Range: ${startTime} to ${endTime}
- Starting Location: ${origin}
- Interests: ${Array.isArray(interests) ? interests.join(", ") : interests}
- Trip Type: ${tripType}
- Transport Mode: ${transportMode}
- Budget: ${budget}

Return a JSON array where each object has:
{
  "day": 1,
  "date": "YYYY-MM-DD",
  "activities": ["Activity 1", "Activity 2"]
}

Only return the JSON. No explanation, no intro text.
`;

  const retries = options.retryCount || 2;
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const data = await callGemini(prompt);
      if (Array.isArray(data) && data.length > 0) {
        return { plan: data, source: "gemini", attempts: attempt };
      }
      throw new Error("Gemini returned an invalid structure");
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
  }

  const plan = buildTemplateItinerary(payload);
  return {
    plan,
    source: "template",
    attempts: retries,
    fallbackReason: lastError?.message || "Gemini unavailable",
  };
}

async function generateSingleDayPlan(payload, options = {}) {
  const {
    origin,
    destination,
    startDate,
    endDate,
    startTime,
    endTime,
    interests,
    tripType,
    transportMode,
    budget,
    dayNumber,
    date,
  } = payload;

  const normalizedDayNumber = Number(dayNumber);
  const hasRequiredInputs = !!origin && !!destination && !!startDate && !!endDate && Number.isFinite(normalizedDayNumber) && normalizedDayNumber > 0;

  if (!hasRequiredInputs) {
    throw new Error("Missing required day regeneration inputs.");
  }

  const dayDate = date || new Date(new Date(startDate).getTime() + (normalizedDayNumber - 1) * 86400000).toISOString().split("T")[0];
  const prompt = `
You are a travel planner. Generate one JSON object for day ${normalizedDayNumber} of a trip from ${origin} to ${destination} on ${dayDate}.

Details:
- Travel dates: ${startDate} to ${endDate}
- Starting location: ${origin}
- Daily time range: ${startTime || "09:00"} to ${endTime || "20:00"}
- Interests: ${Array.isArray(interests) ? interests.join(", ") : interests}
- Trip Type: ${tripType || "travel"}
- Transport Mode: ${transportMode || "public"}
- Budget: ${budget || "medium"}

Return JSON in this shape:
{"day": ${dayNumber}, "date": "YYYY-MM-DD", "activities": ["Activity 1", "Activity 2", "Activity 3"], "note": "Short note"}
Only return the JSON.
`;

  const retries = options.retryCount || 2;
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const data = await callGemini(prompt);
      if (data && typeof data === "object") {
        return { plan: data, source: "gemini", attempts: attempt };
      }
      throw new Error("Gemini returned an invalid day plan");
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
  }

  return {
    plan: buildTemplateItinerary({ ...payload, dayNumber }),
    source: "template",
    attempts: retries,
    fallbackReason: lastError?.message || "Gemini unavailable",
  };
}

module.exports = generateAIItinerary;
module.exports.generateSingleDayPlan = generateSingleDayPlan;
