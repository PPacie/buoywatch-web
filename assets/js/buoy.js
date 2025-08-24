// File: assets/js/buoy.js

document.addEventListener("DOMContentLoaded", async () => {
  const el = document.getElementById("buoy-data");
  if (!el) return;

  const buoyId = el.dataset.buoy;
  const lat = el.dataset.lat;
  const lon = el.dataset.lon;

  try {
    const res = await fetch(`https://www.ndbc.noaa.gov/data/realtime2/${buoyId}.txt`);
    const text = await res.text();
    const lines = text.trim().split("\n");
    const rows = lines.slice(2, 26).map(l => l.trim().split(/\s+/)); // skip header + column line

    // latest row
    const latest = rows[0];
    // Format is [YY, MM, DD, hh, mm, WDIR, WSPD, GST, WVHT, DPD, APD, MWD, PRES, ATMP, WTMP, DEWP, VIS, TIDE]
    const [YY, MM, DD, hh, mm, WDIR, WSPD, GST, WVHT, DPD, APD, MWD, PRES, ATMP, WTMP] = latest;

    document.getElementById("updated-time").textContent = `${MM}/${DD} ${hh}:${mm}`;
    document.getElementById("wave-info").textContent = `${WVHT} ft @ ${DPD}s - Dir ${MWD}°`;
    document.getElementById("wind-info").textContent = `${WSPD} kn - Dir ${WDIR}°`;
    document.getElementById("air-temp").textContent = `${ATMP} °C`;
    document.getElementById("water-temp").textContent = `${WTMP} °C`;
    document.getElementById("buoy-coords").textContent = `${lat}, ${lon}`;

    // History chart
    const labels = rows.map(r => `${r[3]}:${r[4]}`);
    const waveHeights = rows.map(r => parseFloat(r[8]));

    new Chart(document.getElementById("waveHistoryChart"), {
      type: "bar",
      data: {
        labels: labels.reverse(),
        datasets: [{
          label: "Wave Height (ft)",
          data: waveHeights.reverse(),
          backgroundColor: waveHeights.map(h => {
            if (h >= 10) return "#f44336";
            if (h >= 8) return "#ff9800";
            if (h >= 5) return "#ffeb3b";
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
  } catch (err) {
    document.getElementById("buoy-data").innerHTML = `<p style="color:red;">Error loading buoy data</p>`;
    console.error("Buoy fetch error:", err);
  }
});