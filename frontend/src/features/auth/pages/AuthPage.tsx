'use client';

import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from '@/store/useToastStore';
import {
  loginSchema,
  registerSchema,
  LoginFormInputs,
  RegisterFormInputs,
} from '@/schemas/authSchema';

type AuthMode = 'login' | 'register';
type RegisterStep = 1 | 2 | 3;

interface AuthPageProps {
  initialMode?: AuthMode;
}

const maskCPF = (v: string) =>
  v
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');

const STEP_LABELS: Record<RegisterStep, string> = {
  1: 'Identificação',
  2: 'Documentos',
  3: 'Renda & Senha',
};

export default function AuthPage({ initialMode }: AuthPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const loginToStore = useAuthStore((state) => state.login);

  const resolvedInitialMode: AuthMode = (() => {
    if (searchParams.get('mode') === 'register') return 'register';
    if (searchParams.get('mode') === 'login') return 'login';
    if (initialMode) return initialMode;
    if (location.pathname === '/cadastro') return 'register';
    return 'login';
  })();

  const [mode, setMode] = useState<AuthMode>(resolvedInitialMode);
  const [step, setStep] = useState<RegisterStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(true);

  useEffect(() => {
    if (location.pathname === '/cadastro' || searchParams.get('mode') === 'register') {
      setMode('register');
    } else if (location.pathname === '/login' || searchParams.get('mode') === 'login') {
      setMode('login');
    } else if (initialMode) {
      setMode(initialMode);
    }
    setServerError(null);
  }, [location.pathname, searchParams, initialMode]);

  const switchMode = (next: AuthMode) => {
    if (next === mode) return;
    setServerError(null);
    setMode(next);
    if (next === 'register') {
      setStep(1);
    }
    const targetUrl = next === 'register' ? '/cadastro' : '/login';
    if (window.location.pathname !== targetUrl) {
      window.history.replaceState(window.history.state, '', targetUrl);
    }
  };

  const savedEmail =
    typeof window !== 'undefined' ? localStorage.getItem('apex_remembered_email') || '' : '';

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    setValue: setLoginValue,
    formState: { errors: loginErrors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: savedEmail, password: '' },
  });

  const {
    register: registerSignup,
    control,
    handleSubmit: handleSignupSubmit,
    setValue: setSignupValue,
    trigger,
    reset: resetSignup,
    formState: { errors: signupErrors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema) as any,
    shouldUnregister: false,
    defaultValues: {
      rendimentos: [{ empregadora: '', valor: '' as unknown as number }],
      role: 'CLIENTE',
      nome: '',
      email: '',
      endereco: '',
      cpf: '',
      rg: '',
      profissao: '',
      password: '',
      confirmPassword: '',
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'rendimentos' });

  const handleNextStep = async () => {
    setServerError(null);
    if (step === 1) {
      const ok = await trigger(['nome', 'email', 'endereco']);
      if (ok) setStep(2);
    } else if (step === 2) {
      const ok = await trigger(['cpf', 'rg']);
      if (ok) setStep(3);
    }
  };

  const onLogin = async (data: LoginFormInputs) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const response = await api.post('/login', { username: data.email, password: data.password });
      const { access_token, roles } = response.data;
      const userRole = (roles && roles.length > 0 ? roles[0] : 'ROLE_CLIENTE').replace('ROLE_', '');
      loginToStore(access_token, data.email, userRole);

      if (rememberEmail) {
        localStorage.setItem('apex_remembered_email', data.email);
      } else {
        localStorage.removeItem('apex_remembered_email');
      }

      toast.success(
        userRole === 'ADMIN'
          ? 'Acesso Executivo liberado! Bem-vindo ao Painel Admin.'
          : 'Login realizado com sucesso!'
      );

      const fromState = (location.state as { from?: string } | null)?.from;
      const adminRoutes = ['/admin', '/pedidos', '/frota', '/analises'];
      const empresaRoutes = ['/pedidos', '/frota'];
      const bancoRoutes = ['/analises', '/pedidos'];

      if (userRole === 'ADMIN') {
        const target = fromState && adminRoutes.includes(fromState) ? fromState : '/admin';
        navigate(target, { replace: true });
      } else if (userRole === 'EMPRESA') {
        const target = fromState && empresaRoutes.includes(fromState) ? fromState : '/pedidos';
        navigate(target, { replace: true });
      } else if (userRole === 'BANCO') {
        const target = fromState && bancoRoutes.includes(fromState) ? fromState : '/analises';
        navigate(target, { replace: true });
      } else if (fromState && fromState !== '/login' && fromState !== '/cadastro') {
        navigate(fromState, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch {
      setServerError('E-mail ou senha incorretos.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: RegisterFormInputs) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const { confirmPassword: _confirmPassword, ...cleanData } = data;
      const cleanRendimentos = (cleanData.rendimentos || [])
        .filter(
          (r) =>
            r &&
            r.empregadora &&
            r.empregadora.trim().length > 0 &&
            Number(r.valor) > 0
        )
        .map((r) => ({
          empregadora: r.empregadora!.trim(),
          valor: Number(r.valor),
        }));

      const payload = {
        ...cleanData,
        rendimentos: cleanRendimentos,
        role: 'CLIENTE',
        cpf: cleanData.cpf?.replace(/\D/g, ''),
      };
      await api.post('/api/usuarios/registrar', payload);
      toast.success('Conta criada com sucesso! Faça login para continuar.');
      setLoginValue('email', cleanData.email);
      resetSignup({
        rendimentos: [{ empregadora: '', valor: '' as unknown as number }],
        role: 'CLIENTE',
      });
      setStep(1);
      switchMode('login');
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        'Dados inválidos. Verifique se o CPF ou E-mail já existem.';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const pillInputClass =
    'w-full bg-white/95 text-[#08090C] placeholder:text-slate-400 text-xs sm:text-sm font-medium rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-[#FF1717]/80 shadow-sm transition-all';

  return (
    <div className="relative min-h-[100dvh] w-full bg-[#050608] text-white p-3 sm:p-6 md:p-10 flex items-center justify-center overflow-hidden selection:bg-[#FF1717] selection:text-white">
      {/* 1. MOLDURA EXTERNA ESCURA COM CURVAS SUTIS DE CIRCUITO E BRILHO CARMESIM DISCRETO */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 900"
        fill="none"
        className="fixed inset-0 w-full h-full object-cover pointer-events-none opacity-80"
      >
        <path
          d="M-120 190 C 240 10, 420 460, 790 210 C 1090 10, 1280 280, 1560 120"
          stroke="rgba(255,255,255,0.035)"
          strokeWidth="2"
        />
        <path
          d="M-80 760 C 280 540, 560 880, 930 620 C 1220 420, 1340 720, 1560 660"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth="2"
        />
        <path
          d="M210 -60 C 310 300, 110 560, 320 960"
          stroke="rgba(255,23,23,0.06)"
          strokeWidth="1.5"
        />
        <path
          d="M1190 -40 C 1020 320, 1320 560, 1120 960"
          stroke="rgba(255,23,23,0.05)"
          strokeWidth="1.5"
        />
      </svg>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,23,23,0.09)_0%,transparent_65%)] pointer-events-none" />

      {/* 2. PALCO ARREDONDADO CENTRAL COM O VÍDEO NOTURNO DENTRO */}
      <div className="relative z-10 w-full max-w-6xl min-h-[600px] sm:min-h-[660px] rounded-[28px] sm:rounded-[34px] overflow-hidden border border-white/15 shadow-[0_40px_120px_rgba(0,0,0,0.92)] flex flex-col justify-between bg-[#08090C]">
        {/* Vídeo noturno dentro do palco */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <video
            src="/auth-night-race.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover filter brightness-[0.82] contrast-[1.15] scale-[1.01]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/65" />
        </div>

        {/* Barra superior dentro da moldura (Logo à esquerda + Voltar à direita, estilo referência) */}
        <header className="relative z-20 flex items-center justify-between px-6 sm:px-9 pt-6 sm:pt-7">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="Apex"
              className="w-7 h-7 rounded-lg object-contain group-hover:scale-105 transition-transform"
            />
            <span className="text-lg font-normal tracking-[-0.03em] text-white lowercase leading-none">
              apex
            </span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-white/75 hover:text-white transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Voltar ao Site</span>
          </Link>
        </header>

        {/* 3. CARD FROSTED GLASS CENTRALIZADO SOBRE O VÍDEO */}
        <main className="relative z-20 flex-1 flex items-center justify-center px-4 py-8 sm:py-10">
          <motion.div
            layout="size"
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[430px] rounded-[24px] bg-[#0B0D12]/60 backdrop-blur-2xl border border-white/20 shadow-[0_28px_80px_rgba(0,0,0,0.68)] p-6 sm:p-8"
          >
            {/* Título + Subtítulo centralizados (como na referência) */}
            <div className="text-center mb-5">
              <h1 className="text-2xl sm:text-[26px] font-bold tracking-[0.06em] uppercase text-white">
                {mode === 'login' ? 'LOGIN' : 'CADASTRO'}
              </h1>
              <p className="text-xs text-white/65 mt-1">
                {mode === 'login'
                  ? 'Entre com suas credenciais para acessar o paddock'
                  : `Etapa ${step} de 3 · ${STEP_LABELS[step]}`}
              </p>
            </div>

            {/* Pílula Selecionável Compacta Centralizada (Login <-> Cadastro) */}
            <div className="flex justify-center mb-6">
              <div
                role="tablist"
                aria-label="Modo de autenticação"
                className="inline-flex items-center p-1 rounded-full bg-white/15 backdrop-blur-md border border-white/15 relative"
              >
                {(['login', 'register'] as const).map((tab) => {
                  const isActive = mode === tab;
                  const label = tab === 'login' ? 'Login' : 'Cadastro';
                  return (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => switchMode(tab)}
                      className={`relative px-5 py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-colors cursor-pointer select-none ${
                        isActive ? 'text-[#08090C]' : 'text-white/75 hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="authModeSelectorPill"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          className="absolute inset-0 rounded-full bg-white shadow-sm"
                        />
                      )}
                      <span className="relative z-10">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {serverError && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-950/75 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2">
                <ShieldAlert size={15} className="text-rose-400 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                <motion.form
                  key="login-form"
                  onSubmit={handleLoginSubmit(onLogin)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-[11px] font-medium text-white/80 mb-1.5 pl-1">
                      E-mail
                    </label>
                    <input
                      {...registerLogin('email')}
                      type="email"
                      placeholder="piloto@apex.com"
                      className={pillInputClass}
                    />
                    {loginErrors.email && (
                      <p className="text-rose-300 text-[11px] mt-1 pl-2">{loginErrors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-white/80 mb-1.5 pl-1">
                      Senha
                    </label>
                    <div className="relative">
                      <input
                        {...registerLogin('password')}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Digite sua senha"
                        className={`${pillInputClass} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#08090C] transition-colors cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {loginErrors.password && (
                      <p className="text-rose-300 text-[11px] mt-1 pl-2">
                        {loginErrors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-white/75 px-1">
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberEmail}
                        onChange={(e) => setRememberEmail(e.target.checked)}
                        className="rounded border-white/30 bg-white/10 accent-[#FF1717]"
                      />
                      <span>Lembrar e-mail</span>
                    </label>
                    <Link to="/pistas" className="text-white/65 hover:text-white transition-colors">
                      Explorar circuitos
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full rounded-full py-3.5 bg-white/90 hover:bg-white text-[#08090C] text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-lg overflow-hidden group mt-2"
                  >
                    <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,23,23,0.22)_0%,transparent_55%)] opacity-80 group-hover:opacity-100 transition-opacity" />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Entrar'}
                    </span>
                  </button>

                  <p className="text-center text-xs text-white/65 pt-2">
                    Não possui conta?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('register')}
                      className="text-white font-semibold underline underline-offset-4 hover:text-[#FF1717] transition-colors cursor-pointer"
                    >
                      Cadastre-se
                    </button>
                  </p>
                </motion.form>
              ) : (
                <motion.form
                  key="register-form"
                  onSubmit={handleSignupSubmit(onRegister)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Indicador de Progresso em 3 Etapas */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {([1, 2, 3] as RegisterStep[]).map((num) => {
                      const done = step > num;
                      const current = step === num;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            if (num < step) setStep(num);
                          }}
                          className={`text-left transition-opacity ${
                            num < step ? 'cursor-pointer' : 'cursor-default'
                          }`}
                        >
                          <div
                            className={`h-1 rounded-full transition-colors duration-300 ${
                              current
                                ? 'bg-[#FF1717]'
                                : done
                                  ? 'bg-white/80'
                                  : 'bg-white/20'
                            }`}
                          />
                          <div className="flex items-center gap-1 mt-1.5">
                            {done && <Check size={10} className="text-white/85 shrink-0" />}
                            <span
                              className={`text-[10px] font-mono uppercase tracking-wider truncate ${
                                current ? 'text-white' : done ? 'text-white/75' : 'text-white/40'
                              }`}
                            >
                              {num}. {STEP_LABELS[num]}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Conteúdo da Etapa Atual */}
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step-1"
                        initial={{ opacity: 0, x: 14 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -14 }}
                        transition={{ duration: 0.18 }}
                        className="space-y-3.5"
                      >
                        <div>
                          <label className="block text-[11px] font-medium text-white/80 mb-1 pl-1">
                            Nome Completo
                          </label>
                          <input
                            {...registerSignup('nome')}
                            placeholder="Seu nome completo"
                            className={pillInputClass}
                          />
                          {signupErrors.nome && (
                            <p className="text-rose-300 text-[11px] mt-1 pl-2">
                              {signupErrors.nome.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-white/80 mb-1 pl-1">
                            E-mail
                          </label>
                          <input
                            {...registerSignup('email')}
                            type="email"
                            placeholder="piloto@email.com"
                            className={pillInputClass}
                          />
                          {signupErrors.email && (
                            <p className="text-rose-300 text-[11px] mt-1 pl-2">
                              {signupErrors.email.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-white/80 mb-1 pl-1">
                            Endereço Completo
                          </label>
                          <input
                            {...registerSignup('endereco')}
                            placeholder="Rua, número, cidade e estado"
                            className={pillInputClass}
                          />
                          {signupErrors.endereco && (
                            <p className="text-rose-300 text-[11px] mt-1 pl-2">
                              {signupErrors.endereco.message}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="relative w-full rounded-full py-3.5 bg-white/90 hover:bg-white text-[#08090C] text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-lg overflow-hidden group mt-2"
                        >
                          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,23,23,0.20)_0%,transparent_55%)]" />
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            <span>Próxima Etapa</span>
                            <ArrowRight size={14} />
                          </span>
                        </button>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step-2"
                        initial={{ opacity: 0, x: 14 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -14 }}
                        transition={{ duration: 0.18 }}
                        className="space-y-3.5"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-medium text-white/80 mb-1 pl-1">
                              CPF
                            </label>
                            <input
                              {...registerSignup('cpf')}
                              placeholder="000.000.000-00"
                              maxLength={14}
                              onChange={(e) => setSignupValue('cpf', maskCPF(e.target.value))}
                              className={pillInputClass}
                            />
                            {signupErrors.cpf && (
                              <p className="text-rose-300 text-[11px] mt-1 pl-2">
                                {signupErrors.cpf.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-white/80 mb-1 pl-1">
                              RG
                            </label>
                            <input
                              {...registerSignup('rg')}
                              placeholder="RG"
                              className={pillInputClass}
                            />
                            {signupErrors.rg && (
                              <p className="text-rose-300 text-[11px] mt-1 pl-2">
                                {signupErrors.rg.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-white/80 mb-1 pl-1">
                            Profissão (opcional)
                          </label>
                          <input
                            {...registerSignup('profissao')}
                            placeholder="Ex: Engenheiro, Empresário, Médico..."
                            className={pillInputClass}
                          />
                        </div>

                        <div className="flex items-center gap-2.5 pt-2">
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="px-5 py-3.5 rounded-full border border-white/20 text-white/80 hover:text-white hover:bg-white/10 text-xs font-medium transition-colors cursor-pointer"
                          >
                            Voltar
                          </button>
                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="relative flex-1 rounded-full py-3.5 bg-white/90 hover:bg-white text-[#08090C] text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-lg overflow-hidden"
                          >
                            <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,23,23,0.20)_0%,transparent_55%)]" />
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              <span>Próxima Etapa</span>
                              <ArrowRight size={14} />
                            </span>
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="step-3"
                        initial={{ opacity: 0, x: 14 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -14 }}
                        transition={{ duration: 0.18 }}
                        className="space-y-3.5"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5 px-1">
                            <span className="text-[11px] font-medium text-white/80">
                              Rendimentos Mensais (até 3)
                            </span>
                            {fields.length < 3 && (
                              <button
                                type="button"
                                onClick={() =>
                                  append({ empregadora: '', valor: '' as unknown as number })
                                }
                                className="text-[10px] font-mono uppercase tracking-wider text-white/80 hover:text-[#FF1717] transition-colors cursor-pointer"
                              >
                                + Adicionar renda
                              </button>
                            )}
                          </div>
                          <div className="space-y-2 max-h-28 overflow-y-auto pr-0.5">
                            {fields.map((field, index) => (
                              <div key={field.id} className="flex gap-2 items-center">
                                <input
                                  {...registerSignup(`rendimentos.${index}.empregadora`)}
                                  placeholder="Fonte / Empresa"
                                  className="flex-1 bg-white/95 text-[#08090C] placeholder:text-slate-400 rounded-full px-4 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-[#FF1717]/80"
                                />
                                <input
                                  {...registerSignup(`rendimentos.${index}.valor`, {
                                    valueAsNumber: true,
                                  })}
                                  type="number"
                                  placeholder="R$"
                                  className="w-24 bg-white/95 text-[#08090C] placeholder:text-slate-400 rounded-full px-3.5 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-[#FF1717]/80"
                                />
                                {fields.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="text-white/55 hover:text-rose-400 p-1 shrink-0 transition-colors cursor-pointer"
                                    title="Remover fonte de renda"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            ))}
                            {fields.length === 0 && (
                              <p className="text-[11px] text-white/45 italic py-1 pl-1">
                                Nenhum rendimento informado (opcional).
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-medium text-white/80 mb-1 pl-1">
                              Senha
                            </label>
                            <input
                              {...registerSignup('password')}
                              type="password"
                              placeholder="Mín. 6 caracteres"
                              className={pillInputClass}
                            />
                            {signupErrors.password && (
                              <p className="text-rose-300 text-[11px] mt-1 pl-2">
                                {signupErrors.password.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-white/80 mb-1 pl-1">
                              Confirmar Senha
                            </label>
                            <input
                              {...registerSignup('confirmPassword')}
                              type="password"
                              placeholder="Repita a senha"
                              className={pillInputClass}
                            />
                            {signupErrors.confirmPassword && (
                              <p className="text-rose-300 text-[11px] mt-1 pl-2">
                                {signupErrors.confirmPassword.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 pt-2">
                          <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="px-5 py-3.5 rounded-full border border-white/20 text-white/80 hover:text-white hover:bg-white/10 text-xs font-medium transition-colors cursor-pointer"
                          >
                            Voltar
                          </button>
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="relative flex-1 rounded-full py-3.5 bg-white/90 hover:bg-white text-[#08090C] text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-lg overflow-hidden"
                          >
                            <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,23,23,0.24)_0%,transparent_55%)]" />
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              {isLoading ? (
                                <Loader2 className="animate-spin" size={16} />
                              ) : (
                                'Finalizar Cadastro'
                              )}
                            </span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <p className="text-center text-xs text-white/65 pt-1">
                    Já tem uma conta?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-white font-semibold underline underline-offset-4 hover:text-[#FF1717] transition-colors cursor-pointer"
                    >
                      Entrar
                    </button>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </main>

        {/* Espaçador inferior sutil para centralizar visualmente a carta sobre o vídeo */}
        <div className="h-4 sm:h-6 shrink-0" />
      </div>
    </div>
  );
}
