# Reglas de negocio

## 1. La última unidad (concurrencia, "la butaca del cine")

Dos personas quieren la última bolsa de 1 kg al mismo tiempo. Solo una puede comprarla, y la otra tiene que enterarse antes de pagar.

| Paso | Regla |
| --- | --- |
| Agregar al carrito | Se valida contra el stock disponible, pero **no se reserva**: agregar no compromete nada. |
| Iniciar el pago | Se **reserva** con una operación atómica: "si disponible ≥ cantidad, sumá a reservado; si no, rechazá". Verificar y reservar es un solo paso. |
| Varias presentaciones | Todo o nada: si una no alcanza, no se reserva ninguna. |
| Pago aprobado | La reserva se confirma: baja el stock y la reserva. Es idempotente: un aviso de pago repetido no descuenta dos veces. |
| Pago rechazado o abandono | La reserva se libera. Si nadie paga en **30 minutos**, vence sola. |
| Pago que llega tarde | Si la reserva ya venció, no se confirma automáticamente: queda para reembolso o revisión manual. |

Dónde vive:

- **Mock:** `src/domain/inventario.ts`, probado en `tests/inventario.test.ts` (dos reservas en paralelo de la última unidad → una sola pasa).
- **Shopify:** el checkout valida el inventario al completar la compra; con "Seguir vendiendo sin stock" desactivado,
  la segunda persona recibe "sin stock" y no se le cobra.
- **Si algún día hay base propia (PostgreSQL):** `UPDATE variantes SET reservado = reservado + $n WHERE id = $id AND stock - reservado >= $n RETURNING id;`
  dentro de una transacción. Cero filas = sin stock.

## 2. Molienda

- Es una opción de la línea del carrito, no una variante: no tiene stock propio.
- Se elige obligatoriamente en la ficha y se puede **cambiar desde el carrito**.
  Si al cambiarla queda igual a otra línea (misma presentación y molienda), las líneas se unen sumando cantidades.
- En Shopify viaja como atributo de la línea: `Molienda` (visible en el pedido) y `_molienda_id` (interno).

## 3. Comanda y entrega

La comanda muestra: nombre de la empresa, número (LC-00001), cliente, productos con su molienda, monto cobrado y medio de pago, forma de entrega y dónde está el pedido.

| Envío | Retiro en punto de entrega |
| --- | --- |
| Pagado → En preparación → **En camino** (exige número de seguimiento) → Entregado | Pagado → En preparación → **Listo para retirar** → Retirado |
| El cliente ve el código de seguimiento | El cliente ve un **código de 6 caracteres** (sin 0/O ni 1/I) que muestra en el punto |

En el panel, el socio busca por código de retiro y marca la entrega. No se puede saltar pasos (de Pagado a Entregado) ni marcar En camino sin tracking.

## 4. Etiqueta

Se genera con la ficha del café: SCA en la cabecera, nombre del origen grande, notas, tueste (la cruz en el círculo elegido),
variedad, altitud y peso neto en gramos y onzas según la presentación. El origen no se repite en otra celda.

## 5. Cuenta obligatoria

Se navega y se arma el carrito sin cuenta. Para pagar hay que ingresar o registrarse; el carrito se conserva.
