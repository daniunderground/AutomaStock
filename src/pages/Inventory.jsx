import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import useStore from '../store/useStore';
import { Search, Plus, ArrowUpDown, Edit2, Trash2, ArrowDownRight, ArrowUpRight, Image as ImageIcon, Download, ScanLine, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { MovementModal } from '../components/MovementModal';
import { exportToCSV } from '../lib/exportUtils';
import { BarcodeScanner } from '../components/BarcodeScanner';

export function Inventory() {
  const { products, categories, addProduct, updateProduct, deleteProduct, uploadProductImage } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
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
    if (q && q !== search) {
      setSearch(q);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (val) setSearchParams({ search: val });
    else setSearchParams({});
  };

  const handleScan = (decodedText) => {
    setIsScanning(false);
    if ("vibrate" in navigator) navigator.vibrate(200);
    setSearch(decodedText);
    setSearchParams({ search: decodedText });
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
      updateProduct(editingId, {
         nome: newProduct.nome,
         categoria_id: newProduct.categoria_id,
         preco_custo: parseFloat(newProduct.preco_custo) || 0,
         quantidade: parseInt(newProduct.quantidade) || 0,
         imagem_url: finalImageUrl
      });
    } else {
      addProduct({
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
    .filter(p => p.nome.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      // Prioritize exact SKU match
      if (search && a.sku?.toLowerCase() === search.toLowerCase()) return -1;
      if (search && b.sku?.toLowerCase() === search.toLowerCase()) return 1;
      
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
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50 flex items-center gap-3">
            Estoque
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">Gerencie seus produtos e componentes</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl flex flex-col overflow-hidden transition-colors">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 dark:bg-gray-800/80 transition-colors">
          <div className="relative w-full sm:max-w-md flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input 
                type="text"
                placeholder="Pesquisar por nome ou SKU..."
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-400 dark:hover:border-gray-500 shadow-sm"
              />
            </div>
            <button 
              onClick={() => setIsScanning(true)}
              className="md:hidden p-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm"
            >
              <ScanLine className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm w-full sm:w-auto justify-center text-sm font-medium cursor-pointer"
            >
              <ArrowUpDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              Qtd ({sortOrder === 'asc' ? 'Cresc' : 'Decresc'})
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 transition-colors w-full sm:w-auto justify-center text-sm font-semibold cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 transition-colors">
              <tr>
                <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs w-16">IMG</th>
                <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs">Produto</th>
                <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs">SKU</th>
                <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs">Categoria</th>
                <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs text-right">Custo</th>
                <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs text-center">Estoque</th>
                <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 transition-colors">
              {filteredAndSortedProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center text-gray-500 dark:text-gray-400">Nenhum produto encontrado.</td>
                </tr>
              ) : (
                filteredAndSortedProducts.map(product => {
                  const category = categories.find(c => c.id === product.categoria_id);
                  return (
                    <tr key={product.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-500/10 transition-colors group">
                      <td className="px-6 py-4">
                        {product.imagem_url ? (
                          <img src={product.imagem_url} alt={product.nome} className="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500">
                            <ImageIcon className="w-5 h-5 opacity-50" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-50 text-base">{product.nome}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-xs">{product.sku}</td>
                      <td className="px-6 py-4">
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-semibold border" 
                          style={{ backgroundColor: `${category?.cor || '#6B7280'}15`, color: category?.cor || '#6B7280', borderColor: `${category?.cor || '#6B7280'}30` }}
                        >
                          {category?.nome || 'Sem Categoria'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">R$ {product.preco_custo?.toFixed(2) || '0.00'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center min-w-[3rem] h-8 rounded-lg font-bold text-sm ${product.quantidade <= 5 ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600'}`}>
                          {product.quantidade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setMovementConfig({ isOpen: true, product, type: 'entrada' })} title="Adicionar Estoque" className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-500/20 rounded-lg transition-colors cursor-pointer"><ArrowDownRight className="w-5 h-5"/></button>
                          <button onClick={() => setMovementConfig({ isOpen: true, product, type: 'saida' })} title="Retirar Estoque" className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer"><ArrowUpRight className="w-5 h-5"/></button>
                          
                          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                          
                          <button onClick={() => handleEditClick(product)} title="Editar" className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"><Edit2 className="w-4 h-4"/></button>
                          <button onClick={() => handleDeleteClick(product.id)} title="Excluir" className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"><Trash2 className="w-4 h-4"/></button>
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

      <MovementModal 
        isOpen={movementConfig.isOpen} 
        onClose={() => setMovementConfig({ isOpen: false, product: null, type: null })} 
        product={movementConfig.product} 
        type={movementConfig.type} 
      />

      {isScanning && (
        <BarcodeScanner 
          isOpen={isScanning} 
          onClose={() => setIsScanning(false)} 
          onScan={handleScan} 
        />
      )}

      {/* Modal Produto Redesenhada */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-xl flex flex-col animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto transition-colors">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 z-10 bg-white dark:bg-gray-800 transition-colors">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                {editingId ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button type="button" onClick={closeModal} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="p-6 flex flex-col gap-5">
              
              <div className="flex justify-center mb-2">
                <label className="relative cursor-pointer group flex flex-col items-center justify-center w-36 h-36 bg-gray-50 dark:bg-gray-700/50 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all overflow-hidden">
                  {imageFile ? (
                    <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
                  ) : newProduct.imagem_url ? (
                    <img src={newProduct.imagem_url} alt="Current" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
                      <ImageIcon className="w-8 h-8 opacity-50 group-hover:opacity-100 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-all" />
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
                <input required autoFocus type="text" value={newProduct.nome} onChange={e => setNewProduct({...newProduct, nome: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none bg-white dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-50 transition-all placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-400 dark:hover:border-gray-500 shadow-sm" placeholder="Ex: Microcontrolador ESP32" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Categoria *</label>
                <select required value={newProduct.categoria_id} onChange={e => setNewProduct({...newProduct, categoria_id: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none bg-white dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-50 transition-all hover:border-gray-400 dark:hover:border-gray-500 shadow-sm">
                  <option value="">Selecione uma categoria</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Custo Base (R$)</label>
                  <input type="number" step="0.01" value={newProduct.preco_custo} onChange={e => setNewProduct({...newProduct, preco_custo: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none bg-white dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-50 transition-all placeholder-gray-400 dark:placeholder-gray-500 shadow-sm" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Quantidade Inicial</label>
                  <input required min="0" type="number" value={newProduct.quantidade} onChange={e => setNewProduct({...newProduct, quantidade: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none bg-white dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-50 transition-all placeholder-gray-400 dark:placeholder-gray-500 shadow-sm" placeholder="0" />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">Modificar a quantidade aqui define o ajuste inicial. Para registros de auditoria em histórico, prefira os botões na tabela principal.</p>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 transition-colors">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 font-semibold rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer shadow-sm">Cancelar</button>
                <button disabled={isSubmitting} type="submit" className={`px-6 py-2.5 font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all shadow-sm cursor-pointer flex items-center justify-center min-w-[150px] ${isSubmitting ? 'opacity-50 scale-95' : 'hover:scale-105 active:scale-95'}`}>
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
