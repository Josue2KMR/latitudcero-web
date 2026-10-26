import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FormCheckout } from "@/components/Formularios";
import { formatoPesos, pesoCorto } from "@/domain/cafe";
import { usuarioActual } from "@/lib/auth/sesion";
import { carritoIdActual } from "@/lib/carrito-cookie";
import { comercio } from "@/lib/commerce";
import { COSTO_ENVIO, ENVIO_GRATIS_DESDE } from "@/lib/commerce/mock/datos";

export const metadata: Metadata = { title: "Checkout" };

export default async function Checkout() {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/ingresar?siguiente=/checkout"); // registro obligatorio para comprar
  const carrito = await comercio().obtenerCarrito(await carritoIdActual());
  if (!carrito?.lineas.length) redirect("/carrito");
  const envio = carrito.subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO;
  return (
    <section className="seccion">
      <div className="contenedor carrito">
        <div className="pila" style={{ gap: 20 }}>
          <h1>Checkout</h1>
          <p className="suave">Comprás como <strong>{usuario.nombre} {usuario.apellido}</strong> ({usuario.email}).</p>
          <FormCheckout total={carrito.subtotal} costoEnvio={envio} proveedor={comercio().nombre} />
        </div>
        <aside className="caja pila" aria-label="Tu pedido">
          <h2 style={{ fontSize: "1.4rem" }}>Tu pedido</h2>
          {carrito.lineas.map((l) => (
            <div className="resumen-fila" key={l.id}><span>{l.cantidad} × {l.cafe.nombre} {pesoCorto(l.variante.pesoGramos)} <span className="suave">({l.molienda.nombre})</span></span><span>{formatoPesos(l.subtotal)}</span></div>
          ))}
          <div className="resumen-fila total"><span>Subtotal</span><span>{formatoPesos(carrito.subtotal)}</span></div>
        </aside>
      </div>
    </section>
  );
}
