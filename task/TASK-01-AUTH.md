# 🚀 Tarea 01: Implementación de Autenticación, Middleware y Ruteo por Roles

## Contexto

Proyecto: EduLink (SaaS EdTech local para Valles del Tuy).
Stack Base: Next.js 14 (App Router) + Supabase + TailwindCSS + TypeScript.

## 🏗️ 1. Next.js App Router Patterns (Reglas Arquitectónicas)

Se deben aplicar obligatoriamente los siguientes patrones del framework:

- **`@supabase/ssr`**: Es mandatorio el uso del manejo de cookies en Server-Side según la documentación reciente para App Router. NO usar `@supabase/auth-helpers`.
- **Route Groups**: Las rutas públicas van bajo la carpeta `src/app/(auth)` y las protegidas según el rol van bajo `src/app/(roles)/[admin|docente|representante]`.
- **Server Actions**: La lógica transaccional de iniciar sesión (`signIn`) debe estar encapsulada en Server Actions (`src/actions/auth-actions.ts`). NO realizar login desde un cliente (`use client`) llamando directamente a la BD.
- **Middleware**: Proteger todas las rutas internas y derivar/retornar usuarios si su sesión SSR es válida usando `src/middleware.ts`.

## 🎨 2. Frontend UI Engineering (Reglas de Interfaz)

- **Mobile-First Real**: Las interfaces deben estar pensadas primero para resoluciones de 375px (Dispositivos Android Gama Media típicos).
- **Feedback Sensorial UI**: Al disparar la acción de login en cliente, es estricto implementar `useFormStatus` y `useActionState`/`useFormState` para bloquear el botón, poner un spinner visual (Feedback) e impedir un "Double Submit" en internet lento.
- **Manejo de Errores Visuales**: Los fallos en el Auth Server Action se retornarán y dibujarán limpios en el front como text boxes en rojo suave o texto inferencial, no como alert browsers nativos o fallas sin explicación. Usa diseño plano (blanco, grises, azul base).

## 📝 Pasos a ejecutar (To-Do List para el Agente AI)

- [x] **Paso 1: Setup Supabase Utils.**
      Crear `src/utils/supabase/server.ts`, `client.ts` y `middleware.ts` con la estructura requerida para manejar las cookies base.
- [x] **Paso 2: Server Action de Acceso.**
      Desarrollar el `loginAction` que valide credenciales, recupere metadata. Posteriormente el Auth.id en auth.users, debe usarse para encontrar en la tabla pública "profiles" el `role`. Basado en ese enum string de rol de Supabase, definir la redirección a Next.
- [x] **Paso 3: Desarrollo de la Pantalla.**
      Crear UI del archivo de login: Componente modular del form en cliente (`src/app/(auth)/login/LoginForm.tsx`) anidando con `src/app/(auth)/login/page.tsx` estática superior y utilizando variables CSS en Tailwind que reflejen un look sobrio, institucional. 
- [x] **Paso 4: Rutas Seguras de los Tableros y validación de Redirección (Stubs)**.
      Preparar 3 skeleton pages para validar donde aterrizan los post-login: - `src/app/(roles)/admin/page.tsx` (Texto de Bienvenida al directivo) - `src/app/(roles)/docente/page.tsx` (Stub visual docente) - `src/app/(roles)/representante/page.tsx` (Stub móvil).
- [x] **Paso 5: Reglas de acceso globales (Edge).** Estructurar el middleware principal interceptando estas derivaciones.
