import { useState, useEffect } from 'react';
import MetricCard from '../components/MetricCard';
import { clienteService } from '../services/clienteService';

export default function Dashboard() {
  const [totalClientes, setTotalClientes] = useState(0);

  // Busca APENAS o total de clientes da nossa API real (Sprint 02)
  useEffect(() => {
    clienteService.getAll()
      .then(data => setTotalClientes(data.length))
      .catch(err => console.error("Erro ao carregar clientes do dashboard:", err));
  }, []);

  // ==========================================
  // DADOS MOCKADOS (Escopo da Sprint 03)
  // ==========================================
  const mockPedidos = {
    ativos: 12,
    fechados: 7,
    aguardando: 5
  };

  return (
    <div className="section">
      <h1 className="mb-2">Dashboard</h1>
      <p className="mb-8">Visão geral do sistema de aluguel.</p>
      
      <div className="grid-4 mb-8">
        {/* Card de Clientes - DADOS REAIS DO BACKEND */}
        <MetricCard 
          label="Total de clientes" 
          value={totalClientes} 
        />
        
        {/* Cards de Pedidos - DADOS MOCKADOS */}
        <MetricCard 
          label="Pedidos ativos" 
          value={mockPedidos.ativos} 
        />
        <MetricCard 
          label="Contratos fechados" 
          value={mockPedidos.fechados} 
        />
        <MetricCard 
          label="Aguardando análise" 
          value={mockPedidos.aguardando} 
        />
      </div>

      {/* Seção extra mockada apenas para dar "volume" visual à apresentação */}
      <div className="card">
        <h3 className="mb-4">Últimos pedidos (Prévia)</h3>
        <p className="text-muted text-sm">
          A listagem completa e a gestão de pedidos serão implementadas na próxima sprint.
        </p>
      </div>
    </div>
  );
}