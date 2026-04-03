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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t-0 rounded-t-3xl px-6 py-3 flex justify-between items-center pb-safe shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
        {navItems.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-16 p-2 rounded-2xl transition-all duration-300",
                isActive 
                  ? "text-[#6ee591]" 
                  : "text-[#bdcabc] hover:text-[#dbe2fd]"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  "p-2 rounded-full transition-colors",
                  isActive && "bg-[#50c878]/15"
                )}>
                  <item.icon className={cn("w-6 h-6", isActive && "drop-shadow-[0_0_8px_rgba(110,229,145,0.6)]")} />
                </div>
                <span className="text-[11px] mt-1 font-semibold tracking-wide">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
        
        {/* Floating Action Buton for Mobile Scan */}
        <button 
          onClick={() => setIsScanning(true)}
          className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gradient-to-br from-[#6ee591] to-[#50c878] p-4 rounded-full shadow-[0_8px_32px_rgba(80,200,120,0.35)] text-[#0b1326] flex items-center justify-center transform hover:scale-110 active:scale-95 transition-all outline-none"
        >
          <div className="absolute inset-0 rounded-full border border-white/40 shadow-inner pointer-events-none"></div>
          <Maximize className="w-7 h-7" strokeWidth={2.5} />
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
