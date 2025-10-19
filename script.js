const sheetURL = "https://script.google.com/macros/s/AKfycbw-fiK7u1foT6emshERYpPTTbtBg9UD3XqjlSiR7INbWsl9wQZhP-hy7PUqZml2gdHc0Q/exec";

function animateValue(id, newValue, suffix = "") {
  const element = document.getElementById(id);
  element.classList.add("value-updated");
  setTimeout(() => {
    element.innerText = newValue + suffix;
    element.classList.remove("value-updated");
  }, 300);
}

async function updateValues() {
  try {
    const response = await fetch(sheetURL);
    if (!response.ok) throw new Error("HTTP error " + response.status);

    const data = await response.json();

    animateValue("soilmoisturevalue", data.SoilMoisture, "%");
    animateValue("tempvalue", data.Temperature, "°C");
    animateValue("humidityvalue", data.Humidity, "%");
    animateValue("flowratevalue", data.Flowrate, " lpm");
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

updateValues();
setInterval(updateValues, 5000);
