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
    <div className="min-h-screen bg-[#0b1326] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-['Inter']">
      
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#6ee591]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#243457]/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 mb-8">
        <div className="flex justify-center items-center mb-6 relative">
          <div className="absolute inset-0 bg-[#6ee591]/20 blur-xl rounded-full w-20 h-20 mx-auto" />
          <div className="w-20 h-20 bg-gradient-to-br from-[#171f33] to-[#0d1627] rounded-3xl border border-[#3e4a3f]/40 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative z-10 p-4">
            <CircuitBoard className="w-10 h-10 text-[#6ee591]" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-4xl font-['Manrope'] font-bold text-[#dbe2fd] tracking-tight">
          AutomaStock
        </h2>
        <p className="mt-3 text-center text-[#bdcabc] text-lg max-w-sm mx-auto">
          Gerencie seu inventário técnico com precisão e controle.
        </p>
      </div>

      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#131b2e]/80 backdrop-blur-xl py-10 px-6 shadow-[0_24px_64px_rgba(0,0,0,0.5)] sm:rounded-3xl border border-[#3e4a3f]/30 sm:px-12">
          
          <div className="mb-8">
            <h3 className="text-xl font-bold text-[#dbe2fd]">
              {isLogin ? 'Bem-vindo de volta' : 'Criar nova conta'}
            </h3>
            <p className="text-sm text-[#bdcabc] mt-1">
              {isLogin ? 'Insira suas credenciais para acessar' : 'Preencha os dados e junte-se a nós'}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-[#ffb4ab]/10 border border-[#ffb4ab]/20 text-[#ffb4ab] px-4 py-3 rounded-xl text-sm font-medium flex items-center shadow-inner">
                {error}
              </div>
            )}
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#bdcabc] mb-2">
                  Endereço de Email
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-4 py-3 border border-[#3e4a3f]/30 rounded-xl bg-[#0b1326] text-[#dbe2fd] placeholder-[#bdcabc]/30 focus:outline-none focus:ring-2 focus:ring-[#6ee591]/50 focus:border-transparent transition-all sm:text-sm hover:border-[#3e4a3f]/60"
                    placeholder="voce@exemplo.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#bdcabc] mb-2">
                  Senha Estratégica
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 py-3 border border-[#3e4a3f]/30 rounded-xl bg-[#0b1326] text-[#dbe2fd] placeholder-[#bdcabc]/30 focus:outline-none focus:ring-2 focus:ring-[#6ee591]/50 focus:border-transparent transition-all sm:text-sm hover:border-[#3e4a3f]/60"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-[0_8px_24px_rgba(80,200,120,0.2)] text-sm font-bold text-[#00210c] bg-gradient-to-r from-[#6ee591] to-[#50c878] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b1326] focus:ring-[#6ee591] disabled:opacity-70 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
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
            
            <div className="mt-8 text-center pt-6 border-t border-[#3e4a3f]/20">
              <p className="text-sm text-[#bdcabc]">
                {isLogin ? 'Primeira vez aqui?' : 'Já é de casa?'}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 py-2 font-bold text-[#6ee591] hover:text-[#50c878] transition-colors focus:outline-none hover:underline"
                >
                  {isLogin ? 'Criar uma conta' : 'Fazer login'}
                </button>
              </p>
            </div>
          </form>
        </div>
        
        {/* Footer text */}
        <p className="mt-8 text-center text-xs text-[#bdcabc]/50 font-mono tracking-wider">
          AUTOMASTOCK V1.0 • OBSIDIAN FLUX UI
        </p>
      </div>
    </div>
  );
}
