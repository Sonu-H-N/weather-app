# 🌤️ Weather Pro

> A modern, animated weather dashboard built with vanilla HTML, CSS, and JavaScript. Works instantly with built-in demo data, or upgrade to live forecasts in one click by adding a free OpenWeatherMap API key.

[![Live Demo](https://img.shields.io/badge/Open-Live%20Demo-4facfe?style=flat-square)](./index.html)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-00f2fe?style=flat-square)](#pwa-support)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

---

## 📸 Overview

Weather Pro is a polished, single-page weather application built as a portfolio / final-year project. It blends real weather data, dynamic sky animations, and a responsive glassmorphism UI — and it's fully functional the moment you open it, no API signup required, thanks to a built-in deterministic demo data mode.

---

## ✨ Features

### 🌦️ Weather Data
- **Dual-mode data layer** — uses live data from the OpenWeatherMap API when a key is provided, and falls back automatically to realistic, deterministic demo data otherwise (same city always returns the same demo weather, so it feels consistent)
- Current conditions: temperature, "feels like", humidity, wind speed, and pressure
- 5-day forecast strip with per-day icon and temperature
- **°C / °F unit toggle** — instantly re-renders temperature, forecast, and chart
- In-app **API key settings panel** — paste a free key to switch from demo to live data with no code changes, remove it any time to go back to demo mode

### 🎨 Animated Sky System
- ☀️ Animated sun (with a friendly face) shown during the day
- 🌙 Glowing moon that drifts across the sky at night
- ⭐ Twinkling star field + periodic shooting stars at night
- ☁️ Drifting cloud layer in the background
- 🌧️ Rain animation triggered automatically when conditions include rain/drizzle
- ⛈️ Lightning flash effect during thunderstorm conditions
- 🌈 Rainbow effect that appears occasionally after rain
- Day/night detection based on real local time, with a manual override toggle

### 🔍 Search & Discovery
- Text search by city name
- 🎤 **Voice search** using the Web Speech API (falls back gracefully with a notification if unsupported)
- ⭐ **Favorites** — save frequently checked cities, click to revisit instantly
- 🕒 **Recent searches** — last 5 cities, deduplicated, most recent first
- One-click **Clear Favorites** / **Clear History**

### 📊 Visualization
- Interactive temperature trend chart (Chart.js) spanning current + 5-day forecast
- Chart and forecast units automatically follow the °C/°F toggle

### 🌗 Theme & UX
- Manual dark/light theme toggle (persisted across sessions)
- In-app toast notifications for every action (search, favorites, errors, API key changes)
- Loading spinner during fetches
- Responsive glassmorphism card layout, scrollable on small screens

### 📱 PWA Support
- Installable to home screen / desktop
- Offline-capable app shell via a registered Service Worker (cache-first for static assets, network-first for live weather calls so data is never stale when online)

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Semantic markup, PWA manifest link |
| CSS3 | Custom animations, glassmorphism, responsive layout, dark/light themes |
| Vanilla JavaScript (ES6+) | All app logic, no frameworks |
| [Chart.js](https://www.chartjs.org/) | Temperature trend visualization |
| [OpenWeatherMap API](https://openweathermap.org/api) | Live current weather + 5-day forecast (optional) |
| Web Speech API | Voice-driven city search |
| localStorage | Favorites, history, theme, unit, and API key persistence |
| Service Worker | PWA offline caching |

---

## 📂 Project Structure

```
weather-app/
├── index.html       # App shell — search, weather card, forecast, chart, settings
├── style.css         # Complete design system, animations, responsive styles
├── script.js         # All app logic — data layer, effects, UI, PWA registration
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

### Option 2 — Live Server (recommended, required for Service Worker)
```bash
# VS Code extension
Install "Live Server" → Right-click index.html → "Open with Live Server"

# Or with Python
python -m http.server 8080
# Then visit http://localhost:8080
```
> Service workers require `http://` or `https://` — they won't register when opening the file directly from disk (`file://`).

### Going live with real data
1. Get a free API key at [openweathermap.org/api](https://openweathermap.org/api) (instant signup, free tier).
2. Open the app, click **⚙️ API Key Settings**, paste the key, click **Save Key**.
3. The app immediately switches from demo data to live forecasts — no reload needed.

---

## ⌨️ Notes on Demo Mode

When no API key is set, Weather Pro generates **deterministic demo data** — the same city name always produces the same temperature, condition, and forecast within a session, so the app feels stable and realistic for demos, screenshots, or offline grading without depending on an external API or internet connection.

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

**No data ever leaves your device** except the weather API call itself, which goes directly from your browser to OpenWeatherMap.

---

## 🔮 Possible Extensions

- 📍 Geolocation-based "weather near me" on load
- 🗺️ Interactive map view with weather overlays
- 🔔 Severe weather push notifications
- 📅 Hourly forecast view in addition to daily
- 🌍 Multi-language support

---

## 👨‍💻 Author

**Sonu H N**  
Passionate about web development and building smart tools that solve real problems.

---

## 📜 License

This project is open-source under the [MIT License](LICENSE).
