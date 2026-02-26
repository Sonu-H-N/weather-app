const apiKey = "YOUR_API_KEY";

async function getWeather() {

    const city = document.getElementById("city").value;

    if (!city) {
        alert("Enter city name");
        return;
    }

    const url =
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    try {

        const response = await fetch(url);
        const data = await response.json();

        document.getElementById("cityName").innerText =
            data.name + ", " + data.sys.country;

        document.getElementById("temp").innerText =
            "🌡 Temperature: " + data.main.temp + " °C";

        document.getElementById("desc").innerText =
            "☁ " + data.weather[0].description;

        document.getElementById("humidity").innerText =
            "💧 Humidity: " + data.main.humidity + "%";

        document.getElementById("wind").innerText =
            "🌬 Wind: " + data.wind.speed + " m/s";

        const icon =
            `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

        document.getElementById("icon").src = icon;

    } catch (error) {
        alert("City not found");
    }
}

function toggleTheme() {
    document.body.classList.toggle("dark");
}