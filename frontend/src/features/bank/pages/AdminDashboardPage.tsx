'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Users,
  CalendarCheck,
  AlertTriangle,
  Percent,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  XCircle,
  Server,
  RefreshCw,
} from 'lucide-react';
import { api } from '@/services/api';
import { toast } from '@/store/useToastStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';

interface AdminClientItem {
  id: number;
  nome: string;
  email: string;
  cnhNumero?: string;
  saldoCarteira: number;
  totalDepositadoHistorico: number;
  tierFidelidade: string;
  porcentagemDesconto: number;
  statusFinanceiro: string;
  inadimplente: boolean;
}

interface AdminBookingItem {
  id: number;
  trackingCode: string;
  clienteNome: string;
  clienteEmail: string;
  clienteInadimplente: boolean;
  automovelNome: string;
  circuitoNome: string;
  slotData: string;
  slotTurno: string;
  tipoServico: string;
  valorTotal: number;
  descontoFidelidade: number;
  valorFinal: number;
  valorSinistro: number;
  motivoSinistro?: string;
  formaPagamento?: string;
  pagamentoStatus?: string;
  status: string;
}

interface AdminDashboardData {
  faturamentoTotalBRL: number;
  faturamentoConfirmadoBRL: number;
  faturamentoPendenteBRL: number;
  lucroLiquidoEstimadoBRL: number;
  totalDescontosConcedidosBRL: number;
  totalSinistrosCobradosBRL: number;
  totalJurosRecebidosBRL: number;
  totalSessoesAgendadas: number;
  sessoesConfirmadas: number;
  sessoesPendentes: number;
  faturamentoPorCircuito: Record<string, number>;
  ocupacaoBoxesPorAutodromo: Record<
    string,
    { circuitoNome: string; totalVagas: number; totalOcupadas: number; taxaOcupacaoPercentual: number }
  >;
  supercarrosMaisPilotados: Record<string, number>;
  metricasApexPay: {
    totalPilotosCadastrados: number;
    pilotosInadimplentes: number;
    pilotosEmDia: number;
    pilotosVipApexBlack: number;
    saldoTotalCustodiadoBRL: number;
    dividaAtivaTotalBRL: number;
  };
  clientes: AdminClientItem[];
  agendamentos: AdminBookingItem[];
  saudeMensageriaQueue: {
    motor: string;
    status: string;
    tamanhoFilaAtual: number;
    tamanhoDlqAtual: number;
    totalEnfileiradas: number;
    totalSucessos: number;
    totalFalhas: number;
    totalDlq: number;
    dlqNome: string;
  };
}

export default function AdminDashboardPage() {
  const { formatPrice } = useCurrencyStore();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'clientes' | 'agendamentos' | 'infra'>('clientes');
  const [clientFilter, setClientFilter] = useState<'TODOS' | 'DEVEDORES' | 'EM_DIA'>('TODOS');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Modal de lançamento de sinistro/franquia em cima de uma sessão
  const [sinistroModalBooking, setSinistroModalBooking] = useState<AdminBookingItem | null>(null);
  const [sinistroValor, setSinistroValor] = useState('4500');
  const [sinistroMotivo, setSinistroMotivo] = useState('Avaria em para-choque / caixa de brita');

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/api/admin/dashboard');
      setData(res.data);
    } catch {
      toast.error('Erro ao carregar dados do Painel Executivo Admin.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleApplyInterest = async (clientId: number) => {
    try {
      setProcessingId(`interest-${clientId}`);
      await api.post(`/api/admin/clientes/${clientId}/aplicar-juros`, {});
      toast.success('Juros diários (0,1%) aplicados sobre o saldo devedor!');
      await loadDashboard();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao aplicar juros.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleEvaluateBooking = async (bookingId: number, status: 'APROVADO' | 'REJEITADO') => {
    try {
      setProcessingId(`eval-${bookingId}`);
      await api.put(`/api/pedidos/${bookingId}/avaliar?status=${status}`);
      toast.success(`Sessão ${status === 'APROVADO' ? 'homologada' : 'rejeitada'} com sucesso!`);
      await loadDashboard();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao atualizar status da sessão.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleLaunchSinistro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sinistroModalBooking) return;
    try {
      setProcessingId(`sinistro-${sinistroModalBooking.id}`);
      await api.post(`/api/admin/pedidos/${sinistroModalBooking.id}/sinistro`, {
        valor: Number(sinistroValor),
        motivo: sinistroMotivo,
      });
      toast.success('Franquia de sinistro lançada na carteira ApexPay do piloto!');
      setSinistroModalBooking(null);
      await loadDashboard();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao lançar sinistro.');
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#08090C]">
        <Loader2 className="animate-spin text-[#FF1717]" size={34} />
      </div>
    );
  }

  const filteredClients = (data.clientes || []).filter((c) => {
    if (clientFilter === 'DEVEDORES') return c.inadimplente;
    if (clientFilter === 'EM_DIA') return !c.inadimplente;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#08090C] text-white pt-28 pb-24 px-4 sm:px-6 selection:bg-[#FF1717] selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Executivo */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#FF1717] mb-2">
              Race Control & Financeiro · Acesso Administrativo
            </p>
            <h1 className="text-3xl sm:text-5xl font-medium tracking-tight text-white">
              Painel Executivo Apex
            </h1>
            <p className="text-sm text-white/60 mt-2">
              Acompanhamento em tempo real de lucro operacional, sessões agendadas, inadimplência ApexPay e infraestrutura.
            </p>
          </div>
          <button
            type="button"
            onClick={loadDashboard}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-medium cursor-pointer transition-colors"
          >
            <RefreshCw size={14} />
            <span>Atualizar Métricas</span>
          </button>
        </header>

        {/* Grid de KPIs Financeiros & Operacionais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white/[0.025] border border-white/10">
            <div className="flex items-center justify-between text-xs text-white/50 mb-2">
              <span>Lucro Líquido Estimado</span>
              <TrendingUp size={15} className="text-emerald-400" />
            </div>
            <p className="text-2xl font-semibold text-white tabular-nums">
              {formatPrice(data.lucroLiquidoEstimadoBRL)}
            </p>
            <p className="text-[11px] font-mono text-white/45 mt-1">
              Receita confirmada: {formatPrice(data.faturamentoConfirmadoBRL)}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.025] border border-white/10">
            <div className="flex items-center justify-between text-xs text-white/50 mb-2">
              <span>Sessões & Agendamentos</span>
              <CalendarCheck size={15} className="text-[#FF1717]" />
            </div>
            <p className="text-2xl font-semibold text-white tabular-nums">
              {data.totalSessoesAgendadas}
            </p>
            <p className="text-[11px] font-mono text-white/45 mt-1">
              {data.sessoesConfirmadas} confirmadas · {data.sessoesPendentes} pendentes
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.025] border border-white/10">
            <div className="flex items-center justify-between text-xs text-white/50 mb-2">
              <span>Dívida Ativa (Devedores)</span>
              <AlertTriangle size={15} className="text-rose-400" />
            </div>
            <p className="text-2xl font-semibold text-rose-400 tabular-nums">
              {formatPrice(data.metricasApexPay.dividaAtivaTotalBRL)}
            </p>
            <p className="text-[11px] font-mono text-white/45 mt-1">
              {data.metricasApexPay.pilotosInadimplentes} inadimplente(s) · {data.metricasApexPay.pilotosEmDia} em dia
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.025] border border-white/10">
            <div className="flex items-center justify-between text-xs text-white/50 mb-2">
              <span>Custódia ApexPay</span>
              <Users size={15} className="text-white/70" />
            </div>
            <p className="text-2xl font-semibold text-white tabular-nums">
              {formatPrice(data.metricasApexPay.saldoTotalCustodiadoBRL)}
            </p>
            <p className="text-[11px] font-mono text-white/45 mt-1">
              {data.metricasApexPay.totalPilotosCadastrados} pilotos · Juros: {formatPrice(data.totalJurosRecebidosBRL)}
            </p>
          </div>
        </div>

        {/* Navegação de Abas */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
          {[
            { id: 'clientes', label: `Clientes & Devedores (${data.clientes.length})` },
            { id: 'agendamentos', label: `Agendamentos & Sinistros (${data.agendamentos.length})` },
            { id: 'infra', label: 'Autódromos, Boxes & Fila' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                activeTab === tab.id
                  ? 'bg-[#FF1717] text-white border-[#FF1717]'
                  : 'bg-white/[0.03] text-white/65 border-white/10 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: CLIENTES & INADIMPLÊNCIA */}
        {activeTab === 'clientes' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                {(['TODOS', 'DEVEDORES', 'EM_DIA'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setClientFilter(f)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono cursor-pointer border transition-colors ${
                      clientFilter === f
                        ? 'bg-white text-[#08090C] border-white font-semibold'
                        : 'bg-white/[0.03] text-white/60 border-white/10 hover:text-white'
                    }`}
                  >
                    {f === 'TODOS' ? 'Todos' : f === 'DEVEDORES' ? 'Inadimplentes' : 'Em dia'}
                  </button>
                ))}
              </div>
              <span className="text-xs font-mono text-white/45">
                {filteredClients.length} registro(s)
              </span>
            </div>

            {filteredClients.length === 0 ? (
              <div className="p-12 rounded-2xl bg-white/[0.02] border border-white/10 text-center text-sm text-white/55">
                Nenhum cliente encontrado para o filtro atual. Novos clientes aparecerão aqui assim que se cadastrarem pela plataforma.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.015]">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 text-white/50 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Piloto</th>
                      <th className="py-3.5 px-4">Tier Fidelidade</th>
                      <th className="py-3.5 px-4">Depositado Histórico</th>
                      <th className="py-3.5 px-4">Saldo Atual</th>
                      <th className="py-3.5 px-4">Situação</th>
                      <th className="py-3.5 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {filteredClients.map((c) => (
                      <tr key={c.id} className="hover:bg-white/[0.02]">
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-white">{c.nome}</p>
                          <p className="text-[11px] text-white/45 font-mono">{c.email}</p>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {c.tierFidelidade} ({c.porcentagemDesconto}% off)
                        </td>
                        <td className="py-3.5 px-4 font-mono text-white/80">
                          {formatPrice(c.totalDepositadoHistorico)}
                        </td>
                        <td
                          className={`py-3.5 px-4 font-mono font-semibold ${
                            c.saldoCarteira < 0 ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {formatPrice(c.saldoCarteira)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${
                              c.inadimplente
                                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            }`}
                          >
                            {c.statusFinanceiro}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {c.inadimplente ? (
                            <button
                              type="button"
                              disabled={processingId === `interest-${c.id}`}
                              onClick={() => handleApplyInterest(c.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/40 text-rose-200 text-[11px] font-medium cursor-pointer transition-colors"
                            >
                              <Percent size={12} />
                              <span>Aplicar Juros (0,1%)</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-white/35 font-mono">Sem pendências</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AGENDAMENTOS & SINISTROS */}
        {activeTab === 'agendamentos' && (
          <div className="space-y-4">
            {data.agendamentos.length === 0 ? (
              <div className="p-12 rounded-2xl bg-white/[0.02] border border-white/10 text-center text-sm text-white/55">
                Nenhuma sessão agendada ainda. Quando os pilotos reservarem sessões nas pistas ou frota, tudo aparecerá aqui.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.015]">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 text-white/50 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Protocolo / Piloto</th>
                      <th className="py-3.5 px-4">Circuito · Carro</th>
                      <th className="py-3.5 px-4">Data / Turno</th>
                      <th className="py-3.5 px-4">Valor / Sinistro</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Controles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {data.agendamentos.map((b) => (
                      <tr key={b.id} className="hover:bg-white/[0.02]">
                        <td className="py-3.5 px-4">
                          <p className="font-mono text-[#FF1717] font-semibold">{b.trackingCode}</p>
                          <p className="font-medium text-white mt-0.5">{b.clienteNome}</p>
                          <p className="text-[11px] text-white/45 font-mono">{b.clienteEmail}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-white">{b.circuitoNome}</p>
                          <p className="text-[11px] text-white/55">{b.automovelNome} · {b.tipoServico}</p>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <p>{b.slotData}</p>
                          <p className="text-[11px] text-white/50">{b.slotTurno}</p>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <p className="text-white font-semibold">{formatPrice(b.valorFinal)}</p>
                          {b.valorSinistro > 0 && (
                            <p className="text-[11px] text-rose-400">
                              Sinistro: +{formatPrice(b.valorSinistro)}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-white">
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {(b.status === 'PENDENTE_EMPRESA' || b.status === 'PENDENTE_BANCO') && (
                            <>
                              <button
                                type="button"
                                disabled={processingId === `eval-${b.id}`}
                                onClick={() => handleEvaluateBooking(b.id, 'APROVADO')}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 text-[11px] cursor-pointer"
                              >
                                <CheckCircle2 size={12} /> Aprovar
                              </button>
                              <button
                                type="button"
                                disabled={processingId === `eval-${b.id}`}
                                onClick={() => handleEvaluateBooking(b.id, 'REJEITADO')}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 text-[11px] cursor-pointer"
                              >
                                <XCircle size={12} /> Rejeitar
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => setSinistroModalBooking(b)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-[11px] cursor-pointer"
                            title="Cobrar franquia por avaria / colisão"
                          >
                            <ShieldAlert size={12} /> Lançar Sinistro
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AUTÓDROMOS, BOXES & FILA */}
        {activeTab === 'infra' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <h3 className="text-base font-medium text-white">Ocupação de Boxes por Autódromo</h3>
              <div className="space-y-3">
                {Object.entries(data.ocupacaoBoxesPorAutodromo || {}).map(([id, info]) => (
                  <div key={id} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/85">{info.circuitoNome}</span>
                      <span className="font-mono text-white/55">
                        {info.totalOcupadas}/{info.totalVagas} vagas ({info.taxaOcupacaoPercentual}%)
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-[#FF1717]"
                        style={{ width: `${Math.min(100, info.taxaOcupacaoPercentual)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-white flex items-center gap-2">
                  <Server size={16} className="text-[#FF1717]" /> Mensageria & Virtual Threads Queue
                </h3>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {data.saudeMensageriaQueue.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-white/45 text-[10px]">Processadas com Sucesso</p>
                  <p className="text-lg text-white mt-0.5">{data.saudeMensageriaQueue.totalSucessos}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-white/45 text-[10px]">Dead Letter Queue ({data.saudeMensageriaQueue.dlqNome})</p>
                  <p className="text-lg text-rose-400 mt-0.5">{data.saudeMensageriaQueue.tamanhoDlqAtual}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Lançamento de Sinistro / Franquia */}
      {sinistroModalBooking && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setSinistroModalBooking(null)}
        >
          <form
            onSubmit={handleLaunchSinistro}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md p-6 rounded-3xl bg-[#0D0F15] border border-white/15 space-y-4"
          >
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <ShieldAlert size={18} className="text-rose-400" />
              Lançar Franquia / Sinistro em Pista
            </h3>
            <p className="text-xs text-white/60">
              Piloto: <strong className="text-white">{sinistroModalBooking.clienteNome}</strong> ({sinistroModalBooking.trackingCode}). O valor será debitado diretamente na carteira ApexPay (negativando e bloqueando novas reservas caso exceda o saldo).
            </p>
            <div>
              <label className="text-[11px] text-white/60 block mb-1">Valor da Franquia (R$)</label>
              <input
                type="number"
                min="1"
                step="50"
                required
                value={sinistroValor}
                onChange={(e) => setSinistroValor(e.target.value)}
                className="w-full bg-white/5 border border-white/15 focus:border-[#FF1717] px-3.5 py-2.5 rounded-xl text-sm text-white outline-none font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-white/60 block mb-1">Ocorrência / Motivo</label>
              <input
                type="text"
                required
                value={sinistroMotivo}
                onChange={(e) => setSinistroMotivo(e.target.value)}
                className="w-full bg-white/5 border border-white/15 focus:border-[#FF1717] px-3.5 py-2.5 rounded-xl text-xs text-white outline-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSinistroModalBooking(null)}
                className="flex-1 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={processingId === `sinistro-${sinistroModalBooking.id}`}
                className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer"
              >
                Cobrar Franquia
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
