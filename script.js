const sheetURL = "https://script.google.com/macros/s/AKfycbwDaYG0HjNxpPyMSXDtf0mp57q7sKWpZPsxdRZ33xQwLp9VUS0UyxqaetxsFXXurtgdWQ/exec";

window.handleData = function(data) {
  console.log("Data received:", data);
  animateValue("soilmoisturevalue", data.SoilMoisture, "%");
  animateValue("tempvalue", data.Temperature, "°C");
  animateValue("humidityvalue", data.Humidity, "%");
  animateValue("flowratevalue", data.Flowrate, " lpm");
};

function updateValues() {
  const script = document.createElement("script");
  script.src = `${sheetURL}?callback=handleData&_=${new Date().getTime()}`;
  document.body.appendChild(script);

  script.onload = () => script.remove();
}

function animateValue(id, value, unit) {
  const element = document.getElementById(id);
  if (!element) return;

  const current = parseFloat(element.innerText) || 0;
  const duration = 500;
  const startTime = performance.now();

  function update(currentTime) {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const animatedValue = current + (value - current) * progress;
    element.innerText = animatedValue.toFixed(1) + unit;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

updateValues();
setInterval(updateValues, 5000);
