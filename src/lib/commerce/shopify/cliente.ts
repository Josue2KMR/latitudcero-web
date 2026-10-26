import "server-only";

/**
 * Clientes GraphQL de Shopify. Se usan SOLO del lado del servidor (Server Components y Server Actions):
 * así ningún token llega al navegador, ni siquiera el de Storefront.
 */

function env(nombre: string): string {
  const v = process.env[nombre];
  if (!v) throw new Error(`Falta la variable ${nombre} en .env.local (ver .env.example).`);
  return v;
}

const version = () => process.env.SHOPIFY_API_VERSION || "2025-07";

interface RespuestaGraphQL<T> {
  data?: T;
  errors?: { message: string }[];
}

async function llamar<T>(url: string, headers: Record<string, string>, query: string, variables: object, cache: RequestInit & { next?: { revalidate?: number; tags?: string[] } }): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ query, variables }),
    ...cache,
  });
  if (!res.ok) throw new Error(`Shopify respondió ${res.status}. Revisá dominio y tokens.`);
  const json = (await res.json()) as RespuestaGraphQL<T>;
  if (json.errors?.length) throw new Error("Shopify: " + json.errors.map((e) => e.message).join("; "));
  return json.data as T;
}

/** Storefront API: catálogo y carrito. `revalidar` en segundos (catálogo cacheado), 0 = sin caché (carrito). */
export function storefront<T>(query: string, variables: object = {}, revalidar = 0): Promise<T> {
  return llamar<T>(
    `https://${env("SHOPIFY_STORE_DOMAIN")}/api/${version()}/graphql.json`,
    { "X-Shopify-Storefront-Access-Token": env("SHOPIFY_STOREFRONT_TOKEN") },
    query,
    variables,
    revalidar > 0 ? { next: { revalidate: revalidar, tags: ["catalogo"] } } : { cache: "no-store" },
  );
}

/** Admin API: solo para el panel de marca (escribir metafields). Token privado. */
export function admin<T>(query: string, variables: object = {}): Promise<T> {
  return llamar<T>(
    `https://${env("SHOPIFY_STORE_DOMAIN")}/admin/api/${version()}/graphql.json`,
    { "X-Shopify-Access-Token": env("SHOPIFY_ADMIN_TOKEN") },
    query,
    variables,
    { cache: "no-store" },
  );
}
