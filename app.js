const JURISDICTION_BOUNDS = [
  [-8.45, -79.85], // suroeste aproximado La Libertad
  [-6.30, -77.50]  // noreste aproximado Cajamarca
];

let map;
let allPoints = [];
let markersLayer;
let userMarker = null;

const listEl = document.getElementById("list");
const messageEl = document.getElementById("message");
const searchInput = document.getElementById("searchInput");
const departmentFilter = document.getElementById("departmentFilter");
const statusFilter = document.getElementById("statusFilter");
const locateBtn = document.getElementById("locateBtn");
const resetBtn = document.getElementById("resetBtn");

init();

async function init() {
  map = L.map("map");
  map.fitBounds(JURISDICTION_BOUNDS);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);

  try {
    const response = await fetch("data.json", { cache: "no-store" });
    allPoints = await response.json();
    render();
  } catch (error) {
    showMessage("No se pudo leer data.json. Revisa que el archivo exista y que estés abriendo la web desde GitHub Pages o un servidor local.");
  }

  searchInput.addEventListener("input", render);
  departmentFilter.addEventListener("change", render);
  statusFilter.addEventListener("change", render);
  locateBtn.addEventListener("click", locateUser);
  resetBtn.addEventListener("click", () => map.fitBounds(JURISDICTION_BOUNDS));
}

function render() {
  markersLayer.clearLayers();
  listEl.innerHTML = "";

  const query = normalize(searchInput.value);
  const selectedDept = departmentFilter.value;
  const selectedStatus = statusFilter.value;

  const filtered = allPoints.filter((point) => {
    const text = normalize([
      point.nombre,
      point.cc,
      point.direccion,
      point.departamento,
      point.estado,
      point.texto
    ].join(" "));

    const matchesSearch = !query || text.includes(query);
    const matchesDept = selectedDept === "todos" || point.departamento === selectedDept;
    const matchesStatus = selectedStatus === "todos" || point.estado === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  filtered.forEach((point) => {
    if (isValidCoordinate(point.lat, point.lng)) {
      const marker = L.marker([point.lat, point.lng], {
        icon: createIcon(point.estado)
      }).addTo(markersLayer);

      marker.bindPopup(createPopup(point));
    }

    listEl.appendChild(createCard(point));
  });

  showMessage(`${filtered.length} punto(s) visible(s). Recuerda: la ubicación real depende del lat/lng, no de la CC.`);
}

function createIcon(status) {
  const className = status === "visitada" ? "marker-visitada" : "marker-sin_visitar";
  return L.divIcon({
    className: "",
    html: `<span class="marker-dot ${className}"></span>`,
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

function createPopup(point) {
  return `
    <div class="popup">
      <h3>${escapeHtml(point.nombre)}</h3>
      <p><strong>Departamento:</strong> ${escapeHtml(point.departamento || "")}</p>
      <p><strong>Dirección:</strong> ${escapeHtml(point.direccion || "")}</p>
      <p><strong>CC:</strong> ${escapeHtml(point.cc || "")}</p>
      <p><strong>Estado:</strong> ${formatStatus(point.estado)}</p>
      <p>${escapeHtml(point.texto || "")}</p>
      <p><strong>Coordenadas:</strong> ${point.lat}, ${point.lng}</p>
      <a href="${googleRouteUrl(point)}" target="_blank" rel="noopener">Abrir ruta en Google Maps</a><br>
      <a href="${googleSearchUrl(point)}" target="_blank" rel="noopener">Buscar dirección en Google Maps</a>
    </div>
  `;
}

function createCard(point) {
  const card = document.createElement("article");
  card.className = "card";

  card.innerHTML = `
    <h3>${escapeHtml(point.nombre)}</h3>
    <p>${escapeHtml(point.direccion || "")}</p>
    <p><strong>CC:</strong> ${escapeHtml(point.cc || "")}</p>
    <span class="badge ${point.estado}">${formatStatus(point.estado)}</span>
    <span class="dept">${escapeHtml(point.departamento || "Sin departamento")}</span>
    <p>${escapeHtml(point.lat)}, ${escapeHtml(point.lng)}</p>
    <p>${escapeHtml(point.texto || "")}</p>
    <div class="links">
      <a href="#" data-action="zoom">Ver en el mapa</a>
      <a href="${googleRouteUrl(point)}" target="_blank" rel="noopener">Ruta en Google Maps</a>
      <a href="${googleSearchUrl(point)}" target="_blank" rel="noopener">Buscar dirección en Google Maps</a>
    </div>
  `;

  card.querySelector('[data-action="zoom"]').addEventListener("click", (event) => {
    event.preventDefault();

    if (!isValidCoordinate(point.lat, point.lng)) {
      showMessage("Este punto no tiene latitud/longitud válidas.");
      return;
    }

    map.setView([point.lat, point.lng], 18);
  });

  return card;
}

function locateUser() {
  if (!navigator.geolocation) {
    showMessage("Tu navegador no soporta geolocalización.");
    return;
  }

  showMessage("Buscando tu ubicación actual...");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const accuracy = Math.round(position.coords.accuracy);

      if (userMarker) {
        map.removeLayer(userMarker);
      }

      userMarker = L.marker([lat, lng], {
        icon: createUserIcon()
      }).addTo(map);

      userMarker.bindPopup(`
        <strong>Mi ubicación actual</strong><br>
        Precisión aproximada: ${accuracy} metros<br>
        ${lat}, ${lng}
      `).openPopup();

      map.setView([lat, lng], 16);
      showMessage(`Ubicación detectada. Precisión aproximada: ${accuracy} metros.`);
    },
    (error) => {
      const messages = {
        1: "Permiso denegado. Activa el permiso de ubicación para esta página.",
        2: "No se pudo determinar la ubicación. Activa GPS/datos móviles e intenta otra vez.",
        3: "La búsqueda de ubicación tardó demasiado. Intenta nuevamente."
      };

      showMessage(messages[error.code] || "No se pudo obtener tu ubicación.");
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );
}

function googleRouteUrl(point) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(point.lat + "," + point.lng)}`;
}

function googleSearchUrl(point) {
  const q = `${point.direccion || ""} ${point.departamento || ""} Perú`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

function isValidCoordinate(lat, lng) {
  return typeof lat === "number" &&
    typeof lng === "number" &&
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

function formatStatus(status) {
  return status === "visitada" ? "Visitada" : "Sin visitar";
}

function showMessage(text) {
  messageEl.textContent = text;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


