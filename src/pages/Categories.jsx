import { useState } from 'react';
import useStore from '../store/useStore';
import { Tags, Plus, X, Edit2, Trash2 } from 'lucide-react';

export function Categories() {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ nome: '', cor: '#0084FF' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeCategoryModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setNewCategory({ nome: '', cor: '#0084FF' });
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
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Categorias</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">Organize seus itens tecnológicos</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[var(--primary)] hover:opacity-90 text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Nova Categoria
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {categories.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 py-16 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 border border-[#E0E3E5] dark:border-slate-700 rounded-[1.5rem] shadow-[0_4px_20px_rgba(26,43,75,0.04)] transition-colors">
            Nenhuma categoria cadastrada. Crie uma nova para organizar seu estoque!
          </div>
        )}
      {categories.map(category => {
        const categoryProductsCount = products.filter(p => p.categoria_id === category.id).length;
        return (
          <div key={category.id} onClick={() => setSelectedCategory(category)} className="bg-white dark:bg-slate-800 border border-[#E0E3E5] dark:border-slate-700 rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgba(26,43,75,0.04)] hover:shadow-[0_8px_30px_rgba(26,43,75,0.08)] transition-all duration-300 group cursor-pointer hover:-translate-y-1 relative">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                  style={{ backgroundColor: `${category.cor}15`, borderColor: `${category.cor}30` }}
                >
                  <Tags className="w-6 h-6" style={{ color: category.cor }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-[var(--primary)] transition-colors">{category.nome}</h3>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1.5 bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 inline-block px-2.5 py-1 rounded-md transition-colors">
                    {categoryProductsCount} {categoryProductsCount === 1 ? 'item' : 'itens'}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => handleOpenEdit(category, e)}
                  title="Editar Categoria"
                  className="p-2 bg-gray-50 dark:bg-slate-700 hover:bg-[var(--primary-container)] text-gray-500 dark:text-gray-400 hover:text-[var(--primary)] dark:hover:text-[var(--primary)] rounded-full transition-colors border border-transparent"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={(e) => handleDelete(category, e)}
                  title="Excluir Categoria"
                  className="p-2 bg-gray-50 dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-500 dark:text-gray-400 hover:text-[var(--error)] dark:hover:text-[var(--error)] rounded-full transition-colors border border-transparent"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>

    {/* Modal of Selected Category Products */}
    {selectedCategory && (
      <div className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 w-full max-w-2xl max-h-[85vh] rounded-[1.5rem] shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-[#E0E3E5] dark:border-slate-700 transition-colors">
          <div className="px-6 py-5 border-b border-[#E0E3E5] dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800/80 transition-colors">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center border"
                style={{ backgroundColor: `${selectedCategory.cor}15`, borderColor: `${selectedCategory.cor}30` }}
              >
                <Tags className="w-5 h-5" style={{ color: selectedCategory.cor }} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">{selectedCategory.nome}</h2>
            </div>
            <button onClick={() => setSelectedCategory(null)} className="text-gray-400 dark:text-gray-500 border border-transparent rounded-full p-1.5 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-200 transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto">
            {products.filter(p => p.categoria_id === selectedCategory.id).length === 0 ? (
               <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-slate-700/50 border border-[#E0E3E5] dark:border-slate-600 flex items-center justify-center mx-auto mb-4">
                     <Tags className="w-8 h-8 text-gray-300 dark:text-gray-500" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Nenhum item nesta categoria.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {products.filter(p => p.categoria_id === selectedCategory.id).map(prod => (
                    <div key={prod.id} className="flex items-center gap-4 bg-white dark:bg-slate-800 hover:bg-[#F7F9FB] dark:hover:bg-slate-700/50 transition-colors p-4 rounded-[1rem] border border-[#E0E3E5] dark:border-slate-700 group">
                        <img 
                          src={prod.imagem || `https://ui-avatars.com/api/?name=${encodeURIComponent(prod.nome)}&background=f3f4f6&color=111827`} 
                          alt={prod.nome} 
                          className="w-12 h-12 rounded-xl object-cover bg-gray-100 dark:bg-slate-700 border border-[#E0E3E5] dark:border-slate-600" 
                        />
                        <div className="flex-1 min-w-0">
                           <h4 className="text-gray-900 dark:text-gray-100 font-bold truncate text-sm">{prod.nome}</h4>
                           <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1 gap-2">
                             <span className="truncate max-w-[80px]" title={prod.sku || 'Sem SKU'}>{prod.sku || 'S/N'}</span>
                             <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600"></span>
                             <span className="font-mono text-[var(--primary)] font-bold">Qtd: {prod.quantidade}</span>
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
        <div className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[1.5rem] shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-[#E0E3E5] dark:border-slate-700 transition-colors">
             <div className="px-6 py-5 border-b border-[#E0E3E5] dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800/80 transition-colors">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">{isEditMode ? 'Editar Categoria' : 'Nova Categoria'}</h2>
              <button type="button" onClick={closeCategoryModal} className="text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-200 p-1.5 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddCategory} className="p-6 flex flex-col gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Nome da Categoria</label>
                <input required autoFocus type="text" value={newCategory.nome} onChange={e => setNewCategory({...newCategory, nome: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-100 transition-all placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-400 dark:hover:border-slate-500" placeholder="Ex: Microcontroladores..." />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Cor de Identificação</label>
                <div className="relative">
                  <input type="color" value={newCategory.cor} onChange={e => setNewCategory({...newCategory, cor: e.target.value})} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="Escolha a cor da categoria" />
                  <div className="w-full h-12 rounded-xl border border-gray-300 dark:border-slate-600 flex items-center justify-between px-4 transition-all hover:border-gray-400 dark:hover:border-slate-500 bg-white dark:bg-slate-900">
                    <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{newCategory.cor}</span>
                    <div className="w-6 h-6 rounded-md shadow-sm border border-gray-200 dark:border-slate-700" style={{ backgroundColor: newCategory.cor }}></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-2 flex justify-end gap-3">
                <button type="button" onClick={closeCategoryModal} className="px-5 py-2.5 font-semibold rounded-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer shadow-sm">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 font-medium bg-[var(--primary)] hover:opacity-90 text-white rounded-full transition-all shadow-sm cursor-pointer flex items-center justify-center disabled:opacity-50">
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
