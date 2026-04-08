'use client';

import { useState } from 'react';

const CarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
    <circle cx="7.5" cy="17.5" r="2.5"/>
    <circle cx="16.5" cy="17.5" r="2.5"/>
    <path d="M2 12h12"/>
    <path d="M3 12c0 3.3 3 4 5 4s2-1 2-4-2-4-2-4c-2 0-4 1-4 4 0 5 2 8 2 12"/>
  </svg>
);

const MenuIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="4" x2="20" y1="12" y2="12"/>
    <line x1="4" x2="20" y1="6" y2="6"/>
    <line x1="4" x2="20" y1="18" y2="18"/>
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 6 18"/><path d="m6 6 18 18"/>
  </svg>
);

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <CarIcon className="h-7 w-7 text-blue-600" />
            <span>RentCars</span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            <a href="/" className="text-gray-600 hover:text-blue-600 transition-colors">Início</a>
            <a href="/cars" className="text-gray-600 hover:text-blue-600 transition-colors">Carros</a>
            <a href="/booking" className="text-gray-600 hover:text-blue-600 transition-colors">Reservas</a>
            <a href="/reviews" className="text-gray-600 hover:text-blue-600 transition-colors">Avaliações</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Entrar
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Cadastrar
            </button>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <XIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-4">
              <a href="/" className="text-gray-600 hover:text-blue-600 transition-colors">Início</a>
              <a href="/cars" className="text-gray-600 hover:text-blue-600 transition-colors">Carros</a>
              <a href="/booking" className="text-gray-600 hover:text-blue-600 transition-colors">Reservas</a>
              <a href="/reviews" className="text-gray-600 hover:text-blue-600 transition-colors">Avaliações</a>
              <hr className="border-gray-100" />
              <div className="flex flex-col gap-2">
                <button className="text-gray-600 hover:text-blue-600 transition-colors font-medium text-left">
                  Entrar
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Cadastrar
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
