---
layout: page
title: Oahu Surf Report
include_in_header: true
include_in_footer: false
---

<h1>{{ page.title }}</h1>
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
<script src="/assets/js/buoy.js"></script>