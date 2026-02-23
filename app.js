const RAIN_MAPS_URL = "https://api.rainviewer.com/public/weather-maps.json";

const REGIONS = {
  world: { label: "World", bounds: [[-60, -180], [80, 180]] },
  japan: { label: "Japan", bounds: [[24, 122], [46, 154]] },
  east_asia: { label: "East Asia", bounds: [[15, 95], [55, 150]] },
  europe: { label: "Europe", bounds: [[34, -12], [72, 40]] },
  north_america: { label: "North America", bounds: [[5, -170], [75, -50]] },
  south_america: { label: "South America", bounds: [[-57, -88], [13, -32]] },
  africa: { label: "Africa", bounds: [[-36, -20], [38, 55]] },
  oceania: { label: "Oceania", bounds: [[-50, 110], [5, 180]] }
};

const regionSelect = document.getElementById("regionSelect");
const refreshBtn = document.getElementById("refreshBtn");
const statusEl = document.getElementById("status");
const updatedAtEl = document.getElementById("updatedAt");

const map = L.map("map", {
  zoomControl: true,
  minZoom: 2,
  worldCopyJump: true,
  preferCanvas: true
});

const imageryLayer = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: "Tiles &copy; Esri"
  }
).addTo(map);

const labelLayer = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png",
  {
    subdomains: "abcd",
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
    pane: "overlayPane"
  }
).addTo(map);

let rainLayer = null;
let latestTimestamp = null;

function formatDate(date) {
  try {
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).format(date);
  } catch {
    return date.toLocaleString("ja-JP");
  }
}

function fitSelectedRegion() {
  const key = regionSelect.value in REGIONS ? regionSelect.value : "world";
  const region = REGIONS[key];
  map.fitBounds(region.bounds, {
    padding: [16, 16],
    animate: true
  });

  if (latestTimestamp) {
    statusEl.textContent = `表示中: ${region.label} の降雨`;
    updatedAtEl.textContent = `Radar time: ${formatDate(latestTimestamp)} | Source: RainViewer`;
  }
}

async function fetchLatestFrame() {
  const resp = await fetch(RAIN_MAPS_URL, { cache: "no-store" });
  if (!resp.ok) throw new Error("Rain metadata request failed");

  const json = await resp.json();
  const frames = json.radar && json.radar.past ? json.radar.past : [];
  if (frames.length === 0) throw new Error("No radar frames available");

  const latest = frames[frames.length - 1];
  const host = json.host || "https://tilecache.rainviewer.com";

  return {
    tileUrl: `${host}${latest.path}/256/{z}/{x}/{y}/2/1_1.png`,
    timestamp: new Date(latest.time * 1000)
  };
}

async function refreshRainLayer() {
  statusEl.textContent = "Loading rainfall layer...";

  const latest = await fetchLatestFrame();

  if (rainLayer) {
    map.removeLayer(rainLayer);
  }

  rainLayer = L.tileLayer(latest.tileUrl, {
    tileSize: 256,
    opacity: 0.58,
    zIndex: 400,
    attribution: "Rain data &copy; RainViewer"
  }).addTo(map);

  latestTimestamp = latest.timestamp;
  fitSelectedRegion();
}

async function refresh() {
  try {
    refreshBtn.disabled = true;
    await refreshRainLayer();
  } catch (error) {
    statusEl.textContent = `Error: ${error.message}`;
    updatedAtEl.textContent = "ネットワーク接続またはCORS設定を確認してください。";
  } finally {
    refreshBtn.disabled = false;
  }
}

regionSelect.addEventListener("change", fitSelectedRegion);
refreshBtn.addEventListener("click", refresh);

fitSelectedRegion();
refresh();
setInterval(refresh, 10 * 60 * 1000);
