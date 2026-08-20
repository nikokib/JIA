import { useState, useEffect, useRef, useCallback } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./lib/firebase";
import {
  COMUNAS,
  obtenerComunaActual,
  fijarComunaActual,
  detectarComunaPorGPS,
  etiquetaComuna,
} from "./lib/ubicacion";

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
   BANCO DE PREGUNTAS — MATEMÁTICA
   5.º, 6.º y 7.º GRADO
   ============================================================ */

const BANCO_MATE_5 = [
  {
    id: "5m1",
    contenido: "fracciones",
    pregunta: "En una torta se comieron 3/8. ¿Qué fracción de la torta quedó?",
    opciones: ["3/8", "5/8", "6/8", "1/8"],
    correcta: 1,
  },
  {
    id: "5m2",
    contenido: "fracciones-equivalentes",
    pregunta: "¿Cuál de estas fracciones representa la misma cantidad que 1/2?",
    opciones: ["2/4", "2/3", "3/5", "4/6"],
    correcta: 0,
  },
  {
    id: "5m3",
    contenido: "fracciones-recta",
    pregunta: "¿Cuál fracción está más cerca de 1 en la recta numérica?",
    opciones: ["1/4", "2/5", "3/4", "1/3"],
    correcta: 2,
  },
  {
    id: "5m4",
    contenido: "fracciones",
    pregunta: "¿Cuál es el resultado de 2/5 + 1/5?",
    opciones: ["3/5", "2/10", "3/10", "1/5"],
    correcta: 0,
  },
  {
    id: "5m5",
    contenido: "decimales",
    pregunta: "¿Qué número representa 37 centésimos?",
    opciones: ["0,037", "0,37", "3,7", "37"],
    correcta: 1,
  },
  {
    id: "5m6",
    contenido: "decimales",
    pregunta: "¿Cuál es mayor?",
    opciones: ["0,45", "0,5", "0,405", "0,49"],
    correcta: 1,
  },
  {
    id: "5m7",
    contenido: "operaciones",
    pregunta: "Una escuela recibió 1.250 libros y repartió 375. ¿Cuántos libros quedaron?",
    opciones: ["875", "925", "975", "1.025"],
    correcta: 2,
  },
  {
    id: "5m8",
    contenido: "division",
    pregunta: "Hay 144 figuritas para repartir en partes iguales entre 12 chicos. ¿Cuántas recibe cada uno?",
    opciones: ["10", "11", "12", "14"],
    correcta: 2,
  },
  {
    id: "5m9",
    contenido: "proporcionalidad",
    pregunta: "Para preparar 4 jugos se necesitan 8 naranjas. ¿Cuántas naranjas hacen falta para 10 jugos manteniendo la misma relación?",
    opciones: ["16", "18", "20", "24"],
    correcta: 2,
  },
  {
    id: "5m10",
    contenido: "medida",
    pregunta: "Una cinta mide 2 metros y 35 centímetros. ¿Cuántos centímetros mide en total?",
    opciones: ["235 cm", "250 cm", "205 cm", "2.035 cm"],
    correcta: 0,
  },
  {
    id: "5m11",
    contenido: "perimetro",
    pregunta: "Un rectángulo mide 8 cm de largo y 5 cm de ancho. ¿Cuál es su perímetro?",
    opciones: ["13 cm", "26 cm", "40 cm", "20 cm"],
    correcta: 1,
  },
  {
    id: "5m12",
    contenido: "area",
    pregunta: "Un rectángulo mide 7 cm de largo y 4 cm de ancho. ¿Cuál es su área?",
    opciones: ["11 cm²", "22 cm²", "28 cm²", "35 cm²"],
    correcta: 2,
  },
];

const BANCO_MATE_6 = [
  {
    id: "6m1",
    contenido: "racionales",
    pregunta: "¿Cuál de estas fracciones es mayor?",
    opciones: ["3/5", "2/3", "1/2", "4/9"],
    correcta: 1,
  },
  {
    id: "6m2",
    contenido: "racionales",
    pregunta: "¿Qué número puede ubicarse entre 1/2 y 3/4?",
    opciones: ["1/4", "2/5", "5/8", "7/8"],
    correcta: 2,
  },
  {
    id: "6m3",
    contenido: "decimales",
    pregunta: "¿Cuál es equivalente a 0,75?",
    opciones: ["3/4", "1/4", "7/10", "2/5"],
    correcta: 0,
  },
  {
    id: "6m4",
    contenido: "fracciones",
    pregunta: "¿Cuánto es 3/4 + 1/2?",
    opciones: ["4/6", "5/4", "3/8", "1"],
    correcta: 1,
  },
  {
    id: "6m5",
    contenido: "proporcionalidad",
    pregunta: "Si 4 cuadernos cuestan $3.200, ¿cuánto cuestan 7 al mismo precio por unidad?",
    opciones: ["$4.800", "$5.200", "$5.600", "$6.400"],
    correcta: 2,
  },
  {
    id: "6m6",
    contenido: "proporcionalidad",
    pregunta: "Una receta para 6 personas usa 900 g de harina. ¿Cuánta harina se necesita para 10 personas?",
    opciones: ["1.200 g", "1.350 g", "1.500 g", "1.800 g"],
    correcta: 2,
  },
  {
    id: "6m7",
    contenido: "porcentajes",
    pregunta: "¿Cuánto es el 25% de 240?",
    opciones: ["40", "50", "60", "80"],
    correcta: 2,
  },
  {
    id: "6m8",
    contenido: "porcentajes",
    pregunta: "Una bicicleta cuesta $80.000 y tiene un descuento del 10%. ¿Cuánto se descuenta?",
    opciones: ["$4.000", "$8.000", "$10.000", "$12.000"],
    correcta: 1,
  },
  {
    id: "6m9",
    contenido: "porcentajes",
    pregunta: "¿Qué porcentaje representa 30 de 120?",
    opciones: ["20%", "25%", "30%", "40%"],
    correcta: 1,
  },
  {
    id: "6m10",
    contenido: "escalas",
    pregunta: "En un plano, 1 cm representa 5 metros. ¿Cuántos metros representan 7 cm?",
    opciones: ["12 m", "25 m", "35 m", "40 m"],
    correcta: 2,
  },
  {
    id: "6m11",
    contenido: "area",
    pregunta: "Un rectángulo tiene 12 cm de largo y 5 cm de ancho. ¿Cuál es su área?",
    opciones: ["17 cm²", "34 cm²", "60 cm²", "120 cm²"],
    correcta: 2,
  },
  {
    id: "6m12",
    contenido: "estadistica",
    pregunta: "Las edades de un grupo son 10, 12, 12, 13 y 18. ¿Cuál es la moda?",
    opciones: ["10", "12", "13", "18"],
    correcta: 1,
  },
];
const BANCO_MATE_7 = [
  {
    id: "7m1",
    contenido: "numeracion",
    pregunta: "¿Cuál es la descomposición multiplicativa de 3.405?",
    opciones: [
      "3 × 1000 + 4 × 100 + 5",
      "3 × 1000 + 4 × 10 + 5",
      "3 × 100 + 4 × 10 + 5",
      "34 × 100 + 5",
    ],
    correcta: 1,
  },
  {
    id: "7m2",
    contenido: "divisibilidad",
    pregunta: "¿Cuál de estos números es divisible por 3?",
    opciones: ["124", "215", "327", "418"],
    correcta: 2,
  },
  {
    id: "7m3",
    contenido: "divisores",
    pregunta: "¿Cuál de estos números es divisor de 48?",
    opciones: ["5", "6", "7", "10"],
    correcta: 1,
  },
  {
    id: "7m4",
    contenido: "operaciones-combinadas",
    pregunta: "¿Cuál es el resultado de 18 − 3 × 4?",
    opciones: ["6", "12", "60", "15"],
    correcta: 0,
  },
  {
    id: "7m5",
    contenido: "fracciones",
    pregunta: "¿Cuál es mayor?",
    opciones: ["5/8", "2/3", "3/5", "7/12"],
    correcta: 1,
  },
  {
    id: "7m6",
    contenido: "racionales",
    pregunta: "¿Cuál de estos números está entre 0,4 y 0,5?",
    opciones: ["0,35", "0,45", "0,55", "0,6"],
    correcta: 1,
  },
  {
    id: "7m7",
    contenido: "proporcionalidad",
    pregunta: "Un auto recorre 180 km con 12 litros de combustible. Manteniendo la misma relación, ¿cuántos km recorrerá con 20 litros?",
    opciones: ["240 km", "270 km", "300 km", "360 km"],
    correcta: 2,
  },
  {
    id: "7m8",
    contenido: "porcentajes",
    pregunta: "Una computadora cuesta $500.000 y tiene un descuento del 15%. ¿Cuánto se descuenta?",
    opciones: ["$50.000", "$65.000", "$75.000", "$85.000"],
    correcta: 2,
  },
  {
    id: "7m9",
    contenido: "estadistica",
    pregunta: "Los resultados de una encuesta fueron 4, 6, 6, 8 y 11. ¿Cuál es la media?",
    opciones: ["6", "7", "8", "9"],
    correcta: 1,
  },
  {
    id: "7m10",
    contenido: "probabilidad",
    pregunta: "En una bolsa hay 3 bolitas rojas y 7 azules. Si sacás una sin mirar, ¿cuál es la probabilidad de sacar una roja?",
    opciones: ["3%", "10%", "30%", "70%"],
    correcta: 2,
  },
  {
    id: "7m11",
    contenido: "coordenadas",
    pregunta: "¿Qué coordenadas corresponden a un punto ubicado 4 unidades a la derecha y 3 hacia arriba del origen?",
    opciones: ["(3,4)", "(4,3)", "(-4,3)", "(4,-3)"],
    correcta: 1,
  },
  {
    id: "7m12",
    contenido: "geometria",
    pregunta: "¿Cuánto suman los ángulos interiores de un triángulo?",
    opciones: ["90°", "180°", "270°", "360°"],
    correcta: 1,
  },
];/* ============================================================
   BANCO DE PREGUNTAS — LENGUA
   5.º, 6.º y 7.º GRADO
   ============================================================ */

const BANCO_LENGUA_5 = [
  {
    id: "5l1",
    palabra: "escuela",
    categoria: "sustantivo",
  },
  {
    id: "5l2",
    palabra: "aventura",
    categoria: "sustantivo",
  },
  {
    id: "5l3",
    palabra: "correr",
    categoria: "verbo",
  },
  {
    id: "5l4",
    palabra: "imaginar",
    categoria: "verbo",
  },
  {
    id: "5l5",
    palabra: "enorme",
    categoria: "adjetivo",
  },
  {
    id: "5l6",
    palabra: "pequeño",
    categoria: "adjetivo",
  },
  {
    id: "5l7",
    palabra: "biblioteca",
    categoria: "sustantivo",
  },
  {
    id: "5l8",
    palabra: "saltar",
    categoria: "verbo",
  },
  {
    id: "5l9",
    palabra: "brillante",
    categoria: "adjetivo",
  },
  {
    id: "5l10",
    palabra: "amistad",
    categoria: "sustantivo",
  },
  {
    id: "5l11",
    palabra: "dibujar",
    categoria: "verbo",
  },
  {
    id: "5l12",
    palabra: "misterioso",
    categoria: "adjetivo",
  },
];

const BANCO_LENGUA_6 = [
  {
    id: "6l1",
    palabra: "investigación",
    categoria: "sustantivo",
  },
  {
    id: "6l2",
    palabra: "descubrimiento",
    categoria: "sustantivo",
  },
  {
    id: "6l3",
    palabra: "analizar",
    categoria: "verbo",
  },
  {
    id: "6l4",
    palabra: "descubrieron",
    categoria: "verbo",
  },
  {
    id: "6l5",
    palabra: "extraordinario",
    categoria: "adjetivo",
  },
  {
    id: "6l6",
    palabra: "misterioso",
    categoria: "adjetivo",
  },
  {
    id: "6l7",
    palabra: "conocimiento",
    categoria: "sustantivo",
  },
  {
    id: "6l8",
    palabra: "observar",
    categoria: "verbo",
  },
  {
    id: "6l9",
    palabra: "importante",
    categoria: "adjetivo",
  },
  {
    id: "6l10",
    palabra: "experimento",
    categoria: "sustantivo",
  },
  {
    id: "6l11",
    palabra: "comparar",
    categoria: "verbo",
  },
  {
    id: "6l12",
    palabra: "complejo",
    categoria: "adjetivo",
  },
];

/* ============================================================
   7.º GRADO
   Comprensión crítica, organización textual, argumentación,
   cohesión, sintaxis, recursos literarios y revisión de textos.
   ============================================================ */

const BANCO_LENGUA_7 = [
  {
    id: "7l1",
    contenido: "comprension-critica",
    pregunta:
      "Un texto afirma: «Deberíamos plantar más árboles porque ayudan a mejorar la calidad del aire». ¿Qué tipo de texto podría ser?",
    opciones: [
      "Un texto argumentativo.",
      "Una receta.",
      "Un texto instructivo.",
      "Una descripción exclusivamente.",
    ],
    correcta: 0,
  },

  {
    id: "7l2",
    contenido: "argumentacion",
    pregunta:
      "En un texto argumentativo, ¿qué función cumple un argumento?",
    opciones: [
      "Presentar una razón que sostiene una postura.",
      "Describir siempre un personaje.",
      "Indicar solamente el título.",
      "Separar los párrafos.",
    ],
    correcta: 0,
  },

  {
    id: "7l3",
    contenido: "tesis",
    pregunta:
      "¿Qué es una tesis en un texto argumentativo?",
    opciones: [
      "Una pregunta sin respuesta.",
      "La postura o idea que se busca sostener.",
      "El nombre del autor.",
      "La conclusión de una historia.",
    ],
    correcta: 1,
  },

  {
    id: "7l4",
    contenido: "cohesion",
    pregunta:
      "¿Cuál recurso permite evitar repetir constantemente un mismo sustantivo?",
    opciones: [
      "Usar pronombres o expresiones equivalentes.",
      "Eliminar todos los verbos.",
      "Agregar signos de exclamación.",
      "Escribir todo en mayúsculas.",
    ],
    correcta: 0,
  },

  {
    id: "7l5",
    contenido: "conectores",
    pregunta:
      "¿Cuál conector introduce una consecuencia?",
    opciones: [
      "sin embargo",
      "aunque",
      "por lo tanto",
      "mientras",
    ],
    correcta: 2,
  },

  {
    id: "7l6",
    contenido: "sintaxis",
    pregunta:
      "En «Los estudiantes resolvieron el desafío», ¿cuál es el sujeto?",
    opciones: [
      "resolvieron",
      "el desafío",
      "Los estudiantes",
      "desafío",
    ],
    correcta: 2,
  },

  {
    id: "7l7",
    contenido: "sintaxis",
    pregunta:
      "En «Los estudiantes resolvieron el desafío», ¿cuál es el predicado?",
    opciones: [
      "Los estudiantes",
      "resolvieron el desafío",
      "el desafío",
      "estudiantes",
    ],
    correcta: 1,
  },

  {
    id: "7l8",
    contenido: "voz-narrativa",
    pregunta:
      "Si el narrador cuenta una historia usando «yo» y participa de los hechos, ¿qué tipo de narrador es?",
    opciones: [
      "Narrador protagonista.",
      "Narrador externo.",
      "Narrador omnisciente.",
      "Narrador objetivo.",
    ],
    correcta: 0,
  },

  {
    id: "7l9",
    contenido: "recursos-literarios",
    pregunta:
      "En «Tus ojos son dos estrellas», ¿qué recurso literario aparece?",
    opciones: [
      "Metáfora.",
      "Enumeración.",
      "Pregunta retórica.",
      "Onomatopeya.",
    ],
    correcta: 0,
  },

  {
    id: "7l10",
    contenido: "recursos-literarios",
    pregunta:
      "En «El viento susurraba entre los árboles», ¿qué recurso aparece?",
    opciones: [
      "Personificación.",
      "Hipérbole.",
      "Rima.",
      "Enumeración.",
    ],
    correcta: 0,
  },

  {
    id: "7l11",
    contenido: "revision-escritura",
    pregunta:
      "¿Cuál es una buena estrategia para revisar un texto antes de entregarlo?",
    opciones: [
      "Leerlo y revisar coherencia, puntuación y ortografía.",
      "Cambiar todas las palabras por sinónimos.",
      "Eliminar todos los conectores.",
      "Escribirlo nuevamente sin leerlo.",
    ],
    correcta: 0,
  },

  {
    id: "7l12",
    contenido: "comprension-critica",
    pregunta:
      "Si dos textos presentan opiniones diferentes sobre el mismo tema, ¿qué sería más importante comparar?",
    opciones: [
      "Solo la cantidad de palabras.",
      "Las posturas y los argumentos utilizados.",
      "El tamaño de las letras.",
      "La cantidad de títulos.",
    ],
    correcta: 1,
  },
];

/* ============================================================
   BANCO — TECNOLOGÍA
   Detective Digital
   ============================================================ */

const BANCO_TECNOLOGIA = [
  {
    id: "t1",
    contenido: "dispositivos",
    pregunta: "¿Cuál de estos objetos sirve para escribir en una computadora?",
    opciones: ["Teclado", "Parlante", "Monitor", "Cámara"],
    correcta: 0,
  },
  {
    id: "t2",
    contenido: "dispositivos",
    pregunta: "¿Cuál de estos objetos sirve para escuchar música?",
    opciones: ["Micrófono", "Parlante", "Teclado", "Impresora"],
    correcta: 1,
  },
  {
    id: "t3",
    contenido: "dispositivos",
    pregunta: "¿Qué dispositivo usamos principalmente para sacar fotos?",
    opciones: ["Cámara", "Teclado", "Impresora", "Parlante"],
    correcta: 0,
  },
  {
    id: "t4",
    contenido: "dispositivos",
    pregunta: "¿Qué dispositivo permite ver imágenes y videos de una computadora?",
    opciones: ["Mouse", "Monitor", "Micrófono", "Teclado"],
    correcta: 1,
  },
  {
    id: "t5",
    contenido: "tecnologia-cotidiana",
    pregunta: "¿Cuál de estos objetos funciona con electricidad?",
    opciones: ["Lámpara", "Lápiz", "Cuaderno", "Regla"],
    correcta: 0,
  },
  {
    id: "t6",
    contenido: "herramientas",
    pregunta: "¿Para qué sirve principalmente un destornillador?",
    opciones: [
      "Para cortar papel",
      "Para ajustar o aflojar tornillos",
      "Para medir temperatura",
      "Para pintar"
    ],
    correcta: 1,
  },
  {
    id: "t7",
    contenido: "herramientas",
    pregunta: "¿Cuál de estos objetos es una herramienta?",
    opciones: ["Martillo", "Almohada", "Vaso", "Cuaderno"],
    correcta: 0,
  },
  {
    id: "t8",
    contenido: "tecnologia-cotidiana",
    pregunta: "¿Para qué sirve una impresora?",
    opciones: [
      "Para imprimir información en papel",
      "Para escuchar música",
      "Para sacar fotos",
      "Para medir objetos"
    ],
    correcta: 0,
  },
  {
    id: "t9",
    contenido: "comunicacion",
    pregunta: "¿Cuál de estos medios podemos utilizar para comunicarnos a distancia?",
    opciones: ["Teléfono", "Regla", "Martillo", "Lápiz"],
    correcta: 0,
  },
  {
    id: "t10",
    contenido: "tecnologia-cotidiana",
    pregunta: "¿Cuál de estos objetos fue creado para ayudarnos a iluminar un lugar?",
    opciones: ["Lámpara", "Mochila", "Tijera", "Cuaderno"],
    correcta: 0,
  },
  {
    id: "t11",
    contenido: "maquinas",
    pregunta: "¿Cuál de estos objetos nos permite trasladarnos sin utilizar un motor?",
    opciones: ["Bicicleta", "Televisor", "Licuadora", "Impresora"],
    correcta: 0,
  },
  {
    id: "t12",
    contenido: "materiales",
    pregunta: "¿Cuál de estos materiales se utiliza frecuentemente para fabricar botellas?",
    opciones: ["Plástico", "Algodón", "Papel", "Madera"],
    correcta: 0,
  },
  {
    id: "t13",
    contenido: "materiales",
    pregunta: "¿Cuál de estos materiales proviene de los árboles?",
    opciones: ["Papel", "Vidrio", "Plástico", "Metal"],
    correcta: 0,
  },
  {
    id: "t14",
    contenido: "tecnologia-cotidiana",
    pregunta: "¿Qué objeto usamos para medir la longitud de algo?",
    opciones: ["Regla", "Parlante", "Cámara", "Lámpara"],
    correcta: 0,
  },
  {
    id: "t15",
    contenido: "seguridad",
    pregunta: "¿Qué debemos hacer antes de tocar un aparato eléctrico que está dañado?",
    opciones: [
      "Seguir usándolo",
      "Avisar a un adulto",
      "Mojarlo",
      "Golpearlo"
    ],
    correcta: 1,
  },
  {
    id: "t16",
    contenido: "tecnologia-cotidiana",
    pregunta: "¿Cuál de estos objetos permite guardar información digital?",
    opciones: ["Pendrive", "Lápiz", "Regla", "Vaso"],
    correcta: 0,
  },
  {
    id: "t17",
    contenido: "dispositivos",
    pregunta: "¿Para qué sirve principalmente un mouse?",
    opciones: [
      "Mover y seleccionar elementos en la pantalla",
      "Imprimir hojas",
      "Escuchar música",
      "Sacar fotografías"
    ],
    correcta: 0,
  },
  {
    id: "t18",
    contenido: "tecnologia-cotidiana",
    pregunta: "¿Cuál de estos objetos permite conservar alimentos a baja temperatura?",
    opciones: ["Heladera", "Televisor", "Impresora", "Lámpara"],
    correcta: 0,
  },
  {
    id: "t19",
    contenido: "maquinas",
    pregunta: "¿Cuál de estos objetos utiliza energía para realizar una tarea?",
    opciones: ["Licuadora", "Cuaderno", "Regla", "Lápiz"],
    correcta: 0,
  },
  {
    id: "t20",
    contenido: "tecnologia",
    pregunta: "¿Qué podemos hacer cuando una tecnología nueva nos ayuda a realizar una tarea de manera más fácil?",
    opciones: [
      "Utilizarla para resolver esa tarea",
      "Romperla",
      "No aprender nunca a usarla",
      "Mojarla"
    ],
    correcta: 0,
  },
];

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

/* ============================================================
   BANCO — ARTISTICA
   ¿QUÉ TÉCNICA ES?
   ============================================================ */

const BANCO_ARTES = [
  {
    id: "a1",
    contenido: "materiales",
    pregunta: "¿Cuál de estos materiales se utiliza para pintar?",
    opciones: ["Pincel", "Regla", "Compás", "Goma"],
    correcta: 0,
  },
  {
    id: "a2",
    contenido: "materiales",
    pregunta: "¿Cuál de estos materiales sirve para dibujar?",
    opciones: ["Lápiz", "Vaso", "Cuchara", "Tenedor"],
    correcta: 0,
  },
  {
    id: "a3",
    contenido: "tecnicas",
    pregunta: "¿Qué técnica consiste en crear una imagen utilizando pequeños puntos de color?",
    opciones: [
      "Puntillismo",
      "Collage",
      "Acuarela",
      "Escultura"
    ],
    correcta: 0,
  },
  {
    id: "a4",
    contenido: "tecnicas",
    pregunta: "¿Qué técnica utiliza pequeños trozos de papel, tela u otros materiales para crear una imagen?",
    opciones: [
      "Collage",
      "Puntillismo",
      "Grabado",
      "Dibujo"
    ],
    correcta: 0,
  },
  {
    id: "a5",
    contenido: "colores",
    pregunta: "¿Cuál de estos es un color primario?",
    opciones: ["Rojo", "Verde", "Violeta", "Naranja"],
    correcta: 0,
  },
  {
    id: "a6",
    contenido: "colores",
    pregunta: "¿Cuál de estos colores se obtiene mezclando azul y amarillo?",
    opciones: ["Verde", "Rojo", "Violeta", "Rosa"],
    correcta: 0,
  },
  {
    id: "a7",
    contenido: "colores",
    pregunta: "¿Cuál de estos colores se obtiene mezclando rojo y amarillo?",
    opciones: ["Naranja", "Verde", "Azul", "Violeta"],
    correcta: 0,
  },
  {
    id: "a8",
    contenido: "colores",
    pregunta: "¿Cuál de estos colores se obtiene mezclando rojo y azul?",
    opciones: ["Violeta", "Verde", "Naranja", "Amarillo"],
    correcta: 0,
  },
  {
    id: "a9",
    contenido: "arte",
    pregunta: "¿Qué disciplina artística utiliza principalmente el cuerpo y el movimiento para expresarse?",
    opciones: ["Danza", "Pintura", "Escultura", "Fotografía"],
    correcta: 0,
  },
  {
    id: "a10",
    contenido: "arte",
    pregunta: "¿Qué disciplina artística utiliza sonidos organizados para crear obras?",
    opciones: ["Música", "Pintura", "Escultura", "Dibujo"],
    correcta: 0,
  },
  {
    id: "a11",
    contenido: "tecnicas",
    pregunta: "¿Cuál de estas técnicas utiliza pintura diluida en agua?",
    opciones: ["Acuarela", "Collage", "Grabado", "Escultura"],
    correcta: 0,
  },
  {
    id: "a12",
    contenido: "escultura",
    pregunta: "¿Cuál de estos materiales puede utilizarse para realizar una escultura?",
    opciones: ["Arcilla", "Agua", "Luz", "Sonido"],
    correcta: 0,
  },
  {
    id: "a13",
    contenido: "dibujo",
    pregunta: "¿Para qué sirve principalmente una goma de borrar?",
    opciones: [
      "Borrar marcas de lápiz",
      "Pintar con acuarela",
      "Cortar papel",
      "Mezclar colores"
    ],
    correcta: 0,
  },
  {
    id: "a14",
    contenido: "arte",
    pregunta: "¿Qué podemos utilizar para representar una idea mediante imágenes?",
    opciones: [
      "Dibujo",
      "Calculadora",
      "Regla",
      "Teclado"
    ],
    correcta: 0,
  },
  {
    id: "a15",
    contenido: "colores",
    pregunta: "¿Cuál de estos grupos contiene solamente colores primarios?",
    opciones: [
      "Rojo, azul y amarillo",
      "Verde, naranja y violeta",
      "Rosa, verde y marrón",
      "Negro, blanco y gris"
    ],
    correcta: 0,
  },
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
  CLASIFICAR JUEGOS
   ============================================================ */

const JUEGOS = [
  /* ============================================================
     MATEMÁTICA
     ============================================================ */

  {
    key: "matematica-5p",
    tipo: "trivia",
    niveles: ["5p"],
    materia: "matematica",
    titulo: "Misión Fracciones",
    descripcion:
      "Resolvé desafíos de fracciones, operaciones y comparaciones.",
    color: TOKENS.chalkYellow,
    componente: TriviaMatematica,
  },

  {
    key: "matematica-6p",
    tipo: "trivia",
    niveles: ["6p"],
    materia: "matematica",
    titulo: "Laboratorio de Porcentajes",
    descripcion:
      "Resolvé desafíos con porcentajes, decimales y proporcionalidad.",
    color: TOKENS.chalkYellow,
    componente: TriviaMatematica,
  },

  {
    key: "matematica-7p",
    tipo: "trivia",
    niveles: ["7p"],
    materia: "matematica",
    titulo: "Código Matemático",
    descripcion:
      "Superá desafíos de números, geometría y resolución de problemas.",
    color: TOKENS.chalkYellow,
    componente: TriviaMatematica,
  },


  /* ============================================================
     LENGUA
     ============================================================ */

  {
    key: "lengua-5p",
    tipo: "drag-drop",
    niveles: ["5p"],
    materia: "lengua",
    titulo: "Detectives de Palabras",
    descripcion:
      "Clasificá palabras según su categoría gramatical.",
    color: TOKENS.chalkBlue,
    componente: ArrastrarPalabras,
  },

  {
    key: "lengua-6p",
    tipo: "drag-drop",
    niveles: ["6p"],
    materia: "lengua",
    titulo: "El Caso de la Palabra Perdida",
    descripcion:
      "Reconocé categorías gramaticales y analizá palabras.",
    color: TOKENS.chalkBlue,
    componente: ArrastrarPalabras,
  },

  {
    key: "lengua-7p",
    tipo: "ordenar",
    niveles: ["7p"],
    materia: "lengua",
    titulo: "La Sala de Redacción",
    descripcion:
      "Ordená palabras y construí oraciones correctamente.",
    color: TOKENS.chalkPurple,
    componente: OrdenarOracion,
  },


  /* ============================================================
     CIENCIAS
     ============================================================ */

  {
    key: "ciencias-5p",
    tipo: "trivia",
    niveles: ["5p"],
    materia: "ciencias",
    titulo: "Laboratorio Secreto",
    descripcion:
      "Poné a prueba tus conocimientos sobre el mundo natural.",
    color: TOKENS.chalkCoral,
    componente: VerdaderoFalso,
  },

  {
    key: "ciencias-6p",
    tipo: "trivia",
    niveles: ["6p"],
    materia: "ciencias",
    titulo: "Exploradores de la Tierra",
    descripcion:
      "Descubrí fenómenos, sistemas y cambios de la naturaleza.",
    color: TOKENS.chalkCoral,
    componente: VerdaderoFalso,
  },

  {
    key: "ciencias-7p",
    tipo: "trivia",
    niveles: ["7p"],
    materia: "ciencias",
    titulo: "Misión Científica",
    descripcion:
      "Resolvé desafíos científicos usando observación y razonamiento.",
    color: TOKENS.chalkCoral,
    componente: VerdaderoFalso,
  },


  /* ============================================================
     GEOGRAFÍA
     ============================================================ */

  {
    key: "geografia-5p",
    tipo: "trivia",
    niveles: ["5p"],
    materia: "geografia",
    titulo: "Viaje por la Argentina",
    descripcion:
      "Descubrí lugares, regiones y características de nuestro país.",
    color: TOKENS.chalkBlue,
    componente: Geografia,
  },

  {
    key: "geografia-6p",
    tipo: "trivia",
    niveles: ["6p"],
    materia: "geografia",
    titulo: "Mapa del Mundo",
    descripcion:
      "Ubicá países, continentes y regiones del mundo.",
    color: TOKENS.chalkBlue,
    componente: Geografia,
  },

  {
    key: "geografia-7p",
    tipo: "trivia",
    niveles: ["7p"],
    materia: "geografia",
    titulo: "Detectives del Territorio",
    descripcion:
      "Investigá territorios, población y características geográficas.",
    color: TOKENS.chalkBlue,
    componente: Geografia,
  },


  /* ============================================================
     INGLÉS
     ============================================================ */

  {
    key: "ingles-5p",
    tipo: "memoria",
    niveles: ["5p"],
    materia: "ingles",
    titulo: "English Quest",
    descripcion:
      "Uní palabras en inglés con su significado.",
    color: TOKENS.chalkCoral,
    componente: EmparejarIngles,
  },

  {
    key: "ingles-6p",
    tipo: "memoria",
    niveles: ["6p"],
    materia: "ingles",
    titulo: "English Detective",
    descripcion:
      "Encontrá las parejas y ampliá tu vocabulario en inglés.",
    color: TOKENS.chalkCoral,
    componente: EmparejarIngles,
  },

  {
    key: "ingles-7p",
    tipo: "memoria",
    niveles: ["7p"],
    materia: "ingles",
    titulo: "English Escape",
    descripcion:
      "Superá desafíos de vocabulario y comprensión en inglés.",
    color: TOKENS.chalkCoral,
    componente: EmparejarIngles,
  },


  /* ============================================================
     MÚSICA
     ============================================================ */

  {
    key: "musica-5p",
    tipo: "trivia",
    niveles: ["5p"],
    materia: "musica",
    titulo: "Adiviná el Instrumento",
    descripcion:
      "Reconocé instrumentos a partir de sus características.",
    color: TOKENS.chalkPurple,
    componente: AdivinarInstrumento,
  },

  {
    key: "musica-6p",
    tipo: "trivia",
    niveles: ["6p"],
    materia: "musica",
    titulo: "Batalla de Bandas",
    descripcion:
      "Poné a prueba tus conocimientos sobre música e instrumentos.",
    color: TOKENS.chalkPurple,
    componente: AdivinarInstrumento,
  },

  {
    key: "musica-7p",
    tipo: "trivia",
    niveles: ["7p"],
    materia: "musica",
    titulo: "Productor Musical",
    descripcion:
      "Reconocé instrumentos, sonidos y características musicales.",
    color: TOKENS.chalkPurple,
    componente: AdivinarInstrumento,
  },


  /* ============================================================
     TECNOLOGÍA
     ============================================================ */

  {
    key: "tecnologia-5p",
    tipo: "trivia",
    niveles: ["5p"],
    materia: "tecnologia",
    titulo: "Inventores de 5.º",
    descripcion:
      "Descubrí cómo funcionan objetos y tecnologías de la vida cotidiana.",
    color: TOKENS.chalkBlue,
    componente: Tecnologia,
  },

  {
    key: "tecnologia-6p",
    tipo: "trivia",
    niveles: ["6p"],
    materia: "tecnologia",
    titulo: "Diseñá una Solución",
    descripcion:
      "Resolvé problemas usando tecnología e ingenio.",
    color: TOKENS.chalkBlue,
    componente: Tecnologia,
  },

  {
    key: "tecnologia-7p",
    tipo: "trivia",
    niveles: ["7p"],
    materia: "tecnologia",
    titulo: "Hackeá el Problema",
    descripcion:
      "Pensá soluciones y resolvé desafíos tecnológicos.",
    color: TOKENS.chalkBlue,
    componente: Tecnologia,
  },


  /* ============================================================
     ARTÍSTICA
     ============================================================ */

  {
    key: "artes-5p",
    tipo: "trivia",
    niveles: ["5p"],
    materia: "artes",
    titulo: "Código del Artista",
    descripcion:
      "Descubrí técnicas, colores y elementos del lenguaje visual.",
    color: TOKENS.chalkPurple,
    componente: Artistica,
  },

  {
    key: "artes-6p",
    tipo: "trivia",
    niveles: ["6p"],
    materia: "artes",
    titulo: "Galería Misteriosa",
    descripcion:
      "Reconocé técnicas y elementos de diferentes obras artísticas.",
    color: TOKENS.chalkPurple,
    componente: Artistica,
  },

  {
    key: "artes-7p",
    tipo: "trivia",
    niveles: ["7p"],
    materia: "artes",
    titulo: "Museo Interactivo",
    descripcion:
      "Analizá imágenes, técnicas y recursos del lenguaje visual.",
    color: TOKENS.chalkPurple,
    componente: Artistica,
  },
];

const NIVELES = [
  {
    key: "5p",
    label: "5to grado · Primaria",
    short: "5to Primaria",
  },
  {
    key: "6p",
    label: "6to grado · Primaria",
    short: "6to Primaria",
  },
  {
    key: "7p",
    label: "7mo grado · Primaria",
    short: "7mo Primaria",
  },
  {
    key: "1s",
    label: "1er año · Secundaria",
    short: "1ro Secundaria",
  },
  {
    key: "2s",
    label: "2do año · Secundaria",
    short: "2do Secundaria",
  },
  {
    key: "3s",
    label: "3er año · Secundaria",
    short: "3ro Secundaria",
  },
  {
    key: "4s",
    label: "4to año · Secundaria",
    short: "4to Secundaria",
  },
  {
    key: "5s",
    label: "5to año · Secundaria",
    short: "5to Secundaria",
  },
  {
    key: "6s",
    label: "6to año · Secundaria",
    short: "6to Secundaria",
  },
];


const MATERIAS = [
  {
    key: "matematica",
    label: "Matemática",
    icon: "➗",
    color: TOKENS.chalkYellow,
  },
  {
    key: "lengua",
    label: "Lengua",
    icon: "📚",
    color: TOKENS.chalkBlue,
  },
  {
    key: "ciencias",
    label: "Ciencias",
    icon: "🔬",
    color: TOKENS.chalkCoral,
  },
  {
    key: "geografia",
    label: "Geografía",
    icon: "🌎",
    color: TOKENS.chalkBlue,
  },
  {
    key: "ingles",
    label: "Inglés",
    icon: "🇬🇧",
    color: TOKENS.chalkCoral,
  },
  {
    key: "musica",
    label: "Música",
    icon: "🎵",
    color: TOKENS.chalkPurple,
  },
  {
    key: "tecnologia",
    label: "Tecnología",
    icon: "💻",
    color: TOKENS.chalkBlue,
  },
  {
    key: "artes",
    label: "Artística",
    icon: "🎨",
    color: TOKENS.chalkPurple,
  },
];


const TIPOS = [
  {
    key: "trivia",
    label: "Elegí la respuesta",
    icon: "💡",
    color: TOKENS.chalkYellow,
  },
  {
    key: "verdadero-falso",
    label: "Verdadero o falso",
    icon: "✓✗",
    color: TOKENS.chalkCoral,
  },
  {
    key: "drag-drop",
    label: "Arrastrar y soltar",
    icon: "✋",
    color: TOKENS.chalkBlue,
  },
  {
    key: "ordenar",
    label: "Ordenar",
    icon: "🔤",
    color: TOKENS.chalkPurple,
  },
  {
    key: "emparejar",
    label: "Emparejar",
    icon: "🔗",
    color: TOKENS.chalkBlue,
  },
  {
    key: "adivinar",
    label: "Adivinar",
    icon: "🔎",
    color: TOKENS.chalkPurple,
  },
];







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


/* ============================================================
   DETECTIVE DIGITAL — TECNOLOGÍA
   ============================================================ */

function Tecnologia({ onRegistrarRespuesta }) {
  const [preguntas] = useState(() =>
    shuffle(BANCO_TECNOLOGIA).slice(0, 5)
  );

  const [indice, setIndice] = useState(0);
  const [seleccion, setSeleccion] = useState(null);
  const [estado, setEstado] = useState("jugando");
  const [aciertos, setAciertos] = useState(0);
  const [tiempos, setTiempos] = useState([]);

  const inicioRef = useRef(Date.now());

  const pregunta = preguntas[indice];

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

    onRegistrarRespuesta({
      materia: "tecnologia",
      contenido: pregunta.contenido,
      correcto: esCorrecta,
      tiempoRespuesta: Number(
        tiempoRespuesta.toFixed(1)
      ),
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

  /* =========================
     RESULTADO FINAL
     ========================= */

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
          🕵️ ¡Misión cumplida!
        </h3>

        <p
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 16,
            color: TOKENS.chalkWhite,
            margin: 0,
          }}
        >
          Completaste todos los desafíos de tecnología.
        </p>

        <div
          style={{
            fontFamily: "Kalam",
            fontSize: 24,
            color: TOKENS.chalkYellow,
          }}
        >
          {aciertos} de {preguntas.length} correctas 🎉
        </div>

        <div
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 15,
            color: TOKENS.chalkWhite,
            opacity: 0.75,
          }}
        >
          Puntaje: {porcentaje}% · Tiempo promedio:{" "}
          {tiempoPromedio} segundos
        </div>
      </div>
    );
  }

  /* =========================
     JUEGO
     ========================= */

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
          Desafío {indice + 1} / {preguntas.length}
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
        Detective Digital
      </h3>

      {/* PREGUNTA */}

      <div
        style={{
          border: "2px dashed rgba(245,243,231,0.25)",
          borderRadius: 16,
          padding: 24,
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "Kalam",
            fontSize: 23,
            color: TOKENS.chalkWhite,
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          {pregunta.pregunta}
        </p>
      </div>

      {/* OPCIONES */}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {pregunta.opciones.map((opcion, idx) => {
          const esSeleccionada =
            seleccion === idx;

          const esCorrecta =
            pregunta.correcta === idx;

          let bg = TOKENS.chalkWhite;
          let color = TOKENS.boardDark;

          if (estado === "resultado") {
            if (esCorrecta) {
              bg = TOKENS.chalkYellow;
            } else if (esSeleccionada) {
              bg = TOKENS.chalkCoral;
            }
          }

          return (
            <button
              key={opcion}
              onClick={() => responder(idx)}
              disabled={estado !== "jugando"}
              style={{
                fontFamily: "Kalam",
                fontSize: 18,
                fontWeight: 700,
                color,
                background: bg,
                border: "none",
                borderRadius: 12,
                padding: "13px",
                cursor:
                  estado === "jugando"
                    ? "pointer"
                    : "default",
              }}
            >
              {opcion}
            </button>
          );
        })}
      </div>

      {/* RESULTADO */}

      {estado === "resultado" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            alignItems: "center",
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
              opacity: 0.75,
              textAlign: "center",
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
              padding: "12px 24px",
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
// Se sigue llamando "regionSimulada" por compatibilidad con el resto
// del archivo (así no hay que tocar cada juego que la llama), pero
// ya no simula nada: devuelve la comuna real, geolocalizada por GPS
// o elegida a mano en <SelectorComuna />.
function regionSimulada() {
  return etiquetaComuna(obtenerComunaActual());
}

/* ============================================================
   TRIVIA — MATEMÁTICA
   5.º, 6.º y 7.º GRADO
   ============================================================ */

function TriviaMatematica({ onRegistrarRespuesta, nivel }) {
  const bancoPorNivel = {
    "5p": BANCO_MATE_5,
    "6p": BANCO_MATE_6,
    "7p": BANCO_MATE_7,
  };

  const banco = bancoPorNivel[nivel] || BANCO_MATE_5;

  const [preguntas] = useState(() =>
    shuffle(banco).slice(0, 5)
  );

  const [indice, setIndice] = useState(0);
  const [tiempo, setTiempo] = useState(15);
  const [seleccion, setSeleccion] = useState(null);
  const [estado, setEstado] = useState("jugando");
  const [aciertos, setAciertos] = useState(0);

  const inicioRef = useRef(Date.now());

  const pregunta = preguntas[indice];

  const responder = useCallback(
    (opcionIdx) => {
      if (estado !== "jugando") return;

      const tiempoRespuesta = (
        (Date.now() - inicioRef.current) /
        1000
      ).toFixed(1);

      const esCorrecta =
        opcionIdx === pregunta.correcta;

      setSeleccion(opcionIdx);
      setEstado("resultado");

      if (esCorrecta) {
        setAciertos((a) => a + 1);
      }

      onRegistrarRespuesta({
        materia: "matematica",
        nivel,
        contenido: pregunta.contenido,
        correcto: esCorrecta,
        tiempoRespuesta: Number(tiempoRespuesta),
        region: regionSimulada(),
      });
    },
    [
      estado,
      pregunta,
      onRegistrarRespuesta,
      nivel,
    ]
  );

  /* ==========================================================
     TEMPORIZADOR
     ========================================================== */

  useEffect(() => {
    if (estado !== "jugando") return;

    if (tiempo <= 0) {
      responder(-1);
      return;
    }

    const t = setTimeout(
      () => setTiempo((s) => s - 1),
      1000
    );

    return () => clearTimeout(t);
  }, [tiempo, estado, responder]);


  /* ==========================================================
     PASAR A LA SIGUIENTE PREGUNTA
     ========================================================== */

  useEffect(() => {
    if (estado !== "resultado") return;

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
  }, [estado, indice, preguntas.length]);


  /* ==========================================================
     RESULTADO FINAL
     ========================================================== */

  if (estado === "fin") {
    return (
      <ResultadoFinal
        titulo="¡Trivia de Matemática completa! 🎉"
        detalle={`Acertaste ${aciertos} de ${preguntas.length} preguntas`}
        color={TOKENS.chalkYellow}
      />
    );
  }


  const pct = (tiempo / 15) * 100;


  /* ==========================================================
     JUEGO
     ========================================================== */

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >

      {/* ENCABEZADO */}

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


      {/* GRADO */}

      <div
        style={{
          fontFamily: "Kalam",
          fontSize: 15,
          color: TOKENS.chalkYellow,
          opacity: 0.8,
        }}
      >
        {nivel === "5p" && "📚 Matemática · 5.º grado"}

        {nivel === "6p" && "📚 Matemática · 6.º grado"}

        {nivel === "7p" && "📚 Matemática · 7.º grado"}
      </div>


      {/* BARRA DE TIEMPO */}

      <div
        style={{
          height: 8,
          borderRadius: 999,
          background: "rgba(245,243,231,0.15)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background:
              pct < 30
                ? TOKENS.chalkCoral
                : TOKENS.chalkYellow,
            transition:
              "width 1s linear, background 0.3s ease",
            borderRadius: 999,
          }}
        />
      </div>


      {/* PREGUNTA */}

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


      {/* OPCIONES */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {pregunta.opciones.map((op, i) => {
          const esSeleccionada =
            seleccion === i;

          const esCorrecta =
            i === pregunta.correcta;

          let bg =
            "rgba(245,243,231,0.06)";

          let border =
            "rgba(245,243,231,0.25)";

          if (estado === "resultado") {
            if (esCorrecta) {
              bg =
                "rgba(244,201,93,0.18)";

              border =
                TOKENS.chalkYellow;
            } else if (
              esSeleccionada &&
              !esCorrecta
            ) {
              bg =
                "rgba(232,115,95,0.18)";

              border =
                TOKENS.chalkCoral;
            }
          }

          return (
            <button
              key={i}
              onClick={() => responder(i)}
              disabled={
                estado !== "jugando"
              }
              style={{
                fontFamily:
                  "system-ui, sans-serif",
                fontSize: 16,
                color:
                  TOKENS.chalkWhite,
                background: bg,
                border:
                  `2px solid ${border}`,
                borderRadius: 12,
                padding: "14px 16px",
                cursor:
                  estado === "jugando"
                    ? "pointer"
                    : "default",
                textAlign: "left",
                transition:
                  "all 0.15s ease",
              }}
            >
              {op}
            </button>
          );
        })}
      </div>


      {/* RESULTADO DE LA PREGUNTA */}

      {estado === "resultado" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontFamily: "Kalam",
              fontSize: 23,
              color:
                seleccion ===
                pregunta.correcta
                  ? TOKENS.chalkYellow
                  : TOKENS.chalkCoral,
            }}
          >
            {seleccion ===
            pregunta.correcta
              ? "¡Correcto! 🎉"
              : "Casi..."}
          </div>

          <div
            style={{
              fontFamily:
                "system-ui, sans-serif",
              fontSize: 14,
              color:
                TOKENS.chalkWhite,
              opacity: 0.75,
              textAlign: "center",
            }}
          >
            La respuesta correcta es{" "}
            <strong>
              {
                pregunta.opciones[
                  pregunta.correcta
                ]
              }
            </strong>
          </div>

          <button
            onClick={() => {
              if (
                indice + 1 <
                preguntas.length
              ) {
                setIndice(
                  (i) => i + 1
                );

                setTiempo(15);
                setSeleccion(null);
                setEstado("jugando");

                inicioRef.current =
                  Date.now();
              } else {
                setEstado("fin");
              }
            }}
            style={{
              fontFamily: "Kalam",
              fontWeight: 700,
              fontSize: 19,
              color: TOKENS.boardDark,
              background:
                TOKENS.chalkYellow,
              border: "none",
              borderRadius: 12,
              padding:
                "12px 24px",
              cursor: "pointer",
            }}
          >
            {indice + 1 ===
            preguntas.length
              ? "Ver estadísticas →"
              : "Siguiente →"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ARRASTRAR PALABRAS — LENGUA
   ============================================================ */

function ArrastrarPalabras({ onRegistrarRespuesta, nivel }) {

  const banco5 = [
    { id: "5l1", palabra: "escuela", categoria: "sustantivo" },
    { id: "5l2", palabra: "aventura", categoria: "sustantivo" },
    { id: "5l3", palabra: "correr", categoria: "verbo" },
    { id: "5l4", palabra: "imaginar", categoria: "verbo" },
    { id: "5l5", palabra: "enorme", categoria: "adjetivo" },
    { id: "5l6", palabra: "pequeño", categoria: "adjetivo" },
    { id: "5l7", palabra: "biblioteca", categoria: "sustantivo" },
    { id: "5l8", palabra: "saltar", categoria: "verbo" },
    { id: "5l9", palabra: "brillante", categoria: "adjetivo" },
    { id: "5l10", palabra: "amistad", categoria: "sustantivo" },
    { id: "5l11", palabra: "dibujar", categoria: "verbo" },
    { id: "5l12", palabra: "misterioso", categoria: "adjetivo" },
  ];

  const banco6 = [
    { id: "6l1", palabra: "investigación", categoria: "sustantivo" },
    { id: "6l2", palabra: "descubrimiento", categoria: "sustantivo" },
    { id: "6l3", palabra: "analizar", categoria: "verbo" },
    { id: "6l4", palabra: "descubrieron", categoria: "verbo" },
    { id: "6l5", palabra: "extraordinario", categoria: "adjetivo" },
    { id: "6l6", palabra: "misterioso", categoria: "adjetivo" },
    { id: "6l7", palabra: "conocimiento", categoria: "sustantivo" },
    { id: "6l8", palabra: "observar", categoria: "verbo" },
    { id: "6l9", palabra: "importante", categoria: "adjetivo" },
    { id: "6l10", palabra: "experimento", categoria: "sustantivo" },
    { id: "6l11", palabra: "comparar", categoria: "verbo" },
    { id: "6l12", palabra: "complejo", categoria: "adjetivo" },
  ];

  const banco = nivel === "6p" ? banco6 : banco5;

  const [palabras] = useState(() =>
    shuffle(banco).slice(0, 6)
  );

  const [pendientes, setPendientes] = useState(() =>
    palabras.map((p) => p.id)
  );

  const [clasificadas, setClasificadas] = useState({});
  const [arrastrando, setArrastrando] = useState(null);
  const [hoverZona, setHoverZona] = useState(null);

  const inicioPalabraRef = useRef(Date.now());

  const soltar = (categoriaDestino) => {
    if (!arrastrando) return;

    const palabra = palabras.find(
      (p) => p.id === arrastrando
    );

    if (!palabra) return;

    const esCorrecta =
      palabra.categoria === categoriaDestino;

    const tiempoRespuesta =
      (Date.now() - inicioPalabraRef.current) / 1000;

    setClasificadas((prev) => ({
      ...prev,
      [palabra.id]: {
        categoria: categoriaDestino,
        correcto: esCorrecta,
      },
    }));

    setPendientes((prev) =>
      prev.filter((id) => id !== palabra.id)
    );

    setArrastrando(null);
    setHoverZona(null);

    inicioPalabraRef.current = Date.now();

    onRegistrarRespuesta({
      materia: "lengua",
      contenido: `clasificacion-${palabra.categoria}`,
      correcto: esCorrecta,
      tiempoRespuesta: Number(tiempoRespuesta.toFixed(1)),
      region: regionSimulada(),
    });
  };

  const aciertos = Object.values(clasificadas)
    .filter((c) => c.correcto)
    .length;

  const intentadas =
    palabras.length - pendientes.length;

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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >

      <div>
        <span
          style={{
            fontFamily: "Kalam",
            fontSize: 18,
            color: TOKENS.chalkWhite,
            opacity: 0.75,
          }}
        >
          Arrastrá cada palabra a su categoría ·{" "}
          {aciertos} ✓ de {intentadas} intentadas
        </span>
      </div>

      {/* PALABRAS */}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          minHeight: 56,
        }}
      >
        {pendientes.map((id) => {

          const palabra = palabras.find(
            (p) => p.id === id
          );

          if (!palabra) return null;

          return (
            <div
              key={id}
              draggable
              onDragStart={() => {
                setArrastrando(id);
              }}
              onDragEnd={() => {
                setArrastrando(null);
                setHoverZona(null);
              }}
              style={{
                fontFamily: "Kalam",
                fontSize: 20,
                fontWeight: 700,
                color: TOKENS.boardDark,
                background: TOKENS.chalkWhite,
                padding: "10px 20px",
                borderRadius: 10,
                cursor: "grab",
                boxShadow:
                  "0 2px 0 rgba(0,0,0,0.25)",
                userSelect: "none",
                opacity:
                  arrastrando === id ? 0.4 : 1,
                transform:
                  arrastrando === id
                    ? "scale(0.95)"
                    : "scale(1)",
              }}
            >
              {palabra.palabra}
            </div>
          );
        })}
      </div>

      {/* CATEGORÍAS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr 1fr",
          gap: 14,
        }}
      >

        {CATEGORIAS.map((cat) => (

          <div
            key={cat.key}

            onDragOver={(e) => {
              e.preventDefault();
              setHoverZona(cat.key);
            }}

            onDragLeave={() => {
              setHoverZona((z) =>
                z === cat.key ? null : z
              );
            }}

            onDrop={(e) => {
              e.preventDefault();
              soltar(cat.key);
            }}

            style={{
              border:
                `2px dashed ${cat.color}`,
              borderRadius: 14,
              padding: "20px 12px",
              textAlign: "center",

              background:
                hoverZona === cat.key
                  ? `${cat.color}22`
                  : "transparent",

              minHeight: 90,

              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 8,
            }}
          >

            <span
              style={{
                fontFamily: "Kalam",
                fontWeight: 700,
                fontSize: 18,
                color: cat.color,
              }}
            >
              {cat.label}
            </span>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                justifyContent: "center",
              }}
            >

              {Object.entries(clasificadas)
                .filter(
                  ([, v]) =>
                    v.categoria === cat.key
                )
                .map(([id, v]) => {

                  const palabra =
                    palabras.find(
                      (p) => p.id === id
                    );

                  if (!palabra) return null;

                  return (
                    <span
                      key={id}
                      style={{
                        fontFamily:
                          "system-ui, sans-serif",
                        fontSize: 13,
                        padding: "3px 9px",
                        borderRadius: 999,

                        background:
                          v.correcto
                            ? "rgba(244,201,93,0.25)"
                            : "rgba(232,115,95,0.25)",

                        color:
                          TOKENS.chalkWhite,
                      }}
                    >
                      {palabra.palabra}{" "}
                      {v.correcto ? "✓" : "✗"}
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
   ARTISTICA — ¿QUÉ TÉCNICA ES?
   ============================================================ */

function Artistica({ onRegistrarRespuesta }) {
  const [preguntas] = useState(() =>
    shuffle(BANCO_ARTES).slice(0, 5)
  );

  const [indice, setIndice] = useState(0);
  const [seleccion, setSeleccion] = useState(null);
  const [estado, setEstado] = useState("jugando");
  const [aciertos, setAciertos] = useState(0);
  const [tiempos, setTiempos] = useState([]);

  const inicioRef = useRef(Date.now());

  const pregunta = preguntas[indice];

  /* =========================
     RESPONDER
     ========================= */

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

    onRegistrarRespuesta({
      materia: "artes_visuales",
      contenido: pregunta.contenido,
      correcto: esCorrecta,
      tiempoRespuesta: Number(
        tiempoRespuesta.toFixed(1)
      ),
      region: regionSimulada(),
    });
  };

  /* =========================
     SIGUIENTE
     ========================= */

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

  /* =========================
     FINAL
     ========================= */

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
            color: TOKENS.chalkPurple,
            margin: 0,
          }}
        >
          🎨 ¡Artista terminado!
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

        <div
          style={{
            fontFamily: "Kalam",
            fontSize: 25,
            color: TOKENS.chalkYellow,
          }}
        >
          {aciertos} / {preguntas.length} correctas 🎉
        </div>

        <div
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 15,
            color: TOKENS.chalkWhite,
            opacity: 0.75,
          }}
        >
          Puntaje: {porcentaje}% · Tiempo promedio:{" "}
          {tiempoPromedio} segundos
        </div>
      </div>
    );
  }

  /* =========================
     JUEGO
     ========================= */

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
          fontSize: 28,
          color: TOKENS.chalkWhite,
          margin: 0,
          textAlign: "center",
        }}
      >
        ¿Qué técnica es?
      </h3>

      {/* PREGUNTA */}

      <div
        style={{
          border: "2px dashed rgba(245,243,231,0.25)",
          borderRadius: 16,
          padding: 24,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 50,
            marginBottom: 12,
          }}
        >
        </div>

        <p
          style={{
            fontFamily: "Kalam",
            fontSize: 22,
            color: TOKENS.chalkWhite,
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          {pregunta.pregunta}
        </p>
      </div>

      {/* OPCIONES */}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {pregunta.opciones.map((opcion, idx) => {
          const esSeleccionada =
            seleccion === idx;

          const esCorrecta =
            pregunta.correcta === idx;

          let bg = TOKENS.chalkWhite;
          let color = TOKENS.boardDark;

          if (estado === "resultado") {
            if (esCorrecta) {
              bg = TOKENS.chalkYellow;
            } else if (esSeleccionada) {
              bg = TOKENS.chalkCoral;
            }
          }

          return (
            <button
              key={opcion}
              onClick={() => responder(idx)}
              disabled={estado !== "jugando"}
              style={{
                fontFamily: "Kalam",
                fontSize: 18,
                fontWeight: 700,
                color,
                background: bg,
                border: "none",
                borderRadius: 12,
                padding: "13px",
                cursor:
                  estado === "jugando"
                    ? "pointer"
                    : "default",
              }}
            >
              {opcion}
            </button>
          );
        })}
      </div>

      {/* RESULTADO */}

      {estado === "resultado" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            alignItems: "center",
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
              opacity: 0.75,
              textAlign: "center",
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
              padding: "12px 24px",
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
   TODOS LOS JUEGOS — menú directo, agrupado por materia, para
   elegir cualquier juego de un tirón sin pasar por el asistente
   de 4 pasos (tipo → nivel → materia → juego).
   ============================================================ */
function TodosLosJuegos({ onElegir }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      {MATERIAS.map((m) => {
        const juegosDeMateria = JUEGOS.filter((j) => j.materia === m.key);
        if (juegosDeMateria.length === 0) return null;

        return (
          <div key={m.key}>
            <h3
              style={{
                fontFamily: "Kalam",
                color: m.color,
                marginBottom: 12,
              }}
            >
              {m.icon} {m.label}
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                gap: 14,
              }}
            >
              {juegosDeMateria.map((j) => (
                <button
                  key={j.key}
                  onClick={() => onElegir(j)}
                  style={{
                    textAlign: "left",
                    fontFamily: "system-ui, sans-serif",
                    padding: 18,
                    borderRadius: 14,
                    border: `2px solid ${j.color}`,
                    background: `${j.color}12`,
                    color: TOKENS.chalkWhite,
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontFamily: "Kalam", fontSize: 12, color: j.color }}>
                      {TIPOS.find((t) => t.key === j.tipo)?.label}
                    </span>
                    <span
                      style={{
                        fontFamily: "Kalam",
                        fontSize: 12,
                        color: TOKENS.chalkWhite,
                        opacity: 0.6,
                      }}
                    >
                      · {NIVELES.find((n) => n.key === j.niveles[0])?.short}
                    </span>
                  </div>

                  <strong
                    style={{
                      display: "block",
                      fontFamily: "Kalam",
                      fontSize: 20,
                      marginBottom: 5,
                    }}
                  >
                    {j.titulo}
                  </strong>

                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      opacity: 0.7,
                      lineHeight: 1.4,
                    }}
                  >
                    {j.descripcion}
                  </p>

                  <div
                    style={{
                      marginTop: 14,
                      fontFamily: "Kalam",
                      fontWeight: 700,
                      color: j.color,
                    }}
                  >
                    Jugar →
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   SELECTOR DE COMUNA — geolocaliza al alumno por GPS y lo mapea
   a su comuna (CABA); si falla, está fuera de CABA, o el resultado
   está mal, permite elegirla a mano. No se guarda la posición
   exacta en ningún lado, solo la comuna resultante.
   ============================================================ */
function SelectorComuna() {
  const [comuna, setComuna] = useState(() => obtenerComunaActual());
  const [estado, setEstado] = useState("inicial"); // inicial | buscando | ok | error
  const [editando, setEditando] = useState(false);

  // Mantiene sincronizada la comuna "actual" que leen los juegos
  // (regionSimulada) con lo que se ve en pantalla.
  useEffect(() => {
    fijarComunaActual(comuna);
  }, [comuna]);

  const detectar = useCallback(() => {
    setEstado("buscando");
    detectarComunaPorGPS()
      .then((numero) => {
        setComuna(numero);
        setEstado("ok");
        setEditando(false);
      })
      .catch(() => {
        setEstado("error");
        setEditando(true);
      });
  }, []);

  // Intenta detectar automáticamente apenas se abre la app.
  useEffect(() => {
    detectar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const botonEstilo = {
    fontFamily: "system-ui, sans-serif",
    fontSize: 12,
    fontWeight: 600,
    padding: "6px 12px",
    borderRadius: 999,
    border: "1px solid rgba(245,243,231,0.3)",
    background: "rgba(245,243,231,0.06)",
    color: TOKENS.chalkWhite,
    cursor: "pointer",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        marginBottom: 20,
      }}
    >
      {!editando ? (
        <button onClick={() => setEditando(true)} style={botonEstilo}>
          📍{" "}
          {estado === "buscando"
            ? "Detectando tu comuna…"
            : comuna
            ? `${etiquetaComuna(comuna)} · cambiar`
            : "No se detectó tu comuna · elegir"}
        </button>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <select
              value={comuna || ""}
              onChange={(e) => {
                const valor = e.target.value ? Number(e.target.value) : null;
                setComuna(valor);
                setEstado(valor ? "ok" : "error");
              }}
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 13,
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid rgba(245,243,231,0.3)",
                background: TOKENS.boardDark,
                color: TOKENS.chalkWhite,
              }}
            >
              <option value="">Elegí tu comuna…</option>
              {COMUNAS.map((n) => (
                <option key={n} value={n}>
                  {etiquetaComuna(n)}
                </option>
              ))}
            </select>

            <button onClick={detectar} style={botonEstilo}>
              📍 Detectar de nuevo
            </button>

            <button
              onClick={() => setEditando(false)}
              disabled={!comuna}
              style={{ ...botonEstilo, opacity: comuna ? 1 : 0.4, cursor: comuna ? "pointer" : "default" }}
            >
              Listo ✓
            </button>
          </div>

          {estado === "error" && (
            <p
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 11,
                color: TOKENS.chalkWhite,
                opacity: 0.5,
                margin: 0,
                textAlign: "center",
              }}
            >
              No pudimos detectar tu comuna automáticamente. Elegila de la lista.
            </p>
          )}
        </>
      )}
    </div>
  );
}

/* ============================================================
   APP — NAVEGACIÓN TIPO → NIVEL → MATERIA → JUEGO
   ============================================================ */

export default function App() {
  const [tipo, setTipo] = useState(null);
  const [nivel, setNivel] = useState(null);
  const [materia, setMateria] = useState(null);
  const [juego, setJuego] = useState(null);

  // "pasos" = asistente tipo → nivel → materia → juego.
  // "todos" = menú directo con los 24 juegos agrupados por materia.
  const [modoSeleccion, setModoSeleccion] = useState("pasos");

  const [registros, setRegistros] = useState([]);
  const [errorGuardado, setErrorGuardado] = useState(false);

  // Registrar una respuesta: guarda el nivel elegido, actualiza el
  // contador local (feedback inmediato) y persiste en Firestore, en
  // la colección "respuestas". No se guarda ningún dato que
  // identifique al alumno: solo materia, contenido, resultado,
  // tiempo de respuesta, región y nivel.
  const registrar = useCallback(
    (r) => {
      setRegistros((prev) => [
        ...prev,
        {
          ...r,
          nivel,
          ts: Date.now(),
        },
      ]);

      (async () => {
        try {
          await addDoc(collection(db, "respuestas"), {
            materia: r.materia,
            contenido: r.contenido,
            correcto: r.correcto,
            tiempoRespuesta: r.tiempoRespuesta,
            region: r.region,
            nivel,
            creadoEn: serverTimestamp(),
          });
        } catch (e) {
          console.error("No se pudo guardar en Firestore:", e);
          setErrorGuardado(true);
        }
      })();
    },
    [nivel]
  );

  // ------------------------------------------------------------
  // FILTROS
  // ------------------------------------------------------------

  // 1. Tipos que realmente tienen juegos
  const tiposDisponibles = TIPOS.filter((t) =>
    JUEGOS.some((j) => j.tipo === t.key)
  );

  // 2. Niveles disponibles para el tipo elegido
  const nivelesDisponibles = tipo ? NIVELES : [];

  // 3. Materias disponibles para tipo + nivel
  const materiasDisponibles = nivel
    ? MATERIAS.filter((m) =>
        JUEGOS.some(
          (j) =>
            j.tipo === tipo &&
            j.niveles.includes(nivel) &&
            j.materia === m.key
        )
      )
    : [];

  // 4. Juegos disponibles para tipo + nivel + materia
  const juegosDisponibles = materia
    ? JUEGOS.filter(
        (j) =>
          j.tipo === tipo &&
          j.niveles.includes(nivel) &&
          j.materia === materia
      )
    : [];

  // Juego seleccionado
  const juegoSeleccionado = juego
    ? JUEGOS.find((j) => j.key === juego)
    : null;

  // Componente React correspondiente al juego
  const Component = juegoSeleccionado?.componente;

  // ------------------------------------------------------------
  // NAVEGACIÓN
  // ------------------------------------------------------------

  const elegirTipo = (key) => {
    setTipo(key);
    setNivel(null);
    setMateria(null);
    setJuego(null);
  };

  const elegirNivel = (key) => {
    setNivel(key);
    setMateria(null);
    setJuego(null);
  };

  const elegirMateria = (key) => {
    setMateria(key);
    setJuego(null);
  };

  const elegirJuego = (key) => {
    setJuego(key);
  };

  // Elegir un juego directo desde el menú "todos los juegos":
  // fija tipo, nivel y materia en un solo paso.
  const elegirJuegoDirecto = (j) => {
    setTipo(j.tipo);
    setNivel(j.niveles[0]);
    setMateria(j.materia);
    setJuego(j.key);
  };

  const volverFiltros = () => {
    setJuego(null);
  };

  // ------------------------------------------------------------
  // INTERFAZ
  // ------------------------------------------------------------

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(
          180deg,
          ${TOKENS.board} 0%,
          ${TOKENS.boardDark} 100%
        )`,
        padding: "32px 16px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <style>{FONT_IMPORT}</style>

      <div
        style={{
          width: "100%",
          maxWidth: 900,
        }}
      >
        {/* =====================================================
            ENCABEZADO
            ===================================================== */}

        <header
          style={{
            textAlign: "center",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              fontFamily: "Kalam",
              color: TOKENS.chalkYellow,
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            ✦ PUMM · JIA ✦
          </div>

          <h1
            style={{
              fontFamily: "Kalam",
              fontWeight: 700,
              fontSize: 36,
              color: TOKENS.chalkWhite,
              margin: "4px 0",
            }}
          >
            Juegos Didácticos
          </h1>

          <p
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: 14,
              color: TOKENS.chalkWhite,
              opacity: 0.65,
              margin: 0,
            }}
          >
            Elegí cómo querés jugar y encontrá la actividad para practicar.
          </p>
        </header>

        <SelectorComuna />

        {/* =====================================================
            SELECCIÓN DE JUEGO
            ===================================================== */}

        {!juegoSeleccionado ? (
          <section
            style={{
              background: "rgba(0,0,0,0.15)",
              border: "1px solid rgba(245,243,231,0.12)",
              borderRadius: 20,
              padding: 28,
              boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
            }}
          >
            {/* Introducción */}

            <div
              style={{
                textAlign: "center",
                marginBottom: 30,
              }}
            >

              <h2
                style={{
                  fontFamily: "Kalam",
                  color: TOKENS.chalkWhite,
                  fontSize: 28,
                  margin: "8px 0 4px",
                }}
              >
                Elegí tu juego
              </h2>

              <p
                style={{
                  fontFamily: "system-ui, sans-serif",
                  color: TOKENS.chalkWhite,
                  opacity: 0.65,
                  margin: 0,
                }}
              >
                {modoSeleccion === "pasos"
                  ? "Primero el tipo, después el nivel, la materia y finalmente el juego."
                  : "Mirá los 24 juegos agrupados por materia y elegí directamente el que quieras jugar."}
              </p>
            </div>

            {/* =================================================
                SELECTOR DE MODO
                ================================================= */}

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 8,
                marginBottom: 26,
              }}
            >
              {[
                { key: "pasos", label: "Por pasos" },
                { key: "todos", label: "Ver todos los juegos" },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setModoSeleccion(m.key)}
                  style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    padding: "8px 16px",
                    borderRadius: 999,
                    border: `2px solid ${
                      modoSeleccion === m.key ? TOKENS.chalkYellow : "rgba(245,243,231,0.2)"
                    }`,
                    background:
                      modoSeleccion === m.key ? "rgba(244,201,93,0.15)" : "transparent",
                    color: modoSeleccion === m.key ? TOKENS.chalkYellow : TOKENS.chalkWhite,
                    cursor: "pointer",
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {modoSeleccion === "todos" ? (
              <TodosLosJuegos onElegir={elegirJuegoDirecto} />
            ) : (
              <>

            {/* =================================================
                PASO 1 — TIPO
                ================================================= */}

            <div style={{ marginBottom: 26 }}>
              <h3
                style={{
                  fontFamily: "Kalam",
                  color: TOKENS.chalkYellow,
                  marginBottom: 12,
                }}
              >
                1. Tipo de juego
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: 10,
                }}
              >
                {tiposDisponibles.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => elegirTipo(t.key)}
                    style={{
                      fontFamily: "Kalam",
                      fontSize: 17,
                      fontWeight: 700,
                      padding: "14px 10px",
                      borderRadius: 12,
                      border: `2px solid ${
                        tipo === t.key
                          ? t.color
                          : "rgba(245,243,231,0.18)"
                      }`,
                      background:
                        tipo === t.key
                          ? `${t.color}22`
                          : "transparent",
                      color:
                        tipo === t.key
                          ? t.color
                          : TOKENS.chalkWhite,
                      cursor: "pointer",
                    }}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* =================================================
                PASO 2 — NIVEL
                ================================================= */}

            {tipo && (
              <div style={{ marginBottom: 26 }}>
                <h3
                  style={{
                    fontFamily: "Kalam",
                    color: TOKENS.chalkYellow,
                    marginBottom: 12,
                  }}
                >
                  2. Nivel
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 10,
                  }}
                >
                  {nivelesDisponibles.map((n) => (
                    <button
                      key={n.key}
                      onClick={() => elegirNivel(n.key)}
                      style={{
                        fontFamily: "Kalam",
                        fontSize: 16,
                        padding: "12px 10px",
                        borderRadius: 12,
                        border: `2px solid ${
                          nivel === n.key
                            ? TOKENS.chalkWhite
                            : "rgba(245,243,231,0.18)"
                        }`,
                        background:
                          nivel === n.key
                            ? "rgba(245,243,231,0.12)"
                            : "transparent",
                        color: TOKENS.chalkWhite,
                        cursor: "pointer",
                      }}
                    >
                      {n.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* =================================================
                PASO 3 — MATERIA
                ================================================= */}

            {nivel && (
              <div style={{ marginBottom: 26 }}>
                <h3
                  style={{
                    fontFamily: "Kalam",
                    color: TOKENS.chalkYellow,
                    marginBottom: 12,
                  }}
                >
                  3. Materia
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: 10,
                  }}
                >
                  {materiasDisponibles.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => elegirMateria(m.key)}
                      style={{
                        fontFamily: "Kalam",
                        fontSize: 17,
                        fontWeight: 700,
                        padding: "14px 10px",
                        borderRadius: 12,
                        border: `2px solid ${
                          materia === m.key
                            ? m.color
                            : "rgba(245,243,231,0.18)"
                        }`,
                        background:
                          materia === m.key
                            ? `${m.color}22`
                            : "transparent",
                        color:
                          materia === m.key
                            ? m.color
                            : TOKENS.chalkWhite,
                        cursor: "pointer",
                      }}
                    >
                      {m.icon} {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* =================================================
                PASO 4 — JUEGOS
                ================================================= */}

            {materia && (
              <div>
                <h3
                  style={{
                    fontFamily: "Kalam",
                    color: TOKENS.chalkYellow,
                    marginBottom: 12,
                  }}
                >
                  4. Juegos disponibles
                </h3>

                {juegosDisponibles.length > 0 ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(230px, 1fr))",
                      gap: 14,
                    }}
                  >
                    {juegosDisponibles.map((j) => (
                      <button
                        key={j.key}
                        onClick={() => elegirJuego(j.key)}
                        style={{
                          textAlign: "left",
                          fontFamily: "system-ui, sans-serif",
                          padding: 18,
                          borderRadius: 14,
                          border: `2px solid ${j.color}`,
                          background: `${j.color}12`,
                          color: TOKENS.chalkWhite,
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "Kalam",
                            fontSize: 13,
                            color: j.color,
                            marginBottom: 5,
                          }}
                        >
                          {
                            TIPOS.find(
                              (t) => t.key === j.tipo
                            )?.label
                          }
                        </div>

                        <strong
                          style={{
                            display: "block",
                            fontFamily: "Kalam",
                            fontSize: 22,
                            marginBottom: 5,
                          }}
                        >
                          {j.titulo}
                        </strong>

                        <p
                          style={{
                            margin: 0,
                            fontSize: 13,
                            opacity: 0.7,
                            lineHeight: 1.4,
                          }}
                        >
                          {j.descripcion}
                        </p>

                        <div
                          style={{
                            marginTop: 14,
                            fontFamily: "Kalam",
                            fontWeight: 700,
                            color: j.color,
                          }}
                        >
                          Jugar →
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p
                    style={{
                      color: TOKENS.chalkWhite,
                      opacity: 0.65,
                      textAlign: "center",
                      fontFamily: "system-ui, sans-serif",
                    }}
                  >
                    Todavía no hay juegos para esta combinación.
                  </p>
                )}
              </div>
            )}
              </>
            )}
          </section>
        ) : (
          /* =====================================================
             JUEGO SELECCIONADO
             ===================================================== */

          <section
            style={{
              background: "rgba(0,0,0,0.15)",
              border: "1px solid rgba(245,243,231,0.12)",
              borderRadius: 20,
              padding: 28,
              boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
            }}
          >
            <button
              onClick={volverFiltros}
              style={{
                background: "transparent",
                border: "none",
                color: TOKENS.chalkWhite,
                fontFamily: "Kalam",
                fontSize: 17,
                cursor: "pointer",
                marginBottom: 15,
              }}
            >
              ← Cambiar juego
            </button>

            {/* Camino de selección */}

            <div
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 12,
                color: TOKENS.chalkWhite,
                opacity: 0.55,
                marginBottom: 15,
              }}
            >
              {
                TIPOS.find(
                  (t) => t.key === juegoSeleccionado.tipo
                )?.label
              }
              {" › "}
              {
                NIVELES.find(
                  (n) => n.key === nivel
                )?.short
              }
              {" › "}
              {
                MATERIAS.find(
                  (m) => m.key === materia
                )?.label
              }
            </div>

            {/* Título */}

            <div style={{ marginBottom: 22 }}>
              <h2
                style={{
                  fontFamily: "Kalam",
                  fontSize: 30,
                  color: juegoSeleccionado.color,
                  margin: "0 0 5px",
                }}
              >
                {juegoSeleccionado.titulo}
              </h2>

              <p
                style={{
                  fontFamily: "system-ui, sans-serif",
                  color: TOKENS.chalkWhite,
                  opacity: 0.7,
                  margin: 0,
                }}
              >
                {juegoSeleccionado.descripcion}
              </p>
            </div>

            {/* =================================================
                COMPONENTE DEL JUEGO
                ================================================= */}

            <div key={juegoSeleccionado.key}>
            {Component ? (
              <Component
                nivel={nivel}
                onRegistrarRespuesta={registrar}
              />
            ) : (
                <p
                  style={{
                    color: TOKENS.chalkCoral,
                    fontFamily: "Kalam",
                    textAlign: "center",
                  }}
                >
                  No se encontró el componente de este juego.
                </p>
              )}
            </div>
          </section>
        )}

        {/* =====================================================
            DATOS DE SESIÓN
            ===================================================== */}

        {registros.length > 0 && (
          <div
            style={{
              marginTop: 18,
              fontFamily: "system-ui, sans-serif",
              fontSize: 12,
              color: TOKENS.chalkWhite,
              opacity: 0.45,
              textAlign: "center",
            }}
          >
            {registros.length} respuesta
            {registros.length !== 1 ? "s" : ""} registrada
            {registros.length !== 1 ? "s" : ""} en esta sesión
          </div>
        )}

        {errorGuardado && (
          <div
            style={{
              marginTop: 12,
              fontFamily: "system-ui, sans-serif",
              fontSize: 12,
              color: TOKENS.chalkCoral,
              textAlign: "center",
            }}
          >
            No se pudo conectar con la base de datos. Revisá el archivo .env y la conexión a internet.
          </div>
        )}
      </div>
    </div>
  );
}