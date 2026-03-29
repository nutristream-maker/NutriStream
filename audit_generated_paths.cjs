const fs = require('fs');
// Mock the export
global.exports = {};
require('./src/components/body/AnatomyPaths.ts');
const paths = exports.extractedAnatomyPaths;

console.log("Found " + paths.length + " muscle groups:");
paths.forEach(p => console.log(`- ${p.name} (Side: ${p.side}) [d length: ${p.d.length}]`));
