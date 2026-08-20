// Envuelve App (juegos) y Dashboard (panel para autoridades) con
// una barra de navegación fija, y sincroniza la vista activa con
// el hash de la URL (#dashboard) para mantener compatibilidad con
// enlaces existentes y con el botón atrás/adelante del navegador.

import { useState, useEffect, useCallback } from "react";
import App from "./App.jsx";
import Dashboard from "./Dashboard.jsx";
import NavBar from "./NavBar.jsx";

function vistaDesdeHash() {
  return window.location.hash === "#dashboard" ? "dashboard" : "juegos";
}

export default function AppShell() {
  const [vista, setVista] = useState(vistaDesdeHash);

  useEffect(() => {
    const onHashChange = () => setVista(vistaDesdeHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const irAVista = useCallback((nuevaVista) => {
    window.location.hash = nuevaVista === "dashboard" ? "#dashboard" : "";
    setVista(nuevaVista);
  }, []);

  return (
    <>
      <NavBar vista={vista} onCambiarVista={irAVista} />
      {vista === "dashboard" ? <Dashboard /> : <App />}
    </>
  );
}
