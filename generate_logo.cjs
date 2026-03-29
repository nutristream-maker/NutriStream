
const fs = require('fs');
const path = require('path');

const inputPath = 'c:/Users/pjll1/OneDrive/Escritorio/pep fill/projecte personal/pagina web/app/ns_10 - copia/public/logo.png';
const outputPath = 'c:/Users/pjll1/OneDrive/Escritorio/pep fill/projecte personal/pagina web/app/ns_10 - copia/src/assets/LogoBase64.ts';

try {
    if (!fs.existsSync(inputPath)) {
        console.error(`Error: Source file not found at ${inputPath}`);
        process.exit(1);
    }

    const imageBuffer = fs.readFileSync(inputPath);
    const base64Image = imageBuffer.toString('base64');
    const fileContent = `export const LOGO_BASE64 = "data:image/png;base64,${base64Image}";`;

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, fileContent);
    console.log(`Successfully generated ${outputPath}`);
} catch (err) {
    console.error('An error occurred:', err);
    process.exit(1);
}
