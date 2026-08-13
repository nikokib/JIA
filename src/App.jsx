import { useState, useEffect, useRef, useCallback } from "react";

/* ============================================================
   PUMM / JIA EDU — catálogo de juegos
   Tema: pizarrón / tiza. La navegación sigue una mamushka:
   tipo de juego → nivel → materia → juegos disponibles.
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

const NIVELES = [
  { key: "5p", label: "5to grado · Primaria", short: "5to Primaria" },
  { key: "6p", label: "6to grado · Primaria", short: "6to Primaria" },
  { key: "1s", label: "1er año · Secundaria", short: "1ro Secundaria" },
  { key: "2s", label: "2do año · Secundaria", short: "2do Secundaria" },
  { key: "3s", label: "3er año · Secundaria", short: "3ro Secundaria" },
  { key: "4s", label: "4to año · Secundaria", short: "4to Secundaria" },
  { key: "5s", label: "5to año · Secundaria", short: "5to Secundaria" },
  { key: "6s", label: "6to año · Secundaria", short: "6to Secundaria" },
];

const MATERIAS = [
  { key: "matematica", label: "Matemática", icon: "➗", color: TOKENS.chalkYellow },
  { key: "lengua", label: "Lengua", icon: "📚", color: TOKENS.chalkBlue },
];

const TIPOS = [
  { key: "trivia", label: "Trivia", icon: "💡", color: TOKENS.chalkYellow },
  { key: "drag-drop", label: "Drag & Drop", icon: "✋", color: TOKENS.chalkBlue },
  { key: "memoria", label: "Unir conceptos", icon: "🧠", color: TOKENS.chalkPurple },
  { key: "resolver", label: "Resolver", icon: "✏️", color: TOKENS.chalkCoral },
];

/* ============================================================
   BANCOS DE CONTENIDO
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

const ORTOGRAFIA = [
  { id: "o1", frase: "El perro corrio por el parque.", error: "corrio", correcta: "corrió", opciones: ["corrió", "corrío", "corio", "corrio"] },
  { id: "o2", frase: "Mi mamá preparo la merienda.", error: "preparo", correcta: "preparó", opciones: ["preparó", "preparóh", "preparo", "prepáro"] },
  { id: "o3", frase: "La canción sono muy fuerte.", error: "sono", correcta: "sonó", opciones: ["sonó", "sóno", "sono", "sonóh"] },
  { id: "o4", frase: "El camión llego temprano.", error: "llego", correcta: "llegó", opciones: ["llegó", "llegóh", "llego", "llégo"] },
  { id: "o5", frase: "Ayer visite a mi abuela.", error: "visite", correcta: "visité", opciones: ["visité", "visite", "vicíte", "visitéh"] },
  { id: "o6", frase: "El árbol esta en el patio.", error: "esta", correcta: "está", opciones: ["está", "esta", "ésta", "estah"] },
  { id: "o7", frase: "La niña escribio una carta.", error: "escribio", correcta: "escribió", opciones: ["escribió", "escribío", "escribio", "escríbio"] },
  { id: "o8", frase: "El médico atendio al paciente.", error: "atendio", correcta: "atendió", opciones: ["atendió", "atendío", "atendio", "atendióh"] },
];

const ANTONIMOS = [
  { id: "a1", palabra: "grande", correcta: "pequeño", opciones: ["pequeño", "enorme", "alto", "ancho"] },
  { id: "a2", palabra: "rápido", correcta: "lento", opciones: ["fuerte", "lento", "ágil", "veloz"] },
  { id: "a3", palabra: "alegre", correcta: "triste", opciones: ["amable", "triste", "feliz", "contento"] },
  { id: "a4", palabra: "cerca", correcta: "lejos", opciones: ["lejos", "junto", "próximo", "acá"] },
  { id: "a5", palabra: "fácil", correcta: "difícil", opciones: ["simple", "difícil", "claro", "rápido"] },
  { id: "a6", palabra: "oscuro", correcta: "claro", opciones: ["negro", "claro", "nublado", "opaco"] },
  { id: "a7", palabra: "subir", correcta: "bajar", opciones: ["saltar", "entrar", "bajar", "trepar"] },
  { id: "a8", palabra: "nuevo", correcta: "viejo", opciones: ["joven", "moderno", "viejo", "actual"] },
];

const MEMORIA_MATE = [
  ["3 × 4", "12"], ["2 + 5", "7"], ["4 × 2", "8"], ["10 − 3", "7"],
  ["5 + 6", "11"], ["18 ÷ 2", "9"], ["7 × 3", "21"], ["20 − 8", "12"],
];

const ECUACIONES = [
  { id: "e1", pregunta: "x + 7 = 15", respuesta: 8 },
  { id: "e2", pregunta: "x − 9 = 6", respuesta: 15 },
  { id: "e3", pregunta: "3x = 21", respuesta: 7 },
  { id: "e4", pregunta: "x / 4 = 5", respuesta: 20 },
  { id: "e5", pregunta: "2x + 4 = 18", respuesta: 7 },
  { id: "e6", pregunta: "5x − 10 = 25", respuesta: 7 },
  { id: "e7", pregunta: "x + 13 = 31", respuesta: 18 },
  { id: "e8", pregunta: "4x = 36", respuesta: 9 },
];

const CATEGORIAS = [
  { key: "sustantivo", label: "Sustantivo", color: TOKENS.chalkBlue },
  { key: "verbo", label: "Verbo", color: TOKENS.chalkCoral },
  { key: "adjetivo", label: "Adjetivo", color: TOKENS.chalkYellow },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const REGIONES = ["Región Norte", "Región Sur", "Región Centro", "Región Este"];
function regionSimulada() {
  return REGIONES[Math.floor(Math.random() * REGIONES.length)];
}

/* Catálogo: cada juego declara sus filtros. Agregar otro juego no requiere tocar la navegación. */
const JUEGOS = [
  {
    key: "fracciones",
    tipo: "trivia",
    niveles: ["5p", "6p"],
    materia: "matematica",
    titulo: "Fracciones",
    descripcion: "Resolvé operaciones y comparaciones con fracciones.",
    color: TOKENS.chalkYellow,
    componente: TriviaMatematica,
  },
  {
    key: "clasificar-palabras",
    tipo: "drag-drop",
    niveles: ["5p", "6p"],
    materia: "lengua",
    titulo: "Clasificar palabras",
    descripcion: "Arrastrá cada palabra hasta su categoría gramatical.",
    color: TOKENS.chalkBlue,
    componente: ArrastrarPalabras,
  },
  {
    key: "detectar-ortografia",
    tipo: "trivia",
    niveles: ["5p", "6p", "1s", "2s", "3s", "4s", "5s", "6s"],
    materia: "lengua",
    titulo: "Detectar Ortografía",
    descripcion: "Encontrá la forma correcta y corregí el error ortográfico.",
    color: TOKENS.chalkCoral,
    componente: DetectarOrtografia,
  },
  {
    key: "antonimo",
    tipo: "trivia",
    niveles: ["5p", "6p", "1s", "2s", "3s"],
    materia: "lengua",
    titulo: "Antónimo",
    descripcion: "Elegí la palabra que expresa lo contrario.",
    color: TOKENS.chalkPurple,
    componente: Antonimo,
  },
  {
    key: "memoria-matematica",
    tipo: "memoria",
    niveles: ["5p", "6p", "1s", "2s"],
    materia: "matematica",
    titulo: "Memoria matemática",
    descripcion: "Uní cada operación con su resultado.",
    color: TOKENS.chalkPurple,
    componente: MemoriaMatematica,
  },
  {
    key: "ecuacion-misteriosa",
    tipo: "resolver",
    niveles: ["1s", "2s", "3s", "4s", "5s", "6s"],
    materia: "matematica",
    titulo: "Ecuación misteriosa",
    descripcion: "Descubrí el valor de x y resolvé el misterio.",
    color: TOKENS.chalkCoral,
    componente: EcuacionMisteriosa,
  },
];

/* ============================================================
   JUEGOS EXISTENTES
   ============================================================ */
function TriviaMatematica({ onRegistrarRespuesta }) {
  const [preguntas] = useState(() => shuffle(BANCO_MATE).slice(0, 5));
  const [indice, setIndice] = useState(0);
  const [tiempo, setTiempo] = useState(15);
  const [seleccion, setSeleccion] = useState(null);
  const [estado, setEstado] = useState("jugando");
  const [aciertos, setAciertos] = useState(0);
  const inicioRef = useRef(Date.now());
  const pregunta = preguntas[indice];

  const responder = useCallback((opcionIdx) => {
    if (estado !== "jugando") return;
    const tiempoRespuesta = ((Date.now() - inicioRef.current) / 1000).toFixed(1);
    const esCorrecta = opcionIdx === pregunta.correcta;
    setSeleccion(opcionIdx);
    setEstado("resultado");
    if (esCorrecta) setAciertos((a) => a + 1);
    onRegistrarRespuesta({ materia: "matematica", contenido: pregunta.contenido, correcto: esCorrecta, tiempoRespuesta: Number(tiempoRespuesta), region: regionSimulada() });
  }, [estado, pregunta, onRegistrarRespuesta]);

  useEffect(() => {
    if (estado !== "jugando") return undefined;
    if (tiempo <= 0) {
      responder(-1);
      return undefined;
    }
    const t = setTimeout(() => setTiempo((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [tiempo, estado, responder]);

  useEffect(() => {
    if (estado !== "resultado") return undefined;
    const t = setTimeout(() => {
      if (indice + 1 < preguntas.length) {
        setIndice((i) => i + 1);
        setTiempo(15);
        setSeleccion(null);
        setEstado("jugando");
        inicioRef.current = Date.now();
      } else setEstado("fin");
    }, 1100);
    return () => clearTimeout(t);
  }, [estado, indice, preguntas.length]);

  if (estado === "fin") return <ResultadoFinal titulo="¡Trivia completa!" detalle={`Acertaste ${aciertos} de ${preguntas.length} preguntas`} color={TOKENS.chalkYellow} />;
  const pct = (tiempo / 15) * 100;
  return (
    <JuegoMarco progreso={`Pregunta ${indice + 1} / ${preguntas.length}`} marcador={`${aciertos} ✓`}>
      <BarraTiempo pct={pct} />
      <h3 className="chalk-question">{pregunta.pregunta}</h3>
      <div className="option-grid">
        {pregunta.opciones.map((op, i) => {
          const esSeleccionada = seleccion === i;
          const esCorrecta = i === pregunta.correcta;
          const estadoClase = estado === "resultado" && esCorrecta ? "correct" : estado === "resultado" && esSeleccionada ? "wrong" : "";
          return <button className={`chalk-option ${estadoClase}`} key={i} onClick={() => responder(i)} disabled={estado !== "jugando"}>{op}</button>;
        })}
      </div>
    </JuegoMarco>
  );
}

function ArrastrarPalabras({ onRegistrarRespuesta }) {
  const [palabras] = useState(() => shuffle(BANCO_LENGUA).slice(0, 6));
  const [pendientes, setPendientes] = useState(() => palabras.map((p) => p.id));
  const [clasificadas, setClasificadas] = useState({});
  const [arrastrando, setArrastrando] = useState(null);
  const [hoverZona, setHoverZona] = useState(null);
  const inicioPalabraRef = useRef(Date.now());
  const soltar = (categoriaDestino) => {
    if (!arrastrando) return;
    const palabra = palabras.find((p) => p.id === arrastrando);
    const esCorrecta = palabra.categoria === categoriaDestino;
    const tiempoRespuesta = ((Date.now() - inicioPalabraRef.current) / 1000).toFixed(1);
    setClasificadas((prev) => ({ ...prev, [palabra.id]: { categoria: categoriaDestino, correcto: esCorrecta } }));
    setPendientes((prev) => prev.filter((id) => id !== palabra.id));
    setArrastrando(null);
    setHoverZona(null);
    inicioPalabraRef.current = Date.now();
    onRegistrarRespuesta({ materia: "lengua", contenido: `clasificacion-${palabra.categoria}`, correcto: esCorrecta, tiempoRespuesta: Number(tiempoRespuesta), region: regionSimulada() });
  };
  const aciertos = Object.values(clasificadas).filter((c) => c.correcto).length;
  if (pendientes.length === 0) return <ResultadoFinal titulo="¡Clasificación completa!" detalle={`Acertaste ${aciertos} de ${palabras.length} palabras`} color={TOKENS.chalkBlue} />;
  return (
    <JuegoMarco progreso={`Arrastrá cada palabra · ${aciertos} ✓`}>
      <div className="word-bank">
        {pendientes.map((id) => {
          const palabra = palabras.find((p) => p.id === id);
          return <div key={id} draggable onDragStart={() => setArrastrando(id)} onDragEnd={() => setArrastrando(null)} className={`word-chip ${arrastrando === id ? "dragging" : ""}`}>{palabra.palabra}</div>;
        })}
      </div>
      <div className="category-grid">
        {CATEGORIAS.map((cat) => (
          <div key={cat.key} className={`drop-zone ${hoverZona === cat.key ? "hover" : ""}`} style={{ "--zone-color": cat.color }} onDragOver={(e) => { e.preventDefault(); setHoverZona(cat.key); }} onDragLeave={() => setHoverZona((z) => (z === cat.key ? null : z))} onDrop={(e) => { e.preventDefault(); soltar(cat.key); }}>
            <span className="drop-title">{cat.label}</span>
            <div className="classified-list">
              {Object.entries(clasificadas).filter(([, v]) => v.categoria === cat.key).map(([id, v]) => {
                const palabra = palabras.find((p) => p.id === id);
                return <span key={id} className={`classified-chip ${v.correcto ? "ok" : "bad"}`}>{palabra.palabra} {v.correcto ? "✓" : "✗"}</span>;
              })}
            </div>
          </div>
        ))}
      </div>
    </JuegoMarco>
  );
}

/* ============================================================
   JUEGOS NUEVOS
   ============================================================ */
function DetectarOrtografia({ onRegistrarRespuesta }) {
  const [preguntas] = useState(() => shuffle(ORTOGRAFIA).slice(0, 5));
  const [indice, setIndice] = useState(0);
  const [estado, setEstado] = useState("jugando");
  const [seleccion, setSeleccion] = useState(null);
  const [aciertos, setAciertos] = useState(0);
  const [tiempo, setTiempo] = useState(15);
  const inicioRef = useRef(Date.now());
  const pregunta = preguntas[indice];
  const responder = useCallback((opcion) => {
    if (estado !== "jugando") return;
    const correcta = opcion === pregunta.correcta;
    const tiempoRespuesta = ((Date.now() - inicioRef.current) / 1000).toFixed(1);
    setSeleccion(opcion); setEstado("resultado"); if (correcta) setAciertos((a) => a + 1);
    onRegistrarRespuesta({ materia: "lengua", contenido: "ortografia", correcto: correcta, tiempoRespuesta: Number(tiempoRespuesta), region: regionSimulada() });
  }, [estado, pregunta, onRegistrarRespuesta]);
  useEffect(() => {
    if (estado !== "jugando") return undefined;
    if (tiempo <= 0) { responder(""); return undefined; }
    const t = setTimeout(() => setTiempo((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [tiempo, estado, responder]);
  useEffect(() => {
    if (estado !== "resultado") return undefined;
    const t = setTimeout(() => {
      if (indice + 1 < preguntas.length) { setIndice((i) => i + 1); setSeleccion(null); setTiempo(15); setEstado("jugando"); inicioRef.current = Date.now(); }
      else setEstado("fin");
    }, 1100);
    return () => clearTimeout(t);
  }, [estado, indice, preguntas.length]);
  if (estado === "fin") return <ResultadoFinal titulo="¡Ortografía completa!" detalle={`Detectaste ${aciertos} de ${preguntas.length} correcciones`} color={TOKENS.chalkCoral} />;
  return (
    <JuegoMarco progreso={`Caso ${indice + 1} / ${preguntas.length}`} marcador={`${aciertos} ✓`}>
      <BarraTiempo pct={(tiempo / 15) * 100} />
      <div className="sentence-card"><span>🔎 Detectá el error</span><strong>{pregunta.frase}</strong><small>¿Cuál es la forma correcta de la palabra destacada?</small></div>
      <div className="option-grid">
        {pregunta.opciones.map((op) => <button key={op} className={`chalk-option ${estado === "resultado" && op === pregunta.correcta ? "correct" : estado === "resultado" && op === seleccion ? "wrong" : ""}`} onClick={() => responder(op)} disabled={estado !== "jugando"}>{op}</button>)}
      </div>
    </JuegoMarco>
  );
}

function Antonimo({ onRegistrarRespuesta }) {
  const [preguntas] = useState(() => shuffle(ANTONIMOS).slice(0, 5));
  const [indice, setIndice] = useState(0);
  const [estado, setEstado] = useState("jugando");
  const [seleccion, setSeleccion] = useState(null);
  const [aciertos, setAciertos] = useState(0);
  const [tiempo, setTiempo] = useState(15);
  const inicioRef = useRef(Date.now());
  const pregunta = preguntas[indice];
  const responder = useCallback((opcion) => {
    if (estado !== "jugando") return;
    const correcta = opcion === pregunta.correcta;
    const tiempoRespuesta = ((Date.now() - inicioRef.current) / 1000).toFixed(1);
    setSeleccion(opcion); setEstado("resultado"); if (correcta) setAciertos((a) => a + 1);
    onRegistrarRespuesta({ materia: "lengua", contenido: "antonimos", correcto: correcta, tiempoRespuesta: Number(tiempoRespuesta), region: regionSimulada() });
  }, [estado, pregunta, onRegistrarRespuesta]);
  useEffect(() => {
    if (estado !== "jugando") return undefined;
    if (tiempo <= 0) { responder(""); return undefined; }
    const t = setTimeout(() => setTiempo((v) => v - 1), 1000); return () => clearTimeout(t);
  }, [tiempo, estado, responder]);
  useEffect(() => {
    if (estado !== "resultado") return undefined;
    const t = setTimeout(() => {
      if (indice + 1 < preguntas.length) { setIndice((i) => i + 1); setSeleccion(null); setTiempo(15); setEstado("jugando"); inicioRef.current = Date.now(); } else setEstado("fin");
    }, 1100); return () => clearTimeout(t);
  }, [estado, indice, preguntas.length]);
  if (estado === "fin") return <ResultadoFinal titulo="¡Antónimo completado!" detalle={`Acertaste ${aciertos} de ${preguntas.length}`} color={TOKENS.chalkPurple} />;
  return (
    <JuegoMarco progreso={`Palabra ${indice + 1} / ${preguntas.length}`} marcador={`${aciertos} ✓`}>
      <BarraTiempo pct={(tiempo / 15) * 100} />
      <div className="word-prompt"><span>¿Cuál es el antónimo de...?</span><strong>{pregunta.palabra}</strong></div>
      <div className="option-grid">
        {pregunta.opciones.map((op) => <button key={op} className={`chalk-option ${estado === "resultado" && op === pregunta.correcta ? "correct" : estado === "resultado" && op === seleccion ? "wrong" : ""}`} onClick={() => responder(op)} disabled={estado !== "jugando"}>{op}</button>)}
      </div>
    </JuegoMarco>
  );
}

function MemoriaMatematica({ onRegistrarRespuesta }) {
  const [cartas] = useState(() => shuffle(MEMORIA_MATE.flatMap(([operacion, resultado], i) => [
    { id: `${i}-op`, pareja: i, texto: operacion, tipo: "operacion" },
    { id: `${i}-res`, pareja: i, texto: resultado, tipo: "resultado" },
  ])));
  const [abiertas, setAbiertas] = useState([]);
  const [encontradas, setEncontradas] = useState([]);
  const [bloqueado, setBloqueado] = useState(false);
  const [inicioRef] = useState(() => Date.now());
  const terminado = encontradas.length === cartas.length;

  useEffect(() => {
    if (abiertas.length !== 2) return undefined;
    setBloqueado(true);
    const [a, b] = abiertas.map((id) => cartas.find((c) => c.id === id));
    const correcta = a.pareja === b.pareja && a.tipo !== b.tipo;
    onRegistrarRespuesta({ materia: "matematica", contenido: "memoria-matematica", correcto: correcta, tiempoRespuesta: Number(((Date.now() - inicioRef) / 1000).toFixed(1)), region: regionSimulada() });
    const t = setTimeout(() => {
      if (correcta) setEncontradas((prev) => [...prev, a.id, b.id]);
      setAbiertas([]); setBloqueado(false);
    }, 650);
    return () => clearTimeout(t);
  }, [abiertas, cartas, inicioRef, onRegistrarRespuesta]);

  if (terminado) return <ResultadoFinal titulo="¡Memoria matemática!" detalle="Encontraste todas las parejas de operaciones y resultados." color={TOKENS.chalkPurple} />;
  const voltear = (id) => {
    if (bloqueado || abiertas.includes(id) || encontradas.includes(id) || abiertas.length >= 2) return;
    setAbiertas((prev) => [...prev, id]);
  };
  return (
    <JuegoMarco progreso={`Parejas ${encontradas.length / 2} / ${MEMORIA_MATE.length}`} marcador="🧠">
      <p className="game-hint">Encontrá la operación y su resultado. Tocá dos cartas para unirlas.</p>
      <div className="memory-grid">
        {cartas.map((carta) => {
          const visible = abiertas.includes(carta.id) || encontradas.includes(carta.id);
          return <button key={carta.id} className={`memory-card ${visible ? "visible" : ""} ${encontradas.includes(carta.id) ? "matched" : ""}`} onClick={() => voltear(carta.id)} disabled={bloqueado || encontradas.includes(carta.id)}><span>{visible ? carta.texto : "?"}</span></button>;
        })}
      </div>
    </JuegoMarco>
  );
}

function EcuacionMisteriosa({ onRegistrarRespuesta }) {
  const [preguntas] = useState(() => shuffle(ECUACIONES).slice(0, 5));
  const [indice, setIndice] = useState(0);
  const [respuesta, setRespuesta] = useState("");
  const [estado, setEstado] = useState("jugando");
  const [aciertos, setAciertos] = useState(0);
  const [tiempo, setTiempo] = useState(20);
  const inicioRef = useRef(Date.now());
  const pregunta = preguntas[indice];
  const resolver = useCallback(() => {
    if (estado !== "jugando") return;
    const correcta = Number(respuesta) === pregunta.respuesta;
    const tiempoRespuesta = ((Date.now() - inicioRef.current) / 1000).toFixed(1);
    setEstado(correcta ? "correcto" : "incorrecto"); if (correcta) setAciertos((a) => a + 1);
    onRegistrarRespuesta({ materia: "matematica", contenido: "ecuacion-misteriosa", correcto: correcta, tiempoRespuesta: Number(tiempoRespuesta), region: regionSimulada() });
  }, [estado, respuesta, pregunta, onRegistrarRespuesta]);
  useEffect(() => {
    if (estado !== "jugando") return undefined;
    if (tiempo <= 0) { setRespuesta(""); resolver(); return undefined; }
    const t = setTimeout(() => setTiempo((v) => v - 1), 1000); return () => clearTimeout(t);
  }, [tiempo, estado, resolver]);
  useEffect(() => {
    if (estado === "jugando") return undefined;
    const t = setTimeout(() => {
      if (indice + 1 < preguntas.length) { setIndice((i) => i + 1); setRespuesta(""); setTiempo(20); setEstado("jugando"); inicioRef.current = Date.now(); } else setEstado("fin");
    }, 1200); return () => clearTimeout(t);
  }, [estado, indice, preguntas.length]);
  if (estado === "fin") return <ResultadoFinal titulo="¡Misterio resuelto!" detalle={`Descubriste ${aciertos} de ${preguntas.length} ecuaciones`} color={TOKENS.chalkCoral} />;
  return (
    <JuegoMarco progreso={`Misterio ${indice + 1} / ${preguntas.length}`} marcador={`${aciertos} ✓`}>
      <BarraTiempo pct={(tiempo / 20) * 100} />
      <div className="equation-card"><span>🔐 Encontrá el valor de x</span><strong>{pregunta.pregunta}</strong></div>
      <div className="equation-answer">
        <label htmlFor="ecuacion-respuesta">x =</label>
        <input id="ecuacion-respuesta" inputMode="numeric" type="number" value={respuesta} onChange={(e) => setRespuesta(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") resolver(); }} disabled={estado !== "jugando"} autoFocus />
        <button className="chalk-primary" onClick={resolver} disabled={estado !== "jugando" || respuesta === ""}>Resolver</button>
      </div>
      {estado !== "jugando" && <p className={`feedback ${estado}`}>{estado === "correcto" ? "¡Correcto! 🎉" : `La respuesta era ${pregunta.respuesta}.`}</p>}
    </JuegoMarco>
  );
}

/* ============================================================
   PIEZAS DE UI COMPARTIDAS
   ============================================================ */
function JuegoMarco({ progreso, marcador, children }) {
  return <div className="game-shell"><div className="game-meta"><span>{progreso}</span><span>{marcador}</span></div>{children}</div>;
}

function BarraTiempo({ pct }) {
  return <div className="time-bar"><div style={{ width: `${pct}%`, background: pct < 30 ? TOKENS.chalkCoral : TOKENS.chalkYellow }} /></div>;
}

function ResultadoFinal({ titulo, detalle, color }) {
  return <div className="result-final"><h3 style={{ color }}>{titulo}</h3><p>{detalle}</p><small>Los datos de esta partida ya quedaron registrados (sin identificar al alumno), listos para alimentar el dashboard.</small></div>;
}

function Pill({ children, active, color, onClick }) {
  return <button className={`filter-pill ${active ? "active" : ""}`} style={{ "--pill-color": color || TOKENS.chalkWhite }} onClick={onClick}>{children}</button>;
}

function StepHeader({ number, title, done }) {
  return <div className={`step-header ${done ? "done" : ""}`}><span>{number}</span><div><strong>{title}</strong>{done && <small>✓ seleccionado</small>}</div></div>;
}

/* ============================================================
   APP + NAVEGACIÓN MAMUSHKA
   ============================================================ */
export default function App() {
  const [tipo, setTipo] = useState(null);
  const [nivel, setNivel] = useState(null);
  const [materia, setMateria] = useState(null);
  const [juego, setJuego] = useState(null);
  const [registros, setRegistros] = useState([]);

  const registrar = useCallback((r) => setRegistros((prev) => [...prev, { ...r, ts: Date.now() }]), []);
  const tiposDisponibles = TIPOS.filter((t) => JUEGOS.some((j) => j.tipo === t.key));
  const nivelesDisponibles = tipo ? NIVELES.filter((n) => JUEGOS.some((j) => j.tipo === tipo && j.niveles.includes(n.key))) : [];
  const materiasDisponibles = nivel ? MATERIAS.filter((m) => JUEGOS.some((j) => j.tipo === tipo && j.niveles.includes(nivel) && j.materia === m.key)) : [];
  const juegosDisponibles = materia ? JUEGOS.filter((j) => j.tipo === tipo && j.niveles.includes(nivel) && j.materia === materia) : [];
  const juegoSeleccionado = juego ? JUEGOS.find((j) => j.key === juego) : null;

  const elegirTipo = (key) => { setTipo(key); setNivel(null); setMateria(null); setJuego(null); };
  const elegirNivel = (key) => { setNivel(key); setMateria(null); setJuego(null); };
  const elegirMateria = (key) => { setMateria(key); setJuego(null); };
  const volverFiltros = () => setJuego(null);
  const Component = juegoSeleccionado?.componente;

  return (
    <div className="app-board">
      <style>{FONT_IMPORT}</style>
      <div className="app-content">
        <header className="app-header">
          <div className="chalk-mark">✦ PUMM · JIA EDU</div>
          <h1>Juegos didácticos</h1>
          <p>Elegí cómo querés jugar y encontrá la actividad para practicar.</p>
        </header>

        {!juegoSeleccionado ? (
          <section className="selector-card" aria-label="Selector de juegos">
            <div className="selection-intro">
              <span className="mamushka">🥚 → 🥚 → 🥚</span>
              <h2>Elegí tu juego</h2>
              <p>Primero el tipo, después el nivel, la materia y finalmente el juego.</p>
            </div>

            <div className="filter-step">
              <StepHeader number="1" title="Tipo de juego" done={Boolean(tipo)} />
              <div className="pill-grid">
                {tiposDisponibles.map((t) => <Pill key={t.key} active={tipo === t.key} color={t.color} onClick={() => elegirTipo(t.key)}>{t.icon} {t.label}</Pill>)}
              </div>
            </div>

            {tipo && <div className="filter-step"><StepHeader number="2" title="Nivel" done={Boolean(nivel)} /><div className="pill-grid">{nivelesDisponibles.map((n) => <Pill key={n.key} active={nivel === n.key} color={TOKENS.chalkWhite} onClick={() => elegirNivel(n.key)}>{n.label}</Pill>)}</div></div>}

            {nivel && <div className="filter-step"><StepHeader number="3" title="Materia" done={Boolean(materia)} /><div className="pill-grid">{materiasDisponibles.map((m) => <Pill key={m.key} active={materia === m.key} color={m.color} onClick={() => elegirMateria(m.key)}>{m.icon} {m.label}</Pill>)}</div></div>}

            {materia && <div className="filter-step last"><StepHeader number="4" title="Juegos disponibles" done={false} />
              {juegosDisponibles.length ? <div className="game-list">{juegosDisponibles.map((j) => <button key={j.key} className="game-card" onClick={() => setJuego(j.key)} style={{ "--game-color": j.color }}><span className="game-card-type">{TIPOS.find((t) => t.key === j.tipo)?.label}</span><strong>{j.titulo}</strong><p>{j.descripcion}</p><span className="play-link">Jugar →</span></button>)}</div> : <p className="empty-state">Todavía no hay juegos para esta combinación de filtros.</p>}
            </div>}
          </section>
        ) : (
          <section className="play-card">
            <div className="play-header">
              <button className="back-button" onClick={volverFiltros}>← Cambiar juego</button>
              <div className="selected-trail"><span>{TIPOS.find((t) => t.key === juegoSeleccionado.tipo)?.label}</span><span>›</span><span>{NIVELES.find((n) => n.key === nivel)?.short}</span><span>›</span><span>{MATERIAS.find((m) => m.key === materia)?.label}</span></div>
            </div>
            <div className="play-title"><span className="game-badge" style={{ background: `${juegoSeleccionado.color}22`, color: juegoSeleccionado.color }}>{juegoSeleccionado.titulo}</span><h2>{juegoSeleccionado.descripcion}</h2></div>
            <div className="game-panel" key={juegoSeleccionado.key}>{Component && <Component onRegistrarRespuesta={registrar} />}</div>
          </section>
        )}

        {registros.length > 0 && <div className="session-data">{registros.length} respuesta{registros.length !== 1 ? "s" : ""} registrada{registros.length !== 1 ? "s" : ""} en esta sesión · captura anónima</div>}
      </div>
    </div>
  );
}
