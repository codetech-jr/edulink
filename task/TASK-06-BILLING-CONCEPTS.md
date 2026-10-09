# 🚀 Tarea 06: Módulo de Conceptos de Facturación (Aranceles)

## Contexto

Proyecto: EduLink (SaaS EdTech).
Estado actual: El formulario de registro de pagos da un error 404 al intentar crear un Concepto de Facturación en `/admin/billing`.
Objetivo: Crear el módulo de aranceles en `/admin/billing` que permita visualizar y registrar conceptos (Mensualidades, Inscripción) en la base de datos bajo la tabla `billing_concepts` de forma segura.

## 🏗️ 1. Next.js App Router Patterns (Reglas Arquitectónicas)

- **Ruta Unificada**: Crear la página en `src/app/(roles)/admin/billing/page.tsx` como Server Component. Debe listar los conceptos existentes del colegio e incluir el formulario de creación en la misma pantalla (o un botón a un formulario limpio).
- **Mutación de Datos**: La creación del arancel se procesará en un Server Action dedicado `src/actions/billing-actions.ts` con la función `createBillingConceptAction(formData)`.
- **Inyección de Seguridad**: La acción debe capturar el `school_id` desde la sesión del usuario de forma segura en el servidor antes de insertar el registro en `billing_concepts` [3].

## 🎨 2. Frontend UI Engineering (Reglas de Interfaz)

- **Formulario Limpio**: El formulario de creación debe pedir:
  - Nombre del Concepto (Ej. "Mensualidad Junio 2026")
  - Monto en USD (Input numérico)
  - Fecha de Vencimiento (Input tipo fecha)
- **Look & Feel**: Mantener la coherencia estética (tarjetas blancas shadow-sm, acentos en emerald/blue y Lucide React para la iconografía).
- **Navegación Intuitiva**: Asegurar un botón que permita "Volver a Pagos" de forma fácil.

## 📝 Pasos a ejecutar

- [ ] **Paso 1: Página `/admin/billing/page.tsx`.**
      Crear la ruta como Server Component. Debe hacer fetch de los aranceles existentes de la tabla `billing_concepts` filtrando por `school_id`. Si no hay ninguno, mostrar un diseño limpio con un formulario para "Crear el Primer Arancel" [3].
- [ ] **Paso 2: Server Action de Creación.**
      Crear `src/actions/billing-actions.ts` con la función `createBillingConceptAction`. Debe validar la sesión, capturar el `school_id` de forma segura, insertar el arancel en `billing_concepts`, e invalidar la caché con `revalidatePath` tanto para `/admin/billing` como para `/admin/payments/new` (para que el dropdown se actualice de inmediato) [3].
- [ ] **Paso 3: Formulario Visual.**
      Diseñar el componente de cliente del formulario para registrar el arancel, aplicando `useFormStatus` para deshabilitar el botón de envío y mostrando mensajes de éxito/error.
