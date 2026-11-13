'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
  ArrowUpRight,
  Wallet,
  CarFront,
  FileCheck2,
  ShieldCheck,
  Trophy,
  MapPin,
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

  // Modal de crédito / ajuste de saldo na carteira de um piloto
  const [creditModalClient, setCreditModalClient] = useState<AdminClientItem | null>(null);
  const [creditValor, setCreditValor] = useState('5000');
  const [creditDescricao, setCreditDescricao] = useState('Ajuste Administrativo Apex');

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

  const handleCreditBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditModalClient) return;
    const valorNum = Number(creditValor);
    if (!valorNum || valorNum <= 0) {
      toast.error('Informe um valor válido maior que zero.');
      return;
    }
    try {
      setProcessingId(`credit-${creditModalClient.id}`);
      await api.post('/api/apexpay/deposito', {
        email: creditModalClient.email,
        valor: valorNum,
        descricao: creditDescricao.trim() || 'Ajuste Administrativo Apex',
      });
      toast.success(`Crédito de ${formatPrice(valorNum)} lançado para ${creditModalClient.nome}!`);
      setCreditModalClient(null);
      await loadDashboard();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao creditar saldo do piloto.');
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

        {/* Barra de Atalhos Executivos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/pedidos"
            className="group p-4 rounded-2xl bg-[#11131A] hover:bg-white/[0.04] border border-white/[0.08] hover:border-[#FF1717]/40 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FF1717]/15 border border-[#FF1717]/30 flex items-center justify-center text-[#FF1717]">
                <FileCheck2 size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Gestão de Sessões</p>
                <p className="text-xs text-white/50">Aprovar, rejeitar ou propor horários</p>
              </div>
            </div>
            <ArrowUpRight size={16} className="text-white/40 group-hover:text-[#FF1717] transition-colors" />
          </Link>

          <Link
            to="/frota"
            className="group p-4 rounded-2xl bg-[#11131A] hover:bg-white/[0.04] border border-white/[0.08] hover:border-[#FF1717]/40 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white">
                <CarFront size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Controle de Boxes & Frota</p>
                <p className="text-xs text-white/50">Cadastrar, editar telemetria e tarifas</p>
              </div>
            </div>
            <ArrowUpRight size={16} className="text-white/40 group-hover:text-[#FF1717] transition-colors" />
          </Link>

          <Link
            to="/analises"
            className="group p-4 rounded-2xl bg-[#11131A] hover:bg-white/[0.04] border border-white/[0.08] hover:border-[#FF1717]/40 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Auditoria de Risco & Score</p>
                <p className="text-xs text-white/50">Análise financeira e histórico por CPF</p>
              </div>
            </div>
            <ArrowUpRight size={16} className="text-white/40 group-hover:text-[#FF1717] transition-colors" />
          </Link>
        </div>

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
                        <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCreditModalClient(c);
                              setCreditValor('5000');
                              setCreditDescricao('Ajuste Administrativo Apex');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium cursor-pointer transition-colors"
                          >
                            <Wallet size={12} />
                            <span>Creditar Saldo</span>
                          </button>
                          {c.inadimplente && (
                            <button
                              type="button"
                              disabled={processingId === `interest-${c.id}`}
                              onClick={() => handleApplyInterest(c.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/40 text-rose-200 text-[11px] font-medium cursor-pointer transition-colors"
                            >
                              <Percent size={12} />
                              <span>Aplicar Juros (0,1%)</span>
                            </button>
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
            <div className="p-6 rounded-2xl bg-[#11131A] border border-white/[0.08] space-y-4">
              <h3 className="text-base font-medium text-white flex items-center gap-2">
                <MapPin size={16} className="text-[#FF1717]" /> Faturamento por Autódromo
              </h3>
              {Object.keys(data.faturamentoPorCircuito || {}).length === 0 ? (
                <p className="text-xs text-white/45 py-4">Ainda não há faturamento registrado por circuito.</p>
              ) : (
                <div className="space-y-3">
                  {(() => {
                    const entries = Object.entries(data.faturamentoPorCircuito || {}).sort((a, b) => Number(b[1]) - Number(a[1]));
                    const maxVal = Math.max(...entries.map(([, val]) => Number(val) || 0), 1);
                    return entries.map(([circuito, valor]) => (
                      <div key={circuito} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/85 truncate pr-2">{circuito}</span>
                          <span className="font-mono text-white font-semibold shrink-0">{formatPrice(Number(valor) || 0)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-[#FF1717] rounded-full"
                            style={{ width: `${Math.min(100, Math.round(((Number(valor) || 0) / maxVal) * 100))}%` }}
                          />
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>

            <div className="p-6 rounded-2xl bg-[#11131A] border border-white/[0.08] space-y-4">
              <h3 className="text-base font-medium text-white flex items-center gap-2">
                <Trophy size={16} className="text-[#FF1717]" /> Supercarros Mais Pilotados
              </h3>
              {Object.keys(data.supercarrosMaisPilotados || {}).length === 0 ? (
                <p className="text-xs text-white/45 py-4">Ainda não há sessões suficientes para o ranking da frota.</p>
              ) : (
                <div className="space-y-3">
                  {(() => {
                    const entries = Object.entries(data.supercarrosMaisPilotados || {}).sort((a, b) => Number(b[1]) - Number(a[1]));
                    const maxCount = Math.max(...entries.map(([, count]) => Number(count) || 0), 1);
                    return entries.map(([modelo, count]) => (
                      <div key={modelo} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/85 truncate pr-2">{modelo}</span>
                          <span className="font-mono text-white/75 shrink-0">{count} sessão(ões)</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-full"
                            style={{ width: `${Math.min(100, Math.round(((Number(count) || 0) / maxCount) * 100))}%` }}
                          />
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>

            <div className="p-6 rounded-2xl bg-[#11131A] border border-white/[0.08] space-y-4">
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

            <div className="p-6 rounded-2xl bg-[#11131A] border border-white/[0.08] space-y-4">
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

      {/* Modal de Crédito / Ajuste de Saldo Administrativo */}
      {creditModalClient && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setCreditModalClient(null)}
        >
          <form
            onSubmit={handleCreditBalance}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md p-6 rounded-3xl bg-[#0D0F15] border border-white/15 space-y-4"
          >
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Wallet size={18} className="text-emerald-400" />
              Creditar Saldo ApexPay
            </h3>
            <p className="text-xs text-white/60">
              Piloto: <strong className="text-white">{creditModalClient.nome}</strong> ({creditModalClient.email}). Saldo atual:{' '}
              <span className={creditModalClient.saldoCarteira < 0 ? 'text-rose-400 font-mono' : 'text-emerald-400 font-mono'}>
                {formatPrice(creditModalClient.saldoCarteira)}
              </span>
            </p>
            <div>
              <label className="text-[11px] text-white/60 block mb-1">Valor do Crédito (R$)</label>
              <input
                type="number"
                min="1"
                step="50"
                required
                value={creditValor}
                onChange={(e) => setCreditValor(e.target.value)}
                className="w-full bg-white/5 border border-white/15 focus:border-[#FF1717] px-3.5 py-2.5 rounded-xl text-sm text-white outline-none font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-white/60 block mb-1">Descrição / Motivo</label>
              <input
                type="text"
                required
                value={creditDescricao}
                onChange={(e) => setCreditDescricao(e.target.value)}
                className="w-full bg-white/5 border border-white/15 focus:border-[#FF1717] px-3.5 py-2.5 rounded-xl text-xs text-white outline-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCreditModalClient(null)}
                className="flex-1 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={processingId === `credit-${creditModalClient.id}`}
                className="flex-1 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
              >
                Confirmar Crédito
              </button>
            </div>
          </form>
        </div>
      )}

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
