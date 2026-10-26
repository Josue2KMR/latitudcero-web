import Link from "next/link";

export default function NoEncontrado() {
  return (
    <section className="seccion"><div className="contenedor vacio pila" style={{ alignItems: "center" }}>
      <h1 style={{ fontSize: "2rem" }}>No encontramos esa página</h1>
      <p>Puede que el café se haya despublicado o que el enlace esté mal.</p>
      <Link className="boton" href="/tienda">Ir a la tienda</Link>
    </div></section>
  );
}
