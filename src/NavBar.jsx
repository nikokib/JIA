// Barra de navegación fija arriba de la app: permite pasar entre
// "Jugar" y "Panel para autoridades" sin tener que escribir
// #dashboard a mano en la URL.

const TOKENS = {
  boardDark: "#132C21",
  chalkWhite: "#F5F3E7",
  chalkYellow: "#F4C95D",
};

const VISTAS = [
  { key: "juegos", label: "🎮 Jugar" },
  { key: "dashboard", label: "📊 Panel para autoridades" },
];

export default function NavBar({ vista, onCambiarVista }) {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        display: "flex",
        justifyContent: "center",
        gap: 8,
        padding: "10px 16px",
        background: TOKENS.boardDark,
        borderBottom: "1px solid rgba(245,243,231,0.12)",
      }}
    >
      {VISTAS.map((v) => (
        <button
          key={v.key}
          onClick={() => onCambiarVista(v.key)}
          style={{
            fontFamily: "Kalam, system-ui, sans-serif",
            fontSize: 14,
            fontWeight: 700,
            padding: "8px 16px",
            borderRadius: 999,
            border: `2px solid ${
              vista === v.key ? TOKENS.chalkYellow : "rgba(245,243,231,0.25)"
            }`,
            background: vista === v.key ? "rgba(244,201,93,0.15)" : "transparent",
            color: vista === v.key ? TOKENS.chalkYellow : TOKENS.chalkWhite,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          {v.label}
        </button>
      ))}
    </nav>
  );
}
