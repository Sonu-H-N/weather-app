/* ==========================================================
   Weather Pro — App Logic
   Real OpenWeatherMap integration with graceful demo fallback
   ========================================================== */

// ─── CONFIG ────────────────────────────────────────────────
const OWM_BASE = "https://api.openweathermap.org/data/2.5";
let unit = localStorage.getItem("unit") || "metric"; // metric = °C, imperial = °F
let lastCityData = null; // cache last successful result for unit toggling
let tempChartInstance = null;

function getApiKey() {
  return localStorage.getItem("owm_api_key") || "";
}

function isDemoMode() {
  return !getApiKey();
}

// ─── DEMO / MOCK DATA ──────────────────────────────────────
// Used automatically when no API key is set, so the app is fully
// functional and resume-demoable without any signup required.
const DEMO_CONDITIONS = [
  { main: "Clear", description: "clear sky", icon: "01d", emoji: "☀️" },
  { main: "Clouds", description: "scattered clouds", icon: "03d", emoji: "⛅" },
  { main: "Rain", description: "light rain", icon: "10d", emoji: "🌧️" },
  { main: "Thunderstorm", description: "thunderstorm", icon: "11d", emoji: "⛈️" },
  { main: "Snow", description: "light snow", icon: "13d", emoji: "❄️" },
  { main: "Mist", description: "misty", icon: "50d", emoji: "🌫️" }
];

function hashCity(city) {
  let h = 0;
  for (let i = 0; i < city.length; i++) h = (h * 31 + city.charCodeAt(i)) >>> 0;
  return h;
}

function buildDemoData(city) {
  const h = hashCity(city.toLowerCase().trim());
  const cond = DEMO_CONDITIONS[h % DEMO_CONDITIONS.length];
  const baseTemp = 10 + (h % 25); // 10–34 °C range, deterministic per city name

  const forecast = Array.from({ length: 5 }, (_, i) => {
    const fh = hashCity(city.toLowerCase().trim() + i);
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

  return {
    city: city.replace(/\b\w/g, c => c.toUpperCase()),
    tempC: baseTemp,
    feelsLikeC: baseTemp - 1 + (h % 3),
    humidity: 40 + (h % 50),
    windSpeed: (h % 20) + 1,
    pressure: 1000 + (h % 30),
    description: cond.description,
    emoji: cond.emoji,
    forecast,
    isDemo: true
  };
}

// ─── REAL API FETCH ────────────────────────────────────────
async function fetchRealWeather(city) {
  const key = getApiKey();

  const currentRes = await fetch(
    `${OWM_BASE}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${key}`
  );
  if (!currentRes.ok) {
    if (currentRes.status === 401) throw new Error("Invalid API key");
    if (currentRes.status === 404) throw new Error("City not found");
    throw new Error("Weather service unavailable");
  }
  const current = await currentRes.json();

  const forecastRes = await fetch(
    `${OWM_BASE}/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${key}`
  );
  const forecastData = forecastRes.ok ? await forecastRes.json() : null;

  // Pick one entry per day (~every 8th 3-hour slot) for a 5-day outlook
  let forecast = [];
  if (forecastData && forecastData.list) {
    const daily = forecastData.list.filter((_, i) => i % 8 === 4).slice(0, 5);
    forecast = daily.map(entry => ({
      day: new Date(entry.dt * 1000).toLocaleDateString("en-US", { weekday: "short" }),
      tempC: Math.round(entry.main.temp),
      emoji: iconToEmoji(entry.weather[0].icon),
      description: entry.weather[0].description
    }));
  }

  return {
    city: `${current.name}${current.sys?.country ? ", " + current.sys.country : ""}`,
    tempC: Math.round(current.main.temp),
    feelsLikeC: Math.round(current.main.feels_like),
    humidity: current.main.humidity,
    windSpeed: Math.round(current.wind.speed),
    pressure: current.main.pressure,
    description: current.weather[0].description,
    emoji: iconToEmoji(current.weather[0].icon),
    forecast,
    isDemo: false
  };
}

function iconToEmoji(icon) {
  const map = {
    "01": "☀️", "02": "🌤️", "03": "⛅", "04": "☁️",
    "09": "🌧️", "10": "🌦️", "11": "⛈️", "13": "❄️", "50": "🌫️"
  };
  return map[icon.slice(0, 2)] || "🌤️";
}

// ─── UNIT CONVERSION ───────────────────────────────────────
function toDisplayTemp(celsius) {
  if (unit === "imperial") return Math.round(celsius * 9 / 5 + 32);
  return Math.round(celsius);
}

function unitSymbol() {
  return unit === "imperial" ? "F" : "C";
}

// ─── CORE: updateWeather ───────────────────────────────────
async function updateWeather(city) {
  city = (city || "").trim();
  if (!city) {
    showNotification("Please enter a city name");
    return;
  }

  showLoader();

  try {
    const data = isDemoMode() ? buildDemoData(city) : await fetchRealWeather(city);
    lastCityData = data;
    renderWeather(data);
    applySkyEffects(data);
    renderChart(data);
    showNotification(
      (data.isDemo ? "Demo data for " : "Weather updated for ") + data.city
    );
  } catch (err) {
    showNotification(err.message || "Could not fetch weather");
  } finally {
    hideLoader();
  }
}

function renderWeather(data) {
  document.getElementById("cityName").textContent = data.city;
  document.getElementById("weatherIcon").textContent = data.emoji;
  document.getElementById("temperature").innerHTML =
    `${toDisplayTemp(data.tempC)}°<span id="unitLabel">${unitSymbol()}</span>`;
  document.getElementById("description").textContent =
    data.description.charAt(0).toUpperCase() + data.description.slice(1) +
    (data.isDemo ? " (demo data)" : "");

  document.getElementById("weatherDetails").innerHTML = `
    <div class="detail-item">🌡️ Feels like ${toDisplayTemp(data.feelsLikeC)}°${unitSymbol()}</div>
    <div class="detail-item">💧 Humidity ${data.humidity}%</div>
    <div class="detail-item">💨 Wind ${data.windSpeed} ${unit === "imperial" ? "mph" : "m/s"}</div>
    <div class="detail-item">🧭 Pressure ${data.pressure} hPa</div>
  `;

  const forecastEl = document.getElementById("forecast");
  forecastEl.innerHTML = data.forecast.map(f => `
    <div class="forecast-card">
      <div>${f.day}</div>
      <div style="font-size:22px">${f.emoji}</div>
      <div>${toDisplayTemp(f.tempC)}°${unitSymbol()}</div>
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

  const hour = new Date().getHours();
  const isNight = hour < 6 || hour >= 19;

  document.body.classList.toggle("night", isNight);
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

  rain.style.opacity = isRain || isStorm ? 1 : 0;
  rain.classList.toggle("active", isRain || isStorm);
  lightning.classList.toggle("active", isStorm);

  if (!isNight && !isRain && !isStorm) {
    rainbow.style.opacity = condition.includes("clear") ? 0.0 : 0;
  } else {
    rainbow.style.opacity = 0;
  }
  // brief rainbow after rain clears, just for delight
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
        borderColor: "#4facfe",
        backgroundColor: "rgba(79,172,254,0.25)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#fff"
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: "#fff" } } },
      scales: {
        x: { ticks: { color: "#fff" }, grid: { color: "rgba(255,255,255,0.1)" } },
        y: { ticks: { color: "#fff" }, grid: { color: "rgba(255,255,255,0.1)" } }
      }
    }
  });
}

// ─── SEARCH / VOICE ────────────────────────────────────────
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
  notificationTimeout = setTimeout(() => {
    note.classList.remove("show");
  }, 3000);
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
  container.innerHTML = favs.length
    ? ""
    : '<span class="empty-hint">No favorites yet</span>';

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
  container.innerHTML = history.length
    ? ""
    : '<span class="empty-hint">No recent searches</span>';

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
  document.getElementById("unitToggle").textContent =
    unit === "metric" ? "Switch to °F" : "Switch to °C";
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

// ─── INIT ──────────────────────────────────────────────────
window.addEventListener("load", () => {
  renderFavorites();
  renderHistory();
  updateApiModeLabel();

  document.getElementById("unitToggle").textContent =
    unit === "metric" ? "Switch to °F" : "Switch to °C";

  document.getElementById("themeToggle").addEventListener("click", toggleTheme);
  document.getElementById("unitToggle").addEventListener("click", toggleUnit);
  document.getElementById("apiSettingsToggle").addEventListener("click", () => {
    const panel = document.getElementById("apiSettingsPanel");
    panel.style.display = panel.style.display === "none" ? "block" : "none";
  });
  document.getElementById("cityInput").addEventListener("keydown", e => {
    if (e.key === "Enter") handleSearch();
  });

  // Restore manual theme preference if user toggled before, else fall back
  // to time-of-day once a city is searched.
  const manual = localStorage.getItem("manualTheme");
  if (manual === "night") {
    document.body.classList.add("night");
    document.getElementById("themeToggle").textContent = "☀️";
  }

  // Show a default city on first load so the app never looks empty
  updateWeather("London");

  // Register service worker for offline support
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Offline support unavailable (e.g. file:// protocol) — non-fatal
    });
  }
});
