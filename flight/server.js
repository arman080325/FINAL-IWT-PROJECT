// =======================================
// TripBoss — Amadeus API Backend (FINAL)
// =======================================

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(express.json());

// Enable backend → frontend communication
app.use(
  cors({
    origin: "*", // You can replace "*" with http://localhost:5501 if needed
  })
);

// Load environment variables
const AMADEUS_API_KEY = process.env.AMADEUS_API_KEY;
const AMADEUS_API_SECRET = process.env.AMADEUS_API_SECRET;

if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
  console.error("❌ Missing Amadeus API credentials in .env");
  process.exit(1);
}

// ---------------------------------------
// 1. Generate OAuth Token (secure)
// ---------------------------------------
async function getAccessToken() {
  try {
    const response = await axios.post(
      "https://test.api.amadeus.com/v1/security/oauth2/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: AMADEUS_API_KEY,
        client_secret: AMADEUS_API_SECRET,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 8000,
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("❌ Token Error:", error.response?.data || error);
    return null;
  }
}

// ---------------------------------------
// 2. Flight Offers Search Endpoint
// ---------------------------------------
app.post("/api/searchFlights", async (req, res) => {
  try {
    const { origin, destination, departureDate, returnDate, adults } = req.body;

    if (!origin || !destination || !departureDate || !adults) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const token = await getAccessToken();
    if (!token) {
      return res.status(500).json({ error: "Token generation failed" });
    }

    const url = "https://test.api.amadeus.com/v2/shopping/flight-offers";

    const params = {
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      adults,
      max: 20,
    };

    if (returnDate) params.returnDate = returnDate;

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      params,
      timeout: 12000,
    });

    res.json(response.data || { data: [] });
  } catch (error) {
    console.error("❌ Flight Search Error:", error.response?.data || error);
    res.status(500).json({ error: "Failed to fetch flight data" });
  }
});

// ---------------------------------------
// 3. Airport Autocomplete Endpoint
// ---------------------------------------
app.get("/api/autocomplete", async (req, res) => {
  try {
    const keyword = req.query.keyword;

    if (!keyword || keyword.length < 2) {
      return res.json({ data: [] });
    }

    const token = await getAccessToken();
    if (!token) {
      return res.status(500).json({ error: "Token generation failed" });
    }

    const response = await axios.get(
      "https://test.api.amadeus.com/v1/reference-data/locations",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          subType: "AIRPORT",
          keyword: keyword,
          "page[limit]": 7, // FIXED
        },
        timeout: 7000,
      }
    );

    res.json(response.data || { data: [] });
  } catch (error) {
    console.error("❌ Autocomplete Error:", error.response?.data || error);
    res.status(500).json({ error: "Autocomplete failed" });
  }
});

// ---------------------------------------
// 4. Health Check Route
// ---------------------------------------
app.get("/", (req, res) => {
  res.send("TripBoss Amadeus Backend is running ✔️");
});

// ---------------------------------------
// 5. Start Server
// ---------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 TripBoss Backend running at http://localhost:${PORT}`)
);
