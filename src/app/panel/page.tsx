import Link from "next/link";
import { redirect } from "next/navigation";
import { usuarioActual } from "@/lib/auth/sesion";
import { comercio } from "@/lib/commerce";

export default async function PanelCafes() {
  const u = await usuarioActual();
  if (u?.rol !== "admin") redirect("/panel/pedidos");
  const cafes = await comercio().listarCafes();
  return (
    <>
      <h1 style={{ fontSize: "2rem" }}>Cafés y etiquetas</h1>
      <p className="suave">Editá la ficha de cada café: SCA, origen, fincas en el mapa, tueste y perfil. La etiqueta se actualiza sola.
        {comercio().nombre === "shopify" && " Precio, stock y fotos se editan en el admin de Shopify."}</p>
      <div className="tabla"><table>
        <thead><tr><th scope="col">Café</th><th scope="col">SCA</th><th scope="col">Variantes</th><th scope="col"><span className="sr-only">Acciones</span></th></tr></thead>
        <tbody>{cafes.map((c) => (
          <tr key={c.id}><td>{c.nombre}</td><td className="dato">{c.sca ?? "—"}</td><td className="dato">{c.variantes.map((v) => v.sku).join(", ")}</td>
            <td><Link className="boton chico secundario" href={`/panel/cafes/${c.slug}`}>Editar ficha</Link></td></tr>
        ))}</tbody>
      </table></div>
    </>
  );
}
