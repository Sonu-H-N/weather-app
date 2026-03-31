function handleSearch(){

const city=document.getElementById("cityInput").value;

updateWeather(city);
addToHistory(city);

}
function startVoiceSearch(){

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

recognition.lang = "en-US";

recognition.start();

recognition.onresult = function(event){

const city = event.results[0][0].transcript;

document.getElementById("cityInput").value = city;

updateWeather(city);

};

recognition.onerror = function(){

alert("Voice recognition not supported in this browser");

};

}
function showLoader(){

document.getElementById("loader").style.display="block";

}

function hideLoader(){

document.getElementById("loader").style.display="none";

}
// 🌌 Shooting Star System

let shootingInterval;

function startShootingStars(){

const container=document.getElementById("shootingStars");
if(!container) return;

if(shootingInterval) return;

shootingInterval=setInterval(()=>{

const star=document.createElement("div");
star.className="shooting-star";

star.style.top=Math.random()*50+"vh";
star.style.left=Math.random()*100+"vw";

container.appendChild(star);

setTimeout(()=>{
star.remove();
},2000);

},3000);

}

function stopShootingStars(){

if(shootingInterval){
clearInterval(shootingInterval);
shootingInterval=null;
}

}
startShootingStars();
stopShootingStars();
// ⭐ Favorites System

function addFavorite(){

const city=document.getElementById("cityInput").value;

if(!city) return;

let favs=JSON.parse(localStorage.getItem("favorites")) || [];

if(!favs.includes(city)){
favs.push(city);
localStorage.setItem("favorites", JSON.stringify(favs));
}

renderFavorites();

}


function renderFavorites(){

const container=document.getElementById("favList");

let favs=JSON.parse(localStorage.getItem("favorites")) || [];

container.innerHTML="";

favs.forEach(city=>{

const div=document.createElement("div");
div.className="fav-item";
div.innerText=city;

div.onclick=()=>updateWeather(city);

container.appendChild(div);

});

}


// Load favorites on start
window.addEventListener("load", renderFavorites);
// 🕒 Search History System

function addToHistory(city){

let history = JSON.parse(localStorage.getItem("history")) || [];

// remove duplicate
history = history.filter(c => c !== city);

// add to top
history.unshift(city);

// limit to 5 items
history = history.slice(0,5);

localStorage.setItem("history", JSON.stringify(history));

renderHistory();

}


function renderHistory(){

const container = document.getElementById("historyList");

let history = JSON.parse(localStorage.getItem("history")) || [];

container.innerHTML = "";

history.forEach(city => {

const div = document.createElement("div");
div.className = "history-item";
div.innerText = city;

div.onclick = () => updateWeather(city);

container.appendChild(div);

});

}


// Load history on start
window.addEventListener("load", renderHistory);