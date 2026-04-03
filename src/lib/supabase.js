import { createClient } from '@supabase/supabase-js';

// Pegando as variáveis do .env.local criado usando o padrão do Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verifica se as variáveis estão presentes antes de inicializar o client
if (!supabaseUrl || !supabaseKey) {
    console.error("Faltando variáveis de ambiente do Supabase!");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
