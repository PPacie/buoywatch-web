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

    // Parse header → map column names → index
    const header = lines[0].replace(/^#/, "").trim().split(/\s+/);
    const colIndex = {};
    header.forEach((h, i) => colIndex[h] = i);

    // Extract rows (skip 2 header lines)
    const rows = lines.slice(2, 26).map(l => l.trim().split(/\s+/));
    const latest = rows[0];

    // Helper to get field safely
    const getField = (row, name) => {
      const idx = colIndex[name];
      if (idx === undefined) return null;
      const val = row[idx];
      return (val && val !== "MM") ? val : null;
    };

    // Proper datetime
    const yy = getField(latest, "YY");
    const mo = getField(latest, "MM");
    const dd = getField(latest, "DD");
    const hh = getField(latest, "hh");
    const mn = getField(latest, "mm");
    const timestamp = yy && mo && dd && hh && mn
      ? `${yy}-${mo}-${dd} ${hh}:${mn} UTC`
      : "N/A";

    // Extract fields (only if available)
    const wvht = getField(latest, "WVHT"); // Wave height
    const dpd  = getField(latest, "DPD");  // Dominant period
    const wspd = getField(latest, "WSPD"); // Wind speed
    const wdir = getField(latest, "WDIR"); // Wind dir
    const atmp = getField(latest, "ATMP"); // Air temp
    const wtmp = getField(latest, "WTMP"); // Water temp

    // Fill DOM
    document.getElementById("updated-time").textContent = timestamp;
    document.getElementById("wave-info").textContent =
      wvht ? `${wvht} m${dpd ? ` @ ${dpd}s` : ""}` : "No wave data";
    document.getElementById("wind-info").textContent =
      wspd ? `${wspd} m/s${wdir ? ` dir ${wdir}°` : ""}` : "No wind data";
    document.getElementById("air-temp").textContent =
      atmp ? `${atmp} °C` : "N/A";
    document.getElementById("water-temp").textContent =
      wtmp ? `${wtmp} °C` : "N/A";
    document.getElementById("buoy-coords").textContent = `${lat}, ${lon}`;

    // Build wave height chart if WVHT exists
    if (colIndex["WVHT"] !== undefined) {
      const labels = rows.map(r => {
        const h = getField(r, "hh");
        const m = getField(r, "mm");
        return (h && m) ? `${h}:${m}` : "";
      });

      const waveHeights = rows.map(r => {
        const val = getField(r, "WVHT");
        return val ? parseFloat(val) : 0;
      });

      new Chart(document.getElementById("waveHistoryChart"), {
        type: "bar",
        data: {
          labels: labels.reverse(),
          datasets: [{
            label: "Wave Height (m)",
            data: waveHeights.reverse(),
            backgroundColor: waveHeights.map(h => {
              if (h >= 3) return "#f44336";
              if (h >= 2) return "#ff9800";
              if (h >= 1) return "#ffeb3b";
              return "#4caf50";
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