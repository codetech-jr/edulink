# 🚀 Tarea 17: Reestructuración UI Premium Portales B2C (Padres y Alumnos)

## Contexto

Proyecto: EduLink (SaaS EdTech).
Objetivo: Elevar las rutas `/representante` y `/estudiante` al estándar visual establecido en el nuevo Login. Abandonar los bordes gruesos y colores básicos por un diseño minimalista, sutil y de alta tecnología.

## 🎨 1. Frontend UI Engineering (App Shell Mobile)

- **Top Bar Institucional**: Una barra superior fija (`sticky top-0`) con el logo de EduLink sutil, un fondo con blur (`backdrop-blur-md`) y un avatar/menú para cerrar sesión.
- **Jerarquía Visual**:
  - Reemplazar los colores de fondo actuales por `bg-zinc-50` (gris seda muy claro).
  - Usar bordes `border-zinc-200` extremadamente finos en lugar de sombras pesadas.
  - Tipografía: Aumentar el interlineado y el tracking (espaciado entre letras) para dar un look premium.
- **Tab System Pro**: Los botones de navegación (Finanzas, Académico, Comunicados) no deben parecer pestañas de Excel. Deben ser píldoras minimalistas que cambien suavemente de estado.

## 🖱️ 2. Visual Enhancements (B2B SaaS Style)

- **Status Pills**: Los estados de pago (`Confirmado`, `Pendiente`) y asistencia deben ser sutiles. En lugar de cuadros de colores chillones, usar textos pequeños con un círculo de color de 6px al lado (Ej. 🟢 Confirmado).
- **Tarjetas del Estudiante**: Diseñar el encabezado del hijo con un degradado de profundidad suave (zinc a blanco) y una foto/avatar que no rompa el esquema minimalista.

## 📝 Pasos a ejecutar (Para Antigravity)

- [ ] **Paso 1: Portal Representante Overhaul (`/representante/page.tsx`).**
      Refactorizar todo el layout visual. Implementar el encabezado superior estilizado. Mejorar la "Caja de Datos Bancarios" para que no ocupe tanto espacio visual (usar un acordeón o diseño plano).
- [ ] **Paso 2: Portal Estudiante Overhaul (`/estudiante/page.tsx`).**
      Alinearlo exactamente al mismo diseño del padre. Los horarios de clases deben verse como tarjetas de una agenda minimalista (Linear-style).
- [ ] **Paso 3: Unificación de Componentes.**
      Asegurar que los botones de "Reportar Pago" y "Descargar Boletín" usen el mismo color azul/indigo corporativo (`indigo-600`) definido en el Login.
