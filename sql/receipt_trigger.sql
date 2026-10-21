-- ==============================================================================
-- EDULINK: MIGRACIÓN DE NUMERACIÓN CORRELATIVA DE RECIBOS DE PAGO
-- ==============================================================================
-- Asigna automáticamente números de recibo correlativos por colegio y año:
-- Formato: REC-{AÑO}-{NUMERO:05d} (ej: REC-2026-00042)
-- Se dispara automáticamente cuando un pago cambia a status = 'confirmado'.
-- ==============================================================================

-- 1. Agregar la columna receipt_number a la tabla payments
ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS receipt_number TEXT;

-- Índice para búsquedas rápidas por número de recibo e institución
CREATE INDEX IF NOT EXISTS idx_payments_school_receipt 
  ON public.payments (school_id, receipt_number);

-- 2. Crear tabla auxiliar para control de secuencias correlativas por colegio y año
CREATE TABLE IF NOT EXISTS public.receipt_sequences (
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  year INT NOT NULL,
  current_number INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (school_id, year)
);

-- Habilitar y forzar Row Level Security en la tabla de secuencias
ALTER TABLE public.receipt_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_sequences FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "receipt_sequences_admin_policy" ON public.receipt_sequences;
CREATE POLICY "receipt_sequences_admin_policy" ON public.receipt_sequences
  FOR ALL
  USING (school_id = (select public.get_my_school_id()))
  WITH CHECK (school_id = (select public.get_my_school_id()));

-- 3. Función PL/pgSQL para generar y asignar el número correlativo de recibo
CREATE OR REPLACE FUNCTION public.auto_assign_receipt_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year INT;
  v_next_val INT;
  v_receipt TEXT;
BEGIN
  -- Verificar si el estado del pago cambia a 'confirmado' y aún no tiene receipt_number
  IF NEW.status = 'confirmado' AND (OLD.status IS DISTINCT FROM 'confirmado' OR NEW.receipt_number IS NULL) THEN
    
    -- Extraer el año fiscal de la transacción (o el año en curso por defecto)
    v_year := EXTRACT(YEAR FROM COALESCE(NEW.transaction_date, CURRENT_DATE))::INT;
    
    -- Incrementar atómicamente el contador correlativo para el colegio y año
    INSERT INTO public.receipt_sequences (school_id, year, current_number)
    VALUES (NEW.school_id, v_year, 1)
    ON CONFLICT (school_id, year)
    DO UPDATE SET 
      current_number = receipt_sequences.current_number + 1,
      updated_at = now()
    RETURNING current_number INTO v_next_val;
    
    -- Formatear con padding de 5 dígitos: REC-2026-00042
    v_receipt := 'REC-' || v_year::TEXT || '-' || LPAD(v_next_val::TEXT, 5, '0');
    
    -- Asignar el número de recibo en la tabla payments
    UPDATE public.payments
    SET receipt_number = v_receipt
    WHERE id = NEW.id AND receipt_number IS NULL;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. Crear el Trigger AFTER UPDATE en public.payments
DROP TRIGGER IF EXISTS trigger_auto_assign_receipt_number ON public.payments;
CREATE TRIGGER trigger_auto_assign_receipt_number
  AFTER UPDATE ON public.payments
  FOR EACH ROW
  WHEN (NEW.status = 'confirmado' AND (OLD.status IS DISTINCT FROM 'confirmado' OR NEW.receipt_number IS NULL))
  EXECUTE FUNCTION public.auto_assign_receipt_number();

-- 5. Backfill: Numerar pagos que ya hayan sido confirmados previamente
DO $$
DECLARE
  rec RECORD;
  v_year INT;
  v_next_val INT;
  v_receipt TEXT;
BEGIN
  FOR rec IN 
    SELECT id, school_id, transaction_date 
    FROM public.payments 
    WHERE status = 'confirmado' AND receipt_number IS NULL 
    ORDER BY transaction_date ASC, created_at ASC 
  LOOP
    v_year := EXTRACT(YEAR FROM COALESCE(rec.transaction_date, CURRENT_DATE))::INT;
    
    INSERT INTO public.receipt_sequences (school_id, year, current_number)
    VALUES (rec.school_id, v_year, 1)
    ON CONFLICT (school_id, year)
    DO UPDATE SET 
      current_number = receipt_sequences.current_number + 1, 
      updated_at = now()
    RETURNING current_number INTO v_next_val;
    
    v_receipt := 'REC-' || v_year::TEXT || '-' || LPAD(v_next_val::TEXT, 5, '0');
    
    UPDATE public.payments 
    SET receipt_number = v_receipt 
    WHERE id = rec.id;
  END LOOP;
END $$;
