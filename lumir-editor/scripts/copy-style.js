const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'src', 'style.css');
const outDir = path.join(__dirname, '..', 'dist');
const dest = path.join(outDir, 'style.css');

fs.mkdirSync(outDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log('Copied style.css to dist/style.css');
