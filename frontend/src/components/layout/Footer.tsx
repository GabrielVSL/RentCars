import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#08090C] border-t border-white/[0.08] py-12 px-6 text-white/60 font-sans">
      <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="Apex"
            className="w-7 h-7 rounded-lg object-contain opacity-90 group-hover:opacity-100 transition-opacity"
          />
          <span className="text-lg font-normal tracking-[-0.03em] text-white lowercase">
            apex
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-xs font-medium text-white/50">
          <Link to="/" className="hover:text-white transition-colors">Início</Link>
          <Link to="/pistas" className="hover:text-white transition-colors">Pistas</Link>
          <Link to="/cars" className="hover:text-white transition-colors">Frota</Link>
        </nav>

        <p className="text-xs text-white/40">
          &copy; {new Date().getFullYear()} apex. Track Day & Performance.
        </p>
      </div>
    </footer>
  );
}
