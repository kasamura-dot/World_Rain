# WorldRain

Realistic world rainfall viewer built as a static web app.

## Overview
- Displays a realistic satellite basemap using Leaflet.
- Overlays latest rainfall radar tiles from RainViewer.
- Lets you switch regions quickly (World, Japan, East Asia, Europe, etc.).
- Supports manual refresh and automatic refresh every 10 minutes.

## Files
- `index.html`: App layout and CDN imports (Leaflet CSS/JS).
- `styles.css`: UI and map styling.
- `app.js`: Map initialization, region switching, rainfall layer fetching.

## How to run
1. Open `index.html` directly in your browser.
2. Select a region from `Region`.
3. Click `Refresh Rain` to load the latest rainfall layer.

## Data sources
- Basemap: Esri World Imagery tiles.
- Labels: CARTO light labels.
- Rainfall radar: RainViewer API (`https://api.rainviewer.com/public/weather-maps.json`).

## Notes
- This app requires internet access.
- If rainfall is not shown, try hard reload (`Ctrl + F5`).
- Browser/network policy may affect external tile loading.

## License
MIT
