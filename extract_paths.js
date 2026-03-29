
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'src/assets/cuerpo2d.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

// Regex to find paths
const pathRegex = /<path d="([^"]+)"/g;
const paths = [];
let match;

// Transform logic: scale(0.1, -0.1) translate(0, 2048) -> applied as pre-transform
// The group has transform="translate(0.000000,2048.000000) scale(0.100000,-0.100000)"
// This means points P are transformed as: P' = translate * scale * P
// x' = 0.1 * x
// y' = 2048 + (-0.1 * y) = 2048 - 0.1 * y

function transformCoord(x, y) {
    return {
        x: (x * 0.1).toFixed(2),
        y: (2048 - (y * 0.1)).toFixed(2)
    };
}

function parsePath(d) {
    // Naive parsing just to get centroids. We need to tokenize M, L, c, etc.
    // For centroid, we can just grab all numbers.
    // This is approximate but enough for identification.
    const nums = d.match(/-?[\d.]+/g).map(parseFloat);
    let coords = [];
    // This assumes simplified path structure (pairs of coords), which isn't always true for 'c' (curves have 3 pairs)
    // But usually the first Move command 'M x y' gives a good starting point.
    // Also we care about the average position (centroid) of the whole shape.

    // Better approach: Apply transform to the whole string for the output, 
    // AND calculate average X/Y from the transformed points.

    let transformedD = d.replace(/(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/g, (match, x, y) => {
        const t = transformCoord(parseFloat(x), parseFloat(y));
        coords.push(t);
        return `${t.x} ${t.y}`;
    });

    let sumX = 0, sumY = 0;
    coords.forEach(c => { sumX += parseFloat(c.x); sumY += parseFloat(c.y); });
    const avgX = sumX / coords.length;
    const avgY = sumY / coords.length;

    return {
        d: transformedD,
        centroid: { x: avgX, y: avgY },
        side: avgX < 1024 ? 'front' : 'back'
    };
}

while ((match = pathRegex.exec(svgContent)) !== null) {
    paths.push(parsePath(match[1]));
}

console.log(JSON.stringify(paths, null, 2));
