export default function Cargando() {
  return (
    <section className="seccion" aria-busy="true" aria-label="Cargando café">
      <div className="contenedor ficha">
        <div className="sk" style={{ aspectRatio: "4 / 5", borderRadius: 22 }} />
        <div className="pila">
          <div className="sk" style={{ height: 72, width: 150 }} />
          <div className="sk" style={{ height: 52, width: "70%" }} />
          <div className="sk" style={{ height: 18 }} /><div className="sk" style={{ height: 18, width: "80%" }} />
          <div className="sk" style={{ height: 58, width: "60%" }} /><div className="sk" style={{ height: 48, width: "45%" }} />
        </div>
      </div>
    </section>
  );
}
