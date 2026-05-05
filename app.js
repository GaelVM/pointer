const LA_LIBERTAD_CENTER = [-8.11599, -79.02998]; // Trujillo, La Libertad
const LA_LIBERTAD_BOUNDS = [
  [-8.90, -79.70],
  [-6.95, -77.45]
];

const map = L.map("map", {
  maxBounds: LA_LIBERTAD_BOUNDS,
  maxBoundsViscosity: 0.8
}).setView(LA_LIBERTAD_CENTER, 9);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const markerLayer = L.layerGroup().addTo(map);
const locationLayer = L.layerGroup().addTo(map);
let puntos = [];
let visibleMarkers = [];
let userMarker = null;
let userAccuracyCircle = null;
let watchId = null;

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const fitBtn = document.getElementById("fitBtn");
const locateBtn = document.getElementById("locateBtn");
const locationStatus = document.getElementById("locationStatus");
const list = document.getElementById("list");

const totalCount = document.getElementById("totalCount");
const visitedCount = document.getElementById("visitedCount");
const pendingCount = document.getElementById("pendingCount");

function markerIcon(estado) {
  const color = estado === "visitada" ? "#22c55e" : "#f97316";

  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 22px;
      height: 22px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,.35);
    "></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
}

function userLocationIcon() {
  return L.divIcon({
    className: "custom-marker user-location-marker",
    html: `<div class="user-location-dot"></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
}

function estadoTexto(estado) {
  return estado === "visitada" ? "Visitada" : "Sin visitar";
}

function googleMapsUrl(p) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(p.lat + "," + p.lng)}`;
}

function popupContent(p) {
  return `
    <div class="popup-title">${p.nombre}</div>
    <div class="popup-row"><b>CC:</b> ${p.cc || "-"}</div>
    <div class="popup-row"><b>Dirección:</b> ${p.direccion || "-"}</div>
    <div class="popup-row"><b>Estado:</b> ${estadoTexto(p.estado)}</div>
    <div class="popup-row"><b>Texto:</b> ${p.texto || "-"}</div>
    <a class="route-link" href="${googleMapsUrl(p)}" target="_blank" rel="noopener">Abrir ruta en Google Maps</a>
  `;
}

function normalize(text) {
  return String(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function matchesSearch(p, query) {
  if (!query) return true;

  const content = normalize([
    p.nombre,
    p.cc,
    p.direccion,
    p.texto,
    p.estado
  ].join(" "));

  return content.includes(normalize(query));
}

function filteredPoints() {
  const query = searchInput.value.trim();
  const status = statusFilter.value;

  return puntos.filter(p => {
    const statusOk = status === "todos" || p.estado === status;
    return statusOk && matchesSearch(p, query);
  });
}

function renderStats(data) {
  const visitadas = data.filter(p => p.estado === "visitada").length;
  const sinVisitar = data.filter(p => p.estado !== "visitada").length;

  totalCount.textContent = `${data.length} puntos`;
  visitedCount.textContent = `${visitadas} visitadas`;
  pendingCount.textContent = `${sinVisitar} sin visitar`;
}

function renderList(data) {
  list.innerHTML = "";

  if (!data.length) {
    list.innerHTML = "<p>No hay resultados.</p>";
    return;
  }

  data.forEach((p, index) => {
    const item = document.createElement("div");
    item.className = "card";
    item.innerHTML = `
      <strong>${p.nombre}</strong>
      <small>${p.direccion || "Sin dirección"}</small>
      <div>CC: ${p.cc || "-"}</div>
      <span class="badge ${p.estado}">${estadoTexto(p.estado)}</span>
      <a class="mini-route" href="${googleMapsUrl(p)}" target="_blank" rel="noopener">Ruta en Google Maps</a>
    `;

    item.addEventListener("click", event => {
      if (event.target.tagName.toLowerCase() === "a") return;
      const marker = visibleMarkers[index];
      if (marker) {
        map.setView(marker.getLatLng(), 15);
        marker.openPopup();
      }
    });

    list.appendChild(item);
  });
}

function renderMarkers(data) {
  markerLayer.clearLayers();
  visibleMarkers = [];

  data.forEach(p => {
    if (typeof p.lat !== "number" || typeof p.lng !== "number") return;

    const marker = L.marker([p.lat, p.lng], {
      icon: markerIcon(p.estado)
    }).bindPopup(popupContent(p));

    marker.addTo(markerLayer);
    visibleMarkers.push(marker);
  });
}

function fitToResults() {
  if (!visibleMarkers.length) return;

  const group = L.featureGroup(visibleMarkers);
  map.fitBounds(group.getBounds().pad(0.2));
}

function render() {
  const data = filteredPoints();
  renderStats(data);
  renderMarkers(data);
  renderList(data);
}

function updateUserLocation(position, centerMap = false) {
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  const accuracy = Math.round(position.coords.accuracy || 0);
  const latLng = [lat, lng];

  if (!userMarker) {
    userMarker = L.marker(latLng, { icon: userLocationIcon() })
      .bindPopup("<b>Mi ubicación actual</b><br>Referencia GPS del navegador.")
      .addTo(locationLayer);
  } else {
    userMarker.setLatLng(latLng);
  }

  if (!userAccuracyCircle) {
    userAccuracyCircle = L.circle(latLng, {
      radius: accuracy,
      className: "accuracy-circle"
    }).addTo(locationLayer);
  } else {
    userAccuracyCircle.setLatLng(latLng);
    userAccuracyCircle.setRadius(accuracy);
  }

  locationStatus.textContent = `Ubicación detectada. Precisión aproximada: ${accuracy} m.`;

  if (centerMap) {
    map.setView(latLng, 15);
    userMarker.openPopup();
  }
}

function handleLocationError(error) {
  const messages = {
    1: "Permiso de ubicación denegado. Actívalo en tu navegador.",
    2: "No se pudo determinar tu ubicación.",
    3: "La solicitud de ubicación tardó demasiado."
  };

  locationStatus.textContent = messages[error.code] || "No se pudo obtener la ubicación.";
}

function detectUserLocation(centerMap = true) {
  if (!navigator.geolocation) {
    locationStatus.textContent = "Este navegador no soporta geolocalización.";
    return;
  }

  locationStatus.textContent = "Solicitando ubicación...";

  navigator.geolocation.getCurrentPosition(
    position => updateUserLocation(position, centerMap),
    handleLocationError,
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
  );

  if (watchId === null) {
    watchId = navigator.geolocation.watchPosition(
      position => updateUserLocation(position, false),
      handleLocationError,
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  }
}

async function loadData() {
  try {
    const response = await fetch("data.json?cache=" + Date.now());
    puntos = await response.json();
    render();
    fitToResults();
  } catch (error) {
    console.error(error);
    list.innerHTML = "<p>No se pudo cargar data.json.</p>";
  }
}

searchInput.addEventListener("input", render);
statusFilter.addEventListener("change", render);
fitBtn.addEventListener("click", fitToResults);
locateBtn.addEventListener("click", () => detectUserLocation(true));

loadData();
