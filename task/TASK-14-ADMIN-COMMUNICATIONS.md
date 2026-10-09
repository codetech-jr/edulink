# 🚀 Tarea 14: Módulo de Publicación de Comunicados Oficiales (Admin)

## Contexto

Proyecto: EduLink (SaaS EdTech).
Estado actual: Los portales de representantes y estudiantes muestran comunicados ficticios estructurados en el frontend.
Objetivo: Crear el módulo de publicación de comunicados institucionales en `/admin/comunicados` para que la secretaría/directiva registre avisos (Urgentes, Informativos, Recordatorios) [1]. Al guardar, se debe revalidar la caché para que los papás y alumnos vean la información real de inmediato [3].

## 🏗️ 1. Next.js App Router Patterns

- **Ruta de Administración**: Crear `src/app/(roles)/admin/comunicados/page.tsx` como Server Component. Utilizará un diseño de dos columnas (izquierda: listado de comunicados enviados; derecha: formulario de creación rápida) [3].
- **Server Action Segura**: `createAnnouncementAction(formData)` en `src/actions/communication-actions.ts`. Esta acción debe capturar el `school_id` del administrador en el servidor de forma segura, validar los campos e insertar el registro en la tabla `communications` [3, 4].
- **Invalidación de Caché Múltiple**: Al insertar, se debe ejecutar `revalidatePath` para `/admin/comunicados`, `/representante` y `/estudiante` para garantizar el refresco instantáneo [3].

## 🎨 2. Frontend UI Engineering (Muro de Avisos del Colegio)

- **Formulario de Publicación (Admin)**: Inputs limpios para:
  - Título del Comunicado (Ej. "Reunión de Representantes de 3er Lapso")
  - Categoría (Dropdown: `urgente` ➡️ Borde rojo; `informativo` ➡️ Borde azul; `recordatorio` ➡️ Borde amarillo)
  - Mensaje / Cuerpo (Textarea de texto libre)
- **Refactorización de Portales (B2C)**: Modificar `/representante` y `/estudiante` para que dejen de usar datos quemados y realicen un fetch real a la tabla `communications` (filtrando por el `school_id` del colegio) [3, 4]. Los colores y badges de las tarjetas de anuncios deben cambiar condicionalmente según el `category` guardado en la base de datos [3].

## 📝 Pasos a ejecutar

- [ ] **Paso 1: Ruta y Formulario de Administración.**
      Crear la página `/admin/comunicados` con el listado izquierdo y el formulario de creación derecho [3].
- [ ] **Paso 2: Server Action de Publicación.**
      Escribir `createAnnouncementAction` en `src/actions/communication-actions.ts` [3]. Validar sesión, obtener `school_id`, insertar en la tabla `communications` y aplicar revalidación triple de rutas [3, 4].
- [ ] **Paso 3: Conectar el Feed del Representante y del Estudiante.**
      Refactorizar las pestañas de comunicados en `/representante` y `/estudiante` para que hagan fetch real de la tabla `communications` [3, 4]. Mapear condicionalmente las clases de Tailwind según la categoría (`urgente` ➡️ rojo, `informativo` ➡️ azul, etc.) [3].
