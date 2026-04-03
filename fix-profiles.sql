-- 1. Inserir manualmente na tabela public.profiles a conta que você já criou.
-- (Isso previne o erro de Foreign Key Violation ao tentar criar categorias/produtos)
INSERT INTO public.profiles (id, email, nome)
SELECT id, email, raw_user_meta_data->>'nome'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 2. Criar automaticamente o Profile sempre que uma nova conta for registrada
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'nome');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. O gatilho (Trigger) que roda a função acima na tabela auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
