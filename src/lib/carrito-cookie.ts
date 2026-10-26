import "server-only";
import { cookies } from "next/headers";

/** El id del carrito vive en una cookie: el carrito en sí lo guarda el proveedor (Shopify o mock). */
const COOKIE = "lc_carrito";

export async function carritoIdActual(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE)?.value;
}

export async function guardarCarritoId(id: string) {
  (await cookies()).set(COOKIE, id, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 14,
  });
}

export async function borrarCarritoId() {
  (await cookies()).delete(COOKIE);
}
