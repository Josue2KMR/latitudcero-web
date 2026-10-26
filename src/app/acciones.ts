"use server";
/**
 * Server Actions: todo lo que cambia datos pasa por acá y corre en el servidor.
 * El navegador nunca manda precios ni stock: manda ids y cantidades, y el proveedor decide.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { validarSca } from "@/domain/cafe";
import { dentroDeEcuador } from "@/domain/mapa";
import type { EstadoPedido } from "@/domain/pedido";
import type { FichaEditable, Tueste } from "@/domain/types";
import { cerrarSesion, esSocio, ingresar, registrar, usuarioActual, type ErroresRegistro } from "@/lib/auth/sesion";
import { borrarCarritoId, carritoIdActual, guardarCarritoId } from "@/lib/carrito-cookie";
import { comercio } from "@/lib/commerce";

export type Estado = { ok?: string; error?: string } | null;

const texto = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const mensaje = (e: unknown) => (e instanceof Error ? e.message : "Algo salió mal. Probá de nuevo.");
const rutaSegura = (r: string) => (r.startsWith("/") && !r.startsWith("//") ? r : "/");

/* ---------- Carrito ---------- */
export async function agregarAlCarrito(_: Estado, f: FormData): Promise<Estado> {
  const varianteId = texto(f, "varianteId");
  const moliendaId = texto(f, "moliendaId");
  const cantidad = Math.max(1, Math.min(20, Number(f.get("cantidad")) || 1));
  if (!moliendaId) return { error: "Elegí la molienda antes de agregar." };
  try {
    const carrito = await comercio().agregarAlCarrito(await carritoIdActual(), varianteId, moliendaId, cantidad);
    await guardarCarritoId(carrito.id);
    revalidatePath("/", "layout");
    return { ok: "Agregado al carrito." };
  } catch (e) {
    return { error: mensaje(e) };
  }
}

export async function actualizarLinea(lineaId: string, cambios: { cantidad?: number; moliendaId?: string }): Promise<Estado> {
  const id = await carritoIdActual();
  if (!id) return { error: "Tu carrito venció. Volvé a agregar los productos." };
  try {
    await comercio().actualizarLinea(id, lineaId, cambios);
    revalidatePath("/", "layout");
    return { ok: cambios.moliendaId ? "Molienda actualizada." : "Cantidad actualizada." };
  } catch (e) {
    return { error: mensaje(e) };
  }
}

export async function quitarLinea(lineaId: string): Promise<Estado> {
  const id = await carritoIdActual();
  if (!id) return null;
  await comercio().quitarLinea(id, lineaId);
  revalidatePath("/", "layout");
  return { ok: "Producto quitado." };
}

/* ---------- Cuenta ---------- */
export async function accionIngresar(_: Estado, f: FormData): Promise<Estado> {
  const error = await ingresar(texto(f, "email"), String(f.get("clave") ?? ""));
  if (error) return { error };
  redirect(rutaSegura(texto(f, "siguiente") || "/"));
}

export async function accionRegistrar(_: { errores?: ErroresRegistro } | null, f: FormData) {
  const errores = await registrar({
    nombre: texto(f, "nombre"), apellido: texto(f, "apellido"), email: texto(f, "email"), celular: texto(f, "celular"),
    clave: String(f.get("clave") ?? ""), clave2: String(f.get("clave2") ?? ""), terminos: f.get("terminos") === "on",
  });
  if (errores) return { errores };
  redirect(rutaSegura(texto(f, "siguiente") || "/tienda"));
}

export async function accionSalir() {
  await cerrarSesion();
  redirect("/");
}

/* ---------- Checkout ---------- */
export async function accionCheckout(_: Estado, f: FormData): Promise<Estado> {
  const u = await usuarioActual();
  if (!u) redirect("/ingresar?siguiente=/checkout");
  const id = await carritoIdActual();
  if (!id) return { error: "Tu carrito está vacío." };
  const tipo = texto(f, "entrega") === "retiro" ? "retiro" : "envio";
  const direccion = [texto(f, "calle"), texto(f, "localidad"), texto(f, "departamento")].filter(Boolean).join(", ");
  if (comercio().nombre === "mock" && tipo === "envio" && (!/\d/.test(texto(f, "calle")) || !texto(f, "localidad") || !texto(f, "departamento")))
    return { error: "Completá calle con número, ciudad o barrio y departamento." };

  const r = await comercio().iniciarCheckout(id, {
    email: u.email, nombre: `${u.nombre} ${u.apellido}`,
    entrega: { tipo, direccion },
    resultadoPrueba: texto(f, "resultado") === "rechazado" ? "rechazado" : "aprobado",
  });
  if (r.tipo === "error") return { error: r.mensaje };
  if (r.tipo === "redireccion") redirect(r.url);
  await borrarCarritoId();
  revalidatePath("/", "layout");
  redirect(`/pedido/${r.numero}`);
}

/* ---------- Panel de marca ---------- */
async function exigirSocio(rol?: "admin") {
  const u = await usuarioActual();
  if (!esSocio(u) || (rol && u!.rol !== rol)) throw new Error("No tenés permiso para esta acción.");
  return u!;
}

export async function guardarFicha(cafeId: string, slug: string, ficha: FichaEditable): Promise<Estado> {
  try {
    await exigirSocio("admin");
  } catch (e) {
    return { error: mensaje(e) };
  }
  const errSca = validarSca(ficha.sca);
  if (errSca) return { error: errSca };
  if (![1, 2, 3, 4, 5].includes(ficha.tueste)) return { error: "El tueste va de 1 a 5." };
  if (ficha.altitud != null && (ficha.altitud <= 0 || ficha.altitud > 4000)) return { error: "La altitud va entre 1 y 4000 m." };
  for (const fi of ficha.fincas) {
    if (!fi.nombre.trim()) return { error: "Cada finca necesita un nombre." };
    if (!dentroDeEcuador(fi.lat, fi.lng)) return { error: `La ubicación de ${fi.nombre} queda fuera de Ecuador continental.` };
  }
  if (ficha.perfil) for (const k of ["acidez", "dulzor", "cuerpo", "amargor"] as const) {
    const v = ficha.perfil[k];
    if (!Number.isInteger(v) || v < 0 || v > 5) return { error: "El perfil de taza va de 0 a 5." };
  }
  try {
    await comercio().guardarFicha(cafeId, { ...ficha, tueste: ficha.tueste as Tueste });
    revalidatePath(`/cafe/${slug}`);
    revalidatePath("/tienda");
    return { ok: "Ficha y etiqueta guardadas." };
  } catch (e) {
    return { error: mensaje(e) };
  }
}

export async function cambiarEstadoPedido(numero: string, estado: EstadoPedido, datos?: { trackingEmpresa?: string; trackingCodigo?: string }): Promise<Estado> {
  try {
    await exigirSocio();
    const p = comercio().pedidos;
    if (!p) return { error: "Con Shopify los pedidos se gestionan desde su admin." };
    await p.cambiarEstado(numero, estado, datos);
    revalidatePath("/panel/pedidos");
    revalidatePath(`/pedido/${numero}`);
    return { ok: "Pedido actualizado." };
  } catch (e) {
    return { error: mensaje(e) };
  }
}
