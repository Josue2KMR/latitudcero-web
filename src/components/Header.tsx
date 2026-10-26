import Link from "next/link";
import { comercio } from "@/lib/commerce";
import { carritoIdActual } from "@/lib/carrito-cookie";
import { usuarioActual } from "@/lib/auth/sesion";
import { IconoBolsa, IconoUsuario } from "./Iconos";
import { NavPrincipal } from "./NavPrincipal";

export async function Header() {
  const [usuario, carrito] = await Promise.all([usuarioActual(), carritoIdActual().then((id) => comercio().obtenerCarrito(id))]);
  const n = carrito?.cantidadTotal ?? 0;
  return (
    <header className="header">
      <div className="contenedor">
        <Link href="/" className="marca" aria-label="Latitud Cero, ir al inicio">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="sol" src="/brand/emblema.svg" alt="" width={68} height={68} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="nombre" src="/brand/wordmark.svg" alt="" width={125} height={50} />
        </Link>
        <NavPrincipal />
        <div className="iconos">
          <Link className="icono" href={usuario ? "/cuenta" : "/ingresar"} aria-label={usuario ? `Tu cuenta, ${usuario.nombre}` : "Ingresar"}>
            <IconoUsuario />
          </Link>
          <Link className="icono" href="/carrito" aria-label={`Carrito, ${n} ${n === 1 ? "producto" : "productos"}`}>
            <IconoBolsa />
            {n > 0 && <span className="contador" aria-hidden="true">{n}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}
