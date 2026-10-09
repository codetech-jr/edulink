# 🚀 Tarea 11: Plan de Evaluación y Cuaderno de Calificaciones del Docente

## Contexto

Proyecto: EduLink (SaaS EdTech).
Estado actual: Pase de asistencia diario (Tarea 10) operativo.
Objetivo: Desarrollar el módulo de carga de calificaciones en la ruta `/docente/calificaciones` para que el maestro configure el Plan de Evaluación de su materia (Lapsos, Ponderaciones que sumen 100%) e ingrese las notas (1–20) de los alumnos, permitiendo el cálculo automatizado del promedio de lapso.

## 🏗️ 1. Next.js App Router Patterns

- **Ruta Dedicada**: Se creará la ruta `src/app/(roles)/docente/calificaciones/page.tsx` para el Cuaderno de Notas.
- **Transacciones Seguras (Server Actions)**:
  - `saveEvaluationPlanAction(subjectId, termId, evaluations)`: Guarda las ponderaciones de evaluaciones en la tabla `evaluations`. Valida estrictamente en el servidor que la suma de porcentajes sea exactamente igual a `100` [3].
  - `saveGradesAction(gradesList)`: Guarda o actualiza masivamente las notas en `grades`. Valida que las notas estén en el rango `1` al `20` (escala venezolana) [3].

## 🎨 2. Frontend UI Engineering (UX de Planilla Escolar)

- **Mapeo de Ponderaciones**: Un subcomponente para crear las evaluaciones del lapso (ej: "Examen 1: 30%", "Trabajo: 20%", "Prueba Final: 50%"). La interfaz debe avisar visualmente en rojo si la suma no da 100% y bloquear el botón de guardar.
- **Cuaderno/Planilla de Notas**: Una tabla donde las columnas son las evaluaciones creadas y las filas son los alumnos. El docente introduce la nota en un input numérico ágil. Al cambiar una nota, el promedio final de la fila del estudiante se debe recalcular en tiempo real en la pantalla del cliente antes de guardar.
- **Publicación de Notas**: Un botón que permita al docente "Publicar Notas". Mientras no esté publicado, el papá no verá estas notas en su portal.

## 📝 Pasos a ejecutar (To-Do List)

- [ ] **Paso 1: Setup de la Ruta de Calificaciones.**
      Vincular la tarjeta "Módulo de Calificaciones" del Home del docente para que redirija a `/docente/calificaciones`. Permitir al docente seleccionar la Asignatura y el Lapso (Lapso 1, 2 o 3) para cargar la planilla.
- [ ] **Paso 2: Componente Plan de Evaluación.**
      Crear el creador de evaluaciones para el Lapso seleccionado. Debe registrarse en `evaluations` vinculando `subject_id`, `term_id`, `name` y `weight_percentage`.
- [ ] **Paso 3: Planilla de Carga de Notas.**
      Diseñar la tabla del cuaderno de notas conectada a la tabla `grades` [3]. Al guardar, insertar o actualizar los registros vinculando `student_id`, `evaluation_id` y `score` [3].
