# 🚀 Tarea 15: Reestructuración Global UI/UX y Sistema de Diseño Premium (Fase 1: Login & Layout)

## Contexto

Proyecto: EduLink (SaaS EdTech).
Estado actual: Funcionalidad de back-end (100%), arquitectura de datos perfecta. El diseño actual es funcional pero genérico.
Objetivo: Dar el salto hacia un estándar Enterprise/Startup moderna. Elevar la interfaz utilizando `visual-design-foundations` y `interaction-design` para transmitir altísimo valor comercial, confiabilidad y tecnología de punta a colegios de Venezuela.

## 🎨 1. Sistema de Diseño y Patrones (Design System Patterns)

- **Aesthetic**: Estilo inspirado en Radix UI / Shadcn UI / Vercel.
  - _Colores_: Fondos sutiles (Ej. `bg-zinc-50` o `bg-slate-50`), tarjetas blancas inmaculadas, bordes muy finos (`border-zinc-200`). Acentos primarios en tonos institucionales modernos (`indigo-600` a `indigo-800`).
  - _Tipografía_: Uso inteligente de pesos (Tracking ajustado, subtítulos en uppercase con bajo contraste, jerarquía clara).
  - _Efectos_: `shadow-sm` omnipresente para tarjetas. Botones interactivos con `hover:bg-accent` y micro-animaciones en transiciones (transition-all, duration-200).
- **El Nuevo Patrón de Autenticación (Split Screen Layout)**: El Login pasará de ser una tarjeta flotante en el centro, a una pantalla dividida (Mitad formulario ultra-limpio, mitad bloque visual con branding del colegio/SaaS, mensajes de confianza o blobs gradient de fondo abstracto).

## 🖱️ 2. UX y Feedback Interactivo (Interaction Design)

- Mejorar radicalmente los "Loading States". Reemplazar cargas abruptas por desvanecimientos.
- Formularios premium: Campos de texto (Inputs) con labels que funcionen bien visualmente, uso de `ring:focus`, y alertas de error en forma de texto pequeño e imperceptible rojo o Toast Notifications, evitando grandes banners rojos estridentes.

## 📝 Pasos a ejecutar (To-Do List para el AI/MCP)

- [ ] **Paso 1: Setup Tipográfico y Estructural.**
      Inyectar ajustes globales al layout si es necesario (fuentes como Inter integradas via `next/font`), configuraciones en el `globals.css` (para root layouts consistentes con variables si se usará diseño Shadcn).
- [ ] **Paso 2: Reestructuración Magistral del `/login/page.tsx`.**
      Cambiar por completo la vista. Lado izquierdo (o principal en móvil): Formulario elegante, tipografía impecable, logos minimalistas. Lado derecho (hidden en mobile, visible `lg:flex`): Contenedor decorativo moderno con fondo de brand, blur o pattern arquitectónico educativo de alta fidelidad.
- [ ] **Paso 3: Componentización Premium del Form (`LoginForm.tsx`).**
      Actualizar los inputs. Etiquetas sutiles de Tailwind, focos resaltados. Botón de 'Iniciar Sesión' premium con micro-animaciones (ej: estado active). Separador refinado de componentes.
