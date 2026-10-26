# Conectar la tienda Shopify (pagos de prueba primero)

Orden recomendado: tienda de desarrollo → productos → metafields → canal Headless → pagos de prueba → `COMMERCE_PROVIDER=shopify`.
Todo esto se puede hacer sin pagar el plan: una **tienda de desarrollo** es gratis y permite pedidos de prueba.
Cuando el cliente confirme, se transfiere la tienda o se crea la definitiva con plan Basic.

> Las pantallas de Shopify cambian seguido. Si algún nombre de menú no coincide, buscalo en el buscador del admin.

## 1. Tienda de desarrollo

1. Creá una cuenta en el panel de desarrolladores de Shopify (Dev Dashboard / Partners).
2. Creá una **tienda de desarrollo** llamada `latitudcero`. El dominio queda `latitudcero.myshopify.com`.
3. Configuración → General: moneda **UYU**, zona horaria **Montevideo**, idioma **español**.

## 2. Productos

Por cada café (hoy solo Ecuador):

- Producto con título, descripción y fotos. Handle (URL) = `ecuador`.
- Opción **Presentación** con valores `250 g` y `1 kg`.
- En cada variante: SKU (`LC-ECU-250`, `LC-ECU-1000`), precio en UYU con IVA, **peso en gramos** (250 / 1000).
- Inventario: **Hacer seguimiento de cantidad** activado y **Seguir vendiendo cuando no haya stock** desactivado.
  Esto es lo que impide vender la última unidad dos veces (ver [reglas de negocio](reglas-de-negocio.md)).
- Publicar el producto en el canal **Headless**.

## 3. App para la Admin API (panel de marca)

Creá una app propia de la tienda con estos permisos de Admin API:
`read_products`, `write_products`, `write_metaobject_definitions`, `write_metaobjects`, `read_orders`.
Copiá el token de acceso de Admin a `SHOPIFY_ADMIN_TOKEN` en `.env.local`. **Nunca** lo pongas en código ni en el navegador.

Después corré una sola vez:

```bash
npm run shopify:setup
```

Crea los metafields `latitud.sca`, `latitud.fincas`, `latitud.perfil`, etc. (con lectura pública en la Storefront API)
y el metaobjeto `latitud_molienda` con las 5 moliendas.

## 4. Canal Headless (Storefront API)

1. Instalá la app **Headless** de Shopify y creá un storefront `latitudcero-web`.
2. En sus permisos de Storefront API activá: lectura de productos, **inventario** (`unauthenticated_read_product_inventory`),
   metaobjetos, carritos y checkout.
3. Copiá el token a `SHOPIFY_STOREFRONT_TOKEN`. Para producción conviene el **token privado**
   (encabezado `Shopify-Storefront-Private-Token`), porque este repo solo llama a Shopify desde el servidor.

## 5. Pagos de prueba

- **Ahora (desarrollo):** Configuración → Pagos → activar **Bogus Gateway (para pruebas)**.
  En el checkout usá la tarjeta número `1` (aprobada), `2` (rechazada) o `3` (falla). No se cobra nada.
- **Después:** instalar la app oficial de **Mercado Pago** y conectar la cuenta del negocio con **credenciales de prueba**
  y usuarios de prueba de Mercado Pago. Shopify Payments no está disponible en Uruguay, por eso Shopify suma un 2 % por usar
  un proveedor externo en el plan Basic.
- **Producción:** credenciales productivas de Mercado Pago, una compra real con reembolso y recién ahí abrir.

## 6. Envío y retiro

- Configuración → Envío y entrega: zona **Montevideo** y zona **Interior** con las tarifas cotizadas al courier.
- **Retiro en tienda (local pickup):** activarlo en la ubicación del punto de retiro, con instrucciones
  ("Mostrá el número de pedido"). En el admin, cada pedido de retiro tiene **Marcar como listo para retirar** y
  **Marcar como retirado**.
- **Seguimiento:** al preparar un envío, cargá número de seguimiento y empresa (DAC y UES van como "Otra", con su URL de seguimiento).
  Shopify le manda el email con el tracking al cliente.

## 7. Activar en el repo

```env
COMMERCE_PROVIDER=shopify
SHOPIFY_STORE_DOMAIN=latitudcero.myshopify.com
SHOPIFY_API_VERSION=2025-07
SHOPIFY_STOREFRONT_TOKEN=...
SHOPIFY_ADMIN_TOKEN=...
```

`npm run dev` → la tienda lee el catálogo real, el carrito vive en Shopify y "Ir al pago seguro" abre el checkout de Shopify.
Revisá en shopify.dev cuál es la versión de API vigente y actualizá `SHOPIFY_API_VERSION` cada trimestre.

## Qué falta para la fase 2

- Comandas y "Tus pedidos" leyendo de Shopify: **Customer Account API** (login del cliente con código por email).
- Confirmar que se puede exigir cuenta antes del checkout con las cuentas nuevas de Shopify.
