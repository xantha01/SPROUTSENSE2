
// Import Firebase SDK modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

// Your Firebase config (from your snippet)
const firebaseConfig = {
apiKey: "AIzaSyDLGfknBGSEl6Fw21V0pq04BbfFCubyjaI",
authDomain: "sproutsense-9536f.firebaseapp.com",
databaseURL: "https://sproutsense-9536f-default-rtdb.europe-west1.firebasedatabase.app",
projectId: "sproutsense-9536f",
storageBucket: "sproutsense-9536f.firebasestorage.app",
messagingSenderId: "870644685502",
appId: "1:870644685502:web:1195a2b1baf455c57a9cef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Select elements
const soilMoistureElement = document.getElementById("soilmoisturevalue");
const tempElement = document.getElementById("tempvalue");
const humidityElement = document.getElementById("humidityvalue");

// Read data from Firebase Realtime Database
onValue(ref(database, "irrigation/soilMoisture"), (snapshot) => {
const value = snapshot.val();
soilMoistureElement.textContent = value + "%";
});

onValue(ref(database, "irrigation/temperature"), (snapshot) => {
const value = snapshot.val();
tempElement.textContent = value + "°C";
});

onValue(ref(database, "irrigation/humidity"), (snapshot) => {
const value = snapshot.val();
humidityElement.textContent = value + "%";
});

