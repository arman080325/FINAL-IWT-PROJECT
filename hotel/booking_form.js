/* -----------------------------------------
   1. Extract booking data from URL
------------------------------------------ */

const urlParams = new URLSearchParams(window.location.search);
const roomType = urlParams.get("room") || "standard"; // standard / deluxe / suite...
const checkin = urlParams.get("checkin");
const checkout = urlParams.get("checkout");
const guests = urlParams.get("guests") || "1";
const city = urlParams.get("city") || "Your destination";
const priceFromSearch = Number(urlParams.get("price") || "0"); // sent from hotel.js

const summaryCard = document.getElementById("summaryCard");

/* -----------------------------------------
   2. City → IATA mapping (same as hotel.js)
------------------------------------------ */

const cityToIATA = {
  dubai: "DXB",
  paris: "PAR",
  london: "LON",
  newyork: "NYC",
  tokyo: "TYO",
  mumbai: "BOM",
  bangkok: "BKK",
  singapore: "SIN",
  istanbul: "IST",
  barcelona: "BCN",
  amsterdam: "AMS",
  rome: "ROM",
  berlin: "BER",
  sydney: "SYD",
  toronto: "YTO",
  losangeles: "LAX",
  chicago: "CHI",
  "new york": "NYC",
  "los angeles": "LAX",
  "san francisco": "SFO"
};

/* -----------------------------------------
   3. Amadeus API Credentials (same as hotel.js)
------------------------------------------ */

const CLIENT_ID = "7iyRdTgn8bDVKRkYaQYkTLdt0aAQz9mr";
const CLIENT_SECRET = "lBtktFCiuaGve0OD";

let AMADEUS_TOKEN = null;

/* -----------------------------------------
   4. Get Amadeus Access Token
------------------------------------------ */

async function getToken() {
  if (AMADEUS_TOKEN) return AMADEUS_TOKEN; // reuse if already fetched

  try {
    const res = await fetch(
      "https://test.api.amadeus.com/v1/security/oauth2/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body:
          "grant_type=client_credentials" +
          `&client_id=${CLIENT_ID}` +
          `&client_secret=${CLIENT_SECRET}`
      }
    );

    const data = await res.json();
    console.log("TOKEN RESPONSE (booking):", data);

    if (!data.access_token) {
      console.error("Amadeus token error:", data);
      return null;
    }

    AMADEUS_TOKEN = data.access_token;
    return AMADEUS_TOKEN;
  } catch (err) {
    console.error("TOKEN FETCH FAILED (booking):", err);
    return null;
  }
}

/* -----------------------------------------
   5. Resolve IATA from city (sync with hotel.js)
------------------------------------------ */

function getIataFromCity(cityName) {
  if (!cityName) return null;
  const val = cityName.toLowerCase().trim();

  const foundKey = Object.keys(cityToIATA).find(
    (c) => c.includes(val) || val.includes(c)
  );
  return foundKey ? cityToIATA[foundKey] : null;
}

/* -----------------------------------------
   6. Fetch Real-Time Hotel Prices (dynamic city)
------------------------------------------ */

async function getRealPrice() {
  const token = await getToken();
  if (!token) {
    console.warn("No token – using price from search or fallback 500.");
    return priceFromSearch || 500;
  }

  const iataCode = getIataFromCity(city);
  if (!iataCode) {
    console.warn("City not mapped to IATA – using price from search or fallback 500.");
    return priceFromSearch || 500;
  }

  const url =
    "https://test.api.amadeus.com/v3/shopping/hotel-offers?" +
    `cityCode=${iataCode}` +
    `&checkInDate=${checkin}` +
    `&checkOutDate=${checkout}` +
    `&adults=${guests}` +
    `&roomQuantity=1` +
    `&currency=AED`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    console.log("Hotel API (booking):", data);

    const offer = data?.data?.[0]?.offers?.[0]?.price?.total;
    if (!offer) {
      console.warn("No valid offer in response – using price from search or fallback 500.");
      return priceFromSearch || 500;
    }

    return Number(offer); // AED total for stay
  } catch (e) {
    console.warn("Amadeus request failed – using price from search or fallback 500.", e);
    return priceFromSearch || 500;
  }
}

/* -----------------------------------------
   7. Calculate Number of Nights
------------------------------------------ */

function calcNights() {
  if (!checkin || !checkout) return 0;
  const inDate = new Date(checkin);
  const outDate = new Date(checkout);
  return Math.round((outDate - inDate) / (1000 * 60 * 60 * 24));
}

/* -----------------------------------------
   8. Load Summary with Real Pricing
------------------------------------------ */

async function loadSummary() {
  const nights = calcNights();

  if (nights <= 0) {
    summaryCard.innerHTML = "<p>Invalid check-in/check-out dates.</p>";
    return;
  }

  const realPrice = await getRealPrice(); // total for stay
  const nightly = realPrice / nights;
  const tax = realPrice * 0.12;
  const total = realPrice + tax;

  const niceRoomLabel =
    roomType.charAt(0).toUpperCase() + roomType.slice(1).replace("-", " ");

  summaryCard.innerHTML = `
    <h3>Booking Summary</h3>
    <p><strong>Room Type:</strong> ${niceRoomLabel}</p>
    <p><strong>Location:</strong> ${city}</p>
    <p><strong>Check-in:</strong> ${checkin}</p>
    <p><strong>Check-out:</strong> ${checkout}</p>
    <p><strong>Nights:</strong> ${nights}</p>
    <p><strong>Guests:</strong> ${guests}</p>
    <hr>
    <p><strong>Nightly Price:</strong> AED ${nightly.toFixed(2)}</p>
    <p><strong>Base Price:</strong> AED ${realPrice.toFixed(2)}</p>
    <p><strong>Taxes (12%):</strong> AED ${tax.toFixed(2)}</p>
    <h3>Total Payable: AED ${total.toFixed(2)}</h3>
  `;
}

loadSummary();

/* -----------------------------------------
   9. Capture Form & Produce DB-Ready Object
------------------------------------------ */

document.getElementById("bookingForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // Extract final amount properly (number only)
  const finalAmountText = document
    .querySelector("#summaryCard h3:last-of-type")
    .innerText.replace(/[^\d.]/g, "");

  const finalAmount = Number(finalAmountText);

  const bookingData = {
    customer: {
      name: fullname.value,
      email: email.value,
      phone: phone.value,
      country: country.value,
      address: address.value,
      idType: idType.value,
      idNumber: idNumber.value,
      specialRequest: special.value
    },
    bookingDetails: {
      roomType,
      city,
      checkin,
      checkout,
      guests,
      nights: calcNights()
    },
    payment: {
      currency: "AED",
      totalPayable: finalAmount
    }
  };

  console.log("BOOKING SAVED DATA:", bookingData);
  alert("Booking confirmed! Check console for stored booking data.");
  // later: send to DB / backend etc.
});
