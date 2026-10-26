# ADR 0001 · Shopify headless + Next.js

**Estado:** aceptada · 26/10/2026

## Contexto
Hay que vender 3 cafés en Uruguay con pago online, stock por presentación y envíos, y además una web con identidad propia
(SCA destacado, etiqueta generada, mapa de fincas). El equipo es chico y el cobro no puede fallar.

## Opciones
1. Shopify con tema: rápido, pero el diseño queda limitado al tema.
2. **Shopify headless + Next.js:** Shopify resuelve cobro, stock, pedidos y clientes; el frontend es propio.
3. Código propio completo (FastAPI + PostgreSQL + Mercado Pago directo): control total, pero cobro, stock y seguridad quedan a cargo nuestro.

## Decisión
Opción 2. Lo más riesgoso (cobrar y no sobrevender) queda en Shopify; lo diferencial (diseño, ficha, etiqueta) es código nuestro.

## Consecuencias
- Costo: plan Basic de Shopify + 2 % por proveedor de pago externo + comisión de Mercado Pago + Vercel Pro.
- El dueño opera pedidos, stock y envíos en el admin de Shopify; el panel de marca cubre lo que Shopify no tiene.
- La capa `CommerceProvider` permite desarrollar con datos mock y cambiar de proveedor sin tocar páginas.
