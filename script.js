/* ==========================================================
   Weather Pro — App Logic
   Real OpenWeatherMap integration (current + forecast + AQI)
   with a deterministic offline demo mode fallback.
   ========================================================== */

// ─── CONFIG ────────────────────────────────────────────────
const OWM_BASE = "https://api.openweathermap.org/data/2.5";
let unit = localStorage.getItem("unit") || "metric"; // metric = °C, imperial = °F
let lastCityData = null; // cached result, reused for unit toggling
let tempChartInstance = null;

function getApiKey() {
  return localStorage.getItem("owm_api_key") || "";
}

function isDemoMode() {
  return !getApiKey();
}

// ─── DEMO / MOCK DATA ──────────────────────────────────────
// Used automatically when no API key is set, so the app is fully
// functional and demoable without any signup or internet dependency.
const DEMO_CONDITIONS = [
  { description: "clear sky", icon: "01d", emoji: "☀️" },
  { description: "scattered clouds", icon: "03d", emoji: "⛅" },
  { description: "light rain", icon: "10d", emoji: "🌧️" },
  { description: "thunderstorm", icon: "11d", emoji: "⛈️" },
  { description: "light snow", icon: "13d", emoji: "❄️" },
  { description: "misty", icon: "50d", emoji: "🌫️" }
];

function hashCity(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function buildDemoData(city) {
  const key = city.toLowerCase().trim();
  const h = hashCity(key);
  const cond = DEMO_CONDITIONS[h % DEMO_CONDITIONS.length];
  const baseTemp = 10 + (h % 25); // 10–34 °C, deterministic per city name

  const forecast = Array.from({ length: 5 }, (_, i) => {
    const fh = hashCity(key + "d" + i);
    const c = DEMO_CONDITIONS[fh % DEMO_CONDITIONS.length];
    const day = new Date();
    day.setDate(day.getDate() + i + 1);
    return {
      day: day.toLocaleDateString("en-US", { weekday: "short" }),
      tempC: baseTemp + ((fh % 7) - 3),
      emoji: c.emoji,
      description: c.description
    };
  });

  const hourly = Array.from({ length: 8 }, (_, i) => {
    const fh = hashCity(key + "h" + i);
    const c = DEMO_CONDITIONS[fh % DEMO_CONDITIONS.length];
    const t = new Date();
    t.setHours(t.getHours() + i + 1, 0, 0, 0);
    return {
      label: t.getHours() === 0 ? "12am" : t.getHours() <= 12 ? `${t.getHours()}am` : `${t.getHours() - 12}pm`,
      tempC: baseTemp + ((fh % 5) - 2),
      emoji: c.emoji
    };
  });

  const sunriseH = 5 + (h % 2);
  const sunsetH = 18 + (h % 2);

  return {
    city: city.replace(/\b\w/g, c => c.toUpperCase()),
    tempC: baseTemp,
    feelsLikeC: baseTemp - 1 + (h % 3),
    tempMaxC: baseTemp + 3 + (h % 3),
    tempMinC: baseTemp - 4 - (h % 3),
    humidity: 40 + (h % 50),
    windSpeed: (h % 20) + 1,
    pressure: 1000 + (h % 30),
    visibility: 6 + (h % 5),
    description: cond.description,
    emoji: cond.emoji,
    sunrise: `${String(sunriseH).padStart(2, "0")}:${String((h % 6) * 10).padStart(2, "0")}`,
    sunset: `${String(sunsetH).padStart(2, "0")}:${String((h % 6) * 10).padStart(2, "0")}`,
    aqi: 1 + (h % 5),
    forecast,
    hourly,
    isDemo: true
  };
}

// ─── REAL API FETCH ────────────────────────────────────────
async function fetchRealWeather(cityOrCoords) {
  const key = getApiKey();
  const isCoords = typeof cityOrCoords === "object";
  const locParam = isCoords
    ? `lat=${cityOrCoords.lat}&lon=${cityOrCoords.lon}`
    : `q=${encodeURIComponent(cityOrCoords)}`;

  const currentRes = await fetch(`${OWM_BASE}/weather?${locParam}&units=metric&appid=${key}`);
  if (!currentRes.ok) {
    if (currentRes.status === 401) throw new Error("Invalid API key");
    if (currentRes.status === 404) throw new Error("City not found");
    throw new Error("Weather service unavailable");
  }
  const current = await currentRes.json();

  const forecastRes = await fetch(`${OWM_BASE}/forecast?${locParam}&units=metric&appid=${key}`);
  const forecastData = forecastRes.ok ? await forecastRes.json() : null;

  let forecast = [];
  let hourly = [];
  if (forecastData && forecastData.list) {
    hourly = forecastData.list.slice(0, 8).map(entry => ({
      label: new Date(entry.dt * 1000).toLocaleTimeString("en-US", { hour: "numeric" }).replace(" ", "").toLowerCase(),
      tempC: Math.round(entry.main.temp),
      emoji: iconToEmoji(entry.weather[0].icon)
    }));

    const daily = forecastData.list.filter((_, i) => i % 8 === 4).slice(0, 5);
    forecast = daily.map(entry => ({
      day: new Date(entry.dt * 1000).toLocaleDateString("en-US", { weekday: "short" }),
      tempC: Math.round(entry.main.temp),
      emoji: iconToEmoji(entry.weather[0].icon),
      description: entry.weather[0].description
    }));
  }

  let aqi = null;
  try {
    const aqiRes = await fetch(`${OWM_BASE}/air_pollution?lat=${current.coord.lat}&lon=${current.coord.lon}&appid=${key}`);
    if (aqiRes.ok) {
      const aqiData = await aqiRes.json();
      aqi = aqiData.list?.[0]?.main?.aqi || null;
    }
  } catch (_) { /* AQI is a nice-to-have, fail silently */ }

  return {
    city: `${current.name}${current.sys?.country ? ", " + current.sys.country : ""}`,
    tempC: Math.round(current.main.temp),
    feelsLikeC: Math.round(current.main.feels_like),
    tempMaxC: Math.round(current.main.temp_max),
    tempMinC: Math.round(current.main.temp_min),
    humidity: current.main.humidity,
    windSpeed: Math.round(current.wind.speed),
    pressure: current.main.pressure,
    visibility: current.visibility ? Math.round(current.visibility / 1000) : null,
    description: current.weather[0].description,
    emoji: iconToEmoji(current.weather[0].icon),
    sunrise: formatUnixTime(current.sys.sunrise, current.timezone),
    sunset: formatUnixTime(current.sys.sunset, current.timezone),
    aqi,
    forecast,
    hourly,
    isDemo: false
  };
}

function formatUnixTime(unixSeconds, tzOffsetSeconds) {
  const d = new Date((unixSeconds + (tzOffsetSeconds || 0)) * 1000);
  return d.toUTCString().slice(17, 22);
}

function iconToEmoji(icon) {
  const map = {
    "01": "☀️", "02": "🌤️", "03": "⛅", "04": "☁️",
    "09": "🌧️", "10": "🌦️", "11": "⛈️", "13": "❄️", "50": "🌫️"
  };
  return map[icon.slice(0, 2)] || "🌤️";
}

const AQI_LABELS = {
  1: { text: "Good", color: "#7ed957" },
  2: { text: "Fair", color: "#c7e35a" },
  3: { text: "Moderate", color: "#f5c542" },
  4: { text: "Poor", color: "#f08a3c" },
  5: { text: "Very Poor", color: "#e25555" }
};

// ─── UNIT CONVERSION ───────────────────────────────────────
function toDisplayTemp(celsius) {
  if (unit === "imperial") return Math.round(celsius * 9 / 5 + 32);
  return Math.round(celsius);
}

function unitSymbol() {
  return unit === "imperial" ? "F" : "C";
}

// ─── CORE: updateWeather ───────────────────────────────────
async function updateWeather(cityOrCoords) {
  const isCoords = typeof cityOrCoords === "object" && cityOrCoords !== null;
  if (!isCoords) {
    cityOrCoords = (cityOrCoords || "").trim();
    if (!cityOrCoords) {
      showNotification("Please enter a city name");
      return;
    }
  }

  showLoader();

  try {
    const data = isDemoMode()
      ? buildDemoData(isCoords ? "Your Location" : cityOrCoords)
      : await fetchRealWeather(cityOrCoords);

    lastCityData = data;
    renderWeather(data);
    applySkyEffects(data);
    renderChart(data);
    showNotification((data.isDemo ? "Demo data for " : "Weather updated for ") + data.city);
  } catch (err) {
    showNotification(err.message || "Could not fetch weather");
  } finally {
    hideLoader();
  }
}

function renderWeather(data) {
  document.getElementById("cityName").textContent = data.city;
  document.getElementById("heroDate").textContent =
    new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  document.getElementById("weatherIcon").textContent = data.emoji;
  document.getElementById("temperature").textContent = `${toDisplayTemp(data.tempC)}°`;
  document.getElementById("description").textContent =
    data.description.charAt(0).toUpperCase() + data.description.slice(1) +
    (data.isDemo ? " · demo data" : "");
  document.getElementById("tempHigh").textContent = `H: ${toDisplayTemp(data.tempMaxC)}°`;
  document.getElementById("tempLow").textContent = `L: ${toDisplayTemp(data.tempMinC)}°`;

  document.getElementById("weatherDetails").innerHTML = `
    <div class="metric-tile">
      <span class="metric-icon">🌡️</span>
      <div class="metric-value">${toDisplayTemp(data.feelsLikeC)}°${unitSymbol()}</div>
      <div class="metric-label">Feels like</div>
    </div>
    <div class="metric-tile">
      <span class="metric-icon">💧</span>
      <div class="metric-value">${data.humidity}%</div>
      <div class="metric-label">Humidity</div>
    </div>
    <div class="metric-tile">
      <span class="metric-icon">💨</span>
      <div class="metric-value">${data.windSpeed} ${unit === "imperial" ? "mph" : "m/s"}</div>
      <div class="metric-label">Wind</div>
    </div>
    <div class="metric-tile">
      <span class="metric-icon">🧭</span>
      <div class="metric-value">${data.pressure}</div>
      <div class="metric-label">hPa</div>
    </div>
  `;

  const aqi = AQI_LABELS[data.aqi] || null;
  document.getElementById("sunAqiRow").innerHTML = `
    <div class="info-card">
      <div class="info-title">Sun</div>
      <div class="sun-times">
        <span>🌅 ${data.sunrise}</span>
        <span>🌇 ${data.sunset}</span>
      </div>
    </div>
    <div class="info-card">
      <div class="info-title">Air quality</div>
      ${aqi ? `
        <div class="aqi-value">
          <span class="aqi-number">${data.aqi}</span>
          <span class="aqi-tag" style="background:${aqi.color}22;color:${aqi.color}">${aqi.text}</span>
        </div>
      ` : `<span class="empty-hint">Not available</span>`}
    </div>
  `;

  document.getElementById("hourly").innerHTML = data.hourly.map(h => `
    <div class="hourly-card">
      <div class="h-time">${h.label}</div>
      <div class="h-icon">${h.emoji}</div>
      <div class="h-temp">${toDisplayTemp(h.tempC)}°</div>
    </div>
  `).join("");

  document.getElementById("forecast").innerHTML = data.forecast.map(f => `
    <div class="forecast-card">
      <div class="f-day">${f.day}</div>
      <div class="f-icon">${f.emoji}</div>
      <div class="f-temp">${toDisplayTemp(f.tempC)}°${unitSymbol()}</div>
    </div>
  `).join("");
}

// ─── SKY / WEATHER EFFECTS ─────────────────────────────────
function applySkyEffects(data) {
  const sun = document.getElementById("sun");
  const moon = document.getElementById("moon");
  const stars = document.getElementById("stars");
  const rain = document.getElementById("rain");
  const lightning = document.getElementById("lightning");
  const rainbow = document.getElementById("rainbow");

  // Respect a manual theme override if the user has set one; otherwise
  // infer day/night from local time.
  const manual = localStorage.getItem("manualTheme");
  const hour = new Date().getHours();
  const isNight = manual ? manual === "night" : (hour < 6 || hour >= 19);

  document.body.classList.toggle("night", isNight);
  document.getElementById("themeToggle").textContent = isNight ? "☀️" : "🌙";
  sun.style.opacity = isNight ? 0 : 1;
  moon.style.opacity = isNight ? 1 : 0;
  stars.style.opacity = isNight ? 1 : 0;

  if (isNight) {
    populateStars();
    startShootingStars();
  } else {
    stopShootingStars();
  }

  const condition = data.description.toLowerCase();
  const isRain = condition.includes("rain") || condition.includes("drizzle");
  const isStorm = condition.includes("thunder");

  rain.classList.toggle("active", isRain || isStorm);
  rain.style.opacity = isRain || isStorm ? 1 : 0;
  lightning.classList.toggle("active", isStorm);

  rainbow.style.opacity = 0;
  if (isRain && Math.random() > 0.6) {
    setTimeout(() => { rainbow.style.opacity = 0.5; }, 1500);
    setTimeout(() => { rainbow.style.opacity = 0; }, 6000);
  }
}

function populateStars() {
  const container = document.getElementById("stars");
  if (container.dataset.populated) return;
  container.dataset.populated = "true";
  for (let i = 0; i < 60; i++) {
    const star = document.createElement("div");
    star.className = "star";
    star.style.top = Math.random() * 100 + "vh";
    star.style.left = Math.random() * 100 + "vw";
    star.style.animationDelay = Math.random() * 2 + "s";
    container.appendChild(star);
  }
}

// ─── CHART ─────────────────────────────────────────────────
function renderChart(data) {
  const ctx = document.getElementById("tempChart");
  if (!ctx || typeof Chart === "undefined") return;

  const labels = ["Now", ...data.forecast.map(f => f.day)];
  const temps = [toDisplayTemp(data.tempC), ...data.forecast.map(f => toDisplayTemp(f.tempC))];

  if (tempChartInstance) tempChartInstance.destroy();

  tempChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: `Temperature (°${unitSymbol()})`,
        data: temps,
        borderColor: "#f5a623",
        backgroundColor: "rgba(245,166,35,0.18)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#fff",
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: "#eef1f8", font: { family: "Inter" } } } },
      scales: {
        x: { ticks: { color: "#eef1f8" }, grid: { color: "rgba(255,255,255,0.08)" } },
        y: { ticks: { color: "#eef1f8" }, grid: { color: "rgba(255,255,255,0.08)" } }
      }
    }
  });
}

// ─── SEARCH / VOICE / GEOLOCATION ──────────────────────────
function handleSearch() {
  const city = document.getElementById("cityInput").value;
  updateWeather(city);
  if (city.trim()) addToHistory(city.trim());
}

function startVoiceSearch() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showNotification("Voice recognition not supported in this browser");
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.start();

  recognition.onresult = function (event) {
    const city = event.results[0][0].transcript;
    document.getElementById("cityInput").value = city;
    updateWeather(city);
    addToHistory(city);
  };

  recognition.onerror = function () {
    showNotification("Voice recognition failed — try again");
  };
}

function useMyLocation() {
  if (!navigator.geolocation) {
    showNotification("Geolocation not supported in this browser");
    return;
  }
  showLoader();
  navigator.geolocation.getCurrentPosition(
    pos => updateWeather({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
    () => {
      hideLoader();
      showNotification("Location access denied");
    },
    { timeout: 8000 }
  );
}

// ─── LOADER ────────────────────────────────────────────────
function showLoader() {
  document.getElementById("loader").style.display = "block";
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

// ─── NOTIFICATIONS ─────────────────────────────────────────
let notificationTimeout;
function showNotification(message) {
  const note = document.getElementById("notification");
  note.textContent = message;
  note.classList.add("show");
  clearTimeout(notificationTimeout);
  notificationTimeout = setTimeout(() => note.classList.remove("show"), 3000);
}

// ─── SHOOTING STARS ────────────────────────────────────────
let shootingInterval;

function startShootingStars() {
  const container = document.getElementById("shootingStars");
  if (!container || shootingInterval) return;

  shootingInterval = setInterval(() => {
    const star = document.createElement("div");
    star.className = "shooting-star";
    star.style.top = Math.random() * 50 + "vh";
    star.style.left = Math.random() * 100 + "vw";
    container.appendChild(star);
    setTimeout(() => star.remove(), 2000);
  }, 3000);
}

function stopShootingStars() {
  if (shootingInterval) {
    clearInterval(shootingInterval);
    shootingInterval = null;
  }
}

// ─── FAVORITES ─────────────────────────────────────────────
function addFavorite() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) {
    showNotification("Type a city name first");
    return;
  }
  let favs = JSON.parse(localStorage.getItem("favorites")) || [];
  if (!favs.includes(city)) {
    favs.push(city);
    localStorage.setItem("favorites", JSON.stringify(favs));
    showNotification(city + " added to favorites");
  } else {
    showNotification(city + " is already a favorite");
  }
  renderFavorites();
}

function renderFavorites() {
  const container = document.getElementById("favList");
  if (!container) return;
  let favs = JSON.parse(localStorage.getItem("favorites")) || [];
  container.innerHTML = favs.length ? "" : '<span class="empty-hint">None yet</span>';

  favs.forEach(city => {
    const div = document.createElement("div");
    div.className = "fav-item";
    div.innerText = city;
    div.onclick = () => updateWeather(city);
    container.appendChild(div);
  });
}

function clearFavorites() {
  localStorage.removeItem("favorites");
  renderFavorites();
  showNotification("Favorites cleared");
}

// ─── SEARCH HISTORY ────────────────────────────────────────
function addToHistory(city) {
  let history = JSON.parse(localStorage.getItem("history")) || [];
  history = history.filter(c => c !== city);
  history.unshift(city);
  history = history.slice(0, 5);
  localStorage.setItem("history", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const container = document.getElementById("historyList");
  if (!container) return;
  let history = JSON.parse(localStorage.getItem("history")) || [];
  container.innerHTML = history.length ? "" : '<span class="empty-hint">None yet</span>';

  history.forEach(city => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerText = city;
    div.onclick = () => updateWeather(city);
    container.appendChild(div);
  });
}

function clearHistory() {
  localStorage.removeItem("history");
  renderHistory();
  showNotification("History cleared");
}

// ─── THEME TOGGLE ──────────────────────────────────────────
function toggleTheme() {
  const isNight = document.body.classList.toggle("night");
  document.getElementById("themeToggle").textContent = isNight ? "☀️" : "🌙";
  localStorage.setItem("manualTheme", isNight ? "night" : "day");
}

// ─── UNIT TOGGLE ───────────────────────────────────────────
function toggleUnit() {
  unit = unit === "metric" ? "imperial" : "metric";
  localStorage.setItem("unit", unit);
  document.getElementById("unitToggle").textContent = unit === "metric" ? "°C" : "°F";
  if (lastCityData) {
    renderWeather(lastCityData);
    renderChart(lastCityData);
  }
}

// ─── API KEY SETTINGS ──────────────────────────────────────
function saveApiKey() {
  const key = document.getElementById("apiKeyInput").value.trim();
  if (!key) {
    showNotification("Enter a valid API key");
    return;
  }
  localStorage.setItem("owm_api_key", key);
  updateApiModeLabel();
  showNotification("API key saved — live data enabled");
}

function removeApiKey() {
  localStorage.removeItem("owm_api_key");
  document.getElementById("apiKeyInput").value = "";
  updateApiModeLabel();
  showNotification("API key removed — using demo data");
}

function updateApiModeLabel() {
  const label = document.getElementById("apiModeLabel");
  if (label) label.textContent = isDemoMode() ? "Demo Data" : "Live Data";
  const keyInput = document.getElementById("apiKeyInput");
  if (keyInput && getApiKey()) keyInput.value = getApiKey();
}

// ─── LIVE CLOCK ────────────────────────────────────────────
function tickClock() {
  const el = document.getElementById("liveClock");
  if (!el) return;
  el.textContent = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

// ─── INIT ──────────────────────────────────────────────────
window.addEventListener("load", () => {
  renderFavorites();
  renderHistory();
  updateApiModeLabel();

  document.getElementById("unitToggle").textContent = unit === "metric" ? "°C" : "°F";

  document.getElementById("themeToggle").addEventListener("click", toggleTheme);
  document.getElementById("unitToggle").addEventListener("click", toggleUnit);

  document.getElementById("apiSettingsToggle").addEventListener("click", () => {
    const panel = document.getElementById("apiSettingsPanel");
    const about = document.getElementById("aboutPanel");
    about.hidden = true;
    panel.hidden = !panel.hidden;
  });

  document.getElementById("aboutToggle").addEventListener("click", () => {
    const panel = document.getElementById("aboutPanel");
    const settings = document.getElementById("apiSettingsPanel");
    settings.hidden = true;
    panel.hidden = !panel.hidden;
  });

  document.getElementById("cityInput").addEventListener("keydown", e => {
    if (e.key === "Enter") handleSearch();
  });

  tickClock();
  setInterval(tickClock, 30000);

  // Show a default city on first load so the app never looks empty
  updateWeather("London");

  // Register service worker for offline support
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Offline support unavailable (e.g. file:// protocol) — non-fatal
    });
  }
});
