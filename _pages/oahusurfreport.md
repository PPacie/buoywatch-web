---
layout: page
title: Oahu Surf Report
include_in_header: true
include_in_footer: false
---
<!-- <h1>{{ page.title }}</h1>
<p><strong>Coordinates:</strong> <span id="buoy-coords">Loading...</span></p>

<div id="buoy-data"
     data-buoy="51201"
     data-lat="21.671"
     data-lon="158.118"
     style="background:#1e1e1e;padding:1em;border-radius:10px;color:white;max-width:400px;font-family:sans-serif;">
  
  <p><strong>UPDATED:</strong> <span id="updated-time">Loading...</span></p>

  <div style="display:flex;align-items:center;gap:1em;">
    <span style="font-size:2em;">🌊</span>
    <span id="wave-info" style="color:#f55;">Loading...</span>
  </div>

  <div style="margin-top:0.5em;">
    💨 <span id="wind-info">Loading...</span><br>
    🌡️ <span id="air-temp">Loading...</span><br>
    🌊 <span id="water-temp">Loading...</span>
  </div>
</div>

<h2 style="margin-top:2em;">History</h2>
<canvas id="waveHistoryChart" width="400" height="200" style="background:#1e1e1e;border-radius:10px;"></canvas>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="/assets/js/buoy.js"></script> -->

<h1>Oahu Surf Report</h1>
<p><strong>Location:</strong> 21.671 N, 158.118 W (Waimea Bay, HI (106))</p>

<div id="latest-measure" style="background:#1e1e1e;padding:1em;border-radius:10px;color:white;max-width:400px;font-family:sans-serif;">
  <p><strong>UPDATED:</strong> <span id="updated-time">Loading...</span></p>
  <div style="display:flex;align-items:center;gap:1em;">
    <span style="font-size:2em;">🌊</span>
    <span id="wave-info" style="color:#f55;">Loading...</span>
  </div>
  <div style="margin-top:0.5em;">
    💨 <span id="wind-info">Loading...</span><br>
    🌡️ <span id="air-temp">Loading...</span><br>
    🌊 <span id="water-temp">Loading...</span>
  </div>
</div>

<h2 style="margin-top:2em;">History</h2>
<canvas id="waveHistoryChart" width="400" height="200" style="background:#1e1e1e;border-radius:10px;"></canvas>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
async function loadBuoyData() {
  const res = await fetch('https://www.ndbc.noaa.gov/data/realtime2/51201.txt');
  const text = await res.text();
  const lines = text.trim().split('\n');
  const header = lines[0].split(/\s+/);
  const rows = lines.slice(2, 26).map(l => l.trim().split(/\s+/)); // 24 rows of data

  const latest = rows[0];
  const [YY, MM, DD, hh, mm, WDIR, WSPD, GST, WVHT, DPD, APD, MWD, PRES, ATMP, WTMP] = latest;

  const time = `${MM}/${DD} ${hh}:${mm}`;
  document.getElementById('updated-time').textContent = time;
  document.getElementById('wave-info').textContent = `${WVHT}ft @ ${DPD}s - E ${MWD}°`;
  document.getElementById('wind-info').textContent = `${WSPD} mph - E ${WDIR}°`;
  document.getElementById('air-temp').textContent = `${ATMP}°F`;
  document.getElementById('water-temp').textContent = `${WTMP}°F`;

  // History Chart
  const labels = rows.map(r => `${r[3]}:${r[4]}`); // hh:mm
  const waveHeights = rows.map(r => parseFloat(r[8]));

  new Chart(document.getElementById('waveHistoryChart'), {
    type: 'bar',
    data: {
      labels: labels.reverse(),
      datasets: [{
        label: 'Wave Height (ft)',
        data: waveHeights.reverse(),
        backgroundColor: waveHeights.map(h => {
          if (h >= 10) return '#f44336';     // red
          if (h >= 8) return '#ff9800';      // orange
          if (h >= 5) return '#ffeb3b';      // yellow
          return '#4caf50';                  // green
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

loadBuoyData();
</script>