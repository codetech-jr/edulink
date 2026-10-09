# 🚀 Tarea 19: Landing Page Pública de Marketing de EduLink (SaaS)

## Contexto

Proyecto: EduLink (SaaS EdTech).
Objetivo: Diseñar la página pública principal en `src/app/page.tsx` (la raíz `/`) para presentar el producto al mercado escolar venezolano, explicar su propuesta de valor e incentivar el registro autónomo de colegios [1].

## 🏗️ 1. Next.js App Router Patterns

- **Ruta Pública Raíz**: La página `src/app/page.tsx` será un Server Component público (ya configurada en `AUTH_ROUTES` en el middleware).
- **SEO & Performance**: Al ser una página de marketing, debe ser ultra-liviana. Cero dependencias pesadas. Cargar tipografías y recursos de forma optimizada.

## 🎨 2. Frontend UI Engineering (SaaS Marketing Masterpiece)

- **Aesthetic**: Estilo minimalista tecnológico (Linear/Stripe). Fondo blanco inmaculado, con un patrón sutil de rejilla o círculos grises tenues de fondo, y sutiles gradientes de color azul/índigo difuminados de fondo (blobs de blur).
- **Sección Hero (La primera impresión)**:
  - Título gigante con peso tipográfico alto (`text-5xl font-extrabold text-slate-900 tracking-tight`). Ej: "La plataforma escolar inteligente para la Venezuela de hoy."
  - Subtítulo explicativo enfocado en resolver dolores reales: "Automatiza la conciliación de Pago Móvil, controla asistencias desde el celular y mantén informados a los representantes en un solo lugar" [1, 3].
  - Botones CTA gemelos de gran tamaño y esquinas redondeadas: "Registrar mi Plantel 🚀" (conecta a `/register`) e "Iniciar Sesión" (conecta a `/login`) [1].
- **Sección de Características (Los 4 Pilares)**:
  - Una cuadrícula (Grid) interactiva de 4 tarjetas elegantes (Administrador, Docente, Representante, Estudiante), cada una ilustrando con iconos sutiles de Lucide y textos de alto valor sus funciones core (conciliación, asistenciario móvil, agenda digital, etc.) [1, 3].
- **Sección "Diseñado para Venezuela"**:
  - Explicar los diferenciales locales únicos: tasa BCV del día automática integrada en la conversión, RIF, soporte local en Miranda y optimización para teléfonos de gama media con conexiones de datos móviles intermitentes [1, 3].

## 📝 Pasos a ejecutar

- [ ] **Paso 1: Reemplazar la Raíz (`src/app/page.tsx`).**
      Sobrescribir el archivo de la página raíz con el diseño completo de la Landing Page [3].
- [ ] **Paso 2: Enlazar los CTAs.**
      Garantizar que todos los botones de registro redireccionen a `/register` y los de login a `/login` [1].
- [ ] **Paso 3: Responsive Checks.**
      Asegurar que la grilla y la sección Hero se adapten perfectamente a pantallas de teléfonos (un solo scroll continuo, textos adaptables).
