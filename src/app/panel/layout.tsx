import Link from "next/link";
import { redirect } from "next/navigation";
import { esSocio, usuarioActual } from "@/lib/auth/sesion";

/** Toda ruta /panel exige un socio. La autorización también se valida en cada Server Action. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const u = await usuarioActual();
  if (!u) redirect("/ingresar?siguiente=/panel");
  if (!esSocio(u)) {
    return <section className="seccion"><div className="contenedor"><div className="aviso error pila"><h1 style={{ fontSize: "1.8rem" }}>Acceso restringido</h1><p>El panel es solo para socios de Latitud Cero.</p><div><Link className="boton" href="/">Volver al inicio</Link></div></div></div></section>;
  }
  return (
    <div className="panel">
      <aside aria-label="Secciones del panel">
        <span style={{ padding: "8px 12px 14px", fontSize: ".9rem" }}><strong>{u.nombre} {u.apellido}</strong><br />{u.rol === "admin" ? "Administrador" : "Operador"}</span>
        {u.rol === "admin" && <Link href="/panel">Cafés y etiquetas</Link>}
        <Link href="/panel/pedidos">Pedidos y entregas</Link>
        <Link href="/">← Ver tienda</Link>
      </aside>
      <div className="contenido">{children}</div>
    </div>
  );
}
