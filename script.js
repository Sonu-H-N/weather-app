const apiKey = "YOUR_API_KEY_HERE";

const cityInput = document.getElementById("cityInput");
const weatherCard = document.getElementById("weatherCard");

cityInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        getWeather();
    }
});

async function getWeather(cityName) {
    const city = cityName || cityInput.value;

    if (city === "") {
        showError("Please enter a city");
        return;
    }

    showLoader();

    const url =
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod !== 200) {
            showError("City not found");
            return;
        }

        displayWeather(data);

    } catch (error) {
        showError("Error fetching weather");
    }
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

    hideLoader();
}

function showLoader() {
    weatherCard.innerHTML = "<p>Loading...</p>";
}

function showError(msg) {
    weatherCard.innerHTML = `<p style="color:red">${msg}</p>`;
}

function hideLoader() {
    // Nothing needed here now
}

// 📍 Auto Detect Location
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
        });
    }
};