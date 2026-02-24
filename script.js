const apiKey = "YOUR_API_KEY";

async function getWeather() {

const city = document.getElementById("city").value;

if (!city) {
alert("Please enter city name");
return;
}

const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

try {

```
const res = await fetch(url);
const data = await res.json();

if (data.cod === "404") {
  alert("City not found");
  return;
}

document.getElementById("temp").innerText = Math.round(data.main.temp) + "°C";
document.getElementById("cityName").innerText = data.name;
document.getElementById("desc").innerText = data.weather[0].description;
document.getElementById("humidity").innerText = data.main.humidity;
document.getElementById("wind").innerText = data.wind.speed;

const iconCode = data.weather[0].icon;

document.getElementById("icon").src =
  `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
```

} catch (error) {
alert("Error fetching weather");
}

}
