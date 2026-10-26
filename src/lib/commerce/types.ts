import type { Cafe, Carrito, FichaEditable, Molienda } from "@/domain/types";
import type { EstadoPedido, Pedido, TipoEntrega } from "@/domain/pedido";

/**
 * Contrato que usa toda la web. Las páginas nunca hablan con Shopify directo:
 * hablan con un CommerceProvider. Hoy hay dos implementaciones:
 *  - mock: datos en memoria, para desarrollar y probar sin tienda.
 *  - shopify: Storefront API (catálogo y carrito) + Admin API (ficha del panel).
 * Cambiar de proveedor es cambiar COMMERCE_PROVIDER en .env.local.
 */
export interface CommerceProvider {
  readonly nombre: "mock" | "shopify";

  listarCafes(): Promise<Cafe[]>;
  obtenerCafe(slug: string): Promise<Cafe | null>;
  listarMoliendas(): Promise<Molienda[]>;

  obtenerCarrito(carritoId: string | undefined): Promise<Carrito | null>;
  agregarAlCarrito(carritoId: string | undefined, varianteId: string, moliendaId: string, cantidad: number): Promise<Carrito>;
  actualizarLinea(carritoId: string, lineaId: string, cambios: { cantidad?: number; moliendaId?: string }): Promise<Carrito>;
  quitarLinea(carritoId: string, lineaId: string): Promise<Carrito>;

  /** Shopify: devuelve la URL del checkout. Mock: crea la comanda y simula el pago. */
  iniciarCheckout(carritoId: string, cliente: ClienteCheckout): Promise<ResultadoCheckout>;

  /** Panel de marca: guarda la ficha (en Shopify, metafields del producto). */
  guardarFicha(cafeId: string, ficha: FichaEditable): Promise<void>;

  /** Pedidos. En Shopify se gestionan desde su admin; acá queda para el modo mock. */
  pedidos?: PedidosProvider;
}

export interface ClienteCheckout {
  email: string;
  nombre: string;
  entrega: { tipo: TipoEntrega; direccion?: string; puntoRetiro?: string };
  resultadoPrueba?: "aprobado" | "rechazado"; // solo mock
}

export type ResultadoCheckout =
  | { tipo: "redireccion"; url: string }
  | { tipo: "pedido"; numero: string }
  | { tipo: "error"; mensaje: string };

export interface PedidosProvider {
  listar(filtro?: { email?: string }): Promise<Pedido[]>;
  obtener(numero: string): Promise<Pedido | null>;
  buscarPorCodigoRetiro(codigo: string): Promise<Pedido | null>;
  cambiarEstado(numero: string, estado: EstadoPedido, datos?: { trackingEmpresa?: string; trackingCodigo?: string }): Promise<Pedido>;
}
