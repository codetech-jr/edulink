# 🚀 Tarea 05: Formulario de Registro de Pago Manual (Admin)

## Contexto

Proyecto: EduLink (SaaS EdTech).
Estado actual: Lista de estudiantes funcional. Dashboard de pagos dinámico pero vacío.
Objetivo: Crear un formulario en `/admin/payments/new` para que el administrador pueda registrar manualmente un pago, seleccionando dinámicamente un estudiante de su colegio.

## 🏗️ 1. Next.js App Router Patterns (Reglas Arquitectónicas)

- **Data Flow Limpio**: El Server Component `src/app/(roles)/admin/payments/new/page.tsx` debe hacer fetch de todos los estudiantes activos de esa escuela (`id` y `full_name`) en el servidor, y pasárselos como `props` al componente de cliente del formulario.
- **Server Action**: La creación del pago se gestionará en `src/actions/payment-actions.ts` mediante la acción `createPaymentAction(formData)`. Debe recuperar el `school_id` de la sesión de forma segura en el servidor, registrar el pago en la tabla `payments`, e invalidar la caché usando `revalidatePath('/admin/payments')`.

## 🎨 2. Frontend UI Engineering (Reglas de Interfaz)

- **Selector Dinámico**: El formulario debe incluir un selector (`<select>` o componente estilizado) que muestre la lista de estudiantes disponibles para ese colegio.
- **Campos del Formulario**:
  - Estudiante (Selector) [4]
  - Método de Pago (Dropdown: Pago Móvil, Zelle, Efectivo, Transferencia)
  - Monto en USD (Input numérico)
  - Referencia (Input de texto)
  - Estado Inicial (Dropdown o campo fijo: `pendiente` o `confirmado` para pagos en efectivo directo) [3]
- **Look & Feel**: Mantener el diseño limpio con tarjetas blancas, sombras suaves y botones interactivos con estados de carga.

## 📝 Pasos a ejecutar

- [ ] **Paso 1: Query de Estudiantes en Servidor.**
      Modificar/crear `src/app/(roles)/admin/payments/new/page.tsx` para recuperar la sesión, extraer el `school_id` y traer la lista de estudiantes registrados para pasárselos al formulario [3, 4].
- [ ] **Paso 2: Componente Cliente `<PaymentForm />`.**
      Crear el formulario cliente que reciba la lista de estudiantes, tenga campos estilizados con Tailwind, use `useFormStatus` para deshabilitar el botón durante el envío y maneje errores visuales [3].
- [ ] **Paso 3: Server Action de Registro.**
      Escribir `createPaymentAction` en `src/actions/payment-actions.ts` que reciba los datos del formulario, valide la sesión, inyecte el `school_id` de forma segura, inserte el registro en la tabla `payments` y redirija a `/admin/payments` [3, 4].
