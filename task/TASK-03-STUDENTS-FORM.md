# 🚀 Tarea 03: Inscripción de Estudiantes (Server Actions & Mutaciones)

## Contexto

El Módulo de Estudiantes está blindado bajo RLS leyendo el `school_id`. Requerimos dotar a la plataforma de su primera interfaz de escritura transaccional (Formulario) para que un administrador registre el primer estudiante, haciendo que el "Empty State" desaparezca y ceda su lugar a la Tabla de Datos renderizada desde Supabase.

## 🏗️ 1. Patrones a emplear (Next.js 14)

- **Mutaciones Seguras**: Todo registro a la BD pasará por una Server Action dedicada (`src/actions/student-actions.ts`). Esta función NO puede confiar en IDs enviados desde el cliente; debe leer mediante cookie el auth_id actual, extraer el `school_id` asociado del profile y forzar este ID seguro en la sentencia INSERT de la tabla `students` garantizando integridad Multi-Tenant.
- **Cache Invalidation (`revalidatePath`)**: Luego de ejecutar un `insert` exitoso, la Server Action debe invalidar la caché usando `revalidatePath('/admin/students')` y generar un `redirect` hacia la misma ruta para detonar la renderización actualizada sin recargar el navegador en cliente (Patrón recomendado App Router).

## 🎨 2. UI Engineering

- **Ruta de Formulario dedicada**: Para evitar Modales pesados en cliente y mejorar el UX móvil, crearemos la ruta estricta `src/app/(roles)/admin/students/new/page.tsx`.
- **Botón Deshabilitado / Feedback Mágico**: Aplicaremos el uso de hooks form-action (react 18+) para poner los campos inputs limpios en pantalla, pero brindándole bloqueo automático de clicks al botón "Inscribir Alumno" mientras piensa en el proceso en base a red (Spinner/Disabled visualmente).

## 📝 Pasos a ejecutar

- [ ] **Paso 1: Interfaz Formulario (Route)**
      Diseñar `src/app/(roles)/admin/students/new/page.tsx` montando el header 'Registrar Nuevo Estudiante'. Añadir botón back "Volver al listado". Armar Client-Component `<StudentForm />` insertado debajo que requiera únicamente: Nombre Completo y Cédula (los grados se añadirán en updates posteriores).
- [ ] **Paso 2: Database Server Action**
      Crear `src/actions/student-actions.ts` exportando `createStudent(...)`. Que verifique variables, obtenga tu 'school_id' internamente validando al superusuario, realice en Postgres el `.insert({ school_id: XXX, full_name, cedula })`. Finalmente `revalidatePath` y vuelva al índice dashboard estudiantes!
- [ ] **Paso 3: Update Índice (`students/page.tsx`)**
      Modificar el tablero "Empty State" asegurando ahora enlazar los 2 botones azules (los "+ Inscribir Estudiante" tanto del panel vacío como el del toolbar de header superior derecho) en forma de un router `Link` envoltorio `href="/admin/students/new"`. Si el Array Students length > 0... que levante y pinte los nombres sobre un diseño "table" puro HTML estilizado Tailwind en celdas!
