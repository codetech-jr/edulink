# 🚀 Tarea 10: Portal Docente y Asistenciario Móvil Rápidol

## Contexto

Proyecto: EduLink (SaaS EdTech).
Estado actual: Padre y Admin operativos. Se requiere que los profesores alimenten los datos académicos.
Objetivo: Crear el `/docente` dashboard enfocado a un MVP de "Pase de Lista Diario" ultrarrápido y offline-friendly.

## 🏗️ 1. Next.js App Router Patterns (Optimizando Escritura Múltiple)

- **Data Fetching (SSR)**: La ruta `src/app/(roles)/docente/page.tsx` (Server Component) obtendrá los Cursos (`courses`) del colegio y los Estudiantes (`students`) usando el `school_id` del perfil docente logueado.
- **Batched Server Action**: La asistencia de un salón no se guarda alumno por alumno (haría 30 peticiones a la DB). Se mantendrá en un Estado de React (Cliente) y se enviará en lote ("Batch Submit") a `src/actions/teacher-actions.ts -> saveDailyAttendanceAction(records)` mediante un solo toque al final de la clase, ahorrando red y previniendo errores.

## 🎨 2. Frontend UI Engineering (Diseño a prueba de estrés en aula)

- **Cero Dropdowns**: En el componente `<AttendanceList />` NO usar `<select>` para la asistencia de cada alumno (requiere 2 toques). Utilizar un grupo de botones tipo "Toggle" circulares o cuadrados (Ej: [P]resente en verde, [A]usente en rojo, [T]arde en naranja).
- **Default Optimista**: Todos los estudiantes inician visualmente con la opción "Presente" pre-marcada para acelerar el pase de lista (el docente solo toca a los que faltaron).
- **Header Pegajoso (Sticky Bottom Bar)**: El botón "Guardar Asistencia" debe quedarse fijo en la parte inferior de la pantalla del celular para no tener que hacer scroll back up tras llegar al último niño.

## 📝 Pasos a ejecutar (To-Do List)

- [ ] **Paso 1: Query Inicial del Salón.**
      Configurar `page.tsx` para traer los estudiantes del `school_id` actual. Incorporar un menú selector del `course` (Grado/Sección) para que el maestro elija el salón al que va a evaluar.
- [ ] **Paso 2: Formulario Asistenciario (`AttendanceSheet.tsx`).**
      Desarrollar el componente de Cliente con mapeo de estudiantes. Cada fila es un alumno con su grupo de Toggles de asistencia (`P | T | A`). State reactivo manejando un array de resultados a mandar.
- [ ] **Paso 3: Server Action Transaccional.**
      Escribir `teacher-actions.ts`. Recibe la lista (estudiante_id, status) e inserta masivamente en la tabla `attendance`. Agrega el chequeo previo: no dejar registrar el mismo día 2 veces para evitar duplicados. Refresca caché al lograrlo con éxito.
