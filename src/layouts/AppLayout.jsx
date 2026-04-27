import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { BottomNavBar } from '../components/BottomNavBar';
import { motion, AnimatePresence } from 'framer-motion';

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen w-full font-sans overflow-hidden bg-background text-foreground transition-colors duration-300">
      <div className="flex w-full h-full z-10">
        <Sidebar className="z-20" />
        <div className="flex-1 flex flex-col h-full relative z-10 w-full">
          <Header />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-24 md:pb-8 sm:p-6 md:p-8 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mx-auto max-w-6xl w-full h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
          
          <BottomNavBar />
        </div>
      </div>
    </div>
  );
}
