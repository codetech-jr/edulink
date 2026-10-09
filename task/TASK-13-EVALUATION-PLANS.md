# 🚀 Tarea 13: Planes de Evaluación Imprimibles y Lanzamiento del Portal del Estudiante

## Contexto

Proyecto: EduLink (SaaS EdTech).
Objetivo: Permitir al docente configurar el Plan de Evaluación (100% de ponderación) por Lapso [3]. Crear el Portal del Estudiante en `/estudiante` para que los alumnos (junto a sus representantes) consulten su calendario académico y puedan imprimir el formato oficial del plan de evaluación [1].

## 🏗️ 1. Next.js App Router Patterns

- **Lanzamiento del Portal Estudiante**: Crear `src/app/(roles)/estudiante/page.tsx` como Server Component (protegido por middleware con el rol 'estudiante').
- **Vinculación de Datos**: Para saber quién es el estudiante logueado, la consulta buscará en la tabla `students` la fila donde el campo `profile_id` (o la llave primaria `id` si se mapea 1:1) coincida con su `auth.uid()` actual en Supabase [3, 4]. Obtendrá su sección, sus asignaturas y sus planes de evaluación activos [4].
- **Server Actions**: `saveEvaluationPlanAction` en `src/actions/teacher-actions.ts` guardará masivamente en `evaluations` con revalidación de caché para el docente, representante y estudiante [3].

## 🎨 2. Frontend UI Engineering (Módulo Estudiante y Tooltips)

- **Portal del Estudiante (`/estudiante`)**: Interfaz móvil súper moderna (pestañas Académico / Comunicados). No tendrá pestaña financiera (privacidad). Mostrará su horario de clases, promedio, récord de asistencia y el listado de materias con el botón "Ver Plan de Evaluación" [1].
- **Impresión unificada (Tailwind Print)**: El botón "Imprimir Plan de Evaluación" (disponible para Docentes, Representantes y Estudiantes) usará las utilidades `print:` de Tailwind para generar una hoja oficial limpia tamaño Carta/Oficio con membrete del colegio, tabla de evaluaciones y sección de firmas [1, 3].

## 📝 Pasos a ejecutar

- [ ] **Paso 1: Creador de Planes (Docente).**
      Crear la UI en `/docente/calificaciones`. Permitir agregar filas de evaluaciones dinámicamente y validar que sumen exactamente 100% antes de habilitar el botón de guardar [3].
- [ ] **Paso 2: Server Action de Persistencia.**
      Programar `saveEvaluationPlanAction` en `src/actions/teacher-actions.ts` para registrar en la tabla `evaluations` de Supabase con revalidación de rutas [3, 4].
- [ ] **Paso 3: Creación de la Ruta del Estudiante (`/estudiante`).**
      Crear `src/app/(roles)/estudiante/page.tsx`. Implementar el fetch dinámico de sus materias y asistencia. Diseñar una UI juvenil y limpia (horario, promedio, comunicados) [1, 4].
- [ ] **Paso 4: Tooltip Académico e Impresión (Representantes y Estudiantes).**
      Tanto en `/representante` como en `/estudiante`, al hacer clic en una materia, desplegar las evaluaciones y habilitar el botón de "Imprimir Plan" que disparará `window.print()` con el formato oficial del colegio [1, 3].
