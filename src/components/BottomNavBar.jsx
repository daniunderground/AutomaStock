import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, Maximize } from 'lucide-react';
import { cn } from '../lib/utils';
import { BarcodeScanner } from './BarcodeScanner';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Estoque', path: '/produtos', icon: Package },
  { name: 'Categorias', path: '/categorias', icon: Tags },
];

export function BottomNavBar() {
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();

  const handleScan = (decodedText) => {
    setIsScanning(false);
    // Vibrate device if supported
    if ("vibrate" in navigator) {
      navigator.vibrate(200);
    }
    // Navigate to Inventory page with the search query populated
    navigate(`/produtos?search=${encodeURIComponent(decodedText)}`);
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-3 flex justify-between items-center pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)] transition-colors">
        {navItems.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-16 p-2 rounded-2xl transition-all duration-300",
                isActive 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  "p-2 rounded-full transition-colors",
                  isActive && "bg-blue-50 dark:bg-blue-500/10"
                )}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-[11px] mt-1 font-semibold tracking-wide">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
        
        {/* Floating Action Buton for Mobile Scan */}
        <button 
          onClick={() => setIsScanning(true)}
          className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-500 hover:bg-blue-600 p-4 rounded-full shadow-lg text-white flex items-center justify-center transform hover:scale-105 active:scale-95 transition-all outline-none border border-white dark:border-gray-800"
        >
          <Maximize className="w-6 h-6" strokeWidth={2.5} />
        </button>

        {/* Spacer para o botão central não sobrepor os navlinks */}
        <div className="w-16"></div>
      </nav>

      {/* Fullscreen Scanner Modal */}
      {isScanning && (
        <BarcodeScanner 
          isOpen={isScanning} 
          onClose={() => setIsScanning(false)} 
          onScan={handleScan} 
        />
      )}
    </>
  );
}
