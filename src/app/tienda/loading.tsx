/** Skeleton del catálogo: muestra la forma de las tarjetas mientras llegan los datos. */
export default function Cargando() {
  return (
    <section className="seccion" aria-busy="true" aria-label="Cargando cafés">
      <div className="contenedor pila" style={{ gap: 28 }}>
        <div className="sk" style={{ height: 48, width: 280 }} />
        <div className="grilla">
          {[1, 2, 3].map((i) => (
            <div key={i} className="pila" style={{ gap: 12 }}>
              <div className="sk" style={{ aspectRatio: "4 / 5", borderRadius: 22 }} />
              <div className="sk" style={{ height: 22, width: "60%" }} />
              <div className="sk" style={{ height: 16, width: "40%" }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
