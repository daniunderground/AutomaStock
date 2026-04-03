import useStore from '../store/useStore';
import { Moon, Sun, LogOut } from 'lucide-react';

export function Settings() {
  const { theme, toggleTheme, user } = useStore();

  return (
    <div className="space-y-6 md:space-y-8 max-w-2xl pb-10">
      <div>
        <h1 className="text-3xl font-['Manrope'] font-bold tracking-tight text-[#dbe2fd]">Configurações</h1>
        <p className="text-[#bdcabc] mt-1 text-sm md:text-base">Gerencie suas preferências e sua conta</p>
      </div>

      <div className="bg-[#131b2e] border border-[#3e4a3f]/20 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col">
        <div className="p-6 md:p-8 border-b border-[#3e4a3f]/20 bg-[#171f33]/80 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#6ee591] to-[#50c878] flex items-center justify-center text-[#00210c] text-4xl font-bold shadow-[0_4px_16px_rgba(80,200,120,0.3)] shrink-0 border-4 border-[#131b2e]">
            {user?.nome?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#dbe2fd] tracking-tight">{user?.nome || 'Usuário'}</h2>
            <p className="text-[#bdcabc] mt-1 font-mono text-sm">{user?.email || 'email@exemplo.com'}</p>
          </div>
        </div>
        
        <div className="p-6 md:p-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-3 text-[#dbe2fd]">
                {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                Tema da Interface
              </h3>
              <p className="text-sm text-[#bdcabc] mt-1.5">O AutomaStock agora usa o Obsidian Flux por padrão. Você pode alternar se preferir.</p>
            </div>
            <button 
              onClick={toggleTheme}
              className="px-6 py-3 border border-[#3e4a3f]/30 rounded-xl font-bold bg-[#171f33] hover:bg-[#1a2336] hover:border-[#3e4a3f]/60 text-[#dbe2fd] transition-all shadow-sm shrink-0 w-full md:w-auto text-center cursor-pointer"
            >
              {theme === 'dark' ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
            </button>
          </div>
          
          <hr className="border-[#3e4a3f]/20" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="font-bold text-lg text-[#ffb4ab] flex items-center gap-3">
                <LogOut className="w-5 h-5" />
                Encerrar Sessão
              </h3>
              <p className="text-sm text-[#bdcabc] mt-1.5">Sair da sua conta no AutomaStock com segurança.</p>
            </div>
            <button 
              className="px-6 py-3 bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/20 rounded-xl font-bold hover:bg-[#ffb4ab]/20 transition-all shadow-sm shrink-0 w-full md:w-auto text-center cursor-pointer"
            >
              Sair da Conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
