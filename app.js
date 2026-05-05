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
  jurisdiction: document.getElementById("jurisdictionBtn"),
  message: document.getElementById("message"),
  stats: document.getElementById("stats"),
  list: document.getElementById("list"),
  togglePanel: document.getElementById("togglePanelBtn"),
  panelContent: document.getElementById("panelContent")
};


// ===============================
// JURISDICCIÓN: LA LIBERTAD + PROVINCIAS CAJAMARCA
// ===============================
const sanMiguel = {"type":"Feature","properties":{"COUNT":13,"FIRST_IDPR":"0611","NOMBPROV":"SAN MIGUEL","FIRST_NOMB":"CAJAMARCA","LAST_DCTO":"LEY","LAST_LEY":"25042","FIRST_FECH":"02/01/1857","LAST_FECHA":"14/06/1989","MIN_SHAPE_":254550.23539,"ha":254550.24},"geometry":{"type":"Polygon","coordinates":[[[-78.91954,-7.21094],[-78.95837,-7.18773],[-79.01786,-7.17926],[-79.05885,-7.2403],[-79.1244,-7.18058],[-79.2518,-7.19835],[-79.3053,-7.14715],[-79.32259,-7.02568],[-79.29663,-6.99983],[-79.31101,-6.90134],[-79.26274,-6.85916],[-79.22907,-6.86047],[-79.20709,-6.82144],[-79.14634,-6.8656],[-79.08288,-6.87376],[-79.04974,-6.83622],[-78.9829,-6.86238],[-78.93645,-6.83958],[-78.88322,-6.84354],[-78.88694,-6.79718],[-78.82063,-6.69384],[-78.74616,-6.74461],[-78.71841,-6.73967],[-78.63839,-6.77782],[-78.61508,-6.85161],[-78.63468,-6.89088],[-78.68552,-6.91037],[-78.69657,-6.94198],[-78.78645,-7.02368],[-78.86674,-7.04517],[-78.87833,-7.14236],[-78.91954,-7.21095]]]}};
const contumaza = {"type":"Feature","properties":{"COUNT":8,"FIRST_IDPR":"0605","NOMBPROV":"CONTUMAZA","FIRST_NOMB":"CAJAMARCA","LAST_DCTO":"LEY","LAST_LEY":"15046","FIRST_FECH":"19/11/1888","LAST_FECHA":"05/06/1964","MIN_SHAPE_":207828.799349,"ha":207828.8},"geometry":{"type":"Polygon","coordinates":[[[-78.91954,-7.21095],[-78.89763,-7.22839],[-78.74599,-7.21933],[-78.64985,-7.25563],[-78.62165,-7.28536],[-78.66541,-7.37901],[-78.69623,-7.41336],[-78.76012,-7.40198],[-78.84162,-7.43762],[-78.88669,-7.4841],[-78.89591,-7.53744],[-78.94434,-7.59842],[-78.94275,-7.62267],[-78.99215,-7.66095],[-79.04123,-7.59989],[-79.05985,-7.54668],[-79.06543,-7.47271],[-79.15272,-7.43982],[-79.18733,-7.38866],[-79.25633,-7.38186],[-79.36928,-7.32412],[-79.28263,-7.27506],[-79.2518,-7.19835],[-79.1244,-7.18058],[-79.05885,-7.2403],[-79.01786,-7.17926],[-78.95837,-7.18773],[-78.91954,-7.21095]]]}};
const sanPablo = {"type":"Feature","properties":{"COUNT":4,"FIRST_IDPR":"0612","NOMBPROV":"SAN PABLO","FIRST_NOMB":"CAJAMARCA","LAST_DCTO":"LEY","LAST_LEY":"23336","FIRST_FECH":"11/12/1981","LAST_FECHA":"11/12/1981","MIN_SHAPE_":66711.1988703,"ha":66711.2},"geometry":{"type":"Polygon","coordinates":[[[-78.74599,-7.21933],[-78.89763,-7.22839],[-78.91954,-7.21095],[-78.87833,-7.14236],[-78.86674,-7.04517],[-78.78645,-7.02368],[-78.69657,-6.94198],[-78.68552,-6.91037],[-78.63468,-6.89088],[-78.61508,-6.85161],[-78.60138,-6.86763],[-78.61351,-6.92073],[-78.60498,-6.99725],[-78.62368,-7.01066],[-78.66171,-7.10299],[-78.71999,-7.17082],[-78.74599,-7.21933]]]}};
const celendin = {"type":"Feature","properties":{"COUNT":12,"FIRST_IDPR":"0603","NOMBPROV":"CELENDIN","FIRST_NOMB":"CAJAMARCA","LAST_DCTO":"LEY","LAST_LEY":"7855","FIRST_FECH":"27/12/1923","LAST_FECHA":"16/10/1933","MIN_SHAPE_":265469.006981,"ha":265469.01},"geometry":{"type":"Polygon","coordinates":[[[-78.45348,-6.83419],[-78.40197,-6.81506],[-78.40484,-6.71153],[-78.38547,-6.68525],[-78.41297,-6.59586],[-78.3526,-6.56463],[-78.36546,-6.47215],[-78.32135,-6.44997],[-78.27793,-6.38896],[-78.19003,-6.45702],[-78.13603,-6.5263],[-78.1076,-6.64233],[-78.0582,-6.67615],[-78.03587,-6.74324],[-78.01406,-6.8223],[-77.99951,-6.97053],[-77.95115,-7.06461],[-78.01595,-7.0968],[-78.05653,-7.13479],[-78.18369,-7.14915],[-78.21946,-7.07158],[-78.29145,-7.02327],[-78.34051,-6.95418],[-78.38619,-6.9258],[-78.42664,-6.93116],[-78.45348,-6.83419]]]}};
const cajabamba = {"type":"Feature","properties":{"COUNT":4,"FIRST_IDPR":"0602","NOMBPROV":"CAJABAMBA","FIRST_NOMB":"CAJAMARCA","LAST_DCTO":"DEC.","LAST_LEY":"S/N","FIRST_FECH":"EPOCA INDEP.","LAST_FECHA":"11/02/1855","MIN_SHAPE_":178954.55983,"ha":178954.56},"geometry":{"type":"Polygon","coordinates":[[[-78.26115,-7.75402],[-78.3028,-7.69646],[-78.34796,-7.68572],[-78.37606,-7.63996],[-78.35679,-7.57401],[-78.36083,-7.52996],[-78.33583,-7.49525],[-78.34367,-7.41738],[-78.27738,-7.37345],[-78.21984,-7.38762],[-78.17438,-7.45727],[-78.13175,-7.48031],[-78.08497,-7.45431],[-78.01332,-7.46216],[-77.98263,-7.38746],[-77.94255,-7.34566],[-77.8831,-7.36419],[-77.8296,-7.34764],[-77.81344,-7.39254],[-77.77199,-7.41846],[-77.74598,-7.47916],[-77.84417,-7.51438],[-77.87044,-7.58533],[-77.91278,-7.6249],[-77.99864,-7.67907],[-78.08122,-7.69617],[-78.11605,-7.65401],[-78.22465,-7.75933],[-78.26115,-7.75402]]]}};
const sanMarcos = {"type":"Feature","properties":{"COUNT":7,"FIRST_IDPR":"0610","NOMBPROV":"SAN MARCOS","FIRST_NOMB":"CAJAMARCA","LAST_DCTO":"LEY","LAST_LEY":"23508","FIRST_FECH":"29/12/1984","LAST_FECHA":"11/12/1982","MIN_SHAPE_":135538.271153,"ha":135538.27},"geometry":{"type":"Polygon","coordinates":[[[-78.27738,-7.37345],[-78.3073,-7.33362],[-78.27175,-7.29361],[-78.21621,-7.29654],[-78.23956,-7.20654],[-78.18369,-7.14915],[-78.05653,-7.13479],[-78.01595,-7.0968],[-77.95115,-7.06461],[-77.92269,-7.15746],[-77.83105,-7.31003],[-77.8296,-7.34764],[-77.8831,-7.36419],[-77.94255,-7.34566],[-77.98263,-7.38746],[-78.01332,-7.46216],[-78.08497,-7.45431],[-78.13175,-7.48031],[-78.17438,-7.45727],[-78.21984,-7.38762],[-78.27738,-7.37345]]]}};
const cajamarca = {"type":"Feature","properties":{"COUNT":12,"FIRST_IDPR":"0601","NOMBPROV":"CAJAMARCA","FIRST_NOMB":"CAJAMARCA","LAST_DCTO":"LEY","LAST_LEY":"S/N","FIRST_FECH":"14/12/1870","LAST_FECHA":"02/01/1857","MIN_SHAPE_":298330.882677,"ha":298330.88},"geometry":{"type":"Polygon","coordinates":[[[-78.45348,-6.83419],[-78.42664,-6.93116],[-78.38619,-6.9258],[-78.34051,-6.95418],[-78.29145,-7.02327],[-78.21946,-7.07158],[-78.18369,-7.14915],[-78.23956,-7.20654],[-78.21621,-7.29654],[-78.27175,-7.29361],[-78.3073,-7.33362],[-78.27738,-7.37345],[-78.34367,-7.41738],[-78.33583,-7.49525],[-78.41563,-7.48507],[-78.49139,-7.55487],[-78.62457,-7.54856],[-78.6496,-7.52902],[-78.62984,-7.4455],[-78.69623,-7.41336],[-78.66541,-7.37901],[-78.62165,-7.28536],[-78.64985,-7.25563],[-78.74599,-7.21933],[-78.72,-7.17082],[-78.66171,-7.10299],[-78.62368,-7.01066],[-78.60498,-6.99725],[-78.61351,-6.92073],[-78.60138,-6.86763],[-78.53096,-6.79937],[-78.46596,-6.80684],[-78.45348,-6.83419]]]}};
const laLibertad = {"type":"Feature","properties":{"NOMBDEP":"LA LIBERTAD","COUNT":83,"FIRST_IDDP":"13","HECTARES":2529596.876},"geometry":{"type":"Polygon","coordinates":[[[-78.64492386278206,-8.969228476981794],[-78.65166211278796,-8.914355476930648],[-78.76115823788716,-8.773956976798964],[-78.73738286286519,-8.71208410174162],[-78.74382611287052,-8.63383010166871],[-78.7780078629011,-8.569412101608421],[-78.93488473804013,-8.436324226482727],[-78.89636523800559,-8.378925726429792],[-78.95755273805871,-8.293523476349538],[-78.9860878630828,-8.212361351273602],[-79.11556636319231,-8.096662101163934],[-79.11919923819508,-8.0724941011414],[-79.30729098834613,-7.925970726001308],[-79.3757461133976,-7.84209760092164],[-79.39242573840916,-7.787808600870753],[-79.46570698846168,-7.711933600798175],[-79.43528911343915,-7.693359350781793],[-79.44909336344828,-7.647075225738384],[-79.54087648851015,-7.52125610061869],[-79.58847661353931,-7.414097600517569],[-79.56953898852619,-7.389988225495791],[-79.60980073854921,-7.266587850379788],[-79.69062111359632,-7.177126975293759],[-79.49638698846724,-6.971710850109365],[-79.45500536343809,-6.946313600086884],[-79.40076173839965,-6.956927725098115],[-79.32258598834301,-7.025683600163807],[-79.3053012383318,-7.147146225277148],[-79.26727498830316,-7.192393725320008],[-79.28262698831634,-7.275060600396576],[-79.34713098836674,-7.336636600452389],[-79.29311861332556,-7.347260725463492],[-79.25633411329738,-7.381863725496412],[-79.18817523824326,-7.395412975510331],[-79.15272398821503,-7.439820100552244],[-79.06542811314307,-7.472708600584261],[-79.04123248812398,-7.599887475702938],[-78.99214873808276,-7.660949350760457],[-78.9608597380558,-7.657832600757959],[-78.94434373804101,-7.598417975702858],[-78.8959083629984,-7.537437350646702],[-78.88668511298995,-7.484101600597149],[-78.84161936295011,-7.437617350554367],[-78.76012498787775,-7.401984350521967],[-78.66246661279023,-7.412997850532985],[-78.62984273776088,-7.445499975563473],[-78.64959561277914,-7.529017100641082],[-78.62457223775658,-7.548558600659431],[-78.49139261263497,-7.554873100666126],[-78.415632862565,-7.485070350601496],[-78.35998436251361,-7.500394475616002],[-78.35679223751083,-7.574006100684548],[-78.38281923753507,-7.630107100736669],[-78.33013886248642,-7.69962822580165],[-78.302802737461,-7.696462725798789],[-78.27242136243285,-7.753517850852027],[-78.22465311238835,-7.759331475857596],[-78.11605336228669,-7.654007350759825],[-78.08122111225416,-7.696168850799141],[-77.9986422371767,-7.679073975783405],[-77.87043748705628,-7.585330100696316],[-77.84416798703154,-7.514380850630297],[-77.74137161193495,-7.466694725585996],[-77.77198648696368,-7.418458225541034],[-77.8134449870026,-7.392539850516848],[-77.83105023701911,-7.310030975440013],[-77.88090498706586,-7.221387100357384],[-77.89786898708171,-7.166807225306547],[-77.99950648717684,-6.970531600123599],[-77.92752798710941,-6.986709225138778],[-77.88034173706515,-6.962503850116303],[-77.84586473703281,-6.976398100129279],[-77.75893361195118,-6.964507850118296],[-77.71337861190848,-7.107887100251869],[-77.64353448684288,-7.149000600290216],[-77.6055302368072,-7.21916185035557],[-77.64674586184593,-7.240740100375643],[-77.62864598682894,-7.320024225449508],[-77.6357093618356,-7.35744610048435],[-77.61027086181173,-7.434858350556446],[-77.52691773673341,-7.504839350621698],[-77.5367046117426,-7.582280975693791],[-77.48452886169362,-7.699714475803203],[-77.52777661173428,-7.757582975857067],[-77.47983361168922,-7.803291600899668],[-77.44286111165448,-7.813641725909332],[-77.4067833616206,-7.902493100992062],[-77.37690923659255,-7.90882135099799],[-77.40712961162095,-7.991985601075431],[-77.3854726116006,-8.055386726134477],[-77.29225573651307,-8.060089351138894],[-77.23828911146242,-8.013324226095355],[-77.15053511138012,-8.032042976112805],[-77.11832411134992,-8.025244101106484],[-77.01956248625739,-8.052687476132075],[-76.98672336122665,-8.11122522618659],[-76.90699798615199,-8.170735601242024],[-76.92559673616941,-8.21849735128651],[-76.90124323614663,-8.283466351347007],[-76.91374523615833,-8.326089851386698],[-76.97648148621707,-8.395943726451758],[-77.08548048631914,-8.406222601461307],[-77.1338437363645,-8.440021476492761],[-77.20421286143048,-8.48569135153528],[-77.26407811148667,-8.467531226518368],[-77.31748636153681,-8.53015235157666],[-77.40033773661465,-8.48196685153173],[-77.43889623665086,-8.419862351473908],[-77.45889636166964,-8.335655976395476],[-77.55721673676204,-8.193732476263232],[-77.60568748680761,-8.154810601226943],[-77.63652023683662,-8.106191976181647],[-77.64711136184657,-8.05028122612956],[-77.71942973691459,-8.073445351151054],[-77.8104413620002,-8.067734976145642],[-77.89790423708247,-8.076015601153246],[-77.93321286211575,-8.197009726265852],[-78.01863473719604,-8.224316476291124],[-78.11594998728752,-8.310099976370768],[-78.13749798730781,-8.368667976425256],[-78.13946873730977,-8.427831976480325],[-78.17365623734196,-8.50353710155071],[-78.21687873738257,-8.556917976600289],[-78.19352536236076,-8.60011135164059],[-78.24613486241017,-8.65836322669465],[-78.35481048751181,-8.67327935170808],[-78.44822836259907,-8.736926726766884],[-78.518138737664,-8.752980601781411],[-78.56534311270782,-8.792598976817976],[-78.5882811127293,-8.85867747687933],[-78.59166248773285,-8.945999226960573],[-78.64492386278206,-8.969228476981794]]]}};

const provinceFeatures = [sanMiguel, contumaza, sanPablo, celendin, cajabamba, sanMarcos, cajamarca];
const jurisdictionFeatures = [laLibertad, ...provinceFeatures];

let jurisdictionLayer = null;
let jurisdictionVisible = true;

const jurisdictionStyles = {
  laLibertad: {
    color: "#f97316",
    weight: 3,
    fillColor: "#fdba74",
    fillOpacity: 0.22
  },
  cajamarca: {
    color: "#2563eb",
    weight: 2,
    fillColor: "#93c5fd",
    fillOpacity: 0.18
  }
};

function addJurisdictionLayer() {
  if (jurisdictionLayer) {
    jurisdictionLayer.addTo(map);
    jurisdictionVisible = true;
    return;
  }

  jurisdictionLayer = L.layerGroup().addTo(map);

  L.geoJSON(laLibertad, {
    style: jurisdictionStyles.laLibertad,
    onEachFeature: (feature, layer) => {
      layer.bindPopup("<strong>Jurisdicción:</strong><br>Departamento La Libertad");
    }
  }).addTo(jurisdictionLayer);

  provinceFeatures.forEach(feature => {
    L.geoJSON(feature, {
      style: jurisdictionStyles.cajamarca,
      onEachFeature: (ft, layer) => {
        const name = ft.properties.NOMBPROV || "Provincia";
        layer.bindPopup(`<strong>Jurisdicción:</strong><br>Provincia ${name} - Cajamarca`);
      }
    }).addTo(jurisdictionLayer);
  });

  jurisdictionVisible = true;
}

function toggleJurisdictionLayer() {
  if (!jurisdictionLayer) {
    addJurisdictionLayer();
    return;
  }

  if (jurisdictionVisible) {
    map.removeLayer(jurisdictionLayer);
    jurisdictionVisible = false;
    showMessage("Capa de jurisdicción oculta.");
  } else {
    jurisdictionLayer.addTo(map);
    jurisdictionVisible = true;
    showMessage("Capa de jurisdicción visible.");
  }
}

function fitToJurisdiction() {
  const bounds = L.geoJSON(jurisdictionFeatures).getBounds();
  map.fitBounds(bounds, { padding: [35, 35] });
}

function getJurisdictionName(point) {
  if (!validCoords(point)) return "Sin coordenadas";

  const pt = turf.point([Number(point.lng), Number(point.lat)]);

  if (turf.booleanPointInPolygon(pt, laLibertad)) {
    return "Dentro: La Libertad";
  }

  for (const feature of provinceFeatures) {
    if (turf.booleanPointInPolygon(pt, feature)) {
      return `Dentro: ${feature.properties.NOMBPROV} - Cajamarca`;
    }
  }

  return "Fuera de jurisdicción";
}

function isInsideJurisdiction(point) {
  return getJurisdictionName(point).startsWith("Dentro:");
}


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
  safeOn(els.reset, "click", fitToJurisdiction);
  safeOn(els.jurisdiction, "click", toggleJurisdictionLayer);
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
      point.texto,
      getJurisdictionName(point)
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
  const dentro = currentFiltered.filter(p => isInsideJurisdiction(p)).length;

  els.stats.innerHTML = `
    <div class="stat"><strong>${total}</strong><span>Total</span></div>
    <div class="stat"><strong>${pendientes}</strong><span>Sin visitar</span></div>
    <div class="stat"><strong>${dentro}</strong><span>En jurisdicción</span></div>
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
      <p><strong>Jurisdicción:</strong> ${escapeHtml(getJurisdictionName(point))}</p>
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
      <span class="badge jurisdiction ${isInsideJurisdiction(point) ? "inside" : "outside"}">${escapeHtml(getJurisdictionName(point))}</span>
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

