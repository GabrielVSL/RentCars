'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CarFront, Loader2, CalendarDays, AlertTriangle, 
  CheckCircle2, XCircle, Clock, Building2, CreditCard, ChevronRight
} from 'lucide-react';
import { api } from '@/services/api';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Pedido {
  id: number;
  automovel: { marca: string; modelo: string; placa: string; imageUrl?: string; precoPorDia?: number };
  dataInicio: string;
  dataFim: string;
  valorTotal?: number;
  status: 'PENDENTE' | 'PENDENTE_EMPRESA' | 'PENDENTE_BANCO' | 'APROVADO' | 'REJEITADO' | 'CANCELADO' | 'REVISAO_CLIENTE';
  dataPedido: string;
}

// Dicionário de Status Premium (Traduzindo o Backend para o Usuário)
const statusConfig = {
  PENDENTE: { text: 'Pendente', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: Clock },
  PENDENTE_EMPRESA: { text: 'Análise da Locadora', color: 'bg-amber-50 text-amber-600 border-amber-200', icon: Building2 },
  PENDENTE_BANCO: { text: 'Análise de Crédito', color: 'bg-blue-50 text-blue-600 border-blue-200', icon: CreditCard },
  REVISAO_CLIENTE: { text: 'Ação Necessária', color: 'bg-purple-100 text-purple-700 border-purple-300 animate-pulse', icon: AlertTriangle },
  APROVADO: { text: 'Reserva Confirmada', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: CheckCircle2 },
  REJEITADO: { text: 'Recusado', color: 'bg-rose-50 text-rose-600 border-rose-200', icon: XCircle },
  CANCELADO: { text: 'Cancelado', color: 'bg-slate-100 text-slate-500 border-slate-200', icon: XCircle },
};

export default function MeusAlugueisPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  const fetchMeusPedidos = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/pedidos/meus');
      // Ordena para os mais recentes (ou que precisam de ação) ficarem no topo
      const sorted = response.data.sort((a: Pedido, b: Pedido) => {
        if (a.status === 'REVISAO_CLIENTE') return -1;
        return new Date(b.dataPedido).getTime() - new Date(a.dataPedido).getTime();
      });
      setPedidos(sorted);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchMeusPedidos(); }, []);

  const handleResponderRevisao = async (id: number, aceito: boolean) => {
    try {
      setIsProcessing(id);
      await api.put(`/api/pedidos/${id}/responder-revisao?aceito=${aceito}`);
      setPedidos(prev => prev.map(p => 
        p.id === id ? { ...p, status: aceito ? 'PENDENTE_BANCO' : 'CANCELADO' } : p
      ));
    } catch (error) {
      alert("Erro ao enviar resposta.");
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] pt-24 pb-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho Premium */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Minhas <span className="text-blue-600">Jornadas.</span></h1>
            <p className="text-slate-500 mt-3 text-lg font-medium">Acompanhe o status e os detalhes das suas reservas ativas.</p>
          </div>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <p className="text-slate-400 font-bold tracking-wide uppercase text-sm">Buscando na garagem...</p>
          </div>
        ) : pedidos.length === 0 ? (
          /* Empty State (Estado Vazio) Premium */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-[40px] p-16 text-center shadow-sm">
            <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center mx-auto mb-6">
              <CarFront size={48} className="text-blue-500" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Sua garagem está vazia</h3>
            <p className="text-slate-500 text-lg font-medium max-w-md mx-auto mb-8">Parece que você ainda não tem nenhuma reserva. Que tal escolher uma máquina para o final de semana?</p>
            <button onClick={() => window.location.href = '/cars'} className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-500/30 flex items-center gap-2 mx-auto">
              Explorar Frota <ChevronRight size={18} />
            </button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            <AnimatePresence>
              {pedidos.map((pedido, index) => {
                const config = statusConfig[pedido.status] || statusConfig.PENDENTE;
                const StatusIcon = config.icon;
                
                // Cálculos de datas usando date-fns
                const dataInicio = parseISO(pedido.dataInicio);
                const dataFim = parseISO(pedido.dataFim);
                const diarias = Math.max(1, Math.ceil(differenceInDays(dataFim, dataInicio)));

                return (
                  <motion.div
                    key={pedido.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] flex flex-col md:flex-row group hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500"
                  >
                    {/* Foto do Carro (Esquerda) */}
                    <div className="md:w-72 bg-[#F8F8FA] relative shrink-0 p-8 flex items-center justify-center">
                      <div className="absolute top-4 left-4">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.color}`}>
                          <StatusIcon size={12} strokeWidth={3} />
                          {config.text}
                        </div>
                      </div>
                      
                      {pedido.automovel.imageUrl ? (
                        <img src={pedido.automovel.imageUrl} alt={pedido.automovel.modelo} className="w-full h-auto object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <CarFront size={64} className="text-slate-300" />
                      )}
                    </div>

                    {/* Detalhes (Direita) */}
                    <div className="p-8 flex-1 flex flex-col justify-between">
                      
                      {/* Título e ID */}
                      <div className="flex justify-between items-start mb-6 border-b border-slate-50 pb-6">
                        <div>
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{pedido.automovel.marca}</p>
                          <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{pedido.automovel.modelo}</h3>
                          <p className="text-sm font-medium text-slate-400 mt-2">Placa: <span className="uppercase text-slate-600">{pedido.automovel.placa}</span></p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cód. Reserva</p>
                          <p className="text-sm font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">#{String(pedido.id).padStart(6, '0')}</p>
                        </div>
                      </div>

                      {/* Informações de Data - Bento Style */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-[#F5F5F7] rounded-2xl p-4 border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><CalendarDays size={12}/> Retirada</p>
                          <p className="font-bold text-slate-900">{format(dataInicio, "dd 'de' MMM", { locale: ptBR })}</p>
                          <p className="text-xs text-slate-500 font-medium">{format(dataInicio, "HH:mm")}</p>
                        </div>
                        <div className="bg-[#F5F5F7] rounded-2xl p-4 border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><CalendarDays size={12}/> Devolução</p>
                          <p className="font-bold text-slate-900">{format(dataFim, "dd 'de' MMM", { locale: ptBR })}</p>
                          <p className="text-xs text-slate-500 font-medium">{format(dataFim, "HH:mm")}</p>
                        </div>
                        <div className="col-span-2 md:col-span-1 bg-blue-50 rounded-2xl p-4 border border-blue-100 flex flex-col justify-center">
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Período</p>
                          <p className="text-xl font-black text-blue-600">{diarias} <span className="text-sm font-bold">diárias</span></p>
                        </div>
                      </div>

                      {/* Área de Ação Crítica (Revisão da Empresa) */}
                      {pedido.status === 'REVISAO_CLIENTE' && (
                        <div className="bg-gradient-to-r from-purple-50 to-white border border-purple-200 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-inner mt-auto">
                          <div className="flex items-start gap-3 text-purple-900">
                            <AlertTriangle className="text-purple-600 mt-0.5 shrink-0" size={20} />
                            <div>
                              <p className="text-sm font-bold mb-1">A locadora sugeriu alteração nas datas.</p>
                              <p className="text-xs font-medium opacity-80">Por favor, verifique as novas datas acima. Você concorda em seguir com a reserva?</p>
                            </div>
                          </div>
                          <div className="flex gap-3 shrink-0 w-full lg:w-auto">
                            <button 
                              onClick={() => handleResponderRevisao(pedido.id, false)}
                              disabled={isProcessing === pedido.id}
                              className="flex-1 lg:flex-none px-6 py-3 bg-white text-rose-600 font-bold rounded-xl border border-rose-200 hover:bg-rose-50 hover:border-rose-300 transition-all text-sm"
                            >
                              Recusar
                            </button>
                            <button 
                              onClick={() => handleResponderRevisao(pedido.id, true)}
                              disabled={isProcessing === pedido.id}
                              className="flex-[2] lg:flex-none px-6 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 hover:bg-purple-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm"
                            >
                              {isProcessing === pedido.id ? <Loader2 size={16} className="animate-spin" /> : 'Aceitar Novas Datas'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}