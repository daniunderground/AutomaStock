import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

const useStore = create(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      theme: 'dark', // Padrão
  
  categories: [],
  products: [],
  movimentacoes: [],
  searchQuery: '',
  loading: false,

  // Auth Actions
  setSession: (session) => set({ 
    session, 
    user: session?.user || null 
  }),

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, categories: [], products: [] });
  },

  // Theme Actions
  setTheme: (theme) => set({ theme }),
  
  // Search Actions
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  
  // Data Actions
  fetchMovimentacoes: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('movimentacoes')
      .select('*, produtos(nome, sku)')
      .order('created_at', { ascending: false });
    if (!error && data) {
      set({ movimentacoes: data, loading: false });
    } else {
      console.error(error);
      set({ loading: false });
    }
  },

  fetchCategories: async () => {
    set({ loading: true });
    const { data, error } = await supabase.from('categorias').select('*').order('nome');
    if (!error && data) {
      set({ categories: data, loading: false });
    } else {
      set({ loading: false });
    }
  },

  fetchProducts: async () => {
    set({ loading: true });
    const { data, error } = await supabase.from('produtos').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      set({ products: data, loading: false });
    } else {
      set({ loading: false });
    }
  },

  addProduct: async (product) => {
    const user = get().user;
    if (!user) return;
    
    // Se houver trigger no Supabase, inserir quantidade direto + movimentação duplica o valor.
    // Inserimos com 0 e deixamos a movimentação adicionar o saldo.
    const initialQty = parseInt(product.quantidade) || 0;
    const { data, error } = await supabase
      .from('produtos')
      .insert([{ ...product, quantidade: 0, user_id: user.id }])
      .select();
      
    if (!error && data) {
      if (initialQty > 0) {
        await get().addMovimentacao(data[0].id, 'entrada', initialQty, 'Estoque Inicial (Cadastro)');
      } else {
        set((state) => ({ products: [data[0], ...state.products] }));
        alert('Produto salvo com sucesso!');
      }
    } else {
      console.error(error);
      alert('Erro ao salvar produto: ' + error.message);
    }
  },

  deleteProduct: async (id) => {
    const { error } = await supabase.from('produtos').delete().eq('id', id);
    if (!error) {
      set((state) => ({
        products: state.products.filter(p => p.id !== id)
      }));
    } else {
      console.error(error);
      alert('Erro ao deletar produto: ' + error.message);
    }
  },

  updateProduct: async (id, updates) => {
    // Get latest data from DB to avoid stale state doubling bug
    const { data: oldProduct } = await supabase
      .from('produtos')
      .select('quantidade')
      .eq('id', id)
      .single();

    const newUpdates = { ...updates };
    
    let diff = 0;
    let tipo = null;
    let qtdAbs = 0;

    if (newUpdates.quantidade !== undefined && oldProduct) {
      const newQty = parseInt(newUpdates.quantidade) || 0;
      const oldQty = parseInt(oldProduct.quantidade) || 0;
      
      if (newQty !== oldQty) {
        diff = newQty - oldQty;
        tipo = diff > 0 ? 'entrada' : 'saida';
        qtdAbs = Math.abs(diff);
      }
      delete newUpdates.quantidade;
    }

    let error = null;
    if (Object.keys(newUpdates).length > 0) {
      const { error: updateError } = await supabase
        .from('produtos')
        .update(newUpdates)
        .eq('id', id);
      error = updateError;
    }
      
    if (!error) {
      if (qtdAbs > 0) {
        // Reset local quantity to the old one before fetching, to avoid doubled UI if fetch is slow
        // Actually, better to just let the fetch update everything.
        await get().addMovimentacao(id, tipo, qtdAbs, 'Ajuste Manual via Edição');
      } else if (Object.keys(newUpdates).length > 0) {
        set((state) => ({
          products: state.products.map(p => p.id === id ? { ...p, ...newUpdates } : p)
        }));
        alert('Produto atualizado com sucesso!');
      }
    } else {
      console.error(error);
      alert('Erro ao atualizar produto: ' + error.message);
    }
  },

  addCategory: async (category) => {
    const user = get().user;
    if (!user) return;

    const { data, error } = await supabase
      .from('categorias')
      .insert([{ ...category, user_id: user.id }])
      .select();

    if (!error && data) {
      set((state) => ({ categories: [...state.categories, data[0]] }));
      alert('Categoria criada com sucesso!');
    } else {
      console.error(error);
      alert('Erro ao criar categoria: ' + error.message);
    }
  },

  updateCategory: async (id, updates) => {
    const { error } = await supabase
      .from('categorias')
      .update(updates)
      .eq('id', id);
      
    if (!error) {
      set((state) => ({
        categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c)
      }));
      alert('Categoria atualizada com sucesso!');
    } else {
      console.error(error);
      alert('Erro ao atualizar categoria: ' + error.message);
    }
  },

  deleteCategory: async (id) => {
    const { error } = await supabase.from('categorias').delete().eq('id', id);
    if (!error) {
      set((state) => ({
        categories: state.categories.filter(c => c.id !== id)
      }));
    } else {
      console.error(error);
      // Handles cases where there are items attached and we get a foreign key constraint error
      if (error.code === '23503') {
        alert('Não é possível deletar esta categoria pois existem produtos associados a ela.');
      } else {
        alert('Erro ao deletar categoria: ' + error.message);
      }
    }
  },

  uploadProductImage: async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('produtos')
        .upload(filePath, file);

      if (uploadError) {
        console.error(uploadError);
        alert('Erro ao enviar imagem: ' + uploadError.message);
        return null;
      }

      const { data } = supabase.storage
        .from('produtos')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  addMovimentacao: async (produto_id, tipo, quantidade, motivo) => {
    const user = get().user;
    if (!user) return false;

    const parsedQtd = parseInt(quantidade) || 0;
    if (parsedQtd <= 0) return false;

    const product = get().products.find(p => p.id === produto_id);
    if (!product) return false;

    // Let the database trigger handle the product quantity update
    // The trigger will automatically add or subtract from 'produtos' table based on the new 'movimentacoes' row.

    const { error } = await supabase
      .from('movimentacoes')
      .insert([{ user_id: user.id, produto_id, tipo, quantidade: parsedQtd, motivo }]);

    if (!error) {
      // Atualizar lista de produtos e movimentacoes para refletir a nova quantidade e logs
      get().fetchProducts();
      if (get().fetchMovimentacoes) get().fetchMovimentacoes();
      alert(`Movimentação de ${tipo} salva com sucesso!`);
      return true;
    } else {
      console.error(error);
      alert('Erro ao salvar histórico de movimentação: ' + error.message);
      return false;
    }
  }
}),
{
  name: 'automastock-storage',
  partialize: (state) => ({ theme: state.theme }), // Only persist the theme preference
}
));

export default useStore;
