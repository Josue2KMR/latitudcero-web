"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** Solo dos destinos (ley de Hick): el resto vive en el pie. */
const LINKS = [
  { href: "/tienda", texto: "Tienda", activo: (p: string) => p.startsWith("/tienda") || p.startsWith("/cafe") },
  { href: "/novedades", texto: "Novedades", activo: (p: string) => p.startsWith("/novedades") },
];

export function NavPrincipal() {
  const ruta = usePathname();
  return (
    <nav className="nav" aria-label="Principal">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} aria-current={l.activo(ruta) ? "page" : undefined}>{l.texto}</Link>
      ))}
    </nav>
  );
}
