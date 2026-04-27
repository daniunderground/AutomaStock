import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import useStore from '../store/useStore';
import { Search, Plus, ArrowUpDown, Edit2, Trash2, ArrowDownRight, ArrowUpRight, Image as ImageIcon, Download, ScanLine, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { MovementModal } from '../components/MovementModal';
import { exportToCSV } from '../lib/exportUtils';
import { BarcodeScanner } from '../components/BarcodeScanner';

export function Inventory() {
  const { products, categories, addProduct, updateProduct, deleteProduct, uploadProductImage, searchQuery, setSearchQuery } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortOrder, setSortOrder] = useState('desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [movementConfig, setMovementConfig] = useState({ isOpen: false, product: null, type: null });

  const [newProduct, setNewProduct] = useState({ nome: '', categoria_id: '', preco_custo: '', quantidade: '', imagem_url: '' });

  useEffect(() => {
    const q = searchParams.get('search');
    if (q && q !== searchQuery) {
      setSearchQuery(q);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val) setSearchParams({ search: val });
    else setSearchParams({});
  };

  const handleScan = (decodedText) => {
    setIsScanning(false);
    if ("vibrate" in navigator) navigator.vibrate(200);
    setSearchQuery(decodedText);
    setSearchParams({ search: decodedText });
  };

  const handleMovementSubmit = async (e) => {
    e.preventDefault();
    if (!movementConfig.product || !movementConfig.type || !movementConfig.quantity) return;
    
    setIsSubmitting(true);
    
    const success = await useStore.getState().addMovimentacao(
      movementConfig.product.id,
      movementConfig.type,
      movementConfig.quantity,
      movementConfig.notes || ''
    );
    
    setIsSubmitting(false);
    
    if (success) {
      setMovementConfig({ isOpen: false, product: null, type: null, quantity: '', notes: '' });
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.nome || !newProduct.categoria_id) return;
    
    setIsSubmitting(true);
    let finalImageUrl = newProduct.imagem_url;
    
    if (imageFile) {
      const uploadedUrl = await uploadProductImage(imageFile);
      if (uploadedUrl) finalImageUrl = uploadedUrl;
    }
    
    if (editingId) {
      await updateProduct(editingId, {
         nome: newProduct.nome,
         categoria_id: newProduct.categoria_id,
         preco_custo: parseFloat(newProduct.preco_custo) || 0,
         quantidade: parseInt(newProduct.quantidade) || 0,
         imagem_url: finalImageUrl
      });
    } else {
      await addProduct({
         ...newProduct,
         preco_custo: parseFloat(newProduct.preco_custo) || 0,
         quantidade: parseInt(newProduct.quantidade) || 0,
         imagem_url: finalImageUrl,
         sku: `PROD-${Math.floor(Math.random() * 10000)}`
      });
    }
    
    setIsSubmitting(false);
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setImageFile(null);
    setNewProduct({ nome: '', categoria_id: '', preco_custo: '', quantidade: '', imagem_url: '' });
  };

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setImageFile(null);
    setNewProduct({
      nome: product.nome,
      categoria_id: product.categoria_id || '',
      preco_custo: product.preco_custo || '',
      quantidade: product.quantidade || 0,
      imagem_url: product.imagem_url || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm("Certeza que deseja excluir este produto?")) {
      deleteProduct(id);
    }
  };

  // Improved strict matching if barcode is scanned (exact sku match pushes to top)
  const filteredAndSortedProducts = products
    .filter(p => p.nome.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      // Prioritize exact SKU match
      if (searchQuery && a.sku?.toLowerCase() === searchQuery.toLowerCase()) return -1;
      if (searchQuery && b.sku?.toLowerCase() === searchQuery.toLowerCase()) return 1;
      
      if (sortOrder === 'asc') return a.quantidade - b.quantidade;
      return b.quantidade - a.quantidade;
    });

  const handleExport = () => {
    const columns = [
      { key: 'nome', title: 'Nome do Produto' },
      { key: 'sku', title: 'SKU' },
      { key: 'categoria_id', title: 'Categoria', getValue: (p) => categories.find(c => c.id === p.categoria_id)?.nome || 'Sem Categoria' },
      { key: 'preco_custo', title: 'Preço de Custo (R$)' },
      { key: 'quantidade', title: 'Quantidade em Estoque' }
    ];
    exportToCSV(filteredAndSortedProducts, columns, 'estoque_automastock.csv');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 md:space-y-8 pb-10"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            Estoque
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">Gerencie seus produtos e componentes</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[var(--primary)] hover:opacity-90 text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </div>

      <div className="bg-surface border border-border-color shadow-[0_4px_20px_rgba(26,43,75,0.04)] dark:shadow-none rounded-[1.5rem] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border-color flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface">
          <div className="relative w-full sm:max-w-md flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text"
                placeholder="Pesquisar por nome ou SKU..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-surface dark:bg-gray-800 text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all placeholder-gray-400 hover:border-gray-400 shadow-sm"
              />
            </div>
            <button 
              onClick={() => setIsScanning(true)}
              className="md:hidden p-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-gray-500 dark:text-gray-400 hover:text-[var(--primary)] transition-colors shadow-sm"
            >
              <ScanLine className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-[#F7F9FB] dark:hover:bg-gray-700 transition-colors shadow-sm w-full sm:w-auto justify-center text-sm font-medium cursor-pointer"
            >
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              Qtd ({sortOrder === 'asc' ? 'Cresc' : 'Decresc'})
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--surface-container-low)] hover:bg-[var(--surface-container)] border border-border-color text-foreground transition-colors w-full sm:w-auto justify-center text-sm font-semibold cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-[13px] whitespace-nowrap">
            <thead className="bg-background border-b border-border-color">
              <tr>
                <th className="px-6 py-4 font-semibold text-[#505f76] dark:text-gray-400 uppercase tracking-wider text-xs w-16">IMG</th>
                <th className="px-6 py-4 font-semibold text-[#505f76] dark:text-gray-400 uppercase tracking-wider text-xs">Produto</th>
                <th className="px-6 py-4 font-semibold text-[#505f76] dark:text-gray-400 uppercase tracking-wider text-xs">SKU</th>
                <th className="px-6 py-4 font-semibold text-[#505f76] dark:text-gray-400 uppercase tracking-wider text-xs">Categoria</th>
                <th className="px-6 py-4 font-semibold text-[#505f76] dark:text-gray-400 uppercase tracking-wider text-xs text-right">Custo</th>
                <th className="px-6 py-4 font-semibold text-[#505f76] dark:text-gray-400 uppercase tracking-wider text-xs text-center">Estoque</th>
                <th className="px-6 py-4 font-semibold text-[#505f76] dark:text-gray-400 uppercase tracking-wider text-xs text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color bg-surface">
              {filteredAndSortedProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center text-gray-500 dark:text-gray-400">Nenhum produto encontrado.</td>
                </tr>
              ) : (
                filteredAndSortedProducts.map(product => {
                  const category = categories.find(c => c.id === product.categoria_id);
                  return (
                    <tr key={product.id} className="hover:bg-background transition-colors group">
                      <td className="px-6 py-3">
                        {product.imagem_url ? (
                          <img src={product.imagem_url} alt={product.nome} className="w-10 h-10 object-cover rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-700 text-gray-400">
                            <ImageIcon className="w-5 h-5 opacity-50" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-3 font-semibold text-gray-900 dark:text-white text-sm">{product.nome}</td>
                      <td className="px-6 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs font-semibold">{product.sku}</td>
                      <td className="px-6 py-3">
                        <span 
                          className="px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide border uppercase" 
                          style={{ backgroundColor: `${category?.cor || '#6B7280'}15`, color: category?.cor || '#6B7280', borderColor: `${category?.cor || '#6B7280'}30` }}
                        >
                          {category?.nome || 'Sem Categoria'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right font-medium text-gray-700 dark:text-gray-300">R$ {product.preco_custo?.toFixed(2) || '0.00'}</td>
                      <td className="px-6 py-3 text-center">
                        <div className="flex justify-center">
                          <span className={`inline-flex items-center justify-center px-4 h-8 rounded-full font-extrabold text-sm border ${product.quantidade <= 5 ? 'bg-red-50 dark:bg-red-900/20 text-[var(--error)] border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-[#E0E3E5] dark:border-gray-700'}`}>
                            {product.quantidade}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right relative">
                        <div className="flex items-center justify-end gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); setMovementConfig({ isOpen: true, product, type: 'entrada', quantity: '', notes: '' }); }} title="Adicionar Estoque" className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors cursor-pointer"><ArrowDownRight className="w-5 h-5"/></button>
                          <button onClick={(e) => { e.stopPropagation(); setMovementConfig({ isOpen: true, product, type: 'saida', quantity: '', notes: '' }); }} title="Retirar Estoque" className="p-2 text-[var(--error)] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors cursor-pointer"><ArrowUpRight className="w-5 h-5"/></button>
                          
                          <div className="w-px h-6 bg-[#E0E3E5] mx-2"></div>
                          
                          <button onClick={() => handleEditClick(product)} title="Editar" className="p-2 text-gray-500 hover:text-[var(--primary)] hover:bg-[var(--primary-container)] rounded-full transition-colors cursor-pointer"><Edit2 className="w-4 h-4"/></button>
                          <button onClick={() => handleDeleteClick(product.id)} title="Excluir" className="p-2 text-gray-500 hover:text-[var(--error)] hover:bg-red-50 rounded-full transition-colors cursor-pointer"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isScanning && (
        <BarcodeScanner 
          isOpen={isScanning} 
          onClose={() => setIsScanning(false)}
          onScan={handleScan}
        />
      )}

      {movementConfig.isOpen && movementConfig.product && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-surface w-full max-w-md rounded-[1.5rem] shadow-xl flex flex-col animate-in zoom-in-95 duration-200 border border-border-color">
            <div className={`px-6 py-4 border-b border-border-color flex justify-between items-center ${movementConfig.type === 'entrada' ? 'bg-green-50/50 dark:bg-green-900/20' : 'bg-red-50/50 dark:bg-red-900/20'} rounded-t-[1.5rem]`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${movementConfig.type === 'entrada' ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'} shadow-sm border border-white/50 dark:border-gray-700/50`}>
                  {movementConfig.type === 'entrada' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <h2 className={`text-lg font-bold ${movementConfig.type === 'entrada' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                  {movementConfig.type === 'entrada' ? 'Adicionar Estoque' : 'Retirar Estoque'}
                </h2>
              </div>
              <button type="button" onClick={() => setMovementConfig({ ...movementConfig, isOpen: false })} className="text-gray-500 hover:bg-white/50 p-1.5 rounded-full transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleMovementSubmit} className="p-6 flex flex-col gap-6">
              <div className="bg-[#F7F9FB] dark:bg-gray-800/50 rounded-xl p-4 flex gap-4 border border-[#E0E3E5] dark:border-gray-800">
                {movementConfig.product.imagem_url ? (
                  <img src={movementConfig.product.imagem_url} alt={movementConfig.product.nome} className="w-14 h-14 object-cover rounded-xl border border-[#E0E3E5] dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800" />
                ) : (
                  <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center border border-[#E0E3E5] dark:border-gray-700 text-gray-400 shadow-sm">
                    <ImageIcon className="w-6 h-6 opacity-50" />
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-bold text-gray-900 dark:text-white truncate">{movementConfig.product.nome}</h4>
                  <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-0.5">SKU: {movementConfig.product.sku}</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1.5 flex items-center gap-2">
                    Estoque atual: 
                    <span className="bg-white dark:bg-gray-900 border border-[#E0E3E5] dark:border-gray-700 px-2 py-0.5 rounded-md shadow-sm">
                      {movementConfig.product.quantidade}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Quantidade a {movementConfig.type === 'entrada' ? 'adicionar' : 'retirar'} *
                </label>
                <input 
                  required 
                  autoFocus
                  type="number" 
                  min="1"
                  max={movementConfig.type === 'saida' ? movementConfig.product.quantidade : undefined}
                  value={movementConfig.quantity} 
                  onChange={e => setMovementConfig({ ...movementConfig, quantity: e.target.value })} 
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 outline-none bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white transition-all font-mono text-lg shadow-sm" 
                  style={{
                    borderColor: movementConfig.type === 'entrada' ? 'var(--success)' : 'var(--error)',
                    boxShadow: movementConfig.quantity ? `0 0 0 2px ${movementConfig.type === 'entrada' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)'}` : 'none'
                  }}
                  placeholder="0" 
                />
                {movementConfig.type === 'saida' && movementConfig.quantity > movementConfig.product.quantidade && (
                  <p className="text-[var(--error)] text-xs font-semibold mt-2 px-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--error)] inline-block"></span>
                    Não é possível retirar mais do que há no estoque.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Observação (Opcional)</label>
                <textarea 
                  value={movementConfig.notes} 
                  onChange={e => setMovementConfig({ ...movementConfig, notes: e.target.value })} 
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white transition-all text-sm resize-none h-20 placeholder-gray-400 hover:border-gray-400 dark:hover:border-gray-600 shadow-sm" 
                  placeholder={movementConfig.type === 'entrada' ? "Ex: Lote de reposição recebido..." : "Ex: Retirado para o projeto Y..."}
                ></textarea>
              </div>
              
              <div className="mt-2 pt-6 border-t border-[#E0E3E5] dark:border-gray-800 flex justify-end gap-3">
                <button type="button" onClick={() => setMovementConfig({ ...movementConfig, isOpen: false })} className="px-5 py-2.5 font-semibold rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer shadow-sm">Cancelar</button>
                <button 
                  disabled={isSubmitting || !movementConfig.quantity || parseInt(movementConfig.quantity) <= 0 || (movementConfig.type === 'saida' && parseInt(movementConfig.quantity) > movementConfig.product.quantidade)} 
                  type="submit" 
                  className={`px-6 py-2.5 font-medium text-white rounded-full transition-all shadow-md cursor-pointer flex items-center justify-center min-w-[130px] ${
                    movementConfig.type === 'entrada' 
                      ? 'bg-[var(--success)] hover:brightness-110 border border-transparent' 
                      : 'bg-[var(--error)] hover:brightness-110 border border-transparent'
                  } disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed active:scale-95`}
                >
                  {isSubmitting ? <span className="animate-pulse">Salvando...</span> : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[1.5rem] shadow-xl flex flex-col animate-in zoom-in-95 duration-200 border border-[#E0E3E5] dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-[#E0E3E5] dark:border-gray-800 flex justify-between items-center sticky top-0 z-10 bg-white dark:bg-gray-900">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingId ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button type="button" onClick={closeModal} className="text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors p-1.5 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="p-8 flex flex-col gap-5">
              
              <div className="flex justify-center mb-2">
                <label className="relative cursor-pointer group flex flex-col items-center justify-center w-36 h-36 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-[#E0E3E5] dark:border-gray-700 rounded-[1.5rem] hover:border-[var(--primary)] hover:bg-[var(--primary-container)] dark:hover:bg-gray-700 transition-all overflow-hidden">
                  {imageFile ? (
                    <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
                  ) : newProduct.imagem_url ? (
                    <img src={newProduct.imagem_url} alt="Current" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <ImageIcon className="w-8 h-8 opacity-50 group-hover:opacity-100 group-hover:text-[var(--primary)] transition-all" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Foto</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
                  }} />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                    <span className="text-white text-xs font-bold uppercase tracking-wider">Alterar Foto</span>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Nome do Produto *</label>
                <input required autoFocus type="text" value={newProduct.nome} onChange={e => setNewProduct({...newProduct, nome: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white transition-all placeholder-gray-400 hover:border-gray-400 dark:hover:border-gray-500 shadow-sm" placeholder="Ex: Microcontrolador ESP32" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Categoria *</label>
                <select required value={newProduct.categoria_id} onChange={e => setNewProduct({...newProduct, categoria_id: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white transition-all hover:border-gray-400 dark:hover:border-gray-500 shadow-sm">
                  <option value="">Selecione uma categoria</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Custo Base (R$)</label>
                  <input type="number" step="0.01" value={newProduct.preco_custo} onChange={e => setNewProduct({...newProduct, preco_custo: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white transition-all placeholder-gray-400 shadow-sm" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Quantidade Inicial</label>
                  <input required min="0" type="number" value={newProduct.quantidade} onChange={e => setNewProduct({...newProduct, quantidade: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white transition-all placeholder-gray-400 shadow-sm" placeholder="0" />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed bg-[var(--primary-container)] dark:bg-[var(--primary-container)]/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30">Modificar a quantidade aqui define o ajuste inicial. Para registros de auditoria em histórico, prefira os botões na tabela principal.</p>
              
              <div className="mt-6 pt-6 border-t border-[#E0E3E5] dark:border-gray-800 flex justify-end gap-3 transition-colors">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 font-semibold rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer shadow-sm">Cancelar</button>
                <button disabled={isSubmitting} type="submit" className={`px-6 py-2.5 font-medium bg-[var(--primary)] hover:opacity-90 text-white rounded-full transition-all shadow-md cursor-pointer flex items-center justify-center min-w-[150px] ${isSubmitting ? 'opacity-50 scale-95' : 'active:scale-95'}`}>
                  {isSubmitting ? <span className="animate-pulse">Salvando...</span> : (editingId ? 'Salvar Alterações' : 'Criar Produto')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
