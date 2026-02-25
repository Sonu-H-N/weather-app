function getWeather() {

const city = document.getElementById("city").value;

if (!city) {
alert("Enter city name");
return;
}

document.getElementById("cityName").innerText = city;
document.getElementById("temp").innerText = "30°C";

}
