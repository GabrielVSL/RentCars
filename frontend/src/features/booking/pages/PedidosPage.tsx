'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  User,
  CarFront,
  Loader2,
  X,
  ChevronRight,
  FileText,
  Edit3,
  Send,
  Flag,
  RefreshCw,
} from 'lucide-react';
import { api } from '@/services/api';
import { toast } from '@/store/useToastStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { resolveStudioCarImage } from '@/lib/carPresentation';

interface Pedido {
  id: number;
  trackingCode?: string;
  tipoServico?: 'VISITA_BOX' | 'FAST_LAP' | 'TRACK_EXPERIENCE' | 'PACOTE_VIP' | string;
  circuitoId?: string;
  circuitoNome?: string;
  trackSlot?: {
    id: number;
    data: string;
    turno: string;
  } | null;
  cliente: { nome: string; email: string; cpf?: string; profissao?: string };
  automovel?: { marca: string; modelo: string; placa: string; matricula: string; imageUrl?: string } | null;
  dataInicio: string;
  dataFim: string;
  valorTotal?: number;
  valorFinal?: number;
  valorSinistro?: number;
  status: 'PENDENTE_EMPRESA' | 'PENDENTE_BANCO' | 'APROVADO' | 'REJEITADO' | 'CANCELADO' | 'REVISAO_CLIENTE';
  dataPedido: string;
}

type StatusFilter = 'TODOS' | 'PENDENTES' | 'APROVADO' | 'REJEITADO' | 'CANCELADO';

const SERVICE_LABEL: Record<string, string> = {
  VISITA_BOX: 'Visita ao Box / Paddock',
  FAST_LAP: 'Fast Lap (Sessão Curta)',
  TRACK_EXPERIENCE: 'Track Experience',
  PACOTE_VIP: 'Pacote VIP Full Track',
};

const getStatusBadge = (status: Pedido['status']) => {
  switch (status) {
    case 'PENDENTE_EMPRESA':
      return {
        label: 'PENDENTE EMPRESA',
        cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      };
    case 'PENDENTE_BANCO':
      return {
        label: 'AUDITORIA BANCO',
        cls: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      };
    case 'REVISAO_CLIENTE':
      return {
        label: 'AGUARDANDO CLIENTE',
        cls: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      };
    case 'APROVADO':
      return {
        label: 'APROVADO',
        cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      };
    case 'CANCELADO':
      return {
        label: 'CANCELADO',
        cls: 'bg-white/10 text-white/60 border-white/15',
      };
    default:
      return {
        label: status,
        cls: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      };
  }
};

export default function PedidosPage() {
  const { user } = useAuthStore();
  const { formatPrice } = useCurrencyStore();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('TODOS');
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Estados para o Modo de Edição (Contraproposta)
  const [isEditing, setIsEditing] = useState(false);
  const [editDates, setEditDates] = useState({ start: '', end: '' });

  const fetchPedidos = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/pedidos');
      setPedidos(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      toast.error('Erro ao carregar sessões e reservas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  useEffect(() => {
    if (pedidoSelecionado) {
      setEditDates({
        start: pedidoSelecionado.dataInicio ? new Date(pedidoSelecionado.dataInicio).toISOString().slice(0, 16) : '',
        end: pedidoSelecionado.dataFim ? new Date(pedidoSelecionado.dataFim).toISOString().slice(0, 16) : '',
      });
      setIsEditing(false);
    }
  }, [pedidoSelecionado]);

  const handleDecisao = async (id: number, novoStatus: 'APROVADO' | 'REJEITADO') => {
    try {
      setIsProcessing(true);
      const response = await api.put(`/api/pedidos/${id}/avaliar?status=${novoStatus}`);
      const statusFinal: Pedido['status'] =
        response.data?.status || (novoStatus === 'APROVADO' ? 'PENDENTE_BANCO' : 'REJEITADO');
      atualizarEstadoLocal(id, statusFinal);
      if (statusFinal === 'PENDENTE_BANCO') {
        toast.success('Sessão aprovada pela Empresa! Encaminhada para auditoria do Banco.');
      } else if (statusFinal === 'APROVADO') {
        toast.success('Sessão aprovada com sucesso!');
      } else {
        toast.success('Sessão rejeitada.');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Erro ao processar decisão.';
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEnviarContraproposta = async () => {
    if (!pedidoSelecionado) return;
    try {
      setIsProcessing(true);
      const payload = {
        dataInicio: editDates.start.length === 16 ? `${editDates.start}:00` : editDates.start,
        dataFim: editDates.end.length === 16 ? `${editDates.end}:00` : editDates.end,
      };

      await api.put(`/api/pedidos/${pedidoSelecionado.id}/modificar`, payload);

      setPedidos((prev) =>
        prev.map((p) =>
          p.id === pedidoSelecionado.id
            ? { ...p, status: 'REVISAO_CLIENTE', dataInicio: payload.dataInicio, dataFim: payload.dataFim }
            : p
        )
      );
      setPedidoSelecionado((prev) =>
        prev
          ? { ...prev, status: 'REVISAO_CLIENTE', dataInicio: payload.dataInicio, dataFim: payload.dataFim }
          : null
      );
      setIsEditing(false);
      toast.success('Contraproposta enviada ao piloto com sucesso!');
    } catch {
      toast.error('Erro ao enviar contraproposta.');
    } finally {
      setIsProcessing(false);
    }
  };

  const atualizarEstadoLocal = (id: number, novoStatus: Pedido['status']) => {
    setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, status: novoStatus } : p)));
    if (pedidoSelecionado?.id === id) {
      setPedidoSelecionado((prev) => (prev ? { ...prev, status: novoStatus } : null));
    }
  };

  const pedidosFiltrados = pedidos.filter((p) => {
    if (filter === 'TODOS') return true;
    if (filter === 'PENDENTES') {
      return p.status === 'PENDENTE_EMPRESA' || p.status === 'PENDENTE_BANCO' || p.status === 'REVISAO_CLIENTE';
    }
    return p.status === filter;
  });

  return (
    <div className="min-h-screen bg-[#08090C] text-white pt-28 pb-24 selection:bg-[#FF1717] selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="pb-8 border-b border-white/10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#FF1717] mb-2">
              Race Control · Sessões &amp; Reservas
            </p>
            <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-white">
              Gestão de Sessões &amp; Pedidos
            </h1>
            <p className="text-sm text-white/60 mt-2">
              Analise reservas de pista, aprove sessões em fila ou proponha novas janelas de bateria.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'TODOS', label: 'Todos' },
                { id: 'PENDENTES', label: 'Pendentes' },
                { id: 'APROVADO', label: 'Aprovados' },
                { id: 'REJEITADO', label: 'Rejeitados' },
                { id: 'CANCELADO', label: 'Cancelados' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer border whitespace-nowrap ${
                  filter === f.id
                    ? 'bg-[#FF1717] text-white border-[#FF1717]'
                    : 'bg-white/[0.03] text-white/65 border-white/10 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}

            <button
              type="button"
              onClick={fetchPedidos}
              className="p-2 rounded-full bg-white/[0.04] hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Atualizar lista"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-white/50">
            <Loader2 className="animate-spin text-[#FF1717]" size={32} />
            <span className="text-xs font-mono uppercase tracking-widest">Carregando sessões...</span>
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="bg-[#11131A] border border-white/[0.08] rounded-2xl p-16 text-center">
            <Clock size={40} className="mx-auto text-white/25 mb-4" />
            <h3 className="text-lg font-medium text-white">Nenhuma sessão encontrada</h3>
            <p className="text-sm text-white/50 mt-1">
              Não há pedidos para o filtro selecionado no momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {pedidosFiltrados.map((pedido) => {
                const titulo =
                  pedido.automovel ? `${pedido.automovel.marca} ${pedido.automovel.modelo}` : SERVICE_LABEL[pedido.tipoServico || ''] || 'Visita ao Paddock';
                const servicoLabel = SERVICE_LABEL[pedido.tipoServico || ''] || pedido.tipoServico || 'Sessão em Pista';
                const badge = getStatusBadge(pedido.status);
                const valorExibido = pedido.valorFinal ?? pedido.valorTotal ?? 0;

                return (
                  <motion.div
                    key={pedido.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    onClick={() => setPedidoSelecionado(pedido)}
                    className="group bg-[#11131A] border border-white/[0.08] hover:border-[#FF1717]/40 rounded-2xl overflow-hidden transition-all cursor-pointer flex flex-col"
                  >
                    {/* Palco Studio Escuro */}
                    <div className="h-44 w-full bg-[#08090C] relative overflow-hidden flex items-center justify-center p-4">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06)_0%,transparent_72%)] pointer-events-none" />
                      {pedido.automovel ? (
                        <img
                          src={resolveStudioCarImage(pedido.automovel)}
                          alt={titulo}
                          className="relative z-10 w-full h-full object-contain drop-shadow-[0_14px_22px_rgba(0,0,0,0.9)] group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="relative z-10 flex flex-col items-center justify-center text-white/50">
                          {pedido.tipoServico === 'VISITA_BOX' ? (
                            <Flag size={34} className="text-[#FF1717] mb-2" />
                          ) : (
                            <CarFront size={34} className="text-white/40 mb-2" />
                          )}
                          <span className="text-[11px] font-mono uppercase tracking-widest text-white/60">
                            {pedido.circuitoNome || 'Apex Paddock'}
                          </span>
                        </div>
                      )}

                      <div className="absolute top-3 left-3 z-20">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      {pedido.trackingCode && (
                        <span className="absolute top-3 right-3 z-20 px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[10px] font-mono text-white/65">
                          #{pedido.trackingCode}
                        </span>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col border-t border-white/[0.06]">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-white/45 mb-1">
                        {servicoLabel} {pedido.circuitoNome ? `· ${pedido.circuitoNome}` : ''}
                      </span>
                      <h3 className="text-lg font-medium text-white truncate mb-1">{titulo}</h3>
                      <p className="text-xs text-white/55 mb-4 truncate">
                        Piloto: <span className="text-white/85">{pedido.cliente?.nome || 'Piloto'}</span>
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-3.5 border-t border-white/[0.08]">
                        <div className="flex items-center gap-2 text-xs text-white/65">
                          <Calendar size={14} className="text-[#FF1717]" />
                          <span className="font-mono">
                            {pedido.dataInicio ? new Date(pedido.dataInicio).toLocaleDateString('pt-BR') : 'A definir'}
                          </span>
                          <span className="ml-2 text-sm font-semibold text-white tabular-nums">
                            {formatPrice(valorExibido)}
                          </span>
                        </div>
                        <ChevronRight
                          size={18}
                          className="text-white/40 group-hover:text-[#FF1717] group-hover:translate-x-0.5 transition-all"
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* PAINEL LATERAL DE DETALHES COM MODO EDIÇÃO (DARK LUXURY) */}
      <AnimatePresence>
        {pedidoSelecionado && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPedidoSelecionado(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[120]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#0D1017] border-l border-white/10 text-white shadow-2xl z-[121] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#11131A]">
                <h2 className="text-base font-medium text-white flex items-center gap-2">
                  <FileText size={18} className="text-[#FF1717]" /> Detalhes da Sessão
                </h2>
                <button
                  type="button"
                  onClick={() => setPedidoSelecionado(null)}
                  className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
                <div className="h-44 w-full bg-[#08090C] border border-white/[0.08] rounded-2xl overflow-hidden relative flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06)_0%,transparent_72%)] pointer-events-none" />
                  {pedidoSelecionado.automovel ? (
                    <img
                      src={resolveStudioCarImage(pedidoSelecionado.automovel)}
                      alt={pedidoSelecionado.automovel.modelo}
                      className="relative z-10 w-full h-full object-contain drop-shadow-[0_14px_22px_rgba(0,0,0,0.9)]"
                    />
                  ) : (
                    <div className="relative z-10 flex flex-col items-center justify-center text-white/60">
                      <Flag size={36} className="text-[#FF1717] mb-2" />
                      <span className="text-xs font-mono uppercase tracking-widest">
                        {pedidoSelecionado.circuitoNome || 'Paddock Apex'}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#FF1717] mb-1">
                    {SERVICE_LABEL[pedidoSelecionado.tipoServico || ''] || 'Experiência Solicitada'}
                  </p>
                  <h3 className="text-xl font-medium text-white">
                    {pedidoSelecionado.automovel
                      ? `${pedidoSelecionado.automovel.marca} ${pedidoSelecionado.automovel.modelo}`
                      : 'Visita ao Box / Telemetria'}
                  </h3>
                  <p className="text-xs text-white/55 font-mono mt-1">
                    {pedidoSelecionado.automovel
                      ? `Placa: ${pedidoSelecionado.automovel.placa} · Matrícula: ${pedidoSelecionado.automovel.matricula}`
                      : `Circuito: ${pedidoSelecionado.circuitoNome || 'Paddock'}`}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {pedidoSelecionado.trackingCode && (
                      <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 text-[11px] font-mono">
                        #{pedidoSelecionado.trackingCode}
                      </span>
                    )}
                    {pedidoSelecionado.trackSlot && (
                      <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 text-[11px] font-mono">
                        Turno {pedidoSelecionado.trackSlot.turno}
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-semibold">
                      {formatPrice(pedidoSelecionado.valorFinal ?? pedidoSelecionado.valorTotal ?? 0)}
                    </span>
                  </div>
                </div>

                <div className="bg-[#11131A] rounded-2xl p-5 border border-white/[0.08]">
                  <p className="text-[10px] font-mono text-white/45 uppercase tracking-widest mb-3">
                    Dados do Piloto
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/[0.06] border border-white/10 rounded-full flex items-center justify-center text-white/60">
                      <User size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-white truncate">{pedidoSelecionado.cliente?.nome}</p>
                      <p className="text-xs text-white/50 font-mono truncate">{pedidoSelecionado.cliente?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Bloco de Datas: Alterna entre Leitura e Edição */}
                <div
                  className={`rounded-2xl p-5 border transition-colors ${
                    isEditing
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-[#11131A] border-white/[0.08]'
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <p
                      className={`text-[10px] font-mono uppercase tracking-widest ${
                        isEditing ? 'text-amber-300' : 'text-white/45'
                      }`}
                    >
                      Janela da Sessão
                    </p>
                    {!isEditing &&
                      pedidoSelecionado.status === 'PENDENTE_EMPRESA' &&
                      (user?.role === 'EMPRESA' || user?.role === 'ADMIN') && (
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="text-xs font-medium text-[#FF1717] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Edit3 size={12} /> Sugerir Novo Horário
                        </button>
                      )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] text-white/50 mb-1 block">Início da Sessão</label>
                      {isEditing ? (
                        <input
                          type="datetime-local"
                          value={editDates.start}
                          onChange={(e) => setEditDates({ ...editDates, start: e.target.value })}
                          className="w-full bg-[#08090C] border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF1717] outline-none font-mono"
                        />
                      ) : (
                        <p className="text-sm font-mono text-white">
                          {new Date(pedidoSelecionado.dataInicio).toLocaleString('pt-BR', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-[11px] text-white/50 mb-1 block">Fim da Sessão</label>
                      {isEditing ? (
                        <input
                          type="datetime-local"
                          value={editDates.end}
                          onChange={(e) => setEditDates({ ...editDates, end: e.target.value })}
                          className="w-full bg-[#08090C] border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF1717] outline-none font-mono"
                        />
                      ) : (
                        <p className="text-sm font-mono text-white">
                          {new Date(pedidoSelecionado.dataFim).toLocaleString('pt-BR', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Dinâmico */}
              <div className="p-6 border-t border-white/10 bg-[#11131A] shrink-0">
                {isEditing ? (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-3 px-4 rounded-full text-xs font-medium text-white/75 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleEnviarContraproposta}
                      disabled={isProcessing}
                      className="flex-[2] py-3 px-4 rounded-full text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isProcessing ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <>
                          <Send size={15} /> Enviar Contraproposta
                        </>
                      )}
                    </button>
                  </div>
                ) : pedidoSelecionado.status === 'PENDENTE_EMPRESA' ? (
                  user?.role === 'EMPRESA' || user?.role === 'ADMIN' ? (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleDecisao(pedidoSelecionado.id, 'REJEITADO')}
                        disabled={isProcessing}
                        className="flex-1 py-3 px-4 rounded-full text-xs font-medium text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <XCircle size={15} />
                        <span>Rejeitar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDecisao(pedidoSelecionado.id, 'APROVADO')}
                        disabled={isProcessing}
                        className="flex-[2] py-3 px-4 rounded-full text-xs font-semibold text-white bg-[#FF1717] hover:bg-[#e01414] transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isProcessing ? (
                          <Loader2 className="animate-spin" size={15} />
                        ) : (
                          <>
                            <CheckCircle2 size={15} />{' '}
                            {user?.role === 'ADMIN' ? 'Aprovar Sessão' : 'Aprovar (Banco)'}
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="w-full py-3.5 rounded-full text-center flex items-center justify-center gap-2 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium">
                      <Clock size={15} /> Aguardando aprovação prévia da Empresa
                    </div>
                  )
                ) : pedidoSelecionado.status === 'PENDENTE_BANCO' ? (
                  user?.role === 'BANCO' || user?.role === 'ADMIN' ? (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleDecisao(pedidoSelecionado.id, 'REJEITADO')}
                        disabled={isProcessing}
                        className="flex-1 py-3 px-4 rounded-full text-xs font-medium text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <XCircle size={15} />
                        <span>Reprovar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDecisao(pedidoSelecionado.id, 'APROVADO')}
                        disabled={isProcessing}
                        className="flex-[2] py-3 px-4 rounded-full text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isProcessing ? (
                          <Loader2 className="animate-spin" size={15} />
                        ) : (
                          <>
                            <CheckCircle2 size={15} /> Liberar Crédito &amp; Aprovar
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="w-full py-3.5 rounded-full text-center flex items-center justify-center gap-2 bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-medium">
                      <Clock size={15} /> Aprovado pela Empresa · Em Auditoria no Banco
                    </div>
                  )
                ) : (
                  <div
                    className={`w-full py-3.5 rounded-full text-center flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider border ${
                      pedidoSelecionado.status === 'APROVADO'
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : pedidoSelecionado.status === 'REVISAO_CLIENTE'
                          ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                          : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {pedidoSelecionado.status === 'REVISAO_CLIENTE' ? (
                      <Clock size={16} />
                    ) : pedidoSelecionado.status === 'APROVADO' ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <XCircle size={16} />
                    )}
                    {pedidoSelecionado.status === 'REVISAO_CLIENTE'
                      ? 'AGUARDANDO CLIENTE'
                      : pedidoSelecionado.status === 'APROVADO'
                        ? 'SESSÃO CONFIRMADA'
                        : `PEDIDO ${pedidoSelecionado.status}`}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
