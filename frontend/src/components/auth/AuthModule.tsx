'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/services/api';
import { X, Mail, Lock, User, CreditCard, FileText, MapPin, Briefcase, Plus, Trash2, Building2, Landmark, UserCircle, Loader2 } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, registerSchema, LoginFormInputs, RegisterFormInputs } from '@/schemas/authSchema';

// Funções utilitárias de máscara
const maskCPF = (v: string) => v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
const maskCNPJ = (v: string) => v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');

export default function AuthModule() {
  const { authView, setAuthView, closeAuth } = useUIStore();
  const loginToStore = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const springConfig = { type: 'spring', stiffness: 400, damping: 40, mass: 0.8 };

  // Login Form
  const { register: registerLogin, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors } } = useForm<LoginFormInputs>({ 
    resolver: zodResolver(loginSchema) 
  });

  // Signup Form
  const { register: registerSignup, control, handleSubmit: handleSignupSubmit, setValue, watch, formState: { errors: signupErrors } } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: { rendimentos: [], role: 'CLIENTE' } 
  });

  const { fields, append, remove } = useFieldArray({ control, name: "rendimentos" });
  const selectedRole = watch('role');

  // ----------------------------------------------------------------------
  // INTEGRAÇÃO REAL COM O BACKEND
  // ----------------------------------------------------------------------
  
  const onLogin = async (data: LoginFormInputs) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const response = await api.post('/login', {
        username: data.email,
        password: data.password
      });
      
      // O Micronaut devolve access_token e roles (ex: ["ROLE_EMPRESA"])
      const { access_token, roles } = response.data;
      
      // Extrai o "EMPRESA" de "ROLE_EMPRESA"
      const rawRole = roles && roles.length > 0 ? roles[0] : 'ROLE_CLIENTE';
      const userRole = rawRole.replace('ROLE_', '');
      
      // Agora salva a role correta no Zustand!
      loginToStore(access_token, data.email, userRole); 
      closeAuth();
    } catch (error) {
      setServerError('E-mail ou senha incorretos.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: RegisterFormInputs) => {
    setIsLoading(true);
    setServerError(null);
    try {
      // DESESTRUTURAÇÃO SÊNIOR: Removemos o confirmPassword antes de enviar
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...cleanData } = data;

      const payload = { 
        ...cleanData,
        // Garante que CPF e CNPJ sejam apenas números para o Java (Long ou String pura)
        cpf: cleanData.cpf?.replace(/\D/g, ''),
        cnpj: cleanData.cnpj?.replace(/\D/g, '')
      };

      // Agora batendo na rota que você tem no ClienteController
      await api.post('/api/usuarios/registrar', payload);
      
      setAuthView('login');
    } catch (error: any) {
      console.error("Erro no cadastro:", error.response?.data || error.message);
      setServerError('Dados inválidos. Verifique se o CPF/CNPJ ou E-mail já existem.');
    } finally {
      setIsLoading(false);
    }
  };

  const variants = {
    hidden: { x: '100%', opacity: 0, transition: springConfig },
    login: { x: 0, opacity: 1, width: '420px', height: 'max-content', marginRight: '6rem', borderRadius: '32px', transition: springConfig },
    register: { x: 0, opacity: 1, width: '500px', height: '100%', marginRight: '0rem', borderRadius: '0px', transition: springConfig }
  };

  return (
    <AnimatePresence>
      {authView && (
        <div className="fixed inset-0 z-50 flex justify-end items-center pointer-events-none">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeAuth} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto" />

          <motion.div variants={variants} initial="hidden" animate={authView} exit="hidden" layout="size" className="relative flex flex-col bg-white/95 backdrop-blur-2xl border border-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] pointer-events-auto overflow-hidden">
            
            <motion.div layout="position" className="flex items-center justify-between p-8 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{authView === 'login' ? 'Bem-vindo de volta' : 'Criar Conta'}</h2>
                <p className="text-slate-500 text-sm mt-1">{authView === 'login' ? 'Acesse sua conta' : 'Cadastre-se para alugar'}</p>
              </div>
              <button onClick={closeAuth} className="text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full p-2 transition-colors"><X size={20} /></button>
            </motion.div>

            <div className="flex-1 overflow-y-auto px-8 pb-8 pt-4 custom-scrollbar">
              {/* Exibição de Erros do Servidor */}
              {serverError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-2 animate-shake">
                  <X size={16} /> {serverError}
                </div>
              )}

              <AnimatePresence mode="popLayout">
                {authView === 'login' ? (
                  <motion.form key="login-form" onSubmit={handleLoginSubmit(onLogin)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input {...registerLogin('email')} type="email" placeholder="E-mail" className="w-full bg-slate-50 border border-gray-200 text-slate-900 rounded-2xl pl-11 pr-4 py-3.5 outline-none focus:border-blue-500" />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input {...registerLogin('password')} type="password" placeholder="Senha" className="w-full bg-slate-50 border border-gray-200 text-slate-900 rounded-2xl pl-11 pr-4 py-3.5 outline-none focus:border-blue-500" />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl py-4 flex justify-center items-center shadow-lg shadow-blue-500/20 transition-all">
                      {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Entrar'}
                    </button>
                    <p className="text-center text-sm text-slate-500 pt-4">Não tem conta? <button type="button" onClick={() => setAuthView('register')} className="text-blue-600 font-medium">Cadastre-se</button></p>
                  </motion.form>
                ) : (
                  <motion.form key="register-form" onSubmit={handleSignupSubmit(onRegister)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                    
                    {/* Seletor de Perfil do PDF [cite: 6, 11] */}
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                      {(['CLIENTE', 'EMPRESA', 'BANCO'] as const).map((role) => (
                        <button key={role} type="button" onClick={() => setValue('role', role)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedRole === role ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                          {role.charAt(0) + role.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input {...registerSignup('nome')} placeholder={selectedRole === 'CLIENTE' ? "Nome Completo" : "Razão Social"} className="w-full bg-slate-50 border border-gray-200 rounded-2xl pl-11 py-3.5 outline-none focus:border-blue-500" />
                    </div>

                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input {...registerSignup('email')} type="email" placeholder="E-mail" className="w-full bg-slate-50 border border-gray-200 rounded-2xl pl-11 py-3.5 outline-none focus:border-blue-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {selectedRole === 'CLIENTE' ? (
                        <>
                          <input {...registerSignup('cpf')} placeholder="CPF" maxLength={14} onChange={(e) => setValue('cpf', maskCPF(e.target.value))} className="w-full bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500" />
                          <input {...registerSignup('rg')} placeholder="RG" className="w-full bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500" />
                        </>
                      ) : (
                        <input {...registerSignup('cnpj')} placeholder="CNPJ" maxLength={18} onChange={(e) => setValue('cnpj', maskCNPJ(e.target.value))} className="col-span-2 w-full bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500" />
                      )}
                    </div>

                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input {...registerSignup('endereco')} placeholder="Endereço completo" className="w-full bg-slate-50 border border-gray-200 rounded-2xl pl-11 py-3.5 outline-none focus:border-blue-500" />
                    </div>

                    {/* Dados Específicos do Contratante [cite: 13] */}
                    {selectedRole === 'CLIENTE' && (
                      <div className="space-y-4 pt-2 border-t border-gray-100">
                        <input {...registerSignup('profissao')} placeholder="Profissão" className="w-full bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500" />
                        <div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-700">Rendimentos (Máx 3) [cite: 13]</p></div>
                        {fields.map((field, index) => (
                          <div key={field.id} className="flex gap-2">
                            <input {...registerSignup(`rendimentos.${index}.empregadora`)} placeholder="Empresa" className="flex-1 bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm" />
                            <input {...registerSignup(`rendimentos.${index}.valor`, { valueAsNumber: true })} type="number" placeholder="Valor" className="w-24 bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm" />
                            <button type="button" onClick={() => remove(index)} className="text-red-500 p-2"><Trash2 size={18} /></button>
                          </div>
                        ))}
                        {fields.length < 3 && (
                          <button type="button" onClick={() => append({ empregadora: '', valor: 0.01 })} className="w-full py-3 border-dashed border-2 border-gray-200 rounded-2xl text-blue-600 text-sm font-medium hover:bg-blue-50 transition-colors">+ Adicionar Rendimento</button>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <input {...registerSignup('password')} type="password" placeholder="Senha" className="w-full bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500" />
                      <input {...registerSignup('confirmPassword')} type="password" placeholder="Confirmar" className="w-full bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500" />
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl py-4 shadow-lg shadow-blue-500/20 flex justify-center items-center">
                      {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Criar Conta'}
                    </button>
                    <p className="text-center text-sm text-slate-500 pb-4">Já tem conta? <button type="button" onClick={() => setAuthView('login')} className="text-blue-600 font-medium">Login</button></p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}