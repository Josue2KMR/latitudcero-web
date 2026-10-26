import { describe, expect, it } from "vitest";
import { cambiarMolienda } from "@/domain/carrito";
import { categoriaSca, pesoEtiqueta, validarSca } from "@/domain/cafe";
import { desproyectar, dentroDeEcuador, proyectar } from "@/domain/mapa";
import { generarCodigoRetiro, puedeAvanzar, siguientesEstados, type Pedido } from "@/domain/pedido";

describe("SCA y etiqueta", () => {
  it("categoriza el puntaje", () => {
    expect(categoriaSca(79.5)).toBe("Por debajo de especialidad");
    expect(categoriaSca(80)).toBe("Especialidad");
    expect(categoriaSca(86)).toBe("Excelente");
    expect(categoriaSca(90)).toBe("Excepcional");
    expect(validarSca(101)).toMatch(/0 a 100/);
  });
  it("el peso neto sale en gramos y onzas correctos (corrige el 250ml/1.75oz impreso)", () => {
    expect(pesoEtiqueta(250)).toBe("250 g / 8,8 oz");
    expect(pesoEtiqueta(1000)).toBe("1 kg / 35,3 oz");
  });
});

describe("Carrito: cambiar molienda", () => {
  const base = [
    { id: "1", varianteId: "v250", moliendaId: "fina", cantidad: 1 },
    { id: "2", varianteId: "v250", moliendaId: "media", cantidad: 2 },
  ];
  it("cambia la molienda de una línea", () => {
    expect(cambiarMolienda(base, "1", "gruesa").find((l) => l.id === "1")?.moliendaId).toBe("gruesa");
  });
  it("si ya existe la misma presentación con esa molienda, une las líneas", () => {
    const r = cambiarMolienda(base, "1", "media");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ id: "2", moliendaId: "media", cantidad: 3 });
  });
});

describe("Mapa", () => {
  it("proyectar y desproyectar son inversas", () => {
    const { x, y } = proyectar(-1.05, -78.6);
    const p = desproyectar(x, y);
    expect(p.lat).toBeCloseTo(-1.05, 3);
    expect(p.lng).toBeCloseTo(-78.6, 3);
  });
  it("valida que la finca esté en Ecuador continental", () => {
    expect(dentroDeEcuador(-0.2, -78.5)).toBe(true);
    expect(dentroDeEcuador(-34.9, -56.2)).toBe(false); // Montevideo
  });
});

describe("Comanda", () => {
  const pedido = (tipo: "envio" | "retiro", estado: Pedido["estado"]): Pedido => ({
    numero: "LC-00001", clienteEmail: "a@b.uy", clienteNombre: "A", creadoEn: "", items: [], subtotal: 0, costoEnvio: 0, total: 0,
    medioPago: "", entrega: { tipo }, estado, historial: [],
  });
  it("envío pasa por 'en camino'; retiro por 'listo para retirar'", () => {
    expect(siguientesEstados(pedido("envio", "en_preparacion"))).toContain("en_camino");
    expect(siguientesEstados(pedido("retiro", "en_preparacion"))).toContain("listo_para_retirar");
  });
  it("no se marca en camino sin número de seguimiento", () => {
    expect(puedeAvanzar(pedido("envio", "en_preparacion"), "en_camino", {})).toMatch(/seguimiento/);
    expect(puedeAvanzar(pedido("envio", "en_preparacion"), "en_camino", { trackingCodigo: "DAC 123" })).toBeNull();
  });
  it("no se puede saltar de pagado a entregado", () => {
    expect(puedeAvanzar(pedido("retiro", "pagado"), "entregado")).not.toBeNull();
  });
  it("el código de retiro no usa caracteres ambiguos", () => {
    for (let i = 0; i < 200; i++) expect(generarCodigoRetiro()).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
  });
});
