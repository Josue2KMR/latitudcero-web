"use client";
import { TUESTES } from "@/domain/cafe";
import type { Tueste } from "@/domain/types";

/**
 * Los cinco círculos de la etiqueta, clickeables: la cruz se mueve al tueste elegido.
 * Es un grupo de radios nativo, así funciona con teclado (flechas) y lector de pantalla.
 */
export function TuesteSelector({ valor, alCambiar }: { valor: Tueste; alCambiar: (t: Tueste) => void }) {
  return (
    <fieldset>
      <legend>Tueste</legend>
      <div className="tueste-selector">
        {([1, 2, 3, 4, 5] as Tueste[]).map((t) => (
          <label key={t}>
            <input type="radio" name="tueste" value={t} checked={valor === t} onChange={() => alCambiar(t)} />
            <span className="circulo" aria-hidden="true" />
            <small>{TUESTES[t]}</small>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
