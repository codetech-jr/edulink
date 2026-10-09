# 🚀 Tarea 08: UX Financiero para Representantes (Tasa BCV y Datos del Colegio)

## Contexto

Proyecto: EduLink (SaaS EdTech).
Estado actual: El portal del representante muestra al estudiante y permite reportar pagos, pero carece de datos del colegio, saldo deudor y tasa de cambio del día [1, 4].
Objetivo: Añadir la tarjeta de instrucciones de pago del colegio y el widget dinámico de la tasa de cambio BCV para el representante [1].

## 🏗️ 1. Next.js App Router Patterns

- **Data Fetching Dinámico**: El componente `src/app/(roles)/representante/page.tsx` debe hacer fetch de la última tasa de cambio guardada en `exchange_rates` (asociada al `school_id` del colegio) para mostrarla de forma dinámica en pantalla.
- **Instrucciones de Pago**: Obtener los datos del colegio (`name`, `rif`, y en un futuro datos de cuentas, por ahora estáticos) de la tabla `schools`.

## 🎨 2. Frontend UI Engineering (UX de Pago Venezolano)

- **Tarjeta de Instrucciones de Pago**: Un bloque limpio con el logo de Pago Móvil y Zelle que detalle: Banco, Teléfono, RIF y Correo de transferencias para facilitar la copia de los datos [1].
- **Mapeo de la Tasa BCV**: Mostrar la tasa con el mensaje: "Tasa oficial: X.XX Bs/USD" al lado del botón de reportar pago [1].
- **Mapeo de Deuda (Simulado para MVP)**: Añadir en la tarjeta del estudiante una píldora roja que muestre el saldo pendiente (ej: "Mensualidad Junio pendiente: $45.00") para incentivar el reporte de pago [1].

## 📝 Pasos a ejecutar (To-Do List para el AI Agent)

- [ ] **Paso 1: Fetching de Tasa BCV y Datos del Colegio.**
      Modificar `/representante/page.tsx` para traer la tasa de `exchange_rates` y los datos del colegio de `schools` [1].
- [ ] **Paso 2: Tarjeta Visual de Datos de Transferencia.**
      Diseñar una tarjeta colapsable o fija en el dashboard del representante que muestre los datos de Pago Móvil (Banco, RIF, Teléfono) y Zelle del colegio [1].
- [ ] **Paso 3: Conectar la Tasa del Día.**
      Mostrar la tasa al lado o dentro del botón de "Reportar Pago" para que el representante sepa a cuánto calcular la transferencia en Bolívares al instante [1].
