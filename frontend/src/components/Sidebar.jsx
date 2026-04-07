import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const getNavClass = ({ isActive }) =>
    `sidebar-item ${isActive ? 'active' : ''} mb-2`;

  return (
    <aside className="w-64 border-r border-border h-screen sticky top-0 bg-surface flex flex-col p-6 shrink-0">
      <div className="font-heading font-semibold text-lg text-primary-800 mb-8">
        Aluguel de Carros
      </div>
      <nav className="flex flex-col gap-1">
        <NavLink to="/dashboard" className={getNavClass}>
          Dashboard
        </NavLink>
        <NavLink to="/clientes" className={getNavClass}>
          Clientes
        </NavLink>
        <div className="sidebar-item opacity-50 cursor-not-allowed" title="Desabilitado nesta sprint">
          Pedidos
        </div>
      </nav>
    </aside>
  );
}