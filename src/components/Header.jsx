import useStore from '../store/useStore';
import { Bell } from 'lucide-react';

export function Header() {
  const { user } = useStore();

  return (
    <header className="h-20 bg-[#0b1326] border-b border-[#3e4a3f]/10 flex items-center justify-between md:justify-end px-6 shrink-0 z-10 sticky top-0">
      {/* Mobile Logo Viewer (Hidden on MD because Sidebar has it) */}
      <div className="md:hidden flex items-center">
        <h1 className="text-xl font-bold bg-gradient-to-r from-[#6ee591] to-[#50c878] bg-clip-text text-transparent tracking-tight font-['Manrope']">
          AutomaStock
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <button className="text-[#bdcabc] hover:text-[#dbe2fd] transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ffb4ab] rounded-full ring-2 ring-[#0b1326]"></span>
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-medium leading-none text-[#dbe2fd]">{user?.nome || 'Daniel Silva'}</span>
            <span className="text-xs text-[#bdcabc] mt-1">{user?.email || 'Admin'}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#131b2e] to-[#222a3e] border border-[#3e4a3f]/30 flex items-center justify-center text-[#6ee591] font-bold text-sm shadow-inner">
            {user?.nome?.charAt(0) || 'D'}
          </div>
        </div>
      </div>
    </header>
  );
}
