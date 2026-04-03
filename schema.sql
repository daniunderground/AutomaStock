-- Supabase Schema para AutomaStock

-- Habilitar a extensão pgcrypto para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabela de Profiles (Perfis de Usuário)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nome TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para Profiles
CREATE POLICY "Usuários podem ver o próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar o próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Tabela de Categorias
CREATE TABLE public.categorias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  cor TEXT DEFAULT '#10b981', -- default emerald-500
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar RLS
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

-- Políticas para Categorias
CREATE POLICY "Usuários podem gerenciar suas próprias categorias"
  ON public.categorias FOR ALL
  USING (auth.uid() = user_id);

-- 3. Tabela de Produtos
CREATE TABLE public.produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  sku TEXT,
  descricao TEXT,
  preco_custo NUMERIC(10, 2) DEFAULT 0.00,
  preco_venda NUMERIC(10, 2) DEFAULT 0.00,
  quantidade INTEGER DEFAULT 0,
  imagem_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar RLS
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

-- Políticas para Produtos
CREATE POLICY "Usuários podem gerenciar seus próprios produtos"
  ON public.produtos FOR ALL
  USING (auth.uid() = user_id);

-- Atualizar updated_at no update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_produtos_updated_at
BEFORE UPDATE ON public.produtos
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Supabase Storage para Imagens dos Produtos (Bucket 'produtos')
INSERT INTO storage.buckets (id, name, public) VALUES ('produtos', 'produtos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas Storage: Usuários autenticados podem gerenciar imagens
CREATE POLICY "Qualquer um pode ver as imagens dos produtos"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'produtos' );

CREATE POLICY "Usuários autenticados podem fazer upload de imagens"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'produtos' AND auth.role() = 'authenticated' );

CREATE POLICY "Usuários autenticados podem atualizar próprias imagens"
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'produtos' AND auth.role() = 'authenticated' );

CREATE POLICY "Usuários autenticados podem deletar próprias imagens"
  ON storage.objects FOR DELETE
  USING ( bucket_id = 'produtos' AND auth.role() = 'authenticated' );
