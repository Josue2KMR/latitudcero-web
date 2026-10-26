#!/usr/bin/env node
/**
 * Configura la tienda Shopify para Latitud Cero (se corre una vez por tienda):
 *  1. Crea las definiciones de metafields "latitud.*" de los productos (SCA, origen, fincas, perfil...)
 *     con lectura pública en la Storefront API.
 *  2. Crea el tipo de metaobjeto "latitud_molienda" y carga las 5 moliendas iniciales.
 *
 * Uso:  node --env-file=.env.local scripts/shopify-metafields.mjs
 * Requiere SHOPIFY_STORE_DOMAIN y SHOPIFY_ADMIN_TOKEN con los permisos
 * write_products, write_metaobject_definitions y write_metaobjects.
 * Es idempotente: si algo ya existe, lo informa y sigue.
 */

const dominio = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_ADMIN_TOKEN;
const version = process.env.SHOPIFY_API_VERSION || "2025-07";
if (!dominio || !token) {
  console.error("Faltan SHOPIFY_STORE_DOMAIN o SHOPIFY_ADMIN_TOKEN. Corré: node --env-file=.env.local scripts/shopify-metafields.mjs");
  process.exit(1);
}

async function admin(query, variables) {
  const r = await fetch(`https://${dominio}/admin/api/${version}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  const j = await r.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors));
  return j.data;
}

const METAFIELDS = [
  ["sca", "Puntaje SCA", "number_decimal", "Puntaje de cata SCA, 0 a 100", [{ name: "min", value: "0" }, { name: "max", value: "100" }]],
  ["sca_fuente", "Quién cató", "single_line_text_field", "Q Grader o exportador que dio el puntaje"],
  ["pais", "País de origen", "single_line_text_field"],
  ["region", "Provincia o región", "single_line_text_field"],
  ["productor", "Productor", "single_line_text_field"],
  ["fincas", "Fincas en el mapa", "json", 'Lista: [{"nombre":"Hacienda X","lat":-0.8,"lng":-77.7}]'],
  ["variedad", "Variedad", "single_line_text_field"],
  ["altitud", "Altitud (m s.n.m.)", "number_integer", "", [{ name: "min", value: "1" }, { name: "max", value: "4000" }]],
  ["proceso", "Proceso", "single_line_text_field", "Lavado, Natural, Honey u Otro"],
  ["tueste", "Tueste (1 a 5)", "number_integer", "1 claro · 5 oscuro", [{ name: "min", value: "1" }, { name: "max", value: "5" }]],
  ["notas", "Notas de cata", "list.single_line_text_field"],
  ["preparacion", "Recomendado para", "list.single_line_text_field"],
  ["perfil", "Perfil de taza", "json", '{"acidez":3,"dulzor":4,"cuerpo":3,"amargor":2,"esEjemplo":false}'],
  ["imagen_etiqueta", "Imagen de la etiqueta", "url"],
];

const M_DEF = `mutation($d: MetafieldDefinitionInput!) {
  metafieldDefinitionCreate(definition: $d) { createdDefinition { key } userErrors { code message } }
}`;

for (const [key, name, type, description = "", validations = []] of METAFIELDS) {
  const d = await admin(M_DEF, {
    d: { name, namespace: "latitud", key, type, description, ownerType: "PRODUCT", validations, access: { storefront: "PUBLIC_READ" } },
  });
  const e = d.metafieldDefinitionCreate.userErrors;
  console.log(e.length ? `· latitud.${key}: ${e.map((x) => x.message).join("; ")}` : `✓ latitud.${key}`);
}

const M_METAOBJ_DEF = `mutation($d: MetaobjectDefinitionCreateInput!) {
  metaobjectDefinitionCreate(definition: $d) { metaobjectDefinition { type } userErrors { code message } }
}`;
const def = await admin(M_METAOBJ_DEF, {
  d: {
    type: "latitud_molienda",
    name: "Molienda",
    access: { storefront: "PUBLIC_READ" },
    displayNameKey: "nombre",
    fieldDefinitions: [
      { key: "nombre", name: "Nombre", type: "single_line_text_field", required: true },
      { key: "metodo", name: "Método que ve el cliente", type: "single_line_text_field", required: true },
      { key: "orden", name: "Orden", type: "number_integer" },
      { key: "activa", name: "Activa", type: "boolean" },
    ],
  },
});
const eDef = def.metaobjectDefinitionCreate.userErrors;
console.log(eDef.length ? `· latitud_molienda: ${eDef.map((x) => x.message).join("; ")}` : "✓ tipo latitud_molienda");

const MOLIENDAS = [
  ["En grano", "Para moler en casa", 1], ["Fina", "Espresso", 2], ["Media-fina", "Moka y Aeropress", 3],
  ["Media", "Filtro: V60, Chemex, goteo", 4], ["Gruesa", "Prensa francesa y cold brew", 5],
];
const M_UPSERT = `mutation($h: MetaobjectHandleInput!, $m: MetaobjectUpsertInput!) {
  metaobjectUpsert(handle: $h, metaobject: $m) { metaobject { handle } userErrors { message } }
}`;
for (const [nombre, metodo, orden] of MOLIENDAS) {
  const handle = nombre.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-");
  const r = await admin(M_UPSERT, {
    h: { type: "latitud_molienda", handle },
    m: { fields: [{ key: "nombre", value: nombre }, { key: "metodo", value: metodo }, { key: "orden", value: String(orden) }, { key: "activa", value: "true" }] },
  });
  const e = r.metaobjectUpsert.userErrors;
  console.log(e.length ? `· molienda ${nombre}: ${e.map((x) => x.message).join("; ")}` : `✓ molienda ${nombre}`);
}
console.log("\nListo. Cargá los productos (250 g y 1 kg con peso en gramos) y completá los metafields desde el panel de marca.");
