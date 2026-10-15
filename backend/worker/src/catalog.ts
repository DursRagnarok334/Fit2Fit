// Catálogo genérico de un gimnasio de cadena. La IA solo puede elegir de aquí.
// Confirma en tu sede qué equipos existen y elimina o agrega líneas según haga falta.
export type Item = { id: string; nombre: string; grupo: string; equipo: string };

const e = (id: string, nombre: string, grupo: string, equipo: string): Item => ({ id, nombre, grupo, equipo });

export const EXERCISES: Item[] = [
  // Cuádriceps
  e("sentadilla-goblet", "Sentadilla goblet", "cuádriceps", "mancuerna"),
  e("sentadilla-barra", "Sentadilla con barra", "cuádriceps", "barra libre"),
  e("sentadilla-smith", "Sentadilla en máquina Smith", "cuádriceps", "máquina Smith"),
  e("prensa-pierna", "Prensa de piernas", "cuádriceps", "máquina"),
  e("extension-cuadriceps", "Extensión de cuádriceps", "cuádriceps", "máquina"),
  e("zancada-caminando", "Zancada caminando", "cuádriceps", "mancuernas"),
  e("sentadilla-bulgara", "Sentadilla búlgara", "cuádriceps", "mancuernas y banco"),
  e("step-up", "Subida al banco (step-up)", "cuádriceps", "mancuernas y banco"),
  // Glúteos e isquios
  e("peso-muerto-rumano", "Peso muerto rumano con barra", "isquios", "barra libre"),
  e("peso-muerto-rumano-mancuernas", "Peso muerto rumano con mancuernas", "isquios", "mancuernas"),
  e("curl-femoral-sentado", "Curl femoral sentado", "isquios", "máquina"),
  e("curl-femoral-tumbado", "Curl femoral tumbado", "isquios", "máquina"),
  e("puente-gluteo", "Puente de glúteo", "glúteos", "peso corporal o mancuerna"),
  e("hip-thrust-barra", "Hip thrust con barra", "glúteos", "barra y banco"),
  e("patada-gluteo-polea", "Patada de glúteo en polea", "glúteos", "polea"),
  e("patada-gluteo-maquina", "Patada de glúteo en máquina", "glúteos", "máquina"),
  e("abduccion-cadera", "Abducción de cadera", "glúteos", "máquina"),
  e("aduccion-cadera", "Aducción de cadera", "aductores", "máquina"),
  // Pantorrilla
  e("elevacion-talones-pie", "Elevación de talones de pie", "pantorrilla", "máquina o Smith"),
  e("elevacion-talones-sentado", "Elevación de talones sentado", "pantorrilla", "máquina"),
  // Pecho
  e("press-pecho-maquina", "Press de pecho en máquina", "pecho", "máquina"),
  e("press-banca-mancuernas", "Press de banca con mancuernas", "pecho", "mancuernas y banco"),
  e("press-banca-barra", "Press de banca con barra", "pecho", "barra y banco"),
  e("press-inclinado-mancuernas", "Press inclinado con mancuernas", "pecho", "mancuernas y banco"),
  e("aperturas-pec-deck", "Aperturas en máquina (pec deck)", "pecho", "máquina"),
  e("cruce-poleas", "Cruce de poleas", "pecho", "polea"),
  e("flexiones", "Flexiones", "pecho", "peso corporal"),
  // Espalda
  e("jalon-pecho", "Jalón al pecho", "espalda", "polea"),
  e("remo-sentado-polea", "Remo sentado en polea", "espalda", "polea"),
  e("remo-maquina", "Remo en máquina", "espalda", "máquina"),
  e("remo-mancuerna", "Remo con mancuerna a una mano", "espalda", "mancuerna y banco"),
  e("dominadas-asistidas", "Dominadas asistidas", "espalda", "máquina"),
  e("face-pull", "Face pull", "hombro posterior", "polea"),
  e("hiperextension-lumbar", "Hiperextensión lumbar", "espalda baja", "banco romano"),
  // Hombros
  e("press-hombro-maquina", "Press de hombro en máquina", "hombros", "máquina"),
  e("press-hombro-mancuernas", "Press de hombro con mancuernas", "hombros", "mancuernas"),
  e("elevaciones-laterales", "Elevaciones laterales", "hombros", "mancuernas"),
  e("aperturas-inversas", "Aperturas inversas", "hombro posterior", "máquina"),
  // Brazos
  e("curl-biceps-mancuernas", "Curl de bíceps con mancuernas", "bíceps", "mancuernas"),
  e("curl-barra-z", "Curl con barra Z", "bíceps", "barra Z"),
  e("curl-polea", "Curl de bíceps en polea", "bíceps", "polea"),
  e("extension-triceps-polea", "Extensión de tríceps en polea", "tríceps", "polea"),
  e("extension-triceps-mancuerna", "Extensión de tríceps con mancuerna", "tríceps", "mancuerna"),
  e("fondos-banco", "Fondos en banco", "tríceps", "peso corporal y banco"),
  // Core
  e("plancha", "Plancha", "core", "peso corporal"),
  e("plancha-lateral", "Plancha lateral", "core", "peso corporal"),
  e("bird-dog", "Bird dog", "core", "peso corporal"),
  e("elevacion-piernas", "Elevación de piernas", "core", "peso corporal"),
  e("crunch-maquina", "Crunch abdominal en máquina", "core", "máquina"),
];

export const CARDIO: Item[] = [
  e("caminadora-inclinada", "Caminadora con inclinación", "cardio", "caminadora"),
  e("caminadora-trote", "Trote en caminadora", "cardio", "caminadora"),
  e("bicicleta-estatica", "Bicicleta estática", "cardio", "bicicleta"),
  e("eliptica", "Elíptica", "cardio", "elíptica"),
  e("escaladora", "Escaladora", "cardio", "escaladora"),
];

export const catalogText = (items: Item[]) => items.map((i) => `${i.id} | ${i.nombre} | ${i.grupo} | ${i.equipo}`).join("\n");
