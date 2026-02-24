const apiKey = "YOUR_API_KEY";

async function getWeather() {

const city = document.getElementById("city").value;

const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

const res = await fetch(url);
const data = await res.json();

document.getElementById("temp").innerText = data.main.temp + "°C";
document.getElementById("cityName").innerText = data.name;
document.getElementById("desc").innerText = data.weather[0].description;
document.getElementById("humidity").innerText = data.main.humidity;
document.getElementById("wind").innerText = data.wind.speed;

const iconCode = data.weather[0].icon;
document.getElementById("icon").src =
`https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}
