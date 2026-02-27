const apiKey = "YOUR_API_KEY_HERE";

async function getWeather() {
    const city = document.getElementById("cityInput").value;

    if (city === "") {
        alert("Please enter a city");
        return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod !== 200) {
            alert("City not found");
            return;
        }

        document.getElementById("cityName").innerText = data.name;
        document.getElementById("temperature").innerText = data.main.temp + "°C";
        document.getElementById("description").innerText = data.weather[0].description;
        document.getElementById("humidity").innerText = data.main.humidity + "%";
        document.getElementById("wind").innerText = data.wind.speed + " km/h";

        const icon = data.weather[0].icon;
        document.getElementById("weatherIcon").src =
            `https://openweathermap.org/img/wn/${icon}@2x.png`;

    } catch (error) {
        alert("Error fetching weather");
    }
}