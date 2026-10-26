import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Sesión de la fase 1: cookie firmada con HMAC (HttpOnly, SameSite=Lax, Secure en producción).
 * Usuarios en memoria con contraseña hasheada con scrypt.
 * Fase 2: clientes con la Customer Account API de Shopify y socios con Supabase Auth.
 * El resto de la app usa solo `usuarioActual()` y `exigirRol()`, así el cambio no toca páginas.
 */

export type Rol = "cliente" | "operador" | "admin";
export interface Usuario { email: string; nombre: string; apellido: string; celular: string; rol: Rol }
interface UsuarioGuardado extends Usuario { hash: string; sal: string }

const COOKIE = "lc_sesion";
const g = globalThis as unknown as { __latitudUsuarios?: Map<string, UsuarioGuardado> };

function hashear(clave: string, sal = randomBytes(16).toString("hex")) {
  return { sal, hash: scryptSync(clave, sal, 32).toString("hex") };
}

function usuarios() {
  if (!g.__latitudUsuarios) {
    g.__latitudUsuarios = new Map();
    const demo: [Usuario, string][] = [
      [{ email: "cliente@ejemplo.uy", nombre: "Lucía", apellido: "Pereira", celular: "099123456", rol: "cliente" }, "Cliente2026!"],
      [{ email: "admin@latitudcero.uy", nombre: "Socio", apellido: "Administrador", celular: "", rol: "admin" }, "Latitud2026!"],
      [{ email: "operador@latitudcero.uy", nombre: "Socio", apellido: "Operador", celular: "", rol: "operador" }, "Operador2026!"],
    ];
    for (const [u, clave] of demo) g.__latitudUsuarios.set(u.email, { ...u, ...hashear(clave) });
  }
  return g.__latitudUsuarios;
}

function secreto() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET debe tener al menos 32 caracteres.");
    return "solo-desarrollo-no-usar-en-produccion-0000";
  }
  return s;
}

function firmar(valor: string) {
  return createHmac("sha256", secreto()).update(valor).digest("base64url");
}

export async function usuarioActual(): Promise<Usuario | null> {
  const c = (await cookies()).get(COOKIE)?.value;
  if (!c) return null;
  const [email64, firma] = c.split(".");
  if (!email64 || !firma) return null;
  const esperado = Buffer.from(firmar(email64));
  const recibido = Buffer.from(firma);
  if (esperado.length !== recibido.length || !timingSafeEqual(esperado, recibido)) return null;
  const u = usuarios().get(Buffer.from(email64, "base64url").toString());
  if (!u) return null;
  const { hash: _h, sal: _s, ...publico } = u;
  return publico;
}

async function abrirSesion(email: string) {
  const email64 = Buffer.from(email).toString("base64url");
  (await cookies()).set(COOKIE, `${email64}.${firmar(email64)}`, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30,
  });
}

export async function cerrarSesion() {
  (await cookies()).delete(COOKIE);
}

export async function ingresar(email: string, clave: string): Promise<string | null> {
  const u = usuarios().get(email.trim().toLowerCase());
  if (!u) return "Email o contraseña incorrectos.";
  const { hash } = hashear(clave, u.sal);
  if (!timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(u.hash, "hex"))) return "Email o contraseña incorrectos.";
  await abrirSesion(u.email);
  return null;
}

export type ErroresRegistro = Partial<Record<"nombre" | "apellido" | "email" | "celular" | "clave" | "clave2" | "terminos", string>>;

export async function registrar(d: { nombre: string; apellido: string; email: string; celular: string; clave: string; clave2: string; terminos: boolean }): Promise<ErroresRegistro | null> {
  const e: ErroresRegistro = {};
  const email = d.email.trim().toLowerCase();
  if (!d.nombre.trim()) e.nombre = "Ingresá tu nombre.";
  if (!d.apellido.trim()) e.apellido = "Ingresá tu apellido.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e.email = "Ingresá un email válido, por ejemplo nombre@correo.com.";
  else if (usuarios().has(email)) e.email = "Ya hay una cuenta con ese email. Ingresá con ella.";
  if (!/^[0-9 +()-]{8,}$/.test(d.celular)) e.celular = "Ingresá un celular de al menos 8 dígitos.";
  if (d.clave.length < 8 || !/\d/.test(d.clave) || !/[a-z]/i.test(d.clave)) e.clave = "Usá 8 o más caracteres, con letras y números.";
  if (d.clave !== d.clave2) e.clave2 = "Las contraseñas no coinciden.";
  if (!d.terminos) e.terminos = "Aceptá los términos para crear la cuenta.";
  if (Object.keys(e).length) return e;
  usuarios().set(email, { email, nombre: d.nombre.trim(), apellido: d.apellido.trim(), celular: d.celular.trim(), rol: "cliente", ...hashear(d.clave) });
  await abrirSesion(email);
  return null;
}

export function esSocio(u: Usuario | null): boolean {
  return u?.rol === "admin" || u?.rol === "operador";
}
