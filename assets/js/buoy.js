// File: assets/js/buoy.js

async function loadBuoyDataFromPage() {
  const el = document.getElementById("buoy-data");
  const buoyId = el.dataset.buoy;
  const lat = el.dataset.lat;
  const lon = el.dataset.lon;

  const res = await fetch(`https://www.ndbc.noaa.gov/data/realtime2/${buoyId}.txt`);
  const text = await res.text();
  const lines = text.trim().split('\n');
  const rows = lines.slice(2, 26).map(l => l.trim().split(/\s+/));

  const latest = rows[0];
  const [YY, MM, DD, hh, mm, WDIR, WSPD, GST, WVHT, DPD, APD, MWD, PRES, ATMP, WTMP] = latest;

  const time = `${MM}/${DD} ${hh}:${mm}`;
  document.getElementById('updated-time').textContent = time;
  document.getElementById('wave-info').textContent = `${WVHT}ft @ ${DPD}s - E ${MWD}°`;
  document.getElementById('wind-info').textContent = `${WSPD} mph - E ${WDIR}°`;
  document.getElementById('air-temp').textContent = `${ATMP}°F`;
  document.getElementById('water-temp').textContent = `${WTMP}°F`;
  document.getElementById('buoy-coords').textContent = `${lat}, ${lon}`;

  const labels = rows.map(r => `${r[3]}:${r[4]}`);
  const waveHeights = rows.map(r => parseFloat(r[8]));

  new Chart(document.getElementById('waveHistoryChart'), {
    type: 'bar',
    data: {
      labels: labels.reverse(),
      datasets: [{
        label: 'Wave Height (ft)',
        data: waveHeights.reverse(),
        backgroundColor: waveHeights.map(h => {
          if (h >= 10) return '#f44336';
          if (h >= 8) return '#ff9800';
          if (h >= 5) return '#ffeb3b';
          return '#4caf50';
        })
      }]
    },
    options: {
      plugins: { legend: { display: false }},
      scales: {
        x: { ticks: { color: 'white' }},
        y: { ticks: { color: 'white' }, beginAtZero: true }
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", loadBuoyDataFromPage);