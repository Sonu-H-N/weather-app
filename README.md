# 🌤️ Weather Pro

> A live weather dashboard with hourly and 5-day forecasts, air quality, sunrise/sunset, geolocation, and an animated day/night sky — built with vanilla HTML, CSS, and JavaScript. Fully functional out of the box with built-in demo data, or upgrade to live forecasts in one click with a free OpenWeatherMap API key.

[![Live Demo](https://img.shields.io/badge/Open-Live%20Demo-1b2a4a?style=flat-square)](./index.html)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-f5a623?style=flat-square)](#pwa-support)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

---

## 📸 Overview

Weather Pro is a single-page weather application designed as a portfolio / final-year project. It pairs a real weather data layer with a dawn-to-dusk visual identity — a hero temperature readout, instrument-style metric tiles, and a sky that genuinely shifts with the time of day — rather than a generic dashboard template. It's fully usable the moment you open it, no signup required, thanks to a built-in deterministic demo data mode.

---

## ✨ Features

### 🌦️ Weather Data
- **Dual-mode data layer** — live data from the OpenWeatherMap API when a key is provided, with an automatic, deterministic demo-data fallback (the same city always returns the same demo conditions, so it stays consistent across a session)
- Current conditions: temperature, "feels like," daily high/low, humidity, wind speed, pressure
- **Hourly forecast** — next 8 hours at a glance
- **5-day forecast** with per-day icon and temperature
- **Air Quality Index** with a color-coded Good → Very Poor rating
- **Sunrise / sunset** times
- **°C / °F unit toggle** — instantly re-renders temperature, forecast, hourly strip, and chart

### 📍 Location & Search
- Text search by city name
- 🎤 **Voice search** via the Web Speech API (graceful fallback notification if unsupported)
- 📍 **"Use my location"** — one-tap geolocation lookup using the browser's Geolocation API
- ⭐ **Favorites** and 🕒 **recent searches**, both one click to revisit
- In-app **API key panel** — paste a free OpenWeatherMap key to switch from demo to live data instantly, remove it any time to fall back to demo mode

### 🎨 Animated Sky System
- ☀️ Friendly animated sun during the day, 🌙 glowing moon at night, driven by real local time (with a manual override toggle)
- ⭐ Twinkling star field and periodic shooting stars at night
- ☁️ Drifting cloud layer
- 🌧️ Rain animation, automatically triggered by rain/drizzle conditions
- ⛈️ Lightning flashes during thunderstorms
- 🌈 Occasional rainbow after rain clears

### 📊 Visualization
- Interactive temperature trend chart (Chart.js) spanning current conditions through the 5-day forecast, following the active unit

### 🎛️ Interface
- Instrument-panel layout: hero temperature readout, metric tiles, sun/AQI info cards, hourly strip, forecast strip, and chart, all in a clear visual hierarchy
- Live clock in the header
- Manual dark/light theme toggle, persisted across sessions
- Toast notifications for every action
- Responsive down to small phone widths, visible keyboard focus states, and respects `prefers-reduced-motion`

### 📱 PWA Support
- Installable to home screen / desktop
- Offline-capable app shell via a registered Service Worker (cache-first for static assets, network-first for live weather calls)

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Semantic markup, PWA manifest link |
| CSS3 | Custom design system (CSS variables), animations, responsive layout |
| Vanilla JavaScript (ES6+) | All app logic, no frameworks |
| [Chart.js](https://www.chartjs.org/) | Temperature trend visualization |
| [OpenWeatherMap API](https://openweathermap.org/api) | Live current weather, 5-day/3-hour forecast, and air pollution data (optional) |
| Web Speech API | Voice-driven city search |
| Geolocation API | "Use my location" weather lookup |
| Google Fonts — Fraunces + Inter | Display/body type pairing |
| localStorage | Favorites, history, theme, unit, and API key persistence |
| Service Worker | PWA offline caching |

---

## 📂 Project Structure

```
weather-app/
├── index.html       # App shell — masthead, search, hero readout, forecasts, settings
├── style.css         # Complete design system: palette, type scale, layout, animations
├── script.js         # All app logic — data layer, sky effects, UI rendering, PWA registration
├── sw.js              # Service worker (offline caching)
├── manifest.json      # PWA manifest (installable, standalone display)
├── icon.png            # App icon
└── README.md           # This file
```

> **No build tools. No npm. No dependencies to install.** Open `index.html` in a browser and it works immediately in demo mode.

---

## ⚙️ How to Run

### Option 1 — Open directly
```
Double-click index.html   →   Opens in your default browser, demo mode active
```

### Option 2 — Live Server (recommended, required for Service Worker + Geolocation)
```bash
# VS Code extension
Install "Live Server" → Right-click index.html → "Open with Live Server"

# Or with Python
python -m http.server 8080
# Then visit http://localhost:8080
```
> Service workers and the Geolocation API both require `http://` or `https://` — they're unavailable when opening the file directly from disk (`file://`).

### Going live with real data
1. Get a free API key at [openweathermap.org/api](https://openweathermap.org/api) (instant signup, free tier).
2. Open the app, click **⚙ Data source**, paste the key, click **Save key**.
3. The app immediately switches from demo data to live conditions, forecasts, and air quality — no reload needed.

---

## 🗂️ Data Storage

All data is stored in **localStorage**:

| Key | Contents |
|---|---|
| `favorites` | Array of favorited city names |
| `history` | Last 5 searched cities |
| `unit` | `metric` or `imperial` |
| `manualTheme` | User's manual day/night override |
| `owm_api_key` | OpenWeatherMap API key (only if provided) |

**No data ever leaves your device** except the weather API calls themselves, which go directly from your browser to OpenWeatherMap.

---

## 🔮 Possible Extensions

- 🗺️ Interactive map view with weather overlays
- 🔔 Severe weather push notifications
- 📅 14-day extended forecast
- 🌍 Multi-language support
- 📈 Historical weather comparison

---

## 👨‍💻 Author

**Sonu H N**
Passionate about web development and building smart tools that solve real problems.

---

## 📜 License

This project is open-source under the [MIT License](LICENSE).
