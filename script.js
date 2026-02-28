const cities = ["Bangalore","Delhi","Mumbai","Chennai","Kolkata"];

const input = document.getElementById("cityInput");

input.addEventListener("keypress", e => {
if(e.key === "Enter"){
updateWeather(input.value);
}
});

function updateWeather(city){

if(!city) return;

const temp = Math.floor(Math.random()*10)+25;

const conditions = ["Sunny","Cloudy","Rainy","Stormy"];
const desc = conditions[Math.floor(Math.random()*conditions.length)];

document.getElementById("cityName").innerText = city;
document.getElementById("temperature").innerText = temp + "°C";
document.getElementById("description").innerText = desc;

changeBackground(desc);

generateForecast();

}


// 🎨 Background Change

function changeBackground(condition){
if(condition === "Sunny")
{

 showSun();
 hideStars();
}
else{

 hideSun();

}
if(condition === "Rainy"){
document.body.style.background =
"linear-gradient(135deg,#667db6,#0082c8)";
}
else if(condition === "Cloudy"){
document.body.style.background =
"linear-gradient(135deg,#bdc3c7,#2c3e50)";
}
else if(condition === "Sunny"){
document.body.style.background =
"linear-gradient(135deg,#f7971e,#ffd200)";
}
else{
document.body.style.background =
"linear-gradient(135deg,#4facfe,#00f2fe)";
}

}


// 📅 Forecast

function generateForecast(){

const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const container = document.getElementById("forecast");
container.innerHTML = "";

days.forEach(day => {

const temp = Math.floor(Math.random()*10)+25;

container.innerHTML += `
<div class="forecast-card">
<p>${day}</p>
<p>${temp}°C</p>
</div>
`;

});

}


// 🌙 Auto Day / Night

const hour = new Date().getHours();

if(hour >= 19 || hour <= 6){
document.body.classList.add("night");
}


// 🌗 Manual Toggle

const toggleBtn = document.getElementById("themeToggle");

toggleBtn.onclick = () => {

document.body.classList.toggle("night");

if(document.body.classList.contains("night")){
toggleBtn.innerText="☀️";
}else{
toggleBtn.innerText="🌙";
}

};
// ⭐ Night Stars System

function showStars(){

const starsContainer = document.getElementById("stars");
if(!starsContainer) return;

starsContainer.style.opacity = "1";

if(starsContainer.children.length > 0) return;

for(let i=0;i<80;i++){

const star = document.createElement("div");
star.className = "star";

star.style.top = Math.random()*100 + "vh";
star.style.left = Math.random()*100 + "vw";

starsContainer.appendChild(star);

}

}

function hideStars(){

const starsContainer = document.getElementById("stars");
if(!starsContainer) return;

starsContainer.style.opacity = "0";

}


// ☀️ Sun System

function showSun(){

const sun = document.getElementById("sun");
if(!sun) return;

sun.style.opacity = "1";

}

function hideSun(){

const sun = document.getElementById("sun");
if(!sun) return;

sun.style.opacity = "0";

}


// 🌙 Auto Night Detection

function checkDayNight(){

const hour = new Date().getHours();

if(hour >= 19 || hour <= 6){
showStars();
hideSun();
}else{
hideStars();
}

}

checkDayNight();