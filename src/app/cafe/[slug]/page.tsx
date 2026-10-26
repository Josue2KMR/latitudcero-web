import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ComprarCafe } from "@/components/ComprarCafe";
import { Etiqueta } from "@/components/Etiqueta";
import { DatosOrigen, PerfilTaza, Sca } from "@/components/FichaPartes";
import { MapaOrigen } from "@/components/MapaOrigen";
import { PestanasFicha } from "@/components/PestanasFicha";
import { comercio } from "@/lib/commerce";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cafe = await comercio().obtenerCafe((await params).slug);
  return cafe ? { title: cafe.nombre, description: cafe.descripcion } : {};
}

export default async function FichaCafe({ params }: Props) {
  const { slug } = await params;
  const [cafe, moliendas] = await Promise.all([comercio().obtenerCafe(slug), comercio().listarMoliendas()]);
  if (!cafe) notFound();
  const pesoBase = cafe.variantes[0]?.pesoGramos ?? 250;

  return (
    <section className="seccion">
      <div className="contenedor">
        <nav aria-label="Ruta" className="dato" style={{ fontSize: ".85rem", marginBottom: 22 }}>
          <Link href="/tienda">Tienda</Link> / <span aria-current="page">{cafe.nombre}</span>
        </nav>
        <div className="ficha">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="foto" src={cafe.imagen} alt={`Bolsa de café ${cafe.nombre}`} />
          <div className="pila" style={{ gap: 24 }}>
            <Sca cafe={cafe} />
            <div className="pila" style={{ gap: 6 }}>
              <span className="eyebrow">{[cafe.pais, cafe.altitud ? `${cafe.altitud} m` : "", cafe.variedad].filter(Boolean).join(" · ")}</span>
              <h1>{cafe.nombre}</h1>
              <p>{cafe.descripcion}</p>
            </div>
            <ComprarCafe variantes={cafe.variantes} moliendas={moliendas} />
          </div>
        </div>
        <div style={{ marginTop: 56 }}>
          <PestanasFicha pestanas={[
            { id: "origen", titulo: "Origen", contenido: <div className="origen-grid"><DatosOrigen cafe={cafe} /><MapaOrigen fincas={cafe.fincas} /></div> },
            { id: "perfil", titulo: "Perfil de taza", contenido: <PerfilTaza cafe={cafe} /> },
            { id: "etiqueta", titulo: "Etiqueta", contenido: (
              <div className="pila">
                <Etiqueta nombre={cafe.nombre} ficha={cafe} pesoGramos={pesoBase} />
                <p className="suave" style={{ fontSize: ".9rem" }}>La etiqueta se genera con los datos que el tostador carga en el panel.</p>
              </div>
            ) },
          ]} />
        </div>
      </div>
    </section>
  );
}
