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
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { theme: newTheme };
  }),
  
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
    
    const { data, error } = await supabase
      .from('produtos')
      .insert([{ ...product, user_id: user.id }])
      .select();
      
    if (!error && data) {
      set((state) => ({ products: [data[0], ...state.products] }));
      
      // Registrar no histórico se houver estoque inicial
      if (data[0].quantidade > 0) {
        await get().addMovimentacao(data[0].id, 'entrada', data[0].quantidade, 'Estoque Inicial (Cadastro)');
      } else {
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
    const oldProduct = get().products.find(p => p.id === id);
    const { error } = await supabase
      .from('produtos')
      .update(updates)
      .eq('id', id);
      
    if (!error) {
      set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
      }));

      // Registrar no histórico se a quantidade foi alterada manualmente
      if (updates.quantidade !== undefined && oldProduct && updates.quantidade !== oldProduct.quantidade) {
        const diff = updates.quantidade - oldProduct.quantidade;
        const tipo = diff > 0 ? 'entrada' : 'saida';
        const qtdAbs = Math.abs(diff);
        await get().addMovimentacao(id, tipo, qtdAbs, 'Ajuste Manual via Cadastro');
      } else {
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
    if (!user) return;

    const { error } = await supabase
      .from('movimentacoes')
      .insert([{ user_id: user.id, produto_id, tipo, quantidade: parseInt(quantidade) || 0, motivo }]);

    if (!error) {
      // Atualizar lista de produtos e movimentacoes para refletir a nova quantidade e logs
      get().fetchProducts();
      if (get().fetchMovimentacoes) get().fetchMovimentacoes();
      alert(`Movimentação de ${tipo} salva!`);
      return true;
    } else {
      console.error(error);
      alert('Erro ao salvar movimentação: ' + error.message);
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
