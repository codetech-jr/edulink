# 🚀 Tarea 20: Automatización de Tasa de Cambio Oficial (API BCV / DolarApi)

## Contexto

Proyecto: EduLink (SaaS EdTech).
Estado actual: El sistema requiere que el administrador registre manualmente la tasa de cambio en `/admin/payments` escribiendo el número [3]. La landing page promociona "Conversión BCV Automática" [1].
Objetivo: Integrar el consumo de la API de DolarApi para Venezuela en el servidor, permitiendo al administrador previsualizar la tasa real del BCV y guardarla con un solo clic.

## 🏗️ 1. Next.js App Router Patterns

- **Data Fetching de Terceros (Server-Side)**: El Server Component `/admin/payments/page.tsx` hará una petición `fetch('https://ve.dolarapi.com/v1/dolares/oficial')` directamente en el servidor antes de renderizar.
- **Manejo de Fallbacks**: Si la API externa llega a fallar o estar caída, el sistema debe ignorar silenciosamente la alerta externa y dejar que el administrador edite el campo manualmente, asegurando que el software nunca colapse por culpa de un servicio de terceros.

## 🎨 2. Frontend UI Engineering (Alerta de Sincronización)

- **Banner de Sincronización**: Si la tasa de la BD no coincide con la de la API externa del día, renderizar un banner sutil con borde verde (`bg-emerald-50 border-emerald-200`) que sugiera la sincronización de un solo toque: _"Tasa BCV oficial de hoy: X.XX Bs/$. Sincronizar de inmediato"_ [1].
- **Efecto de Carga**: Al presionar "Sincronizar", deshabilitar el botón y mostrar spinner mientras la Server Action escribe el registro en `exchange_rates` y revalida la vista [3].

## 📝 Pasos a ejecutar

- [ ] **Paso 1: Integrar Fetch de DolarApi.**
      En `/admin/payments/page.tsx`, hacer la petición asíncrona a `https://ve.dolarapi.com/v1/dolares/oficial` para recuperar el campo de cotización `promedio` (o `price`).
- [ ] **Paso 2: Comparación e Interfaz en Dashboard.**
      Si la tasa oficial de la API es distinta a la de nuestra BD para el día de hoy, inyectar el Banner de Alerta que invite a la actualización en un clic [1].
- [ ] **Paso 3: Conexión con Server Action.**
      Vincular el botón del banner con la acción `updateExchangeRateAction` existente para registrar la nueva tasa de cambio y revalidar la caché del sistema [3].
