import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Latitud Cero° · Café de altura", template: "%s · Latitud Cero°" },
  description: "Cafés de origen único con puntaje SCA, tostados en pequeños lotes y enviados a todo Uruguay.",
};
export const viewport: Viewport = { themeColor: "#1F485A" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-UY">
      <body>
        <a className="saltar" href="#contenido">Saltar al contenido</a>
        <Header />
        <main id="contenido" tabIndex={-1}>{children}</main>
        <footer className="pie">
          <div className="contenedor">
            <div className="pila" style={{ gap: 10 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/wordmark-claro.svg" alt="Latitud Cero" width={150} height={60} />
              <span className="dato" style={{ fontSize: ".85rem" }}>latitudcero.uy · Montevideo</span>
            </div>
            <div className="pila" style={{ gap: 8 }}><span className="eyebrow">Tienda</span><Link href="/tienda">Cafés</Link><Link href="/novedades">Novedades</Link></div>
            <div className="pila" style={{ gap: 8 }}><span className="eyebrow">Tu cuenta</span><Link href="/cuenta">Tus pedidos</Link><Link href="/carrito">Carrito</Link></div>
            <div className="pila" style={{ gap: 8 }}><span className="eyebrow">Contacto</span><span className="dato" style={{ fontSize: ".9rem" }}>hola@latitudcero.uy</span></div>
          </div>
        </footer>
      </body>
    </html>
  );
}
