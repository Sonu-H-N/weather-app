const apiKey = "YOUR_API_KEY_HERE";

const forecastContainer = document.getElementById("forecast");

async function getWeather(cityName) {
    const city = cityName || document.getElementById("cityInput").value;

    if (city === "") return;

    const url =
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    displayWeather(data);

    getForecast(data.coord.lat, data.coord.lon);
}

function displayWeather(data) {
    document.getElementById("cityName").innerText = data.name;
    document.getElementById("temperature").innerText = data.main.temp + "°C";
    document.getElementById("description").innerText = data.weather[0].description;
    document.getElementById("humidity").innerText = data.main.humidity + "%";
    document.getElementById("wind").innerText = data.wind.speed + " km/h";

    const icon = data.weather[0].icon;
    document.getElementById("weatherIcon").src =
        `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

// 📅 Forecast Function
async function getForecast(lat, lon) {
    const url =
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    displayForecast(data.daily);
}

function displayForecast(days) {
    forecastContainer.innerHTML = "";

    days.slice(1, 8).forEach(day => {

        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

        const card = `
            <div class="forecast-card">
                <h4>${dayName}</h4>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
                <p>${Math.round(day.temp.day)}°C</p>
            </div>
        `;

        forecastContainer.innerHTML += card;
    });
}

// 📍 Auto Location
window.onload = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {

            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;

            const url =
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

            const response = await fetch(url);
            const data = await response.json();

            displayWeather(data);
            getForecast(lat, lon);

        });
    }
};
const toggleBtn = document.getElementById("themeToggle");

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    toggleBtn.innerText = "☀️";
} else {
    document.body.classList.add("light");
}

toggleBtn.onclick = () => {
    document.body.classList.toggle("dark");
    document.body.classList.toggle("light");

    if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        toggleBtn.innerText = "☀️";
    } else {
        localStorage.setItem("theme", "light");
        toggleBtn.innerText = "🌙";
    }
};