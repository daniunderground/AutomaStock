import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, Settings, History as HistoryIcon } from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Estoque', path: '/produtos', icon: Package },
  { name: 'Categorias', path: '/categorias', icon: Tags },
  { name: 'Histórico', path: '/historico', icon: HistoryIcon },
  { name: 'Configurações', path: '/configuracoes', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-64 bg-[#060d20] flex-col h-full text-[#dbe2fd] shrink-0 border-r border-[#3e4a3f]/10">
      <div className="h-20 flex items-center px-6 shrink-0 border-b border-[#3e4a3f]/10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#6ee591] to-[#50c878] bg-clip-text text-transparent tracking-tight font-['Manrope']">
          AutomaStock
        </h1>
      </div>
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-[#2d3449] text-[#6ee591] shadow-[0_4px_20px_rgba(219,226,253,0.02)]" 
                  : "text-[#bdcabc] hover:bg-[#131b2e] hover:text-[#dbe2fd]"
              )
            }
          >
            <item.icon className={cn("w-5 h-5", "opacity-90")} />
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="p-6 text-xs text-[#bdcabc]/60 text-center shrink-0">
        AutomaStock v1.0.0
      </div>
    </aside>
  );
}
