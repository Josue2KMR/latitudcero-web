# ADR 0002 · Next.js (no Vite) y sin Docker por ahora

**Estado:** aceptada · 26/10/2026

## ¿Vite + React o Next.js?
Vite arma una SPA: todo corre en el navegador. Para esta tienda necesitamos código que corra **en el servidor**:
- Los tokens de Shopify (sobre todo el de Admin) no pueden llegar al navegador.
- El catálogo tiene que llegar renderizado para SEO y para que cargue rápido en celulares.
- Las Server Actions validan cada cambio del carrito y del panel en el servidor.

Con Vite habría que sumar un backend aparte para todo eso. Next.js lo trae en el mismo proyecto, y Vercel lo despliega sin configuración.

## ¿Docker?
No hace falta hoy: el proyecto es un solo proceso Node sin base de datos local (los datos viven en Shopify).
`npm install && npm run dev` alcanza, y Vercel no usa Docker.

Lo sumamos cuando aparezca un servicio que sí lo justifique, por ejemplo Supabase local para suscriptores
(`supabase start` usa Docker por debajo) o si se decide alojar fuera de Vercel.
