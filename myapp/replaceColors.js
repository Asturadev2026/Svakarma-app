const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname);
const targetColors = ['#FF001E', '#E60012', '#ff001e', '#e60012'];
const replacementColor = '#8B1A1A';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.expo' && f !== 'assets') {
        walkDir(dirPath, callback);
      }
    } else {
      if (dirPath.endsWith('.js') || dirPath.endsWith('.tsx') || dirPath.endsWith('.ts')) {
        callback(path.join(dir, f));
      }
    }
  });
}

walkDir(directoryPath, function(filePath) {
  if (filePath === __filename) return; // skip this script
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  targetColors.forEach(color => {
    // Replace all occurrences, case insensitive
    const regex = new RegExp(color, 'gi');
    content = content.replace(regex, replacementColor);
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
});

console.log('Color replacement complete.');
