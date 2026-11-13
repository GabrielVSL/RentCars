'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  UserCircle,
  Activity,
  Loader2,
  History,
  ChevronDown,
  Flag,
} from 'lucide-react';
import { api } from '@/services/api';
import { toast } from '@/store/useToastStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { resolveStudioCarImage } from '@/lib/carPresentation';

interface Pedido {
  id: number;
  cliente: {
    nome: string;
    cpf: string;
    rendimentos?: { valor: number; empregadora: string }[];
  };
  automovel?: { marca?: string; modelo: string; placa: string; imageUrl?: string } | null;
  tipoServico?: string;
  valorTotal: number;
  valorFinal?: number;
  descontoFidelidade?: number;
  status: 'PENDENTE' | 'PENDENTE_EMPRESA' | 'PENDENTE_BANCO' | 'APROVADO' | 'REJEITADO' | 'CANCELADO';
  dataInicio: string;
  dataPedido: string;
}

export default function AnalisesPage() {
  const { formatPrice } = useCurrencyStore();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [clientMode, setClientMode] = useState<'TODOS' | 'PENDENTES'>('TODOS');

  useEffect(() => {
    const fetchAnalises = async () => {
      try {
        const response = await api.get('/api/pedidos');
        setPedidos(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error(error);
        toast.error('Erro ao carregar dados de auditoria.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalises();
  }, []);

  // MOTOR DE SCORE: Inicia em 50 e flutua com base na matemática financeira
  const calcularScore = (historico: Pedido[], rendaTotal: number, valorAtual: number) => {
    let score = 50;

    historico.forEach((p) => {
      if (p.status === 'APROVADO') score += 15;
      if (p.status === 'REJEITADO') score -= 20;
      if (p.status === 'CANCELADO') score -= 5;
    });

    if (rendaTotal > 0) {
      const comprometimento = valorAtual / rendaTotal;
      if (comprometimento > 0.6) score -= 30;
      else if (comprometimento > 0.4) score -= 15;
      else if (comprometimento > 0.2) score -= 5;
    }

    score = Math.max(0, Math.min(100, score));

    if (score >= 70) {
      return {
        score,
        label: 'Score Alto',
        color: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
      };
    }
    if (score >= 40) {
      return {
        score,
        label: 'Score Médio',
        color: 'text-amber-300 bg-amber-500/15 border-amber-500/30',
      };
    }
    return {
      score,
      label: 'Score Crítico',
      color: 'text-rose-300 bg-rose-500/15 border-rose-500/30',
    };
  };

  // AGRUPAMENTO E FILTRO: Separa pendentes ativos do histórico
  const analisePorCliente = useMemo(() => {
    const hoje = new Date();
    const grupos: Record<string, { cliente: Pedido['cliente']; historico: Pedido[]; pAtivos: Pedido[] }> = {};

    pedidos.forEach((p) => {
      if (!p.cliente) return;
      const cpfKey = p.cliente.cpf || `cliente-${p.id}`;
      if (!grupos[cpfKey]) {
        grupos[cpfKey] = { cliente: p.cliente, historico: [], pAtivos: [] };
      }

      const isPendente = p.status === 'PENDENTE_BANCO' || p.status === 'PENDENTE';
      const isExpirado = p.dataInicio ? new Date(p.dataInicio) < hoje : false;

      if (isPendente && !isExpirado) {
        grupos[cpfKey].pAtivos.push(p);
      } else {
        grupos[cpfKey].historico.push(p);
      }
    });

    return Object.values(grupos)
      .filter((g) => (clientMode === 'PENDENTES' ? g.pAtivos.length > 0 : true))
      .sort((a, b) => b.pAtivos.length - a.pAtivos.length);
  }, [pedidos, clientMode]);

  const handleDecisaoCredito = async (id: number, status: 'APROVADO' | 'REJEITADO') => {
    try {
      await api.put(`/api/pedidos/${id}/avaliar?status=${status}`);
      setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
      toast.success(status === 'APROVADO' ? 'Crédito aprovado com sucesso!' : 'Crédito recusado.');
    } catch {
      toast.error('Erro na análise de crédito.');
    }
  };

  return (
    <div className="min-h-screen bg-[#08090C] text-white pt-28 pb-24 selection:bg-[#FF1717] selection:text-white">
      <div className="max-w-6xl mx-auto px-6 space-y-8">
        <header className="pb-8 border-b border-white/10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#FF1717] mb-2">
              Risk &amp; Credit Bureau · Auditoria
            </p>
            <h1 className="text-3xl sm:text-4xl font-medium text-white tracking-tight flex items-center gap-3">
              <Activity className="text-[#FF1717]" size={28} /> Auditoria de Crédito &amp; Score
            </h1>
            <p className="text-sm text-white/60 mt-2">
              Avalie renda declarada, comprometimento por sessão e cronologia de pagamentos por CPF. Score base: 50 pts.
            </p>
          </div>

          <div className="flex gap-2">
            {(
              [
                { id: 'TODOS', label: 'Todos os Clientes' },
                { id: 'PENDENTES', label: 'Com Pendências' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setClientMode(opt.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer border whitespace-nowrap ${
                  clientMode === opt.id
                    ? 'bg-[#FF1717] text-white border-[#FF1717]'
                    : 'bg-white/[0.03] text-white/65 border-white/10 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-white/50">
            <Loader2 className="animate-spin text-[#FF1717]" size={32} />
            <span className="text-xs font-mono uppercase tracking-widest">Calculando scores...</span>
          </div>
        ) : analisePorCliente.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-white/[0.08] rounded-2xl bg-[#11131A]">
            <ShieldCheck size={44} className="text-white/25 mb-3" />
            <h3 className="text-lg font-medium text-white">Nenhuma análise encontrada</h3>
            <p className="text-sm text-white/50 mt-1">
              {clientMode === 'PENDENTES'
                ? 'Não há clientes aguardando auditoria bancária no momento.'
                : 'Ainda não existem reservas registradas para auditoria.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {analisePorCliente.map((grupo) => {
              const pAtivo = grupo.pAtivos[0] || grupo.historico[0];
              const rendaTotal = grupo.cliente.rendimentos?.reduce((s, r) => s + (Number(r.valor) || 0), 0) || 0;
              const valorPedido = pAtivo?.valorFinal ?? pAtivo?.valorTotal ?? 0;
              const analiseScore = calcularScore(grupo.historico, rendaTotal, valorPedido);
              const totalAcoes = grupo.historico.length + grupo.pAtivos.length;
              const clientKey = grupo.cliente.cpf || grupo.cliente.nome;

              return (
                <div
                  key={clientKey}
                  className="bg-[#11131A] border border-white/[0.08] rounded-2xl overflow-hidden transition-all"
                >
                  {/* CABEÇALHO DO CLIENTE (Resumo) */}
                  <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4 min-w-[240px] relative">
                      <div className="w-12 h-12 bg-white/[0.05] border border-white/10 rounded-full flex items-center justify-center text-white/60">
                        <UserCircle size={24} />
                      </div>
                      {totalAcoes > 1 && (
                        <div className="absolute -top-1 left-8 bg-[#FF1717] text-white text-[10px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#11131A]">
                          {totalAcoes}
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-white">{grupo.cliente.nome}</h3>
                        <p className="text-xs font-mono text-white/45">{grupo.cliente.cpf || 'CPF não informado'}</p>
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-[10px] font-mono text-white/45 uppercase tracking-widest mb-1">
                          Renda Declarada
                        </p>
                        <p className="text-emerald-400 font-mono font-semibold text-sm">
                          {rendaTotal > 0 ? formatPrice(rendaTotal) : 'Não informada'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono text-white/45 uppercase tracking-widest mb-1">
                          Última Sessão
                        </p>
                        <p className="text-white font-mono font-semibold text-sm">{formatPrice(valorPedido)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono text-white/45 uppercase tracking-widest mb-1">
                          Score de Crédito
                        </p>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-mono font-bold ${
                              analiseScore.score >= 70
                                ? 'text-emerald-400'
                                : analiseScore.score >= 40
                                  ? 'text-amber-400'
                                  : 'text-rose-400'
                            }`}
                          >
                            {analiseScore.score}
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${analiseScore.color}`}>
                            {analiseScore.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedClient(expandedClient === clientKey ? null : clientKey)}
                      className="self-end lg:self-auto p-2.5 bg-white/[0.04] hover:bg-white/10 border border-white/10 rounded-full transition-colors cursor-pointer"
                    >
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${expandedClient === clientKey ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>

                  {/* CONTEÚDO EXPANSÍVEL */}
                  <AnimatePresence>
                    {expandedClient === clientKey && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/[0.08] bg-[#08090C]/70 overflow-hidden"
                      >
                        <div className="p-6 space-y-4">
                          <h4 className="text-[11px] font-mono text-white/50 uppercase tracking-widest flex items-center gap-2">
                            <History size={14} className="text-[#FF1717]" /> Cronologia Completa do CPF
                          </h4>

                          <div className="space-y-3">
                            {[...grupo.pAtivos, ...grupo.historico].map((p) => {
                              const isActive = grupo.pAtivos.some((ativo) => ativo.id === p.id);

                              return (
                                <div
                                  key={p.id}
                                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border ${
                                    isActive
                                      ? 'bg-[#FF1717]/[0.06] border-[#FF1717]/30'
                                      : 'bg-[#11131A] border-white/[0.08]'
                                  }`}
                                >
                                  <div className="flex flex-wrap items-center gap-5">
                                    <div className="w-16 h-10 rounded-lg bg-[#08090C] border border-white/10 flex items-center justify-center p-1 shrink-0">
                                      {p.automovel ? (
                                        <img
                                          src={resolveStudioCarImage({
                                            marca: p.automovel.marca ?? '',
                                            modelo: p.automovel.modelo,
                                            imageUrl: p.automovel.imageUrl,
                                          })}
                                          alt={p.automovel.modelo}
                                          className="w-full h-full object-contain"
                                        />
                                      ) : (
                                        <Flag size={16} className="text-[#FF1717]" />
                                      )}
                                    </div>

                                    <div>
                                      <p className="text-[10px] font-mono uppercase text-white/45">Veículo / Sessão</p>
                                      <p className="text-sm font-medium text-white">
                                        {p.automovel
                                          ? `${p.automovel.marca ? `${p.automovel.marca} ` : ''}${p.automovel.modelo}`
                                          : p.tipoServico === 'VISITA_BOX'
                                            ? 'Visita ao Box & Paddock'
                                            : 'Sessão de Pista'}
                                      </p>
                                    </div>

                                    <div>
                                      <p className="text-[10px] font-mono uppercase text-white/45">Valor Final</p>
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm font-mono font-semibold text-white">
                                          {formatPrice(p.valorFinal ?? p.valorTotal ?? 0)}
                                        </p>
                                        {(p.descontoFidelidade || 0) > 0 && (
                                          <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                                            -{formatPrice(Number(p.descontoFidelidade))}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div>
                                      <p className="text-[10px] font-mono uppercase text-white/45">Situação</p>
                                      {isActive ? (
                                        <span className="text-[10px] font-mono uppercase text-[#FF1717] font-semibold">
                                          AGUARDANDO AUDITORIA
                                        </span>
                                      ) : (
                                        <span
                                          className={`text-[10px] font-mono uppercase font-semibold ${
                                            p.status === 'APROVADO'
                                              ? 'text-emerald-400'
                                              : p.status === 'REJEITADO'
                                                ? 'text-rose-400'
                                                : 'text-white/55'
                                          }`}
                                        >
                                          {new Date(p.dataInicio) < new Date() &&
                                          (p.status === 'PENDENTE' || p.status === 'PENDENTE_BANCO')
                                            ? 'EXPIRADO'
                                            : p.status.replace('_', ' ')}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {isActive && (
                                    <div className="flex gap-2 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleDecisaoCredito(p.id, 'REJEITADO')}
                                        className="px-3.5 py-2 rounded-full border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-medium transition-all cursor-pointer"
                                      >
                                        Reprovar
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDecisaoCredito(p.id, 'APROVADO')}
                                        className="px-4 py-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-500 text-xs font-semibold transition-all cursor-pointer"
                                      >
                                        Liberar Crédito
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
