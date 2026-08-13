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

/* ============================================================
   BANCO DE PALABRAS — INGLÉS (emparejar palabra/traducción)
   ============================================================ */
const BANCO_INGLES = [
  { id: "i1", ingles: "dog", espanol: "perro", contenido: "vocabulario-animales" },
  { id: "i2", ingles: "cat", espanol: "gato", contenido: "vocabulario-animales" },
  { id: "i3", ingles: "red", espanol: "rojo", contenido: "vocabulario-colores" },
  { id: "i4", ingles: "blue", espanol: "azul", contenido: "vocabulario-colores" },
  { id: "i5", ingles: "run", espanol: "correr", contenido: "vocabulario-verbos" },
  { id: "i6", ingles: "eat", espanol: "comer", contenido: "vocabulario-verbos" },
  { id: "i7", ingles: "house", espanol: "casa", contenido: "vocabulario-sustantivos" },
  { id: "i8", ingles: "book", espanol: "libro", contenido: "vocabulario-sustantivos" },
];

/* ============================================================
   BANCO DE INSTRUMENTOS — MÚSICA (adivinar por descripción)
   ============================================================ */
const BANCO_INSTRUMENTOS = [
  {
    id: "mu1",
    instrumento: "Violín",
    emoji: "🎻",
    descripcion: "Es de cuerda y se toca frotando un arco sobre las cuerdas. Es el más agudo de su familia.",
    contenido: "instrumentos-cuerda",
    opciones: ["Violín", "Viola", "Contrabajo", "Guitarra"],
    correcta: 0,
  },
  {
    id: "mu2",
    instrumento: "Piano",
    emoji: "🎹",
    descripcion: "Tiene teclas blancas y negras. Al presionarlas, unos martillos golpean cuerdas por dentro.",
    contenido: "instrumentos-teclado",
    opciones: ["Órgano", "Acordeón", "Piano", "Xilófono"],
    correcta: 2,
  },
  {
    id: "mu3",
    instrumento: "Trompeta",
    emoji: "🎺",
    descripcion: "Es de viento metal. Se sopla por una boquilla y tiene tres pistones para cambiar la nota.",
    contenido: "instrumentos-viento-metal",
    opciones: ["Trombón", "Trompeta", "Tuba", "Corno"],
    correcta: 1,
  },
  {
    id: "mu4",
    instrumento: "Batería",
    emoji: "🥁",
    descripcion: "Es de percusión. Se toca golpeando distintos tambores y platillos con baquetas.",
    contenido: "instrumentos-percusion",
    opciones: ["Batería", "Xilófono", "Pandereta", "Congas"],
    correcta: 0,
  },
  {
    id: "mu5",
    instrumento: "Guitarra",
    emoji: "🎸",
    descripcion: "Es de cuerda pulsada. Tiene seis cuerdas y una caja de resonancia con forma de ocho.",
    contenido: "instrumentos-cuerda",
    opciones: ["Bajo", "Ukelele", "Guitarra", "Banjo"],
    correcta: 2,
  },
  {
    id: "mu6",
    instrumento: "Saxofón",
    emoji: "🎷",
    descripcion: "Aunque es de metal, se clasifica como viento madera. Muy usado en el jazz, tiene boquilla con lengüeta.",
    contenido: "instrumentos-viento-madera",
    opciones: ["Clarinete", "Oboe", "Fagot", "Saxofón"],
    correcta: 3,
  },
];

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
   EMPAREJAR — INGLÉS (memory: palabra ↔ traducción)
   ============================================================ */
function EmparejarIngles({ onRegistrarRespuesta }) {
  const [pares] = useState(() => shuffle(BANCO_INGLES).slice(0, 6));
  const [cartas] = useState(() =>
    shuffle(
      pares.flatMap((p) => [
        { key: `${p.id}-en`, pairId: p.id, texto: p.ingles, contenido: p.contenido },
        { key: `${p.id}-es`, pairId: p.id, texto: p.espanol, contenido: p.contenido },
      ])
    )
  );
  const [volteadas, setVolteadas] = useState([]);
  const [resueltas, setResueltas] = useState(new Set());
  const [intentos, setIntentos] = useState(0);
  const inicioRef = useRef(Date.now());
  const bloqueado = volteadas.length === 2;
  const totalPares = pares.length;
  const terminado = resueltas.size === totalPares;

  const voltear = (idx) => {
    if (bloqueado) return;
    if (volteadas.includes(idx)) return;
    if (resueltas.has(cartas[idx].pairId)) return;

    const nuevas = [...volteadas, idx];
    setVolteadas(nuevas);

    if (nuevas.length === 2) {
      const [i1, i2] = nuevas;
      const c1 = cartas[i1];
      const c2 = cartas[i2];
      const esMatch = c1.pairId === c2.pairId;
      const tiempoRespuesta = ((Date.now() - inicioRef.current) / 1000).toFixed(1);

      setIntentos((n) => n + 1);

      onRegistrarRespuesta({
        materia: "ingles",
        contenido: c1.contenido,
        correcto: esMatch,
        tiempoRespuesta: Number(tiempoRespuesta),
        region: regionSimulada(),
      });

      if (esMatch) {
        setTimeout(() => {
          setResueltas((prev) => new Set(prev).add(c1.pairId));
          setVolteadas([]);
          inicioRef.current = Date.now();
        }, 600);
      } else {
        setTimeout(() => {
          setVolteadas([]);
          inicioRef.current = Date.now();
        }, 900);
      }
    }
  };

  if (terminado) {
    return (
      <ResultadoFinal
        titulo="¡Muy bien! 🎉"
        detalle={`Encontraste los ${totalPares} pares en ${intentos} intentos`}
        color={TOKENS.chalkBlue}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "Kalam", fontSize: 18, color: TOKENS.chalkWhite, opacity: 0.75 }}>
          Pares encontrados: {resueltas.size} / {totalPares}
        </span>
        <span style={{ fontFamily: "Kalam", fontSize: 18, color: TOKENS.chalkYellow }}>
          Intentos: {intentos}
        </span>
      </div>

      <h3 style={{ fontFamily: "Kalam", fontWeight: 700, fontSize: 24, color: TOKENS.chalkWhite, margin: 0, textAlign: "center" }}>
        Encontrá cada palabra con su traducción
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {cartas.map((carta, idx) => {
          const emparejada = resueltas.has(carta.pairId);
          const volteada = volteadas.includes(idx) || emparejada;
          return (
            <button
              key={carta.key}
              onClick={() => voltear(idx)}
              disabled={emparejada || bloqueado}
              style={{
                minHeight: 64,
                borderRadius: 12,
                border: `2px solid ${emparejada ? TOKENS.chalkYellow : "rgba(245,243,231,0.25)"}`,
                background: volteada
                  ? emparejada
                    ? `${TOKENS.chalkYellow}22`
                    : TOKENS.chalkWhite
                  : "rgba(245,243,231,0.06)",
                color: volteada ? TOKENS.boardDark : TOKENS.chalkWhite,
                fontFamily: "Kalam",
                fontSize: 17,
                fontWeight: 700,
                cursor: emparejada ? "default" : "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {volteada ? carta.texto : "?"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   ADIVINAR INSTRUMENTO — MÚSICA
   ============================================================ */
function AdivinarInstrumento({ onRegistrarRespuesta }) {
  const [preguntas] = useState(() => shuffle(BANCO_INSTRUMENTOS).slice(0, 5));
  const [indice, setIndice] = useState(0);
  const [seleccion, setSeleccion] = useState(null);
  const [estado, setEstado] = useState("jugando");
  const [aciertos, setAciertos] = useState(0);
  const inicioRef = useRef(Date.now());

  const pregunta = preguntas[indice];

  const responder = (opcionIdx) => {
    if (estado !== "jugando") return;
    const tiempoRespuesta = ((Date.now() - inicioRef.current) / 1000).toFixed(1);
    const esCorrecta = opcionIdx === pregunta.correcta;

    setSeleccion(opcionIdx);
    if (esCorrecta) setAciertos((a) => a + 1);
    setEstado("resultado");

    onRegistrarRespuesta({
      materia: "musica",
      contenido: pregunta.contenido,
      correcto: esCorrecta,
      tiempoRespuesta: Number(tiempoRespuesta),
      region: regionSimulada(),
    });
  };

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

  if (estado === "fin") {
    return (
      <ResultadoFinal
        titulo="¡Juego terminado!"
        detalle={`Adivinaste ${aciertos} de ${preguntas.length} instrumentos`}
        color={TOKENS.chalkCoral}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "Kalam", fontSize: 18, color: TOKENS.chalkWhite, opacity: 0.75 }}>
          Instrumento {indice + 1} / {preguntas.length}
        </span>
        <span style={{ fontFamily: "Kalam", fontSize: 18, color: TOKENS.chalkYellow }}>
          {aciertos} ✓
        </span>
      </div>

      <div style={{ textAlign: "center", fontSize: 56 }}>{pregunta.emoji}</div>

      <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 15, color: TOKENS.chalkWhite, opacity: 0.85, textAlign: "center", margin: 0 }}>
        {pregunta.descripcion}
      </p>

      <h3 style={{ fontFamily: "Kalam", fontWeight: 700, fontSize: 22, color: TOKENS.chalkWhite, margin: 0, textAlign: "center" }}>
        ¿Qué instrumento es?
      </h3>

      {estado === "jugando" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pregunta.opciones.map((op, idx) => (
            <button
              key={op}
              onClick={() => responder(idx)}
              style={{
                fontFamily: "Kalam",
                fontSize: 18,
                fontWeight: 700,
                color: TOKENS.boardDark,
                background: TOKENS.chalkWhite,
                border: "none",
                borderRadius: 12,
                padding: "12px",
                cursor: "pointer",
              }}
            >
              {op}
            </button>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
          <div
            style={{
              fontFamily: "Kalam",
              fontSize: 23,
              color: seleccion === pregunta.correcta ? TOKENS.chalkYellow : TOKENS.chalkCoral,
            }}
          >
            {seleccion === pregunta.correcta ? "¡Correcto! 🎉" : "Casi..."}
          </div>
          <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 14, color: TOKENS.chalkWhite, opacity: 0.7 }}>
            Era <strong>{pregunta.instrumento}</strong>
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
              padding: "12px 24px",
              cursor: "pointer",
            }}
          >
            {indice + 1 === preguntas.length ? "Ver estadísticas →" : "Siguiente →"}
          </button>
        </div>
      )}
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
    { key: "ingles", label: "Inglés · Emparejar", color: TOKENS.chalkCoral },
    { key: "musica", label: "Música · Adivinar", color: TOKENS.chalkPurple },
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
            <TriviaMatematica onRegistrarRespuesta={registrar} />
          ) : juego === "lengua" ? (
            <ArrastrarPalabras onRegistrarRespuesta={registrar} />
          ) : juego === "ingles" ? (
            <EmparejarIngles onRegistrarRespuesta={registrar} />
          ) : (
            <AdivinarInstrumento onRegistrarRespuesta={registrar} />
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
