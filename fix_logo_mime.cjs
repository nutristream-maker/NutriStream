const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'src/assets/LogoBase64.ts');
try {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('data:image/png;base64,/9j/')) {
        content = content.replace('data:image/png;base64,/9j/', 'data:image/jpeg;base64,/9j/');
        fs.writeFileSync(filePath, content);
        console.log('Successfully fixed LogoBase64.ts MIME type from PNG to JPEG');
    } else {
        console.log('File already has correct MIME type or pattern not found');
    }
} catch (err) {
    console.error('Error fixing file:', err);
}
