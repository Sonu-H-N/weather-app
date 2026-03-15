const CACHE_NAME = "weather-app-v1";

const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
function showNotification(message){
  showNotification("Weather updated for " + city);

const note=document.getElementById("notification");

note.innerText=message;

note.classList.add("show");

setTimeout(()=>{

note.classList.remove("show");

},3000);

}