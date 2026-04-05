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

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm flex flex-col overflow-hidden transition-colors">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 dark:bg-gray-800/80 transition-colors">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input 
              type="text"
              placeholder="Pesquisar por produto, código ou motivo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-400 dark:hover:border-gray-500 shadow-sm"
            />
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 transition-colors w-full sm:w-auto justify-center text-sm font-semibold cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" />
            Exportar Relatório
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 transition-colors">
              <tr>
                <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase text-xs">Data</th>
                <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase text-xs">Operação</th>
                <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase text-xs">Produto</th>
                <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase text-xs">Gatilho (Motivo)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 transition-colors">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center text-gray-500 dark:text-gray-400 flex-col flex items-center justify-center gap-3">
                    <HistoryIcon className="w-10 h-10 opacity-30 text-blue-500 dark:text-blue-400" />
                    <span className="text-base font-medium">Nenhuma movimentação encontrada.</span>
                  </td>
                </tr>
              ) : (
                filteredHistory.map(mov => {
                  const isEntrada = mov.tipo === 'entrada';
                  return (
                    <tr key={mov.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-500/10 transition-colors group">
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium font-mono text-xs">
                        {formatDate(mov.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${isEntrada ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20'}`}>
                          {isEntrada ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          {isEntrada ? `ENTRADA` : `SAÍDA`} • {mov.quantidade}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 dark:text-gray-50 text-base">{mov.produtos?.nome || 'Produto genérico ou apagado'}</div>
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
