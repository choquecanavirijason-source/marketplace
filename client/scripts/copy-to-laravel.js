import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = path.resolve(__dirname, "../out");
const serverPublicDir = path.resolve(__dirname, "../../server/public");

// Archivos esenciales de Laravel que no deben ser sobrescritos por el export
const PRESERVED_FILES = new Set(["index.php", ".htaccess", "storage"]);

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`[export] Error: no existe el directorio fuente "${src}". Ejecuta next build primero.`);
    process.exit(1);
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (PRESERVED_FILES.has(entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log(`[export] Copiando build de Next.js (out/) a Laravel public (${serverPublicDir})...`);
copyRecursive(outDir, serverPublicDir);
console.log(`[export] ✅ Build copiado exitosamente a Laravel public/!`);
