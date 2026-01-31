-- =============================================================
-- SEED: Dados de benchmark para teste
-- =============================================================
-- Requisitos para o benchmark aparecer:
--   - Mínimo 50 aplicações na base
--   - Mínimo 10 usuários com 3+ aplicações cada
--
-- Este script cria:
--   - 15 usuários fake
--   - ~85 aplicações distribuídas
--
-- IMPORTANTE: Rodar apenas em ambiente de desenvolvimento/staging!
-- =============================================================

-- Desabilitar RLS temporariamente para inserir dados
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;

-- =============================================================
-- 1. Criar usuários fake em auth.users
-- =============================================================
-- Nota: Em Supabase local, você pode inserir diretamente em auth.users
-- Em produção, isso não é recomendado!

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
)
SELECT
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000'::uuid,
  'fake_user_' || n || '@benchmark.test',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW() - (random() * interval '90 days'),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  'authenticated',
  'authenticated'
FROM generate_series(1, 15) AS n
ON CONFLICT DO NOTHING;

-- =============================================================
-- 2. Criar user_profiles para os usuários fake
-- =============================================================
-- O trigger deveria criar automaticamente, mas vamos garantir

INSERT INTO user_profiles (user_id, plan)
SELECT id, 'free'
FROM auth.users
WHERE email LIKE '%@benchmark.test'
ON CONFLICT (user_id) DO NOTHING;

-- =============================================================
-- 3. Criar aplicações para cada usuário
-- =============================================================
-- Distribuição realista de status:
--   aplicado: 35%
--   em_analise: 20%
--   entrevista: 15%
--   proposta: 5%
--   aceito: 3%
--   rejeitado: 17%
--   desistencia: 5%

DO $$
DECLARE
  user_record RECORD;
  num_applications INT;
  i INT;
  status_roll FLOAT;
  app_status TEXT;
  companies TEXT[] := ARRAY[
    'Tech Corp', 'Startup XYZ', 'Mega Company', 'Innovation Labs', 'Digital Solutions',
    'Cloud Nine', 'Data Driven', 'AI Masters', 'Code Factory', 'Web Wizards',
    'Mobile First', 'Scale Up', 'Growth Hack', 'Product Co', 'Design Studio',
    'Fintech Pro', 'Health Tech', 'Edu Learn', 'E-commerce Plus', 'Social Media Inc'
  ];
  titles TEXT[] := ARRAY[
    'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'Senior Developer', 'Tech Lead', 'Engineering Manager', 'DevOps Engineer',
    'Product Manager', 'UX Designer', 'Data Analyst', 'Data Engineer',
    'Mobile Developer', 'QA Engineer', 'Site Reliability Engineer'
  ];
BEGIN
  -- Loop por cada usuário fake
  FOR user_record IN 
    SELECT id FROM auth.users WHERE email LIKE '%@benchmark.test'
  LOOP
    -- Número aleatório de aplicações (4 a 8 por usuário)
    num_applications := 4 + floor(random() * 5)::int;
    
    FOR i IN 1..num_applications LOOP
      -- Roll para determinar status
      status_roll := random();
      
      IF status_roll < 0.35 THEN
        app_status := 'aplicado';
      ELSIF status_roll < 0.55 THEN
        app_status := 'em_analise';
      ELSIF status_roll < 0.70 THEN
        app_status := 'entrevista';
      ELSIF status_roll < 0.75 THEN
        app_status := 'proposta';
      ELSIF status_roll < 0.78 THEN
        app_status := 'aceito';
      ELSIF status_roll < 0.95 THEN
        app_status := 'rejeitado';
      ELSE
        app_status := 'desistencia';
      END IF;
      
      INSERT INTO applications (
        user_id,
        company,
        title,
        status,
        notes,
        location,
        created_at,
        updated_at
      ) VALUES (
        user_record.id,
        companies[1 + floor(random() * array_length(companies, 1))::int],
        titles[1 + floor(random() * array_length(titles, 1))::int],
        app_status,
        CASE WHEN random() > 0.7 THEN 'Notas de teste para benchmark' ELSE NULL END,
        CASE 
          WHEN random() < 0.5 THEN 'Remoto'
          WHEN random() < 0.7 THEN 'São Paulo, SP'
          WHEN random() < 0.85 THEN 'Rio de Janeiro, RJ'
          ELSE 'Híbrido'
        END,
        NOW() - (random() * interval '60 days'),
        NOW() - (random() * interval '30 days')
      );
    END LOOP;
  END LOOP;
END $$;

-- =============================================================
-- 4. Reabilitar RLS
-- =============================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- 5. Verificar os dados inseridos
-- =============================================================
SELECT 
  'Total de aplicações: ' || COUNT(*)::text AS info
FROM applications
WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE '%@benchmark.test');

SELECT 
  'Usuários com 3+ aplicações: ' || COUNT(*)::text AS info
FROM (
  SELECT user_id, COUNT(*) as total
  FROM applications
  WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE '%@benchmark.test')
  GROUP BY user_id
  HAVING COUNT(*) >= 3
) sub;

SELECT 
  status,
  COUNT(*) as quantidade,
  ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM applications WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE '%@benchmark.test'))), 1) as percentual
FROM applications
WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE '%@benchmark.test')
GROUP BY status
ORDER BY quantidade DESC;

-- =============================================================
-- PARA LIMPAR OS DADOS DE TESTE (rodar separadamente se necessário):
-- =============================================================
-- DELETE FROM applications WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE '%@benchmark.test');
-- DELETE FROM user_profiles WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE '%@benchmark.test');
-- DELETE FROM auth.users WHERE email LIKE '%@benchmark.test';
