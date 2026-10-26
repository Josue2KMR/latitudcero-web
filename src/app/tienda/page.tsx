import type { Metadata } from "next";
import { TarjetaCafe } from "@/components/FichaPartes";
import { comercio } from "@/lib/commerce";

export const metadata: Metadata = { title: "Tienda" };

export default async function Tienda() {
  const cafes = await comercio().listarCafes();
  return (
    <section className="seccion">
      <div className="contenedor pila" style={{ gap: 28 }}>
        <div className="pila" style={{ gap: 6 }}><span className="eyebrow">Tienda</span><h1>Nuestros cafés</h1>
          <p className="suave">250 g o 1 kg, en grano o molido a pedido para tu cafetera.</p></div>
        {cafes.length ? <div className="grilla">{cafes.map((c) => <TarjetaCafe key={c.id} cafe={c} />)}</div> : <div className="vacio">Todavía no hay cafés publicados.</div>}
      </div>
    </section>
  );
}
