import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, Settings, History as HistoryIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Estoque', path: '/produtos', icon: Package },
  { name: 'Categorias', path: '/categorias', icon: Tags },
  { name: 'Histórico', path: '/historico', icon: HistoryIcon },
  { name: 'Configurações', path: '/configuracoes', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-64 flex-col h-full shrink-0 border-r border-[#E0E3E5] dark:border-slate-800 bg-white dark:bg-[#0f172a] transition-colors z-20">
      <div className="h-28 flex items-center justify-center shrink-0 border-b border-[#E0E3E5] dark:border-slate-800 transition-colors">
         <img src="/logo.png" alt="AutomaStock Logo" className="h-24 w-auto object-contain dark:invert-[0.8] dark:hue-rotate-180" />
      </div>
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium transition-colors relative group",
                isActive 
                  ? "text-white bg-[var(--primary)] shadow-sm" 
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-100"
              )
            }
          >
             {({ isActive }) => (
                <>
                  <item.icon className={cn("w-5 h-5 relative z-10 transition-colors", isActive ? "text-white" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300")} />
                  <span className="relative z-10">{item.name}</span>
                </>
             )}
          </NavLink>
        ))}
      </nav>
      <div className="p-6 text-xs text-gray-400 dark:text-gray-500 font-medium text-center shrink-0 border-t border-[#E0E3E5] dark:border-slate-800 transition-colors">
        Farmaku Admin v1
      </div>
    </aside>
  );
}
