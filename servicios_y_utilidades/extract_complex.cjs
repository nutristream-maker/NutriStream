
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'src/assets/cuerpo2d.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

// Regex to grab the big D strings
const pathTagRegex = /<path d="([^"]+)"/g;

function transformCoord(x, y) {
    // Transform: translate(0, 2048) scale(0.1, -0.1)
    // Local coords (x,y) -> User coords (x', y')
    return {
        x: (x * 0.1),
        y: (2048 - (y * 0.1))
    };
}

function parseCompoundPath(dString, pathIndex) {
    // Split by command letters M or m
    // We need to keep the delimiter to know if it's relative or absolute
    // But simplest is to regex for /([Mm])\s*(-?[\d.]+(?:\s+-?[\d.]+)?)/g maybe?
    // Actually, arguments can be separated by space or comma or minus.
    // Let's just find "M" or "m" and the following two numbers.

    // Regex matches "M" or "m" followed by optional space, then coords.
    // Coords: num, separator, num.
    const moveRegex = /([Mm])\s*(-?\d+\.?\d*)\s*[, ]?\s*(-?\d+\.?\d*)/g;

    let subPaths = [];
    let match;
    let currentX = 0;
    let currentY = 0;

    // We need to traverse in order to track relative moves.
    // The regex execution stateful loop does exactly this.

    while ((match = moveRegex.exec(dString)) !== null) {
        const cmd = match[1];
        const valX = parseFloat(match[2]);
        const valY = parseFloat(match[3]);

        let absX, absY;

        if (cmd === 'M') {
            absX = valX;
            absY = valY;
        } else { // 'm'
            absX = currentX + valX;
            absY = currentY + valY;
        }

        // Update cursor
        currentX = absX;
        currentY = absY;

        // Get the full string for this subpath (up to next M/m or end)
        // We can slice from match.index to next match.index.
        // Actually, let's just store the start point for identification now.
        // Reconstructing the 'd' split is harder without index math.

        const t = transformCoord(absX, absY);

        subPaths.push({
            pId: pathIndex,
            idx: subPaths.length,
            start: t,
            side: t.x < 1024 ? 'front' : 'back',
            // Store raw start for debug
            rawStart: { x: absX, y: absY }
        });
    }
    return subPaths;
}

let allSubPaths = [];
let idx = 0;
let matchTag;

while ((matchTag = pathTagRegex.exec(svgContent)) !== null) {
    const d = matchTag[1];
    const subs = parseCompoundPath(d, idx);
    allSubPaths = allSubPaths.concat(subs);
    idx++;
}

console.log(JSON.stringify(allSubPaths, null, 2));
