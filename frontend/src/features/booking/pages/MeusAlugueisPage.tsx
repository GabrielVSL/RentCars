'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CarFront, Loader2, AlertTriangle, 
  CheckCircle2, XCircle, Clock, Building2, CreditCard,
  Activity
} from 'lucide-react';
import { api } from '@/services/api';
import { toast } from '@/store/useToastStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
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

// Dicionário de Status FIA / Track Day
const statusConfig = {
  PENDENTE: { text: 'Aguardando Validação', color: 'bg-white/10 text-white border-white/20', icon: Clock },
  PENDENTE_EMPRESA: { text: 'Inspeção do Box / Paddock', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: Building2 },
  PENDENTE_BANCO: { text: 'Underwriting de Franquia (Banco)', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: CreditCard },
  REVISAO_CLIENTE: { text: 'Revisão de Bateria Necessária', color: 'bg-[#FF1717]/10 text-[#FF1717] border-[#FF1717]/40 animate-pulse', icon: AlertTriangle },
  APROVADO: { text: 'Green Flag // Pass Confirmado', color: 'bg-[#FF1717]/15 text-[#FF1717] border-[#FF1717]/40', icon: CheckCircle2 },
  REJEITADO: { text: 'Garantia Não Aprovada', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30', icon: XCircle },
  CANCELADO: { text: 'Sessão Cancelada', color: 'bg-white/5 text-white/40 border-white/10', icon: XCircle },
};

export default function MeusAlugueisPage() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const { formatPrice } = useCurrencyStore();

  const fetchMeusPedidos = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/pedidos/meus');
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
      toast.success(aceito ? "Novas datas de pista aceitas com sucesso!" : "Contraproposta de pista recusada.");
    } catch (error) {
      toast.error("Erro ao enviar resposta.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleCancelarPedido = async (id: number) => {
    try {
      setIsProcessing(id);
      await api.put(`/api/pedidos/${id}/cancelar`);
      setPedidos(prev => prev.map(p => 
        p.id === id ? { ...p, status: 'CANCELADO' } : p
      ));
      toast.success("Sessão de pista cancelada com sucesso.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao cancelar pedido.");
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090C] text-white pt-28 pb-32 selection:bg-[#FF1717] selection:text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho Pitlane */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#FF1717] animate-ping" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#FF1717]">
                Driver Credentials Hub
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black font-sans tracking-tight text-white uppercase">
              Minhas <span className="text-[#FF1717]">Sessões.</span>
            </h1>
            <p className="text-white/60 mt-2 text-base font-light font-sans">
              Acompanhe suas credenciais oficiais de circuito, status da apólice bancária e telemetria dos boxes.
            </p>
          </div>

          <button 
            type="button"
            onClick={() => navigate('/cars')}
            className="self-start md:self-auto px-6 py-3 rounded-full font-mono text-xs font-bold uppercase tracking-widest bg-white/5 border border-white/15 text-white hover:bg-[#FF1717] hover:text-white hover:border-[#FF1717] transition-all cursor-pointer shadow-lg"
          >
            + Nova Sessão de Pista
          </button>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="animate-spin text-[#FF1717]" size={42} />
            <span className="font-mono text-xs text-white/50 uppercase tracking-widest">Carregando Credenciais...</span>
          </div>
        ) : pedidos.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 bg-[#0F1117] border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#FF1717] border border-white/10">
              <Activity size={36} />
            </div>
            <h3 className="text-2xl font-black font-sans text-white uppercase tracking-tight mb-2">Nenhuma Sessão Ativa</h3>
            <p className="text-white/50 text-sm max-w-md mx-auto mb-8 font-mono">Você ainda não solicitou nenhuma credencial de pista ou bateria cronometrada.</p>
            <button 
              type="button"
              onClick={() => navigate('/cars')}
              className="px-8 py-4 bg-[#FF1717] text-white font-mono text-xs font-black uppercase tracking-widest rounded-full hover:bg-white hover:text-black transition-all shadow-[0_0_25px_rgba(255,23,23,0.4)] cursor-pointer"
            >
              Explorar Frota de Pista ↗
            </button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            <AnimatePresence>
              {pedidos.map((pedido, index) => {
                const config = statusConfig[pedido.status] || statusConfig.PENDENTE;
                const StatusIcon = config.icon;
                
                const dataInicio = parseISO(pedido.dataInicio);
                const dataFim = parseISO(pedido.dataFim);
                const diarias = Math.max(1, Math.ceil(differenceInDays(dataFim, dataInicio)));
                const podeCancelar = ['PENDENTE', 'PENDENTE_EMPRESA', 'PENDENTE_BANCO'].includes(pedido.status);

                return (
                  <motion.div
                    key={pedido.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-[#0F1117] border border-white/10 rounded-3xl overflow-hidden shadow-2xl hover:border-[#FF1717]/40 transition-all duration-300"
                  >
                    {/* Top Bar da Credencial Oficial */}
                    <div className="bg-black/60 border-b border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-4 font-mono">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">FIA TRACK PASS</span>
                        <span className="text-xs font-black text-[#FF1717] bg-white/5 px-3 py-1 rounded-lg border border-white/15">
                          #APX-{String(pedido.id).padStart(6, '0')}
                        </span>
                        {pedido.dataPedido && (
                          <span className="text-[11px] text-white/40 hidden sm:inline">
                            • Solicitado em {format(parseISO(pedido.dataPedido), "dd 'de' MMM", { locale: ptBR })}
                          </span>
                        )}
                      </div>

                      {/* Status Destacado */}
                      <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${config.color}`}>
                        <StatusIcon size={14} strokeWidth={2.5} />
                        {config.text}
                      </div>
                    </div>

                    {/* Conteúdo Principal do Card */}
                    <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                      
                      {/* Coluna da Imagem e Veículo */}
                      <div className="lg:col-span-5 flex flex-col items-center">
                        <div className="w-full aspect-[16/10] bg-gradient-to-b from-[#181B24] to-[#0A0B0E] rounded-2xl border border-white/10 p-4 flex items-center justify-center relative overflow-hidden group">
                          {pedido.automovel.imageUrl ? (
                            <img 
                              src={pedido.automovel.imageUrl} 
                              alt={pedido.automovel.modelo} 
                              className="max-h-full max-w-full object-contain filter drop-shadow-[0_15px_20px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-500" 
                            />
                          ) : (
                            <CarFront size={56} className="text-white/20" />
                          )}
                          <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[9px] font-mono font-bold text-[#FF1717] uppercase tracking-wider">
                            {pedido.automovel.marca}
                          </div>
                        </div>

                        <div className="w-full mt-4 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                          <div>
                            <h3 className="text-2xl font-black font-sans text-white tracking-tight leading-tight">{pedido.automovel.modelo}</h3>
                            <p className="text-xs font-mono text-white/40 mt-0.5">Matrícula: <span className="uppercase text-white/80">{pedido.automovel.placa}</span></p>
                          </div>
                          <span className="inline-flex self-start sm:self-auto text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-[#FF1717]/10 text-[#FF1717] border border-[#FF1717]/30">
                            Track Spec
                          </span>
                        </div>

                        {/* Badges de Pista */}
                        <div className="w-full grid grid-cols-3 gap-2 mt-3 pt-1 text-[10px] font-mono font-bold text-white/60 text-center">
                          <div className="bg-white/5 py-1.5 rounded-lg border border-white/5">Cup 2R Setup</div>
                          <div className="bg-white/5 py-1.5 rounded-lg border border-white/5">FIA Rollcage</div>
                          <div className="bg-white/5 py-1.5 rounded-lg border border-white/5 text-[#FF1717]">VBOX Live</div>
                        </div>
                      </div>

                      {/* Coluna de Detalhes da Jornada e Financeiro */}
                      <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-6">
                        
                        {/* Timeline de Bateria */}
                        <div className="bg-black/40 rounded-2xl p-5 border border-white/10 font-mono">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
                            {/* Início */}
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-[#FF1717] uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#FF1717] inline-block animate-ping" />
                                Entrada no Pitlane
                              </p>
                              <p className="text-sm md:text-base font-black text-white">{format(dataInicio, "dd 'de' MMMM", { locale: ptBR })}</p>
                              <p className="text-xs text-white/40 flex items-center gap-1"><Clock size={12}/> 09:00 • Box Central</p>
                            </div>

                            {/* Fim */}
                            <div className="space-y-1 sm:border-l sm:border-white/10 sm:pl-4">
                              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-white/40 inline-block" />
                                Bandeira Quadriculada
                              </p>
                              <p className="text-sm md:text-base font-black text-white">{format(dataFim, "dd 'de' MMMM", { locale: ptBR })}</p>
                              <p className="text-xs text-white/40 flex items-center gap-1"><Clock size={12}/> 18:00 • Box Central</p>
                            </div>
                          </div>
                        </div>

                        {/* Composição de Valores e Faturamento */}
                        <div className="bg-black/70 border border-white/15 text-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl font-mono">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Cálculo da Sessão</p>
                            <p className="text-xs text-white/70">
                              {diarias} {diarias === 1 ? 'diária de pista' : 'diárias de pista'} x {formatPrice(pedido.automovel.precoPorDia)}
                            </p>
                            <p className="text-[10px] text-[#FF1717] font-bold mt-0.5">Apólice de pista e telemetria incluídas</p>
                          </div>
                          <div className="sm:text-right">
                            <p className="text-[10px] font-bold text-[#FF1717] uppercase tracking-widest">Valor Total</p>
                            <p className="text-2xl md:text-3xl font-black tracking-tight text-[#FF1717]">
                              {formatPrice(pedido.valorTotal)}
                            </p>
                          </div>
                        </div>

                        {/* Botão de Cancelamento para Pedidos Ativos */}
                        {podeCancelar && (
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => handleCancelarPedido(pedido.id)}
                              disabled={isProcessing === pedido.id}
                              className="px-4 py-2.5 rounded-xl border border-rose-500/40 text-rose-400 hover:bg-rose-950/40 text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              {isProcessing === pedido.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} Cancelar Sessão
                            </button>
                          </div>
                        )}

                        {/* Ação de Contraproposta da Locadora */}
                        {pedido.status === 'REVISAO_CLIENTE' && (
                          <div className="bg-[#FF1717]/10 border border-[#FF1717]/30 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 font-mono">
                            <div className="flex items-start gap-3 text-white">
                              <AlertTriangle className="text-[#FF1717] mt-0.5 shrink-0" size={20} />
                              <div>
                                <p className="text-xs font-bold text-[#FF1717]">O box propôs ajuste no cronograma da bateria.</p>
                                <p className="text-[11px] text-white/60">Verifique as novas datas de entrada e saída no box acima para confirmar sua sessão de pista.</p>
                              </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button 
                                type="button"
                                onClick={() => handleResponderRevisao(pedido.id, false)}
                                disabled={isProcessing === pedido.id}
                                className="px-4 py-2 bg-white/10 text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-all text-xs cursor-pointer"
                              >
                                Recusar
                              </button>
                              <button 
                                type="button"
                                onClick={() => handleResponderRevisao(pedido.id, true)}
                                disabled={isProcessing === pedido.id}
                                className="px-4 py-2 bg-[#FF1717] text-white font-black rounded-xl shadow-lg hover:bg-white hover:text-black transition-all flex items-center gap-1.5 text-xs cursor-pointer"
                              >
                                {isProcessing === pedido.id ? <Loader2 size={14} className="animate-spin" /> : 'Aceitar Novas Datas'}
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
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
