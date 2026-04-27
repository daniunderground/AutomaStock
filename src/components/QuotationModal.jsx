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
          className="bg-surface w-full max-w-4xl max-h-[90vh] rounded-[1.5rem] shadow-xl flex flex-col overflow-hidden relative print:shadow-none print:max-h-none print:w-full print:rounded-none border border-border-color"
          onClick={(e) => e.stopPropagation()} // Prevent closing on modal click
          id="quotation-print-area"
        >
          {/* Cabeçalho do Modal (Não impresso) */}
          <div className="flex items-center justify-between p-6 border-b border-border-color bg-surface/50 print:hidden">
            <div className="flex items-center gap-3">
              <div className="bg-[var(--primary-container)]/20 p-2 rounded-[1rem] text-[var(--primary)] border border-blue-500/20">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Novo Orçamento</h2>
                <p className="text-sm text-foreground/60">Crie e imprima uma cotação rápida para o cliente.</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-foreground/40 hover:text-foreground transition-colors p-2 rounded-full hover:bg-foreground/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Área de Impressão e Formulário */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 print:p-0 print:overflow-visible">
            
            {/* Cabeçalho da Impressão (Só impresso ou visível no topo como cabeçalho de folha) */}
            <div className="mb-8 border-b border-border-color pb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">ORÇAMENTO</h1>
                  <p className="text-foreground/60 mt-1">Gerado por {user?.nome || 'AutomaStock'}</p>
                </div>
                <div className="text-right text-foreground/60">
                  <p className="font-medium text-foreground">Data: {new Date().toLocaleDateString('pt-BR')}</p>
                  <p className="text-sm mt-1">Válido por 7 dias</p>
                </div>
              </div>
            </div>

            {/* Dados do Cliente */}
            <div className="mt-8">
              <label className="block text-sm font-semibold text-foreground/80 mb-2 print:hidden">Nome do Cliente / Empresa</label>
              <div className="print:hidden">
                <input 
                  type="text" 
                  value={clienteNome}
                  onChange={(e) => setClienteNome(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full border-border-color bg-background text-foreground focus:ring-[var(--primary)] focus:border-[var(--primary)] rounded-xl px-4 py-2.5 transition-colors border shadow-sm"
                />
              </div>
              {/* Visualização do cliente apenas na impressão, se preenchido */}
              <div className="hidden print:block text-black">
                <h3 className="text-lg font-bold">Cliente: {clienteNome || 'Consumidor Final'}</h3>
              </div>
            </div>

            {/* Busca de Produtos (Não impresso) */}
            <div className="relative print:hidden">
              <label className="block text-sm font-semibold text-foreground/80 mb-2">Adicionar Produto</label>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Busque pelo nome do produto no estoque..."
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border-color rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all text-foreground placeholder-foreground/30 shadow-sm"
                />
              </div>

              {/* Resultados da Busca */}
              {filteredProducts.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-surface rounded-xl shadow-lg border border-border-color overflow-hidden">
                  {filteredProducts.map(product => (
                    <button
                      key={product.id}
                      onClick={() => handleAddProduct(product)}
                      className="w-full text-left px-4 py-3 hover:bg-foreground/5 flex justify-between items-center transition-colors border-b border-border-color last:border-0"
                    >
                      <div>
                        <p className="font-medium text-foreground">{product.nome}</p>
                        <p className="text-xs text-foreground/60">Estoque: {product.quantidade} | R$ {Number(product.preco_custo || 0).toFixed(2).replace('.', ',')}</p>
                      </div>
                      <Plus className="w-4 h-4 text-[var(--primary)]" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tabela de Itens */}
            <div className="mt-6 border border-border-color rounded-xl overflow-hidden print:border-0 shadow-sm">
              <table className="min-w-full divide-y divide-border-color text-left font-sans text-[13px]">
                <thead className="bg-foreground/5 print:bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-foreground/70 uppercase tracking-wider print:text-black">Produto</th>
                    <th className="px-4 py-3 font-semibold text-foreground/70 uppercase tracking-wider text-center print:text-black">Qtd</th>
                    <th className="px-4 py-3 font-semibold text-foreground/70 uppercase tracking-wider text-right print:text-black">Valor Unit.</th>
                    <th className="px-4 py-3 font-semibold text-foreground/70 uppercase tracking-wider text-right print:text-black">Subtotal</th>
                    <th className="px-4 py-3 w-10 print:hidden"></th>
                  </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-border-color print:text-black">
                  {selectedItems.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-foreground/40 print:hidden text-sm">
                        Nenhum item adicionado ao orçamento.
                      </td>
                    </tr>
                  ) : (
                    selectedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-foreground/5 transition-colors print:hover:bg-transparent text-sm">
                        <td className="px-4 py-4">
                          <p className="font-bold text-foreground print:text-black">{item.nome}</p>
                          <p className="text-xs text-foreground/40 hidden print:block mt-1 font-mono">SKU: {item.sku || 'N/A'}</p>
                        </td>
                        <td className="px-4 py-4">
                          {/* Controles de Quantidade na Tela */}
                          <div className="flex items-center justify-center gap-2 print:hidden">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1 rounded bg-foreground/5 text-foreground/60 hover:text-[var(--primary)] border border-border-color"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-bold text-foreground">{item.quantidade_desejada}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1 rounded bg-foreground/5 text-foreground/60 hover:text-[var(--primary)] border border-border-color"
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
                          <div className="text-right text-foreground font-medium print:text-black">
                            {Number(item.preco_unitario_editado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right font-bold text-foreground print:text-black">
                          {(item.quantidade_desejada * item.preco_unitario_editado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="px-4 py-4 text-right print:hidden">
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-[var(--error)] hover:bg-red-500/10 p-1.5 rounded transition-colors border border-transparent hover:border-red-500/20"
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
            <div className="flex justify-end pt-6 border-t border-border-color">
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground/40 uppercase tracking-wider mb-1">Total do Orçamento</p>
                <p className="text-4xl font-black text-[var(--primary)] print:text-black">
                  {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>

          </div>

          {/* Rodapé (Não Impresso) */}
          <div className="p-6 border-t border-border-color bg-foreground/5 flex justify-end gap-3 print:hidden rounded-b-2xl">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-sm font-semibold border border-border-color bg-surface text-foreground hover:bg-foreground/5 transition-colors shadow-sm"
            >
              Cancelar
            </button>
            <button 
              onClick={handlePrint}
              disabled={selectedItems.length === 0}
              className="px-6 py-2.5 rounded-full text-sm font-medium border border-transparent bg-[var(--primary)] text-white hover:opacity-90 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all cursor-pointer"
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
