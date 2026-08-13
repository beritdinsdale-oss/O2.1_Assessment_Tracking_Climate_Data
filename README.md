# Tracking Climate Data — revision 3

Upload these files directly to the repository root:

- index.html
- styles.css
- app.js
- README.md

## Fix in revision 3
The graph above each interpretation question is now created only when that question
becomes visible. This avoids Chart.js rendering a zero-size/blank chart inside hidden
question panels.

The HTML also references `styles.css?v=3` and `app.js?v=3` to reduce stale browser/Canvas
caching after deployment.

Other retained changes:
- Working Kaltura xmACIS tutorial embed
- Video heading: Learn how to look up weather-station data
- Dedicated Corvallis graph exploration page
- Final xmACIS local-station exploration
- Garden Journal handoff
