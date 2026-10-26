import type { Tueste } from "./types";

/** Categoría según el puntaje de cata de la Specialty Coffee Association (escala 0 a 100). */
export function categoriaSca(sca: number | null): string {
  if (sca == null) return "Puntaje pendiente";
  if (sca >= 90) return "Excepcional";
  if (sca >= 85) return "Excelente";
  if (sca >= 80) return "Especialidad";
  return "Por debajo de especialidad";
}

export function validarSca(valor: number | null): string | null {
  if (valor == null) return null;
  if (!Number.isFinite(valor) || valor < 0 || valor > 100) return "El puntaje SCA va de 0 a 100.";
  if (Math.round(valor * 100) !== valor * 100) return "Usá como máximo dos decimales.";
  return null;
}

export const TUESTES: Record<Tueste, string> = {
  1: "Claro",
  2: "Claro-medio",
  3: "Medio",
  4: "Medio-oscuro",
  5: "Oscuro",
};

/** "250 g" / "1 kg" para botones y carrito. */
export function pesoCorto(gramos: number): string {
  return gramos >= 1000 ? `${gramos / 1000} kg` : `${gramos} g`;
}

/** Peso neto de la etiqueta: gramos y onzas avoirdupois (1 oz = 28,3495 g). */
export function pesoEtiqueta(gramos: number): string {
  const oz = (gramos / 28.3495).toFixed(1).replace(".", ",");
  return `${pesoCorto(gramos)} / ${oz} oz`;
}

export function formatoPesos(n: number): string {
  return "$ " + Math.round(n).toLocaleString("es-UY");
}
