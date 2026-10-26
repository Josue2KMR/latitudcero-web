import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Comanda } from "@/components/Comanda";
import { esSocio, usuarioActual } from "@/lib/auth/sesion";
import { comercio } from "@/lib/commerce";

export const metadata: Metadata = { title: "Tu comanda" };

export default async function PaginaPedido({ params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params;
  const u = await usuarioActual();
  if (!u) redirect(`/ingresar?siguiente=/pedido/${numero}`);
  const pedido = await comercio().pedidos?.obtener(numero);
  // Cada cliente ve solo sus comandas; los socios ven todas.
  if (!pedido || (pedido.clienteEmail !== u.email && !esSocio(u))) notFound();
  return (
    <section className="seccion">
      <div className="contenedor pila" style={{ gap: 20 }}>
        {pedido.estado === "pagado" && <p className="aviso ok" style={{ maxWidth: 560, margin: "0 auto", width: "100%" }}>Recibimos tu pago. Te avisamos por email en cada paso.</p>}
        <Comanda pedido={pedido} />
        <div className="fila" style={{ justifyContent: "center" }}><Link className="boton secundario" href="/cuenta">Tus pedidos</Link><Link className="boton" href="/tienda">Seguir comprando</Link></div>
      </div>
    </section>
  );
}
