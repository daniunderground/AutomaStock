import { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { Search, History as HistoryIcon, ArrowDownRight, ArrowUpRight, Download } from 'lucide-react';
import { exportToCSV } from '../lib/exportUtils';

export function History() {
  const { movimentacoes, fetchMovimentacoes } = useStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMovimentacoes();
  }, [fetchMovimentacoes]);

  const filteredHistory = movimentacoes.filter(m => {
    const term = search.toLowerCase();
    return (
      m.produtos?.nome?.toLowerCase().includes(term) ||
      m.produtos?.sku?.toLowerCase().includes(term) ||
      m.motivo?.toLowerCase().includes(term)
    );
  });

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit' 
    }).format(d);
  };

  const handleExport = () => {
    const columns = [
      { key: 'created_at', title: 'Data/Hora', getValue: (m) => formatDate(m.created_at) },
      { key: 'tipo', title: 'Operação', getValue: (m) => m.tipo.toUpperCase() },
      { key: 'quantidade', title: 'Quantidade Movimentada' },
      { key: 'produto', title: 'Produto', getValue: (m) => m.produtos?.nome || 'Apagado' },
      { key: 'sku', title: 'SKU', getValue: (m) => m.produtos?.sku || '' },
      { key: 'motivo', title: 'Motivo / Gatilho', getValue: (m) => m.motivo || 'Nenhum' }
    ];
    exportToCSV(filteredHistory, columns, 'historico_movimentacoes.csv');
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Histórico de Movimentações</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">Acompanhe as Entradas e Saídas do seu estoque</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-[#E0E3E5] dark:border-slate-700 shadow-[0_4px_20px_rgba(26,43,75,0.04)] rounded-[1.5rem] flex flex-col overflow-hidden transition-colors">
        <div className="p-6 border-b border-[#E0E3E5] dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-800 transition-colors">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input 
              type="text"
              placeholder="Pesquisar por produto, código ou motivo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-400 dark:hover:border-slate-500 shadow-sm"
            />
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#f4f7fb] dark:bg-slate-700 hover:bg-[#e4ebf3] dark:hover:bg-slate-600 border border-[#d6e0ea] dark:border-slate-600 text-[#334663] dark:text-slate-200 transition-colors w-full sm:w-auto justify-center text-sm font-semibold cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" />
            Exportar Relatório
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-[13px] whitespace-nowrap">
            <thead className="bg-[#F7F9FB] dark:bg-slate-900/50 border-b border-[#E0E3E5] dark:border-slate-700 transition-colors">
              <tr>
                <th className="px-6 py-4 font-semibold text-[#505f76] dark:text-slate-400 uppercase tracking-wider text-xs">Data</th>
                <th className="px-6 py-4 font-semibold text-[#505f76] dark:text-slate-400 uppercase tracking-wider text-xs">Operação</th>
                <th className="px-6 py-4 font-semibold text-[#505f76] dark:text-slate-400 uppercase tracking-wider text-xs">Produto</th>
                <th className="px-6 py-4 font-semibold text-[#505f76] dark:text-slate-400 uppercase tracking-wider text-xs">Gatilho (Motivo)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E3E5] dark:divide-slate-700 bg-white dark:bg-slate-800 transition-colors">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center text-gray-500 dark:text-gray-400 flex-col flex items-center justify-center gap-3">
                    <HistoryIcon className="w-10 h-10 opacity-30 text-[var(--primary)]" />
                    <span className="text-base font-medium">Nenhuma movimentação encontrada.</span>
                  </td>
                </tr>
              ) : (
                filteredHistory.map(mov => {
                  const isEntrada = mov.tipo === 'entrada';
                  return (
                    <tr key={mov.id} className="hover:bg-[#F7F9FB] dark:hover:bg-slate-700/50 transition-colors group">
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium font-mono text-xs">
                        {formatDate(mov.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold tracking-wide uppercase border ${isEntrada ? 'bg-green-50 dark:bg-green-500/10 text-[var(--success)] border-green-200 dark:border-green-500/20' : 'bg-red-50 dark:bg-red-500/10 text-[var(--error)] border-red-200 dark:border-red-500/20'}`}>
                          {isEntrada ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          {isEntrada ? `ENTRADA` : `SAÍDA`} • {mov.quantidade}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">{mov.produtos?.nome || 'Produto genérico ou apagado'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono tracking-wide">{mov.produtos?.sku}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {mov.motivo || <span className="text-gray-400 dark:text-gray-500 italic">Nenhum</span>}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
