// script.test.js
const { calculateFinalPrice } = require("./script");

describe("Pruebas de la función calculateFinalPrice", () => {
  // Caso de prueba 1: Caso base (10% descuento, 21% IVA)
  test("debe calcular correctamente el precio con 10% desc y 21% IVA", () => {
    // 100.00 * (1 - 0.10) = 90.00 (Descuento)
    // 90.00 * (1 + 0.21) = 108.90 (IVA)
    const result = calculateFinalPrice(100, 10, 21);
    expect(result.discountedPrice).toBe(90.0);
    expect(result.finalPrice).toBe(108.9);
  });

  // Caso de prueba 2: Solo IVA (0% descuento)
  test("debe calcular solo el IVA si el descuento es 0%", () => {
    // 50.00 * (1 + 0.04) = 52.00
    const result = calculateFinalPrice(50, 0, 4);
    expect(result.discountedPrice).toBe(50.0);
    expect(result.finalPrice).toBe(52.0);
  });

  // Caso de prueba 3: Descuento total (100%)
  test("debe resultar en 0.00 si el descuento es 100%", () => {
    const result = calculateFinalPrice(1000, 100, 21);
    expect(result.discountedPrice).toBe(0.0);
    expect(result.finalPrice).toBe(0.0);
  });

  // Caso de prueba 4: Pruebas de validación (Negative Testing)
  test("debe lanzar un error si el descuento es mayor a 100%", () => {
    expect(() => calculateFinalPrice(100, 101, 21)).toThrow(
      "El descuento no puede superar el 100%."
    );
  });
});
