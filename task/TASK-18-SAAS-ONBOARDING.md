# 🚀 Tarea 18: Registro Autónomo de Nuevos Colegios (Onboarding B2B SaaS)

## Contexto

Proyecto: EduLink (SaaS EdTech).
Estado actual: Los portales son 100% dinámicos pero el primer colegio fue creado manualmente en Supabase.
Objetivo: Crear la ruta pública `/register` para que cualquier director de escuela pueda registrar su institución y su cuenta de administrador de forma autónoma, aislando su base de datos bajo un nuevo `school_id` [1, 3, 4].

## 🏗️ 1. Next.js App Router Patterns

- **Ruta Pública de Onboarding**: Crear `src/app/(auth)/register/page.tsx`. Debe ser añadida al Middleware (`middleware.ts`) dentro de las rutas públicas de autenticación (`AUTH_ROUTES`) para que permita el acceso sin sesión activa.
- **Server Action Transaccional**: Crear la acción `registerSchoolAction` en `src/actions/auth-actions.ts`. Esta acción debe ejecutar de forma segura en el servidor:
  1. Validar campos (Nombre Colegio, RIF, Nombre Director, Correo, Clave).
  2. Insertar el nuevo colegio en la tabla `schools` para generar su UUID (`school_id`) [3].
  3. Ejecutar el `signUp` de Supabase Auth para crear el usuario del director [3].
  4. Crear su perfil en `profiles` con el rol `admin` y el nuevo `school_id` generado [3].
  5. Redirigir de forma automática al nuevo administrador hacia `/admin` [3].

## 🎨 2. Frontend UI Engineering (Split-Screen Overhaul)

- **Coherencia con el Login**: La pantalla `/register` debe heredar el mismo diseño "Split-Screen" premium de Vercel/Stripe que construimos para el Login.
  - _Lado Izquierdo_: Formulario de registro limpio con un asistente de dos pasos o un diseño plano muy bien distribuido (Datos del Colegio + Datos del Director).
  - _Lado Derecho_: El mismo panel decorativo de alta tecnología con mensajes de confianza del SaaS (infraestructura, uptime, cifrado).

## 📝 Pasos a ejecutar

- [ ] **Paso 1: Middleware Update.**
      Añadir la ruta `/register` al array `AUTH_ROUTES` de `src/middleware.ts` para que no sea interceptada por la seguridad.
- [ ] **Paso 2: Server Action `registerSchoolAction`.**
      Desarrollar la acción en `src/actions/auth-actions.ts` garantizando que inserte primero la escuela, cree el usuario y finalmente enlace el perfil administrativo con el nuevo `school_id` [3].
- [ ] **Paso 3: Pantalla Visual de Registro.**
      Crear la página `src/app/(auth)/register/page.tsx` con el formulario de onboarding y el diseño Split-Screen unificado con el de Login.
