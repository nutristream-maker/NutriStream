const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../../extracted_paths_split.json');
const OUTPUT_FILE = path.join(__dirname, '../../src/components/body/AnatomyPaths.ts');

// Robust Centroid Calculation
function computeCentroid(d) {
    const tokens = d.match(/[a-zA-Z]|[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?/g);
    if (!tokens) return { x: 0, y: 0 };

    let curX = 0, curY = 0;
    let sumX = 0, sumY = 0, count = 0;
    let currentCmd = 'M';

    let i = 0;
    while (i < tokens.length) {
        const t = tokens[i];
        if (/[a-zA-Z]/.test(t)) {
            currentCmd = t;
            i++;
        } else {
            const isRelative = (currentCmd === currentCmd.toLowerCase());
            const cmdType = currentCmd.toUpperCase();

            let pairsToConsume = 1;
            if (cmdType === 'C') pairsToConsume = 3;
            else if (cmdType === 'Z') pairsToConsume = 0;

            for (let p = 0; p < pairsToConsume; p++) {
                if (i + 1 >= tokens.length) break;

                const valX = parseFloat(tokens[i]);
                const valY = parseFloat(tokens[i + 1]);
                i += 2;

                let absX = valX;
                let absY = valY;

                if (isRelative) {
                    absX = curX + valX;
                    absY = curY + valY;
                }

                sumX += absX;
                sumY += absY;
                count++;

                if (p === pairsToConsume - 1) {
                    curX = absX;
                    curY = absY;
                }
            }
        }
    }

    return count > 0 ? { x: sumX / count, y: sumY / count } : { x: 0, y: 0 };
}

// Muscle Definitions (Calibrated)
// Front: X < 1024. Center X ~450. Y Range 2000-2450.
// Back: X > 1024. Center X ~1900. Y Range 450-1200.

const MUSCLES = {
    FRONT: [
        { name: 'Trapecio', yMin: 1980, yMax: 2060, xMin: 250, xMax: 650 },
        { name: 'Deltoides', yMin: 2060, yMax: 2120, xExclude: [380, 520] },
        { name: 'Pectoral', yMin: 2060, yMax: 2140, xMin: 300, xMax: 600 },
        { name: 'Bíceps', yMin: 2100, yMax: 2200, xExclude: [350, 550] },
        { name: 'Abdominales', yMin: 2140, yMax: 2220, xMin: 380, xMax: 520 },
        { name: 'Oblicuos', yMin: 2140, yMax: 2230, xExclude: [380, 520] },
        { name: 'Antebrazo', yMin: 2200, yMax: 2320, xExclude: [350, 550] },
        { name: 'Cuádriceps', yMin: 2230, yMax: 2340 },
        { name: 'Tibiales', yMin: 2340, yMax: 2500 }
    ],
    BACK: [
        { name: 'Trapecio', yMin: 450, yMax: 550, xMin: 1600, xMax: 2200 },
        { name: 'Deltoides', yMin: 500, yMax: 620, xExclude: [1800, 2000] },
        { name: 'Tríceps', yMin: 600, yMax: 820, xExclude: [1800, 2000] },
        { name: 'Dorsales', yMin: 550, yMax: 850, xMin: 1750, xMax: 2050 },
        { name: 'Antebrazo', yMin: 820, yMax: 1000, xExclude: [1750, 2050] },
        { name: 'Glúteos', yMin: 850, yMax: 980 },
        { name: 'Isquiotibiales', yMin: 980, yMax: 1100 },
        { name: 'Gemelos', yMin: 1100, yMax: 1300 }
    ]
};

function mapPath(pathObj) {
    if (pathObj.id === 0 || pathObj.id === 1) return null;

    const point = computeCentroid(pathObj.d);
    point.x += 450; // Apply offset

    const isFront = point.x < 1024;
    const candidates = isFront ? MUSCLES.FRONT : MUSCLES.BACK;

    // Strict containment
    for (const m of candidates) {
        let yMatch = point.y >= m.yMin && point.y <= m.yMax;
        if (!yMatch) continue;

        let xMatch = true;
        if (m.xMin !== undefined && point.x < m.xMin) xMatch = false;
        if (m.xMax !== undefined && point.x > m.xMax) xMatch = false;
        if (m.xExclude) {
            if (point.x >= m.xExclude[0] && point.x <= m.xExclude[1]) xMatch = false;
        }

        if (xMatch) {
            return { ...m, side: isFront ? 'front' : 'back', id: pathObj.id };
        }
    }

    // Fallback
    if (isFront) {
        if (point.y < 2140) return { name: 'Pectoral', side: 'front', id: pathObj.id };
        if (point.y < 2230) return { name: 'Abdominales', side: 'front', id: pathObj.id };
        if (point.y < 2340) return { name: 'Cuádriceps', side: 'front', id: pathObj.id };
        return { name: 'Tibiales', side: 'front', id: pathObj.id };
    } else {
        if (point.y < 550) return { name: 'Trapecio', side: 'back', id: pathObj.id };
        if (point.y < 850) return { name: 'Dorsales', side: 'back', id: pathObj.id };
        if (point.y < 980) return { name: 'Glúteos', side: 'back', id: pathObj.id };
        if (point.y < 1100) return { name: 'Isquiotibiales', side: 'back', id: pathObj.id };
        return { name: 'Gemelos', side: 'back', id: pathObj.id };
    }
}

// Execution
const rawData = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
const mappedGroups = {};

console.log(`Processing ${rawData.length} paths...`);

rawData.forEach(p => {
    const mapping = mapPath(p);
    if (!mapping) return;

    const key = `${mapping.name}_${mapping.side}`;
    if (!mappedGroups[key]) {
        mappedGroups[key] = {
            name: mapping.name,
            side: mapping.side,
            paths: []
        };
    }
    mappedGroups[key].paths.push(p.d);
});

let output = `export const extractedAnatomyPaths = [\n`;

Object.values(mappedGroups).forEach(group => {
    const combinedD = group.paths.join(' ');
    output += `  {\n`;
    output += `    "name": "${group.name}",\n`;
    output += `    "d": "${combinedD}",\n`;
    output += `    "side": "${group.side}",\n`;
    output += `    "bounds": { "minX": 0, "maxX": 0 }\n`;
    output += `  },\n`;
});

output += `];\n`;

fs.writeFileSync(OUTPUT_FILE, output);
console.log(`Generated AnatomyPaths.ts with ${Object.keys(mappedGroups).length} muscle groups.`);
console.log("Groups:", Object.keys(mappedGroups));
