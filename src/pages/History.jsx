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
          <h1 className="text-3xl font-['Manrope'] font-bold tracking-tight text-[#dbe2fd]">Histórico de Movimentações</h1>
          <p className="text-[#bdcabc] mt-1 text-sm md:text-base">Acompanhe as Entradas e Saídas do seu estoque</p>
        </div>
      </div>

      <div className="bg-[#131b2e] border border-[#3e4a3f]/20 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-[#3e4a3f]/20 flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#171f33]/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#bdcabc]/60 w-5 h-5" />
            <input 
              type="text"
              placeholder="Pesquisar por produto, código ou motivo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#3e4a3f]/30 bg-[#0b1326] text-[#dbe2fd] focus:outline-none focus:ring-2 focus:ring-[#6ee591]/50 transition-all placeholder-[#bdcabc]/40"
            />
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6ee591]/10 hover:bg-[#6ee591]/20 border border-[#6ee591]/30 text-[#6ee591] transition-colors w-full sm:w-auto justify-center text-sm font-semibold cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Exportar Relatório
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#171f33] border-b border-[#3e4a3f]/20">
              <tr>
                <th className="px-6 py-4 font-bold text-[#bdcabc] tracking-wider uppercase text-xs">Data</th>
                <th className="px-6 py-4 font-bold text-[#bdcabc] tracking-wider uppercase text-xs">Operação</th>
                <th className="px-6 py-4 font-bold text-[#bdcabc] tracking-wider uppercase text-xs">Produto</th>
                <th className="px-6 py-4 font-bold text-[#bdcabc] tracking-wider uppercase text-xs">Gatilho (Motivo)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3e4a3f]/10">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center text-[#bdcabc] flex-col flex items-center justify-center gap-3">
                    <HistoryIcon className="w-10 h-10 opacity-30 text-[#6ee591]" />
                    <span className="text-base font-medium">Nenhuma movimentação encontrada.</span>
                  </td>
                </tr>
              ) : (
                filteredHistory.map(mov => {
                  const isEntrada = mov.tipo === 'entrada';
                  return (
                    <tr key={mov.id} className="hover:bg-[#1a2336] transition-colors group">
                      <td className="px-6 py-4 text-[#bdcabc] font-medium font-mono text-xs">
                        {formatDate(mov.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${isEntrada ? 'bg-[#6ee591]/10 text-[#6ee591] border-[#6ee591]/20' : 'bg-[#ffb4ab]/10 text-[#ffb4ab] border-[#ffb4ab]/20'}`}>
                          {isEntrada ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          {isEntrada ? `ENTRADA` : `SAÍDA`} • {mov.quantidade}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#dbe2fd] text-base">{mov.produtos?.nome || 'Produto genérico ou apagado'}</div>
                        <div className="text-xs text-[#bdcabc]/70 mt-1 font-mono tracking-wide">{mov.produtos?.sku}</div>
                      </td>
                      <td className="px-6 py-4 text-[#dbe2fd]">
                        {mov.motivo || <span className="text-[#bdcabc]/40 italic">Nenhum</span>}
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
