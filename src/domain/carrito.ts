import type { LineaCarrito } from "./types";

/**
 * Cambia la molienda de una línea. Si ya existe otra línea con la misma presentación y la
 * molienda nueva, las une (suma cantidades) para que el carrito no tenga dos filas iguales.
 * Función pura: devuelve un arreglo nuevo.
 */
export function cambiarMolienda(lineas: LineaCarrito[], lineaId: string, moliendaId: string): LineaCarrito[] {
  const linea = lineas.find((l) => l.id === lineaId);
  if (!linea) throw new Error("Esa línea ya no está en el carrito.");
  if (linea.moliendaId === moliendaId) return lineas;

  const gemela = lineas.find(
    (l) => l.id !== lineaId && l.varianteId === linea.varianteId && l.moliendaId === moliendaId,
  );
  if (gemela) {
    return lineas
      .filter((l) => l.id !== lineaId)
      .map((l) => (l.id === gemela.id ? { ...l, cantidad: l.cantidad + linea.cantidad } : l));
  }
  return lineas.map((l) => (l.id === lineaId ? { ...l, moliendaId } : l));
}

/** Unidades de una presentación en todo el carrito (sumando moliendas distintas). */
export function unidadesDeVariante(lineas: LineaCarrito[], varianteId: string, excluirLineaId?: string): number {
  return lineas
    .filter((l) => l.varianteId === varianteId && l.id !== excluirLineaId)
    .reduce((a, l) => a + l.cantidad, 0);
}
