const fs = require('fs');
const path = require('path');

// Carpeta raíz del proyecto (ajustá si está en otra ubicación)
const rootDir = path.join(__dirname, 'public');

function checkNames(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);

    if (/\s/.test(file)) {
      console.warn(`⚠️  Archivo o carpeta con espacio detectado: ${fullPath}`);
    }

    if (!/^[a-z0-9_\-\.]+$/.test(file)) {
      console.warn(`⚠️  Nombre con caracteres poco recomendados: ${fullPath}`);
    }

    if (stats.isDirectory()) {
      checkNames(fullPath);
    }
  });
}

console.log("🔍 Verificando nombres de archivos en 'public'...");
checkNames(rootDir);
console.log("✅ Verificación completa.");
