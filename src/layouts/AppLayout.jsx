import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { BottomNavBar } from '../components/BottomNavBar';
import { motion, AnimatePresence } from 'framer-motion';

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen w-full bg-surface-dim font-['Inter'] text-on-surface overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-24 md:pb-8 sm:p-6 md:p-8 bg-[#0b1326] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mx-auto max-w-6xl w-full h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        
        <BottomNavBar />
      </div>
    </div>
  );
}
