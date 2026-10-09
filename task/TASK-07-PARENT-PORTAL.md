# 🚀 Tarea 07: Portal del Representante y Reporte de Pagos

## Contexto

Proyecto: EduLink (SaaS EdTech).
Objetivo: Proveer un dashboard mobile-first a los representantes donde puedan consultar a sus representados, ver el historial de sus pagos y reportar transferencias/pago móvil directamente al colegio [1, 4].

## 🏗️ 1. Next.js App Router Patterns

- **Ruta del Representante**: La página `src/app/(roles)/representante/page.tsx` será un Server Component que obtendrá los hijos (`students`) asignados al usuario logueado usando `parent_id = user.id`. También extraerá de `payments` el historial de pagos asociados a esos estudiantes [3].
- **Acción del Servidor Segura**: El reporte de un pago se ejecutará en `src/actions/representative-actions.ts` mediante `reportPaymentAction`. Obligatoriamente: debe verificar que el usuario tenga rol 'representante', forzar el insert en `payments` con `status = 'pendiente'`, inyectando automáticamente el `student_id` y el `school_id` correctos sin exponerlos como ocultos en el HTML [3].

## 🎨 2. Frontend UI Engineering (Mobile First Extremo)

- Esta interfaz será consultada 95% del tiempo desde un teléfono. Diseño tipo billetera digital o app bancaria: Letras legibles, tarjetas de resumen blancas con esquinas redondeadas, separadores grises, botones táctiles anchos [3].
- Se creará un subcomponente cliente (`ReportPaymentForm.tsx` o modal) usando Server Actions con Feedback de carga inmediato (para evitar que la mamá presione el botón 3 veces si el WiFi falla).
- El formulario solo pedirá lo vital: Estudiante (si tiene varios), Arancel/Concepto, Método de pago, Monto enviado y Referencia.

## 📝 Pasos a ejecutar (To-Do List para el AI Agent)

- [ ] **Paso 1: Fetching de Datos (Servidor).**
      Modificar `/representante/page.tsx`. Usar Supabase Server Client. Ejecutar Query a la tabla `students` donde `parent_id` coincida con el usuario actual, para mostrar tarjetas de sus hijos. También un Query del historial de `payments` atados a él.
- [ ] **Paso 2: Server Action (`representative-actions.ts`).**
      Programar `reportPaymentAction(formData)`. Valida la data, inserta el pago forzando status a `pendiente` (listo para conciliación en admin). Incluye `revalidatePath('/representante')` y, conceptualmente, también `/admin/payments` para reflejar la notificación allá de inmediato.
- [ ] **Paso 3: Construcción Visual de UI.**
      Maquetar un "Dashboard Móvil" con Header que diga "Hola, NombrePapá". Integrar visualmente el componente `ReportPaymentForm`. Condicionar el Empty State si el representante no tiene estudiantes asociados ('Acuda a secretaría para enlazarse').


