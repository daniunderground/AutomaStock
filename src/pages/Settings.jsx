import useStore from '../store/useStore';
import { LogOut, Sun, Moon } from 'lucide-react';

export function Settings() {
  const { user, theme, toggleTheme, signOut } = useStore();

  return (
    <div className="space-y-6 md:space-y-8 max-w-2xl pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Configurações</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">Gerencie suas preferências e sua conta</p>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden flex flex-col transition-colors">
        <div className="p-6 md:p-8 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 flex flex-col md:flex-row items-center gap-6 text-center md:text-left transition-colors">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-md shrink-0 border-4 border-white dark:border-gray-700">
            {user?.nome?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">{user?.nome || 'Usuário'}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1 font-mono text-sm">{user?.email || 'email@exemplo.com'}</p>
          </div>
        </div>
        
        <div className="p-6 md:p-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-3 text-gray-900 dark:text-gray-50">
                {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                Tema da Interface
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">Escolha o tema que mais se adapta a você.</p>
            </div>
            <button 
              onClick={toggleTheme}
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-all shadow-sm shrink-0 w-full md:w-auto text-center cursor-pointer"
            >
              {theme === 'dark' ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
            </button>
          </div>
          
          <hr className="border-gray-200 dark:border-gray-700" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="font-bold text-lg text-red-600 dark:text-red-400 flex items-center gap-3">
                <LogOut className="w-5 h-5" />
                Encerrar Sessão
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">Sair da sua conta no AutomaStock com segurança.</p>
            </div>
            <button 
              onClick={signOut}
              className="px-6 py-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-lg font-semibold hover:bg-red-100 dark:hover:bg-red-500/20 transition-all shadow-sm shrink-0 w-full md:w-auto text-center cursor-pointer"
            >
              Sair da Conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
