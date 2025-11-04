// script.js

/**
 * @fileoverview Lógica para la calculadora de precio final con descuentos e impuestos.
 * @author Tu Nombre de Alumno
 */

// ##########################################
// LÓGICA CORE: FUNCIÓN DE CÁLCULO
// ##########################################

/**
 * Calcula el precio final de un producto aplicando primero un descuento y luego un impuesto (IVA).
 * @param {number} basePrice El precio inicial del producto. Debe ser positivo.
 * @param {number} discountRate El porcentaje de descuento a aplicar (ej. 10 para 10%). Debe ser entre 0 y 100.
 * @param {number} vatRate El porcentaje de impuesto (IVA) a aplicar (ej. 21 para 21%). Debe ser positivo.
 * @returns {{finalPrice: number, discountedPrice: number}} Un objeto con el precio final (con IVA) y el precio intermedio (solo descuento), redondeados a dos decimales.
 * @throws {Error} Si algún parámetro es inválido (no número, negativo, o descuento > 100).
 */
function calculateFinalPrice(basePrice, discountRate, vatRate) {
  // 1. Validación de parámetros
  if (
    typeof basePrice !== "number" ||
    typeof discountRate !== "number" ||
    typeof vatRate !== "number"
  ) {
    throw new Error("Todos los parámetros deben ser números.");
  }
  if (basePrice < 0 || discountRate < 0 || vatRate < 0) {
    throw new Error("Los precios y tasas deben ser positivos.");
  }
  if (discountRate > 100) {
    throw new Error("El descuento no puede superar el 100%.");
  }

  // 2. Aplicar Descuento
  const discountFactor = 1 - discountRate / 100;
  const discountedPrice = basePrice * discountFactor;

  // 3. Aplicar Impuesto (IVA)
  const vatFactor = 1 + vatRate / 100;
  const finalPrice = discountedPrice * vatFactor;

  // 4. Retorna el resultado redondeado a dos decimales
  return {
    finalPrice: parseFloat(finalPrice.toFixed(2)),
    discountedPrice: parseFloat(discountedPrice.toFixed(2)),
  };
}

// EXPORTACIÓN CORREGIDA: Solo se exporta en el entorno de Node.js (para Jest)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { calculateFinalPrice };
}

// ##########################################
// LÓGICA DE INTERFAZ DE USUARIO (Frontend)
// ##########################################

// Sólo se ejecuta en el navegador
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    // 1. Obtener Referencias de Elementos
    const basePriceInput = document.getElementById("basePrice");
    const discountInput = document.getElementById("discount");
    const vatRateInput = document.getElementById("vatRate");
    const calculateBtn = document.getElementById("calculate-btn");
    const discountedPriceDisplay = document.getElementById("discounted-price");
    const finalAmountDisplay = document.getElementById("final-amount");

    function updateResults() {
      try {
        // 2. LEER Y CONVERTIR VALORES
        const basePrice = parseFloat(basePriceInput.value);
        const discountRate = parseFloat(discountInput.value);
        const vatRate = parseFloat(vatRateInput.value);

        // Verificación de seguridad para inputs vacíos
        if (isNaN(basePrice) || isNaN(discountRate) || isNaN(vatRate)) {
          // Muestra los valores por defecto o un mensaje si falla
          discountedPriceDisplay.textContent = "0.00 €";
          finalAmountDisplay.textContent = "0.00 €";
          return;
        }

        // Llama a la función core
        const results = calculateFinalPrice(basePrice, discountRate, vatRate);

        // Formateo de salida a moneda
        const formatter = new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "EUR",
        });

        discountedPriceDisplay.textContent = formatter.format(
          results.discountedPrice
        );
        finalAmountDisplay.textContent = formatter.format(results.finalPrice);
      } catch (error) {
        // Muestra el error de validación en la interfaz
        discountedPriceDisplay.textContent = "Error";
        finalAmountDisplay.textContent = `Error: ${error.message}`;
        console.error("Error de cálculo:", error.message);
      }
    }

    // 3. Configurar Listeners
    calculateBtn.addEventListener("click", updateResults);
    basePriceInput.addEventListener("input", updateResults);
    discountInput.addEventListener("input", updateResults);
    vatRateInput.addEventListener("input", updateResults);

    // 4. Ejecuta el cálculo inicial
    updateResults();
  });
}
