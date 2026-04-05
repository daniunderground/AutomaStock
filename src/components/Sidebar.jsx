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
    <aside className="hidden md:flex md:w-64 flex-col h-full shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm z-20 transition-colors">
      <div className="h-28 flex items-center justify-center shrink-0 border-b border-gray-100 dark:border-gray-700/50">
         <img src="/logo.png" alt="AutomaStock Logo" className="h-24 w-auto object-contain" />
      </div>
      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors relative group",
                isActive 
                  ? "text-[#0084FF] dark:text-blue-400 bg-[#EBF5FF] dark:bg-blue-500/10" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-50"
              )
            }
          >
             {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#0084FF] rounded-r-md"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className={cn("w-5 h-5 relative z-10 transition-colors", isActive ? "text-[#0084FF] dark:text-blue-400" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300")} />
                  <span className="relative z-10">{item.name}</span>
                </>
             )}
          </NavLink>
        ))}
      </nav>
      <div className="p-6 text-xs text-gray-400 dark:text-gray-500 font-medium text-center shrink-0 border-t border-gray-100 dark:border-gray-700/50">
        AutomaStock v2
      </div>
    </aside>
  );
}
