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
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
              Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">Visão Geral do Estoque</p>
          </div>
          <button 
            onClick={() => setIsQuotationModalOpen(true)}
            className="flex items-center gap-2 bg-[var(--primary)] hover:opacity-90 text-white px-6 py-3 rounded-full shadow-md font-medium transition-all hover:-translate-y-0.5 active:translate-y-0 self-start md:self-auto"
          >
            <ShoppingCart className="w-5 h-5" />
            Novo Orçamento
          </button>
        </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Main Hero Card (Valor Total Estimado) */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-[1.5rem] shadow-[0_4px_20px_rgba(26,43,75,0.04)] flex flex-col justify-between overflow-hidden relative group transition-all hover:shadow-[0_8px_30px_rgba(26,43,75,0.08)]"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mb-6">
              <div className="p-2.5 bg-[var(--primary-container)] text-[var(--primary)] dark:text-white rounded-full">
                <DollarSign className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Valor Estimado</p>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
              R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="mt-8 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Estável</span>
            </div>
          </div>
        </motion.div>

        {/* Secondary Metrics */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 p-6 rounded-[1.5rem] shadow-[0_4px_20px_rgba(26,43,75,0.04)] flex flex-col justify-center group transition-all hover:shadow-[0_8px_30px_rgba(26,43,75,0.08)]"
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Produtos Cadastrados</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{totalItems}</h3>
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Unidades</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 p-6 rounded-[1.5rem] shadow-[0_4px_20px_rgba(26,43,75,0.04)] flex flex-col justify-center group transition-all hover:shadow-[0_8px_30px_rgba(26,43,75,0.08)]"
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 rounded-full bg-red-50 dark:bg-red-900/30 text-[var(--error)] dark:text-red-400 transition-colors">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Alerta de Estoque</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-3xl font-bold text-[var(--error)] dark:text-red-400">{lowStockItems}</h3>
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
        className="bg-white dark:bg-slate-800 shadow-[0_4px_20px_rgba(26,43,75,0.04)] p-6 md:p-8 rounded-[1.5rem] h-[420px] flex flex-col mt-4 transition-all hover:shadow-[0_8px_30px_rgba(26,43,75,0.08)]"
      >
        <div className="flex items-center gap-3 mb-6">
           <h2 className="text-lg font-bold text-gray-900 dark:text-white">
             Distribuição por Categoria
           </h2>
        </div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#E0E3E5"} />
              <XAxis dataKey="name" tick={{ fill: isDark ? '#94A3B8' : '#505f76', fontSize: 13, fontFamily: 'Inter', fontWeight: 500 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: isDark ? '#94A3B8' : '#505f76', fontSize: 13, fontFamily: 'Inter', fontWeight: 500 }} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: isDark ? '#1E293B' : '#F7F9FB' }}
                contentStyle={{ 
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF', 
                  border: 'none', 
                  borderRadius: '12px', 
                  color: isDark ? '#F1F5F9' : '#191c1e', 
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)' 
                }}
                itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor || 'var(--primary)'} className="transition-all duration-300 hover:opacity-80" />
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
