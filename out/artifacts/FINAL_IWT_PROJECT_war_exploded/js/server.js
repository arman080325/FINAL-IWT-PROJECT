// ===== server.js (Unified Backend for Amadeus + Gemini) =====
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve all static frontend files from project root
app.use(express.static(path.join(__dirname, "..")));

// Default route → open index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "HTML", "index.html"));
});

// ========================== ✈️ AMADEUS API SETUP ==========================

const AMADEUS_BASE =
  process.env.AMADEUS_ENV === "PROD"
    ? "https://api.amadeus.com"
    : "https://test.api.amadeus.com";

const CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
const CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;

// ---- Token cache ----
let tokenCache = { token: null, exp: 0 };

async function getAccessToken() {
  const now = Date.now();
  if (tokenCache.token && now < tokenCache.exp - 10_000) return tokenCache.token;

  const r = await fetch(`${AMADEUS_BASE}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    })
  });

  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Amadeus auth failed: ${t}`);
  }

  const j = await r.json();
  tokenCache = { token: j.access_token, exp: now + j.expires_in * 1000 };
  return tokenCache.token;
}

// ---- Airport autocomplete ----
app.get("/api/amadeus/airports", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json({ items: [] });

    const token = await getAccessToken();
    const url =
      `${AMADEUS_BASE}/v1/reference-data/locations?` +
      new URLSearchParams({
        keyword: q,
        subType: "AIRPORT,CITY",
        page: "1",
        "page[limit]": "8"
      });

    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const j = await r.json();

    const items =
      (j.data || []).map((x) => ({
        code: x.iataCode,
        city: x.address?.cityName || x.name || x.detailedName || x.iataCode,
        name: x.name || x.detailedName || "",
        country: x.address?.countryName || "",
        type: x.subType
      })) || [];

    res.json({ items });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "airport_lookup_failed" });
  }
});

// ---- Flight offers ----
app.get("/api/amadeus/flights", async (req, res) => {
  try {
    const token = await getAccessToken();
    const url = `${AMADEUS_BASE}/v2/shopping/flight-offers?` + new URLSearchParams(req.query);

    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    });

    const j = await r.json();
    res.json(j);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "flight_search_failed" });
  }
});

// ========================== 🤖 GEMINI API SETUP ==========================

app.post("/api/gemini", async (req, res) => {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const { query } = req.body;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY in .env" });
    }

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: query }]
            }
          ]
        })
      }
    );

    const j = await r.json();
    res.json(j);
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({ error: "gemini_request_failed" });
  }
});

// ========================== SERVER START ==========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT} (Amadeus + Gemini active)`)
);
