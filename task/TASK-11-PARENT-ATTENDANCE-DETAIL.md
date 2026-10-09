# 🚀 Tarea 11: Detalle de Asistencia Híbrida y Desglose por Materias para Representantes

## Contexto

Proyecto: EduLink (SaaS EdTech).
Estado actual: El portal del representante muestra la asistencia semanal por día (L, M, M, J, V) de forma general. El Jueves sale en rojo porque el docente cargó una inasistencia en la materia de Matemáticas [3, 4].
Objetivo: Implementar la lógica híbrida de asistencia. El círculo del día representará el estado consolidado del día. Al interactuar con el círculo (hover o clic), se desplegará un tooltip o menú detallando el estado de asistencia materia por materia [1].

## 🏗️ 1. Next.js App Router Patterns

- **Joins en Consultas de Servidor**: En `src/app/(roles)/representante/page.tsx`, la consulta a la tabla `attendance` debe realizar un `inner join` con la tabla `subjects` para traer el **Nombre de la Materia** (`name`) y el horario de clases [4].
- **Lógica de Consolidación Diaria**:
  - Si para un día específico (ej. Jueves) hay 1 o más registros con `status = 'ausente'`, el círculo general del Jueves se pintará con la **X roja** (prioridad de alerta) [3].
  - Si todos los registros del día son `presente`, se pintará con el **check verde** [3].
  - Si no hay registros de asistencia para ese día, se mantendrá en **círculo gris neutro** con el guion `-`.

## 🎨 2. Frontend UI Engineering (Micro-interacciones y Tooltips)

- **Tooltip Interactivo**: Utilizar clases CSS puras de Tailwind (`group` y `group-hover:scale-100`) o un pequeño estado de React para que, al pasar el cursor (en PC) o tocar (en móvil) el círculo de un día (ej: Jueves), aparezca flotando una tarjeta elegante con el desglose [1]:
  - 📚 _Matemáticas (7:00 - 8:30):_ ❌ Inasistente [3]
  - 📖 _Castellano (8:30 - 10:00):_ ⚪ Sin registro (o presente)
- **Look & Feel**: El tooltip debe tener fondo oscuro (`bg-gray-900`), texto blanco, sombra pronunciada (`shadow-xl`) y bordes redondeados (`rounded-xl`), simulando el diseño de las mejores aplicaciones móviles de finanzas.

## 📝 Pasos a ejecutar

- [ ] **Paso 1: Query de Asistencia con Relaciones.**
      Modificar el fetch de `attendance` en el servidor de `/representante/page.tsx` para traer el `subject_id` y su relación con `subjects(name, start_time, end_time)` para la semana actual [4].
- [ ] **Paso 2: Algoritmo de Consolidación.**
      Escribir la función helper en JavaScript/TypeScript que agrupe las asistencias por día de la semana y determine el icono general del día (si hay ≥ 1 inasistencia ➡️ Rojo) [3].
- [ ] **Paso 3: Tooltip de Desglose de Materias.**
      Modificar el componente visual del círculo del día. Envolverlo en un contenedor con clase `group relative` y diseñar el tooltip flotante que recorra las materias evaluadas de ese día mostrando su estado individual [1].
