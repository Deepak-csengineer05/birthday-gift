const fs = require('fs');
const path = require('path');
function walkPath(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    let filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkPath(filePath, callback);
    } else {
      callback(filePath);
    }
  });
}
walkPath('E:\\\\App development\\\\lunar_gift\\\\app\\\\src', (filePath) => {
  if (filePath.endsWith('.css')) {
    let original = fs.readFileSync(filePath, 'utf8');
    let modified = original.replace(/100vh/g, '100dvh');
    if (filePath.includes('AdminDashboard.css') || filePath.includes('index.css')) {
       modified = modified.replace(/white-space:\s*nowrap/g, 'white-space: pre-wrap');
    }
    if (original !== modified) {
      fs.writeFileSync(filePath, modified, 'utf8');
      console.log('Fixed:', filePath);
    }
  }
});
