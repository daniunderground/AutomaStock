import React, { useState, useMemo } from 'react';
import { X, Printer, Search, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import useStore from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

export function QuotationModal({ isOpen, onClose }) {
  const { products, categories, user } = useStore();
  
  const [clienteNome, setClienteNome] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  // Filtragem de produtos para a busca (por nome ou categoria)
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    
    // Encontrar IDs de categorias que combinam com o termo
    const matchingCategoryIds = categories
      .filter(c => c.nome.toLowerCase().includes(term))
      .map(c => c.id);

    return products.filter(p => {
      const nameMatch = p.nome.toLowerCase().includes(term);
      const categoryMatch = p.categoria_id && matchingCategoryIds.includes(p.categoria_id);
      return (nameMatch || categoryMatch) && p.quantidade > 0;
    }).slice(0, 10); // Aumentado para 10 sugestões para cobrir categorias
  }, [searchTerm, products, categories]);

  const handleAddProduct = (product) => {
    const existing = selectedItems.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantidade_desejada < product.quantidade) {
        setSelectedItems(items => items.map(i => i.id === product.id ? { ...i, quantidade_desejada: i.quantidade_desejada + 1 } : i));
      }
    } else {
      setSelectedItems([...selectedItems, { 
        ...product, 
        quantidade_desejada: 1, 
        preco_unitario_editado: product.preco_custo || 0 
      }]);
    }
    setSearchTerm('');
  };

  const removeItem = (id) => {
    setSelectedItems(selectedItems.filter(i => i.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setSelectedItems(items => items.map(item => {
      if (item.id === id) {
        const novaQtd = item.quantidade_desejada + delta;
        if (novaQtd >= 1 && novaQtd <= item.quantidade) {
          return { ...item, quantidade_desejada: novaQtd };
        }
      }
      return item;
    }));
  };

  const updatePrice = (id, novoPreco) => {
    const precoNum = parseFloat(novoPreco);
    setSelectedItems(items => items.map(item => {
      if (item.id === id) {
        return { ...item, preco_unitario_editado: isNaN(precoNum) ? 0 : precoNum };
      }
      return item;
    }));
  };

  const total = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + (item.quantidade_desejada * item.preco_unitario_editado), 0);
  }, [selectedItems]);

  const handlePrint = () => {
    window.print();
  };

  // Reset function to clear inputs when fully closed if desired, 
  // but since it's a conditional render we can just let it unmount.

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 print:p-0 print:bg-white"
        onClick={onClose}
      >
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative print:shadow-none print:max-h-none print:w-full print:rounded-none"
          onClick={(e) => e.stopPropagation()} // Prevent closing on modal click
          id="quotation-print-area"
        >
          {/* Cabeçalho do Modal (Não impresso) */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/80 print:hidden">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-500/20 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Novo Orçamento</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Crie e imprima uma cotação rápida para o cliente.</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Área de Impressão e Formulário */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 print:p-0 print:overflow-visible">
            
            {/* Cabeçalho da Impressão (Só impresso ou visível no topo como cabeçalho de folha) */}
            <div className="mb-8 border-b pb-6 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-black text-gray-900 dark:text-gray-50 uppercase tracking-tight">ORÇAMENTO</h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Gerado por {user?.nome || 'AutomaStock'}</p>
                </div>
                <div className="text-right text-gray-500 dark:text-gray-400">
                  <p className="font-medium text-gray-900 dark:text-gray-50">Data: {new Date().toLocaleDateString('pt-BR')}</p>
                  <p className="text-sm mt-1">Válido por 7 dias</p>
                </div>
              </div>

              {/* Dados do Cliente */}
              <div className="mt-8">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 print:hidden">Nome do Cliente / Empresa</label>
                <div className="print:hidden">
                  <input 
                    type="text" 
                    value={clienteNome}
                    onChange={(e) => setClienteNome(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-blue-500 focus:border-blue-500 rounded-lg px-4 py-2.5 transition-colors"
                  />
                </div>
                {/* Visualização do cliente apenas na impressão, se preenchido */}
                <div className="hidden print:block text-black">
                  <h3 className="text-lg font-bold">Cliente: {clienteNome || 'Consumidor Final'}</h3>
                </div>
              </div>
            </div>

            {/* Busca de Produtos (Não impresso) */}
            <div className="relative print:hidden">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Adicionar Produto</label>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Busque pelo nome do produto no estoque..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-50 placeholder-gray-400"
                />
              </div>

              {/* Resultados da Busca */}
              {filteredProducts.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                  {filteredProducts.map(product => (
                    <button
                      key={product.id}
                      onClick={() => handleAddProduct(product)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex justify-between items-center transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{product.nome}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Estoque: {product.quantidade} | R$ {Number(product.preco_custo || 0).toFixed(2).replace('.', ',')}</p>
                      </div>
                      <Plus className="w-4 h-4 text-blue-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tabela de Itens */}
            <div className="mt-6 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden print:border-0">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50 print:bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider print:text-black">Produto</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center print:text-black">Qtd</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right print:text-black">Valor Unit.</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right print:text-black">Subtotal</th>
                    <th className="px-4 py-3 w-10 print:hidden"></th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 print:text-black">
                  {selectedItems.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 print:hidden">
                        Nenhum item adicionado ao orçamento.
                      </td>
                    </tr>
                  ) : (
                    selectedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors print:hover:bg-transparent">
                        <td className="px-4 py-4">
                          <p className="font-medium text-gray-900 dark:text-gray-100 print:text-black">{item.nome}</p>
                          <p className="text-xs text-gray-500 hidden print:block">SKU: {item.sku || 'N/A'}</p>
                        </td>
                        <td className="px-4 py-4">
                          {/* Controles de Quantidade na Tela */}
                          <div className="flex items-center justify-center gap-2 print:hidden">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-6 text-center font-medium dark:text-gray-100">{item.quantidade_desejada}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          {/* Apenas Número na Impressão */}
                          <div className="hidden print:block text-center font-medium">
                            {item.quantidade_desejada}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="text-right text-gray-900 dark:text-gray-100 print:text-black">
                            {Number(item.preco_unitario_editado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right font-bold text-gray-900 dark:text-gray-50 print:text-black">
                          {(item.quantidade_desejada * item.preco_unitario_editado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="px-4 py-4 text-right print:hidden">
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-red-400 hover:text-red-600 dark:hover:text-red-300 p-1 rounded transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total do Orçamento</p>
                <p className="text-4xl font-black text-blue-600 dark:text-blue-400 print:text-black">
                  {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>

          </div>

          {/* Rodapé (Não Impresso) */}
          <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/80 flex justify-end gap-3 print:hidden">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handlePrint}
              disabled={selectedItems.length === 0}
              className="px-6 py-2.5 rounded-xl text-sm font-bold border border-transparent bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
            >
              <Printer className="w-4 h-4" />
              Imprimir Orçamento
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
