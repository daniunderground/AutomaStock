import { useState, useRef, useEffect } from 'react';
import useStore from '../store/useStore';
import { Bell, AlertTriangle, PackageOpen, Search, Settings, Sun, Moon, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const { user, products, categories, signOut, theme, setTheme, searchQuery, setSearchQuery } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const themeDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target)) {
        setShowThemeDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const lowStockProducts = products?.filter(p => p.quantidade <= (p.quantidade_minima || 0)) || [];
  const hasNotifications = lowStockProducts.length > 0;

  return (
    <header className="h-20 bg-surface border-b border-border-color flex items-center justify-between px-6 shrink-0 z-10 sticky top-0 shadow-sm transition-colors">
      {/* Mobile Logo Viewer (Hidden on MD because Sidebar has it) */}
      <div className="md:hidden flex items-center mt-2">
        <img src="/logo.png" alt="AutomaStock Logo" className="h-16 w-auto object-contain hidden dark:block brightness-0 invert" />
        <img src="/logo.png" alt="AutomaStock Logo" className="h-16 w-auto object-contain block dark:hidden" />
      </div>

      {/* Farmaku Search Bar */}
      <div className="hidden md:flex flex-1 max-w-lg items-center relative mr-6">
        <Search className="w-5 h-5 text-foreground/40 absolute left-4" />
        <input 
          type="text" 
          placeholder="Search..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-11 pl-12 pr-4 bg-background text-foreground placeholder-foreground/30 rounded-full border border-border-color focus:ring-2 focus:ring-[var(--primary-container)] outline-none transition-shadow shadow-sm"
        />
      </div>

      <div className="flex items-center gap-4 md:gap-6 ml-auto">
        
        <div className="flex items-center gap-2">
          {/* Theme Selector */}
          <div className="flex items-center bg-foreground/5 rounded-full p-1 border border-border-color">
            <button 
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-full transition-all ${theme === 'light' ? 'bg-surface text-[var(--primary)] shadow-sm' : 'text-foreground/40 hover:text-foreground cursor-pointer'}`}
              title="Dia"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setTheme('system')}
              className={`p-1.5 rounded-full transition-all ${theme === 'system' ? 'bg-surface text-[var(--primary)] shadow-sm' : 'text-foreground/40 hover:text-foreground cursor-pointer'}`}
              title="Sistema"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-full transition-all ${theme === 'dark' ? 'bg-surface text-[var(--primary)] shadow-sm' : 'text-foreground/40 hover:text-foreground cursor-pointer'}`}
              title="Noite"
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>

          {/* Notifications */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white transition-colors relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ${showNotifications ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white' : ''}`}
            title="Notificações"
          >
            <Bell className="w-5 h-5" />
            {hasNotifications && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--error)] rounded-full ring-2 ring-white dark:ring-gray-900"></span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50 origin-top-right transition-colors"
              >
                <div className="px-4 py-3 border-b border-border-color flex justify-between items-center bg-foreground/5">
                  <h3 className="font-semibold text-foreground text-sm">Notificações</h3>
                  {hasNotifications && (
                    <span className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium px-2 py-0.5 rounded-full">
                      {lowStockProducts.length} novas
                    </span>
                  )}
                </div>
                
                <div className="max-h-[320px] overflow-y-auto">
                  {hasNotifications ? (
                    <div className="divide-y divide-gray-50 dark:divide-gray-800">
                      {lowStockProducts.map(product => (
                        <div key={product.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex gap-3 items-start">
                          <div className="pt-0.5">
                            <div className="bg-amber-50 dark:bg-amber-900/30 text-amber-500 p-1.5 rounded-full">
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight">
                              Baixo estoque: {product.nome}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                              Restam apenas {product.quantidade} unidades (Mín: {product.quantidade_minima || 0}).
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center flex flex-col items-center">
                      <div className="bg-gray-50 p-3 rounded-full mb-3 text-gray-400">
                        <PackageOpen className="w-6 h-6" />
                      </div>
                      <p className="text-sm text-gray-500">Nenhum alerta de estoque no momento.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

        {/* User Info */}
        <div className="relative" ref={userDropdownRef}>
          <div 
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className={`flex items-center gap-3 cursor-pointer group transition-all p-1.5 rounded-xl hover:bg-foreground/5 ${showUserDropdown ? 'bg-foreground/5' : ''}`}
          >
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold leading-none text-foreground transition-colors tracking-tight">
                {user?.nome || 'Admin'}
              </span>
              <span className="text-[11px] text-foreground/50 mt-1 font-medium">{user?.email || 'admin@farmaku.com'}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-semibold text-sm shadow-sm transition-all group-hover:scale-105 active:scale-95 ring-2 ring-transparent group-hover:ring-[var(--primary-container)]">
              {user?.nome?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>

          <AnimatePresence>
            {showUserDropdown && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-3 w-64 bg-surface rounded-2xl shadow-xl border border-border-color overflow-hidden z-50 origin-top-right transition-colors"
              >
                <div className="p-4 bg-foreground/5 border-b border-border-color">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xl font-bold">
                      {user?.nome?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate text-base leading-tight">{user?.nome || 'Admin'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user?.email || 'admin@farmaku.com'}</p>
                    </div>
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  <button 
                    onClick={() => {
                      window.location.href = '/configuracoes';
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group/item"
                  >
                    <div className="text-gray-400 dark:text-gray-500 group-hover/item:text-[var(--primary)] transition-all">
                      <Settings className="w-4 h-4" />
                    </div>
                    Settings
                  </button>

                  <button 
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors cursor-pointer group/item"
                  >
                    <div className="text-red-400 group-hover/item:text-red-600 dark:group-hover/item:text-red-400 transition-all">
                      <PackageOpen className="w-4 h-4 rotate-180" />
                    </div>
                    Log out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
