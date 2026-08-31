/**
 * listar-regiones.cjs
 * -----------------------------------------------------------------------
 * Script de SOLO LECTURA. No borra nada.
 * Lista todos los valores únicos que tiene el campo "region" en la
 * colección "respuestas", junto con cuántos documentos tiene cada uno.
 * Sirve para confirmar el texto EXACTO antes de armar un filtro de borrado.
 *
 * Requiere lo mismo que borrar-zonas.cjs: firebase-admin instalado y
 * serviceAccountKey.json en la misma carpeta.
 *
 * USO:
 *   node listar-regiones.cjs
 * -----------------------------------------------------------------------
 */

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const path = require("path");

const RUTA_CREDENCIALES = path.join(__dirname, "serviceAccountKey.json");
const COLECCION = "respuestas";

async function main() {
  let credenciales;
  try {
    credenciales = require(RUTA_CREDENCIALES);
  } catch (e) {
    console.error(
      `\n❌ No se encontró el archivo de credenciales en:\n   ${RUTA_CREDENCIALES}\n`
    );
    process.exit(1);
  }

  initializeApp({ credential: cert(credenciales) });
  const db = getFirestore();

  console.log(`\nLeyendo colección "${COLECCION}"...\n`);

  const snapshot = await db.collection(COLECCION).get();

  if (snapshot.empty) {
    console.log("La colección está vacía.");
    process.exit(0);
  }

  const conteo = {};
  let sinRegion = 0;

  snapshot.forEach((doc) => {
    const region = doc.data().region;
    if (region === undefined || region === null || region === "") {
      sinRegion += 1;
    } else {
      conteo[region] = (conteo[region] || 0) + 1;
    }
  });

  console.log(`Total de documentos: ${snapshot.size}\n`);
  console.log("Valores encontrados en el campo 'region':\n");
  console.table(conteo);

  if (sinRegion > 0) {
    console.log(`\n⚠️  ${sinRegion} documento(s) no tienen campo "region" (vacío o ausente).`);
  }

  process.exit(0);
}

main().catch((e) => {
  console.error("\n❌ Error inesperado:", e);
  process.exit(1);
});
