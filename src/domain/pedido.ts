/** Pedido visto como una comanda: lo que se cobró, cómo se entrega y dónde está. */

export type TipoEntrega = "envio" | "retiro";

export type EstadoPedido =
  | "pendiente_pago"
  | "pagado"
  | "en_preparacion"
  | "en_camino" // solo envío
  | "listo_para_retirar" // solo retiro
  | "entregado"
  | "cancelado";

export interface ItemPedido {
  nombre: string;
  sku: string;
  pesoGramos: number;
  molienda: string;
  cantidad: number;
  precioUnitario: number;
}

export interface Pedido {
  numero: string; // LC-00001
  clienteEmail: string;
  clienteNombre: string;
  creadoEn: string;
  items: ItemPedido[];
  subtotal: number;
  costoEnvio: number;
  total: number;
  medioPago: string;
  entrega: {
    tipo: TipoEntrega;
    direccion?: string; // envío
    puntoRetiro?: string; // retiro
    codigoRetiro?: string; // se muestra en el ticket
    tracking?: { empresa: string; codigo: string; url?: string };
  };
  estado: EstadoPedido;
  historial: { estado: EstadoPedido; en: string; nota?: string }[];
  reservaId?: string;
}

/** Pasos que ve el cliente en su comanda, según elija envío o retiro. */
export function pasosSeguimiento(tipo: TipoEntrega): { estado: EstadoPedido; titulo: string }[] {
  return tipo === "envio"
    ? [
        { estado: "pagado", titulo: "Pago aprobado" },
        { estado: "en_preparacion", titulo: "Preparando y moliendo" },
        { estado: "en_camino", titulo: "En camino" },
        { estado: "entregado", titulo: "Entregado" },
      ]
    : [
        { estado: "pagado", titulo: "Pago aprobado" },
        { estado: "en_preparacion", titulo: "Preparando y moliendo" },
        { estado: "listo_para_retirar", titulo: "Listo para retirar" },
        { estado: "entregado", titulo: "Retirado" },
      ];
}

/** Transiciones permitidas. El panel solo ofrece estos botones. */
export function siguientesEstados(p: Pedido): EstadoPedido[] {
  const envio = p.entrega.tipo === "envio";
  switch (p.estado) {
    case "pendiente_pago": return ["cancelado"];
    case "pagado": return ["en_preparacion", "cancelado"];
    case "en_preparacion": return [envio ? "en_camino" : "listo_para_retirar", "cancelado"];
    case "en_camino": return ["entregado"];
    case "listo_para_retirar": return ["entregado"];
    default: return [];
  }
}

export function puedeAvanzar(p: Pedido, a: EstadoPedido, datos?: { trackingCodigo?: string }): string | null {
  if (!siguientesEstados(p).includes(a)) return "Ese cambio de estado no está permitido.";
  if (a === "en_camino" && !datos?.trackingCodigo?.trim()) return "Cargá el número de seguimiento antes de marcarlo en camino.";
  return null;
}

/** Código corto para el ticket de retiro: sin letras que se confunden (0/O, 1/I). */
export function generarCodigoRetiro(azar: () => number = Math.random): string {
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "";
  for (let i = 0; i < 6; i++) c += alfabeto[Math.floor(azar() * alfabeto.length)];
  return c;
}

export const ETIQUETA_ESTADO: Record<EstadoPedido, string> = {
  pendiente_pago: "Pendiente de pago",
  pagado: "Pagado",
  en_preparacion: "En preparación",
  en_camino: "En camino",
  listo_para_retirar: "Listo para retirar",
  entregado: "Entregado",
  cancelado: "Cancelado",
};
