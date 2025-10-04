const fs = require('fs');
const path = require('path');

function printTree(dir, prefix = '', excludeDirs = ['node_modules', 'dist', 'build', '.git']) {
  const files = fs.readdirSync(dir);
  
  // Filter out excluded directories and files starting with dot
  const filteredFiles = files.filter(file => {
    // Skip if it's in excludeDirs
    if (excludeDirs.includes(file)) return false;
    // Skip if it starts with a dot (hidden files/folders)
    if (file.startsWith('.')) return false;
    return true;
  });
  
  filteredFiles.forEach((file, index) => {
    const filePath = path.join(dir, file);
    const isLast = index === filteredFiles.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    
    console.log(prefix + connector + file);
    
    if (fs.statSync(filePath).isDirectory()) {
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      printTree(filePath, newPrefix, excludeDirs);
    }
  });
}

printTree('.');