import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Categories } from './pages/Categories';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { History } from './pages/History';
import { useEffect, useState } from 'react';
import useStore from './store/useStore';
import { supabase } from './lib/supabase';

function App() {
  const { theme, setSession, session, fetchCategories, fetchProducts } = useStore();
  const [initLoading, setInitLoading] = useState(true);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    // Pegar sessão atual na inicialização
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitLoading(false);
      if (session) {
        fetchCategories();
        fetchProducts();
      }
    });

    // Escutar mudanças de autenticação (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchCategories();
        fetchProducts();
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, fetchCategories, fetchProducts]);

  if (initLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">Carregando...</div>;
  }

  // Se não estiver logado, a única rota é a de Login
  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Se estiver logado, exibe a aplicação principal
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="produtos" element={<Inventory />} />
        <Route path="categorias" element={<Categories />} />
        <Route path="historico" element={<History />} />
        <Route path="configuracoes" element={<Settings />} />
        {/* Rota Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
      <Route path="/login" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
