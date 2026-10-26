import { describe, expect, it } from "vitest";
import { Inventario, SinStockError } from "@/domain/inventario";

describe("Regla de la última unidad (concurrencia)", () => {
  it("dos compras simultáneas de la última bolsa: solo una reserva", async () => {
    const inv = new Inventario({ "ecu-1kg": 1 });
    const intentos = await Promise.allSettled([
      Promise.resolve().then(() => inv.reservar([{ varianteId: "ecu-1kg", cantidad: 1 }])),
      Promise.resolve().then(() => inv.reservar([{ varianteId: "ecu-1kg", cantidad: 1 }])),
    ]);
    expect(intentos.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    const fallido = intentos.find((r) => r.status === "rejected") as PromiseRejectedResult;
    expect(fallido.reason).toBeInstanceOf(SinStockError);
    expect(inv.disponible("ecu-1kg")).toBe(0);
  });

  it("todo o nada: si una presentación no alcanza, no reserva ninguna", () => {
    const inv = new Inventario({ a: 5, b: 1 });
    expect(() => inv.reservar([{ varianteId: "a", cantidad: 2 }, { varianteId: "b", cantidad: 2 }])).toThrow(SinStockError);
    expect(inv.disponible("a")).toBe(5);
    expect(inv.disponible("b")).toBe(1);
  });

  it("la reserva vence a los 30 minutos y libera el stock", () => {
    let ahora = 0;
    const inv = new Inventario({ a: 1 }, 30, () => ahora);
    inv.reservar([{ varianteId: "a", cantidad: 1 }]);
    expect(inv.disponible("a")).toBe(0);
    ahora = 31 * 60_000;
    expect(inv.disponible("a")).toBe(1);
  });

  it("confirmar es idempotente: un webhook repetido no descuenta dos veces", () => {
    const inv = new Inventario({ a: 3 });
    const r = inv.reservar([{ varianteId: "a", cantidad: 2 }]);
    inv.confirmar(r);
    inv.confirmar(r);
    expect(inv.disponible("a")).toBe(1);
  });

  it("no se puede confirmar un pago que llegó después de vencida la reserva", () => {
    let ahora = 0;
    const inv = new Inventario({ a: 1 }, 30, () => ahora);
    const r = inv.reservar([{ varianteId: "a", cantidad: 1 }]);
    ahora = 31 * 60_000;
    inv.disponible("a"); // dispara el vencimiento
    expect(() => inv.confirmar(r)).toThrow(/venció/);
  });
});
