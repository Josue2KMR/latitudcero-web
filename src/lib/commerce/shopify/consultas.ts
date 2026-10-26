/** Consultas GraphQL de Shopify. Namespace de metafields de la marca: "latitud". */

export const CLAVES_METAFIELDS = [
  "sca", "sca_fuente", "pais", "region", "productor", "fincas", "variedad",
  "altitud", "proceso", "tueste", "notas", "preparacion", "perfil", "imagen_etiqueta",
] as const;

const IDENTIFICADORES = CLAVES_METAFIELDS.map((k) => `{namespace: "latitud", key: "${k}"}`).join(", ");

const VARIANTE = `
  id sku availableForSale quantityAvailable
  price { amount }
  weight weightUnit
`;

export const PRODUCTO = `
  id handle title description
  featuredImage { url }
  variants(first: 10) { nodes { ${VARIANTE} } }
  metafields(identifiers: [${IDENTIFICADORES}]) { key value }
`;

export const Q_PRODUCTOS = `query Productos { products(first: 50) { nodes { ${PRODUCTO} } } }`;
export const Q_PRODUCTO = `query Producto($handle: String!) { product(handle: $handle) { ${PRODUCTO} } }`;

export const Q_MOLIENDAS = `query Moliendas {
  metaobjects(type: "latitud_molienda", first: 20) { nodes { id fields { key value } } }
}`;

const CARRITO = `
  id checkoutUrl totalQuantity
  cost { subtotalAmount { amount } }
  lines(first: 50) { nodes {
    id quantity
    attributes { key value }
    merchandise { ... on ProductVariant { ${VARIANTE} product { handle title featuredImage { url } } } }
  } }
`;

export const Q_CARRITO = `query Carrito($id: ID!) { cart(id: $id) { ${CARRITO} } }`;

export const M_CREAR_CARRITO = `mutation CrearCarrito($lineas: [CartLineInput!]!) {
  cartCreate(input: { lines: $lineas }) { cart { ${CARRITO} } userErrors { field message } }
}`;
export const M_AGREGAR = `mutation Agregar($id: ID!, $lineas: [CartLineInput!]!) {
  cartLinesAdd(cartId: $id, lines: $lineas) { cart { ${CARRITO} } userErrors { field message } }
}`;
export const M_ACTUALIZAR = `mutation Actualizar($id: ID!, $lineas: [CartLineUpdateInput!]!) {
  cartLinesUpdate(cartId: $id, lines: $lineas) { cart { ${CARRITO} } userErrors { field message } }
}`;
export const M_QUITAR = `mutation Quitar($id: ID!, $ids: [ID!]!) {
  cartLinesRemove(cartId: $id, lineIds: $ids) { cart { ${CARRITO} } userErrors { field message } }
}`;
export const M_COMPRADOR = `mutation Comprador($id: ID!, $comprador: CartBuyerIdentityInput!) {
  cartBuyerIdentityUpdate(cartId: $id, buyerIdentity: $comprador) { cart { checkoutUrl } userErrors { field message } }
}`;

// Admin API (panel de marca)
export const M_METAFIELDS_SET = `mutation Guardar($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) { metafields { key } userErrors { field message } }
}`;
export const M_METAFIELDS_DELETE = `mutation Borrar($metafields: [MetafieldIdentifierInput!]!) {
  metafieldsDelete(metafields: $metafields) { deletedMetafields { key } userErrors { field message } }
}`;
