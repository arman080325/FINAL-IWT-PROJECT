/* ============================================================
   TripBoss Flights – FINAL WORKING VERSION (Fixed Logos + Price)
   ============================================================ */

const classButtons = document.querySelectorAll(".booking__nav span");
let selectedClass = "Economy";

classButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    classButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedClass = btn.textContent.trim();
  });
});
classButtons[0]?.classList.add("active");

// Floating Labels
document.querySelectorAll(".input__group input").forEach((input) => {
  const group = input.parentElement;
  if (input.value.trim()) group.classList.add("active");

  input.addEventListener("focus", () => group.classList.add("active"));
  input.addEventListener("blur", () => {
    if (!input.value.trim()) group.classList.remove("active");
  });
});

// DOM Elements
const originInput = document.getElementById("originInput");
const destinationInput = document.getElementById("destinationInput");
const travellersInput = document.getElementById("travellersInput");
const departInput = document.getElementById("departInput");
const returnInput = document.getElementById("returnInput");
const resultsContainer = document.getElementById("flightResults");
const searchForm = document.querySelector("form");
const API_BASE = "http://localhost:5000";

// Reliable airline logos (200x200 PNGs)
function getAirlineLogo(code) {
  return `https://pics.avs.io/200/200/${code}.png`;
}

// Realistic INR conversion (1 USD ≈ 84 INR, 1 EUR ≈ 90 INR)
function convertToINR(amount, currency) {
  const rates = { USD: 84.5, EUR: 90, GBP: 105, AED: 23, SAR: 22.5, QAR: 23.2 };
  const rate = rates[currency] || 84.5;
  return Math.round(parseFloat(amount) * rate);
}

// Autocomplete
function setupAutocomplete(input, box) {
  let timeout;
  input.addEventListener("input", () => {
    clearTimeout(timeout);
    const keyword = input.value.trim();
    if (keyword.length < 2) {
      box.style.display = "none";
      return;
    }
    timeout = setTimeout(() => {
      fetch(`${API_BASE}/api/autocomplete?keyword=${keyword}`)
        .then(r => r.json())
        .then(data => {
          box.innerHTML = "";
          (data.data || []).slice(0, 8).forEach(airport => {
            const item = document.createElement("div");
            item.className = "autocomplete-item";
            item.innerHTML = `
              <div class="autocomplete-code">${airport.iataCode}</div>
              <div class="autocomplete-city">${airport.address.cityName}, ${airport.address.countryName}</div>
            `;
            item.onclick = () => {
              input.value = airport.iataCode;
              input.parentElement.classList.add("active");
              box.style.display = "none";
            };
            box.appendChild(item);
          });
          box.style.display = data.data?.length ? "block" : "none";
        });
    }, 300);
  });
}
setupAutocomplete(originInput, document.getElementById("autocomplete-origin"));
setupAutocomplete(destinationInput, document.getElementById("autocomplete-destination"));

// Close autocomplete on outside click
document.addEventListener("click", e => {
  if (!e.target.closest(".input__content")) {
    document.querySelectorAll(".autocomplete-box").forEach(b => b.style.display = "none");
  }
});

// Form Submit
searchForm.addEventListener("submit", async e => {
  e.preventDefault();

  const origin = originInput.value.trim().toUpperCase();
  const destination = destinationInput.value.trim().toUpperCase();
  const adults = travellersInput.value || "1";
  const departDate = departInput.value;
  const returnDate = returnInput.value || undefined;

  if (!origin || !destination || !departDate) {
    alert("Please fill Origin, Destination & Departure Date");
    return;
  }
  if (origin === destination) {
    alert("Origin and destination cannot be the same");
    return;
  }

  showLoading();

  try {
    const res = await fetch(`${API_BASE}/api/searchFlights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin, destination, departureDate: departDate, returnDate, adults })
    });

    const data = await res.json();
    renderFlightResults(data);
  } catch (err) {
    resultsContainer.innerHTML = `<p style="color:#ff6b6b;text-align:center;padding:3rem;">
      Server not running. Start: <strong>node server.js</strong>
    </p>`;
  }
});

function showLoading() {
  resultsContainer.innerHTML = `
    <div class="loading-box">
      <div class="spinner"></div>
      <p>Searching best flights across 900+ airlines...</p>
    </div>`;
}

function renderFlightResults(response) {
  const offers = response?.data;
  resultsContainer.innerHTML = "";

  if (!offers || offers.length === 0) {
    resultsContainer.innerHTML = `<p style="text-align:center;padding:4rem;color:#ccc;">No flights found for this route.</p>`;
    return;
  }

  offers.forEach(offer => {
    const it = offer.itineraries[0];
    const first = it.segments[0];
    const last = it.segments[it.segments.length - 1];
    const stops = it.segments.length - 1;
    const price = offer.price.grandTotal || offer.price.total;
    const currency = offer.price.currency || "USD";

    const inrPrice = convertToINR(price, currency);
    const airlineCode = first.carrierCode;

    const card = document.createElement("div");
    card.className = "flight-result-card";

    card.innerHTML = `
      <div class="airline-row">
        <img src="${getAirlineLogo(airlineCode)}" 
             class="airline-logo" 
             onerror="this.src='https://via.placeholder.com/60?text=${airlineCode}'"
             alt="${airlineCode}">
        <div>
          <h3>${airlineCode} • ${stops === 0 ? "Non-stop" : stops + " stop" + (stops > 1 ? "s" : "")}</h3>
        </div>
      </div>

      <div class="detail-row">
        <div>
          <strong>${first.departure.iataCode}</strong><br>
          ${new Date(first.departure.at).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
        </div>
        <div style="text-align:center;color:#06e6b0;font-weight:600;">
          ✈ ${it.duration.replace("PT", "").replace("H", "h ").replace("M", "m")}
        </div>
        <div style="text-align:right;">
          <strong>${last.arrival.iataCode}</strong><br>
          ${new Date(last.arrival.at).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
        </div>
      </div>

      <div class="detail-row" style="margin-top:20px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.2);justify-content:space-between;align-items:center;">
        <div>
          <strong style="font-size:1.8rem;color:#00e6a8;">₹ ${inrPrice.toLocaleString("en-IN")}</strong>
          <div style="font-size:0.9rem;opacity:0.8;">${selectedClass} • Total</div>
        </div>
        <button class="btn book-btn">Book Now</button>
      </div>
    `;

    card.querySelector(".book-btn").onclick = () => {
      alert("Real flight data loaded successfully!\nBooking system coming soon.");
    };

    resultsContainer.appendChild(card);
  });

  resultsContainer.scrollIntoView({ behavior: "smooth" });
}

// -------------------------
// HELPERS
// -------------------------
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(d) {
  const m = d.match(/PT(\d+H)?(\d+M)?/);
  const h = m[1] ? m[1].replace("H", "h") : "";
  const min = m[2] ? m[2].replace("M", "m") : "";
  return h + " " + min;
}
