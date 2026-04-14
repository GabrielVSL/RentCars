'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';
import { User, LogOut } from 'lucide-react';

// ... (Mantenha os ícones CarIcon, MenuIcon e XIcon iguais ao seu código original) ...
const CarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4 .9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
    <circle cx="7.5" cy="17.5" r="2.5"/>
    <circle cx="16.5" cy="17.5" r="2.5"/>
    <path d="M2 12h12"/>
    <path d="M3 12c0 3.3 3 4 5 4s2-1 2-4-2-4-2-4c-2 0-4 1-4 4 0 5 2 8 2 12"/>
  </svg>
);

const MenuIcon = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
);

const XIcon = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>
);

interface HeaderProps {
  transparent?: boolean;
}

export default function Header({ transparent = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const setAuthView = useUIStore((state) => state.setAuthView);
  const { user, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const userName = user?.email ? user.email.split('@')[0] : '';

  // CORREÇÃO DO LOGOUT: Desloga e joga pra Home
  const handleLogout = () => {
    logout();
    window.location.href = '/'; // Redirecionamento brutal e seguro
  };

  // CORREÇÃO DO LOGIN: Rola pro topo suavemente
  const handleLoginClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setAuthView('login');
  };

  const renderNavLinks = (linkClass: string) => (
    <>
      <a href="/" className={linkClass}>Início</a>
      {(!user || user.role === 'CLIENTE') && (
        <>
          <a href="/cars" className={linkClass}>Carros</a>
          <a href="/reviews" className={linkClass}>Avaliações</a>
        </>
      )}
      {(user?.role === 'EMPRESA' || user?.role === 'BANCO') && (
        <a href="/pedidos" className={linkClass}>Gestão de Pedidos</a>
      )}
      {user?.role === 'EMPRESA' && <a href="/frota" className={linkClass}>Painel da Frota</a>}
      {user?.role === 'CLIENTE' && <a href="/meus-alugueis" className={linkClass}>Meus Aluguéis</a>}
      {user?.role === 'BANCO' && <a href="/analises" className={linkClass}>Análise de Crédito</a>}
    </>
  );

  // Design Clean para a Home
  if (transparent) {
    const bgClass = isScrolled ? 'bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm' : 'bg-transparent';
    
    // CORREÇÃO DA COR: Se não rolou a tela (!isScrolled), as letras ficam BRANCAS!
    const linkClass = isScrolled ? "text-slate-600 hover:text-slate-900 font-bold transition-all" : "text-white hover:text-blue-400 font-bold transition-all drop-shadow-md";

    return (
      <header className={`fixed top-0 left-0 right-0 z-[90] transition-all duration-500 ${bgClass}`}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* O Logo e o Nome também ficam brancos por cima do vídeo */}
            <a href="/" className={`flex items-center gap-2 text-2xl font-black tracking-tight ${isScrolled ? 'text-slate-900' : 'text-white'}`}>
              <CarIcon className={`h-8 w-8 ${isScrolled ? 'text-blue-600' : 'text-white'}`} />
              <span>RentCars</span>
            </a>
            <nav className="hidden md:flex items-center gap-8">{renderNavLinks(linkClass)}</nav>
            <div className="hidden md:flex items-center gap-5">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 py-1.5 px-4 rounded-full bg-white border border-gray-200 shadow-sm">
                    <User size={16} className="text-blue-600" /><span className="text-xs font-black text-slate-800 uppercase">Olá, {userName}</span>
                  </div>
                  <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 font-bold transition-colors">Sair</button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button onClick={handleLoginClick} className={`font-bold transition-colors ${isScrolled ? 'text-slate-600 hover:text-slate-900' : 'text-white hover:text-blue-400 drop-shadow-md'}`}>Entrar</button>
                  <button onClick={() => setAuthView('register')} className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-600 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5">Cadastrar</button>
                </div>
              )}
            </div>
            <button className="md:hidden p-2 text-slate-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <XIcon size={28} /> : <MenuIcon size={28} />}</button>
          </div>
        </div>
      </header>
    );
  }

  // O resto da variante 2 (Padrão) continua igual a de cima, usando `handleLogout` e `handleLoginClick`
  const standardLinkClass = "text-slate-600 hover:text-slate-900 font-bold transition-colors";
  return (
    <header className="fixed top-0 left-0 right-0 z-[90] bg-white border-b border-gray-100 transition-all duration-300">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <a href="/" className="flex items-center gap-2 text-2xl font-black tracking-tight text-slate-900">
            <CarIcon className="h-8 w-8 text-blue-600" />
            <span>RentCars</span>
          </a>
          <nav className="hidden md:flex items-center gap-8">{renderNavLinks(standardLinkClass)}</nav>
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 py-1.5 px-4 rounded-full bg-slate-50 border border-slate-200">
                  <User size={16} className="text-blue-600" /><span className="text-xs font-black text-slate-800 uppercase">Olá, {userName}</span>
                </div>
                <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 font-bold transition-colors">Sair</button>
              </div>
            ) : (
              <>
                <button onClick={handleLoginClick} className="text-slate-600 hover:text-slate-900 font-bold px-4">Entrar</button>
                <button onClick={() => setAuthView('register')} className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-600 transition-all shadow-md hover:-translate-y-0.5">Cadastrar</button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}