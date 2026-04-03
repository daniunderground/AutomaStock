import { useMemo } from 'react';
import useStore from '../store/useStore';
import { Package, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function Dashboard() {
  const { products, categories } = useStore();

  const totalItems = useMemo(() => {
    return products.reduce((acc, p) => acc + p.quantidade, 0);
  }, [products]);

  const totalValue = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.quantidade * p.preco_custo), 0);
  }, [products]);

  const lowStockItems = useMemo(() => {
    return products.filter((p) => p.quantidade > 0 && p.quantidade <= 5).length;
  }, [products]);

  // Transformar dados para o gráfico
  const chartData = useMemo(() => {
    return categories.map(cat => {
      const gProducts = products.filter(p => p.categoria_id === cat.id);
      const count = gProducts.reduce((acc, p) => acc + p.quantidade, 0);
      return {
        name: cat.nome,
        count: count,
        cor: cat.cor
      };
    });
  }, [categories, products]);

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-['Manrope'] font-bold tracking-tight text-[#dbe2fd]">Dashboard</h1>
          <p className="text-[#bdcabc] mt-1 text-sm md:text-base">Monitoramento de Hardware em Tempo Real</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Main Hero Card (Valor Total Estimado) */}
        <div className="lg:col-span-1 bg-gradient-to-br from-[#6ee591] to-[#50c878] p-6 rounded-3xl shadow-[0_12px_32px_rgba(80,200,120,0.15)] flex flex-col justify-between overflow-hidden relative group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/20 rounded-full blur-2xl transform group-hover:scale-110 transition-transform duration-700"></div>
          <div>
            <div className="flex items-center gap-2 text-[#003919] mb-4">
              <DollarSign className="w-5 h-5 opacity-80" />
              <p className="text-sm font-bold uppercase tracking-wider">Valor Estimado</p>
            </div>
            <h3 className="text-4xl md:text-5xl font-['Manrope'] font-extrabold text-[#00210c] truncate tracking-tight">
              R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-1.5 bg-[#003919]/10 px-3 py-1.5 rounded-full text-[#00210c] text-xs font-semibold backdrop-blur-md">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12% vs last month</span>
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-[#171f33] p-6 rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.2)] flex flex-col justify-center">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-[#31394e] text-[#dbe2fd]">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#bdcabc]">Hardware Total</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-3xl font-['Manrope'] font-bold text-[#dbe2fd]">{totalItems}</h3>
                  <span className="text-xs text-[#bdcabc] font-medium">Unidades</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#171f33] p-6 rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.2)] flex flex-col justify-center border border-[#3e4a3f]/10">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-[#ffb4ab]/10 text-[#ffb4ab]">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#bdcabc]">Alertas Críticos</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-3xl font-['Manrope'] font-bold text-[#ffb4ab]">{lowStockItems}</h3>
                  <span className="text-xs text-[#ffb4ab]/70 font-medium">Itens em Baixa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-[#131b2e] p-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] h-[420px] flex flex-col mt-4">
        <h2 className="text-lg font-['Manrope'] font-bold mb-6 text-[#dbe2fd] flex-shrink-0 tracking-wide">
          Distribuição de Hardware
        </h2>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: '#bdcabc', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#bdcabc', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(219, 226, 253, 0.05)' }}
                contentStyle={{ backgroundColor: '#2d3449', border: '1px solid rgba(62, 74, 63, 0.3)', borderRadius: '12px', color: '#dbe2fd', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
                itemStyle={{ color: '#6ee591', fontWeight: 'bold' }}
              />
              <Bar dataKey="count" radius={[8, 8, 8, 8]} maxBarSize={48}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor || '#50c878'} className="transition-all duration-300 hover:opacity-80" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
