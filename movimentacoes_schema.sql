-- Supabase Schema: Histórico de Movimentações (Entradas e Saídas)

-- 1. Tabela de Movimentações
CREATE TABLE public.movimentacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  produto_id UUID REFERENCES public.produtos(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT CHECK (tipo IN ('entrada', 'saida')) NOT NULL,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  motivo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar RLS
ALTER TABLE public.movimentacoes ENABLE ROW LEVEL SECURITY;

-- Políticas para Movimentações
CREATE POLICY "Usuários podem gerenciar suas próprias movimentacoes"
  ON public.movimentacoes FOR ALL
  USING (auth.uid() = user_id);

-- 2. Gatilho (Trigger) para atualizar a quantidade do produto automaticamente
CREATE OR REPLACE FUNCTION update_estoque_on_movimentacao()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tipo = 'entrada' THEN
    UPDATE public.produtos
    SET quantidade = quantidade + NEW.quantidade
    WHERE id = NEW.produto_id;
  ELSIF NEW.tipo = 'saida' THEN
    UPDATE public.produtos
    SET quantidade = quantidade - NEW.quantidade
    WHERE id = NEW.produto_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_movimentacao_estoque
AFTER INSERT ON public.movimentacoes
FOR EACH ROW EXECUTE PROCEDURE update_estoque_on_movimentacao();
