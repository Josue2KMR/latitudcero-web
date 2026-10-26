import "server-only";
import type { CommerceProvider } from "./types";
import { proveedorMock } from "./mock/proveedor";
import { proveedorShopify } from "./shopify/proveedor";

/** Punto único de entrada: el resto de la app pide `comercio()` y no sabe qué hay detrás. */
export function comercio(): CommerceProvider {
  return process.env.COMMERCE_PROVIDER === "shopify" ? proveedorShopify : proveedorMock;
}

export type { CommerceProvider } from "./types";
