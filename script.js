async function getWeather() {

const city = document.getElementById("city").value;

if (!city) {
alert("Please enter city name");
return;
}

try {

```
const response = await fetch(`https://wttr.in/${city}?format=j1`);
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
```

} catch (error) {
alert("Error fetching weather");
console.log(error);
}

}
