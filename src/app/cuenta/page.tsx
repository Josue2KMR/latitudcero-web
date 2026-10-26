import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { accionSalir } from "@/app/acciones";
import { formatoPesos } from "@/domain/cafe";
import { ETIQUETA_ESTADO } from "@/domain/pedido";
import { esSocio, usuarioActual } from "@/lib/auth/sesion";
import { comercio } from "@/lib/commerce";

export const metadata: Metadata = { title: "Tu cuenta" };

export default async function Cuenta() {
  const u = await usuarioActual();
  if (!u) redirect("/ingresar?siguiente=/cuenta");
  const pedidos = (await comercio().pedidos?.listar({ email: u.email })) ?? [];
  return (
    <section className="seccion">
      <div className="contenedor pila" style={{ gap: 24 }}>
        <div className="fila">
          <div className="pila crece" style={{ gap: 4 }}><span className="eyebrow">Tu cuenta</span><h1 style={{ fontSize: "2.2rem" }}>Hola, {u.nombre}</h1></div>
          {esSocio(u) && <Link className="boton" href="/panel">Ir al panel</Link>}
          <form action={accionSalir}><button className="boton secundario">Cerrar sesión</button></form>
        </div>
        <h2 style={{ fontSize: "1.5rem" }}>Tus pedidos</h2>
        {comercio().nombre === "shopify" ? (
          <div className="aviso info">Tus pedidos de Shopify se muestran acá cuando conectemos la Customer Account API (fase 2). Mientras tanto te llegan por email.</div>
        ) : pedidos.length ? (
          <div className="tabla"><table>
            <thead><tr><th scope="col">Comanda</th><th scope="col">Fecha</th><th scope="col">Entrega</th><th scope="col">Estado</th><th scope="col" className="num">Total</th></tr></thead>
            <tbody>{pedidos.map((p) => (
              <tr key={p.numero}>
                <td><Link href={`/pedido/${p.numero}`}>{p.numero}</Link></td>
                <td>{new Date(p.creadoEn).toLocaleDateString("es-UY")}</td>
                <td>{p.entrega.tipo === "envio" ? "Envío" : "Retiro"}</td>
                <td><span className="chip">{ETIQUETA_ESTADO[p.estado]}</span></td>
                <td className="num">{formatoPesos(p.total)}</td>
              </tr>
            ))}</tbody>
          </table></div>
        ) : <div className="vacio">Todavía no hiciste pedidos.</div>}
      </div>
    </section>
  );
}
