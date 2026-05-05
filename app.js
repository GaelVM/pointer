
const map = L.map('map').setView([-7.5, -78.8], 7);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

fetch('data.json')
.then(r=>r.json())
.then(data=>{
    data.forEach(p=>{
        const color = p.estado==="visitada" ? "green" : "orange";
        const marker = L.circleMarker([p.lat,p.lng],{
            color:color,
            radius:8
        }).addTo(map);

        marker.bindPopup(p.nombre + "<br>" + p.lat + "," + p.lng);
    });
});

const locateBtn = document.getElementById("locateBtn");

if(locateBtn){
locateBtn.addEventListener("click", ()=>{
    if(!navigator.geolocation){
        alert("No soporta ubicación");
        return;
    }

    navigator.geolocation.getCurrentPosition(pos=>{
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        L.marker([lat,lng]).addTo(map)
        .bindPopup("Tu ubicación").openPopup();

        map.setView([lat,lng],13);
    });
});
}



