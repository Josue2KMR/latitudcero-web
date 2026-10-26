import { cambiarMolienda, unidadesDeVariante } from "@/domain/carrito";
import { Inventario, SinStockError } from "@/domain/inventario";
import { generarCodigoRetiro, puedeAvanzar, type Pedido } from "@/domain/pedido";
import type { Cafe, Carrito, LineaCarrito } from "@/domain/types";
import type { CommerceProvider, PedidosProvider } from "../types";
import { CAFES_INICIALES, COSTO_ENVIO, ENVIO_GRATIS_DESDE, MOLIENDAS_INICIALES, PUNTO_RETIRO } from "./datos";

/**
 * Proveedor en memoria. Vive mientras corre `npm run dev`; al reiniciar vuelve a los datos de ejemplo.
 * Se guarda en globalThis para sobrevivir a la recarga en caliente de Next.
 */
interface Estado {
  cafes: Cafe[];
  moliendas: typeof MOLIENDAS_INICIALES;
  carritos: Map<string, LineaCarrito[]>;
  inventario: Inventario;
  pedidos: Pedido[];
  seq: number;
}
const g = globalThis as unknown as { __latitudMock?: Estado };

function estado(): Estado {
  if (!g.__latitudMock) {
    const cafes = structuredClone(CAFES_INICIALES);
    const stock = Object.fromEntries(cafes.flatMap((c) => c.variantes.map((v) => [v.id, v.disponible])));
    g.__latitudMock = {
      cafes,
      moliendas: structuredClone(MOLIENDAS_INICIALES),
      carritos: new Map(),
      inventario: new Inventario(stock),
      pedidos: [],
      seq: 1,
    };
  }
  return g.__latitudMock;
}

const id = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;

function conStockVivo(c: Cafe): Cafe {
  const inv = estado().inventario;
  return { ...c, variantes: c.variantes.map((v) => ({ ...v, disponible: inv.disponible(v.id) })) };
}

function buscarVariante(varianteId: string) {
  for (const c of estado().cafes) {
    const v = c.variantes.find((x) => x.id === varianteId);
    if (v) return { cafe: c, variante: v };
  }
  return null;
}

function armarCarrito(carritoId: string): Carrito {
  const e = estado();
  const lineas = (e.carritos.get(carritoId) ?? []).flatMap((l) => {
    const hit = buscarVariante(l.varianteId);
    const mol = e.moliendas.find((m) => m.id === l.moliendaId);
    if (!hit || !mol) return [];
    const variante = { ...hit.variante, disponible: e.inventario.disponible(hit.variante.id) };
    return [{
      ...l,
      cafe: { nombre: hit.cafe.nombre, slug: hit.cafe.slug, imagen: hit.cafe.imagen },
      variante,
      molienda: { id: mol.id, nombre: mol.nombre },
      subtotal: variante.precio * l.cantidad,
    }];
  });
  return {
    id: carritoId,
    lineas,
    subtotal: lineas.reduce((a, l) => a + l.subtotal, 0),
    cantidadTotal: lineas.reduce((a, l) => a + l.cantidad, 0),
  };
}

function validarStock(lineas: LineaCarrito[], varianteId: string, excluir?: string, extra = 0) {
  const disponible = estado().inventario.disponible(varianteId);
  if (unidadesDeVariante(lineas, varianteId, excluir) + extra > disponible) throw new SinStockError(varianteId, disponible);
}

const pedidos: PedidosProvider = {
  async listar(filtro) {
    return estado().pedidos.filter((p) => !filtro?.email || p.clienteEmail === filtro.email);
  },
  async obtener(numero) {
    return estado().pedidos.find((p) => p.numero === numero) ?? null;
  },
  async buscarPorCodigoRetiro(codigo) {
    const c = codigo.trim().toUpperCase();
    return estado().pedidos.find((p) => p.entrega.codigoRetiro === c) ?? null;
  },
  async cambiarEstado(numero, nuevo, datos) {
    const p = estado().pedidos.find((x) => x.numero === numero);
    if (!p) throw new Error("No encontramos ese pedido.");
    const error = puedeAvanzar(p, nuevo, datos);
    if (error) throw new Error(error);
    if (nuevo === "en_camino") p.entrega.tracking = { empresa: datos?.trackingEmpresa || "Courier", codigo: datos!.trackingCodigo!.trim() };
    if (nuevo === "cancelado" && p.reservaId) estado().inventario.liberar(p.reservaId);
    p.estado = nuevo;
    p.historial.push({ estado: nuevo, en: new Date().toISOString() });
    return p;
  },
};

export const proveedorMock: CommerceProvider = {
  nombre: "mock",

  async listarCafes() {
    return estado().cafes.filter((c) => c.publicado).map(conStockVivo);
  },
  async obtenerCafe(slug) {
    const c = estado().cafes.find((x) => x.slug === slug);
    return c ? conStockVivo(c) : null;
  },
  async listarMoliendas() {
    return estado().moliendas.filter((m) => m.activa).sort((a, b) => a.orden - b.orden);
  },

  async obtenerCarrito(carritoId) {
    return carritoId && estado().carritos.has(carritoId) ? armarCarrito(carritoId) : null;
  },
  async agregarAlCarrito(carritoId, varianteId, moliendaId, cantidad) {
    const e = estado();
    const cid = carritoId && e.carritos.has(carritoId) ? carritoId : id("cart");
    const lineas = e.carritos.get(cid) ?? [];
    if (!buscarVariante(varianteId)) throw new Error("Esa presentación no existe.");
    if (!e.moliendas.some((m) => m.id === moliendaId && m.activa)) throw new Error("Elegí una molienda disponible.");
    validarStock(lineas, varianteId, undefined, cantidad);
    const igual = lineas.find((l) => l.varianteId === varianteId && l.moliendaId === moliendaId);
    if (igual) igual.cantidad += cantidad;
    else lineas.push({ id: id("line"), varianteId, moliendaId, cantidad });
    e.carritos.set(cid, lineas);
    return armarCarrito(cid);
  },
  async actualizarLinea(carritoId, lineaId, cambios) {
    const e = estado();
    let lineas = e.carritos.get(carritoId) ?? [];
    const linea = lineas.find((l) => l.id === lineaId);
    if (!linea) throw new Error("Esa línea ya no está en el carrito.");
    if (cambios.cantidad != null) {
      if (cambios.cantidad < 1) lineas = lineas.filter((l) => l.id !== lineaId);
      else {
        validarStock(lineas, linea.varianteId, lineaId, cambios.cantidad);
        linea.cantidad = cambios.cantidad;
      }
    }
    if (cambios.moliendaId) lineas = cambiarMolienda(lineas, lineaId, cambios.moliendaId);
    e.carritos.set(carritoId, lineas);
    return armarCarrito(carritoId);
  },
  async quitarLinea(carritoId, lineaId) {
    const e = estado();
    e.carritos.set(carritoId, (e.carritos.get(carritoId) ?? []).filter((l) => l.id !== lineaId));
    return armarCarrito(carritoId);
  },

  async iniciarCheckout(carritoId, cliente) {
    const e = estado();
    const carrito = armarCarrito(carritoId);
    if (!carrito.lineas.length) return { tipo: "error", mensaje: "Tu carrito está vacío." };
    let reservaId: string;
    try {
      reservaId = e.inventario.reservar(carrito.lineas.map((l) => ({ varianteId: l.varianteId, cantidad: l.cantidad })));
    } catch (err) {
      return { tipo: "error", mensaje: err instanceof Error ? err.message : "No hay stock suficiente." };
    }
    const envio = cliente.entrega.tipo === "envio" ? (carrito.subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO) : 0;
    const ahora = new Date().toISOString();
    const pedido: Pedido = {
      numero: `LC-${String(e.seq++).padStart(5, "0")}`,
      clienteEmail: cliente.email,
      clienteNombre: cliente.nombre,
      creadoEn: ahora,
      items: carrito.lineas.map((l) => ({
        nombre: l.cafe.nombre, sku: l.variante.sku, pesoGramos: l.variante.pesoGramos,
        molienda: l.molienda.nombre, cantidad: l.cantidad, precioUnitario: l.variante.precio,
      })),
      subtotal: carrito.subtotal,
      costoEnvio: envio,
      total: carrito.subtotal + envio,
      medioPago: "Mercado Pago (prueba)",
      entrega: cliente.entrega.tipo === "envio"
        ? { tipo: "envio", direccion: cliente.entrega.direccion }
        : { tipo: "retiro", puntoRetiro: PUNTO_RETIRO, codigoRetiro: generarCodigoRetiro() },
      estado: "pendiente_pago",
      historial: [{ estado: "pendiente_pago", en: ahora }],
      reservaId,
    };
    // Simulación del webhook de pago. En Shopify esto lo hace el checkout.
    if (cliente.resultadoPrueba === "rechazado") {
      e.inventario.liberar(reservaId);
      return { tipo: "error", mensaje: "El pago fue rechazado. Probá con otro medio." };
    }
    e.inventario.confirmar(reservaId);
    pedido.estado = "pagado";
    pedido.historial.push({ estado: "pagado", en: new Date().toISOString() });
    e.pedidos.unshift(pedido);
    e.carritos.delete(carritoId);
    return { tipo: "pedido", numero: pedido.numero };
  },

  async guardarFicha(cafeId, ficha) {
    const c = estado().cafes.find((x) => x.id === cafeId);
    if (!c) throw new Error("No encontramos ese café.");
    Object.assign(c, ficha);
  },

  pedidos,
};
