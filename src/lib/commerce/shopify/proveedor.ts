import "server-only";
import { cambiarMolienda } from "@/domain/carrito";
import type { Cafe, Carrito, FichaEditable, Molienda, PerfilTaza, Tueste, Variante } from "@/domain/types";
import type { CommerceProvider } from "../types";
import { admin, storefront } from "./cliente";
import * as Q from "./consultas";

/* ---------- Tipos de la respuesta de Shopify (solo lo que usamos) ---------- */
interface SVariante {
  id: string; sku: string | null; availableForSale: boolean; quantityAvailable: number | null;
  price: { amount: string }; weight: number | null; weightUnit: "GRAMS" | "KILOGRAMS" | "OUNCES" | "POUNDS";
}
interface SProducto {
  id: string; handle: string; title: string; description: string;
  featuredImage: { url: string } | null;
  variants: { nodes: SVariante[] };
  metafields: ({ key: string; value: string } | null)[];
}
interface SLinea {
  id: string; quantity: number; attributes: { key: string; value: string }[];
  merchandise: SVariante & { product: { handle: string; title: string; featuredImage: { url: string } | null } };
}
interface SCarrito {
  id: string; checkoutUrl: string; totalQuantity: number;
  cost: { subtotalAmount: { amount: string } };
  lines: { nodes: SLinea[] };
}
type ConErrores<K extends string, T> = Record<K, { cart: T | null; userErrors: { message: string }[] }>;

/* ---------- Traducción Shopify -> dominio ---------- */
const ATRIB_MOLIENDA_ID = "_molienda_id"; // con "_" Shopify lo oculta en el checkout
const ATRIB_MOLIENDA = "Molienda"; // visible para el cliente y en el pedido del admin

function gramos(v: SVariante): number {
  const w = v.weight ?? 0;
  const factor = { GRAMS: 1, KILOGRAMS: 1000, OUNCES: 28.3495, POUNDS: 453.592 }[v.weightUnit] ?? 1;
  return Math.round(w * factor);
}

function variante(v: SVariante): Variante {
  return {
    id: v.id,
    sku: v.sku ?? "",
    pesoGramos: gramos(v),
    precio: Number(v.price.amount),
    // quantityAvailable requiere el permiso unauthenticated_read_product_inventory en el canal Headless.
    disponible: v.quantityAvailable ?? (v.availableForSale ? 99 : 0),
  };
}

function mf(p: SProducto) {
  const m = new Map(p.metafields.filter(Boolean).map((x) => [x!.key, x!.value]));
  const json = <T,>(k: string, def: T): T => {
    try { return m.has(k) ? (JSON.parse(m.get(k)!) as T) : def; } catch { return def; }
  };
  return { texto: (k: string) => m.get(k) ?? "", num: (k: string) => (m.has(k) ? Number(m.get(k)) : null), json };
}

function cafe(p: SProducto): Cafe {
  const m = mf(p);
  return {
    id: p.id,
    slug: p.handle,
    nombre: p.title,
    descripcion: p.description,
    imagen: p.featuredImage?.url ?? "",
    imagenEtiqueta: m.texto("imagen_etiqueta") || undefined,
    publicado: true, // la Storefront API solo devuelve productos publicados en el canal
    sca: m.num("sca"),
    scaFuente: m.texto("sca_fuente"),
    pais: m.texto("pais"),
    region: m.texto("region"),
    productor: m.texto("productor"),
    fincas: m.json("fincas", []),
    variedad: m.texto("variedad"),
    altitud: m.num("altitud"),
    proceso: m.texto("proceso"),
    tueste: (m.num("tueste") ?? 3) as Tueste,
    notas: m.json("notas", []),
    preparacion: m.json("preparacion", []),
    perfil: m.json<PerfilTaza | null>("perfil", null),
    variantes: p.variants.nodes.map(variante).sort((a, b) => a.pesoGramos - b.pesoGramos),
  };
}

function carrito(c: SCarrito): Carrito {
  const lineas = c.lines.nodes.map((l) => {
    const attr = Object.fromEntries(l.attributes.map((a) => [a.key, a.value]));
    const v = variante(l.merchandise);
    return {
      id: l.id,
      varianteId: v.id,
      moliendaId: attr[ATRIB_MOLIENDA_ID] ?? "",
      cantidad: l.quantity,
      cafe: { nombre: l.merchandise.product.title, slug: l.merchandise.product.handle, imagen: l.merchandise.product.featuredImage?.url ?? "" },
      variante: v,
      molienda: { id: attr[ATRIB_MOLIENDA_ID] ?? "", nombre: attr[ATRIB_MOLIENDA] ?? "Sin molienda" },
      subtotal: v.precio * l.quantity,
    };
  });
  return { id: c.id, lineas, subtotal: Number(c.cost.subtotalAmount.amount), cantidadTotal: c.totalQuantity, checkoutUrl: c.checkoutUrl };
}

function sinErrores<T>(r: { cart: T | null; userErrors: { message: string }[] }): T {
  if (r.userErrors.length || !r.cart) throw new Error(r.userErrors.map((e) => e.message).join("; ") || "Shopify no devolvió el carrito.");
  return r.cart;
}

async function moliendas(): Promise<Molienda[]> {
  const d = await storefront<{ metaobjects: { nodes: { id: string; fields: { key: string; value: string }[] }[] } }>(Q.Q_MOLIENDAS, {}, 300);
  return d.metaobjects.nodes
    .map((n) => {
      const f = Object.fromEntries(n.fields.map((x) => [x.key, x.value]));
      return { id: n.id, nombre: f.nombre ?? "", metodo: f.metodo ?? "", activa: f.activa !== "false", orden: Number(f.orden ?? 99) };
    })
    .filter((m) => m.activa)
    .sort((a, b) => a.orden - b.orden);
}

async function lineaInput(varianteId: string, moliendaId: string, cantidad: number) {
  const mol = (await moliendas()).find((m) => m.id === moliendaId);
  if (!mol) throw new Error("Elegí una molienda disponible.");
  return {
    merchandiseId: varianteId,
    quantity: cantidad,
    attributes: [{ key: ATRIB_MOLIENDA, value: mol.nombre }, { key: ATRIB_MOLIENDA_ID, value: mol.id }],
  };
}

/* ---------- Proveedor ---------- */
export const proveedorShopify: CommerceProvider = {
  nombre: "shopify",

  async listarCafes() {
    const d = await storefront<{ products: { nodes: SProducto[] } }>(Q.Q_PRODUCTOS, {}, 60);
    return d.products.nodes.map(cafe);
  },
  async obtenerCafe(slug) {
    const d = await storefront<{ product: SProducto | null }>(Q.Q_PRODUCTO, { handle: slug }, 60);
    return d.product ? cafe(d.product) : null;
  },
  listarMoliendas: moliendas,

  async obtenerCarrito(id) {
    if (!id) return null;
    const d = await storefront<{ cart: SCarrito | null }>(Q.Q_CARRITO, { id });
    return d.cart ? carrito(d.cart) : null;
  },
  async agregarAlCarrito(id, varianteId, moliendaId, cantidad) {
    const lineas = [await lineaInput(varianteId, moliendaId, cantidad)];
    if (id) {
      const d = await storefront<ConErrores<"cartLinesAdd", SCarrito>>(Q.M_AGREGAR, { id, lineas });
      return carrito(sinErrores(d.cartLinesAdd));
    }
    const d = await storefront<ConErrores<"cartCreate", SCarrito>>(Q.M_CREAR_CARRITO, { lineas });
    return carrito(sinErrores(d.cartCreate));
  },
  async actualizarLinea(id, lineaId, cambios) {
    const actual = await this.obtenerCarrito(id);
    if (!actual) throw new Error("No encontramos tu carrito.");
    if (cambios.moliendaId) {
      // Misma regla que el mock: si ya hay una línea igual con esa molienda, se unen.
      const nuevas = cambiarMolienda(actual.lineas, lineaId, cambios.moliendaId);
      const linea0 = actual.lineas.find((l) => l.id === lineaId)!;
      const gemela = nuevas.find((l) => l.id !== lineaId && l.varianteId === linea0.varianteId && l.moliendaId === cambios.moliendaId);
      if (gemela) {
        await storefront(Q.M_ACTUALIZAR, { id, lineas: [{ id: gemela.id, quantity: gemela.cantidad }] });
        const d = await storefront<ConErrores<"cartLinesRemove", SCarrito>>(Q.M_QUITAR, { id, ids: [lineaId] });
        return carrito(sinErrores(d.cartLinesRemove));
      }
      const linea = actual.lineas.find((l) => l.id === lineaId)!;
      const input = await lineaInput(linea.varianteId, cambios.moliendaId, cambios.cantidad ?? linea.cantidad);
      const d = await storefront<ConErrores<"cartLinesUpdate", SCarrito>>(Q.M_ACTUALIZAR, {
        id, lineas: [{ id: lineaId, quantity: input.quantity, attributes: input.attributes }],
      });
      return carrito(sinErrores(d.cartLinesUpdate));
    }
    const d = await storefront<ConErrores<"cartLinesUpdate", SCarrito>>(Q.M_ACTUALIZAR, {
      id, lineas: [{ id: lineaId, quantity: cambios.cantidad ?? 1 }],
    });
    return carrito(sinErrores(d.cartLinesUpdate));
  },
  async quitarLinea(id, lineaId) {
    const d = await storefront<ConErrores<"cartLinesRemove", SCarrito>>(Q.M_QUITAR, { id, ids: [lineaId] });
    return carrito(sinErrores(d.cartLinesRemove));
  },

  async iniciarCheckout(id, cliente) {
    // El checkout de Shopify cobra (Mercado Pago o, en pruebas, Bogus Gateway), valida stock y crea el pedido.
    // TODO fase 2: asociar la sesión del cliente con la Customer Account API en lugar de solo el email.
    const d = await storefront<{ cartBuyerIdentityUpdate: { cart: { checkoutUrl: string } | null; userErrors: { message: string }[] } }>(
      Q.M_COMPRADOR, { id, comprador: { email: cliente.email } },
    );
    const r = d.cartBuyerIdentityUpdate;
    if (r.userErrors.length || !r.cart) return { tipo: "error", mensaje: r.userErrors.map((e) => e.message).join("; ") };
    return { tipo: "redireccion", url: r.cart.checkoutUrl };
  },

  async guardarFicha(cafeId, ficha: FichaEditable) {
    const valores: [string, string, string | null][] = [
      ["sca", "number_decimal", ficha.sca == null ? null : String(ficha.sca)],
      ["sca_fuente", "single_line_text_field", ficha.scaFuente || null],
      ["pais", "single_line_text_field", ficha.pais || null],
      ["region", "single_line_text_field", ficha.region || null],
      ["productor", "single_line_text_field", ficha.productor || null],
      ["variedad", "single_line_text_field", ficha.variedad || null],
      ["proceso", "single_line_text_field", ficha.proceso || null],
      ["altitud", "number_integer", ficha.altitud == null ? null : String(ficha.altitud)],
      ["tueste", "number_integer", String(ficha.tueste)],
      ["notas", "list.single_line_text_field", ficha.notas.length ? JSON.stringify(ficha.notas) : null],
      ["preparacion", "list.single_line_text_field", ficha.preparacion.length ? JSON.stringify(ficha.preparacion) : null],
      ["fincas", "json", ficha.fincas.length ? JSON.stringify(ficha.fincas) : null],
      ["perfil", "json", ficha.perfil ? JSON.stringify(ficha.perfil) : null],
    ];
    const set = valores.filter(([, , v]) => v != null).map(([key, type, value]) => ({ ownerId: cafeId, namespace: "latitud", key, type, value }));
    const borrar = valores.filter(([, , v]) => v == null).map(([key]) => ({ ownerId: cafeId, namespace: "latitud", key }));
    const r = await admin<{ metafieldsSet: { userErrors: { message: string }[] } }>(Q.M_METAFIELDS_SET, { metafields: set });
    if (r.metafieldsSet.userErrors.length) throw new Error(r.metafieldsSet.userErrors.map((e) => e.message).join("; "));
    if (borrar.length) await admin(Q.M_METAFIELDS_DELETE, { metafields: borrar });
  },
  // Pedidos: se gestionan en el admin de Shopify (fase 1). La comanda del cliente llega con la Customer Account API (fase 2).
};
