import { useState } from 'react';
import useStore from '../store/useStore';
import { Tags, Plus, X, Edit2, Trash2 } from 'lucide-react';

export function Categories() {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ nome: '', cor: '#6ee591' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeCategoryModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setNewCategory({ nome: '', cor: '#6ee591' });
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.nome) return;
    
    setIsSubmitting(true);
    if (isEditMode) {
      await updateCategory(newCategory.id, { nome: newCategory.nome, cor: newCategory.cor });
    } else {
      await addCategory({
        nome: newCategory.nome,
        cor: newCategory.cor
      });
    }
    
    setIsSubmitting(false);
    closeCategoryModal();
  };

  const handleOpenEdit = (category, e) => {
    e.stopPropagation();
    setIsEditMode(true);
    setNewCategory({ id: category.id, nome: category.nome, cor: category.cor });
    setIsModalOpen(true);
  };
  
  const handleDelete = async (category, e) => {
    e.stopPropagation();
    if(window.confirm(`Tem certeza que deseja deletar a categoria "${category.nome}"?`)) {
      await deleteCategory(category.id);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-['Manrope'] font-bold tracking-tight text-[#dbe2fd]">Categorias</h1>
          <p className="text-[#bdcabc] mt-1 text-sm md:text-base">Organize seus itens tecnológicos</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-[#6ee591] to-[#50c878] hover:opacity-90 text-[#00210c] px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_8px_24px_rgba(80,200,120,0.2)] transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Nova Categoria
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {categories.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 py-16 text-center text-[#bdcabc] bg-[#131b2e] border border-[#3e4a3f]/20 rounded-3xl shadow-sm">
            Nenhuma categoria cadastrada. Crie uma nova para organizar seu estoque!
          </div>
        )}
      {categories.map(category => {
        const categoryProductsCount = products.filter(p => p.categoria_id === category.id).length;
        return (
          <div key={category.id} onClick={() => setSelectedCategory(category)} className="bg-[#171f33] border border-[#3e4a3f]/20 rounded-3xl p-6 shadow-sm hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 group cursor-pointer hover:-translate-y-1 relative">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-5">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner border border-white/5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                  style={{ backgroundColor: `${category.cor}20`, borderColor: `${category.cor}30` }}
                >
                  <Tags className="w-8 h-8 drop-shadow-md" style={{ color: category.cor }} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#dbe2fd] group-hover:text-white transition-colors">{category.nome}</h3>
                  <p className="text-sm font-medium text-[#bdcabc] mt-1 bg-[#242c40] inline-block px-3 py-1 rounded-lg">
                    {categoryProductsCount} {categoryProductsCount === 1 ? 'item' : 'itens'}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => handleOpenEdit(category, e)}
                  title="Editar Categoria"
                  className="p-2 bg-[#242c40] hover:bg-[#6ee591] text-[#bdcabc] hover:text-[#00210c] rounded-xl transition-colors shadow-sm"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => handleDelete(category, e)}
                  title="Excluir Categoria"
                  className="p-2 bg-[#242c40] hover:bg-[#ff5555] text-[#bdcabc] hover:text-white rounded-xl transition-colors shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>

    {/* Modal of Selected Category Products */}
    {selectedCategory && (
      <div className="fixed inset-0 bg-[#0b1326]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-[#131b2e] w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-[0_24px_48px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-[#3e4a3f]/30">
          <div className="px-6 py-5 border-b border-[#3e4a3f]/20 bg-[#171f33] flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner border border-white/5"
                style={{ backgroundColor: `${selectedCategory.cor}20`, borderColor: `${selectedCategory.cor}30` }}
              >
                <Tags className="w-5 h-5 drop-shadow-md" style={{ color: selectedCategory.cor }} />
              </div>
              <h2 className="text-xl font-['Manrope'] font-bold text-[#dbe2fd]">{selectedCategory.nome}</h2>
            </div>
            <button onClick={() => setSelectedCategory(null)} className="text-[#bdcabc] border border-transparent rounded-lg p-1 hover:border-[#3e4a3f]/40 hover:bg-[#242c40] hover:text-white transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto custom-scrollbar">
            {products.filter(p => p.categoria_id === selectedCategory.id).length === 0 ? (
               <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-full bg-[#171f33] border border-[#3e4a3f] flex items-center justify-center mx-auto mb-4">
                     <Tags className="w-8 h-8 text-[#bdcabc]/50" />
                  </div>
                  <p className="text-[#bdcabc] font-medium text-lg">Nenhum item nesta categoria.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {products.filter(p => p.categoria_id === selectedCategory.id).map(prod => (
                    <div key={prod.id} className="flex items-center gap-4 bg-[#171f33] hover:bg-[#1a233b] transition-colors p-4 rounded-2xl border border-[#3e4a3f]/20 group">
                        <img 
                          src={prod.imagem || `https://ui-avatars.com/api/?name=${encodeURIComponent(prod.nome)}&background=131b2e&color=dbe2fd`} 
                          alt={prod.nome} 
                          className="w-14 h-14 rounded-xl object-cover bg-[#0b1326] border border-[#3e4a3f]/20 group-hover:border-[#6ee591]/30 transition-colors" 
                        />
                        <div className="flex-1 min-w-0">
                           <h4 className="text-[#dbe2fd] font-bold truncate">{prod.nome}</h4>
                           <div className="flex items-center text-xs text-[#bdcabc] mt-1 gap-2">
                             <span className="truncate max-w-[80px]" title={prod.sku || 'Sem SKU'}>{prod.sku || 'S/N'}</span>
                             <span className="w-1 h-1 rounded-full bg-[#3e4a3f]"></span>
                             <span className="font-mono text-[#6ee591] font-bold">Qtd: {prod.quantidade}</span>
                           </div>
                        </div>
                    </div>
                 ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    {isModalOpen && (
        <div className="fixed inset-0 bg-[#0b1326]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#131b2e] w-full max-w-sm rounded-3xl shadow-[0_24px_48px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-[#3e4a3f]/30">
             <div className="px-6 py-5 border-b border-[#3e4a3f]/20 bg-[#171f33] flex justify-between items-center">
              <h2 className="text-xl font-['Manrope'] font-bold text-[#dbe2fd]">{isEditMode ? 'Editar Categoria' : 'Nova Categoria'}</h2>
              <button onClick={closeCategoryModal} className="text-[#bdcabc] hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddCategory} className="p-6 flex flex-col gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-[#bdcabc]">Nome da Categoria</label>
                <input required autoFocus type="text" value={newCategory.nome} onChange={e => setNewCategory({...newCategory, nome: e.target.value})} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#6ee591]/50 outline-none bg-[#0b1326] border-[#3e4a3f]/30 text-[#dbe2fd] transition-all placeholder-[#bdcabc]/30 hover:border-[#3e4a3f]/60" placeholder="Ex: Microcontroladores..." />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-[#bdcabc]">Cor de Identificação</label>
                <div className="relative">
                  <input type="color" value={newCategory.cor} onChange={e => setNewCategory({...newCategory, cor: e.target.value})} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="Escolha a cor da categoria" />
                  <div className="w-full h-14 rounded-xl border border-[#3e4a3f]/30 flex items-center justify-between px-4 transition-all hover:border-[#3e4a3f]/60" style={{ backgroundColor: `${newCategory.cor}20` }}>
                    <span className="font-mono font-bold text-[#dbe2fd]">{newCategory.cor}</span>
                    <div className="w-8 h-8 rounded-lg shadow-inner border border-white/20" style={{ backgroundColor: newCategory.cor }}></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-2 flex justify-end gap-3">
                <button type="button" onClick={closeCategoryModal} className="px-5 py-3 font-semibold rounded-xl bg-[#242c40] hover:bg-[#2d3449] text-[#bdcabc] transition-colors cursor-pointer">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-3 font-bold bg-gradient-to-r from-[#6ee591] to-[#50c878] hover:opacity-90 text-[#00210c] rounded-xl transition-all shadow-[0_8px_24px_rgba(80,200,120,0.2)] cursor-pointer flex items-center justify-center disabled:opacity-50">
                  {isSubmitting ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Criar Categoria')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
