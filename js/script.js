const API_BASE = "http://localhost:3000";

/* ======================= Navbar Scroll Change ======================= */
const navbarDiv = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) navbarDiv.classList.add('navbar-cng');
  else navbarDiv.classList.remove('navbar-cng');
});

/* ======================= Navbar Show/Hide =========================== */
const navbarCollapseDiv = document.getElementById('navbar-collapse');
const navbarShowBtn = document.getElementById('navbar-show-btn');
const navbarCloseBtn = document.getElementById('navbar-close-btn');

if (navbarShowBtn) navbarShowBtn.addEventListener('click', () => navbarCollapseDiv.classList.add('navbar-collapse-rmw'));
if (navbarCloseBtn) navbarCloseBtn.addEventListener('click', () => navbarCollapseDiv.classList.remove('navbar-collapse-rmw'));

// Close navbar when clicking outside (safe checks)
document.addEventListener('click', (e) => {
  if (!navbarCollapseDiv) return;
  if (
    !navbarCollapseDiv.contains(e.target) &&
    e.target !== navbarShowBtn &&
    e.target?.parentElement !== navbarShowBtn
  ) {
    navbarCollapseDiv.classList.remove('navbar-collapse-rmw');
  }
});

/* =================== Stop Animation on Resize ======================= */
let resizeTimer;
window.addEventListener('resize', () => {
  document.body.classList.add("resize-animation-stopper");
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    document.body.classList.remove("resize-animation-stopper");
  }, 400);
});

/* ===== Prevent header form submit (Enter should not reload page) ==== */
document.querySelector('.header-form form')
  ?.addEventListener('submit', (e) => e.preventDefault());

/* =================== Wikipedia + Unsplash Search (Horizontal Popup) =================== */
const searchInput = document.getElementById("searchbar");

// Create popup + overlay
const wikiOverlay = document.createElement("div");
wikiOverlay.className = "results-overlay";
const wikiPopup = document.createElement("div");
wikiPopup.className = "results-popup";

wikiPopup.innerHTML = `
  <span class="results-popup-close">&times;</span>
  <div class="results-popup-text"></div>
  <div class="images"></div>
`;

document.body.appendChild(wikiOverlay);
document.body.appendChild(wikiPopup);

let timeout = null;

function fetchWikipedia(query) {
  return fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`)
    .then(res => res.json())
    .then(searchData => {
      if (searchData.query?.search?.length > 0) {
        const pageTitle = searchData.query.search[0].title;
        return fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`)
          .then(res => res.json());
      } else {
        return { title: query, extract: "No description found." };
      }
    });
}

if (searchInput) {
  searchInput.addEventListener("input", function () {
    const query = this.value.trim();
    if (!query) {
      wikiPopup.classList.remove("active");
      wikiOverlay.classList.remove("active");
      return;
    }

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const popupText = wikiPopup.querySelector(".results-popup-text");
      const popupImages = wikiPopup.querySelector(".images");
      const closeBtn = wikiPopup.querySelector(".results-popup-close");

      popupText.innerHTML = `<p style='color:white;'>Loading...</p>`;
      popupImages.innerHTML = "";

      wikiPopup.classList.add("active");
      wikiOverlay.classList.add("active");

      fetchWikipedia(query)
        .then(data => {
          const title = data.title || query;
          const description = data.extract || "No description found.";

          popupText.innerHTML = `
            <h2>${title}</h2>
            <p>${description}</p>
            <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(title)}" target="_blank" style="display:inline-block;margin-top:15px;padding:10px 20px;background:#12ef67;color:#fff;border-radius:20px;text-decoration:none;">View on Wikipedia</a>
          `;

          // return fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=xMZbOZYSSMeWCQBH-ovaqN7ZbgaM1ygDW5Ytjg0fwSk`);
          return fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=xMZbOZYSSMeWCQBH-ovaqN7ZbgaM1ygDW5Ytjg0fwSk&per_page=12`);

        })
        .then(res => res.json())
        .then(imgData => {
          if (imgData.results?.length > 0) {
            const imageHTML = imgData.results.map(img =>
              `<img src="${img.urls.small}" alt="${(searchInput.value || '')}" />`
            ).join('');
            popupImages.innerHTML = imageHTML;
          } else {
            popupImages.innerHTML = "<p>No images found.</p>";
          }
        })
        .catch(() => { popupText.innerHTML = "<p>No information found.</p>"; });

      // Close popup on X or overlay click
      closeBtn.onclick = () => {
        wikiPopup.classList.remove("active");
        wikiOverlay.classList.remove("active");
      };
      wikiOverlay.onclick = () => {
        wikiPopup.classList.remove("active");
        wikiOverlay.classList.remove("active");
      };
    }, 500);
  });
}
/* ======================= Load More Blogs =========================== */
const loadMoreBtn = document.getElementById("loadMore");
if (loadMoreBtn) {
  loadMoreBtn.addEventListener("click", () => {
    const hiddenBlogs = document.querySelectorAll(".blog-item.hidden");
    for (let i = 0; i < 3 && i < hiddenBlogs.length; i++) {
      hiddenBlogs[i].classList.remove("hidden");
      hiddenBlogs[i].classList.add("show");
    }
    if (document.querySelectorAll(".blog-item.hidden").length === 0) {
      loadMoreBtn.style.display = "none";
    }
  });
}

/* ======================= Map Section (Fast Locate) ======================= */
document.addEventListener("DOMContentLoaded", function () {
  const mapDiv = document.getElementById('map');
  if (!mapDiv || typeof mapboxgl === 'undefined') return;

  mapboxgl.accessToken = "pk.eyJ1IjoiMjNiY3NhNjAiLCJhIjoiY21mdGJkMGpvMHcwMjJsc2V2MGZxejhvYiJ9.Nfi4Y2aa0WqcFDz5Wl5FgQ";
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/satellite-streets-v12",
    center: [0, 20],
    zoom: 1.5,
    projection: "globe"
  });

  map.addControl(new mapboxgl.NavigationControl(), 'top-left');
  map.addControl(new mapboxgl.FullscreenControl(), 'top-left');

  // Keep Mapbox geolocate control for blue dot, but ask for fast/coarse first
  const geolocate = new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 },
    trackUserLocation: false, showUserHeading: false, showAccuracyCircle: false
  });
  map.addControl(geolocate, 'top-left');

  // Geocoder (if plugin loaded)
  if (typeof MapboxGeocoder !== 'undefined') {
    const geocoder = new MapboxGeocoder({ accessToken: mapboxgl.accessToken, mapboxgl, placeholder: 'Search places...', marker: false });
    const geoDiv = document.getElementById('map-geocoder');
    if (geoDiv) geoDiv.appendChild(geocoder.onAdd(map));
  }

  map.on("style.load", () => {
    map.setFog({});
    if (!map.getSource('mapbox-dem')) {
      map.addSource('mapbox-dem', { type: "raster-dem", url: "mapbox://mapbox.terrain-rgb", tileSize: 512, maxzoom: 14 });
      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.2 });
    }
    if (!map.getLayer('sky')) {
      map.addLayer({
        id: "sky", type: "sky",
        paint: { "sky-type": "atmosphere", "sky-atmosphere-sun": [0.0, 0.0], "sky-atmosphere-sun-intensity": 15 }
      });
    }
  });

  // Landmarks with categories
  const landmarks = [
    { name: "Eiffel Tower, Paris", coords: [2.2945, 48.8584], category: "landmark" },
    { name: "Great Pyramid of Giza, Egypt", coords: [31.1342, 29.9792], category: "history" },
    { name: "Rio de Janeiro, Brazil", coords: [-43.1729, -22.9068], category: "city" },
    { name: "Bondi Beach, Australia", coords: [151.2743, -33.8908], category: "beach" },
    { name: "Berlin, Germany", coords: [13.4050, 52.5200], category: "city" },
    { name: "Wat Arun, Thailand", coords: [100.4889, 13.7437], category: "temple" },
    { name: "Rome, Italy", coords: [12.4964, 41.9028], category: "city" },
    { name: "Maldives", coords: [73.2207, 3.2028], category: "beach" },
    { name: "Statue of Liberty, New York", coords: [-74.0445, 40.6892], category: "landmark" },
    { name: "Times Square, New York", coords: [-73.9855, 40.7580], category: "city" },
    { name: "London Eye, UK", coords: [-0.1195, 51.5033], category: "landmark" },
    { name: "Big Ben, London", coords: [-0.1246, 51.5007], category: "landmark" },
    { name: "Taj Mahal, India", coords: [78.0421, 27.1751], category: "history" },
    { name: "Machu Picchu, Peru", coords: [-72.5450, -13.1631], category: "history" },
    { name: "Christ the Redeemer, Brazil", coords: [-43.2105, -22.9519], category: "landmark" },
    { name: "Colosseum, Rome", coords: [12.4922, 41.8902], category: "history" },
    { name: "Santorini, Greece", coords: [25.4283, 36.3932], category: "island" },
    { name: "Dubai Burj Khalifa, UAE", coords: [55.2744, 25.1972], category: "landmark" },
    { name: "Great Wall of China, Beijing", coords: [116.5704, 40.4319], category: "history" },
    { name: "Niagara Falls, Canada/USA", coords: [-79.0742, 43.0828], category: "nature" },
    { name: "Sydney Opera House, Australia", coords: [151.2153, -33.8572], category: "landmark" },
    { name: "Petra, Jordan", coords: [35.4444, 30.3285], category: "history" },
    { name: "Angkor Wat, Cambodia", coords: [103.8669, 13.4125], category: "temple" },
    { name: "Chichen Itza, Mexico", coords: [-88.5678, 20.6843], category: "history" }
  ];

  // Build GeoJSON
  const geojson = {
    type: "FeatureCollection",
    features: landmarks.map(l => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: l.coords },
      properties: { name: l.name, category: l.category }
    }))
  };

  let userMarker = null;

  // Helpers
  function flyToUser(lng, lat, zoom = 12, duration = 800) {
    map.easeTo({ center: [lng, lat], zoom, duration });
    if (!userMarker) {
      userMarker = new mapboxgl.Marker({ color: '#10b981' }).setLngLat([lng, lat]).addTo(map);
    } else {
      userMarker.setLngLat([lng, lat]);
    }
  }
  function cacheLoc(lng, lat) {
    localStorage.setItem('lastLoc', JSON.stringify({ lng, lat, ts: Date.now() }));
  }
  function readCache() {
    try {
      const c = JSON.parse(localStorage.getItem('lastLoc') || 'null');
      if (c && Date.now() - c.ts < 5 * 60 * 1000) return c; // 5 minutes
    } catch {}
    return null;
  }

  // Add clustered source & layers
  map.on('load', () => {
    if (!map.getSource('landmarks')) {
      map.addSource('landmarks', {
        type: 'geojson',
        data: geojson,
        cluster: true,
        clusterMaxZoom: 9,
        clusterRadius: 50
      });
    }

    if (!map.getLayer('clusters')) {
      map.addLayer({
        id: 'clusters', type: 'circle', source: 'landmarks', filter: ['has', 'point_count'],
        paint: {
          'circle-color': ['step', ['get', 'point_count'], '#8dd3c7', 10, '#80b1d3', 25, '#b3de69'],
          'circle-radius': ['step', ['get', 'point_count'], 15, 10, 20, 25, 28],
          'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1
        }
      });
    }

    if (!map.getLayer('cluster-count')) {
      map.addLayer({
        id: 'cluster-count', type: 'symbol', source: 'landmarks', filter: ['has', 'point_count'],
        layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-size': 12 },
        paint: { 'text-color': '#002b36' }
      });
    }

    if (!map.getLayer('unclustered-point')) {
      map.addLayer({
        id: 'unclustered-point', type: 'circle', source: 'landmarks', filter: ['!', ['has', 'point_count']],
        paint: { 'circle-color': '#a1c6e8', 'circle-radius': 6, 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1.5 }
      });
    }

    if (!map.getLayer('landmarks-heat')) {
      map.addLayer({
        id: 'landmarks-heat', type: 'heatmap', source: 'landmarks', maxzoom: 9,
        paint: { 'heatmap-weight': 1, 'heatmap-intensity': 1, 'heatmap-radius': 30, 'heatmap-opacity': 0.0 }
      }, 'unclustered-point');
    }

    // Cluster click zoom
    map.on('click', 'clusters', (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      const clusterId = features[0].properties.cluster_id;
      map.getSource('landmarks').getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        map.easeTo({ center: features[0].geometry.coordinates, zoom });
      });
    });

    // Popup for unclustered points
    map.on('click', 'unclustered-point', (e) => {
      const f = e.features[0];
      const { name, category } = f.properties;
      const coord = f.geometry.coordinates.slice();

      const html = `
        <div style="min-width:200px">
          <strong>${name}</strong><br>
          <small>Category: ${category}</small><br><br>
          <button id="save-to-trip" class="btn btn-save" style="padding:6px 10px;border-radius:8px;cursor:pointer;">
            Save to Trip
          </button>
        </div>
      `;
      new mapboxgl.Popup({ offset: 12 }).setLngLat(coord).setHTML(html).addTo(map);

      setTimeout(() => {
        const btn = document.getElementById('save-to-trip');
        if (btn) {
          btn.onclick = () => {
            const saved = JSON.parse(localStorage.getItem('tripSaved') || '[]');
            if (!saved.includes(name)) {
              saved.push(name);
              localStorage.setItem('tripSaved', JSON.stringify(saved));
              showToast(`Saved: ${name}`);
              btn.textContent = 'Saved ✔';
            } else {
              showToast(`Already in your Trip list`);
            }
          };
        }
      }, 0);
    });

    map.on('mouseenter', 'unclustered-point', () => map.getCanvas().style.cursor = 'pointer');
    map.on('mouseleave', 'unclustered-point', () => map.getCanvas().style.cursor = '');

    // Filters (checkboxes)
    const filterBoxes = document.querySelectorAll('.map-filter');
    const applyFilters = () => {
      const active = Array.from(filterBoxes).filter(cb => cb.checked).map(cb => cb.value);
      if (active.length === 0) {
        map.setFilter('unclustered-point', ['all', ['!', ['has', 'point_count']], ['in', 'category', '___none___']]);
      } else {
        map.setFilter('unclustered-point', ['all', ['!', ['has', 'point_count']], ['in', ['get', 'category'], ['literal', active]]]);
      }
    };
    filterBoxes.forEach(cb => cb.addEventListener('change', applyFilters));
    applyFilters();

    // Heatmap toggle
    const heatToggle = document.getElementById('toggle-heatmap');
    if (heatToggle) {
      heatToggle.addEventListener('change', () => {
        const opacity = heatToggle.checked ? 0.75 : 0.0;
        map.setPaintProperty('landmarks-heat', 'heatmap-opacity', opacity);
        map.setLayoutProperty('unclustered-point', 'visibility', heatToggle.checked ? 'none' : 'visible');
        map.setLayoutProperty('clusters', 'visibility', heatToggle.checked ? 'none' : 'visible');
        map.setLayoutProperty('cluster-count', 'visibility', heatToggle.checked ? 'none' : 'visible');
      });
    }

    // ===== FAST LOCATE: cache -> coarse locate -> (fallback) high-accuracy =====
    const locateBtn = document.getElementById('btn-locate');
    if (locateBtn) locateBtn.onclick = fastLocate;

    function fastLocate() {
      locateBtn.classList.add('loading'); // purely visual if you style it

      const cached = readCache();
      if (cached) flyToUser(cached.lng, cached.lat, 12, 400);

      if (!navigator.geolocation) {
        showToast('Geolocation not supported');
        locateBtn.classList.remove('loading');
        return;
      }

      // 1) Quick coarse locate
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { longitude: lng, latitude: lat } = pos.coords;
          flyToUser(lng, lat, 12, cached ? 400 : 800);
          cacheLoc(lng, lat);
          locateBtn.classList.remove('loading');
        },
        // 2) Fallback: high accuracy (GPS)
        () => {
          navigator.geolocation.getCurrentPosition(
            pos2 => {
              const { longitude: lng, latitude: lat } = pos2.coords;
              flyToUser(lng, lat, 13, 800);
              cacheLoc(lng, lat);
              locateBtn.classList.remove('loading');
            },
            () => {
              showToast('Could not get your location.');
              locateBtn.classList.remove('loading');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        },
        { enableHighAccuracy: false, timeout: 3000, maximumAge: 600000 }
      );

      // Trigger Mapbox control for the blue dot (best effort)
      try { geolocate.trigger(); } catch {}
    }
  });

  // Tie main search bar to map flyTo (forward geocoding). Prevent form submit.
  if (typeof searchInput !== 'undefined' && searchInput) {
    searchInput.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const q = searchInput.value.trim();
        if (!q) return;
        try {
          const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${mapboxgl.accessToken}&limit=1`);
          const data = await res.json();
          if (data.features?.length) {
            const [lng, lat] = data.features[0].center;
            // We’re still inside the same DOMContentLoaded closure -> "map" is in scope
            const mapCanvas = document.getElementById('map');
            // just ease the same map
            map.easeTo({ center: [lng, lat], zoom: 10 });
          }
        } catch (err) {
          console.error('Geocoding error', err);
        }
      }
    });
  }

  // Simple toast
  function showToast(msg) {
    let t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      Object.assign(t.style, {
        position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '10px 16px',
        borderRadius: '12px', zIndex: '9999', fontSize: '14px',
        boxShadow: '0 8px 24px rgba(0,0,0,.25)', transition: 'opacity .25s ease'
      });
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    setTimeout(() => { t.style.opacity = '0'; }, 1800);
  }
});



/* ======================= Dynamic Gallery with Unsplash ======================= */
document.addEventListener("DOMContentLoaded", () => {
  const galleryRow = document.getElementById("gallery-row");
  if (!galleryRow) return;

  const accessKey = "xMZbOZYSSMeWCQBH-ovaqN7ZbgaM1ygDW5Ytjg0fwSk";
  const places = [
    "Eiffel Tower, Paris","Taj Mahal, India","Great Wall of China","Santorini, Greece",
    "Grand Canyon, USA","Machu Picchu, Peru","Sydney Opera House, Australia","Burj Khalifa, Dubai",
    "Statue of Liberty, New York","Mount Fuji, Japan","Christ the Redeemer, Brazil",
    "Colosseum, Rome","Niagara Falls, Canada","Petra, Jordan","Chichen Itza, Mexico","Angkor Wat, Cambodia"
  ];

  async function loadGallery() {
    galleryRow.innerHTML = `<p style="color:white;">Loading gallery...</p>`;
    let html = "";

    for (let place of places) {
      try {
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(place)}&client_id=${accessKey}&per_page=1`
        );
        const data = await res.json();
        const imgUrl = data.results?.length > 0
          ? data.results[0].urls.small
          : "https://via.placeholder.com/400";

        html += `
          <div class="gallery-item shadow">
            <img src="${imgUrl}" loading="lazy" alt="${place}">
            <span class="gallery-title"><i class="fas fa-map-marker-alt"></i> ${place}</span>
          </div>
        `;
      } catch (err) { console.error("Error fetching Unsplash image:", err); }
    }

    galleryRow.innerHTML = html;
  }

  loadGallery();
});

/* ======================= Map Section (Fast Locate) ======================= */
document.addEventListener("DOMContentLoaded", function () {
  const mapDiv = document.getElementById('map');
  if (!mapDiv || typeof mapboxgl === 'undefined') return;

  mapboxgl.accessToken = "pk.eyJ1IjoiMjNiY3NhNjAiLCJhIjoiY21mdGJkMGpvMHcwMjJsc2V2MGZxejhvYiJ9.Nfi4Y2aa0WqcFDz5Wl5FgQ";
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/satellite-streets-v12",
    center: [0, 20],
    zoom: 1.5,
    projection: "globe"
  });

  map.addControl(new mapboxgl.NavigationControl(), 'top-left');
  map.addControl(new mapboxgl.FullscreenControl(), 'top-left');

  // Keep Mapbox geolocate control for blue dot, but ask for fast/coarse first
  const geolocate = new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 },
    trackUserLocation: false, showUserHeading: false, showAccuracyCircle: false
  });
  map.addControl(geolocate, 'top-left');

  // Geocoder (if plugin loaded)
  if (typeof MapboxGeocoder !== 'undefined') {
    const geocoder = new MapboxGeocoder({ accessToken: mapboxgl.accessToken, mapboxgl, placeholder: 'Search places...', marker: false });
    const geoDiv = document.getElementById('map-geocoder');
    if (geoDiv) geoDiv.appendChild(geocoder.onAdd(map));
  }

  map.on("style.load", () => {
    map.setFog({});
    if (!map.getSource('mapbox-dem')) {
      map.addSource('mapbox-dem', { type: "raster-dem", url: "mapbox://mapbox.terrain-rgb", tileSize: 512, maxzoom: 14 });
      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.2 });
    }
    if (!map.getLayer('sky')) {
      map.addLayer({
        id: "sky", type: "sky",
        paint: { "sky-type": "atmosphere", "sky-atmosphere-sun": [0.0, 0.0], "sky-atmosphere-sun-intensity": 15 }
      });
    }
  });

  // Landmarks with categories
  const landmarks = [
    { name: "Eiffel Tower, Paris", coords: [2.2945, 48.8584], category: "landmark" },
    { name: "Great Pyramid of Giza, Egypt", coords: [31.1342, 29.9792], category: "history" },
    { name: "Rio de Janeiro, Brazil", coords: [-43.1729, -22.9068], category: "city" },
    { name: "Bondi Beach, Australia", coords: [151.2743, -33.8908], category: "beach" },
    { name: "Berlin, Germany", coords: [13.4050, 52.5200], category: "city" },
    { name: "Wat Arun, Thailand", coords: [100.4889, 13.7437], category: "temple" },
    { name: "Rome, Italy", coords: [12.4964, 41.9028], category: "city" },
    { name: "Maldives", coords: [73.2207, 3.2028], category: "beach" },
    { name: "Statue of Liberty, New York", coords: [-74.0445, 40.6892], category: "landmark" },
    { name: "Times Square, New York", coords: [-73.9855, 40.7580], category: "city" },
    { name: "London Eye, UK", coords: [-0.1195, 51.5033], category: "landmark" },
    { name: "Big Ben, London", coords: [-0.1246, 51.5007], category: "landmark" },
    { name: "Taj Mahal, India", coords: [78.0421, 27.1751], category: "history" },
    { name: "Machu Picchu, Peru", coords: [-72.5450, -13.1631], category: "history" },
    { name: "Christ the Redeemer, Brazil", coords: [-43.2105, -22.9519], category: "landmark" },
    { name: "Colosseum, Rome", coords: [12.4922, 41.8902], category: "history" },
    { name: "Santorini, Greece", coords: [25.4283, 36.3932], category: "island" },
    { name: "Dubai Burj Khalifa, UAE", coords: [55.2744, 25.1972], category: "landmark" },
    { name: "Great Wall of China, Beijing", coords: [116.5704, 40.4319], category: "history" },
    { name: "Niagara Falls, Canada/USA", coords: [-79.0742, 43.0828], category: "nature" },
    { name: "Sydney Opera House, Australia", coords: [151.2153, -33.8572], category: "landmark" },
    { name: "Petra, Jordan", coords: [35.4444, 30.3285], category: "history" },
    { name: "Angkor Wat, Cambodia", coords: [103.8669, 13.4125], category: "temple" },
    { name: "Chichen Itza, Mexico", coords: [-88.5678, 20.6843], category: "history" }
  ];

  // Build GeoJSON
  const geojson = {
    type: "FeatureCollection",
    features: landmarks.map(l => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: l.coords },
      properties: { name: l.name, category: l.category }
    }))
  };

  let userMarker = null;

  // Helpers
  function flyToUser(lng, lat, zoom = 12, duration = 800) {
    map.easeTo({ center: [lng, lat], zoom, duration });
    if (!userMarker) {
      userMarker = new mapboxgl.Marker({ color: '#10b981' }).setLngLat([lng, lat]).addTo(map);
    } else {
      userMarker.setLngLat([lng, lat]);
    }
  }
  function cacheLoc(lng, lat) {
    localStorage.setItem('lastLoc', JSON.stringify({ lng, lat, ts: Date.now() }));
  }
  function readCache() {
    try {
      const c = JSON.parse(localStorage.getItem('lastLoc') || 'null');
      if (c && Date.now() - c.ts < 5 * 60 * 1000) return c; // 5 minutes
    } catch {}
    return null;
  }

  // Add clustered source & layers
  map.on('load', () => {
    if (!map.getSource('landmarks')) {
      map.addSource('landmarks', {
        type: 'geojson',
        data: geojson,
        cluster: true,
        clusterMaxZoom: 9,
        clusterRadius: 50
      });
    }

    if (!map.getLayer('clusters')) {
      map.addLayer({
        id: 'clusters', type: 'circle', source: 'landmarks', filter: ['has', 'point_count'],
        paint: {
          'circle-color': ['step', ['get', 'point_count'], '#8dd3c7', 10, '#80b1d3', 25, '#b3de69'],
          'circle-radius': ['step', ['get', 'point_count'], 15, 10, 20, 25, 28],
          'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1
        }
      });
    }

    if (!map.getLayer('cluster-count')) {
      map.addLayer({
        id: 'cluster-count', type: 'symbol', source: 'landmarks', filter: ['has', 'point_count'],
        layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-size': 12 },
        paint: { 'text-color': '#002b36' }
      });
    }

    if (!map.getLayer('unclustered-point')) {
      map.addLayer({
        id: 'unclustered-point', type: 'circle', source: 'landmarks', filter: ['!', ['has', 'point_count']],
        paint: { 'circle-color': '#a1c6e8', 'circle-radius': 6, 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1.5 }
      });
    }

    if (!map.getLayer('landmarks-heat')) {
      map.addLayer({
        id: 'landmarks-heat', type: 'heatmap', source: 'landmarks', maxzoom: 9,
        paint: { 'heatmap-weight': 1, 'heatmap-intensity': 1, 'heatmap-radius': 30, 'heatmap-opacity': 0.0 }
      }, 'unclustered-point');
    }

    // Cluster click zoom
    map.on('click', 'clusters', (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      const clusterId = features[0].properties.cluster_id;
      map.getSource('landmarks').getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        map.easeTo({ center: features[0].geometry.coordinates, zoom });
      });
    });

    // Popup for unclustered points
    map.on('click', 'unclustered-point', (e) => {
      const f = e.features[0];
      const { name, category } = f.properties;
      const coord = f.geometry.coordinates.slice();

      const html = `
        <div style="min-width:200px">
          <strong>${name}</strong><br>
          <small>Category: ${category}</small><br><br>
          <button id="save-to-trip" class="btn btn-save" style="padding:6px 10px;border-radius:8px;cursor:pointer;">
            Save to Trip
          </button>
        </div>
      `;
      new mapboxgl.Popup({ offset: 12 }).setLngLat(coord).setHTML(html).addTo(map);

      setTimeout(() => {
        const btn = document.getElementById('save-to-trip');
        if (btn) {
          btn.onclick = () => {
            const saved = JSON.parse(localStorage.getItem('tripSaved') || '[]');
            if (!saved.includes(name)) {
              saved.push(name);
              localStorage.setItem('tripSaved', JSON.stringify(saved));
              showToast(`Saved: ${name}`);
              btn.textContent = 'Saved ✔';
            } else {
              showToast(`Already in your Trip list`);
            }
          };
        }
      }, 0);
    });

    map.on('mouseenter', 'unclustered-point', () => map.getCanvas().style.cursor = 'pointer');
    map.on('mouseleave', 'unclustered-point', () => map.getCanvas().style.cursor = '');
 // ===== FAST LOCATE: cache -> coarse locate -> (fallback) high-accuracy =====
    const locateBtn = document.getElementById('btn-locate');
    if (locateBtn) locateBtn.onclick = fastLocate;

    function fastLocate() {
      locateBtn.classList.add('loading'); // purely visual if you style it

      const cached = readCache();
      if (cached) flyToUser(cached.lng, cached.lat, 12, 400);

      if (!navigator.geolocation) {
        showToast('Geolocation not supported');
        locateBtn.classList.remove('loading');
        return;
      }

      // 1) Quick coarse locate
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { longitude: lng, latitude: lat } = pos.coords;
          flyToUser(lng, lat, 12, cached ? 400 : 800);
          cacheLoc(lng, lat);
          locateBtn.classList.remove('loading');
        },
        // 2) Fallback: high accuracy (GPS)
        () => {
          navigator.geolocation.getCurrentPosition(
            pos2 => {
              const { longitude: lng, latitude: lat } = pos2.coords;
              flyToUser(lng, lat, 13, 800);
              cacheLoc(lng, lat);
              locateBtn.classList.remove('loading');
            },
            () => {
              showToast('Could not get your location.');
              locateBtn.classList.remove('loading');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        },
        { enableHighAccuracy: false, timeout: 3000, maximumAge: 600000 }
      );

      // Trigger Mapbox control for the blue dot (best effort)
      try { geolocate.trigger(); } catch {}
    }
  });

  // Tie main search bar to map flyTo (forward geocoding). Prevent form submit.
  if (typeof searchInput !== 'undefined' && searchInput) {
    searchInput.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const q = searchInput.value.trim();
        if (!q) return;
        try {
          const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${mapboxgl.accessToken}&limit=1`);
          const data = await res.json();
          if (data.features?.length) {
            const [lng, lat] = data.features[0].center;
            // We’re still inside the same DOMContentLoaded closure -> "map" is in scope
            const mapCanvas = document.getElementById('map');
            // just ease the same map
            map.easeTo({ center: [lng, lat], zoom: 10 });
          }
        } catch (err) {
          console.error('Geocoding error', err);
        }
      }
    });
  }

  // Simple toast
  function showToast(msg) {
    let t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      Object.assign(t.style, {
        position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '10px 16px',
        borderRadius: '12px', zIndex: '9999', fontSize: '14px',
        boxShadow: '0 8px 24px rgba(0,0,0,.25)', transition: 'opacity .25s ease'
      });
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    setTimeout(() => { t.style.opacity = '0'; }, 1800);
  }
});