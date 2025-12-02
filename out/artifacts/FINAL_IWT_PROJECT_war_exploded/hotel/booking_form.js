/* -----------------------------------------
   1. Extract booking data from URL
------------------------------------------ */

const urlParams = new URLSearchParams(window.location.search);
const roomType = urlParams.get("room");
const checkin = urlParams.get("checkin");
const checkout = urlParams.get("checkout");
const guests = urlParams.get("guests");
const city = urlParams.get("city"); // NEW: dynamic city

const summaryCard = document.getElementById("summaryCard");

/* -----------------------------------------
   2. Amadeus API Credentials
------------------------------------------ */

const CLIENT_ID = "5pFgcNy5GPFi3BkvKTAI2cQvTs5tyeGi";
const CLIENT_SECRET = "aZ1IcLAkKPjWMpdH";

let AMADEUS_TOKEN = null;

/* -----------------------------------------
   3. Get Amadeus Access Token
------------------------------------------ */

async function getToken() {
  const res = await fetch(
    "https://test.api.amadeus.com/v1/security/oauth2/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`
    }
  );

  const data = await res.json();
  AMADEUS_TOKEN = data.access_token;
  return data.access_token;
}

/* -----------------------------------------
   4. Fetch Real-Time Hotel Prices (dynamic city)
------------------------------------------ */

async function getRealPrice(token) {
  const url = `https://test.api.amadeus.com/v3/shopping/hotel-offers?cityCode=${city}&checkInDate=${checkin}&checkOutDate=${checkout}&adults=${guests}&roomQuantity=1`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();

  try {
    const offer = data.data[0].offers[0].price;
    return Number(offer.total); // AED
  } catch (e) {
    console.warn("Amadeus returned no valid prices. Using fallback ₹500.");
    return 500;
  }
}

/* -----------------------------------------
   5. Calculate Number of Nights
------------------------------------------ */

function calcNights() {
  const inDate = new Date(checkin);
  const outDate = new Date(checkout);
  return Math.round((outDate - inDate) / (1000 * 60 * 60 * 24));
}

/* -----------------------------------------
   6. Load Summary with Real Pricing
------------------------------------------ */

async function loadSummary() {
  const nights = calcNights();

  if (nights <= 0) {
    summaryCard.innerHTML = "<p>Invalid check-in/check-out dates.</p>";
    return;
  }

  const token = await getToken();
  const realPrice = await getRealPrice(token);

  const nightly = realPrice / nights;
  const tax = realPrice * 0.12;
  const total = realPrice + tax;

  summaryCard.innerHTML = `
    <h3>Booking Summary</h3>
    <p><strong>Room Type:</strong> ${roomType.toUpperCase()}</p>
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
   7. Capture Form & Produce DB-Ready Object
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

  // Later: send to DB, Firebase, MongoDB, etc.
});
