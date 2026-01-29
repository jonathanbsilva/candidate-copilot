-- Applications table for tracking job applications manually
CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'aplicado',
  notes TEXT,
  job_description TEXT,
  url TEXT,
  salary_range TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: usuarios so veem suas proprias aplicacoes
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own applications" ON applications
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX applications_user_id_idx ON applications(user_id);
CREATE INDEX applications_status_idx ON applications(status);
CREATE INDEX applications_created_at_idx ON applications(created_at DESC);

-- Status history table for tracking status changes
CREATE TABLE status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- RLS via aplicacao pai
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own status history" ON status_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = status_history.application_id 
      AND applications.user_id = auth.uid()
    )
  );

CREATE INDEX status_history_application_id_idx ON status_history(application_id);
CREATE INDEX status_history_changed_at_idx ON status_history(changed_at DESC);

-- Function to auto-update updated_at on applications
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
