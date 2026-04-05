import { useMemo, useState } from 'react';
import useStore from '../store/useStore';
import { Package, DollarSign, AlertTriangle, TrendingUp, ShoppingCart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { QuotationModal } from '../components/QuotationModal';

export function Dashboard() {
  const { products, categories, theme } = useStore();
  const isDark = theme === 'dark';
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <>
      <motion.div 
        className="space-y-6 md:space-y-8 pb-10"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50 flex items-center gap-3">
              Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">Visão Geral do Estoque</p>
          </div>
          <button 
            onClick={() => setIsQuotationModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0 self-start md:self-auto"
          >
            <ShoppingCart className="w-5 h-5" />
            Novo Orçamento
          </button>
        </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Main Hero Card (Valor Total Estimado) */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between overflow-hidden relative group transition-colors"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-4">
              <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
                <DollarSign className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">Valor Estimado</p>
            </div>
            <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
              R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="mt-8 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Estável</span>
            </div>
          </div>
          {/* Subtle decoration */}
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-x-1/4 translate-y-1/4">
            <DollarSign className="w-48 h-48" />
          </div>
        </motion.div>

        {/* Secondary Metrics */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center group transition-colors"
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-colors">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Produtos Cadastrados</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-50">{totalItems}</h3>
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Unidades</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center group transition-colors"
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-500 dark:text-red-400 group-hover:bg-red-100 dark:group-hover:bg-red-500/20 transition-colors">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Alerta de Estoque</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-3xl font-bold text-red-500 dark:text-red-400">{lowStockItems}</h3>
                  <span className="text-xs text-red-400 dark:text-red-500 font-medium">Itens em Baixa</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Gráfico */}
      <motion.div 
        variants={itemVariants} 
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-6 rounded-xl h-[420px] flex flex-col mt-4 transition-colors"
      >
        <div className="flex items-center gap-3 mb-6">
           <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">
             Distribuição por Categoria
           </h2>
        </div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#374151" : "#E5E7EB"} />
              <XAxis dataKey="name" tick={{ fill: isDark ? '#9CA3AF' : '#6B7280', fontSize: 12, fontFamily: 'Inter' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: isDark ? '#9CA3AF' : '#6B7280', fontSize: 12, fontFamily: 'Inter' }} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: isDark ? '#374151' : '#F3F4F6' }}
                contentStyle={{ backgroundColor: isDark ? '#1F2937' : '#FFFFFF', border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`, borderRadius: '8px', color: isDark ? '#F9FAFB' : '#111827', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ color: '#0084FF', fontWeight: 'bold' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor || '#0084FF'} className="transition-all duration-300 hover:opacity-80" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
      </motion.div>
      <QuotationModal 
        isOpen={isQuotationModalOpen} 
        onClose={() => setIsQuotationModalOpen(false)} 
      />
    </>
  );
}
