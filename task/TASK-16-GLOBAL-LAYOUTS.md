# 🚀 Tarea 16: Overhaul de Layouts Globales y Sistema de Navegación (Dashboards)

## Contexto

Proyecto: EduLink (SaaS EdTech).
Estado actual: El login tiene un estándar UI "Split-Screen" de altísima fidelidad, pero las páginas internas necesitan una envoltura de navegación (Layout) coherente que comunique el mismo nivel premium (Sidebar lateral para Admin/Docente y navegación inferior o por pestañas refinada para Representantes/Alumnos).

## 🏗️ 1. Next.js App Router Patterns

- **Layouts Protegidos**: Reemplazar y crear componentes layout maestros por zona:
  - `src/app/(roles)/admin/layout.tsx`: Creará una "Sidebar" (barra lateral) persistente a la izquierda con links a: Dashboard, Estudiantes, Pagos, Aranceles y Comunicados. Ocupará toda la altura (`h-screen`).
  - `src/app/(roles)/docente/layout.tsx`: Similar, sidebar limpia para asistencias y calificaciones.
- **Evitar re-renderizados**: Gracias a Next.js `layout.tsx`, la barra no parpadeará ni se recargará mientras la persona cambia de página.

## 🎨 2. Frontend UI Engineering (Dashboard Anatomy)

- **Glassmorphism & Estilos Vercel**: El Navbar y Sidebar no deben tener colores agresivos. Utilizar fondos `bg-white/80` o `bg-zinc-50` con `backdrop-blur-md` (efecto cristal translúcido).
- **Active States (Señales de GPS UI)**: El botón del Sidebar que corresponda a la página actual de la URL (`usePathname()`) debe verse más resaltado (texto más fuerte e icono resaltado `text-indigo-600 bg-indigo-50` para dar sentido de orientación al usuario).
- **Responsive Navigation**: En pantallas pequeñas (`md`, teléfonos móviles), ocultar el sidebar izquierdo nativamente de tailwind `hidden md:flex`, proveyendo un "Hamburger Menu" para abrirlo mediante `Sheet/Dialog`.
- **Top Header**: Incorporar arriba del children del contenido principal un top bar discreto con el nombre del usuario / Avatar y Breadcrumbs rápidos.

## 📝 Pasos a ejecutar (Para Antigravity)

- [ ] **Paso 1: Global Admin Layout.**
      Construye el `AdminLayout` completo e integralo en `/admin`. La sidebar incluye un logotipo de EduLink + enlaces estilizados. Unifica botones de logout y avatar user info.
- [ ] **Paso 2: Aplicación del Diseño Base.**
      Poda los botones sueltos antiguos (botones rojos toscos del top-bar antiguo que metíamos dentro de pages, etc). Confirma migrar todas las visuales de los `/admin/` bajo los `children` pasados en este framework.
- [ ] **Paso 3: Global Docente Layout.**
      Réplica exacta para la experiencia del docente (`/docente/layout.tsx`). Enlaces hacia 'Control de Aula (Asistencia)' y 'Cuaderno de Calificaciones'.
