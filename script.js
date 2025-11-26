// ======================= CONFIG =======================
const sheetURL =
  "https://script.google.com/macros/s/AKfycbwDaYG0HjNxpPyMSXDtf0mp57q7sKWpZPsxdRZ33xQwLp9VUS0UyxqaetxsFXXurtgdWQ/exec";
let lastTimestamp = null;

// ======================= THRESHOLD VARIABLES =======================
let soilMoistureWet = 1024;
let soilMoistureDry = 0;

// ======================= HELPER FUNCTIONS =======================
function clampValue(value) {
  if (value > 1024) return 1020;
  if (value < 0) return 10;
  return value;
}

function mapSoilMoisture(raw) {
  raw = Math.min(Math.max(raw, soilMoistureDry), soilMoistureWet);
  const percentage =
    ((soilMoistureWet - raw) / (soilMoistureWet - soilMoistureDry)) * 100;
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
  const isSame = currentTimestamp && currentTimestamp === lastTimestamp;

  const statusCards = document.querySelectorAll(".status-card .status");

  if (isSame) {
    statusCards.forEach((el) => {
      el.textContent = "● Offline";
      el.classList.remove("online");
      el.classList.add("offline");
    });
  } else {
    statusCards.forEach((el, index) => {
      if (index < 3) {
        el.textContent = "● Online";
      } else {
        el.textContent = "● Pump is currently online";
      }
      el.classList.remove("offline");
      el.classList.add("online");
    });

    // 🔹 Map soil moisture using the calibrated thresholds
    const soilMoistureRaw = parseFloat(data.SoilMoisture);
    const mappedSoilMoisture = mapSoilMoisture(soilMoistureRaw);

    // 🔹 Update UI values
    animateValue("soilmoisturevalue", mappedSoilMoisture, "%");
    animateValue("tempvalue", data.Temperature, "°C");
    animateValue("humidityvalue", data.Humidity, "%");
    animateValue("flowratevalue", data.Flowrate, " lpm");

    // Update the states
    updateValueState("moisturevaluestate", mappedSoilMoisture, 0, 100, 30, 50);
    updateValueState("tempvaluestate", data.Temperature, 0, 50, 24, 40);
    updateValueState("humidityvaluestate", data.Humidity, 0, 100, 30, 50);

    lastTimestamp = currentTimestamp;
  }
};

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

  // --- Calculate Width ---
  const percent = ((value - min) / (max - min)) * 100;
  const width = Math.max(0, Math.min(percent, 100));
  level.style.width = width + "%";

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
  // Set up threshold listeners
  document
    .getElementById("soilmoisturewetvalue")
    .addEventListener("input", updateThresholds);
  document
    .getElementById("soilmoisturedryvalue")
    .addEventListener("input", updateThresholds);

  // Initialize thresholds once
  updateThresholds();

  // Start fetching data
  updateValues();
  setInterval(updateValues, 5000);
});
