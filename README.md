# Latitud Cero° — tienda web

Tienda online de café de especialidad para **latitudcero.uy**.
Arquitectura: **Shopify headless + Next.js**. Shopify cobra, guarda el stock y crea los pedidos;
este repo es el frontend con la identidad de la marca y el panel de marca (ficha, etiqueta, fincas).

## Arrancar en 2 minutos (sin Shopify)

```bash
nvm use            # Node 20.9 o más nuevo (probado con 22)
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3000
```

Con `COMMERCE_PROVIDER=mock` la tienda funciona entera con datos de ejemplo en memoria:
catálogo, carrito, registro, checkout con pago simulado, comanda y panel.
Los datos vuelven a cero cada vez que reiniciás `npm run dev`.

Cuentas de prueba: `cliente@ejemplo.uy` / `Cliente2026!` · `admin@latitudcero.uy` / `Latitud2026!` · `operador@latitudcero.uy` / `Operador2026!`

## Conectar Shopify

Paso a paso en [docs/shopify-setup.md](docs/shopify-setup.md): tienda de desarrollo gratis, canal Headless,
tokens, `npm run shopify:setup` para crear los metafields y las moliendas, y pagos de prueba.
Después cambiás `COMMERCE_PROVIDER=shopify` en `.env.local`.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` / `npm start` | Build de producción y servidor |
| `npm test` | Tests de reglas de negocio (Vitest) |
| `npm run typecheck` | Chequeo de tipos de TypeScript |
| `npm run shopify:setup` | Crea metafields `latitud.*` y moliendas en tu tienda Shopify |

## Cómo está organizado

```
src/
  domain/            Reglas del negocio, puras y testeadas. No conocen Shopify ni React.
    inventario.ts    Regla de la última unidad (reserva atómica, vence a los 30 min)
    pedido.ts        Estados de la comanda, envío vs retiro, código de retiro
    carrito.ts       Cambiar molienda (y unir líneas iguales)
    cafe.ts          SCA, tueste, peso neto en g y oz
    mapa.ts          Proyección del mapa de Ecuador (lat/lng <-> punto en pantalla)
  lib/commerce/      Contrato CommerceProvider + dos implementaciones
    mock/            En memoria, para desarrollar sin tienda
    shopify/         Storefront API (catálogo, carrito) y Admin API (metafields del panel)
  lib/auth/          Sesión con cookie firmada (fase 1)
  app/               Rutas de Next.js (App Router) y Server Actions (acciones.ts)
  components/        Componentes de UI (Etiqueta, MapaOrigen, Comanda, EditorFicha…)
  styles/tokens.css  Design tokens: colores, tipografías, espaciado
docs/                Decisiones (ADR), reglas de negocio, setup de Shopify, roadmap
scripts/             Configuración de Shopify por API
tests/               Tests de dominio
```

**Por qué así:** las páginas solo hablan con `comercio()`. Hoy detrás está el mock o Shopify;
si mañana hiciera falta otro proveedor, se agrega una implementación y no se toca ninguna página.
Las reglas que más importan (stock, estados del pedido) viven en `domain/` y tienen tests.

## Decisiones

- [ADR 0001 · Shopify headless](docs/adr/0001-shopify-headless.md)
- [ADR 0002 · Next.js, sin Docker por ahora](docs/adr/0002-nextjs-sin-docker.md)
- [Reglas de negocio](docs/reglas-de-negocio.md) · [Roadmap](docs/roadmap.md)

## Seguridad

- Ningún token llega al navegador: Shopify se llama solo desde el servidor (`server-only`).
- `.env.local` nunca se sube (está en `.gitignore`). En Vercel, las variables van en Project Settings.
- El navegador no manda precios ni stock: manda ids; el servidor y Shopify deciden.
- `npm audit`: 0 vulnerabilidades al 26/10/2026 (Next 16.4.3, React 19.2.9).
