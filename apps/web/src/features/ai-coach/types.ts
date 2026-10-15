export type Diagnosis = {
  resumen: string;
  puntoDePartida: string[];
  prioridades: string[];
  alertas: string[];
  datosFaltantes: string[];
  preguntas: { id: string; pregunta: string; motivo: string }[];
};

export type Answer = { id: string; pregunta: string; respuesta: string };

export type PlanExercise = {
  ejercicioId: string;
  nombre: string;
  grupo: string;
  equipo: string;
  series: number;
  repeticiones: string;
  descansoSeg: number;
  esfuerzo: number;
  nota: string;
};

export type PlanSession = {
  dia: string;
  enfoque: string;
  duracionMin: number;
  ejercicios: PlanExercise[];
  cardio: { equipoId: string; nombre: string; minutos: number; intensidad: string; momento: "antes" | "despues" };
};

export type Plan = {
  nombre: string;
  objetivo: string;
  semanas: number;
  resumen: string;
  sesiones: PlanSession[];
  progresion: string;
  notas: string[];
  validacion: string[];
  conservador: boolean;
};

export type PlanStatus = "propuesta" | "activo" | "archivado" | "rechazada";
