import { useState, useRef, useEffect } from 'react';
import useStore from '../store/useStore';
import { Bell, AlertTriangle, PackageOpen, Sun, Moon, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const { user, products, categories, theme, toggleTheme, signOut } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const lowStockProducts = products?.filter(p => p.quantidade <= (p.quantidade_minima || 0)) || [];
  const hasNotifications = lowStockProducts.length > 0;

  return (
    <header className="h-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between md:justify-end px-6 shrink-0 z-10 sticky top-0 shadow-sm transition-colors">
      {/* Mobile Logo Viewer (Hidden on MD because Sidebar has it) */}
      <div className="md:hidden flex items-center mt-2">
        <img src="/logo.png" alt="AutomaStock Logo" className="h-20 w-auto object-contain" />
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="text-gray-400 dark:text-gray-500 hover:text-amber-500 dark:hover:text-indigo-400 transition-colors relative p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title={theme === 'dark' ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors relative p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${showNotifications ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200' : ''}`}
            title="Notificações"
          >
            <Bell className="w-5 h-5" />
            {hasNotifications && (
              <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800"></span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 origin-top-right"
              >
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/80">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-50 text-sm">Notificações</h3>
                  {hasNotifications && (
                    <span className="bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium px-2 py-0.5 rounded-full">
                      {lowStockProducts.length} novas
                    </span>
                  )}
                </div>
                
                <div className="max-h-[320px] overflow-y-auto">
                  {hasNotifications ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                      {lowStockProducts.map(product => (
                        <div key={product.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex gap-3 items-start">
                          <div className="pt-0.5">
                            <div className="bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 p-1.5 rounded-full">
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
                      <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-full mb-3 text-gray-400 dark:text-gray-500">
                        <PackageOpen className="w-6 h-6" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum alerta de estoque no momento.</p>
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
            className={`flex items-center gap-3 cursor-pointer group transition-all p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 ${showUserDropdown ? 'bg-gray-100 dark:bg-gray-700/50' : ''}`}
          >
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-bold leading-none text-gray-900 dark:text-gray-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                {user?.nome || 'Daniel Silva'}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 font-mono">{user?.email || 'Admin'}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-white dark:border-gray-700 flex items-center justify-center text-white font-bold text-sm shadow-md transition-all group-hover:scale-105 active:scale-95 ring-2 ring-transparent group-hover:ring-blue-400/30">
              {user?.nome?.charAt(0).toUpperCase() || 'D'}
            </div>
          </div>

          <AnimatePresence>
            {showUserDropdown && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 origin-top-right transition-colors"
              >
                <div className="p-4 bg-gray-50/80 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-500/20">
                      {user?.nome?.charAt(0).toUpperCase() || 'D'}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="font-bold text-gray-900 dark:text-gray-50 truncate text-base leading-tight">{user?.nome || 'Daniel Silva'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user?.email || 'admin@automa.stock'}</p>
                    </div>
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  <div className="grid grid-cols-2 gap-2 p-2 mb-2">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors">
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Produtos</p>
                      <p className="text-lg font-black text-blue-600 dark:text-blue-400">{products.length}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors">
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Categorias</p>
                      <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{categories.length}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      window.location.href = '/configuracoes';
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group/item"
                  >
                    <div className="bg-gray-100 dark:bg-gray-600 p-1.5 rounded-lg group-hover/item:bg-blue-500 group-hover/item:text-white transition-all">
                      <Settings className="w-4 h-4" />
                    </div>
                    Minha Conta
                  </button>

                  <button 
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer group/item"
                  >
                    <div className="bg-red-100 dark:bg-red-500/10 p-1.5 rounded-lg group-hover/item:bg-red-500 group-hover/item:text-white transition-all">
                      <PackageOpen className="w-4 h-4 rotate-180" />
                    </div>
                    Sair da Conta
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
