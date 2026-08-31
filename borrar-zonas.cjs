/**
 * borrar-zonas.js
 * -----------------------------------------------------------------------
 * Borra de Firestore (colección "respuestas") todos los documentos cuyo
 * campo "region" sea alguno de los 4 valores genéricos de zona, en vez
 * de una comuna real: "Zona Norte", "Zona Sur", "Zona Este", "Zona Oeste".
 *
 * Por defecto corre en modo DRY RUN (solo cuenta y lista, no borra nada).
 * Para borrar de verdad, correr con la flag --confirmar
 *
 * -----------------------------------------------------------------------
 * REQUISITOS PREVIOS
 * -----------------------------------------------------------------------
 * 1. Tener Node.js instalado (ya lo tenés, usás Vite).
 * 2. Descargar la clave de cuenta de servicio de Firebase:
 *      Firebase Console → ⚙️ Configuración del proyecto → Cuentas de
 *      servicio → "Generar nueva clave privada" → se descarga un .json
 * 3. Guardar ese archivo en la misma carpeta que este script, por ejemplo
 *    como "serviceAccountKey.json"
 *    ⚠️ NUNCA subir ese archivo a GitHub ni compartirlo — da acceso total
 *    a tu base de datos. Agregalo a tu .gitignore si usás Git.
 * 4. Instalar la dependencia:
 *      npm install firebase-admin
 *
 * -----------------------------------------------------------------------
 * USO
 * -----------------------------------------------------------------------
 *   node borrar-zonas.js
 *     → modo simulación: muestra cuántos documentos encontró y un
 *       ejemplo de algunos, pero NO borra nada.
 *
 *   node borrar-zonas.js --confirmar
 *     → borra de verdad los documentos encontrados.
 * -----------------------------------------------------------------------
 */

// Nota: firebase-admin v14+ eliminó la API antigua (admin.credential,
// admin.initializeApp namespace). Usamos la API modular nueva.
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const path = require("path");

// Ruta al archivo de credenciales descargado de Firebase.
// Si le pusiste otro nombre, cambiá esta línea.
const RUTA_CREDENCIALES = path.join(__dirname, "serviceAccountKey.json");

const VALORES_A_BORRAR = ["Región Norte", "Región Sur", "Región Este", "Región Centro"];
const COLECCION = "respuestas";
const TAMANO_LOTE = 400; // por debajo del límite de 500 escrituras por batch de Firestore

const modoConfirmado = process.argv.includes("--confirmar");

async function main() {
  let credenciales;
  try {
    credenciales = require(RUTA_CREDENCIALES);
  } catch (e) {
    console.error(
      `\n❌ No se encontró el archivo de credenciales en:\n   ${RUTA_CREDENCIALES}\n\n` +
        "Descargalo desde Firebase Console → Configuración del proyecto → Cuentas de servicio\n" +
        "→ Generar nueva clave privada, y guardalo con ese nombre en esta misma carpeta.\n"
    );
    process.exit(1);
  }

  initializeApp({
    credential: cert(credenciales),
  });

  const db = getFirestore();

  console.log(
    `\nBuscando documentos en "${COLECCION}" con region en: ${VALORES_A_BORRAR.join(", ")}\n`
  );

  // Firestore no permite más de 30 valores en un "in", pero acá son solo 4.
  const snapshot = await db
    .collection(COLECCION)
    .where("region", "in", VALORES_A_BORRAR)
    .get();

  if (snapshot.empty) {
    console.log("✅ No se encontró ningún documento con esos valores. Nada para borrar.");
    process.exit(0);
  }

  console.log(`Encontrados: ${snapshot.size} documento(s).\n`);

  // Muestra un resumen por valor de zona
  const conteoPorZona = {};
  snapshot.forEach((doc) => {
    const region = doc.data().region;
    conteoPorZona[region] = (conteoPorZona[region] || 0) + 1;
  });
  console.table(conteoPorZona);

  if (!modoConfirmado) {
    console.log(
      "\n🔎 Esto fue una simulación (dry run). No se borró nada.\n" +
        "Para borrar de verdad, corré:\n\n   node borrar-zonas.js --confirmar\n"
    );
    process.exit(0);
  }

  // Borrado real, en lotes (batches) para no superar el límite de Firestore
  const docs = snapshot.docs;
  let borrados = 0;

  for (let i = 0; i < docs.length; i += TAMANO_LOTE) {
    const lote = docs.slice(i, i + TAMANO_LOTE);
    const batch = db.batch();
    lote.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    borrados += lote.length;
    console.log(`Borrados ${borrados}/${docs.length}...`);
  }

  console.log(`\n✅ Listo. Se borraron ${borrados} documento(s) de "${COLECCION}".\n`);
  process.exit(0);
}

main().catch((e) => {
  console.error("\n❌ Error inesperado:", e);
  process.exit(1);
});
