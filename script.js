
let map, ship, polyline;
let route = routeCoordinates;
let speed = 12;
let paused = false;
let interval = null;
let currentIndex = 0;
let direction = 'forward';

map = L.map('map');
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const shipIcon = L.icon({
  iconUrl: 'ship.png',
  iconSize: [40, 40]
});

ship = L.marker(routeCoordinates[0], { icon: shipIcon, zIndexOffset: 1000 }).addTo(map).bindPopup("<img src='ship.png' width='200'>");
polyline = L.polyline(routeCoordinates, { color: 'blue' }).addTo(map);

map.fitBounds(polyline.getBounds());

function setSpeed(mode) {
  speed = mode === 'slow' ? 9 : mode === 'fast' ? 15 : 12;
  updateDistanceInfo();
}

function startRoute(dir) {
  clearInterval(interval);
  direction = dir;
  paused = false;
  currentIndex = 0;

  route = direction === 'forward' ? routeCoordinates : [...routeCoordinates].reverse();
  ship.setLatLng(route[0]);
  updateDistanceInfo();
  runShip();
}

function runShip() {
  interval = setInterval(() => {
    if (paused) return;
    if (currentIndex >= route.length) {
      clearInterval(interval);
      return;
    }
    ship.setLatLng(route[currentIndex]);
    currentIndex++;
  }, 1000 * (12 / speed));
}

function pauseShip() {
  paused = true;
}

function resumeShip() {
  paused = false;
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = angle => angle * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function updateDistanceInfo() {
  let distance = 0;
  for (let i = 0; i < routeCoordinates.length - 1; i++) {
    const [lat1, lon1] = routeCoordinates[i];
    const [lat2, lon2] = routeCoordinates[i + 1];
    distance += haversine(lat1, lon1, lat2, lon2);
  }
  const days = distance / (speed * 24 * 1.852);
  document.getElementById("infoBar").innerText =
    `Total Distance: ${distance.toFixed(0)} km — Estimated Voyage Time: ${days.toFixed(1)} days @ ${speed} Knots`;
}

// Add flag markers
flagMarkers.forEach(flag => {
  L.marker([flag.lat, flag.lng], {
    icon: L.icon({
      iconUrl: 'flag/' + flag.file,
      iconSize: [17, 11]
    }),
    title: flag.country
  }).addTo(map).bindTooltip(flag.country, {
    permanent: false,
    direction: "top",
    offset: [0, -6]
  });
});
