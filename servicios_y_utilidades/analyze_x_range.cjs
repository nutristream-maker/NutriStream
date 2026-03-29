const fs = require('fs');
const paths = JSON.parse(fs.readFileSync('extracted_paths_split.json', 'utf8'));

let frontMin = Infinity, frontMax = -Infinity;
let backMin = Infinity, backMax = -Infinity;

paths.forEach(p => {
    // Determine overlapping range based on x
    const minX = p.bounds.minX;
    const maxX = p.bounds.maxX;

    // Heuristic: Front is roughly 0-1000, Back 1000-2000?
    // We'll categorize and find the "gap".
    if (maxX < 1000) {
        frontMin = Math.min(frontMin, minX);
        frontMax = Math.max(frontMax, maxX);
    } else if (minX > 1000) {
        backMin = Math.min(backMin, minX);
        backMax = Math.max(backMax, maxX);
    } else {
        console.log(`Path ${p.id} spans the gap: ${minX.toFixed(1)} - ${maxX.toFixed(1)}`);
    }
});

console.log(`Front View X-Range: ${frontMin.toFixed(1)} to ${frontMax.toFixed(1)}`);
console.log(`Back View X-Range: ${backMin.toFixed(1)} to ${backMax.toFixed(1)}`);
console.log(`Gap: ${backMin - frontMax}`);
