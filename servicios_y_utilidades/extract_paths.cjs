
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'src/assets/cuerpo2d.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

const pathRegex = /<path d="([^"]+)"/g;
const paths = [];
let match;

function transformCoord(x, y) {
    // Transform: translate(0, 2048) scale(0.1, -0.1)
    return {
        x: (x * 0.1),
        y: (2048 - (y * 0.1))
    };
}

function parsePath(d) {
    // Robust number extraction: match float patterns
    // e.g. -12.5, .5, 12, etc.
    const nums = d.match(/[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/g);

    if (!nums || nums.length < 2) return null;

    let sumX = 0, sumY = 0;
    let count = 0;
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    // We tokenize all numbers. In SVG path, coords usually come in pairs.
    // Even for curves (c dx1 dy1 dx2 dy2 x y), they are all coords or deltas.
    // IMPORTANT: 'c' commands are Relative in SVG if lowercase.
    // 'M' is absolute.
    // If we just average *all numbers* treating them as absolute, we will get garbage if they are relative deltas.
    // Most vectorizers use absolute coordinates (uppercase) or extensive relative strings.
    // The previous file content shows `c` (lowercase) -> Relative!
    // "M5683 19510 c-82 -12..."
    // So the first point is absolute (5683, 19510). The rest are deltas.
    // To get the Cloud/Centroid, we can just use the 'M' start point as a proxy for the location?
    // Or we can simulate the path. Simulating is harder.
    // Given the muscle shapes are generally localized, the 'M' point is usually on the boundary.
    // Let's grab the FIRST pair (M x y) and use that. It's a good enough approximation for identification.

    const startX = parseFloat(nums[0]);
    const startY = parseFloat(nums[1]);

    const t = transformCoord(startX, startY);

    return {
        start: t,
        side: t.x < 1000 ? 'front' : 'back',
        rawD: d.substring(0, 50) + "..."
    };
}

let index = 0;
while ((match = pathRegex.exec(svgContent)) !== null) {
    const info = parsePath(match[1]);
    if (info) {
        paths.push({ id: index, ...info });
    }
    index++;
}

console.log(JSON.stringify(paths, null, 2));
