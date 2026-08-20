// Detección y selección de "comuna" (Ciudad Autónoma de Buenos Aires)
// para geolocalizar las respuestas de los juegos, en reemplazo de la
// región simulada del prototipo original.
//
// 1. Se intenta geolocalizar al alumno con la Geolocation API del
//    navegador (requiere permiso).
// 2. Con esas coordenadas se busca en qué barrio de CABA cae el
//    punto, usando los polígonos oficiales del Gobierno de la
//    Ciudad (dataset "Barrios", simplificado para no inflar el
//    bundle) — cada barrio pertenece a una única comuna.
// 3. Si la geolocalización falla, el navegador no da permiso, o el
//    punto cae fuera de CABA, se puede elegir la comuna a mano desde
//    <SelectorComuna />. La elección manual siempre puede
//    sobreescribir a la detección automática.
//
// No se guarda la posición exacta del alumno en ningún lado: solo
// el número de comuna resultante, igual que hacía la región
// simulada anterior.

import comunasGeoJSON from "./comunas.json";

export const COMUNAS = Array.from({ length: 15 }, (_, i) => i + 1);

let comunaActual = null; // number entre 1 y 15, o null si todavía no se sabe

export function obtenerComunaActual() {
  return comunaActual;
}

export function fijarComunaActual(numero) {
  comunaActual = numero || null;
}

export function etiquetaComuna(numero) {
  return numero ? `Comuna ${numero}` : "Sin comuna";
}

/* Ray casting sobre el anillo exterior de cada polígono. Alcanza
   para estos barrios, que no tienen islas ni huecos internos. */
function puntoEnAnillo(lon, lat, anillo) {
  let dentro = false;
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [xi, yi] = anillo[i];
    const [xj, yj] = anillo[j];
    const interseca = yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (interseca) dentro = !dentro;
  }
  return dentro;
}

function puntoEnGeometria(lon, lat, geometry) {
  if (geometry.type === "Polygon") {
    return puntoEnAnillo(lon, lat, geometry.coordinates[0]);
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some((poligono) => puntoEnAnillo(lon, lat, poligono[0]));
  }
  return false;
}

/* Devuelve el número de comuna (1-15) para una coordenada, o null si
   el punto cae fuera de la Ciudad de Buenos Aires. */
export function detectarComunaPorCoordenadas(lat, lon) {
  const feature = comunasGeoJSON.features.find((f) => puntoEnGeometria(lon, lat, f.geometry));
  return feature ? feature.properties.comuna : null;
}

/* Pide la ubicación al navegador y devuelve (resolve) la comuna
   detectada. Rechaza —sin lanzar una excepción sin manejar— si el
   navegador no soporta geolocalización, el usuario no da permiso,
   se agota el tiempo de espera, o el punto cae fuera de CABA. En
   todos esos casos conviene mostrar el selector manual. */
export function detectarComunaPorGPS() {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Este navegador no soporta geolocalización."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        const { latitude, longitude } = posicion.coords;
        const comuna = detectarComunaPorCoordenadas(latitude, longitude);
        if (comuna) {
          resolve(comuna);
        } else {
          reject(new Error("La ubicación detectada está fuera de la Ciudad de Buenos Aires."));
        }
      },
      (error) => reject(error),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  });
}
