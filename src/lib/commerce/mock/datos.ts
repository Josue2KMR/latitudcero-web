import type { Cafe, Molienda } from "@/domain/types";

/**
 * Datos de ejemplo. Lo que dice "ejemplo" (SCA, perfil, precios, stock) lo reemplaza el dueño.
 * Fuente de los datos reales de Ecuador: la etiqueta impresa (Typica, 1800 m, tueste 2 de 5).
 */
export const CAFES_INICIALES: Cafe[] = [
  {
    id: "cafe_ecuador",
    slug: "ecuador",
    nombre: "Ecuador",
    descripcion:
      "Café de altura de la línea ecuatorial, el origen que le da nombre a la marca. Dulce y redondo, para filtrados y espressos suaves.",
    imagen: "/productos/ecuador-bolsa.jpg",
    imagenEtiqueta: "/productos/ecuador-etiqueta.jpg",
    publicado: true,
    sca: 86,
    scaFuente: "Valor de ejemplo: lo carga el tostador",
    pais: "Ecuador",
    region: "",
    productor: "",
    fincas: [],
    variedad: "Typica",
    altitud: 1800,
    proceso: "",
    tueste: 2,
    notas: ["Vanilla", "Cotton", "Coffee", "Cognac", "Chocolate"],
    preparacion: ["Filtro (V60, Chemex)", "Espresso", "Prensa francesa"],
    perfil: { acidez: 3, dulzor: 4, cuerpo: 3, amargor: 2, esEjemplo: true },
    variantes: [
      { id: "var_ecu_250", sku: "LC-ECU-250", pesoGramos: 250, precio: 690, disponible: 40 },
      { id: "var_ecu_1000", sku: "LC-ECU-1000", pesoGramos: 1000, precio: 2490, disponible: 3 },
    ],
  },
];

export const MOLIENDAS_INICIALES: Molienda[] = [
  { id: "mol_grano", nombre: "En grano", metodo: "Para moler en casa", activa: true, orden: 1 },
  { id: "mol_fina", nombre: "Fina", metodo: "Espresso", activa: true, orden: 2 },
  { id: "mol_media_fina", nombre: "Media-fina", metodo: "Moka y Aeropress", activa: true, orden: 3 },
  { id: "mol_media", nombre: "Media", metodo: "Filtro: V60, Chemex, goteo", activa: true, orden: 4 },
  { id: "mol_gruesa", nombre: "Gruesa", metodo: "Prensa francesa y cold brew", activa: true, orden: 5 },
];

export const PUNTO_RETIRO = "Punto de retiro Latitud Cero, Montevideo (dirección a confirmar)";
export const COSTO_ENVIO = 190;
export const ENVIO_GRATIS_DESDE = 3000;
