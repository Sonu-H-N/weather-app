const weatherData = {
Bangalore: { temp: 28, desc: "Cloudy" },
Delhi: { temp: 35, desc: "Sunny" },
Mumbai: { temp: 30, desc: "Rainy" },
Chennai: { temp: 33, desc: "Humid" }
};

const forecastData = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const citySelect = document.getElementById("citySelect");

citySelect.onchange = () => {

const city = citySelect.value;

if(!city) return;

const data = weatherData[city];

document.getElementById("cityName").innerText = city;
document.getElementById("temperature").innerText = data.temp + "°C";
document.getElementById("description").innerText = data.desc;

showForecast();
};

function showForecast() {

const forecastContainer = document.getElementById("forecast");
forecastContainer.innerHTML = "";

forecastData.forEach(day => {

const temp = Math.floor(Math.random()*10)+25;

const card = `
<div class="forecast-card">
<p>${day}</p>
<p>${temp}°C</p>
</div>
`;

forecastContainer.innerHTML += card;

});

}


// 🌙 Dark Mode Toggle

const toggleBtn = document.getElementById("themeToggle");

toggleBtn.onclick = () => {

document.body.classList.toggle("dark");
document.body.classList.toggle("light");

if(document.body.classList.contains("dark")){
toggleBtn.innerText="☀️";
}else{
toggleBtn.innerText="🌙";
}

};