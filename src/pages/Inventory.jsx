import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import useStore from '../store/useStore';
import { Search, Plus, ArrowUpDown, Edit2, Trash2, ArrowDownRight, ArrowUpRight, Image as ImageIcon, Download, ScanLine, X } from 'lucide-react';
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
    <div className="space-y-6 md:space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-['Manrope'] font-bold tracking-tight text-[#dbe2fd]">Estoque</h1>
          <p className="text-[#bdcabc] mt-1 text-sm md:text-base">Gerencie seus produtos e componentes</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-[#6ee591] to-[#50c878] hover:opacity-90 text-[#00210c] px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_8px_24px_rgba(80,200,120,0.2)] transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </div>

      <div className="bg-[#131b2e] border border-[#3e4a3f]/20 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-[#3e4a3f]/20 flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#171f33]/50">
          <div className="relative w-full sm:max-w-md flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#bdcabc]/60 w-5 h-5" />
              <input 
                type="text"
                placeholder="Pesquisar por nome ou SKU..."
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#3e4a3f]/30 bg-[#0b1326] text-[#dbe2fd] focus:outline-none focus:ring-2 focus:ring-[#6ee591]/50 transition-all placeholder-[#bdcabc]/40"
              />
            </div>
            <button 
              onClick={() => setIsScanning(true)}
              className="md:hidden p-2.5 border border-[#3e4a3f]/30 bg-[#0b1326] rounded-xl text-[#bdcabc] hover:text-[#6ee591] transition-colors"
            >
              <ScanLine className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#242c40] hover:bg-[#2d3449] border border-[#3e4a3f]/20 text-[#dbe2fd] transition-colors w-full sm:w-auto justify-center text-sm font-medium cursor-pointer"
            >
              <ArrowUpDown className="w-4 h-4 text-[#bdcabc]" />
              Qtd ({sortOrder === 'asc' ? 'Cresc' : 'Decresc'})
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6ee591]/10 hover:bg-[#6ee591]/20 border border-[#6ee591]/30 text-[#6ee591] transition-colors w-full sm:w-auto justify-center text-sm font-semibold cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>

        {/* Desktop Table View (Hidden on very small mobile if preferred, but styled responsively) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#171f33] border-b border-[#3e4a3f]/20">
              <tr>
                <th className="px-6 py-4 font-bold text-[#bdcabc] tracking-wider uppercase text-xs w-16">IMG</th>
                <th className="px-6 py-4 font-bold text-[#bdcabc] tracking-wider uppercase text-xs">Produto</th>
                <th className="px-6 py-4 font-bold text-[#bdcabc] tracking-wider uppercase text-xs">SKU</th>
                <th className="px-6 py-4 font-bold text-[#bdcabc] tracking-wider uppercase text-xs">Categoria</th>
                <th className="px-6 py-4 font-bold text-[#bdcabc] tracking-wider uppercase text-xs text-right">Custo</th>
                <th className="px-6 py-4 font-bold text-[#bdcabc] tracking-wider uppercase text-xs text-center">Estoque</th>
                <th className="px-6 py-4 font-bold text-[#bdcabc] tracking-wider uppercase text-xs text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3e4a3f]/10">
              {filteredAndSortedProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center text-[#bdcabc]">Nenhum produto encontrado.</td>
                </tr>
              ) : (
                filteredAndSortedProducts.map(product => {
                  const category = categories.find(c => c.id === product.categoria_id);
                  return (
                    <tr key={product.id} className="hover:bg-[#1a2336] transition-colors group">
                      <td className="px-6 py-4">
                        {product.imagem_url ? (
                          <img src={product.imagem_url} alt={product.nome} className="w-10 h-10 object-cover rounded-xl border border-[#3e4a3f]/20 shadow-sm" />
                        ) : (
                          <div className="w-10 h-10 bg-[#0b1326] rounded-xl flex items-center justify-center border border-[#3e4a3f]/20 text-[#bdcabc]">
                            <ImageIcon className="w-5 h-5 opacity-40" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-[#dbe2fd] text-base">{product.nome}</td>
                      <td className="px-6 py-4 text-[#bdcabc] font-mono text-xs">{product.sku}</td>
                      <td className="px-6 py-4">
                        <span 
                          className="px-3 py-1.5 rounded-lg text-xs font-bold border" 
                          style={{ backgroundColor: `${category?.cor}15`, color: category?.cor, borderColor: `${category?.cor}30` }}
                        >
                          {category?.nome || 'Sem Categoria'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-[#dbe2fd]">R$ {product.preco_custo?.toFixed(2) || '0.00'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center min-w-[3rem] h-8 rounded-lg font-extrabold text-sm ${product.quantidade <= 5 ? 'bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/20' : 'bg-[#242c40] text-[#dbe2fd] border border-[#3e4a3f]/20'}`}>
                          {product.quantidade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setMovementConfig({ isOpen: true, product, type: 'entrada' })} title="Adicionar Estoque" className="p-2 text-[#6ee591] hover:bg-[#6ee591]/10 rounded-xl transition-colors cursor-pointer"><ArrowDownRight className="w-5 h-5"/></button>
                          <button onClick={() => setMovementConfig({ isOpen: true, product, type: 'saida' })} title="Retirar Estoque" className="p-2 text-[#ffb4ab] hover:bg-[#ffb4ab]/10 rounded-xl transition-colors cursor-pointer"><ArrowUpRight className="w-5 h-5"/></button>
                          
                          <div className="w-px h-6 bg-[#3e4a3f]/30 mx-1"></div>
                          
                          <button onClick={() => handleEditClick(product)} title="Editar" className="p-2 text-[#bdcabc] hover:text-[#dbe2fd] hover:bg-[#2d3449] rounded-xl transition-colors cursor-pointer"><Edit2 className="w-4 h-4"/></button>
                          <button onClick={() => handleDeleteClick(product.id)} title="Excluir" className="p-2 text-[#bdcabc] hover:text-[#ffb4ab] hover:bg-[#ffb4ab]/10 rounded-xl transition-colors cursor-pointer"><Trash2 className="w-4 h-4"/></button>
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
        <div className="fixed inset-0 bg-[#0b1326]/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-[#131b2e] w-full max-w-lg rounded-3xl shadow-[0_24px_48px_rgba(0,0,0,0.5)] flex flex-col animate-in zoom-in-95 duration-200 border border-[#3e4a3f]/30 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-[#3e4a3f]/20 bg-[#171f33] flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-xl font-['Manrope'] font-bold text-[#dbe2fd]">
                {editingId ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button type="button" onClick={closeModal} className="text-[#bdcabc] hover:text-white transition-colors">
                <X className="w-6 h-6" /> {/* Assume-se import X no topo mas fallback via closeModal click */}
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="p-6 flex flex-col gap-5">
              
              <div className="flex justify-center mb-2">
                <label className="relative cursor-pointer group flex flex-col items-center justify-center w-36 h-36 bg-[#0b1326] border-2 border-dashed border-[#3e4a3f]/50 rounded-3xl hover:border-[#6ee591]/50 hover:bg-[#1a2336] transition-all overflow-hidden shadow-inner">
                  {imageFile ? (
                    <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
                  ) : newProduct.imagem_url ? (
                    <img src={newProduct.imagem_url} alt="Current" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-[#bdcabc]/50">
                      <ImageIcon className="w-8 h-8 opacity-50 group-hover:opacity-100 group-hover:text-[#6ee591] transition-all" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Foto</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
                  }} />
                  <div className="absolute inset-0 bg-[#0b1326]/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    <span className="text-[#6ee591] text-xs font-bold uppercase tracking-wider">Alterar Foto</span>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-[#bdcabc]">Nome do Produto *</label>
                <input required autoFocus type="text" value={newProduct.nome} onChange={e => setNewProduct({...newProduct, nome: e.target.value})} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#6ee591]/50 outline-none bg-[#0b1326] border-[#3e4a3f]/30 text-[#dbe2fd] transition-all placeholder-[#bdcabc]/30 hover:border-[#3e4a3f]/60" placeholder="Ex: Microcontrolador ESP32" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-[#bdcabc]">Categoria *</label>
                <select required value={newProduct.categoria_id} onChange={e => setNewProduct({...newProduct, categoria_id: e.target.value})} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#6ee591]/50 outline-none bg-[#0b1326] border-[#3e4a3f]/30 text-[#dbe2fd] transition-all hover:border-[#3e4a3f]/60">
                  <option value="">Selecione uma categoria</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#bdcabc]">Custo Base (R$)</label>
                  <input type="number" step="0.01" value={newProduct.preco_custo} onChange={e => setNewProduct({...newProduct, preco_custo: e.target.value})} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#6ee591]/50 outline-none bg-[#0b1326] border-[#3e4a3f]/30 text-[#dbe2fd] transition-all placeholder-[#bdcabc]/30" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#bdcabc]">Quantidade Inicial</label>
                  <input required min="0" type="number" value={newProduct.quantidade} onChange={e => setNewProduct({...newProduct, quantidade: e.target.value})} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#6ee591]/50 outline-none bg-[#0b1326] border-[#3e4a3f]/30 text-[#dbe2fd] transition-all placeholder-[#bdcabc]/30" placeholder="0" />
                </div>
              </div>
              <p className="text-xs text-[#bdcabc]/70 mt-1 leading-relaxed bg-[#6ee591]/5 p-3 rounded-xl border border-[#6ee591]/10">Modificar a quantidade aqui define o ajuste inicial. Para registros de auditoria em histórico, prefira os botões na tabela principal.</p>
              
              <div className="mt-6 pt-6 border-t border-[#3e4a3f]/20 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-5 py-3 font-semibold rounded-xl bg-[#242c40] hover:bg-[#2d3449] text-[#bdcabc] transition-colors cursor-pointer">Cancelar</button>
                <button disabled={isSubmitting} type="submit" className={`px-6 py-3 font-bold bg-gradient-to-r from-[#6ee591] to-[#50c878] hover:opacity-90 text-[#00210c] rounded-xl transition-all shadow-[0_8px_24px_rgba(80,200,120,0.2)] cursor-pointer flex items-center justify-center min-w-[150px] ${isSubmitting ? 'opacity-50 scale-95' : 'hover:scale-105 active:scale-95'}`}>
                  {isSubmitting ? <span className="animate-pulse">Salvando...</span> : (editingId ? 'Salvar Alterações' : 'Criar Produto')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
