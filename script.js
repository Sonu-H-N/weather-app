const button = document.getElementById("searchBtn");
const input = document.getElementById("city");
const loading = document.getElementById("loading");

button.addEventListener("click", getWeather);

input.addEventListener("keypress", function(e) {
if (e.key === "Enter") {
getWeather();
}
});

async function getWeather() {

const city = input.value;

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

document.getElementById("icon").src =
  "https://openweathermap.org/img/wn/10d@2x.png";
```

} catch (error) {

```
alert("Error loading weather");
console.log(error);
```

}

loading.style.display = "none";
}
