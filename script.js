// ======================= CONFIG =======================
const sheetURL =
  "https://script.google.com/macros/s/AKfycbz5IxkHWljLRpSAZl5YkkWNZlmaxfGaCPVXXYjf9wXernbCQ02Nca_Zf_r9Q-a7D0PS4A/exec";

let lastTimestamp = null;
let lastUpdateTime = Date.now();
const OFFLINE_TIMEOUT = 15000; // 15 seconds before declaring offline

// ======================= THRESHOLD VARIABLES =======================
let soilMoistureWet = 1024;
let soilMoistureDry = 0;

// ======================= HELPER FUNCTIONS =======================
function clampValue(value) {
  if (value > 1024) return 1020;
  if (value < 0) return 10;
  return value;
}

// function mapSoilMoisture(raw) {
//   raw = Math.min(Math.max(raw, soilMoistureDry), soilMoistureWet);
//   const percentage =
//     ((soilMoistureWet - raw) / (soilMoistureWet - soilMoistureDry)) * 100;
//   return Math.round(percentage);
// }

function mapSoilMoisture(raw) {
  const dry = soilMoistureDry;
  const wet = soilMoistureWet;

  if (isNaN(raw) || isNaN(dry) || isNaN(wet) || dry === wet) return 0;

  raw = Math.min(Math.max(raw, wet), dry);

  const percentage = ((dry - raw) / (dry - wet)) * 100;

  return Math.round(percentage);
}


function updateThresholds() {
  const wetInput = document.getElementById("soilmoisturewetvalue");
  const dryInput = document.getElementById("soilmoisturedryvalue");

  soilMoistureWet = clampValue(Number(wetInput.value));
  soilMoistureDry = clampValue(Number(dryInput.value));

  wetInput.value = soilMoistureWet;
  dryInput.value = soilMoistureDry;

  console.log("Thresholds updated →", { soilMoistureWet, soilMoistureDry });
}

// ======================= JSONP CALLBACK =======================
window.handleData = function (data) {
  console.log("Data received:", data);

  const currentTimestamp = data.Timestamp ? String(data.Timestamp).trim() : null;

  // ✅ If timestamp changed → device is online
  if (currentTimestamp && currentTimestamp !== lastTimestamp) {
    lastTimestamp = currentTimestamp;
    lastUpdateTime = Date.now(); // reset offline timer
    setStatusOnline();

    // 🔹 Map and update values
    const soilMoistureRaw = parseFloat(data.SoilMoisture);
    const mappedSoilMoisture = mapSoilMoisture(soilMoistureRaw);

    animateValue("soilmoisturevalue", mappedSoilMoisture, "%");
    animateValue("tempvalue", data.Temperature, "°C");
    animateValue("humidityvalue", data.Humidity, "%");
    animateValue("flowratevalue", data.Flowrate, " lpm");
    animateValue("EtoValue", data.ET0, " mm/day");

    updateValueState("moisturevaluestate", mappedSoilMoisture, 0, 100, 30, 50);
    updateValueState("tempvaluestate", data.Temperature, 0, 50, 24, 40);
    updateValueState("humidityvaluestate", data.Humidity, 0, 100, 30, 60);
  }
};

// ======================= STATUS HANDLING =======================
function setStatusOnline() {
  const statusCards = document.querySelectorAll(".status-card .status");
  statusCards.forEach((el, index) => {
    if (index < 3) {
      el.textContent = "● Online";
    } else {
      el.textContent = "● Pump is currently online";
    }
    el.classList.remove("offline");
    el.classList.add("online");
  });
}

function setStatusOffline() {
  const statusCards = document.querySelectorAll(".status-card .status");
  statusCards.forEach((el) => {
    el.textContent = "● Offline";
    el.classList.remove("online");
    el.classList.add("offline");
  });
}

// ✅ Check offline timeout every 2 seconds
setInterval(() => {
  if (Date.now() - lastUpdateTime > OFFLINE_TIMEOUT) {
    setStatusOffline();
  }
}, 2000);

// ======================= VALUE ANIMATION =======================
function animateValue(id, value, unit) {
  const el = document.getElementById(id);
  if (!el) return;

  const current = parseFloat(el.innerText) || 0;
  const duration = 500;
  const startTime = performance.now();

  function update(currentTime) {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const animated = current + (value - current) * progress;
    el.innerText = animated.toFixed(1) + unit;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

function updateValueState(containerId, value, min, max, normalMin, normalMax) {
  const container = document.getElementById(containerId);
  const label = container.querySelector(".levellabel");
  const level = container.querySelector(".level");

  // --- Determine Status ---
  let status = "";
  if (value < normalMin) status = "low";
  else if (value > normalMax) status = "critical";
  else status = "normal";

  // --- Calculate Target Width ---
  const percent = ((value - min) / (max - min)) * 100;
  const targetWidth = Math.max(0, Math.min(percent, 100));

  // ✅ Get current width (as a number)
  const currentWidth = parseFloat(level.style.width) || 0;

  // ✅ Animate Width
  const duration = 500;
  const startTime = performance.now();

  function animate(time) {
    const progress = Math.min((time - startTime) / duration, 1);
    const animatedWidth = currentWidth + (targetWidth - currentWidth) * progress;
    level.style.width = animatedWidth + "%";

    if (progress < 1) requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  // --- Update Classes ---
  const statusClasses = ["low", "normal", "critical"];
  level.classList.remove(...statusClasses);
  label.classList.remove(...statusClasses);

  level.classList.add(status);
  label.classList.add(status);

  // --- Update Label Text ---
  label.textContent = status.charAt(0).toUpperCase() + status.slice(1);
}


// ======================= JSONP REQUEST =======================
function updateValues() {
  const script = document.createElement("script");
  script.src = `${sheetURL}?callback=handleData&_=${Date.now()}`;
  document.body.appendChild(script);
  script.onload = () => script.remove();
}

// ======================= INIT =======================
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("soilmoisturewetvalue")
    .addEventListener("input", updateThresholds);
  document
    .getElementById("soilmoisturedryvalue")
    .addEventListener("input", updateThresholds);

  updateThresholds();

  updateValues();
  setInterval(updateValues, 5000); // Fetch every 5s
});




