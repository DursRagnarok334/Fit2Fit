export type Diagnosis = {
  resumen: string;
  puntoDePartida: string[];
  prioridades: string[];
  alertas: string[];
  datosFaltantes: string[];
  preguntas: { id: string; pregunta: string; motivo: string }[];
};
