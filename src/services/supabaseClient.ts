import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis de ambiente não configuradas.\n\n' +
    'Por favor, verifique se o arquivo .env existe na raiz do projeto com:\n' +
    'VITE_SUPABASE_URL=https://ifjikwivcmncwnhrmhrp.supabase.co\n' +
    'VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n\n' +
    'Depois reinicie o servidor de desenvolvimento (npm run dev)'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
