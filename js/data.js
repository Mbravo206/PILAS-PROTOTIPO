// js/data.js — contenido del prototipo (emociones, tiempos, alternativas, apps)
// Las emociones son PROVISIONALES hasta cerrar el diagrama de afinidades.
window.PILAS_DATA = (function () {
  const emotions = [
    { id: "calma",        label: "Calma",        bg: "#6698CC", fill: "#4E7FB3", pause: "Llegas con calma. ¿Para qué entras?" },
    { id: "alegria",      label: "Alegría",      bg: "#FFEC89", fill: "#F2CF3D", pause: "Llegas con alegría. ¿Para qué entras?" },
    { id: "ansiedad",     label: "Ansiedad",     bg: "#FFAD33", fill: "#E8901A", pause: "Llegas con ansiedad. ¿Respiras un momento?" },
    { id: "aburrimiento", label: "Aburrimiento", bg: "#C28CAE", fill: "#A86F93", pause: "Llegas aburrido. ¿Qué buscas?" },
  ];

  // Tiempos de las alternativas: tres + "Indefinido" (minutes: null = sin aviso de tiempo).
  // "Ahora no" del check-in también entra sin tiempo.
  const times = [
    { id: "5",     label: "5 min",      minutes: 5 },
    { id: "10",    label: "10 min",     minutes: 10 },
    { id: "15",    label: "15 min",     minutes: 15 },
    { id: "indef", label: "Indefinido", minutes: null },
  ];

  // PENDIENTE: reemplazar con lo que digan las entrevistas.
  const alternatives = {
    aburrimiento: ["Escribirle a alguien", "Poner una canción"],
    ansiedad: ["Respirar 1 minuto", "Escribir qué te preocupa"],
    default: ["Escribirle a alguien", "Respirar 1 minuto"],
  };

  // Home simulado (mínimo): solo las redes con pausa + PILAS. Instagram y TikTok llevan su logo (campo `logo`); el resto, ícono genérico.
  // La lista de Yo → "Redes con pausa" sale de aquí: solo Instagram y TikTok, con la pausa encendida.
  // En producción esta pantalla sería un Accessibility Service (Android) o Screen Time
  // (iOS): aquí solo se demuestra la intercepción, no reemplaza el celular real.
  const apps = [
    { id: "fotogram", name: "Instagram", icon: "aperture", logo: "assets/logos/instagram.svg", social: true,  color: "#6698CC" },
    { id: "clipz",    name: "TikTok",   icon: "music",    logo: "assets/logos/tiktok.svg",    social: true,  color: "#FFEC89" },
    { id: "pilas",    name: "PILAS",    icon: null,       social: false, color: "#FBF8F1", isPilas: true },
  ];

  // Grupo de amigos. `color` es el color del avatar, uno distinto por persona (paleta del
  // design system; no es un juicio, solo el color que le tocó). El avatar lleva su inicial.
  // bigText: el morado da 4.4:1 con ink, así que su inicial va en 18px / 700.
  // El tiempo de uso solo se muestra en la fila propia (timeLabel/weekLabel): el de los demás no se ve.
  const group = [
    { id: "dani", name: "Dani", color: "#C28CAE" },
    { id: "juan", name: "Juan", color: "#6698CC" },
    { id: "mafe", name: "Mafe", color: "#FFEC89" },
    { id: "sami", name: "Sami", color: "#FFAD33", self: true, timeLabel: "25 min", weekLabel: "6 h 45 min" },
    { id: "vale", name: "Vale", color: "#967CC7", bigText: true },
  ];

  // Retos activos (siempre se muestran exactamente 2): invitaciones del grupo, nunca un bloqueo ni una cuenta regresiva.
  // "friends" = quiénes ya le entraron (sin contar a Sami, cuya adhesión vive en el estado de la sesión).
  // "done" = quiénes de esos ya lo cumplieron (se muestra con un check, sin puntos).
  const challenges = [
    { id: "nocturno", title: "Nada de redes después de las 11 pm", friends: ["juan", "vale"], done: [],       selfDefault: false },
    { id: "descanso", title: "Descanso de estudio sin celular",    friends: ["mafe"],          done: ["mafe"], selfDefault: false },
  ];

  // "Los premiados de hoy" (Grupo): reconoce sin puntos ni ranking, solo 2 personas.
  const rewarded = [
    { id: "juan", note: "Lleva toda la tarde sin abrir redes" },
    { id: "mafe", note: "Hizo su descanso de estudio completo" },
  ];

  // PENDIENTE: sugerencias de "Proponer un reto", provisionales hasta validar con el grupo.
  const challengeSuggestions = ["Nada de redes al despertar", "Una tarde sin celular"];

  // Feed simulado de Instagram y TikTok: cuentas y fotos ficticias (ilustraciones propias en assets/feed/).
  const feedPosts = [
    { id: "p1", user: "atardeceres.co", color: "#FFAD33", image: "assets/feed/atardecer.svg", likes: "1.204", caption: "El mar a las seis de la tarde" },
    { id: "p2", user: "gato_del_dia",   color: "#FFEC89", image: "assets/feed/gato.svg",      likes: "3.870", caption: "Te mira como si supiera algo" },
    { id: "p3", user: "montaneros_",    color: "#6698CC", image: "assets/feed/montanas.svg",  likes: "902",   caption: "Subimos antes del amanecer" },
    { id: "p4", user: "dulce.taller",   color: "#C28CAE", image: "assets/feed/pastel.svg",    likes: "2.115", caption: "Pastel de vainilla con cereza" },
    { id: "p5", user: "luces.de.noche", color: "#967CC7", image: "assets/feed/ciudad.svg",    likes: "758",   caption: "La ciudad no se duerme" },
    { id: "p6", user: "campo.abierto",  color: "#6BAA75", image: "assets/feed/flores.svg",    likes: "4.302", caption: "Sábado entre flores" },
  ];

  // Nota de un amigo antes de abrir una red. No ve si entras, cuánto tiempo ni cómo te sientes.
  const friendNotes = [
    { id: "n1", from: "vale", message: "Ey ey, ¡pilas con el cel!" },
    { id: "n2", from: "juan", message: "Te dibujé esto, no te rías.", drawing: true },
    { id: "n3", from: "mafe", message: "Te mandé esta flor para que te concentres.", gift: "flor" },
  ];

  // Responder al amigo: respuestas rápidas, sin abrir una bandeja de mensajes.
  const friendReplies = ["¡Dale!", "¡Gracias!", "Jaja, listo"];

  // Responder al amigo con un muñequito: una respuesta sin palabras. `face` es la carita (id de emoción) que se dibuja.
  const replyDolls = [
    { id: "listo",   label: "Listo",            face: "alegria" },
    { id: "pensare", label: "Lo pensaré",       face: "aburrimiento" },
    { id: "ahorita", label: "Ahorita no puedo", face: "ansiedad" },
    { id: "luego",   label: "Te cuento luego",  face: "calma" },
  ];

  // Dejarle algo a un amigo: mensajes sugeridos además de escribir el propio.
  const noteSuggestions = ["Ey ey, ¡pilas con el cel!", "¿Cómo vas hoy?", "Acuérdate de tomar agua"];

  // Descanso: tiempos sugeridos y sugerencia según el ritmo de Sami (dato de ejemplo).
  const breakTimes = [
    { id: "2",  label: "2 min",  minutes: 2 }, // acceso rápido desde Hoy
    { id: "10", label: "10 min", minutes: 10 },
    { id: "20", label: "20 min", minutes: 20 },
    { id: "30", label: "30 min", minutes: 30 },
  ];
  const breakSuggestion = { minutes: 20, note: "Este es tu ritmo: sueles descansar 20 min." };

  // "Tus logros" (Descanso): estadísticas simuladas, solo describen. Sin niveles ni comparación.
  const breakStats = [
    { label: "Descansos que terminaste", pct: 80 },
    { label: "Veces que saliste a tiempo", pct: 65 },
    { label: "Tu meta de foco del mes", pct: 60 },
  ];

  // 2 descansos de ejemplo para el historial
  function sampleBreaks() {
    const today = new Date();
    const at = (h, m) => { const d = new Date(today); d.setHours(h, m, 0, 0); return d.toISOString(); };
    return [
      { id: "d1", minutes: 20, realMinutes: 22, date: at(6, 30) },
      { id: "d2", minutes: 15, realMinutes: 10, date: at(13, 0) },
    ];
  }

  // Yo: metas del mes, elegidas por Sami. Sin niveles ni comparación con nadie más.
  const goals = [
    { id: "foco",     title: "30 h de foco en el mes",                    current: 18, target: 30, unit: "h" },
    { id: "nocturno", title: "Noches sin redes después de las 11 pm",     current: 9,  target: 20, unit: "noches" },
    { id: "intencion", title: "Entrar con intención",                    current: 14, target: 25, unit: "veces" },
  ];

  // PENDIENTE: sugerencias de "Agregar meta", provisionales hasta validar con el grupo.
  const goalSuggestions = ["Comidas sin pantallas", "Salir a caminar sin celular"];

  // "Lo que lograste este mes": describe, no califica. Solo Sami lo ve.
  const achievements = [
    { icon: "clock",          text: "Saliste a tiempo 12 veces" },
    { icon: "moon",           text: "9 noches sin redes tarde" },
    { icon: "users",          text: "Probaste 2 retos con tu grupo" },
    { icon: "message-circle", text: "Le escribiste a Vale" },
  ];

  // Tarjeta protagonista de Yo: horas de foco + comparación de emociones sin juicio.
  const focus = { current: 18, target: 30, since: "marzo", emoNote: "Llegaste más veces con calma que con ansiedad." };

  // 2 entradas de ejemplo: preseleccionan el tiempo de las alternativas (Hoy ya no las lista)
  function sampleEntries() {
    const today = new Date();
    const at = (h, m) => { const d = new Date(today); d.setHours(h, m, 0, 0); return d.toISOString(); };
    return [
      { id: "demo1", app: "fotogram", emotionIn: "aburrimiento", minutes: 10, realMinutes: 14, emotionOut: "calma", exceeded: true, date: at(7, 15) },
      { id: "demo2", app: "clipz", emotionIn: "calma", minutes: 5, realMinutes: 4, emotionOut: "alegria", exceeded: false, date: at(12, 40) },
    ];
  }

  const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));

  return {
    emotions, times, alternatives, apps, group, challenges, challengeSuggestions, rewarded, breakStats,
    friendNotes, feedPosts, friendReplies, replyDolls, noteSuggestions, breakTimes, breakSuggestion, sampleBreaks,
    goals, goalSuggestions, achievements, focus, sampleEntries,
    EMO: byId(emotions), APP: byId(apps), GROUP: byId(group),
  };
})();
