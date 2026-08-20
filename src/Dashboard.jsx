import { useState, useEffect, useMemo } from "react";
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "./lib/firebase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { COMUNAS, etiquetaComuna } from "./lib/ubicacion";

/* Mismos tokens que juegos-didacticos.jsx para mantener identidad visual */
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

/* Mismas materias que en App.jsx (juegos), para que el panel pueda
   mostrar y filtrar los datos de las 8 materias disponibles. */
const MATERIAS = [
  { key: "matematica", label: "Matemática", icon: "➗", color: TOKENS.chalkYellow },
  { key: "lengua", label: "Lengua", icon: "📚", color: TOKENS.chalkBlue },
  { key: "ciencias", label: "Ciencias", icon: "🔬", color: TOKENS.chalkCoral },
  { key: "geografia", label: "Geografía", icon: "🌎", color: TOKENS.chalkBlue },
  { key: "ingles", label: "Inglés", icon: "🇬🇧", color: TOKENS.chalkCoral },
  { key: "musica", label: "Música", icon: "🎵", color: TOKENS.chalkPurple },
  { key: "tecnologia", label: "Tecnología", icon: "💻", color: TOKENS.chalkBlue },
  { key: "artes", label: "Artística", icon: "🎨", color: TOKENS.chalkPurple },
];

/* Niveles con juegos cargados (ver App.jsx). "Todos los niveles"
   (nivel === null) no filtra por nivel, para no ocultar datos
   cargados antes de tener este filtro. */
const NIVELES = [
  { key: "5p", label: "5to grado" },
  { key: "6p", label: "6to grado" },
  { key: "7p", label: "7mo grado" },
];

function colorPorPorcentaje(pct) {
  if (pct < 50) return TOKENS.chalkCoral;
  if (pct < 70) return TOKENS.chalkYellow;
  return TOKENS.chalkBlue;
}

/* ============================================================
   HOOK: escucha en tiempo real las respuestas de una materia
   en Firestore y las agrega por región.
   ============================================================ */
function useDatosPorRegion(materia, nivel, comuna) {
  const [estado, setEstado] = useState("cargando"); // cargando | ok | error
  const [datos, setDatos] = useState([]);
  const [totalRespuestas, setTotalRespuestas] = useState(0);

  useEffect(() => {
    setEstado("cargando");
    const filtros = [where("materia", "==", materia)];
    if (nivel) filtros.push(where("nivel", "==", nivel));
    if (comuna) filtros.push(where("region", "==", etiquetaComuna(comuna)));
    const q = query(collection(db, "respuestas"), ...filtros);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const porRegion = {};
        snapshot.forEach((doc) => {
          const r = doc.data();
          const region = r.region || "Sin comuna";
          if (!porRegion[region]) porRegion[region] = { correctos: 0, total: 0, sumaTiempo: 0 };
          porRegion[region].total += 1;
          if (r.correcto) porRegion[region].correctos += 1;
          if (typeof r.tiempoRespuesta === "number") porRegion[region].sumaTiempo += r.tiempoRespuesta;
        });

        const agregados = Object.entries(porRegion).map(([region, v]) => ({
          region,
          pctAciertos: Math.round((v.correctos / v.total) * 100),
          respuestas: v.total,
          tiempoPromedio: v.total > 0 ? Number((v.sumaTiempo / v.total).toFixed(1)) : 0,
        }));

        setDatos(agregados);
        setTotalRespuestas(snapshot.size);
        setEstado("ok");
      },
      (error) => {
        console.error("Error leyendo Firestore:", error);
        setEstado("error");
      }
    );

    return () => unsubscribe();
  }, [materia, nivel, comuna]);

  return { estado, datos, totalRespuestas };
}

/* ============================================================
   KPI DE UNA COMUNA — cuando se filtra a una sola comuna, un
   gráfico de barras de un solo dato no dice nada (ver dataviz:
   "a single current value → stat tile, not a one-bar bar chart").
   Se muestran 3 tarjetas con los números clave de esa comuna.
   ============================================================ */
function KpiComuna({ dato }) {
  const tarjetas = [
    { label: "% de aciertos", valor: `${dato.pctAciertos}%`, color: colorPorPorcentaje(dato.pctAciertos) },
    { label: "Respuestas registradas", valor: dato.respuestas, color: TOKENS.chalkBlue },
    { label: "Tiempo promedio", valor: `${dato.tiempoPromedio}s`, color: TOKENS.chalkPurple },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 12,
      }}
    >
      {tarjetas.map((t) => (
        <div
          key={t.label}
          style={{
            border: `2px solid ${t.color}`,
            borderRadius: 14,
            padding: 16,
            textAlign: "center",
          }}
        >
          <div style={{ fontFamily: "Kalam", fontSize: 30, color: t.color }}>{t.valor}</div>
          <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 12, color: TOKENS.chalkWhite, opacity: 0.7 }}>
            {t.label}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   PANEL DE FEEDBACK — llama a la API de Gemini (Google AI Studio,
   free tier) para generar el informe pedagógico en lenguaje
   natural a partir de los datos agregados y anónimos leídos de
   Firestore.
   ============================================================ */
function PanelFeedback({ materia, nivel, comuna, datos }) {
  const [estado, setEstado] = useState("idle"); // idle | cargando | listo | error
  const [informe, setInforme] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  const generar = async () => {
    setEstado("cargando");
    const resumen = datos
      .map((d) => `${d.region}: ${d.pctAciertos}% de aciertos (${d.respuestas} respuestas)`)
      .join("; ");

    const nombreMateria = MATERIAS.find((m) => m.key === materia)?.label || materia;
    const nombreNivel = NIVELES.find((n) => n.key === nivel)?.label;
    const materiaConNivel = nombreNivel ? `${nombreMateria} (${nombreNivel})` : nombreMateria;

    const prompt = comuna
      ? `Sos un asesor pedagógico. Estos son los resultados agregados y anónimos de juegos didácticos de ${materiaConNivel} en la ${etiquetaComuna(comuna)} de la Ciudad de Buenos Aires: ${resumen}.

Escribí un informe breve (máximo 120 palabras) en español para docentes y autoridades educativas de esa comuna: evaluá el desempeño, sugerí una estrategia didáctica concreta para ese contenido, y cerrá con un tono constructivo. No uses formato markdown, solo texto plano en párrafos cortos.`
      : `Sos un asesor pedagógico. Estos son los resultados agregados y anónimos de juegos didácticos de ${materiaConNivel} por comuna de la Ciudad de Buenos Aires: ${resumen}.

Escribí un informe breve (máximo 120 palabras) en español para docentes y autoridades educativas: identificá qué comuna necesita más refuerzo, sugerí una estrategia didáctica concreta para ese contenido, y cerrá con un tono constructivo. No uses formato markdown, solo texto plano en párrafos cortos.`;

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Falta VITE_GEMINI_API_KEY en el archivo .env");
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!response.ok) {
        const detalle = await response.text();
        throw new Error(`Gemini respondió ${response.status}: ${detalle}`);
      }

      const data = await response.json();
      const texto =
        data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "No se pudo generar el informe.";
      setInforme(texto);
      setEstado("listo");
    } catch (e) {
      console.error("Error generando feedback con Gemini:", e);
      setMensajeError(e.message);
      setEstado("error");
    }
  };

  return (
    <div
      style={{
        marginTop: 24,
        border: `1px solid rgba(245,243,231,0.15)`,
        borderRadius: 16,
        padding: 20,
        background: "rgba(0,0,0,0.15)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "Kalam", fontSize: 18, fontWeight: 700, color: TOKENS.chalkWhite }}>
          Feedback pedagógico (Gemini)
        </span>
        <button
          onClick={generar}
          disabled={estado === "cargando" || datos.length === 0}
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 600,
            padding: "8px 16px",
            borderRadius: 999,
            border: `2px solid ${TOKENS.chalkYellow}`,
            background: estado === "cargando" ? "transparent" : `${TOKENS.chalkYellow}22`,
            color: TOKENS.chalkYellow,
            cursor: estado === "cargando" || datos.length === 0 ? "default" : "pointer",
            opacity: datos.length === 0 ? 0.4 : 1,
          }}
        >
          {estado === "cargando" ? "Generando…" : "Generar informe con IA"}
        </button>
      </div>

      {estado === "idle" && (
        <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, color: TOKENS.chalkWhite, opacity: 0.5, marginTop: 12, marginBottom: 0 }}>
          Tocá el botón para que la IA analice estos datos agregados y sugiera qué reforzar y dónde.
        </p>
      )}
      {estado === "error" && (
        <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, color: TOKENS.chalkCoral, marginTop: 12, marginBottom: 0 }}>
          No se pudo generar el informe. {mensajeError}
        </p>
      )}
      {estado === "listo" && (
        <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 14, lineHeight: 1.6, color: TOKENS.chalkWhite, opacity: 0.9, marginTop: 14, marginBottom: 0, whiteSpace: "pre-wrap" }}>
          {informe}
        </p>
      )}
    </div>
  );
}

/* ============================================================
   ESTADO VACÍO — todavía no hay respuestas en Firestore para
   esta materia. Es una invitación a jugar, no un error.
   ============================================================ */
function EstadoVacio({ materia, nivel, comuna }) {
  const nombreMateria = MATERIAS.find((m) => m.key === materia)?.label || materia;
  const nombreNivel = NIVELES.find((n) => n.key === nivel)?.label;
  return (
    <div style={{ textAlign: "center", padding: "48px 12px" }}>
      <p style={{ fontFamily: "Kalam", fontSize: 20, color: TOKENS.chalkWhite, margin: 0 }}>
        Todavía no hay respuestas registradas
      </p>
      <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, color: TOKENS.chalkWhite, opacity: 0.55, marginTop: 8 }}>
        Jugá una partida de {nombreMateria}
        {nombreNivel ? ` de ${nombreNivel}` : ""}
        {comuna ? ` en la ${etiquetaComuna(comuna)}` : ""} para ver los datos acá en tiempo real.
      </p>
    </div>
  );
}

/* ============================================================
   EXPORTAR DATASET — descarga TODAS las respuestas registradas
   (sin aplicar los filtros de materia/nivel/comuna de arriba) como
   CSV, listo para importar en Power BI, Tableau o Excel. Es una
   lectura puntual (getDocs), no queda escuchando como el resto del
   dashboard.
   ============================================================ */
const COLUMNAS_EXPORTACION = ["id", "materia", "contenido", "correcto", "tiempoRespuesta", "comuna", "nivel", "fecha"];

function filaAcsv(valor) {
  const texto = String(valor ?? "");
  return /[",\n;]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

function BotonExportarDataset() {
  const [estado, setEstado] = useState("idle"); // idle | generando | error

  const descargar = async () => {
    setEstado("generando");
    try {
      const snapshot = await getDocs(collection(db, "respuestas"));

      const filas = snapshot.docs.map((doc) => {
        const r = doc.data();
        const fecha = r.creadoEn?.toDate ? r.creadoEn.toDate().toISOString() : "";
        return {
          id: doc.id,
          materia: r.materia ?? "",
          contenido: r.contenido ?? "",
          correcto: r.correcto === true ? "true" : r.correcto === false ? "false" : "",
          tiempoRespuesta: r.tiempoRespuesta ?? "",
          comuna: r.region ?? "",
          nivel: r.nivel ?? "",
          fecha,
        };
      });

      const csv = [
        COLUMNAS_EXPORTACION.join(","),
        ...filas.map((fila) => COLUMNAS_EXPORTACION.map((c) => filaAcsv(fila[c])).join(",")),
      ].join("\n");

      // BOM al inicio para que Excel/Power BI detecten UTF-8 (tildes, ñ) sin pedir configuración.
      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      const fechaArchivo = new Date().toISOString().slice(0, 10);
      enlace.href = url;
      enlace.download = `navpumm-respuestas-${fechaArchivo}.csv`;
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
      URL.revokeObjectURL(url);

      setEstado("idle");
    } catch (e) {
      console.error("No se pudo exportar el dataset:", e);
      setEstado("error");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginBottom: 24 }}>
      <button
        onClick={descargar}
        disabled={estado === "generando"}
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: 13,
          fontWeight: 600,
          padding: "9px 18px",
          borderRadius: 999,
          border: `2px solid ${TOKENS.chalkBlue}`,
          background: estado === "generando" ? "transparent" : `${TOKENS.chalkBlue}22`,
          color: TOKENS.chalkBlue,
          cursor: estado === "generando" ? "default" : "pointer",
        }}
      >
        {estado === "generando" ? "Generando archivo…" : "⬇️ Descargar dataset completo (CSV)"}
      </button>
      <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 11, color: TOKENS.chalkWhite, opacity: 0.5, margin: 0, textAlign: "center" }}>
        {estado === "error"
          ? "No se pudo generar el archivo. Probá de nuevo."
          : "Incluye todas las respuestas registradas, sin aplicar los filtros de materia, nivel o comuna — listo para Power BI o Tableau."}
      </p>
    </div>
  );
}

/* ============================================================
   DASHBOARD
   ============================================================ */
export default function Dashboard() {
  const [materia, setMateria] = useState("matematica");
  const [nivel, setNivel] = useState(null); // null = todos los niveles
  const [comuna, setComuna] = useState(null); // null = todas las comunas
  const { estado, datos, totalRespuestas } = useDatosPorRegion(materia, nivel, comuna);

  const tabs = MATERIAS;

  const peorRegion = useMemo(() => {
    if (datos.length === 0) return null;
    return [...datos].sort((a, b) => a.pctAciertos - b.pctAciertos)[0];
  }, [datos]);

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
      <div style={{ width: "100%", maxWidth: 620 }}>
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <h1 style={{ fontFamily: "Kalam", fontWeight: 700, fontSize: 32, color: TOKENS.chalkWhite, margin: 0 }}>
            Panel para autoridades
          </h1>
          <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, color: TOKENS.chalkWhite, opacity: 0.55, marginTop: 6 }}>
            {estado === "ok"
              ? `Datos en tiempo real desde Firestore · ${totalRespuestas} respuesta${totalRespuestas !== 1 ? "s" : ""} registrada${totalRespuestas !== 1 ? "s" : ""}`
              : "Conectando con la base de datos…"}
          </p>
        </div>

        <BotonExportarDataset />

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setMateria(t.key)}
              style={{
                flex: "1 1 130px",
                fontFamily: "Kalam",
                fontSize: 15,
                fontWeight: 700,
                padding: "10px 8px",
                borderRadius: 10,
                border: `2px solid ${materia === t.key ? t.color : "rgba(245,243,231,0.2)"}`,
                background: materia === t.key ? `${t.color}22` : "transparent",
                color: materia === t.key ? t.color : TOKENS.chalkWhite,
                cursor: "pointer",
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          <button
            onClick={() => setNivel(null)}
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: 13,
              fontWeight: 600,
              padding: "7px 14px",
              borderRadius: 999,
              border: `2px solid ${nivel === null ? TOKENS.chalkWhite : "rgba(245,243,231,0.2)"}`,
              background: nivel === null ? "rgba(245,243,231,0.12)" : "transparent",
              color: TOKENS.chalkWhite,
              cursor: "pointer",
            }}
          >
            Todos los niveles
          </button>
          {NIVELES.map((n) => (
            <button
              key={n.key}
              onClick={() => setNivel(n.key)}
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 13,
                fontWeight: 600,
                padding: "7px 14px",
                borderRadius: 999,
                border: `2px solid ${nivel === n.key ? TOKENS.chalkWhite : "rgba(245,243,231,0.2)"}`,
                background: nivel === n.key ? "rgba(245,243,231,0.12)" : "transparent",
                color: TOKENS.chalkWhite,
                cursor: "pointer",
              }}
            >
              {n.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <label
            htmlFor="filtro-comuna"
            style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, color: TOKENS.chalkWhite, opacity: 0.7 }}
          >
            Comuna:
          </label>
          <select
            id="filtro-comuna"
            value={comuna || ""}
            onChange={(e) => setComuna(e.target.value ? Number(e.target.value) : null)}
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: 13,
              fontWeight: 600,
              padding: "7px 12px",
              borderRadius: 10,
              border: `2px solid ${comuna ? TOKENS.chalkWhite : "rgba(245,243,231,0.2)"}`,
              background: comuna ? "rgba(245,243,231,0.12)" : "transparent",
              color: TOKENS.chalkWhite,
              cursor: "pointer",
            }}
          >
            <option value="">Todas las comunas</option>
            {COMUNAS.map((n) => (
              <option key={n} value={n}>
                {etiquetaComuna(n)}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            background: "rgba(0,0,0,0.15)",
            border: "1px solid rgba(245,243,231,0.12)",
            borderRadius: 20,
            padding: 24,
            boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
          }}
        >
          {estado === "error" && (
            <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, color: TOKENS.chalkCoral, margin: 0 }}>
              No se pudo conectar con Firestore. Revisá las claves en el archivo .env y las reglas de seguridad.
            </p>
          )}

          {estado === "ok" && datos.length === 0 && (
            <EstadoVacio materia={materia} nivel={nivel} comuna={comuna} />
          )}

          {estado === "ok" && datos.length > 0 && comuna && (
            <>
              <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, color: TOKENS.chalkWhite, opacity: 0.6, marginTop: 0, marginBottom: 16 }}>
                {etiquetaComuna(comuna)}
              </p>

              <KpiComuna dato={datos[0]} />

              <PanelFeedback materia={materia} nivel={nivel} comuna={comuna} datos={datos} />
            </>
          )}

          {estado === "ok" && datos.length > 0 && !comuna && (
            <>
              <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, color: TOKENS.chalkWhite, opacity: 0.6, marginTop: 0, marginBottom: 16 }}>
                % de aciertos por comuna
              </p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={datos} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,243,231,0.1)" vertical={false} />
                  <XAxis
                    dataKey="region"
                    tick={{ fill: TOKENS.chalkWhite, fontFamily: "system-ui, sans-serif", fontSize: 11 }}
                    axisLine={{ stroke: "rgba(245,243,231,0.2)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: TOKENS.chalkWhite, fontFamily: "system-ui, sans-serif", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{ background: TOKENS.boardDark, border: `1px solid ${TOKENS.chalkWhite}33`, borderRadius: 8 }}
                    labelStyle={{ fontFamily: "Kalam", color: TOKENS.chalkWhite }}
                    itemStyle={{ fontFamily: "system-ui, sans-serif", color: TOKENS.chalkWhite }}
                    formatter={(value) => [`${value}%`, "Aciertos"]}
                  />
                  <Bar dataKey="pctAciertos" radius={[8, 8, 0, 0]}>
                    {datos.map((d, i) => (
                      <Cell key={i} fill={colorPorPorcentaje(d.pctAciertos)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {peorRegion && (
                <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, color: TOKENS.chalkWhite, opacity: 0.7, marginTop: 12, marginBottom: 0 }}>
                  <strong style={{ color: TOKENS.chalkCoral }}>{peorRegion.region}</strong> es la que más necesita
                  refuerzo en este contenido, con {peorRegion.pctAciertos}% de aciertos.
                </p>
              )}

              <PanelFeedback materia={materia} nivel={nivel} comuna={comuna} datos={datos} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
