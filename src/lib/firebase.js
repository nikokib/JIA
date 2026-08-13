// src/lib/firebase.js
// Configuración e inicialización de Firebase / Firestore.
// Las claves NUNCA se hardcodean acá: se leen del archivo .env
// (ver .env.example) para no subirlas al repositorio.

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/* ============================================================
   REGLAS DE FIRESTORE — pegar esto en Firebase Console
   (Firestore Database → Reglas), reemplazando lo que haya.

   Permiten crear y leer documentos en "respuestas" sin
   restricción, porque los datos son anónimos por diseño
   (nunca se guarda identidad del alumno). No se permite
   editar ni borrar, para que nadie pueda alterar resultados
   ya cargados.

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /respuestas/{docId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if false;
    }
  }
}
   ============================================================ */
