import Link from "next/link";
import { AccionesPedido } from "@/components/AccionesPedido";
import { formatoPesos } from "@/domain/cafe";
import { ETIQUETA_ESTADO, siguientesEstados } from "@/domain/pedido";
import { comercio } from "@/lib/commerce";

/** Pedidos y entregas. Con Shopify esto se hace en su admin; acá vive para el modo mock y para retiros por código. */
export default async function PanelPedidos({ searchParams }: { searchParams: Promise<{ codigo?: string }> }) {
  const { codigo } = await searchParams;
  const p = comercio().pedidos;
  if (!p) return <div className="aviso info">Con Shopify, los pedidos, el tracking y la entrega en el punto de retiro se gestionan desde el admin de Shopify.</div>;
  const [pedidos, encontrado] = await Promise.all([p.listar(), codigo ? p.buscarPorCodigoRetiro(codigo) : Promise.resolve(null)]);
  return (
    <>
      <h1 style={{ fontSize: "2rem" }}>Pedidos y entregas</h1>
      <form className="caja fila" role="search" action="/panel/pedidos">
        <div className="campo crece"><label htmlFor="codigo">Código del ticket de retiro</label><input id="codigo" name="codigo" defaultValue={codigo} placeholder="K7PZ3Q" style={{ textTransform: "uppercase" }} /></div>
        <button className="boton" style={{ alignSelf: "end" }}>Buscar</button>
      </form>
      {codigo && (encontrado ? (
        <div className="aviso ok pila"><strong>{encontrado.numero} · {encontrado.clienteNombre}</strong><span>{ETIQUETA_ESTADO[encontrado.estado]}</span>
          <AccionesPedido numero={encontrado.numero} siguientes={siguientesEstados(encontrado)} /></div>
      ) : <div className="aviso error">No hay ningún pedido con el código {codigo.toUpperCase()}.</div>)}
      {pedidos.length ? (
        <div className="tabla"><table>
          <thead><tr><th scope="col">Comanda</th><th scope="col">Cliente</th><th scope="col">Productos</th><th scope="col">Entrega</th><th scope="col">Estado</th><th scope="col" className="num">Cobrado</th><th scope="col">Acciones</th></tr></thead>
          <tbody>{pedidos.map((x) => (
            <tr key={x.numero}>
              <td><Link href={`/pedido/${x.numero}`}>{x.numero}</Link></td>
              <td>{x.clienteNombre}</td>
              <td>{x.items.map((i) => `${i.cantidad}× ${i.nombre} ${i.pesoGramos >= 1000 ? "1 kg" : i.pesoGramos + " g"} · ${i.molienda}`).join("; ")}</td>
              <td>{x.entrega.tipo === "envio" ? "Envío" : <>Retiro <span className="dato">{x.entrega.codigoRetiro}</span></>}</td>
              <td><span className="chip">{ETIQUETA_ESTADO[x.estado]}</span></td>
              <td className="num">{formatoPesos(x.total)}</td>
              <td><AccionesPedido numero={x.numero} siguientes={siguientesEstados(x)} /></td>
            </tr>
          ))}</tbody>
        </table></div>
      ) : <div className="vacio">Todavía no hay pedidos. Hacé una compra de prueba desde la tienda.</div>}
    </>
  );
}
