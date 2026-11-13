'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldAlert,
  Sparkles,
  Loader2,
  CheckCircle2,
  KeyRound,
  AlertTriangle,
} from 'lucide-react';
import { api } from '@/services/api';
import { toast } from '@/store/useToastStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';

interface WalletSummary {
  usuarioId: number;
  nome: string;
  email: string;
  saldoCarteira: number;
  totalDepositadoHistorico: number;
  statusFinanceiro: string;
  inadimplente: boolean;
  tierFidelidade: string;
  porcentagemDesconto: number;
}

interface TransactionItem {
  id: number;
  tipo: 'DEPOSITO' | 'DEBITO_RESERVA' | 'JUROS_ATRASO' | 'SINISTRO_PISTA' | 'ESTORNO' | string;
  valor: number;
  dataHora: string;
  descricao: string;
  trackingReserva?: string;
}

const TIER_MILESTONES = [
  { name: 'BRONZE', label: 'Bronze', threshold: 0, discount: '0%' },
  { name: 'SILVER', label: 'Silver', threshold: 10000, discount: '5%' },
  { name: 'GOLD', label: 'Gold', threshold: 25000, discount: '10%' },
  { name: 'APEX_BLACK', label: 'Apex Black', threshold: 50000, discount: '15%' },
];

export default function ApexPayPage() {
  const { formatPrice } = useCurrencyStore();
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [extrato, setExtrato] = useState<TransactionItem[]>([]);
  const [cnh, setCnh] = useState('');
  const [dob, setDob] = useState('1995-05-15');
  const [depositAmount, setDepositAmount] = useState('5000');
  const [isLoading, setIsLoading] = useState(true);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isSavingCnh, setIsSavingCnh] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [saldoRes, extratoRes, perfilRes] = await Promise.all([
        api.get('/api/apexpay/saldo'),
        api.get('/api/apexpay/extrato'),
        api.get('/api/usuarios/me').catch(() => ({ data: null })),
      ]);
      setWallet(saldoRes.data);
      setExtrato(Array.isArray(extratoRes.data) ? extratoRes.data : []);
      if (perfilRes.data?.cnhNumero) setCnh(perfilRes.data.cnhNumero);
      if (perfilRes.data?.dataNascimento) setDob(perfilRes.data.dataNascimento);
    } catch {
      toast.error('Erro ao carregar dados da sua carteira ApexPay.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeposit = async (valorCustom?: number) => {
    const val = valorCustom ?? Number(depositAmount);
    if (!val || val <= 0) {
      toast.error('Informe um valor válido maior que zero.');
      return;
    }

    try {
      setIsDepositing(true);
      await api.post('/api/apexpay/deposito', {
        valor: val,
        descricao: wallet?.inadimplente ? 'Quitação de Débito / Recarga ApexPay' : 'Recarga de Carteira ApexPay',
      });
      toast.success(`Depósito de ${formatPrice(val)} creditado com sucesso!`);
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao realizar depósito.');
    } finally {
      setIsDepositing(false);
    }
  };

  const handleSaveCnh = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingCnh(true);
      await api.put('/api/usuarios/me/habilitacao', {
        cnhNumero: cnh,
        cnhCategoria: 'B',
        dataNascimento: dob,
      });
      toast.success('Habilitação validada e vinculada ao perfil de piloto!');
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'CNH inválida no algoritmo Módulo 11.');
    } finally {
      setIsSavingCnh(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#08090C]">
        <Loader2 className="animate-spin text-[#FF1717]" size={34} />
      </div>
    );
  }

  const totalDep = wallet?.totalDepositadoHistorico || 0;
  const nextMilestone = TIER_MILESTONES.find((m) => totalDep < m.threshold) || null;
  const progressPercent = nextMilestone
    ? Math.min(100, Math.round((totalDep / nextMilestone.threshold) * 100))
    : 100;

  return (
    <div className="min-h-screen bg-[#08090C] text-white pt-28 pb-24 px-4 sm:px-6 selection:bg-[#FF1717] selection:text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#FF1717] mb-2">
              ApexPay · Carteira & Fidelidade de Pista
            </p>
            <h1 className="text-3xl sm:text-5xl font-medium tracking-tight text-white">
              Minha Carteira ApexPay
            </h1>
            <p className="text-sm text-white/60 mt-2 max-w-2xl">
              Gerencie seu saldo, acompanhe o nível de desconto automático por depósitos acumulados e valide sua CNH para liberar experiências de pilotagem.
            </p>
          </div>
        </header>

        {/* Alerta de Inadimplência */}
        {wallet?.inadimplente && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-rose-400 shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="text-sm font-semibold text-rose-200">
                  Conta com Pendência Financeira ({formatPrice(wallet.saldoCarteira)})
                </h3>
                <p className="text-xs text-rose-300/80 mt-1">
                  Novos agendamentos estão bloqueados e juros diários de 0,1% incidem sobre o valor devedor até a quitação total via depósito.
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={isDepositing}
              onClick={() => handleDeposit(Math.abs(wallet.saldoCarteira))}
              className="shrink-0 bg-rose-500 hover:bg-rose-400 text-white text-xs font-semibold px-5 py-2.5 rounded-full cursor-pointer transition-colors"
            >
              Quitar Dívida ({formatPrice(Math.abs(wallet.saldoCarteira))})
            </button>
          </motion.div>
        )}

        {/* Grade Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Coluna Esquerda: Saldo + Depósito + CNH */}
          <div className="lg:col-span-5 space-y-6">
            {/* Card Saldo & Tier */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#141720] via-[#0D0F15] to-[#08090C] border border-white/10 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-widest text-white/50 flex items-center gap-2">
                  <Wallet size={14} className="text-[#FF1717]" /> Saldo Disponível
                </span>
                <span
                  className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${
                    wallet?.inadimplente
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {wallet?.inadimplente ? 'INADIMPLENTE' : 'REGULAR'}
                </span>
              </div>

              <div>
                <p
                  className={`text-4xl font-semibold tracking-tight tabular-nums ${
                    (wallet?.saldoCarteira || 0) < 0 ? 'text-rose-400' : 'text-white'
                  }`}
                >
                  {formatPrice(wallet?.saldoCarteira || 0)}
                </p>
                <p className="text-xs text-white/50 font-mono mt-1.5">
                  Depositado no histórico: {formatPrice(totalDep)}
                </p>
              </div>

              {/* Barra de Progresso de Tier */}
              <div className="pt-4 border-t border-white/10 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/70 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-[#FF1717]" />
                    Nível <strong className="text-white">{wallet?.tierFidelidade}</strong>
                  </span>
                  <span className="font-mono text-[#FF1717] font-semibold">
                    {wallet?.porcentagemDesconto || 0}% desconto ativo
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-[#FF1717] rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-white/45 font-mono">
                  {nextMilestone
                    ? `Faltam ${formatPrice(nextMilestone.threshold - totalDep)} em depósitos para ${nextMilestone.label} (${nextMilestone.discount} off)`
                    : 'Você atingiu o nível máximo Apex Black (15% off permanente)!'}
                </p>
              </div>
            </div>

            {/* Realizar Depósito */}
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
              <h2 className="text-base font-medium text-white">Realizar Depósito / Recarga</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[1000, 5000, 15000, 30000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setDepositAmount(String(v))}
                    className={`py-2 px-2 rounded-xl text-xs font-mono border transition-all cursor-pointer ${
                      depositAmount === String(v)
                        ? 'border-[#FF1717] bg-[#FF1717]/15 text-white'
                        : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/25'
                    }`}
                  >
                    +{(v / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  step="100"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/15 focus:border-[#FF1717] px-4 py-2.5 rounded-xl text-sm text-white outline-none font-mono"
                  placeholder="Valor em R$"
                />
                <button
                  type="button"
                  disabled={isDepositing}
                  onClick={() => handleDeposit()}
                  className="bg-[#FF1717] hover:bg-[#e01414] disabled:opacity-50 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  {isDepositing ? 'Creditando...' : 'Depositar'}
                </button>
              </div>
            </div>

            {/* CNH & Elegibilidade de Pilotagem */}
            <form onSubmit={handleSaveCnh} className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-medium text-white flex items-center gap-2">
                  <KeyRound size={16} className="text-[#FF1717]" /> Habilitação de Pista (CNH)
                </h2>
                <button
                  type="button"
                  onClick={() => setCnh('52798802310')}
                  className="text-[10px] font-mono text-[#FF1717] hover:underline cursor-pointer"
                >
                  CNH Teste (52798802310)
                </button>
              </div>
              <p className="text-xs text-white/55">
                Validada matematicamente pelo algoritmo Módulo 11 (exigida apenas para pilotar; carona Fast Lap e Visita ao Box são isentos).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="CNH (11 dígitos)"
                  value={cnh}
                  onChange={(e) => setCnh(e.target.value)}
                  className="bg-white/5 border border-white/15 focus:border-[#FF1717] px-3.5 py-2.5 rounded-xl text-xs text-white outline-none font-mono"
                />
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="bg-white/5 border border-white/15 focus:border-[#FF1717] px-3.5 py-2.5 rounded-xl text-xs text-white outline-none font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={isSavingCnh}
                className="w-full bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-medium py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                {isSavingCnh ? 'Validando...' : 'Validar & Salvar CNH'}
              </button>
            </form>
          </div>

          {/* Coluna Direita: Extrato Contábil */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div>
                <h2 className="text-base font-medium text-white">Extrato de Movimentações</h2>
                <p className="text-xs text-white/50">Depósitos, sessões, juros e cobranças de franquia</p>
              </div>
              <span className="text-xs font-mono text-white/45">{extrato.length} lançamentos</span>
            </div>

            {extrato.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle2 size={28} className="text-white/25 mb-3" />
                <p className="text-sm text-white/60">Nenhuma movimentação registrada ainda.</p>
                <p className="text-xs text-white/40 mt-1">
                  Faça um depósito ao lado para começar a acumular descontos nos níveis ApexPay.
                </p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[540px] pr-1 custom-scrollbar">
                {extrato.map((item) => {
                  const isCredit = item.tipo === 'DEPOSITO' || item.tipo === 'ESTORNO';
                  const isWarning = item.tipo === 'JUROS_ATRASO' || item.tipo === 'SINISTRO_PISTA';
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isCredit
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : isWarning
                              ? 'bg-rose-500/15 text-rose-400'
                              : 'bg-white/10 text-white/75'
                          }`}
                        >
                          {isCredit ? (
                            <ArrowDownLeft size={16} />
                          ) : isWarning ? (
                            <ShieldAlert size={16} />
                          ) : (
                            <ArrowUpRight size={16} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate">{item.descricao}</p>
                          <p className="text-[10px] font-mono text-white/45 mt-0.5">
                            {item.tipo} · {new Date(item.dataHora).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-sm font-mono font-semibold tabular-nums ${
                            isCredit ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isCredit ? '+' : '-'}
                          {formatPrice(item.valor)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
