'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CarFront,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  CreditCard,
  Activity,
  ShieldAlert,
} from 'lucide-react';
import { api } from '@/services/api';
import { toast } from '@/store/useToastStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { resolveStudioCarImage } from '@/lib/carPresentation';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Pedido {
  id: number;
  trackingCode?: string;
  tipoServico?: string;
  automovel?: { id?: number; marca: string; modelo: string; placa: string; imageUrl?: string; precoPorDia?: number } | null;
  trackSlot?: { data: string; turno: string; circuito?: { id: string; nome: string } } | null;
  dataInicio: string;
  dataFim: string;
  valorTotal?: number;
  descontoFidelidade?: number;
  valorFinal?: number;
  valorSinistro?: number;
  motivoSinistro?: string;
  pagamentoStatus?: string;
  status: 'PENDENTE' | 'PENDENTE_EMPRESA' | 'PENDENTE_BANCO' | 'APROVADO' | 'REJEITADO' | 'CANCELADO' | 'REVISAO_CLIENTE';
  dataPedido: string;
}

const statusConfig = {
  PENDENTE: { text: 'Aguardando Validação', color: 'bg-white/10 text-white border-white/20', icon: Clock },
  PENDENTE_EMPRESA: { text: 'Inspeção do Box / Paddock', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: Building2 },
  PENDENTE_BANCO: { text: 'Análise ApexPay', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: CreditCard },
  REVISAO_CLIENTE: { text: 'Revisão de Bateria Necessária', color: 'bg-[#FF1717]/10 text-[#FF1717] border-[#FF1717]/40 animate-pulse', icon: AlertTriangle },
  APROVADO: { text: 'Green Flag // Sessão Confirmada', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40', icon: CheckCircle2 },
  REJEITADO: { text: 'Garantia Não Aprovada', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30', icon: XCircle },
  CANCELADO: { text: 'Sessão Cancelada', color: 'bg-white/5 text-white/40 border-white/10', icon: XCircle },
};

const SERVICO_LABELS: Record<string, string> = {
  VISITA_BOX: 'Visita ao Box & Paddock VIP',
  FAST_LAP: 'Fast Lap (Carona c/ Piloto)',
  TRACK_EXPERIENCE: 'Track Experience (Pilotar)',
  PACOTE_VIP: 'Pacote VIP Full Day',
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
      const list = Array.isArray(response.data) ? response.data : [];
      const sorted = list.sort((a: Pedido, b: Pedido) => {
        if (a.status === 'REVISAO_CLIENTE') return -1;
        return new Date(b.dataPedido).getTime() - new Date(a.dataPedido).getTime();
      });
      setPedidos(sorted);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeusPedidos();
  }, []);

  const handleResponderRevisao = async (id: number, aceito: boolean) => {
    try {
      setIsProcessing(id);
      await api.put(`/api/pedidos/${id}/responder-revisao?aceito=${aceito}`);
      setPedidos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: aceito ? 'PENDENTE_BANCO' : 'CANCELADO' } : p))
      );
      toast.success(aceito ? 'Novo horário aceito!' : 'Contraproposta recusada.');
    } catch {
      toast.error('Erro ao enviar resposta.');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleCancelarPedido = async (id: number) => {
    try {
      setIsProcessing(id);
      await api.put(`/api/pedidos/${id}/cancelar`);
      setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'CANCELADO' } : p)));
      toast.success('Sessão de pista cancelada.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao cancelar sessão.');
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090C] text-white pt-28 pb-32 selection:bg-[#FF1717] selection:text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
              Acompanhe suas credenciais de autódromo, status do turno e movimentações no ApexPay.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/apexpay')}
              className="px-5 py-3 rounded-full font-mono text-xs font-semibold uppercase tracking-widest bg-white/5 border border-white/15 text-white hover:border-white/35 transition-all cursor-pointer"
            >
              Minha Carteira ApexPay
            </button>
            <button
              type="button"
              onClick={() => navigate('/pistas')}
              className="px-6 py-3 rounded-full font-mono text-xs font-bold uppercase tracking-widest bg-[#FF1717] text-white hover:bg-[#e01414] transition-all cursor-pointer shadow-lg shadow-[#FF1717]/25"
            >
              + Nova Sessão
            </button>
          </div>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="animate-spin text-[#FF1717]" size={42} />
            <span className="font-mono text-xs text-white/50 uppercase tracking-widest">Carregando Credenciais...</span>
          </div>
        ) : pedidos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-[#0F1117] border border-white/10 rounded-3xl p-8 shadow-2xl"
          >
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#FF1717] border border-white/10">
              <Activity size={36} />
            </div>
            <h3 className="text-2xl font-black font-sans text-white uppercase tracking-tight mb-2">
              Nenhuma Sessão Ativa
            </h3>
            <p className="text-white/50 text-sm max-w-md mx-auto mb-8 font-mono">
              Você ainda não reservou nenhuma bateria cronometrada ou visita ao paddock.
            </p>
            <button
              type="button"
              onClick={() => navigate('/pistas')}
              className="px-8 py-4 bg-[#FF1717] text-white font-mono text-xs font-black uppercase tracking-widest rounded-full hover:bg-white hover:text-black transition-all shadow-[0_0_25px_rgba(255,23,23,0.4)] cursor-pointer"
            >
              Explorar Pistas ↗
            </button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            <AnimatePresence>
              {pedidos.map((pedido, index) => {
                const config = statusConfig[pedido.status] || statusConfig.PENDENTE;
                const StatusIcon = config.icon;
                const dataInicio = parseISO(pedido.dataInicio);
                const podeCancelar = ['PENDENTE', 'PENDENTE_EMPRESA', 'PENDENTE_BANCO'].includes(pedido.status);
                const servicoLabel = SERVICO_LABELS[pedido.tipoServico || 'TRACK_EXPERIENCE'] || pedido.tipoServico;
                const circuitoLabel = pedido.trackSlot?.circuito?.nome || 'Circuito Internacional';
                const turnoLabel = pedido.trackSlot?.turno || 'SESSÃO';
                const valorExibido = pedido.valorFinal ?? pedido.valorTotal ?? 0;

                return (
                  <motion.div
                    key={pedido.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className="bg-[#0F1117] border border-white/10 rounded-3xl overflow-hidden shadow-2xl hover:border-[#FF1717]/40 transition-all duration-300"
                  >
                    <div className="bg-black/60 border-b border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-4 font-mono">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">FIA TRACK PASS</span>
                        <span className="text-xs font-black text-[#FF1717] bg-white/5 px-3 py-1 rounded-lg border border-white/15">
                          {pedido.trackingCode || `APX-${String(pedido.id).padStart(6, '0')}`}
                        </span>
                        {pedido.dataPedido && (
                          <span className="text-[11px] text-white/40 hidden sm:inline">
                            • Solicitado em {format(parseISO(pedido.dataPedido), "dd 'de' MMM", { locale: ptBR })}
                          </span>
                        )}
                      </div>

                      <div
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${config.color}`}
                      >
                        <StatusIcon size={14} strokeWidth={2.5} />
                        {config.text}
                      </div>
                    </div>

                    <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                      <div className="lg:col-span-5 flex flex-col items-center">
                        <div className="w-full aspect-[16/10] bg-gradient-to-b from-[#181B24] to-[#0A0B0E] rounded-2xl border border-white/10 p-4 flex items-center justify-center relative overflow-hidden">
                          {pedido.automovel ? (
                            <img
                              src={resolveStudioCarImage(pedido.automovel)}
                              alt={pedido.automovel.modelo}
                              className="max-h-full max-w-full object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.85)]"
                            />
                          ) : (
                            <CarFront size={52} className="text-white/25" />
                          )}
                          <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[9px] font-mono font-bold text-[#FF1717] uppercase tracking-wider">
                            {pedido.automovel ? pedido.automovel.marca : 'PADDOCK VIP'}
                          </div>
                        </div>

                        <div className="w-full mt-4 text-left border-b border-white/10 pb-4">
                          <h3 className="text-xl font-bold font-sans text-white tracking-tight">
                            {pedido.automovel ? pedido.automovel.modelo : servicoLabel}
                          </h3>
                          <p className="text-xs font-mono text-white/45 mt-0.5">
                            {circuitoLabel} · {turnoLabel}
                          </p>
                        </div>

                        <div className="w-full grid grid-cols-3 gap-2 mt-3 pt-1 text-[10px] font-mono font-bold text-white/60 text-center">
                          <div className="bg-white/5 py-1.5 rounded-lg border border-white/5">Combustível 102</div>
                          <div className="bg-white/5 py-1.5 rounded-lg border border-white/5">Pneus Cup 2R</div>
                          <div className="bg-white/5 py-1.5 rounded-lg border border-white/5 text-[#FF1717]">VBOX Live</div>
                        </div>
                      </div>

                      <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-5">
                        <div className="bg-black/40 rounded-2xl p-5 border border-white/10 font-mono grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-[#FF1717] uppercase tracking-widest">Modalidade</p>
                            <p className="text-sm font-bold text-white">{servicoLabel}</p>
                            <p className="text-xs text-white/50">{circuitoLabel}</p>
                          </div>

                          <div className="space-y-1 sm:border-l sm:border-white/10 sm:pl-4">
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Data & Turno</p>
                            <p className="text-sm font-bold text-white">
                              {format(dataInicio, "dd 'de' MMMM", { locale: ptBR })}
                            </p>
                            <p className="text-xs text-emerald-400">Turno: {turnoLabel}</p>
                          </div>
                        </div>

                        <div className="bg-black/70 border border-white/15 text-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">
                              Resumo ApexPay ({pedido.pagamentoStatus || 'PENDENTE'})
                            </p>
                            {pedido.descontoFidelidade && pedido.descontoFidelidade > 0 ? (
                              <p className="text-xs text-emerald-400">
                                Desconto de fidelidade aplicado: -{formatPrice(pedido.descontoFidelidade)}
                              </p>
                            ) : (
                              <p className="text-xs text-white/65">Combustível, pneus e seguro base inclusos</p>
                            )}
                          </div>
                          <div className="sm:text-right">
                            <p className="text-[10px] font-bold text-[#FF1717] uppercase tracking-widest">Valor da Sessão</p>
                            <p className="text-2xl md:text-3xl font-black tracking-tight text-white">
                              {formatPrice(valorExibido)}
                            </p>
                          </div>
                        </div>

                        {pedido.valorSinistro && pedido.valorSinistro > 0 ? (
                          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-between gap-3 text-xs font-mono">
                            <div className="flex items-center gap-2.5 text-rose-200">
                              <ShieldAlert size={16} className="text-rose-400 shrink-0" />
                              <span>
                                Franquia / Sinistro lançado: <strong>{formatPrice(pedido.valorSinistro)}</strong> —{' '}
                                {pedido.motivoSinistro || 'Avaria em pista'}
                              </span>
                            </div>
                          </div>
                        ) : null}

                        {podeCancelar && (
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => handleCancelarPedido(pedido.id)}
                              disabled={isProcessing === pedido.id}
                              className="px-4 py-2.5 rounded-xl border border-rose-500/40 text-rose-400 hover:bg-rose-950/40 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              {isProcessing === pedido.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                              Cancelar Sessão
                            </button>
                          </div>
                        )}

                        {pedido.status === 'REVISAO_CLIENTE' && (
                          <div className="bg-[#FF1717]/10 border border-[#FF1717]/30 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 font-mono">
                            <div className="flex items-start gap-3 text-white">
                              <AlertTriangle className="text-[#FF1717] mt-0.5 shrink-0" size={20} />
                              <div>
                                <p className="text-xs font-bold text-[#FF1717]">O box propôs ajuste de horário.</p>
                                <p className="text-[11px] text-white/60">Aceite ou recuse a nova janela sugerida pela equipe.</p>
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
                                className="px-4 py-2 bg-[#FF1717] text-white font-black rounded-xl shadow-lg hover:bg-white hover:text-black transition-all text-xs cursor-pointer"
                              >
                                Aceitar
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
