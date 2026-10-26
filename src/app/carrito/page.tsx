import type { Metadata } from "next";
import Link from "next/link";
import { LineaCarrito } from "@/components/LineaCarrito";
import { formatoPesos } from "@/domain/cafe";
import { usuarioActual } from "@/lib/auth/sesion";
import { carritoIdActual } from "@/lib/carrito-cookie";
import { comercio } from "@/lib/commerce";

export const metadata: Metadata = { title: "Carrito" };

export default async function Carrito() {
  const [carrito, moliendas, usuario] = await Promise.all([
    carritoIdActual().then((id) => comercio().obtenerCarrito(id)),
    comercio().listarMoliendas(),
    usuarioActual(),
  ]);
  if (!carrito?.lineas.length) {
    return (
      <section className="seccion"><div className="contenedor">
        <div className="vacio pila" style={{ alignItems: "center" }}><h1 style={{ fontSize: "2rem" }}>Tu carrito está vacío</h1><Link className="boton" href="/tienda">Ver cafés</Link></div>
      </div></section>
    );
  }
  return (
    <section className="seccion">
      <div className="contenedor pila" style={{ gap: 24 }}>
        <h1>Carrito</h1>
        <div className="carrito">
          <div className="caja" style={{ paddingBlock: 4 }}>
            {carrito.lineas.map((l) => <LineaCarrito key={l.id} linea={l} moliendas={moliendas} />)}
          </div>
          <aside className="caja pila" aria-label="Resumen">
            <h2 style={{ fontSize: "1.4rem" }}>Resumen</h2>
            <div className="resumen-fila"><span>Subtotal</span><span>{formatoPesos(carrito.subtotal)}</span></div>
            <div className="resumen-fila suave"><span>Envío</span><span>en el checkout</span></div>
            <Link className="boton" href="/checkout">{usuario ? "Continuar al pago" : "Ingresar y pagar"}</Link>
            {!usuario && <p className="suave" style={{ fontSize: ".9rem" }}>Para comprar necesitás una cuenta. Tu carrito te espera.</p>}
          </aside>
        </div>
      </div>
    </section>
  );
}
