# 🚀 Tarea 09: Ecosistema Completo del Representante (Tabs, Académico y Comunicados)

## Contexto

Proyecto: EduLink (SaaS EdTech).
Estado actual: El portal del representante está 100% enfocado en finanzas (Vista única).
Objetivo del Product Owner: Expandir la experiencia de los padres añadiendo pestañas de navegación (Tabs) que integren el lado académico (Asistencia/Horario/Boletín) y las comunicaciones oficiales (Avisos de reuniones/Eventos), fidelizando el uso diario de la app.

## 🏗️ 1. Next.js App Router Patterns

- **Layout Tabs Pattern**: Reestructurar el dashboard del representante `src/app/(roles)/representante/page.tsx`. Añadir una navegación por pestañas en cliente (state con `useState` o via Parámetros de URL `?tab=academico`).
- **Data Fetching de Componentes**: Separar lógicamente las peticiones:
  - La pestaña Académica debe consultar en la DB la tabla de `attendance` (Asistencia reciente) del alumno y simular la disponibilidad de "Descargar Boletín" en PDF.
  - La pestaña Comunicados usará mock data o consultará notificaciones recientes (reuniones pautadas, recordatorios).

## 🎨 2. Frontend UI Engineering (Fidelización B2C)

- **Navegación tipo App Móvil**: Botones inferiores (Bottom Navigation) o pestañas tipo "Pill" en la parte superior que filtren las vistas en: [Pagos], [Académico], [Comunicados].
- **Módulo Académico**: Tarjeta limpia del estudiante mostrando su Grado/Sección. Un Widget "Semáforo" de asistencias de la semana. Un botón gris "Imprimir Boletín Lapsos". Placeholder elegante que diga "Historial de Conducta (Próximamente)".
- **Módulo Comunicados**: Feed (Muro) con notificaciones urgentes estilo X (Twitter) / WhatsApp (Ej: "Reunión de representantes 14/06 - Asistencia Obligatoria").

## 📝 Pasos a ejecutar (To-Do List para el AI Agent)

- [ ] **Paso 1: Refactorización a Tabs (UI).**
      Convertir el Dashboard principal en una estructura con navegación por Pestañas (`Tabs`). Enviar el módulo financiero actual (botón reportar pago e historial) a la pestaña 'Finanzas'.
- [ ] **Paso 2: Vista 'Académico' (Stubs y Queries básicos).**
      Construir el sub-panel Académico mostrando tarjeta con Asistencia (si `attendance` permite), un horario simple visual (simulado) y el Botón de "Boletín PDF". Añadir el placeholder "Registro Disciplinario".
- [ ] **Paso 3: Vista 'Comunicados' (Information Feed).**
      Crear la pestaña de comunicados visuales. Diseño atractivo, mostrando tarjetas con icono de alerta/campana que detallen citas escolares o noticias (Mock de eventos para MVP).
