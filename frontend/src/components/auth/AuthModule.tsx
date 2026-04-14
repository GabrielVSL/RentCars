'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/services/api';
import { X, Loader2, Trash2 } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, registerSchema, LoginFormInputs, RegisterFormInputs } from '@/schemas/authSchema';

const maskCPF = (v: string) => v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
const maskCNPJ = (v: string) => v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');

export default function AuthModule() {
  const { authView, setAuthView, closeAuth } = useUIStore();
  const loginToStore = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const springConfig = { type: 'spring', stiffness: 300, damping: 30, mass: 0.8 };

  const { register: registerLogin, handleSubmit: handleLoginSubmit } = useForm<LoginFormInputs>({ resolver: zodResolver(loginSchema) });
  
  const { register: registerSignup, control, handleSubmit: handleSignupSubmit, setValue, watch } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: { 
      // MÁGICA AQUI: Inicia com um item em branco para o campo já aparecer aberto!
      rendimentos: [{ empregadora: '', valor: '' as unknown as number }], 
      role: 'CLIENTE' 
    } 
  });
  
  const { fields, append, remove } = useFieldArray({ control, name: "rendimentos" });
  const selectedRole = watch('role');

  useEffect(() => {
    if (authView) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [authView]);

  const onLogin = async (data: LoginFormInputs) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const response = await api.post('/login', { username: data.email, password: data.password });
      const { access_token, roles } = response.data;
      const userRole = (roles && roles.length > 0 ? roles[0] : 'ROLE_CLIENTE').replace('ROLE_', '');
      loginToStore(access_token, data.email, userRole); 
      closeAuth();
    } catch (error) { setServerError('E-mail ou senha incorretos.'); } finally { setIsLoading(false); }
  };

  const onRegister = async (data: RegisterFormInputs) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const { confirmPassword, ...cleanData } = data;
      const payload = { 
        ...cleanData,
        cpf: cleanData.cpf?.replace(/\D/g, ''),
        cnpj: cleanData.cnpj?.replace(/\D/g, '')
      };
      await api.post('/api/usuarios/registrar', payload);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setAuthView('login');
    } catch (error: any) {
      setServerError('Dados inválidos. Verifique se o CPF/CNPJ ou E-mail já existem.');
    } finally {
      setIsLoading(false);
    }
  };

  const variants = {
    hidden: { x: '100%', opacity: 0, transition: springConfig },
    login: { x: 0, y: 150, opacity: 1, width: '400px', height: 'max-content', marginRight: '6rem', borderRadius: '32px', transition: springConfig },
    register: { x: 0, y: 0, opacity: 1, width: '480px', height: '100%', marginRight: '0rem', borderRadius: '0px', transition: springConfig }
  };

  return (
    <AnimatePresence>
      {authView && (
        <div className="fixed inset-0 z-[100] flex justify-end pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={closeAuth} 
            className={`absolute inset-0 pointer-events-auto transition-colors duration-500 ${authView === 'register' ? 'bg-slate-900/40 backdrop-blur-md' : 'bg-transparent'}`} 
          />

          <motion.div 
            variants={variants} 
            initial="hidden" 
            animate={authView} 
            exit="hidden" 
            layout="size" 
            className="relative flex flex-col bg-white border border-slate-100 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] pointer-events-auto overflow-hidden"
          >
            <motion.div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-8 pb-4">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{authView === 'login' ? 'Bem-vindo.' : 'Criar Conta.'}</h2>
                  <p className="text-slate-500 text-sm mt-1 font-medium">{authView === 'login' ? 'Acesse sua conta para continuar' : 'Sua jornada começa aqui'}</p>
                </div>
                <button onClick={closeAuth} className="text-slate-400 hover:text-slate-700 bg-slate-50 rounded-full p-2 transition-colors"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto px-8 pb-8 pt-4 custom-scrollbar">
                {serverError && (
                  <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-2xl font-bold flex items-center gap-2">
                    <X size={18} /> {serverError}
                  </div>
                )}

                <AnimatePresence mode="popLayout">
                  {authView === 'login' ? (
                    <motion.form key="login-form" onSubmit={handleLoginSubmit(onLogin)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                      <div>
                        <input {...registerLogin('email')} type="email" placeholder="Seu melhor e-mail" className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium rounded-2xl px-5 py-4 outline-none focus:border-blue-500 focus:bg-white transition-all" />
                      </div>
                      <div>
                        <input {...registerLogin('password')} type="password" placeholder="Sua senha secreta" className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium rounded-2xl px-5 py-4 outline-none focus:border-blue-500 focus:bg-white transition-all" />
                      </div>
                      <button type="submit" disabled={isLoading} className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-2xl py-4 flex justify-center items-center shadow-lg mt-2 transition-transform hover:-translate-y-0.5">
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Acessar Plataforma'}
                      </button>
                      <p className="text-center text-sm font-medium text-slate-500 pt-4">Novo por aqui? <button type="button" onClick={() => setAuthView('register')} className="text-blue-600 font-bold hover:underline">Abra sua conta</button></p>
                    </motion.form>
                  ) : (
                    <motion.form key="register-form" onSubmit={handleSignupSubmit(onRegister)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                      <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                        {(['CLIENTE', 'EMPRESA', 'BANCO'] as const).map((role) => (
                          <button key={role} type="button" onClick={() => setValue('role', role)} className={`flex-1 py-3 rounded-xl text-xs font-black tracking-wide transition-all ${selectedRole === role ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>
                            {role}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-4">
                        <input {...registerSignup('nome')} placeholder={selectedRole === 'CLIENTE' ? "Nome Completo" : "Razão Social"} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-medium outline-none focus:border-blue-500 focus:bg-white" />
                        <input {...registerSignup('email')} type="email" placeholder="E-mail" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-medium outline-none focus:border-blue-500 focus:bg-white" />
                        
                        <div className="grid grid-cols-2 gap-4">
                          {selectedRole === 'CLIENTE' ? (
                            <>
                              <input {...registerSignup('cpf')} placeholder="CPF" maxLength={14} onChange={(e) => setValue('cpf', maskCPF(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-medium outline-none focus:border-blue-500 focus:bg-white" />
                              <input {...registerSignup('rg')} placeholder="RG" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-medium outline-none focus:border-blue-500 focus:bg-white" />
                            </>
                          ) : (
                            <input {...registerSignup('cnpj')} placeholder="CNPJ" maxLength={18} onChange={(e) => setValue('cnpj', maskCNPJ(e.target.value))} className="col-span-2 w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-medium outline-none focus:border-blue-500 focus:bg-white" />
                          )}
                        </div>

                        <input {...registerSignup('endereco')} placeholder="Endereço completo" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-medium outline-none focus:border-blue-500 focus:bg-white" />

                        {selectedRole === 'CLIENTE' && (
                          <div className="space-y-4 pt-4 border-t border-slate-100">
                            <input {...registerSignup('profissao')} placeholder="Sua Profissão" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-medium outline-none focus:border-blue-500 focus:bg-white" />
                            
                            <div>
                              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Rendimentos Mensais</p>
                              <div className="space-y-3">
                                {fields.map((field, index) => (
                                  <div key={field.id} className="flex gap-2">
                                    <input {...registerSignup(`rendimentos.${index}.empregadora`)} placeholder="Nome da Empresa" className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 focus:bg-white" />
                                    <input {...registerSignup(`rendimentos.${index}.valor`, { valueAsNumber: true })} type="number" placeholder="Valor (R$)" className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 focus:bg-white" />
                                    {fields.length > 1 && (
                                      <button type="button" onClick={() => remove(index)} className="text-slate-400 hover:text-red-500 p-2 shrink-0 transition-colors"><Trash2 size={18} /></button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {fields.length < 3 && (
                              <button type="button" onClick={() => append({ empregadora: '', valor: '' as unknown as number })} className="w-full py-3 border-dashed border-2 border-slate-200 rounded-2xl text-slate-500 text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all">+ Adicionar Outra Fonte de Renda</button>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                          <input {...registerSignup('password')} type="password" placeholder="Senha" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-medium outline-none focus:border-blue-500 focus:bg-white" />
                          <input {...registerSignup('confirmPassword')} type="password" placeholder="Repita" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-medium outline-none focus:border-blue-500 focus:bg-white" />
                        </div>
                      </div>

                      <button type="submit" disabled={isLoading} className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-2xl py-4 flex justify-center items-center shadow-lg mt-4 transition-transform hover:-translate-y-0.5">
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Finalizar Cadastro'}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}