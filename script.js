function handleSearch(){

const city=document.getElementById("cityInput").value;

updateWeather(city);

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