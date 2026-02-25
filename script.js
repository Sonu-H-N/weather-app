const button = document.getElementById("searchBtn");
const input = document.getElementById("city");
const loading = document.getElementById("loading");
const locationBtn = document.getElementById("locationBtn");

button.addEventListener("click", () => getWeather(input.value));

input.addEventListener("keypress", function(e) {
if (e.key === "Enter") {
getWeather(input.value);
}
});

locationBtn.addEventListener("click", getLocationWeather);

async function getWeather(city) {

if (!city) {
alert("Please enter city name");
return;
}

loading.style.display = "block";

try {

```
const response = await fetch(
  "https://api.allorigins.win/raw?url=https://wttr.in/" + city + "?format=j1"
);

const data = await response.json();
updateUI(data, city);
```

} catch (error) {
alert("Error loading weather");
}

loading.style.display = "none";
}

function updateUI(data, city) {

const current = data.current_condition[0];

document.getElementById("temp").innerText =
current.temp_C + "°C";

document.getElementById("cityName").innerText = city;

document.getElementById("desc").innerText =
current.weatherDesc[0].value;

document.getElementById("humidity").innerText =
current.humidity;

document.getElementById("wind").innerText =
current.windspeedKmph;

changeBackground(current.weatherDesc[0].value);
}

function changeBackground(condition) {

const body = document.body;

if (condition.toLowerCase().includes("sun")) {
body.style.background = "linear-gradient(135deg,#fddb92,#d1fdff)";
}
else if (condition.toLowerCase().includes("rain")) {
body.style.background = "linear-gradient(135deg,#667db6,#0082c8)";
}
else if (condition.toLowerCase().includes("cloud")) {
body.style.background = "linear-gradient(135deg,#bdc3c7,#2c3e50)";
}
else {
body.style.background = "linear-gradient(135deg,#74ebd5,#9face6)";
}
}

function getLocationWeather() {

if (navigator.geolocation) {

```
navigator.geolocation.getCurrentPosition(async (pos) => {

  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;

  const response = await fetch(
    "https://api.allorigins.win/raw?url=https://wttr.in/" + lat + "," + lon + "?format=j1"
  );

  const data = await response.json();

  updateUI(data, "My Location");

});
```

} else {
alert("Geolocation not supported");
}

}
