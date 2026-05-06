const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let updatedCount = 0;
walkDir('src/app', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // We are looking for `await fetch(`${API_BASE_URL}` or similar
    if (content.includes('await fetch(') && content.includes('API_BASE_URL')) {
      content = content.replace(/await fetch\(\s*\`\$\{API_BASE_URL\}/g, 'await fetchApi(`');
      content = content.replace(/await fetch\(\s*API_BASE_URL \+ /g, 'await fetchApi(');
      
      if (!content.includes('import { fetchApi }')) {
        if (content.includes('@/contants/api')) {
           content = content.replace(/(import.*@\/contants\/api.*)/, '$1\nimport { fetchApi } from "@/lib/api";');
        } else {
           content = 'import { fetchApi } from "@/lib/api";\n' + content;
        }
      }

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log('Updated: ' + filePath);
        updatedCount++;
      }
    }
  }
});
console.log('Total updated files: ' + updatedCount);
