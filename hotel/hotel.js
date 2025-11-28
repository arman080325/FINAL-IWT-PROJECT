// ------- ROOM DATA (REAL LUXURY IMAGES + GALLERIES) -------
const roomsData = [
  {
    id: "standard",
    name: "Standard Room",
    pricePerNight: 150,
    badge: "Best for Solo & Couples",
    image:
      "https://images.pexels.com/photos/237371/pexels-photo-237371.jpeg?auto=compress&cs=tinysrgb&w=1600",
    gallery: [
      "https://images.pexels.com/photos/237371/pexels-photo-237371.jpeg?auto=compress&cs=tinysrgb&w=1600",
      "https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg?auto=compress&cs=tinysrgb&w=1600",
      "https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?auto=compress&cs=tinysrgb&w=1600"
    ],
    features: [
      "Queen size bed",
      "City view window",
      "Free high-speed Wi-Fi",
      "55\" Smart TV",
      "Complimentary coffee & tea"
    ],
    maxGuests: 2
  },
  {
    id: "deluxe",
    name: "Deluxe Room",
    pricePerNight: 250,
    badge: "Most Popular Choice",
    image:
      "https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg?auto=compress&cs=tinysrgb&w=1600",
    gallery: [
      "https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg?auto=compress&cs=tinysrgb&w=1600",
      "https://images.pexels.com/photos/26139/pexels-photo-26139.jpg?auto=compress&cs=tinysrgb&w=1600",
      "https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg?auto=compress&cs=tinysrgb&w=1600"
    ],
    features: [
      "King size bed",
      "Partial sea or skyline view",
      "Nespresso machine",
      "Rain shower bathroom",
      "Cozy seating area"
    ],
    maxGuests: 3
  },
  {
    id: "suite",
    name: "Executive Suite",
    pricePerNight: 400,
    badge: "Perfect for Family Stays",
    image:
      "https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=1600",
    gallery: [
      "https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=1600",
      "https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg?auto=compress&cs=tinysrgb&w=1600",
      "https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg?auto=compress&cs=tinysrgb&w=1600"
    ],
    features: [
      "Separate living area",
      "Dining corner",
      "Walk-in wardrobe",
      "Bathtub & rain shower",
      "Complimentary lounge access"
    ],
    maxGuests: 4
  },
  {
    id: "presidential",
    name: "Presidential Suite",
    pricePerNight: 800,
    badge: "Ultra-Luxury Experience",
    image:
      "https://images.pexels.com/photos/2838783/pexels-photo-2838783.jpeg?auto=compress&cs=tinysrgb&w=1600",
    gallery: [
      "https://images.pexels.com/photos/2838783/pexels-photo-2838783.jpeg?auto=compress&cs=tinysrgb&w=1600",
      "https://images.pexels.com/photos/96444/pexels-photo-96444.jpeg?auto=compress&cs=tinysrgb&w=1600",
      "https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg?auto=compress&cs=tinysrgb&w=1600"
    ],
    features: [
      "Two king bedrooms",
      "Private plunge pool",
      "Panoramic skyline or ocean view",
      "Butler on call 24/7",
      "In-suite bar & workspace"
    ],
    maxGuests: 6
  }
];

let selectedRoomId = "standard";

// ------- AMADEUS API CONFIG -------
const AMADEUS_API_KEY = "5pFgcNy5GPFi3BkvKTAI2cQvTs5tyeGi";
const AMADEUS_API_SECRET = "aZ1IcLAkKPjWMpdH";
let AMADEUS_TOKEN = null;

// Fetch token
async function getAmadeusToken() {
  const response = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `grant_type=client_credentials&client_id=${AMADEUS_API_KEY}&client_secret=${AMADEUS_API_SECRET}`
  });

  const data = await response.json();
  AMADEUS_TOKEN = data.access_token;
  console.log("Amadeus Token:", AMADEUS_TOKEN);
}

// ------- UTILITIES -------
function formatCurrency(amount) {
  return "AED" + amount.toLocaleString("en-IN");
}

function diffInNights(checkin, checkout) {
  const inDate = new Date(checkin);
  const outDate = new Date(checkout);
  const diff = outDate - inDate;
  return diff > 0 ? Math.round(diff / (1000 * 60 * 60 * 24)) : 0;
}

// ------- RENDER ROOMS -------
function renderRooms() {
  const container = document.getElementById("rooms-container");
  container.innerHTML = "";

  roomsData.forEach(room => {
    const featuresLi = room.features.map(f => `<li>${f}</li>`).join("");

    const card = document.createElement("div");
    card.classList.add("room-card");

    card.innerHTML = `
      <div class="room-image-wrapper">
        <img src="${room.image}" class="room-image" alt="${room.name}">
        <span class="room-badge">${room.badge}</span>
      </div>

      <div class="room-body">
        <div class="room-header-line">
          <h3>${room.name}</h3>
          <p class="room-price">AED${room.pricePerNight}/night</p>
        </div>

        <div class="room-meta">
          Max ${room.maxGuests} guests
        </div>

        <ul class="room-features">${featuresLi}</ul>

        <button class="btn-outline" data-gallery="${room.id}">View Photos</button>
        <button class="btn-solid" data-select-room="${room.id}">Select Room</button>
        <button class="book-btn" data-roombook="${room.id}">Book Now</button>
      </div>
    `;

    container.appendChild(card);
  });
}

// ------- BOOKING SUMMARY -------
function updateBookingSummary() {
  const city = document.getElementById("city").value;
  const checkin = document.getElementById("checkin").value;
  const checkout = document.getElementById("checkout").value;
  const guests = Number(document.getElementById("guests").value);

  const summaryEl = document.getElementById("booking-summary");

  const room = roomsData.find(r => r.id === selectedRoomId);
  if (!room) return;

  const nights = diffInNights(checkin, checkout);

  if (!city || !checkin || !checkout || nights <= 0) {
    summaryEl.innerHTML = "Please select valid city and dates to see the cost.";
    return;
  }

  const base = nights * room.pricePerNight;
  const tax = base * 0.12;
  const total = base + tax;

  summaryEl.innerHTML = `
    <strong>${room.name}</strong> in <strong>${city}</strong><br>
    ${nights} nights • ${guests} guests<br>
    <strong>Total: ${formatCurrency(total)}</strong>
  `;
}

// ------- GALLERY MODAL -------
function openGallery(roomId) {
  const room = roomsData.find(r => r.id === roomId);

  document.getElementById("galleryTitle").textContent = room.name;
  document.getElementById("galleryImages").innerHTML = room.gallery
    .map(img => `<img src="${img}" alt="${room.name}">`)
    .join("");

  document.getElementById("galleryModal").classList.add("show");
}

function closeGallery() {
  document.getElementById("galleryModal").classList.remove("show");
}

// ------- MAIN EVENT HANDLER -------
document.addEventListener("DOMContentLoaded", () => {

  // Render rooms initially
  renderRooms();

  // Default check-in/out dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  document.getElementById("checkin").value = today.toISOString().split("T")[0];
  document.getElementById("checkout").value =
    tomorrow.toISOString().split("T")[0];

  document.getElementById("year").textContent = new Date().getFullYear();

  // Form submit → scroll
  document
    .getElementById("bookingForm")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      updateBookingSummary();
      window.scrollTo({
        top:
          document.querySelector(".rooms-section").offsetTop - 50,
        behavior: "smooth",
      });
    });

  // Dropdown change
  document
    .getElementById("roomType")
    .addEventListener("change", (e) => {
      selectedRoomId = e.target.value;
      renderRooms();
      updateBookingSummary();
    });

  // Room action buttons
  document
    .getElementById("rooms-container")
    .addEventListener("click", (e) => {
      const galleryId = e.target.dataset.gallery;
      const selectId = e.target.dataset.selectRoom;
      const bookId = e.target.dataset.roombook;

      if (galleryId) openGallery(galleryId);

      if (selectId) {
        selectedRoomId = selectId;
        document.getElementById("roomType").value = selectId;
        renderRooms();
        updateBookingSummary();
      }

      if (bookId) {
        const city = document.getElementById("city").value.trim();
        const checkin = document.getElementById("checkin").value;
        const checkout = document.getElementById("checkout").value;
        const guests = document.getElementById("guests").value;

        if (!city || !checkin || !checkout) {
          alert("Please fill city and dates before booking.");
          return;
        }

        window.location.href = 
          `booking_form.html?room=${bookId}&city=${city}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`;
      }
    });

  // Close Modal
  document
    .querySelector(".close-modal")
    .addEventListener("click", closeGallery);

  document
    .getElementById("galleryModal")
    .addEventListener("click", (e) => {
      if (e.target.id === "galleryModal") closeGallery();
    });
});

// ------- FETCH REAL PRICES -------
async function fetchRealHotelPrices(city, checkin, checkout, guests = 2) {
  if (!AMADEUS_TOKEN) await getAmadeusToken();

  const url = `https://test.api.amadeus.com/v3/shopping/hotel-offers?cityCode=${city}&adults=${guests}&checkInDate=${checkin}&checkOutDate=${checkout}&roomQuantity=1`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${AMADEUS_TOKEN}` },
  });

  const data = await response.json();

  if (!data.data || data.data.length === 0) {
    console.warn(
      "No results from Amadeus → using default prices"
    );
    return null;
  }

  const sorted = data.data.sort(
    (a, b) => a.offers[0].price.total - b.offers[0].price.total
  );

  return sorted.slice(0, 4).map((h) => ({
    name: h.hotel.name,
    price: Number(h.offers[0].price.total),
    address: h.hotel.address.lines?.join(", ") || "",
    rating:
      h.hotel.rating || "N/A",
    raw: h,
  }));
}
