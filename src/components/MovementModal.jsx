import { useState } from 'react';
import useStore from '../store/useStore';
import { ArrowDownRight, ArrowUpRight, X } from 'lucide-react';

export function MovementModal({ isOpen, onClose, product, type }) {
  const { addMovimentacao } = useStore();
  const [quantidade, setQuantidade] = useState('');
  const [motivo, setMotivo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !product) return null;

  const isEntrada = type === 'entrada';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quantidade || parseInt(quantidade) <= 0) return;

    setIsSubmitting(true);
    const success = await addMovimentacao(product.id, type, quantidade, motivo);
    setIsSubmitting(false);
    
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-sm rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border">
        <div className={`px-5 py-4 flex items-center justify-between border-b ${isEntrada ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-rose-50 dark:bg-rose-500/10'}`}>
          <div className="flex items-center gap-2">
            {isEntrada ? <ArrowDownRight className="w-5 h-5 text-emerald-600" /> : <ArrowUpRight className="w-5 h-5 text-rose-600" />}
            <h2 className="text-lg font-bold">
              Registrar {isEntrada ? 'Entrada' : 'Saída'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="text-sm text-slate-500 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border">
            Referência: <span className="font-semibold text-slate-700 dark:text-slate-300">{product.nome}</span>
            <br />
            Estoque Atual: <span className="font-semibold text-slate-700 dark:text-slate-300">{product.quantidade} un.</span>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Quantidade</label>
            <input 
              required 
              autoFocus 
              min="1" 
              type="number" 
              value={quantidade} 
              onChange={e => setQuantidade(e.target.value)} 
              className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 outline-none bg-background transition-shadow ${isEntrada ? 'focus:ring-emerald-500/50' : 'focus:ring-rose-500/50'}`} 
              placeholder="Ex: 5" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Motivo (Opcional)</label>
            <input 
              type="text" 
              value={motivo} 
              onChange={e => setMotivo(e.target.value)} 
              className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 outline-none bg-background transition-shadow ${isEntrada ? 'focus:ring-emerald-500/50' : 'focus:ring-rose-500/50'}`} 
              placeholder={isEntrada ? "Ex: Compra Shopee" : "Ex: Projeto Varanda"} 
            />
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button disabled={isSubmitting} type="submit" className={`w-full py-2.5 font-medium text-white rounded-xl transition-colors shadow-sm ${isEntrada ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isSubmitting ? 'Salvando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
