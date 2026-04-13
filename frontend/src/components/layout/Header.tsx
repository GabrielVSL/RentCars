'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';
import { User, LogOut } from 'lucide-react';

interface HeaderProps {
  transparent?: boolean;
}

const CarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
    <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/><path d="M2 12h12"/>
  </svg>
);

const MenuIcon = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
);

const XIcon = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>
);

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

  // --- LÓGICA DE LINKS SINCRONIZADA ---
  const renderNavLinks = (linkClass: string) => (
    <>
      <a href="/" className={linkClass}>Início</a>
      {/* Esconde vitrine se for Agente (Empresa/Banco) */}
      {(!user || user.role === 'CLIENTE') && (
        <>
          <a href="/cars" className={linkClass}>Carros</a>
          <a href="/reviews" className={linkClass}>Avaliações</a>
        </>
      )}
      {/* Mostra Gestão de Pedidos para Agentes */}
      {(user?.role === 'EMPRESA' || user?.role === 'BANCO') && (
        <a href="/pedidos" className={linkClass}>Gestão de Pedidos</a>
      )}
      {/* Links de Role (Painel da Frota, Meus Aluguéis, etc) */}
      {user?.role === 'EMPRESA' && <a href="/frota" className={linkClass}>Painel da Frota</a>}
      {user?.role === 'CLIENTE' && <a href="/meus-alugueis" className={linkClass}>Meus Aluguéis</a>}
      {user?.role === 'BANCO' && <a href="/analises" className={linkClass}>Análise de Crédito</a>}
      {user?.role === 'AGENTE' && <a href="/admin" className={linkClass}>Administração</a>}
    </>
  );

  // --- VARIANTE 1: TRANSPARENTE (Home) ---
  if (transparent) {
    const bgClass = isScrolled ? 'bg-black/70 backdrop-blur-lg border-b border-white/10' : 'bg-gradient-to-b from-black/60 to-transparent';
    const linkClass = "text-white/90 hover:text-white font-semibold transition-all drop-shadow-md";

    return (
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${bgClass}`}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <a href="/" className="flex items-center gap-2 text-2xl font-black text-white drop-shadow-lg">
              <CarIcon className="h-8 w-8 text-white" />
              <span>RentCars</span>
            </a>
            <nav className="hidden md:flex items-center gap-8">{renderNavLinks(linkClass)}</nav>
            <div className="hidden md:flex items-center gap-5">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-white/10 border border-white/20">
                    <User size={16} className="text-white" /><span className="text-xs font-bold text-white uppercase">Olá, {userName}</span>
                  </div>
                  <button onClick={logout} className="text-white/70 hover:text-red-400"><LogOut size={20} /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => setAuthView('login')} className="text-white font-bold px-4">Entrar</button>
                  <button onClick={() => setAuthView('register')} className="bg-white text-slate-900 px-6 py-2.5 rounded-full font-bold hover:bg-blue-500 hover:text-white transition-all">Começar</button>
                </div>
              )}
            </div>
            <button className="md:hidden p-2 text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <XIcon size={28} /> : <MenuIcon size={28} />}</button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden py-6 bg-black/90 backdrop-blur-xl border-t border-white/10 rounded-b-2xl shadow-2xl">
              <nav className="flex flex-col gap-5 px-6">{renderNavLinks("text-white/90 text-lg font-medium")}</nav>
            </div>
          )}
        </div>
      </header>
    );
  }

  // --- VARIANTE 2: PADRÃO (Outras Telas) ---
  const standardLinkClass = "text-gray-600 hover:text-blue-600 font-semibold transition-colors";

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <CarIcon className="h-7 w-7 text-blue-600" />
            <span>RentCars</span>
          </a>
          <nav className="hidden md:flex items-center gap-8">{renderNavLinks(standardLinkClass)}</nav>
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-gray-50 border border-gray-200">
                  <User size={16} className="text-gray-500" /><span className="text-xs font-bold text-gray-700 uppercase">Olá, {userName}</span>
                </div>
                <button onClick={logout} className="text-gray-400 hover:text-red-500"><LogOut size={20} /></button>
              </div>
            ) : (
              <>
                <button onClick={() => setAuthView('login')} className="text-gray-600 font-bold px-4">Entrar</button>
                <button onClick={() => setAuthView('register')} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition-all shadow-md">Cadastrar</button>
              </>
            )}
          </div>
          <button className="md:hidden p-2 text-gray-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <XIcon size={28} /> : <MenuIcon size={28} />}</button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden py-6 bg-white border-t border-gray-100 shadow-xl">
            <nav className="flex flex-col gap-5 px-6">{renderNavLinks("text-gray-600 text-lg font-medium")}</nav>
          </div>
        )}
      </div>
    </header>
  );
}