const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.tsx') || dirFile.endsWith('.ts')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const srcDir = path.join(__dirname, 'src');
const files = walkSync(srcDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes('useSensorContext')) {
    // Replace the function usage
    content = content.replace(/useSensorContext/g, 'useSensorStore');
    
    // Replace the import path from context/SensorContext to store/useSensorStore
    // It could be import { useSensorContext } from '../../context/SensorContext'
    content = content.replace(/from\s+['"]([^'"]*?)context\/SensorContext['"]/g, "from '$1store/useSensorStore'");
    
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Refactored:', file);
  }
});

console.log('Done refactoring Context -> Store');
