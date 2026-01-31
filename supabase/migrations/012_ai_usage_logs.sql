-- AI Usage Logs: Rastreia uso de tokens de IA para controle de custos
CREATE TABLE ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL, -- 'copilot', 'hero_card', 'interview_question', 'interview_feedback', 'insight'
  model TEXT NOT NULL,
  prompt_tokens INTEGER NOT NULL,
  completion_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  estimated_cost DECIMAL(10, 6),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own logs
CREATE POLICY "Users can view own ai usage logs" ON ai_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert logs (used by server actions)
CREATE POLICY "Service role can insert ai usage logs" ON ai_usage_logs
  FOR INSERT WITH CHECK (true);

-- Indexes for efficient queries
CREATE INDEX idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX idx_ai_usage_logs_created_at ON ai_usage_logs(created_at);
CREATE INDEX idx_ai_usage_logs_feature ON ai_usage_logs(feature);

-- Comment for documentation
COMMENT ON TABLE ai_usage_logs IS 'Tracks AI token usage and estimated costs per user and feature';
