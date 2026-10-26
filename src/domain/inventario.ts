/**
 * REGLA DE CONCURRENCIA — "la última butaca del cine"
 *
 * Dos clientes quieren la última bolsa al mismo tiempo. La regla:
 *   1. Al iniciar el pago se RESERVA el stock con una operación atómica:
 *      "si disponible >= cantidad, sumá a reservado; si no, rechazá". Verificar y reservar
 *      es UN solo paso; nunca "leer, pensar, escribir" por separado.
 *   2. La reserva vence a los 30 minutos si el pago no se aprueba (libera el stock).
 *   3. Con el pago aprobado, la reserva se CONFIRMA: baja el stock físico y la reserva.
 *   4. Pedidos con varias presentaciones: todo o nada. Si una falla, no se reserva ninguna.
 *
 * Esta clase implementa la regla para el proveedor mock (un proceso Node: cada método síncrono
 * corre sin interrupciones, por eso es atómico). En PostgreSQL la misma regla es:
 *   UPDATE variantes SET reservado = reservado + $n
 *   WHERE id = $id AND stock - reservado >= $n RETURNING id;   -- 0 filas = sin stock
 * dentro de una transacción. En Shopify, el checkout valida el inventario al completar la compra
 * y la política "no vender sin stock" impide que la segunda persona pague la última unidad.
 */

export class SinStockError extends Error {
  constructor(public varianteId: string, public disponible: number) {
    super(disponible === 0 ? "Se agotó mientras comprabas." : `Solo quedan ${disponible} unidades.`);
  }
}

interface Registro {
  stock: number;
  reservado: number;
}
interface Reserva {
  id: string;
  items: { varianteId: string; cantidad: number }[];
  venceEn: number;
  estado: "activa" | "confirmada" | "liberada";
}

export class Inventario {
  private registros = new Map<string, Registro>();
  private reservas = new Map<string, Reserva>();
  private seq = 0;

  constructor(inicial: Record<string, number>, private minutosReserva = 30, private reloj: () => number = Date.now) {
    for (const [id, stock] of Object.entries(inicial)) this.registros.set(id, { stock, reservado: 0 });
  }

  disponible(varianteId: string): number {
    this.expirar();
    const r = this.registros.get(varianteId);
    return r ? r.stock - r.reservado : 0;
  }

  /** Paso atómico: valida todo y reserva todo, o no reserva nada. */
  reservar(items: { varianteId: string; cantidad: number }[]): string {
    this.expirar();
    const porVariante = new Map<string, number>();
    for (const it of items) porVariante.set(it.varianteId, (porVariante.get(it.varianteId) ?? 0) + it.cantidad);
    for (const [id, cant] of porVariante) {
      const r = this.registros.get(id);
      const libre = r ? r.stock - r.reservado : 0;
      if (cant > libre) throw new SinStockError(id, Math.max(0, libre));
    }
    for (const [id, cant] of porVariante) this.registros.get(id)!.reservado += cant;
    const id = `res_${++this.seq}`;
    this.reservas.set(id, { id, items, venceEn: this.reloj() + this.minutosReserva * 60_000, estado: "activa" });
    return id;
  }

  /** Pago aprobado: la reserva se vuelve venta. Idempotente (un webhook repetido no descuenta dos veces). */
  confirmar(reservaId: string): void {
    const res = this.reservas.get(reservaId);
    if (!res || res.estado === "confirmada") return;
    if (res.estado === "liberada") throw new Error("La reserva venció antes de que se aprobara el pago.");
    for (const it of res.items) {
      const r = this.registros.get(it.varianteId)!;
      r.reservado -= it.cantidad;
      r.stock -= it.cantidad;
    }
    res.estado = "confirmada";
  }

  liberar(reservaId: string): void {
    const res = this.reservas.get(reservaId);
    if (!res || res.estado !== "activa") return;
    for (const it of res.items) this.registros.get(it.varianteId)!.reservado -= it.cantidad;
    res.estado = "liberada";
  }

  ajustar(varianteId: string, delta: number): void {
    const r = this.registros.get(varianteId) ?? { stock: 0, reservado: 0 };
    if (r.stock + delta < r.reservado) throw new Error("No podés dejar el stock por debajo de lo reservado.");
    r.stock += delta;
    this.registros.set(varianteId, r);
  }

  private expirar() {
    const ahora = this.reloj();
    for (const res of this.reservas.values()) if (res.estado === "activa" && res.venceEn <= ahora) this.liberar(res.id);
  }
}
