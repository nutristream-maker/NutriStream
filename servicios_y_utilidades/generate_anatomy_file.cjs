
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'src/assets/cuerpo2d.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

function getScreenPoint(x, y) {
    return {
        x: (x * 0.1),
        y: (2048 - (y * 0.1))
    };
}

// Extract subpaths
function extractSubpaths(dString) {
    const moveRegex = /([Mm])\s*(-?\d+\.?\d*)\s*[, ]?\s*(-?\d+\.?\d*)/g;
    let match;

    const commands = [];
    while ((match = moveRegex.exec(dString)) !== null) {
        commands.push({
            index: match.index,
            length: match[0].length,
            cmd: match[1],
            x: parseFloat(match[2]),
            y: parseFloat(match[3])
        });
    }

    const subpaths = [];
    let currentX = 0, currentY = 0;

    for (let i = 0; i < commands.length; i++) {
        const c = commands[i];
        const start = c.index;
        const end = (i + 1 < commands.length) ? commands[i + 1].index : dString.length;

        const rawFullSub = dString.substring(start, end).trim();

        let absX, absY;
        let finalD;

        if (c.cmd === 'M') {
            absX = c.x;
            absY = c.y;
            currentX = absX;
            currentY = absY;
            finalD = rawFullSub;
        } else {
            absX = currentX + c.x;
            absY = currentY + c.y;
            currentX = absX;
            currentY = absY;

            const rest = rawFullSub.substring(c.length);
            finalD = `M ${absX} ${absY} ${rest}`;
        }

        const screen = getScreenPoint(absX, absY);
        subpaths.push({
            d: finalD,
            screen: screen
        });
    }
    return subpaths;
}

const pathTagRegex = /<path d="([^"]+)"/g;
let matchTag;
let pIndex = 0;
const allSubs = [];

while ((matchTag = pathTagRegex.exec(svgContent)) !== null) {
    const d = matchTag[1];
    const subs = extractSubpaths(d);
    subs.forEach((s, idx) => {
        allSubs.push({ pId: pIndex, idx: idx, ...s });
    });
    pIndex++;
}

// Create a lookup map for easy access
const subMap = {};
allSubs.forEach(s => {
    const key = `${s.pId}-${s.idx}`;
    subMap[key] = s;
});

// Helper to get paths by ID list
function getByIds(idList) {
    return idList.map(id => subMap[id]).filter(Boolean);
}

function joinDs(list) {
    return list.map(i => i.d).join(' ');
}

// --- FINAL MAPPING BASED ON USER VERIFICATION ---

const muscles = [];

// FRONT
muscles.push({
    name: "Trapecio",
    d: joinDs(getByIds(["0-2", "0-3", "0-7", "0-8"])),
    side: "front"
});

muscles.push({
    name: "Deltoides",
    d: joinDs(getByIds(["0-13", "0-14", "0-19", "0-18"])),
    side: "front"
});

muscles.push({
    name: "Pectoral",
    d: joinDs(getByIds(["0-15", "0-16"])),
    side: "front"
});

muscles.push({
    name: "Bíceps",
    d: joinDs(getByIds(["0-20", "0-21", "0-24", "0-25", "0-31", "0-34"])),
    side: "front"
});

muscles.push({
    name: "Antebrazo",
    d: joinDs(getByIds(["0-52", "12-1", "0-43", "0-53", "13-1", "0-44"])),
    side: "front"
});

muscles.push({
    name: "Serrato",
    d: joinDs(getByIds(["0-29", "0-35", "0-38", "0-46", "0-50", "0-30", "0-36", "0-39", "0-45", "0-51"])),
    side: "front"
});

muscles.push({
    name: "Dorsales",
    d: joinDs(getByIds(["0-22", "0-23"])),
    side: "front"
});

muscles.push({
    name: "Oblicuos",
    d: joinDs(getByIds(["0-55", "0-56"])),
    side: "front"
});

muscles.push({
    name: "Abdominales",
    d: joinDs(getByIds(["3-1", "4-1", "5-1", "6-1", "7-1", "8-1", "9-1", "10-1"])),
    side: "front"
});

muscles.push({
    name: "Aductores",
    d: joinDs(getByIds(["0-75", "0-74"])),
    side: "front"
});

muscles.push({
    name: "Cuádriceps",
    d: joinDs(getByIds(["0-76", "11-1", "0-81", "0-80", "0-66", "0-77", "0-59", "0-60", "0-57", "0-58"])),
    side: "front"
});

muscles.push({
    name: "Tibiales",
    d: joinDs(getByIds(["0-88", "0-89"])),
    side: "front"
});

muscles.push({
    name: "Gemelos",
    d: joinDs(getByIds(["0-90", "0-91", "0-97", "0-98"])),
    side: "front"
});

// BACK
muscles.push({
    name: "Trapecio",
    d: joinDs(getByIds(["14-2", "14-3"])),
    side: "back"
});

muscles.push({
    name: "Deltoides",
    d: joinDs(getByIds(["14-6", "14-7"])),
    side: "back"
});

muscles.push({
    name: "Dorsales",
    d: joinDs(getByIds(["19-1", "20-1", "14-12", "14-13", "15-1", "16-1"])),
    side: "back"
});

muscles.push({
    name: "Lumbares",
    d: joinDs(getByIds(["21-1", "22-1"])),
    side: "back"
});

muscles.push({
    name: "Oblicuos",
    d: joinDs(getByIds(["14-24", "14-26", "14-25", "14-27"])),
    side: "back"
});

muscles.push({
    name: "Glúteos",
    d: joinDs(getByIds(["25-1", "26-1", "23-1", "24-1"])),
    side: "back"
});

muscles.push({
    name: "Tríceps",
    d: joinDs(getByIds(["14-8", "14-11", "14-9", "14-10"])),
    side: "back"
});

muscles.push({
    name: "Antebrazo",
    d: joinDs(getByIds(["14-15", "14-18", "14-23", "14-16", "14-22", "14-17", "14-14", "14-19", "14-30", "14-29"])),
    side: "back"
});

muscles.push({
    name: "Isquiotibiales",
    d: joinDs(getByIds(["14-38", "14-39", "14-36", "14-37", "14-33", "14-32"])),
    side: "back"
});

muscles.push({
    name: "Aductores",
    d: joinDs(getByIds(["14-35", "14-34"])),
    side: "back"
});

muscles.push({
    name: "Gemelos",
    d: joinDs(getByIds(["14-58", "14-63", "14-64", "14-59"])),
    side: "back"
});

// OUTPUT
const content = `export const extractedAnatomyPaths = ${JSON.stringify(muscles.map(m => ({
    name: m.name,
    d: m.d,
    side: m.side,
    bounds: { minX: 0, maxX: 0 }
})), null, 2)};`;

const outputPath = path.join(__dirname, 'src/components/body/AnatomyPaths.ts');
fs.writeFileSync(outputPath, content, 'utf8');
console.log("✓ File written to " + outputPath + " with " + muscles.length + " muscle groups.");
