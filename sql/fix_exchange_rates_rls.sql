-- ==============================================================================
-- EDULINK: Habilitar lectura de tasas de cambio (BCV) a todos los usuarios autenticados
-- ==============================================================================
-- Permite que los representantes, estudiantes y docentes puedan consultar la tasa oficial
-- del BCV cargada por la institución o sincronizada por el Cron Job.

DROP POLICY IF EXISTS "authenticated_read_exchange_rates" ON public.exchange_rates;

CREATE POLICY "authenticated_read_exchange_rates"
  ON public.exchange_rates
  FOR SELECT
  TO authenticated
  USING (true);
