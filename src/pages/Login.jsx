import { useState } from 'react';
import useStore from '../store/useStore';
import { Package, CircuitBoard, ChevronRight, Loader2 } from 'lucide-react';

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        alert('Verifique seu e-mail para confirmar a conta! (Se não estiver usando auto-confirm)');
      }
    } catch (err) {
      setError(err.message || 'Erro ao autenticar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans transition-colors">
      
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 mb-8">
        <div className="flex justify-center items-center mb-6 relative">
          <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full w-20 h-20 mx-auto" />
          <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-center shadow-md relative z-10 p-4 transition-colors">
            <CircuitBoard className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-4xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">
          AutomaStock
        </h2>
        <p className="mt-3 text-center text-gray-500 dark:text-gray-400 text-lg max-w-sm mx-auto">
          Gerencie seu inventário técnico com precisão e controle.
        </p>
      </div>

      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl py-10 px-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-2xl border border-gray-100 dark:border-gray-700 sm:px-12 transition-colors">
          
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">
              {isLogin ? 'Bem-vindo de volta' : 'Criar nova conta'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isLogin ? 'Insira suas credenciais para acessar' : 'Preencha os dados e junte-se a nós'}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium flex items-center shadow-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Endereço de Email
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all sm:text-sm hover:border-gray-400 dark:hover:border-gray-500 shadow-sm"
                    placeholder="voce@exemplo.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Senha Estratégica
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all sm:text-sm hover:border-gray-400 dark:hover:border-gray-500 shadow-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500 disabled:opacity-70 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Entrar no Sistema' : 'Criar Conta Agora'}
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
            
            <div className="mt-8 text-center pt-6 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isLogin ? 'Primeira vez aqui?' : 'Já é de casa?'}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 py-2 font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors focus:outline-none hover:underline"
                >
                  {isLogin ? 'Criar uma conta' : 'Fazer login'}
                </button>
              </p>
            </div>
          </form>
        </div>
        
        {/* Footer text */}
        <p className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500 font-mono tracking-wider">
          AUTOMASTOCK V1.0 • NEX UI
        </p>
      </div>
    </div>
  );
}
