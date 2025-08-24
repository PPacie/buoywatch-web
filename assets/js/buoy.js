// File: assets/js/buoy.js

document.addEventListener("DOMContentLoaded", async () => {
  const el = document.getElementById("buoy-data");
  if (!el) return;

  const buoyId = el.dataset.buoy;
  const lat = el.dataset.lat;
  const lon = el.dataset.lon;

  const proxyUrl = "https://api.allorigins.win/raw?url=";
  const targetUrl = `https://www.ndbc.noaa.gov/data/realtime2/${buoyId}.txt`;

  try {
    const res = await fetch(proxyUrl + encodeURIComponent(targetUrl));
    if (!res.ok) throw new Error("Fetch failed");
    const text = await res.text();

    const lines = text.trim().split("\n");
    if (lines.length < 3) throw new Error("No data");

    // Parse header line to map column names → index
    const header = lines[0].replace(/^#/, "").trim().split(/\s+/);
    const colIndex = {};
    header.forEach((h, i) => colIndex[h] = i);

    // Extract rows (skip first 2 header lines)
    const rows = lines.slice(2, 26).map(l => l.trim().split(/\s+/));
    const latest = rows[0];

    // Helper: get field safely
    const getField = (name) => {
      const idx = colIndex[name];
      if (idx === undefined) return null;
      const val = latest[idx];
      return (val && val !== "MM") ? val : null;
    };

    // Extract dynamically
    const time = `${getField("MM") || latest[colIndex["MM"]]}-${getField("DD") || latest[2]} ${getField("hh")}:${getField("mm")}`;
    const wvht = getField("WVHT"); // Wave height
    const dpd  = getField("DPD");  // Dominant wave period
    const wdir = getField("WDIR"); // Wind direction
    const wspd = getField("WSPD"); // Wind speed
    const atmp = getField("ATMP");
    const wtmp = getField("WTMP");

    // Fill DOM dynamically (only if available)
    document.getElementById("updated-time").textContent = time;
    document.getElementById("wave-info").textContent =
      wvht ? `${wvht} m ${dpd ? ` @ ${dpd}s` : ""}` : "No wave data";
    document.getElementById("wind-info").textContent =
      wspd ? `${wspd} m/s ${wdir ? `Dir ${wdir}°` : ""}` : "No wind data";
    document.getElementById("air-temp").textContent =
      atmp ? `${atmp} °C` : "N/A";
    document.getElementById("water-temp").textContent =
      wtmp ? `${wtmp} °C` : "N/A";
    document.getElementById("buoy-coords").textContent = `${lat}, ${lon}`;

    // Build wave height history chart if WVHT exists
    if (colIndex["WVHT"] !== undefined) {
      const labels = rows.map(r => `${r[colIndex["hh"]]}:${r[colIndex["mm"]]}`);
      const waveHeights = rows.map(r => {
        const val = r[colIndex["WVHT"]];
        return (val && val !== "MM") ? parseFloat(val) : 0;
      });

      new Chart(document.getElementById("waveHistoryChart"), {
        type: "bar",
        data: {
          labels: labels.reverse(),
          datasets: [{
            label: "Wave Height (m)",
            data: waveHeights.reverse(),
            backgroundColor: waveHeights.map(h => {
              if (h >= 3) return "#f44336"; // high waves
              if (h >= 2) return "#ff9800"; // medium
              if (h >= 1) return "#ffeb3b"; // low
              return "#4caf50";             // calm
            })
          }]
        },
        options: {
          plugins: { legend: { display: false }},
          scales: {
            x: { ticks: { color: "white" }},
            y: { ticks: { color: "white" }, beginAtZero: true }
          }
        }
      });
    } else {
      document.getElementById("waveHistoryChart").outerHTML =
        "<p>No wave history data available</p>";
    }
  } catch (err) {
    document.getElementById("buoy-data").innerHTML =
      `<p style="color:red;">Error loading buoy data: ${err.message}</p>`;
    console.error("Buoy fetch error:", err);
  }
});