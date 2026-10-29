/* Mi Escuela · datos y textos
   Contenido de ejemplo de la app (no hay backend) y todo lo que se lee en voz alta.
   Lo usan index.html y herramientas/generar_audios.py (por medio de listar_frases.mjs),
   así la lista de audios grabados siempre coincide con lo que la app dice. */

/* ===== Datos de ejemplo ===== */
const HOY = new Date(2026, 9, 28); // fecha fija para que las capturas salgan siempre iguales

const MATERIAS = {
  esp: {nombre:"Español",           ico:"libro",   fondo:"#E1EEFF"},
  mat: {nombre:"Matemáticas",       ico:"numeros", fondo:"#FDE8E6"},
  cie: {nombre:"Ciencias",          ico:"planta",  fondo:"#E3F5EA"},
  soc: {nombre:"Estudios Sociales", ico:"mundo",   fondo:"#E1EEFF"},
  ing: {nombre:"Inglés",            ico:"ingles",  fondo:"#FDE8E6"},
  efi: {nombre:"Educación Física",  ico:"bola",    fondo:"#EEF1F5"},
  mus: {nombre:"Música",            ico:"musica",  fondo:"#F3E6F8"}
};

const TAREAS = [
  {id:1, m:"mat", titulo:"Contar y colorear del 1 al 20", entrega:"2026-10-29",
   detalle:"Contá los dibujos de la hoja y pintá cada número con un color diferente.", materiales:[["🖍️","Crayolas"],["📄","Hoja de la maestra"]]},
  {id:2, m:"esp", titulo:"Practicar las vocales", entrega:"2026-10-30",
   detalle:"Escribí cada vocal tres veces en tu cuaderno: a, e, i, o, u.", materiales:[["📓","Cuaderno"],["✏️","Lápiz"]]},
  {id:3, m:"cie", titulo:"Traer una hoja de árbol", entrega:"2026-11-04",
   detalle:"Buscá una hoja de árbol con un adulto y traela a la escuela.", materiales:[["🍃","Hoja de árbol"],["🛍️","Bolsita"]]},
  {id:4, m:"soc", titulo:"Dibujar a mi familia", entrega:"2026-10-26",
   detalle:"Dibujá a las personas que viven con vos y pintalas.", materiales:[["🖍️","Crayolas"],["📄","Hoja blanca"]]},
  {id:5, m:"ing", titulo:"Aprender los colores en inglés", entrega:"2026-11-02",
   detalle:"Repetí con un adulto: red, blue, yellow, green.",
   detalleVoz:"Repetí con un adulto los colores en inglés:|[en]Red. Blue. Yellow. Green.", materiales:[["🎨","Colores"]]},
  {id:6, m:"mus", titulo:"Cantar el Himno Nacional", entrega:"2026-10-23", hechaInicial:true,
   detalle:"Practicá el Himno Nacional en casa.", materiales:[["🎵","Tu voz"]]},
  {id:7, m:"mat", titulo:"Recortar un círculo y un cuadrado", entrega:"2026-10-21", hechaInicial:true,
   detalle:"Con ayuda de un adulto, recortá un círculo y un cuadrado de papel.", materiales:[["✂️","Tijeras"],["📄","Papel de color"]]}
];

// Notas del período actual, de 0 a 100 como en la escuela (en primaria se aprueba con 65).
const NOTAS = {esp:91, mat:67, cie:89, soc:74, ing:86, efi:97, mus:90};
const NOTA_MINIMA = 65;

const DOCENTES = [
  {id:"ana",   nombre:"Niña Ana",      rol:"Maestra guía",     cara:"maestra", pelo:"#4A2C1D"},
  {id:"jorge", nombre:"Teacher Jorge", rol:"Inglés",           cara:"maestro", pelo:"#2B2B2B"},
  {id:"laura", nombre:"Profe Laura",   rol:"Educación Física", cara:"profe",   pelo:"#B5532E"}
];

const FRASES = [
  {emo:"❓", texto:"No entendí la tarea."},
  {emo:"🤒", texto:"Hoy estoy enferma y no puedo ir."},
  {emo:"📓", texto:"Se me olvidó el cuaderno."},
  {emo:"❤️", texto:"¡Muchas gracias!"}
];

const MENSAJES_INICIALES = [
  {id:"m1", doc:"ana",   texto:"¡Hola! El viernes vamos al Museo de los Niños. Traé el permiso firmado.", fecha:"2026-10-27T15:10", nuevo:true},
  {id:"m2", doc:"jorge", texto:"Sofía, you sang the colors song very well. Keep it up!", lang:"en", fecha:"2026-10-24T11:30", nuevo:false}
];

const PASOS_AYUDA = [
  {ic:"mochila",  titulo:"¡Bienvenida a Mi Escuela!", texto:"Aquí ves todo lo de tu escuela."},
  {ic:"cuaderno", titulo:"Tus tareas",                 texto:"Tocá el cuaderno para ver tus tareas. Cuando termines una, tocá el círculo."},
  {ic:"estrella", titulo:"Tus notas",                  texto:"Tocá la estrella para ver tus notas de cada materia."},
  {ic:"carta",    titulo:"Hablar con tu maestra",      texto:"Tocá la carta, elegí a tu maestra y hablale al micrófono rojo."},
  {ic:"parlante", titulo:"Yo te leo todo",             texto:"Si no sabés leer algo, tocá el parlante azul y yo te lo leo."}
];


/* ===== Ayudantes que usan los textos ===== */
const dias = iso => Math.round((new Date(iso+"T12:00") - new Date(HOY.getFullYear(),HOY.getMonth(),HOY.getDate(),12)) / 864e5);
const docenteDe = id => DOCENTES.find(d=>d.id===id);
function cuando(t){
  const d = dias(t.entrega);
  if (d < 0) return `Ya pasó el día de entrega`;
  if (d === 0) return "Se entrega hoy";
  if (d === 1) return "Se entrega mañana";
  return `Se entrega en ${d} días`;
}
// Cada nota lleva un mensaje de ánimo según su rango; al niño nunca se le dice "reprobado".
const nivel = n => n >= 90 ? 3 : n >= 70 ? 2 : 1;
const ANIMO = {3:"¡Excelente!", 2:"¡Muy bien!", 1:"¡Vamos a practicar!"};
const promedio = () => Math.round(Object.values(NOTAS).reduce((a,n)=>a+n, 0) / Object.keys(NOTAS).length);

/* ===== Todo lo que la app dice en voz alta =====
   Está en un solo lugar para que la lista de audios grabados salga de aquí
   (ver frasesConocidas() y herramientas/generar_audios.py).
   "|" separa partes que se leen una tras otra; "[en]" marca una parte en inglés. */
const limpio = t => String(t).replace(/\|/g, " ");
const partesDe = t => String(t).split("|").map(x => x.trim()).filter(Boolean);
const HABLA = {
  saludo:        "¡Hola, Sofía! ¿Qué querés hacer hoy? Tocá el cuaderno para ver tus tareas, la estrella para ver tus notas, o la carta para escribirle a tu maestra.",
  instrTareas:   "Tocá una tarea para verla. Tocá el círculo cuando la termines.",
  instrMensajes: "¿Con quién querés hablar? Tocá la cara de tu maestra o maestro.",
  vistaInicio:   "Inicio.",
  vistaMensajes: "Mensajes. ¿Con quién querés hablar? Tocá su cara.",
  vistaTareas:   n => n ? `Tus tareas. Tenés ${n} por hacer.` : "Tus tareas. ¡Ya hiciste todas!",
  vistaTarea:    t => `${MATERIAS[t.m].nombre}. ${t.titulo}.`,
  vistaNotas:    () => `Tus notas. Tu promedio es ${promedio()}.`,
  vistaChat:     d => `Mensajes con ${d.nombre}. Tocá el micrófono rojo para hablar.`,
  tarjeta:       (t, hecha) => `${MATERIAS[t.m].nombre}. ${t.titulo}. ${hecha ? "Ya la hiciste. ¡Muy bien!" : cuando(t) + "."}`,
  detalle:       (t, hecha) => `${t.titulo}.|${t.detalleVoz || t.detalle}|${hecha ? "Ya la hiciste." : cuando(t) + "."}`,
  materiales:    t => "Vas a necesitar: " + t.materiales.map(x=>x[1]).join(", ") + ".",
  nota:          k => `${MATERIAS[k].nombre}: ${NOTAS[k]}. ${ANIMO[nivel(NOTAS[k])]}`,
  total:         () => `Tu promedio es ${promedio()}. ¡Seguí así!`,
  docente:       (d, nuevo) => nuevo ? `${d.nombre} te escribió un mensaje nuevo.` : d.nombre,
  recibido:      (d, m) => m.lang === "en" ? `${d.nombre} dice:|[en]${m.texto}` : `${d.nombre} dice: ${m.texto}`,
  enviado:       m => `Vos dijiste:|${limpio(m.texto)}`,
  confirmar:     d => `¿Le mandamos este mensaje a ${d.nombre}?`,
  llego:         d => `Listo. Tu mensaje le llegó a ${d.nombre}.`,
  ayuda:         p => `${p.titulo}${/[.!?]$/.test(p.titulo) ? "" : "."} ${p.texto}`,
  filtros:       ["Todas", "Por hacer", "Atrasadas", "Hechas"],
  permiso:       "Pedile ayuda a un adulto. Para usar el micrófono, un adulto tiene que dar permiso.",
  permisoAviso:  "Pedile ayuda a un adulto para usar el micrófono.",
  sinMensaje:    "Todavía no hay mensaje. Tocá el micrófono rojo y hablá.",
  primero:       "Primero tocá el micrófono rojo y decí tu mensaje.",
  bienHecho:     "¡Bien hecho!",
  deshecha:      "Listo, la tarea quedó por hacer.",
  empezar:       "¡A empezar!",
  vozOn:         "Ayuda de voz encendida.",
  errorMic: {
    "not-allowed":         "Hay que dar permiso al micrófono.",
    "service-not-allowed": "Hay que dar permiso al micrófono.",
    "no-speech":           "No te escuché. Probá de nuevo.",
    "network":             "Se necesita internet para dictar.",
    otro:                  "No se pudo escuchar."
  }
};

// Nombre del archivo de audio de una frase: hash FNV-1a de 32 bits del texto (UTF-8).
function idAudio(texto){
  let h = 0x811c9dc5;
  for (const b of new TextEncoder().encode(texto)) h = Math.imul(h ^ b, 0x01000193) >>> 0;
  return h.toString(16).padStart(8, "0");
}

// Todas las frases que se pueden grabar de antemano. Lo único que no está aquí es
// lo que escribe o dicta el niño: eso se lee con la voz del navegador.
function frasesConocidas(){
  const s = new Set(), add = t => partesDe(t).forEach(p => s.add(p));
  for (const v of Object.values(HABLA)) if (typeof v === "string") add(v);
  Object.values(HABLA.errorMic).forEach(add);
  HABLA.filtros.forEach(add);
  add("Vos dijiste:");
  for (let n = 0; n <= TAREAS.length; n++) add(HABLA.vistaTareas(n));
  TAREAS.forEach(t => { for (const h of [false, true]){ add(HABLA.tarjeta(t, h)); add(HABLA.detalle(t, h)); } add(HABLA.materiales(t)); add(HABLA.vistaTarea(t)); });
  Object.keys(NOTAS).forEach(k => add(HABLA.nota(k)));
  add(HABLA.total()); add(HABLA.vistaNotas());
  DOCENTES.forEach(d => { add(HABLA.docente(d, true)); add(HABLA.docente(d, false)); add(HABLA.confirmar(d)); add(HABLA.llego(d)); add(HABLA.vistaChat(d)); });
  MENSAJES_INICIALES.forEach(m => add(HABLA.recibido(docenteDe(m.doc), m)));
  PASOS_AYUDA.forEach(p => add(HABLA.ayuda(p)));
  FRASES.forEach(f => add(f.texto));
  return [...s].map(texto => ({id: idAudio(texto), texto}));
}
