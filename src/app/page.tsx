import Link from "next/link";
import { DatosOrigen, Sca } from "@/components/FichaPartes";
import { formatoPesos } from "@/domain/cafe";
import { comercio } from "@/lib/commerce";

export default async function Inicio() {
  const cafes = await comercio().listarCafes();
  const destacado = cafes[0];
  const video = process.env.NEXT_PUBLIC_VIDEO_PORTADA; // URL del video de producción (Shopify Files)
  const desde = destacado ? Math.min(...destacado.variantes.filter((v) => v.precio > 0).map((v) => v.precio)) : 0;
  return (
    <>
      <section className="portada" aria-label="Presentación">
        {video ? (
          <video autoPlay muted loop playsInline poster="/productos/ecuador-bolsa.jpg" aria-hidden="true"><source src={video} /></video>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="foto" src="/productos/ecuador-bolsa.jpg" alt="" />
        )}
        <div className="contenedor">
          <div className="texto">
            <span className="eyebrow">00°00′00″ · Línea del ecuador</span>
            <h1>Café de altura, de la mitad del mundo a tu taza</h1>
            <p>Cafés de origen único con su puntaje SCA y la historia de cada lote. Tostado en pequeñas cantidades y enviado a todo Uruguay.</p>
            <div className="fila"><Link className="boton claro" href="/tienda">Ver cafés</Link></div>
          </div>
        </div>
      </section>
      {destacado && (
        <section className="seccion">
          <div className="contenedor ficha">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="foto" src={destacado.imagen} alt={`Bolsa de café Latitud Cero, origen ${destacado.nombre}`} />
            <div className="pila" style={{ gap: 22 }}>
              <Sca cafe={destacado} />
              <div className="pila" style={{ gap: 6 }}><span className="eyebrow">Origen destacado</span><h2>{destacado.nombre}</h2><p className="suave">{destacado.descripcion}</p></div>
              <DatosOrigen cafe={destacado} />
              <div className="fila"><span className="precio">desde {formatoPesos(desde)}</span><Link className="boton" href={`/cafe/${destacado.slug}`}>Elegir presentación</Link></div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
