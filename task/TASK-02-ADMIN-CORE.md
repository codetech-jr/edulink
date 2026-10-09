# 🚀 Tarea 02: Dashboard Dinámico y Módulo Core de Estudiantes

## Contexto

Proyecto: EduLink (SaaS EdTech).
Estado actual: Auth RLS y rutas protegidas (Épica 01) completadas.
Objetivo: Conectar la UI del Dashboard con datos reales de la BD y construir la base visual del Módulo de Estudiantes.

## 🏗️ 1. Next.js App Router Patterns (Reglas Arquitectónicas)

- **Server Components para Data Fetching**: El componente `src/app/(roles)/admin/page.tsx` debe transformarse en asíncrono (`async`). La lectura del usuario y su perfil debe hacerse directamente en el servidor usando `createServerClient` de `@supabase/ssr` antes de renderizar la página.
- **Cero 'use client' innecesarios**: La vista de estudiantes y el dashboard NO deben ser componentes de cliente a menos que haya interactividad estricta (como un formulario). Priorizar renderizado en servidor por velocidad y SEO interno.

## 🎨 2. Frontend UI Engineering (Reglas de Interfaz)

- **Consistencia Visual**: Mantener la paleta de colores corporativa (bg-gray-50, tarjetas blancas shadow-sm, acentos en blue-600 y emerald-600).
- **Empty States (Estados Vacíos)**: Una tabla sin datos no debe verse rota ni como una página en blanco. Se debe implementar un "Empty State" elegante con un ícono ilustrativo (Lucide-react), un mensaje claro y un Call to Action (Botón de "Registrar Estudiante").
- **Navegabilidad**: Incluir botones o breadcrumbs de "Volver" claros entre las sub-rutas y el Dashboard principal.

## 📝 Pasos a ejecutar (To-Do List para el Agente AI)

- [ ] **Paso 1: Saludo Dinámico (Fetch Perfil).**
      Modificar `src/app/(roles)/admin/page.tsx`. Instanciar Supabase Server Client, ejecutar `auth.getUser()`, luego hacer un `.select('full_name').from('profiles').eq('id', user.id).single()`.
      Reemplazar el texto "Bienvenido de nuevo" por `"Bienvenido/a, [full_name]"`. Manejar el caso nulo elegantemente.
- [ ] **Paso 2: Layout y Ruta del Módulo Estudiantes.**
      Crear `src/app/(roles)/admin/students/page.tsx` como Server Component. Debe incluir un Header con título "Gestión de Estudiantes", botón de retroceso a `/admin` y un botón primario " + Registrar Nuevo ".
- [ ] **Paso 3: UI de la Data-Table y Empty State.**
      Diseñar la estructura de la tabla (Cédula, Nombre, Grado, Representante). Condicionar la UI: como inicialmente haremos un fetch a la tabla `students` y vendrá vacía (array length === 0), renderizar directamente un componente visual de "Empty State" hermoso e invitador, apoyándose en íconos de `lucide-react`.
