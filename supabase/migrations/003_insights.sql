-- Insights table for storing generated career insights
CREATE TABLE insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados de entrada (contexto do usuario)
  cargo TEXT NOT NULL,
  senioridade TEXT NOT NULL,
  area TEXT NOT NULL,
  status TEXT NOT NULL,
  tempo_situacao TEXT,
  urgencia INTEGER,
  objetivo TEXT NOT NULL,
  objetivo_outro TEXT,
  
  -- Resultado gerado
  recommendation TEXT NOT NULL,
  why JSONB NOT NULL,        -- array de strings
  risks JSONB NOT NULL,      -- array de strings
  next_steps JSONB NOT NULL, -- array de strings
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: usuarios so veem seus proprios insights
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own insights" ON insights
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX insights_user_id_idx ON insights(user_id);
CREATE INDEX insights_created_at_idx ON insights(created_at DESC);
