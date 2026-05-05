const JURISDICTION_BOUNDS = [
  [-8.55, -79.95],
  [-6.25, -77.35]
];

let map;
let markersLayer;
let allPoints = [];
let currentFiltered = [];
let markerById = new Map();
let userLocation = null;
let userMarker = null;

const els = {
  search: document.getElementById("searchInput"),
  department: document.getElementById("departmentFilter"),
  status: document.getElementById("statusFilter"),
  locate: document.getElementById("locateBtn"),
  nearest: document.getElementById("nearestBtn"),
  fit: document.getElementById("fitBtn"),
  reset: document.getElementById("resetBtn"),
  message: document.getElementById("message"),
  stats: document.getElementById("stats"),
  list: document.getElementById("list"),
  togglePanel: document.getElementById("togglePanelBtn"),
  panelContent: document.getElementById("panelContent")
};

init();

function init() {
  map = L.map("map", {
    zoomControl: true
  });

  map.fitBounds(JURISDICTION_BOUNDS);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);

  safeOn(els.search, "input", render);
  safeOn(els.department, "change", render);
  safeOn(els.status, "change", render);
  safeOn(els.locate, "click", detectUserLocation);
  safeOn(els.nearest, "click", goToNearestPoint);
  safeOn(els.fit, "click", fitToResults);
  safeOn(els.reset, "click", () => map.fitBounds(JURISDICTION_BOUNDS));
  safeOn(els.togglePanel, "click", togglePanel);

  window.addEventListener("resize", () => {
    setTimeout(() => map.invalidateSize(), 250);
  });

  setTimeout(() => map.invalidateSize(), 300);

  loadData();
}

async function loadData() {
  try {
    const response = await fetch("data.json", { cache: "no-store" });
    if (!response.ok) throw new Error("No se pudo cargar data.json");
    allPoints = await response.json();
    render();
    fitToResults();
  } catch (error) {
    showMessage("Error leyendo data.json. Publica en GitHub Pages o usa un servidor local.");
    console.error(error);
  }
}

function render() {
  markersLayer.clearLayers();
  markerById.clear();
  if (els.list) els.list.innerHTML = "";

  const q = normalize(els.search.value);
  const dept = els.department.value;
  const status = els.status.value;

  currentFiltered = allPoints.filter(point => {
    const text = normalize([
      point.nombre,
      point.cc,
      point.departamento,
      point.direccion,
      point.estado,
      point.texto
    ].join(" "));

    return (!q || text.includes(q)) &&
      (dept === "todos" || point.departamento === dept) &&
      (status === "todos" || point.estado === status);
  });

  currentFiltered.forEach(point => {
    if (validCoords(point)) {
      const marker = L.marker([Number(point.lat), Number(point.lng)], {
        icon: createIcon(point.estado)
      }).addTo(markersLayer);

      marker.bindPopup(popupHtml(point));
      markerById.set(String(point.id), marker);
    }

    if (els.list) els.list.appendChild(cardEl(point));
  });

  updateStats();
  showMessage(`${currentFiltered.length} punto(s) visible(s). El mapa ubica por latitud y longitud.`);
  setTimeout(() => map.invalidateSize(), 100);
}

function updateStats() {
  const total = currentFiltered.length;
  const visitadas = currentFiltered.filter(p => p.estado === "visitada").length;
  const pendientes = currentFiltered.filter(p => p.estado !== "visitada").length;

  els.stats.innerHTML = `
    <div class="stat"><strong>${total}</strong><span>Total</span></div>
    <div class="stat"><strong>${pendientes}</strong><span>Sin visitar</span></div>
    <div class="stat"><strong>${visitadas}</strong><span>Visitadas</span></div>
  `;
}

function createIcon(status) {
  const css = status === "visitada" ? "marker-visitada" : "marker-sin_visitar";
  return L.divIcon({
    className: "",
    html: `<span class="marker-dot ${css}"></span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
}

function createUserIcon() {
  return L.divIcon({
    className: "",
    html: `<span class="marker-dot marker-user"></span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
}

function popupHtml(point) {
  return `
    <div class="popup">
      <h3>${escapeHtml(point.nombre)}</h3>
      <p><strong>CC:</strong> ${escapeHtml(point.cc)}</p>
      <p><strong>Departamento:</strong> ${escapeHtml(point.departamento)}</p>
      <p><strong>Dirección:</strong> ${escapeHtml(point.direccion)}</p>
      <p><strong>Estado:</strong> ${statusLabel(point.estado)}</p>
      <p>${escapeHtml(point.texto || "")}</p>
      <p><strong>Coord:</strong> ${point.lat}, ${point.lng}</p>
      <a href="${routeUrl(point)}" target="_blank" rel="noopener">Abrir ruta en Google Maps</a><br>
      <a href="${searchUrl(point)}" target="_blank" rel="noopener">Buscar dirección en Google Maps</a>
    </div>
  `;
}

function cardEl(point) {
  const card = document.createElement("article");
  card.className = "card";

  const distance = userLocation && validCoords(point)
    ? `<p><strong>Distancia aprox:</strong> ${formatDistance(distanceKm(userLocation.lat, userLocation.lng, Number(point.lat), Number(point.lng)))}</p>`
    : "";

  card.innerHTML = `
    <h3>${escapeHtml(point.nombre)}</h3>
    <p>${escapeHtml(point.direccion || "")}</p>
    <p><strong>CC:</strong> ${escapeHtml(point.cc || "")}</p>
    <div class="badges">
      <span class="badge ${point.estado}">${statusLabel(point.estado)}</span>
      <span class="badge dept">${escapeHtml(point.departamento || "Sin departamento")}</span>
    </div>
    <p><strong>Coordenadas:</strong> ${escapeHtml(point.lat)}, ${escapeHtml(point.lng)}</p>
    ${distance}
    <p>${escapeHtml(point.texto || "")}</p>
    <div class="links">
      <a href="#" data-action="zoom">Ver en el mapa</a>
      <a href="${routeUrl(point)}" target="_blank" rel="noopener">Ruta en Google Maps</a>
      <a href="${searchUrl(point)}" target="_blank" rel="noopener">Buscar dirección en Google Maps</a>
    </div>
  `;

  card.querySelector('[data-action="zoom"]').addEventListener("click", event => {
    event.preventDefault();

    if (!validCoords(point)) {
      showMessage("Este punto no tiene coordenadas válidas.");
      return;
    }

    if (window.innerWidth <= 850 && els.panelContent) {
      els.panelContent.classList.add("collapsed");
    }

    map.setView([Number(point.lat), Number(point.lng)], 18);
    setTimeout(() => map.invalidateSize(), 150);

    const marker = markerById.get(String(point.id));
    if (marker) marker.openPopup();
  });

  return card;
}

function detectUserLocation() {
  if (!navigator.geolocation) {
    showMessage("Tu navegador no soporta geolocalización.");
    return;
  }

  showMessage("Detectando ubicación actual...");

  navigator.geolocation.getCurrentPosition(
    pos => {
      userLocation = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: Math.round(pos.coords.accuracy)
      };

      if (userMarker) map.removeLayer(userMarker);

      userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: createUserIcon()
      }).addTo(map);

      userMarker.bindPopup(`
        <strong>Mi ubicación actual</strong><br>
        Precisión aprox: ${userLocation.accuracy} m<br>
        ${userLocation.lat}, ${userLocation.lng}
      `).openPopup();

      if (window.innerWidth <= 850 && els.panelContent) {
        els.panelContent.classList.add("collapsed");
      }

      map.setView([userLocation.lat, userLocation.lng], 16);
      setTimeout(() => map.invalidateSize(), 150);

      showMessage(`Ubicación detectada. Precisión aproximada: ${userLocation.accuracy} metros.`);
      render();
    },
    err => {
      const msg = {
        1: "Permiso denegado. Activa permisos de ubicación para esta página.",
        2: "No se pudo obtener ubicación. Activa GPS o ubicación del dispositivo.",
        3: "La ubicación tardó demasiado. Intenta nuevamente."
      }[err.code] || "No se pudo detectar tu ubicación.";
      showMessage(msg);
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );
}

function goToNearestPoint() {
  if (!userLocation) {
    showMessage("Primero presiona Detectar mi ubicación.");
    return;
  }

  const valid = currentFiltered.filter(validCoords);
  if (!valid.length) {
    showMessage("No hay puntos válidos en los resultados actuales.");
    return;
  }

  let nearest = valid[0];
  let min = distanceKm(userLocation.lat, userLocation.lng, Number(nearest.lat), Number(nearest.lng));

  valid.forEach(point => {
    const d = distanceKm(userLocation.lat, userLocation.lng, Number(point.lat), Number(point.lng));
    if (d < min) {
      min = d;
      nearest = point;
    }
  });

  if (window.innerWidth <= 850 && els.panelContent) {
    els.panelContent.classList.add("collapsed");
  }

  map.setView([Number(nearest.lat), Number(nearest.lng)], 18);
  setTimeout(() => map.invalidateSize(), 150);

  const marker = markerById.get(String(nearest.id));
  if (marker) marker.openPopup();

  showMessage(`Punto más cercano: ${nearest.nombre} · ${formatDistance(min)} aprox.`);
}

function fitToResults() {
  const valid = currentFiltered.filter(validCoords);
  if (!valid.length) {
    showMessage("No hay coordenadas válidas para ajustar.");
    return;
  }

  const bounds = L.latLngBounds(valid.map(p => [Number(p.lat), Number(p.lng)]));
  map.fitBounds(bounds, { padding: [35, 35] });
  setTimeout(() => map.invalidateSize(), 100);
}

function togglePanel() {
  if (!els.panelContent) return;
  els.panelContent.classList.toggle("collapsed");
  setTimeout(() => map.invalidateSize(), 250);
}

function routeUrl(point) {
  if (validCoords(point)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(Number(point.lat) + "," + Number(point.lng))}`;
  }

  const q = `${point.direccion || ""} ${point.departamento || ""} Perú`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

function searchUrl(point) {
  const q = `${point.direccion || ""} ${point.departamento || ""} Perú`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(value) {
  return value * Math.PI / 180;
}

function formatDistance(km) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(2)} km`;
}

function validCoords(point) {
  const lat = Number(point.lat);
  const lng = Number(point.lng);

  return Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180;
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function statusLabel(status) {
  return status === "visitada" ? "Visitada" : "Sin visitar";
}

function showMessage(text) {
  if (els.message) els.message.textContent = text;
}

function safeOn(el, event, handler) {
  if (el) el.addEventListener(event, handler);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

