import { MAPA } from "./ecuador-path";

/**
 * Proyección Mercator con la misma escala y traslación que se usó para dibujar el contorno.
 * Permite ubicar una finca (lat, lng) sobre el mapa, y al revés: convertir un clic en coordenadas.
 */
const RAD = Math.PI / 180;

export function proyectar(lat: number, lng: number): { x: number; y: number } {
  return {
    x: MAPA.escala * lng * RAD + MAPA.tx,
    y: MAPA.ty - MAPA.escala * Math.log(Math.tan(Math.PI / 4 + (lat * RAD) / 2)),
  };
}

export function desproyectar(x: number, y: number): { lat: number; lng: number } {
  const lng = (x - MAPA.tx) / MAPA.escala / RAD;
  const lat = (2 * Math.atan(Math.exp((MAPA.ty - y) / MAPA.escala)) - Math.PI / 2) / RAD;
  return { lat: redondear(lat), lng: redondear(lng) };
}

/** Rectángulo de Ecuador continental: sirve para validar lo que se carga en el panel. */
export function dentroDeEcuador(lat: number, lng: number): boolean {
  return lat >= -5.1 && lat <= 1.6 && lng >= -81.2 && lng <= -75.1;
}

function redondear(n: number) {
  return Math.round(n * 10000) / 10000;
}
