// Tipos del dominio. No dependen de Shopify ni de React: describen el negocio.

export type Tueste = 1 | 2 | 3 | 4 | 5;

export interface PerfilTaza {
  acidez: number; // 0 a 5
  dulzor: number;
  cuerpo: number;
  amargor: number;
  esEjemplo: boolean; // true mientras el tostador no cargue valores reales
}

/** Lugar de cosecha que se marca en el mapa (hacienda, finca o sector). */
export interface Finca {
  nombre: string;
  lat: number;
  lng: number;
}

export interface Variante {
  id: string; // en Shopify: gid://shopify/ProductVariant/...
  sku: string;
  pesoGramos: number;
  precio: number; // UYU, IVA incluido
  disponible: number; // unidades que se pueden vender ahora
}

export interface Cafe {
  id: string; // en Shopify: gid://shopify/Product/...
  slug: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  imagenEtiqueta?: string;
  publicado: boolean;
  sca: number | null;
  scaFuente: string;
  pais: string;
  region: string;
  productor: string;
  fincas: Finca[];
  variedad: string;
  altitud: number | null;
  proceso: string;
  tueste: Tueste;
  notas: string[];
  preparacion: string[];
  perfil: PerfilTaza | null;
  variantes: Variante[];
}

/** Datos de la ficha que el dueño edita en el panel de marca (metafields en Shopify). */
export type FichaEditable = Pick<
  Cafe,
  | "sca" | "scaFuente" | "pais" | "region" | "productor" | "fincas" | "variedad"
  | "altitud" | "proceso" | "tueste" | "notas" | "preparacion" | "perfil"
>;

export interface Molienda {
  id: string;
  nombre: string;
  metodo: string; // lo que ve el cliente: "Prensa francesa y cold brew"
  activa: boolean;
  orden: number;
}

export interface LineaCarrito {
  id: string;
  varianteId: string;
  moliendaId: string;
  cantidad: number;
}

export interface LineaCarritoDetalle extends LineaCarrito {
  cafe: Pick<Cafe, "nombre" | "slug" | "imagen">;
  variante: Variante;
  molienda: Pick<Molienda, "id" | "nombre">;
  subtotal: number;
}

export interface Carrito {
  id: string;
  lineas: LineaCarritoDetalle[];
  subtotal: number;
  cantidadTotal: number;
  checkoutUrl?: string; // solo Shopify
}
