import { useState, useEffect, useRef, useCallback } from "react";

/* ============================================================
   TOKENS DE DISEÑO
   Tema: pizarrón / tiza — referencia directa al aula.
   Fondo pizarrón verde oscuro, acentos "tiza" de color.
   Tipografía: display tipo tiza manuscrita (Kalam) + cuerpo
   legible (system sans) para no sacrificar lectura en niños.
   ============================================================ */

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&display=swap');`;

const TOKENS = {
  board: "#1B4332",
  boardDark: "#132C21",
  chalkWhite: "#F5F3E7",
  chalkYellow: "#F4C95D",
  chalkCoral: "#E8735F",
  chalkBlue: "#6FB7B7",
  chalkPurple: "#B196C9",
};

/* ============================================================
   BANCO DE PREGUNTAS — MATEMÁTICA (fracciones)
   ============================================================ */
const BANCO_MATE = [
  { id: "m1", contenido: "fracciones-suma", pregunta: "¿Cuánto es 1/2 + 1/4?", opciones: ["3/4", "2/6", "1/6", "3/6"], correcta: 0 },
  { id: "m2", contenido: "fracciones-suma", pregunta: "¿Cuánto es 1/3 + 1/3?", opciones: ["2/6", "2/3", "1/3", "2/9"], correcta: 1 },
  { id: "m3", contenido: "fracciones-resta", pregunta: "¿Cuánto es 3/4 − 1/4?", opciones: ["2/4", "1/2", "Ambas son correctas", "2/8"], correcta: 2 },
  { id: "m4", contenido: "fracciones-equivalentes", pregunta: "¿Cuál fracción es equivalente a 1/2?", opciones: ["2/5", "3/8", "2/4", "1/3"], correcta: 2 },
  { id: "m5", contenido: "fracciones-comparacion", pregunta: "¿Cuál es mayor: 1/3 o 1/4?", opciones: ["1/3", "1/4", "Son iguales", "No se puede saber"], correcta: 0 },
  { id: "m6", contenido: "fracciones-multiplicacion", pregunta: "¿Cuánto es 1/2 × 1/2?", opciones: ["1/2", "1/4", "2/4", "1/1"], correcta: 1 },
  { id: "m7", contenido: "fracciones-suma", pregunta: "¿Cuánto es 2/5 + 1/5?", opciones: ["3/10", "3/5", "1/5", "2/10"], correcta: 1 },
  { id: "m8", contenido: "fracciones-comparacion", pregunta: "¿Cuál es menor: 2/3 o 3/4?", opciones: ["2/3", "3/4", "Son iguales", "No se puede saber"], correcta: 0 },
  { id: "m9", contenido: "fracciones-equivalentes", pregunta: "¿Cuál fracción es equivalente a 2/3?", opciones: ["4/6", "3/4", "2/6", "4/9"], correcta: 0 },
  { id: "m10", contenido: "fracciones-resta", pregunta: "¿Cuánto es 5/6 − 2/6?", opciones: ["3/6", "1/2", "Ambas son correctas", "3/12"], correcta: 2 },
];

/* ============================================================
   BANCO DE PALABRAS — LENGUA (clasificar)
   ============================================================ */
const BANCO_LENGUA = [
  { id: "l1", palabra: "correr", categoria: "verbo" },
  { id: "l2", palabra: "hermoso", categoria: "adjetivo" },
  { id: "l3", palabra: "escuela", categoria: "sustantivo" },
  { id: "l4", palabra: "saltar", categoria: "verbo" },
  { id: "l5", palabra: "rápido", categoria: "adjetivo" },
  { id: "l6", palabra: "ventana", categoria: "sustantivo" },
  { id: "l7", palabra: "comer", categoria: "verbo" },
  { id: "l8", palabra: "azul", categoria: "adjetivo" },
  { id: "l9", palabra: "montaña", categoria: "sustantivo" },
  { id: "l10", palabra: "dormir", categoria: "verbo" },
];

/* ============================================================
   BANCO DE PREGUNTAS — GEOGRAFÍA
   Juego: ¿Dónde está?
   4 preguntas por partida
   ============================================================ */

const BANCO_GEOGRAFIA = [
  {
    id: "g1",
    contenido: "continentes",
    pregunta: "¿En qué continente está Argentina?",
    opciones: ["Europa", "América del Sur", "Asia", "África"],
    correcta: 1,
  },
  {
    id: "g2",
    contenido: "continentes",
    pregunta: "¿En qué continente está Egipto?",
    opciones: ["África", "Europa", "Oceanía", "América"],
    correcta: 0,
  },
  {
    id: "g3",
    contenido: "paises",
    pregunta: "¿Cuál de estos países está en América del Sur?",
    opciones: ["España", "Brasil", "Egipto", "Japón"],
    correcta: 1,
  },
  {
    id: "g4",
    contenido: "oceanos",
    pregunta: "¿Qué océano está entre América y Europa?",
    opciones: [
      "Océano Índico",
      "Océano Pacífico",
      "Océano Atlántico",
      "Océano Ártico",
    ],
    correcta: 2,
  },
  {
    id: "g5",
    contenido: "continentes",
    pregunta: "¿En qué continente está Japón?",
    opciones: ["Asia", "África", "Europa", "Oceanía"],
    correcta: 0,
  },
  {
    id: "g6",
    contenido: "paises",
    pregunta: "¿Cuál es la capital de Argentina?",
    opciones: ["Córdoba", "Rosario", "Buenos Aires", "Mendoza"],
    correcta: 2,
  },
  {
    id: "g7",
    contenido: "continentes",
    pregunta: "¿Cuál es el continente más grande?",
    opciones: ["Europa", "Asia", "África", "Oceanía"],
    correcta: 1,
  },
  {
    id: "g8",
    contenido: "paises",
    pregunta: "¿Cuál de estos países está en Europa?",
    opciones: ["Francia", "Brasil", "India", "México"],
    correcta: 0,
  },
];

const BANCO_ORACIONES = [
  {
    id: "o1",
    palabras: ["El", "perro", "corre", "rápido"],
    correcta: [
      ["El", "perro", "corre", "rápido"],
    ],
  },

  {
    id: "o2",
    palabras: ["La", "niña", "lee", "un", "libro"],
    correcta: [
      ["La", "niña", "lee", "un", "libro"],
    ],
  },

  {
    id: "o3",
    palabras: ["Los", "niños", "juegan", "en", "la", "plaza"],
    correcta: [
      ["Los", "niños", "juegan", "en", "la", "plaza"],
    ],
  },

  {
    id: "o4",
    palabras: ["Mi", "gato", "duerme", "en", "el", "sofá"],
    correcta: [
      ["Mi", "gato", "duerme", "en", "el", "sofá"],
    ],
  },

  {
    id: "o5",
    palabras: ["María", "preparó", "una", "torta", "deliciosa"],
    correcta: [
      ["María", "preparó", "una", "torta", "deliciosa"],
      ["María", "preparó", "una", "deliciosa", "torta"],
    ],
  },
];

const CATEGORIAS = [
  { key: "sustantivo", label: "Sustantivo", color: TOKENS.chalkBlue },
  { key: "verbo", label: "Verbo", color: TOKENS.chalkCoral },
  { key: "adjetivo", label: "Adjetivo", color: TOKENS.chalkYellow },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

  function OrdenarOracion({ onRegistrarRespuesta }) {
  const [oraciones] = useState(() =>
    shuffle(BANCO_ORACIONES).slice(0, 3)
  );

  const [indice, setIndice] = useState(0);

  const [palabrasDisponibles, setPalabrasDisponibles] = useState(() =>
    shuffle(oraciones[0].palabras)
  );

  const [seleccionadas, setSeleccionadas] = useState([]);

  const [estado, setEstado] = useState("jugando");

  const [aciertos, setAciertos] = useState(0);

  const inicioRef = useRef(Date.now());

  const oracion = oraciones[indice];

  // =========================
  // SELECCIONAR PALABRA
  // =========================

  const seleccionarPalabra = (palabra, posicion) => {
    if (estado !== "jugando") return;

    setSeleccionadas((prev) => [...prev, palabra]);

    setPalabrasDisponibles((prev) =>
      prev.filter((_, i) => i !== posicion)
    );
  };

  // =========================
  // QUITAR PALABRA
  // =========================

  const quitarPalabra = (posicion) => {
    if (estado !== "jugando") return;

    const palabra = seleccionadas[posicion];

    setSeleccionadas((prev) =>
      prev.filter((_, i) => i !== posicion)
    );

    setPalabrasDisponibles((prev) => [...prev, palabra]);
  };

  // =========================
  // SIGUIENTE ORACIÓN
  // =========================

  const siguienteOracion = () => {
    if (indice + 1 >= oraciones.length) {
      setEstado("fin");
      return;
    }

    const siguiente = oraciones[indice + 1];

    setIndice((i) => i + 1);

    setPalabrasDisponibles(
      shuffle(siguiente.palabras)
    );

    setSeleccionadas([]);

    setEstado("jugando");

    inicioRef.current = Date.now();
  };

  // =========================
  // COMPROBAR
  // =========================

  const comprobar = () => {
    // Si todavía no eligió todas las palabras,
    // no hacemos nada.
    if (seleccionadas.length !== oracion.palabras.length) {
      return;
    }

    // Comprobamos si la oración armada
    // coincide con ALGUNA de las respuestas correctas.
    const esCorrecta = oracion.correcta.some(
      (correcta) =>
        seleccionadas.every(
          (palabra, i) => palabra === correcta[i]
        )
    );

    const tiempoRespuesta =
      ((Date.now() - inicioRef.current) / 1000).toFixed(1);

    if (esCorrecta) {
      setAciertos((a) => a + 1);
    }

    setEstado(
      esCorrecta ? "correcto" : "incorrecto"
    );

    onRegistrarRespuesta({
      materia: "lengua",
      contenido: "orden-oraciones",
      correcto: esCorrecta,
      tiempoRespuesta: Number(tiempoRespuesta),
      region: regionSimulada(),
    });
  };

  // =========================
  // FINAL
  // =========================

  if (estado === "fin") {
    return (
      <ResultadoFinal
        titulo="¡Juego terminado!"
        detalle={`Ordenaste correctamente ${aciertos} de ${oraciones.length} oraciones`}
        color={TOKENS.chalkPurple}
      />
    );
  }

  // =========================
  // JUEGO
  // =========================

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >

      {/* PROGRESO */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "Kalam",
            fontSize: 18,
            color: TOKENS.chalkWhite,
            opacity: 0.75,
          }}
        >
          Oración {indice + 1} / {oraciones.length}
        </span>

        <span
          style={{
            fontFamily: "Kalam",
            fontSize: 18,
            color: TOKENS.chalkYellow,
          }}
        >
          {aciertos} ✓
        </span>
      </div>

      {/* INSTRUCCIÓN */}

      <h3
        style={{
          fontFamily: "Kalam",
          fontWeight: 700,
          fontSize: 26,
          color: TOKENS.chalkWhite,
          margin: 0,
          textAlign: "center",
        }}
      >
        Ordená la oración
      </h3>

      {/* ORACIÓN ARMADA */}

      <div
        style={{
          minHeight: 100,
          border: `2px dashed ${
            estado === "correcto"
              ? TOKENS.chalkYellow
              : estado === "incorrecto"
              ? TOKENS.chalkCoral
              : "rgba(245,243,231,0.3)"
          }`,
          borderRadius: 14,
          padding: 16,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {seleccionadas.length === 0 ? (
          <span
            style={{
              fontFamily: "Kalam",
              fontSize: 18,
              color: TOKENS.chalkWhite,
              opacity: 0.4,
            }}
          >
            Tocá las palabras en orden...
          </span>
        ) : (
          seleccionadas.map((palabra, i) => (
            <button
              key={`${palabra}-${i}`}
              onClick={() => quitarPalabra(i)}
              disabled={estado !== "jugando"}
              style={{
                fontFamily: "Kalam",
                fontSize: 20,
                color: TOKENS.boardDark,
                background: TOKENS.chalkWhite,
                border: "none",
                borderRadius: 10,
                padding: "8px 14px",
                cursor: "pointer",
              }}
            >
              {palabra}
            </button>
          ))
        )}
      </div>

      {/* PALABRAS DESORDENADAS */}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 10,
        }}
      >
        {palabrasDisponibles.map((palabra, i) => (
          <button
            key={`${palabra}-${i}`}
            onClick={() => seleccionarPalabra(palabra, i)}
            disabled={estado !== "jugando"}
            style={{
              fontFamily: "Kalam",
              fontSize: 19,
              color: TOKENS.chalkWhite,
              background: "rgba(245,243,231,0.06)",
              border: "2px solid rgba(245,243,231,0.25)",
              borderRadius: 10,
              padding: "10px 16px",
              cursor: "pointer",
            }}
          >
            {palabra}
          </button>
        ))}
      </div>

      {/* COMPROBAR */}

      {estado === "jugando" && (
        <button
          onClick={comprobar}
          disabled={
            seleccionadas.length !== oracion.palabras.length
          }
          style={{
            fontFamily: "Kalam",
            fontWeight: 700,
            fontSize: 20,
            color: TOKENS.boardDark,
            background: TOKENS.chalkYellow,
            border: "none",
            borderRadius: 12,
            padding: "12px",
            cursor: "pointer",
            opacity:
              seleccionadas.length === oracion.palabras.length
                ? 1
                : 0.4,
          }}
        >
          Comprobar ✓
        </button>
      )}

      {/* CORRECTO */}

      {estado === "correcto" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "Kalam",
              fontSize: 24,
              color: TOKENS.chalkYellow,
            }}
          >
            ¡Muy bien!
          </div>

          <button
            onClick={siguienteOracion}
            style={{
              fontFamily: "Kalam",
              fontSize: 18,
              color: TOKENS.boardDark,
              background: TOKENS.chalkYellow,
              border: "none",
              borderRadius: 10,
              padding: "10px",
              cursor: "pointer",
            }}
          >
            {indice + 1 === oraciones.length
              ? "Ver resultado"
              : "Siguiente →"}
          </button>
        </div>
      )}

      {/* INCORRECTO */}

      {estado === "incorrecto" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "Kalam",
              fontSize: 22,
              color: TOKENS.chalkCoral,
            }}
          >
            Casi...
          </div>

          <button
            onClick={() => {
              setSeleccionadas([]);

              setPalabrasDisponibles(
                shuffle(oracion.palabras)
              );

              setEstado("jugando");

              inicioRef.current = Date.now();
            }}
            style={{
              fontFamily: "Kalam",
              fontSize: 18,
              color: TOKENS.chalkWhite,
              background: "transparent",
              border: `2px solid ${TOKENS.chalkBlue}`,
              borderRadius: 10,
              padding: "10px",
              cursor: "pointer",
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      )}

    </div>
  );
}

/* ============================================================
   VERDADERO O FALSO — CIENCIAS
   5 preguntas por partida
   ============================================================ */

const BANCO_CIENCIAS = [
  {
    id: "c1",
    contenido: "seres-vivos",
    pregunta: "Los seres humanos son seres vivos.",
    correcta: true,
  },
  {
    id: "c2",
    contenido: "plantas",
    pregunta: "Las plantas necesitan luz para realizar la fotosíntesis.",
    correcta: true,
  },
  {
    id: "c3",
    contenido: "animales",
    pregunta: "Todos los animales pueden vivir fuera del agua.",
    correcta: false,
  },
  {
    id: "c4",
    contenido: "cuerpo-humano",
    pregunta: "El corazón forma parte del sistema circulatorio.",
    correcta: true,
  },
  {
    id: "c5",
    contenido: "materia",
    pregunta: "El agua puede encontrarse en estado sólido, líquido y gaseoso.",
    correcta: true,
  },
  {
    id: "c6",
    contenido: "sistema-solar",
    pregunta: "La Tierra es un planeta del sistema solar.",
    correcta: true,
  },
  {
    id: "c7",
    contenido: "animales",
    pregunta: "Los peces respiran utilizando pulmones como los seres humanos.",
    correcta: false,
  },
  {
    id: "c8",
    contenido: "materia",
    pregunta: "Una piedra es un ser vivo.",
    correcta: false,
  },
  {
    id: "c9",
    contenido: "planetas",
    pregunta: "El Sol es un planeta.",
    correcta: false,
  },
  {
    id: "c10",
    contenido: "cuerpo-humano",
    pregunta: "Los pulmones participan en la respiración.",
    correcta: true,
  },
];

function VerdaderoFalso({ onRegistrarRespuesta }) {
  // Cada partida tiene exactamente 5 preguntas
  const [preguntas] = useState(() =>
    shuffle(BANCO_CIENCIAS).slice(0, 5)
  );

  const [indice, setIndice] = useState(0);
  const [estado, setEstado] = useState("jugando");
  const [seleccion, setSeleccion] = useState(null);

  const [aciertos, setAciertos] = useState(0);
  const [tiempos, setTiempos] = useState([]);

  const inicioRef = useRef(Date.now());

  const pregunta = preguntas[indice];

  // =========================================================
  // RESPONDER
  // =========================================================

  const responder = (respuesta) => {
    if (estado !== "jugando") return;

    const tiempoRespuesta =
      (Date.now() - inicioRef.current) / 1000;

    const esCorrecta =
      respuesta === pregunta.correcta;

    setSeleccion(respuesta);

    if (esCorrecta) {
      setAciertos((a) => a + 1);
    }

    setTiempos((prev) => [
      ...prev,
      tiempoRespuesta,
    ]);

    setEstado("resultado");

    // Registrar respuesta para el dashboard
    onRegistrarRespuesta({
      materia: "ciencias",
      contenido: pregunta.contenido,
      correcto: esCorrecta,
      tiempoRespuesta: Number(
        tiempoRespuesta.toFixed(1)
      ),
      region: regionSimulada(),
    });
  };

  // =========================================================
  // SIGUIENTE PREGUNTA
  // =========================================================

  const siguiente = () => {
    if (indice + 1 >= preguntas.length) {
      setEstado("fin");
      return;
    }

    setIndice((i) => i + 1);
    setSeleccion(null);
    setEstado("jugando");

    inicioRef.current = Date.now();
  };

  // =========================================================
  // ESTADÍSTICAS FINALES
  // =========================================================

  if (estado === "fin") {
    const porcentaje = Math.round(
      (aciertos / preguntas.length) * 100
    );

    const tiempoPromedio =
      tiempos.length > 0
        ? (
            tiempos.reduce((a, b) => a + b, 0) /
            tiempos.length
          ).toFixed(1)
        : "0.0";

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          textAlign: "center",
          padding: "20px 0",
        }}
      >
        <h3
          style={{
            fontFamily: "Kalam",
            fontWeight: 700,
            fontSize: 30,
            color: TOKENS.chalkBlue,
            margin: 0,
          }}
        >
          ¡Juego terminado!
        </h3>

        <p
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 16,
            color: TOKENS.chalkWhite,
            margin: 0,
          }}
        >
          Respondiste las {preguntas.length} preguntas.
        </p>

        {/* ESTADÍSTICAS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginTop: 10,
          }}
        >
          <div
            style={{
              border: `2px solid ${TOKENS.chalkYellow}`,
              borderRadius: 14,
              padding: 16,
            }}
          >
            <div
              style={{
                fontFamily: "Kalam",
                fontSize: 30,
                color: TOKENS.chalkYellow,
              }}
            >
              {aciertos}/{preguntas.length}
            </div>

            <div
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 13,
                color: TOKENS.chalkWhite,
                opacity: 0.7,
              }}
            >
              Aciertos
            </div>
          </div>

          <div
            style={{
              border: `2px solid ${TOKENS.chalkBlue}`,
              borderRadius: 14,
              padding: 16,
            }}
          >
            <div
              style={{
                fontFamily: "Kalam",
                fontSize: 30,
                color: TOKENS.chalkBlue,
              }}
            >
              {porcentaje}%
            </div>

            <div
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 13,
                color: TOKENS.chalkWhite,
                opacity: 0.7,
              }}
            >
              Precisión
            </div>
          </div>
        </div>

        <div
          style={{
            borderRadius: 14,
            padding: 14,
            background: "rgba(245,243,231,0.06)",
          }}
        >
          <span
            style={{
              fontFamily: "Kalam",
              fontSize: 20,
              color: TOKENS.chalkWhite,
            }}
          >
            ⏱ Tiempo promedio: {tiempoPromedio} s
          </span>
        </div>

        <p
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 13,
            color: TOKENS.chalkWhite,
            opacity: 0.5,
            margin: 0,
          }}
        >
          Los datos de esta partida quedaron registrados
          para las estadísticas.
        </p>
      </div>
    );
  }

  // =========================================================
  // JUEGO
  // =========================================================

  const respondida = estado === "resultado";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {/* PROGRESO */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "Kalam",
            fontSize: 18,
            color: TOKENS.chalkWhite,
            opacity: 0.75,
          }}
        >
          Pregunta {indice + 1} / {preguntas.length}
        </span>

        <span
          style={{
            fontFamily: "Kalam",
            fontSize: 18,
            color: TOKENS.chalkYellow,
          }}
        >
          {aciertos} ✓
        </span>
      </div>

      {/* TÍTULO */}

      <h3
        style={{
          fontFamily: "Kalam",
          fontWeight: 700,
          fontSize: 26,
          color: TOKENS.chalkWhite,
          margin: 0,
          textAlign: "center",
        }}
      >
        ¿Verdadero o falso?
      </h3>

      {/* PREGUNTA */}

      <div
        style={{
          minHeight: 150,
          border: "2px dashed rgba(245,243,231,0.25)",
          borderRadius: 16,
          padding: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontFamily: "Kalam",
            fontSize: 24,
            color: TOKENS.chalkWhite,
            lineHeight: 1.4,
          }}
        >
          {pregunta.pregunta}
        </span>
      </div>

      {/* RESPUESTAS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
        }}
      >
        {/* VERDADERO */}

        <button
          onClick={() => responder(true)}
          disabled={respondida}
          style={{
            fontFamily: "Kalam",
            fontWeight: 700,
            fontSize: 21,
            padding: "18px 10px",
            borderRadius: 14,

            border:
              seleccion === true
                ? `3px solid ${TOKENS.chalkYellow}`
                : "2px solid rgba(244,201,93,0.5)",

            background:
              respondida && pregunta.correcta === true
                ? "rgba(244,201,93,0.25)"
                : seleccion === true &&
                  pregunta.correcta === false
                ? "rgba(232,115,95,0.25)"
                : "rgba(245,243,231,0.06)",

            color: TOKENS.chalkWhite,

            cursor: respondida
              ? "default"
              : "pointer",

            transition: "all 0.15s ease",
          }}
        >
          ✓ Verdadero
        </button>

        {/* FALSO */}

        <button
          onClick={() => responder(false)}
          disabled={respondida}
          style={{
            fontFamily: "Kalam",
            fontWeight: 700,
            fontSize: 21,
            padding: "18px 10px",
            borderRadius: 14,

            border:
              seleccion === false
                ? `3px solid ${TOKENS.chalkCoral}`
                : "2px solid rgba(232,115,95,0.5)",

            background:
              respondida && pregunta.correcta === false
                ? "rgba(244,201,93,0.25)"
                : seleccion === false &&
                  pregunta.correcta === true
                ? "rgba(232,115,95,0.25)"
                : "rgba(245,243,231,0.06)",

            color: TOKENS.chalkWhite,

            cursor: respondida
              ? "default"
              : "pointer",

            transition: "all 0.15s ease",
          }}
        >
          ✗ Falso
        </button>
      </div>

      {/* RESULTADO */}

      {respondida && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "Kalam",
              fontSize: 23,
              color:
                seleccion === pregunta.correcta
                  ? TOKENS.chalkYellow
                  : TOKENS.chalkCoral,
            }}
          >
            {seleccion === pregunta.correcta
              ? "¡Correcto! 🎉"
              : "No es correcto"}
          </div>

          <div
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: 14,
              color: TOKENS.chalkWhite,
              opacity: 0.7,
            }}
          >
            La respuesta correcta es{" "}
            <strong>
              {pregunta.correcta
                ? "VERDADERO"
                : "FALSO"}
            </strong>
          </div>

          <button
            onClick={siguiente}
            style={{
              fontFamily: "Kalam",
              fontWeight: 700,
              fontSize: 19,
              color: TOKENS.boardDark,
              background: TOKENS.chalkYellow,
              border: "none",
              borderRadius: 12,
              padding: "12px",
              cursor: "pointer",
            }}
          >
            {indice + 1 === preguntas.length
              ? "Ver estadísticas →"
              : "Siguiente →"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   JUEGO — GEOGRAFÍA
   ¿DÓNDE ESTÁ?
   4 preguntas por partida
   ============================================================ */

function Geografia({ onRegistrarRespuesta }) {
  const [preguntas] = useState(() =>
    shuffle(BANCO_GEOGRAFIA).slice(0, 4)
  );

  const [indice, setIndice] = useState(0);
  const [seleccion, setSeleccion] = useState(null);
  const [estado, setEstado] = useState("jugando");
  const [aciertos, setAciertos] = useState(0);
  const [tiempos, setTiempos] = useState([]);

  const inicioRef = useRef(Date.now());

  const pregunta = preguntas[indice];

  /* =========================================================
     RESPONDER
     ========================================================= */

  const responder = (opcionIdx) => {
    if (estado !== "jugando") return;

    const tiempoRespuesta =
      (Date.now() - inicioRef.current) / 1000;

    const esCorrecta =
      opcionIdx === pregunta.correcta;

    setSeleccion(opcionIdx);

    if (esCorrecta) {
      setAciertos((a) => a + 1);
    }

    setTiempos((prev) => [
      ...prev,
      tiempoRespuesta,
    ]);

    setEstado("resultado");

    // Registrar respuesta para las estadísticas
    onRegistrarRespuesta({
      materia: "geografia",
      contenido: pregunta.contenido,
      correcto: esCorrecta,
      tiempoRespuesta: Number(
        tiempoRespuesta.toFixed(1)
      ),
      region: regionSimulada(),
    });
  };

  /* =========================================================
     SIGUIENTE PREGUNTA
     ========================================================= */

  const siguiente = () => {
    if (indice + 1 >= preguntas.length) {
      setEstado("fin");
      return;
    }

    setIndice((i) => i + 1);
    setSeleccion(null);
    setEstado("jugando");

    inicioRef.current = Date.now();
  };

  /* =========================================================
     ESTADÍSTICAS FINALES
     ========================================================= */

  if (estado === "fin") {
    const porcentaje = Math.round(
      (aciertos / preguntas.length) * 100
    );

    const tiempoPromedio =
      tiempos.length > 0
        ? (
            tiempos.reduce((a, b) => a + b, 0) /
            tiempos.length
          ).toFixed(1)
        : "0.0";

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          textAlign: "center",
          padding: "20px 0",
        }}
      >
        <h3
          style={{
            fontFamily: "Kalam",
            fontWeight: 700,
            fontSize: 30,
            color: TOKENS.chalkBlue,
            margin: 0,
          }}
        >
          ¡Viaje terminado!
        </h3>

        <p
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 16,
            color: TOKENS.chalkWhite,
            margin: 0,
          }}
        >
          Completaste las {preguntas.length} preguntas.
        </p>

        {/* ESTADÍSTICAS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginTop: 10,
          }}
        >
          {/* ACIERTOS */}

          <div
            style={{
              border: `2px solid ${TOKENS.chalkYellow}`,
              borderRadius: 14,
              padding: 16,
            }}
          >
            <div
              style={{
                fontFamily: "Kalam",
                fontSize: 30,
                color: TOKENS.chalkYellow,
              }}
            >
              {aciertos}/{preguntas.length}
            </div>

            <div
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 13,
                color: TOKENS.chalkWhite,
                opacity: 0.7,
              }}
            >
              Aciertos
            </div>
          </div>

          {/* PRECISIÓN */}

          <div
            style={{
              border: `2px solid ${TOKENS.chalkBlue}`,
              borderRadius: 14,
              padding: 16,
            }}
          >
            <div
              style={{
                fontFamily: "Kalam",
                fontSize: 30,
                color: TOKENS.chalkBlue,
              }}
            >
              {porcentaje}%
            </div>

            <div
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 13,
                color: TOKENS.chalkWhite,
                opacity: 0.7,
              }}
            >
              Precisión
            </div>
          </div>
        </div>

        {/* TIEMPO */}

        <div
          style={{
            borderRadius: 14,
            padding: 14,
            background: "rgba(245,243,231,0.06)",
          }}
        >
          <span
            style={{
              fontFamily: "Kalam",
              fontSize: 20,
              color: TOKENS.chalkWhite,
            }}
          >
            ⏱ Tiempo promedio: {tiempoPromedio} s
          </span>
        </div>

        <p
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 13,
            color: TOKENS.chalkWhite,
            opacity: 0.5,
            margin: 0,
          }}
        >
          Los datos de esta partida quedaron registrados
          para las estadísticas.
        </p>
      </div>
    );
  }

  /* =========================================================
     JUEGO
     ========================================================= */

  const respondida = estado === "resultado";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 22,
      }}
    >
      {/* PROGRESO */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "Kalam",
            fontSize: 18,
            color: TOKENS.chalkWhite,
            opacity: 0.75,
          }}
        >
          Pregunta {indice + 1} / {preguntas.length}
        </span>

        <span
          style={{
            fontFamily: "Kalam",
            fontSize: 18,
            color: TOKENS.chalkYellow,
          }}
        >
          {aciertos} ✓
        </span>
      </div>

      {/* TÍTULO */}

      <h3
        style={{
          fontFamily: "Kalam",
          fontWeight: 700,
          fontSize: 27,
          color: TOKENS.chalkWhite,
          margin: 0,
          textAlign: "center",
        }}
      >
        🌎 ¿Dónde está?
      </h3>

      {/* PREGUNTA */}

      <div
        style={{
          minHeight: 130,
          border: "2px dashed rgba(245,243,231,0.25)",
          borderRadius: 16,
          padding: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontFamily: "Kalam",
            fontSize: 24,
            color: TOKENS.chalkWhite,
            lineHeight: 1.4,
          }}
        >
          {pregunta.pregunta}
        </span>
      </div>

      {/* OPCIONES */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {pregunta.opciones.map((opcion, i) => {
          const esSeleccionada = seleccion === i;
          const esCorrecta = pregunta.correcta === i;

          let background =
            "rgba(245,243,231,0.06)";

          let border =
            "2px solid rgba(245,243,231,0.25)";

          if (estado === "resultado") {
            if (esCorrecta) {
              background =
                "rgba(244,201,93,0.20)";
              border =
                `2px solid ${TOKENS.chalkYellow}`;
            } else if (
              esSeleccionada &&
              !esCorrecta
            ) {
              background =
                "rgba(232,115,95,0.20)";
              border =
                `2px solid ${TOKENS.chalkCoral}`;
            }
          }

          return (
            <button
              key={i}
              onClick={() => responder(i)}
              disabled={respondida}
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 16,
                color: TOKENS.chalkWhite,
                background,
                border,
                borderRadius: 12,
                padding: "15px 12px",
                cursor: respondida
                  ? "default"
                  : "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {opcion}
            </button>
          );
        })}
      </div>

      {/* RESULTADO */}

      {respondida && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "Kalam",
              fontSize: 23,
              color:
                seleccion === pregunta.correcta
                  ? TOKENS.chalkYellow
                  : TOKENS.chalkCoral,
            }}
          >
            {seleccion === pregunta.correcta
              ? "¡Correcto! 🎉"
              : "Casi..."}
          </div>

          <div
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: 14,
              color: TOKENS.chalkWhite,
              opacity: 0.7,
            }}
          >
            La respuesta correcta es{" "}
            <strong>
              {pregunta.opciones[pregunta.correcta]}
            </strong>
          </div>

          <button
            onClick={siguiente}
            style={{
              fontFamily: "Kalam",
              fontWeight: 700,
              fontSize: 19,
              color: TOKENS.boardDark,
              background: TOKENS.chalkYellow,
              border: "none",
              borderRadius: 12,
              padding: "12px",
              cursor: "pointer",
            }}
          >
            {indice + 1 === preguntas.length
              ? "Ver estadísticas →"
              : "Siguiente →"}
          </button>
        </div>
      )}
    </div>
  );
}

/* Simula región/grado — en el prototipo real esto vendría de un
   selector o de metadata del dispositivo/escuela */
const REGIONES = ["Región Norte", "Región Sur", "Región Centro", "Región Este"];
function regionSimulada() {
  return REGIONES[Math.floor(Math.random() * REGIONES.length)];
}

/* ============================================================
   TRIVIA — MATEMÁTICA
   ============================================================ */
function TriviaMatematica({ onRegistrarRespuesta }) {
  const [preguntas] = useState(() => shuffle(BANCO_MATE).slice(0, 5));
  const [indice, setIndice] = useState(0);
  const [tiempo, setTiempo] = useState(15);
  const [seleccion, setSeleccion] = useState(null);
  const [estado, setEstado] = useState("jugando"); // jugando | resultado | fin
  const [aciertos, setAciertos] = useState(0);
  const inicioRef = useRef(Date.now());

  const pregunta = preguntas[indice];

  const responder = useCallback(
    (opcionIdx) => {
      if (estado !== "jugando") return;
      const tiempoRespuesta = ((Date.now() - inicioRef.current) / 1000).toFixed(1);
      const esCorrecta = opcionIdx === pregunta.correcta;
      setSeleccion(opcionIdx);
      setEstado("resultado");
      if (esCorrecta) setAciertos((a) => a + 1);

      onRegistrarRespuesta({
        materia: "matematica",
        contenido: pregunta.contenido,
        correcto: esCorrecta,
        tiempoRespuesta: Number(tiempoRespuesta),
        region: regionSimulada(),
      });
    },
    [estado, pregunta, onRegistrarRespuesta]
  );

  useEffect(() => {
    if (estado !== "jugando") return;
    if (tiempo <= 0) {
      responder(-1); // sin respuesta = incorrecta
      return;
    }
    const t = setTimeout(() => setTiempo((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [tiempo, estado, responder]);

  useEffect(() => {
    if (estado === "resultado") {
      const t = setTimeout(() => {
        if (indice + 1 < preguntas.length) {
          setIndice((i) => i + 1);
          setTiempo(15);
          setSeleccion(null);
          setEstado("jugando");
          inicioRef.current = Date.now();
        } else {
          setEstado("fin");
        }
      }, 1400);
      return () => clearTimeout(t);
    }
  }, [estado, indice, preguntas.length]);

  if (estado === "fin") {
    return (
      <ResultadoFinal
        titulo="¡Trivia completa!"
        detalle={`Acertaste ${aciertos} de ${preguntas.length} preguntas`}
        color={TOKENS.chalkYellow}
      />
    );
  }

  const pct = (tiempo / 15) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "Kalam", fontSize: 18, color: TOKENS.chalkWhite, opacity: 0.75 }}>
          Pregunta {indice + 1} / {preguntas.length}
        </span>
        <span style={{ fontFamily: "Kalam", fontSize: 18, color: TOKENS.chalkYellow }}>
          {aciertos} ✓
        </span>
      </div>

      {/* barra de tiempo */}
      <div style={{ height: 8, borderRadius: 999, background: "rgba(245,243,231,0.15)", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: pct < 30 ? TOKENS.chalkCoral : TOKENS.chalkYellow,
            transition: "width 1s linear, background 0.3s ease",
            borderRadius: 999,
          }}
        />
      </div>

      <h3
        style={{
          fontFamily: "Kalam",
          fontWeight: 700,
          fontSize: 26,
          color: TOKENS.chalkWhite,
          margin: 0,
          minHeight: 64,
        }}
      >
        {pregunta.pregunta}
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {pregunta.opciones.map((op, i) => {
          const esSeleccionada = seleccion === i;
          const esCorrecta = i === pregunta.correcta;
          let bg = "rgba(245,243,231,0.06)";
          let border = "rgba(245,243,231,0.25)";
          if (estado === "resultado") {
            if (esCorrecta) {
              bg = "rgba(244,201,93,0.18)";
              border = TOKENS.chalkYellow;
            } else if (esSeleccionada && !esCorrecta) {
              bg = "rgba(232,115,95,0.18)";
              border = TOKENS.chalkCoral;
            }
          }
          return (
            <button
              key={i}
              onClick={() => responder(i)}
              disabled={estado !== "jugando"}
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 16,
                color: TOKENS.chalkWhite,
                background: bg,
                border: `2px solid ${border}`,
                borderRadius: 12,
                padding: "14px 16px",
                cursor: estado === "jugando" ? "pointer" : "default",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
            >
              {op}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   ARRASTRAR PALABRAS — LENGUA
   ============================================================ */
function ArrastrarPalabras({ onRegistrarRespuesta }) {
  const [palabras] = useState(() => shuffle(BANCO_LENGUA).slice(0, 6));
  const [pendientes, setPendientes] = useState(() => palabras.map((p) => p.id));
  const [clasificadas, setClasificadas] = useState({}); // id -> {categoria, correcto}
  const [arrastrando, setArrastrando] = useState(null);
  const [hoverZona, setHoverZona] = useState(null);
  const inicioRef = useRef(Date.now());
  const inicioPalabraRef = useRef(Date.now());

  const soltar = (categoriaDestino) => {
    if (!arrastrando) return;
    const palabra = palabras.find((p) => p.id === arrastrando);
    const esCorrecta = palabra.categoria === categoriaDestino;
    const tiempoRespuesta = ((Date.now() - inicioPalabraRef.current) / 1000).toFixed(1);

    setClasificadas((prev) => ({
      ...prev,
      [palabra.id]: { categoria: categoriaDestino, correcto: esCorrecta },
    }));
    setPendientes((prev) => prev.filter((id) => id !== palabra.id));
    setArrastrando(null);
    setHoverZona(null);
    inicioPalabraRef.current = Date.now();

    onRegistrarRespuesta({
      materia: "lengua",
      contenido: `clasificacion-${palabra.categoria}`,
      correcto: esCorrecta,
      tiempoRespuesta: Number(tiempoRespuesta),
      region: regionSimulada(),
    });
  };

  const aciertos = Object.values(clasificadas).filter((c) => c.correcto).length;
  const terminado = pendientes.length === 0;

  if (terminado) {
    return (
      <ResultadoFinal
        titulo="¡Clasificación completa!"
        detalle={`Acertaste ${aciertos} de ${palabras.length} palabras`}
        color={TOKENS.chalkBlue}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <span style={{ fontFamily: "Kalam", fontSize: 18, color: TOKENS.chalkWhite, opacity: 0.75 }}>
          Arrastrá cada palabra a su categoría · {aciertos} ✓ de {palabras.length - pendientes.length} intentadas
        </span>
      </div>

      {/* palabras pendientes */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, minHeight: 56 }}>
        {pendientes.map((id) => {
          const palabra = palabras.find((p) => p.id === id);
          return (
            <div
              key={id}
              draggable
              onDragStart={() => setArrastrando(id)}
              onDragEnd={() => setArrastrando(null)}
              style={{
                fontFamily: "Kalam",
                fontSize: 20,
                color: TOKENS.boardDark,
                background: TOKENS.chalkWhite,
                padding: "10px 20px",
                borderRadius: 10,
                cursor: "grab",
                boxShadow: "0 2px 0 rgba(0,0,0,0.25)",
                userSelect: "none",
                opacity: arrastrando === id ? 0.4 : 1,
                transform: arrastrando === id ? "scale(0.95)" : "scale(1)",
                transition: "opacity 0.15s ease, transform 0.15s ease",
              }}
            >
              {palabra.palabra}
            </div>
          );
        })}
      </div>

      {/* zonas de categoría */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        {CATEGORIAS.map((cat) => (
          <div
            key={cat.key}
            onDragOver={(e) => {
              e.preventDefault();
              setHoverZona(cat.key);
            }}
            onDragLeave={() => setHoverZona((z) => (z === cat.key ? null : z))}
            onDrop={(e) => {
              e.preventDefault();
              soltar(cat.key);
            }}
            style={{
              border: `2px dashed ${cat.color}`,
              borderRadius: 14,
              padding: "20px 12px",
              textAlign: "center",
              background: hoverZona === cat.key ? `${cat.color}22` : "transparent",
              transition: "background 0.15s ease",
              minHeight: 90,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <span style={{ fontFamily: "Kalam", fontWeight: 700, fontSize: 18, color: cat.color }}>
              {cat.label}
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
              {Object.entries(clasificadas)
                .filter(([, v]) => v.categoria === cat.key)
                .map(([id, v]) => {
                  const palabra = palabras.find((p) => p.id === id);
                  return (
                    <span
                      key={id}
                      style={{
                        fontFamily: "system-ui, sans-serif",
                        fontSize: 13,
                        padding: "3px 9px",
                        borderRadius: 999,
                        background: v.correcto ? "rgba(244,201,93,0.25)" : "rgba(232,115,95,0.25)",
                        color: TOKENS.chalkWhite,
                      }}
                    >
                      {palabra.palabra} {v.correcto ? "✓" : "✗"}
                    </span>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultadoFinal({ titulo, detalle, color }) {
  return (
    <div style={{ textAlign: "center", padding: "36px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
      <h3 style={{ fontFamily: "Kalam", fontWeight: 700, fontSize: 30, color, margin: 0 }}>{titulo}</h3>
      <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 15, color: TOKENS.chalkWhite, opacity: 0.8, margin: 0 }}>
        {detalle}
      </p>
      <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, color: TOKENS.chalkWhite, opacity: 0.5, margin: 0 }}>
        Los datos de esta partida ya quedaron registrados (sin identificar al alumno) —
        listos para alimentar el dashboard.
      </p>
    </div>
  );
}

/* ============================================================
   APP
   ============================================================ */
export default function App() {
  const [juego, setJuego] = useState("matematica");
  const [registros, setRegistros] = useState([]);

  const registrar = (r) => setRegistros((prev) => [...prev, { ...r, ts: Date.now() }]);

  const tabs = [
    { key: "matematica", label: "Matemática · Fracciones", color: TOKENS.chalkYellow },
    { key: "lengua", label: "Lengua · Clasificar palabras", color: TOKENS.chalkBlue },
    {key: "oraciones", label: "Lengua · Ordenar oraciones", color: TOKENS.chalkPurple,},
    {key: "ciencias", label: "Ciencias · Verdadero o falso", color: TOKENS.chalkCoral,},
    {key: "geografia",label: "Geografía · ¿Dónde está?",color: TOKENS.chalkBlue,},
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${TOKENS.board} 0%, ${TOKENS.boardDark} 100%)`,
        padding: "32px 16px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <style>{FONT_IMPORT}</style>
      <div style={{ width: "100%", maxWidth: 560 }}>
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <h1
            style={{
              fontFamily: "Kalam",
              fontWeight: 700,
              fontSize: 34,
              color: TOKENS.chalkWhite,
              margin: 0,
              letterSpacing: 0.5,
            }}
          >
            Juegos didácticos
          </h1>
          <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, color: TOKENS.chalkWhite, opacity: 0.55, marginTop: 6 }}>
            Prototipo MVP — captura de datos anónima por respuesta
          </p>
        </div>

        {/* tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setJuego(t.key)}
              style={{
                flex: 1,
                fontFamily: "Kalam",
                fontSize: 15,
                fontWeight: 700,
                padding: "10px 8px",
                borderRadius: 10,
                border: `2px solid ${juego === t.key ? t.color : "rgba(245,243,231,0.2)"}`,
                background: juego === t.key ? `${t.color}22` : "transparent",
                color: juego === t.key ? t.color : TOKENS.chalkWhite,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* tablero */}
        <div
          style={{
            background: "rgba(0,0,0,0.15)",
            border: "1px solid rgba(245,243,231,0.12)",
            borderRadius: 20,
            padding: 28,
            boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
          }}
          key={juego /* reinicia el juego al cambiar de tab */}
        >
          {juego === "matematica" ? (
            <TriviaMatematica
              onRegistrarRespuesta={registrar}
            />
          ) : juego === "lengua" ? (
            <ArrastrarPalabras
              onRegistrarRespuesta={registrar}
            />
          ) : juego === "oraciones" ? (
            <OrdenarOracion
              onRegistrarRespuesta={registrar}
            />
          ) : juego === "ciencias" ? (
            <VerdaderoFalso
              onRegistrarRespuesta={registrar}
            />
          ) : (
            <Geografia
              onRegistrarRespuesta={registrar}
            />
          )}
        </div>

        {/* mini panel de datos capturados, útil para mostrar en la demo
            que la captura funciona en tiempo real */}
        {registros.length > 0 && (
          <div style={{ marginTop: 20, fontFamily: "system-ui, sans-serif", fontSize: 12, color: TOKENS.chalkWhite, opacity: 0.45, textAlign: "center" }}>
            {registros.length} respuesta{registros.length !== 1 ? "s" : ""} registrada
            {registros.length !== 1 ? "s" : ""} en esta sesión
          </div>
        )}
      </div>
    </div>
  );
}
