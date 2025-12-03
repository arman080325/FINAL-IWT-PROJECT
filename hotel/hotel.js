// ====== CITY → IATA CODE MAPPING (most popular) ======
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
  "san francisco": "SFO",
};

let roomsData = [
  {
    id: "standard",
    name: "Standard Room",
    pricePerNight: 150,
    maxGuests: 2,
    badge: "Best for Solo & Couples",
    image:
      "https://images.pexels.com/photos/237371/pexels-photo-237371.jpeg?auto=compress&cs=tinysrgb&w=1600",
    gallery: [
      "https://images.pexels.com/photos/237371/pexels-photo-237371.jpeg",
      "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg",
      "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg",
      "https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg",
      "https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg",
      "https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg",
      "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg",
      "https://images.pexels.com/photos/1743227/pexels-photo-1743227.jpeg",
      "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg",
      "https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg"
    ],
    features: [
      "Queen-size bed",
      "Air conditioning",
      "Free Wi-Fi",
      "LED Smart TV",
      "Private bathroom",
      "Complimentary toiletries",
      "Daily housekeeping"
    ],
  },

  {
    id: "deluxe",
    name: "Deluxe Room",
    pricePerNight: 250,
    maxGuests: 3,
    badge: "Most Popular",
    image:
      "https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg?auto=compress&cs=tinysrgb&w=1600",
    gallery: [
      "https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg",
      "https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg",
      "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg",
      "https://images.pexels.com/photos/210604/pexels-photo-210604.jpeg",
      "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg",
      "https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg",
      "https://images.pexels.com/photos/271651/pexels-photo-271651.jpeg",
      "https://images.pexels.com/photos/1571459/pexels-photo-1571459.jpeg"
    ],
    features: [
      "King-size bed",
      "City view",
      "Air conditioning",
      "Free high-speed Wi-Fi",
      "55-inch Smart TV",
      "Spacious bathroom",
      "Tea & coffee maker",
      "Mini-fridge",
      "Work desk"
    ],
  },

  {
    id: "suite",
    name: "Executive Suite",
    pricePerNight: 400,
    maxGuests: 4,
    badge: "Family Friendly",
    image:
      "https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=1600",
    gallery: [
      "https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg",
      "https://images.pexels.com/photos/2835547/pexels-photo-2835547.jpeg",
      "https://images.pexels.com/photos/2838783/pexels-photo-2838783.jpeg",
      "https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg",
      "https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg",
      "https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg",
      "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg",
      "https://images.pexels.com/photos/1743231/pexels-photo-1743231.jpeg",
      "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg",
      "https://images.pexels.com/photos/3155726/pexels-photo-3155726.jpeg"
    ],
    features: [
      "Separate living area",
      "King-size bed",
      "Panoramic city view",
      "Premium bathroom amenities",
      "High-speed Wi-Fi",
      "Large Smart TV",
      "Dining table",
      "Mini-bar",
      "Complimentary breakfast"
    ],
  },

  {
    id: "presidential",
    name: "Presidential Suite",
    pricePerNight: 800,
    maxGuests: 6,
    badge: "Ultra Luxury",
    image:
      "https://images.pexels.com/photos/2838783/pexels-photo-2838783.jpeg?auto=compress&cs=tinysrgb&w=1600",
    gallery: [
      "https://images.pexels.com/photos/2838783/pexels-photo-2838783.jpeg",
      "https://images.pexels.com/photos/189333/pexels-photo-189333.jpeg",
      "https://images.pexels.com/photos/1743231/pexels-photo-1743231.jpeg",
      "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg",
      "https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg",
      "https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg",
      "https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg",
      "https://images.pexels.com/photos/3155726/pexels-photo-3155726.jpeg",
      "https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg",
      "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg"
    ],
    features: [
      "2-bedroom suite",
      "Private lounge area",
      "Premium king-size beds",
      "Private jacuzzi",
      "Luxury marble bathroom",
      "Dedicated workspace",
      "24/7 butler service",
      "In-room dining service",
      "High-speed Wi-Fi",
      "VIP airport pickup (available on request)"
    ],
  },
];


// Fill galleries quickly (you already had them – just shortened here for space)
// roomsData.forEach((room, i) => {
//   room.gallery = [
//     room.image,
//     `https://images.pexels.com/photos/27${i}639/pexels-photo-27${i}639.jpeg?auto=compress&cs=tinysrgb&w=1600`,
//     `https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg?auto=compress&cs=tinysrgb&w=1600`,
//   ];
//   room.features = room.features || [
//     "King bed",
//     "City view",
//     "Free Wi-Fi",
//     "Minibar",
//     "24h Room Service",
//   ];
// });

let selectedRoomId = "standard";
let currentIATACode = null;

// ====== AMADEUS TOKEN ======
let AMADEUS_TOKEN = null;
async function getToken() {
  try {
    const resp = await fetch(
      "https://test.api.amadeus.com/v1/security/oauth2/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body:
          "grant_type=client_credentials" +
          "&client_id=7iyRdTgn8bDVKRkYaQYkTLdt0aAQz9mr" +
          "&client_secret=lBtktFCiuaGve0OD"
      }
    );

    const data = await resp.json();
    console.log("TOKEN:", data);

    if (!data.access_token) {
      alert("Token error: " + JSON.stringify(data));
      return null;
    }

    AMADEUS_TOKEN = data.access_token;
    return data.access_token;
  } catch (err) {
    console.error("TOKEN FETCH FAILED", err);
    return null;
  }
}

// ====== FETCH REAL PRICES FROM AMADEUS ======
async function searchHotels() {
  const cityInput = document
    .getElementById("cityInput")
    .value.trim()
    .toLowerCase();
  const checkin = document.getElementById("checkin").value;
  const checkout = document.getElementById("checkout").value;
  const guests = document.getElementById("guests").value;

  if (!cityInput || !checkin || !checkout) return;

  // Find IATA
  const found = Object.keys(cityToIATA).find(
    (c) => c.includes(cityInput) || cityInput.includes(c)
  );
  if (!found) {
    alert("City not supported yet. Try Dubai, Paris, London, etc.");
    return;
  }
  currentIATACode = cityToIATA[found];

if (!AMADEUS_TOKEN) AMADEUS_TOKEN = await getToken();
if (!AMADEUS_TOKEN) {
   console.error("Token missing, cannot fetch hotels.");
   return;
}

  // Add these parameters for better results
const url =
  "https://test.api.amadeus.com/v3/shopping/hotel-offers?" +
  `cityCode=${currentIATACode}` +
  `&checkInDate=${checkin}` +
  `&checkOutDate=${checkout}` +
  `&adults=${guests}` +
  `&roomQuantity=1` +
  `&currency=AED`;


  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${AMADEUS_TOKEN}` },
    });
    const json = await res.json();

    if (!json.data || json.data.length === 0) {
      document.getElementById("booking-summary").innerHTML =
        "Live prices temporarily unavailable – showing beautiful sample rates";
      return;
    }

    // Get average price per night for each category
    const offers = json.data.map((h) => ({
      price: Math.round(
        parseFloat(h.offers[0].price.total) / diffInNights(checkin, checkout)
      ),
    }));

    // Update room prices (simple mapping: cheapest → standard, then deluxe, suite, presidential)
    const prices = offers.sort((a, b) => a.price - b.price).map((o) => o.price);
    roomsData[0].pricePerNight = prices[0] || 150;
    roomsData[1].pricePerNight = prices[1] || 250;
    roomsData[2].pricePerNight = prices[2] || 400;
    roomsData[3].pricePerNight = prices[3] || 800;

    renderRooms();
    updateBookingSummary();
  } catch (err) {
    console.error(err);
    alert(
      "Live pricing temporarily unavailable – using beautiful sample rates."
    );
  }
}

// ====== UTILITIES ======
function diffInNights(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}
function formatCurrency(n) {
  return "AED" + Math.round(n).toLocaleString();
}

// ====== RENDER ROOMS ======
function renderRooms() {
  const container = document.getElementById("rooms-container");
  container.innerHTML = "";

  roomsData.forEach((room) => {
    const card = document.createElement("div");
    card.className =
      "room-card" + (selectedRoomId === room.id ? " selected" : "");
    card.innerHTML = `
      <div class="room-image-wrapper">
        <img src="${room.image}" class="room-image" alt="${room.name}">
        <span class="room-badge">${room.badge}</span>
      </div>
      <div class="room-body">
        <div class="room-header-line">
          <h3>${room.name}</h3>
          <p class="room-price">${formatCurrency(
            room.pricePerNight
          )}<small>/night</small></p>
        </div>
        <div class="room-meta">Up to ${room.maxGuests} guests</div>
        <ul class="room-features">${room.features
          .map((f) => `<li>${f}</li>`)
          .join("")}</ul>
        <button class="btn-outline" data-gallery="${
          room.id
        }">View Gallery</button>
        <button class="btn-solid ${
          selectedRoomId === room.id ? "active" : ""
        }" data-select="${room.id}">Select Room</button>
        <button class="book-btn" data-book="${room.id}">Book Now →</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// ====== UPDATE SUMMARY ======
function updateBookingSummary() {
  const city = document.getElementById("cityInput").value || "your destination";
  const checkin = document.getElementById("checkin").value;
  const checkout = document.getElementById("checkout").value;
  const guests = document.getElementById("guests").value;

  const nights = diffInNights(checkin, checkout);
  if (nights <= 0 || !checkin || !checkout) {
    document.getElementById("booking-summary").textContent =
      "Please select valid dates.";
    return;
  }

  const room = roomsData.find((r) => r.id === selectedRoomId);
  const base = nights * room.pricePerNight;
  const tax = Math.round(base * 0.12);
  const total = base + tax;

  document.getElementById("booking-summary").innerHTML = `
    <strong>${room.name}</strong> in <strong>${city}</strong><br>
    ${nights} night${nights > 1 ? "s" : ""} • ${guests} guest${
    guests > 1 ? "s" : ""
  }<br><br>
    <strong style="font-size:1.3em;color:var(--accent)">Total: ${formatCurrency(
      total
    )}</strong> (incl. taxes)
  `;
}

// ====== CITY SUGGESTIONS ======
document.getElementById("cityInput").addEventListener("input", function () {
  const val = this.value.toLowerCase().trim();
  const suggestions = document.getElementById("citySuggestions");
  if (!val) {
    suggestions.innerHTML = "";
    return;
  }

  const matches = Object.keys(cityToIATA)
    .filter((city) => city.includes(val) || val.includes(city))
    .slice(0, 5);

  suggestions.innerHTML = matches
    .map(
      (c) =>
        `<div class="suggestion-item">${
          c.charAt(0).toUpperCase() + c.slice(1)
        } (${cityToIATA[c]})</div>`
    )
    .join("");
  suggestions.style.display = matches.length ? "block" : "none";
});
document.getElementById("citySuggestions").addEventListener("click", (e) => {
  if (e.target.classList.contains("suggestion-item")) {
    document.getElementById("cityInput").value =
      e.target.textContent.split(" (")[0];
    document.getElementById("citySuggestions").style.display = "none";
  }
});

// ====== MAIN EVENTS ======
document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  document.getElementById("checkin").value = today;
  document.getElementById("checkout").value = tomorrow;
  document.getElementById("year").textContent = new Date().getFullYear();

  renderRooms();
  updateBookingSummary();

  // Search button
  document.getElementById("bookingForm").addEventListener("submit", (e) => {
    e.preventDefault();
    searchHotels();
    window.scrollTo({
      top: document.querySelector(".rooms-section").offsetTop - 80,
      behavior: "smooth",
    });
  });

  // Room selection / gallery / booking
  document.getElementById("rooms-container").addEventListener("click", (e) => {
    const gallery = e.target.dataset.gallery;
    const select = e.target.dataset.select;
    const book = e.target.dataset.book;

    if (gallery) {
      const room = roomsData.find((r) => r.id === gallery);
      document.getElementById("galleryTitle").textContent =
        room.name + " Gallery";
      document.getElementById("galleryImages").innerHTML = room.gallery
        .map((src) => `<img src="${src}" alt="gallery">`)
        .join("");
      document.getElementById("galleryModal").classList.add("show");
    }

    if (select) {
      selectedRoomId = select;
      document.getElementById("roomType").value = select;
      renderRooms();
      updateBookingSummary();
    }

    if (book) {
      const url = `booking_form.html?room=${book}&city=${encodeURIComponent(
        document.getElementById("cityInput").value
      )}&checkin=${document.getElementById("checkin").value}&checkout=${
        document.getElementById("checkout").value
      }&guests=${document.getElementById("guests").value}&price=${
        roomsData.find((r) => r.id === book).pricePerNight
      }`;
      window.location.href = url;
    }
  });

  // Sync dropdown
  document.getElementById("roomType").addEventListener("change", (e) => {
    selectedRoomId = e.target.value;
    renderRooms();
    updateBookingSummary();
  });

  // Close modal
  document.querySelector(".close-modal").onclick = () =>
    document.getElementById("galleryModal").classList.remove("show");
  window.onclick = (e) => {
    if (e.target === document.getElementById("galleryModal"))
      document.getElementById("galleryModal").classList.remove("show");
  };
});
