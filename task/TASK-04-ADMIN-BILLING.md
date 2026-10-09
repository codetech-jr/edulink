# 🚀 Tarea 04: Control de Pagos, Conciliación de Comprobantes y Tasa de Cambio

## Contexto

Proyecto: EduLink (SaaS EdTech).
Estado actual: Registro de estudiantes e inscripción (Épica 03) completado con base Multi-Tenant sólida.
Objetivo: Transformar la pantalla de "Pagos y Finanzas" (que actualmente usa datos estáticos) en un panel dinámico que consuma agregaciones de base de datos reales y permita a la secretaría aprobar o rechazar reportes de pago.

## 🏗️ 1. Next.js App Router Patterns (Reglas Arquitectónicas)

- **Agregaciones Seguras en Servidor (`sql-pro.md`)**: El cálculo de "Recaudación del Mes", "Por Confirmar" y "Morosidad" se debe realizar directamente en el servidor dentro de `src/app/(roles)/admin/payments/page.tsx` usando consultas agregadas de Supabase (PostgreSQL). Queda prohibida la manipulación de estados pesados en cliente para cálculos financieros.
- **Transacciones Seguras (Approve/Reject)**: El cambio de estado de un pago (`pendiente` ➡️ `confirmado` o `rechazado`) debe pasar por una Server Action dedicada en `src/actions/payment-actions.ts`. Debe invalidar la caché de la página de inmediato usando `revalidatePath('/admin/payments')`.

## 🎨 2. Frontend UI Engineering (Reglas de Interfaz)

- **Control de Estados**: Las celdas de la tabla deben pintar dinámicamente el badge de estado (`Pendiente` en amarillo, `Confirmado` en verde, `Rechazado` en rojo) usando clases condicionales de Tailwind [3].
- **Widget de Tasa de Cambio**: Incorporar un widget sutil de "Tasa de Cambio Oficial (Bs/USD)" que lea el último registro de `exchange_rates` de la base de datos y permita al administrador actualizar la tasa del día mediante una Server Action dedicada.

## 📝 Pasos a ejecutar (To-Do List para el Agente AI)

- [ ] **Paso 1: Consultas de Agregación Real (Dashboard Financiero).**
      Modificar `/admin/payments/page.tsx` para realizar las consultas agregadas reales: - _Recaudación_: Sumatoria de `amount_usd` donde `status = 'confirmado'` de la escuela del admin. - _Por Confirmar_: Conteo de registros en la tabla `payments` donde `status = 'pendiente'`. - _Morosidad (Fórmula MVP)_: Conteo simple de alumnos con pagos pendientes.
- [ ] **Paso 2: Tabla de Pagos Entrantes.**
      Hacer fetch a la tabla `payments` de la escuela activa (filtrando por `school_id`), trayendo una relación interna (Join) con la tabla `students` para mostrar el nombre del alumno, monto, referencia y método utilizado. Ordenar de más reciente a más antiguo [4].
- [ ] **Paso 3: Acciones de Conciliación.**
      Desarrollar el Server Action `src/actions/payment-actions.ts` con funciones para: - `approvePaymentAction(paymentId)`: Actualiza estado a 'confirmado' y emite `revalidatePath`. - `rejectPaymentAction(paymentId, reason)`: Actualiza estado a 'rechazado', guarda el motivo opcional y emite `revalidatePath`. - Conectar estas acciones al botón de acción en las filas de la tabla de pagos para que la secretaria pueda procesarlos en caliente.
- [ ] **Paso 4: Tasa de Cambio del Día.**
      Hacer fetch al último registro de `exchange_rates` en la base de datos para mostrar el valor del dólar en el dashboard. Agregar un formulario básico que llame a `updateExchangeRateAction(rate)` para insertar la nueva tasa diaria.
