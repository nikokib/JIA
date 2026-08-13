import { useState, useEffect, useMemo } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "./lib/firebase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

/* Mismos tokens que juegos-didacticos.jsx para mantener identidad visual */
const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&display=swap');`;

const TOKENS = {
  board: "#1B4332",
  boardDark: "#132C21",
  chalkWhite: "#F5F3E7",
  chalkYellow: "#F4C95D",
  chalkCoral: "#E8735F",
  chalkBlue: "#6FB7B7",
};

function colorPorPorcentaje(pct) {
  if (pct < 50) return TOKENS.chalkCoral;
  if (pct < 70) return TOKENS.chalkYellow;
  return TOKENS.chalkBlue;
}

/* ============================================================
   HOOK: escucha en tiempo real las respuestas de una materia
   en Firestore y las agrega por región.
   ============================================================ */
function useDatosPorRegion(materia) {
  const [estado, setEstado] = useState("cargando"); // cargando | ok | error
  const [datos, setDatos] = useState([]);
  const [totalRespuestas, setTotalRespuestas] = useState(0);

  useEffect(() => {
    setEstado("cargando");
    const q = query(collection(db, "respuestas"), where("materia", "==", materia));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const porRegion = {};
        snapshot.forEach((doc) => {
          const r = doc.data();
          const region = r.region || "Sin región";
          if (!porRegion[region]) porRegion[region] = { correctos: 0, total: 0 };
          porRegion[region].total += 1;
          if (r.correcto) porRegion[region].correctos += 1;
        });

        const agregados = Object.entries(porRegion).map(([region, v]) => ({
          region,
          pctAciertos: Math.round((v.correctos / v.total) * 100),
          respuestas: v.total,
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
  }, [materia]);

  return { estado, datos, totalRespuestas };
}

/* ============================================================
   PANEL DE FEEDBACK — llama a la API de DeepSeek para generar
   el informe pedagógico en lenguaje natural a partir de los
   datos agregados y anónimos leídos de Firestore.
   ============================================================ */
function PanelFeedback({ materia, datos }) {
  const [estado, setEstado] = useState("idle"); // idle | cargando | listo | error
  const [informe, setInforme] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  const generar = async () => {
    setEstado("cargando");
    const resumen = datos
      .map((d) => `${d.region}: ${d.pctAciertos}% de aciertos (${d.respuestas} respuestas)`)
      .join("; ");

    const prompt = `Sos un asesor pedagógico. Estos son los resultados agregados y anónimos de un juego didáctico de ${
      materia === "matematica" ? "Matemática (fracciones)" : "Lengua (clasificación gramatical)"
    } por región: ${resumen}.

Escribí un informe breve (máximo 120 palabras) en español para docentes y autoridades educativas: identificá qué región necesita más refuerzo, sugerí una estrategia didáctica concreta para ese contenido, y cerrá con un tono constructivo. No uses formato markdown, solo texto plano en párrafos cortos.`;

    try {
      const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
      if (!apiKey) {
        throw new Error("Falta VITE_DEEPSEEK_API_KEY en el archivo .env");
      }

      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 400,
        }),
      });

      if (!response.ok) {
        const detalle = await response.text();
        throw new Error(`DeepSeek respondió ${response.status}: ${detalle}`);
      }

      const data = await response.json();
      const texto = data.choices?.[0]?.message?.content?.trim() || "No se pudo generar el informe.";
      setInforme(texto);
      setEstado("listo");
    } catch (e) {
      console.error("Error generando feedback con DeepSeek:", e);
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
          Feedback pedagógico (DeepSeek)
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
function EstadoVacio({ materia }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 12px" }}>
      <p style={{ fontFamily: "Kalam", fontSize: 20, color: TOKENS.chalkWhite, margin: 0 }}>
        Todavía no hay respuestas registradas
      </p>
      <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, color: TOKENS.chalkWhite, opacity: 0.55, marginTop: 8 }}>
        Jugá una partida de {materia === "matematica" ? "la trivia de Matemática" : "clasificar palabras de Lengua"} para
        ver los datos acá en tiempo real.
      </p>
    </div>
  );
}

/* ============================================================
   DASHBOARD
   ============================================================ */
export default function Dashboard() {
  const [materia, setMateria] = useState("matematica");
  const { estado, datos, totalRespuestas } = useDatosPorRegion(materia);

  const tabs = [
    { key: "matematica", label: "Matemática · Fracciones", color: TOKENS.chalkYellow },
    { key: "lengua", label: "Lengua · Clasificación", color: TOKENS.chalkBlue },
  ];

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

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setMateria(t.key)}
              style={{
                flex: 1,
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
              {t.label}
            </button>
          ))}
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

          {estado === "ok" && datos.length === 0 && <EstadoVacio materia={materia} />}

          {estado === "ok" && datos.length > 0 && (
            <>
              <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, color: TOKENS.chalkWhite, opacity: 0.6, marginTop: 0, marginBottom: 16 }}>
                % de aciertos por región
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

              <PanelFeedback materia={materia} datos={datos} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
