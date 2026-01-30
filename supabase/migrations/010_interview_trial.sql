-- Adicionar coluna para rastrear entrevistas usadas (trial vitalicio)
-- NAO reseta mensalmente - e um trial de 1 entrevista gratuita para sempre

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS interviews_used INTEGER NOT NULL DEFAULT 0;

-- Comentario para documentacao
COMMENT ON COLUMN user_profiles.interviews_used IS 'Numero de entrevistas Interview Pro usadas. Free users tem 1 trial vitalicio. NAO reseta mensalmente.';
