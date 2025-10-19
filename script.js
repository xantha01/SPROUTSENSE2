const SHEET_URL = "https://script.google.com/macros/s/AKfycbwPrINFDczOS70KZnLL1Pgu8Kh_Btckhm7ZT3RhmdXOQlLB9X4tLKIKgB7mCIJg8qJyfg/exec"; // Replace with your actual script URL

async function updateValues() {
  try {
    const response = await fetch(SHEET_URL);
    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    console.log("Fetched data:", data);

    // Example: If your sheet headers are Temperature, Humidity, SoilMoisture, FlowRate
    if (data.length > 0) {
      document.getElementById("temperature").textContent = data[0].Temperature + " °C";
      document.getElementById("humidity").textContent = data[0].Humidity + " %";
      document.getElementById("soil").textContent = data[0].SoilMoisture + " %";
      document.getElementById("flow").textContent = data[0].FlowRate + " L/min";
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Update every 1 second
setInterval(updateValues, 1000);
updateValues();
