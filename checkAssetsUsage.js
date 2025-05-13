const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const htmlDir = path.join(__dirname); // Ajustá si tus HTML están en otra carpeta
const reportPath = path.join(__dirname, 'asset_check_report.txt');

let cssFiles = [];
let jsFiles = [];
let htmlFiles = [];
let reportLog = "";

// Registrar en consola y en archivo
function log(msg) {
  console.log(msg);
  reportLog += msg + "\n";
}

function scanFiles(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);

    if (/\s/.test(file)) {
      log(`⚠️  Archivo o carpeta con espacio: ${fullPath}`);
    }

    if (!/^[a-z0-9_\-\.]+$/i.test(file)) {
      log(`⚠️  Nombre no recomendado: ${fullPath}`);
    }

    if (stats.isDirectory()) {
      scanFiles(fullPath);
    } else {
      if (file.endsWith('.css')) cssFiles.push(file);
      if (file.endsWith('.js')) jsFiles.push(file);
      if (file.endsWith('.html')) htmlFiles.push(fullPath);
    }
  });
}

function checkAssetUsage() {
  const usedCSS = new Set();
  const usedJS = new Set();

  htmlFiles.forEach(htmlFile => {
    const content = fs.readFileSync(htmlFile, 'utf-8');
    cssFiles.forEach(css => {
      if (content.includes(css)) usedCSS.add(css);
    });
    jsFiles.forEach(js => {
      if (content.includes(js)) usedJS.add(js);
    });
  });

  log("\n📚 Verificando CSS no usados:");
  cssFiles.forEach(css => {
    if (!usedCSS.has(css)) {
      log(`⚠️  CSS NO usado: ${css}`);
    }
  });

  log("\n📚 Verificando JS no usados:");
  jsFiles.forEach(js => {
    if (!usedJS.has(js)) {
      log(`⚠️  JS NO usado: ${js}`);
    }
  });
}

function saveReport() {
  fs.writeFileSync(reportPath, reportLog, 'utf-8');
  console.log(`\n📄 Reporte guardado en: ${reportPath}`);
}

console.log("🔍 Iniciando verificación de archivos...");
scanFiles(publicDir);
scanFiles(htmlDir);
checkAssetUsage();
saveReport();
console.log("\n✅ Verificación finalizada.");
