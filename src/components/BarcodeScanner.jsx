import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, ScanLine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function BarcodeScanner({ isOpen, onClose, onScan }) {
  useEffect(() => {
    if (!isOpen) return;

    // Use a short timeout to ensure the DOM element #reader is mounted
    // const scanner = new Html5QrcodeScanner(...)
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      showTorchButtonIfSupported: true,
      showZoomSliderIfSupported: true,
      defaultZoomValueIfSupported: 2
    };

    let scanner;
    
    setTimeout(() => {
      scanner = new Html5QrcodeScanner("reader", config, false);
      
      const onScanSuccess = (decodedText) => {
        // Stop scanning after success
        scanner.clear().then(() => {
          onScan(decodedText);
        }).catch(err => {
          // fallback clear
          onScan(decodedText);
        });
      };

      const onScanFailure = (err) => {
        // Ignored errors for continuous scanning
      };

      scanner.render(onScanSuccess, onScanFailure);
    }, 100);

    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.error("Failed to clear scanner", e));
      }
    };
  }, [isOpen, onScan]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 bg-white/95 backdrop-blur-xl z-[9999] flex flex-col pt-12 px-4 pb-8 transition-colors"
        >
          <div className="flex justify-between items-center mb-8 text-gray-900">
            <div className="flex items-center gap-3">
              <ScanLine className="w-6 h-6 text-[var(--primary)]" />
              <h2 className="text-2xl font-bold tracking-tight">Escanear Produto</h2>
            </div>
            <button 
              onClick={onClose} 
              className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 rounded-[1.5rem] overflow-hidden bg-black flex flex-col items-center justify-center relative shadow-xl border border-[#E0E3E5]">
            <div id="reader" className="w-full h-full text-white [&>div]:border-none [&>div>video]:w-full [&>div>video]:h-full [&>div>video]:object-cover" style={{ border: 'none' }}></div>
          </div>

          <div className="mt-8 text-center text-gray-500 w-full">
            <p className="text-lg font-bold text-gray-900">Foque no QRCode ou Código de Barras</p>
            <p className="text-sm mt-1">A leitura e o direcionamento são automáticos</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
