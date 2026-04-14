'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, ShieldAlert, DollarSign, UserCircle,
  Activity, Loader2, CheckCircle2, XCircle, 
  History, AlertTriangle, ChevronDown, Clock
} from 'lucide-react';
import { api } from '@/services/api';

interface Pedido {
  id: number;
  cliente: { 
    nome: string; 
    cpf: string; 
    rendimentos: { valor: number; empregadora: string }[];
  };
  automovel: { modelo: string; placa: string };
  valorTotal: number;
  status: 'PENDENTE' | 'PENDENTE_EMPRESA' | 'PENDENTE_BANCO' | 'APROVADO' | 'REJEITADO' | 'CANCELADO';
  dataInicio: string;
  dataPedido: string;
}

export default function AnalisesPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalises = async () => {
      try {
        const response = await api.get('/api/pedidos');
        setPedidos(response.data);
      } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };
    fetchAnalises();
  }, []);

  // MOTOR DE SCORE: Inicia em 50 e flutua com base na matemática financeira
  const calcularScore = (historico: Pedido[], rendaTotal: number, valorAtual: number) => {
    let score = 50; // Base inicial

    // 1. Análise Comportamental (Histórico)
    historico.forEach(p => {
      if (p.status === 'APROVADO') score += 15;
      if (p.status === 'REJEITADO') score -= 20;
      if (p.status === 'CANCELADO') score -= 5;
    });

    // 2. Análise de Risco Financeiro (Comprometimento)
    if (rendaTotal > 0) {
      const comprometimento = valorAtual / rendaTotal;
      if (comprometimento > 0.6) score -= 30; // Mais de 60% da renda = Perigoso
      else if (comprometimento > 0.4) score -= 15;
      else if (comprometimento > 0.2) score -= 5;
    }

    // Trava os limites matemáticos
    score = Math.max(0, Math.min(100, score));

    // Retorna a classificação
    if (score >= 70) return { score, label: 'Score Alto', color: 'text-emerald-400 bg-emerald-400/10' };
    if (score >= 40) return { score, label: 'Score Médio', color: 'text-amber-400 bg-amber-400/10' };
    return { score, label: 'Score Crítico', color: 'text-rose-500 bg-rose-500/10' };
  };

  // AGRUPAMENTO E FILTRO: Separa o que está ativo do que expirou/histórico
  const analisePorCliente = useMemo(() => {
    const hoje = new Date();
    const grupos: Record<string, { cliente: Pedido['cliente'], historico: Pedido[], pAtivos: Pedido[] }> = {};

    pedidos.forEach(p => {
      if (!grupos[p.cliente.cpf]) {
        grupos[p.cliente.cpf] = { cliente: p.cliente, historico: [], pAtivos: [] };
      }

      // Aceita tanto PENDENTE_BANCO quanto o PENDENTE antigo (legado)
      const isPendente = p.status === 'PENDENTE_BANCO' || p.status === 'PENDENTE';
      const isExpirado = new Date(p.dataInicio) < hoje;

      // Se está pendente e a data não expirou, vai para a fila de aprovação
      if (isPendente && !isExpirado) {
        grupos[p.cliente.cpf].pAtivos.push(p);
      } else {
        // Se já foi aprovado, rejeitado, ou a data de retirar o carro já passou, vira apenas histórico
        grupos[p.cliente.cpf].historico.push(p);
      }
    });

    // Só exibe na tela os clientes que têm pelo menos 1 pedido ATIVO precisando de análise
    return Object.values(grupos).sort((a, b) => b.pAtivos.length - a.pAtivos.length);
  }, [pedidos]);

  const handleDecisaoCredito = async (id: number, status: 'APROVADO' | 'REJEITADO') => {
    try {
      await api.put(`/api/pedidos/${id}/avaliar?status=${status}`);
      // Atualiza o state local para refletir na hora
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    } catch (error) { alert("Erro na análise."); }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-slate-300 pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Activity className="text-blue-500" /> Auditoria de Crédito
          </h1>
          <p className="text-slate-500 mt-2">Pedidos com data expirada são arquivados automaticamente. Score base: 50 pts.</p>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
        ) : analisePorCliente.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-slate-800 border-dashed rounded-3xl bg-slate-900/20">
             <ShieldCheck size={48} className="text-slate-700 mb-4" />
             <h3 className="text-xl font-bold text-slate-400">Nenhuma análise pendente</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {analisePorCliente.map((grupo) => {
              // Pega o pedido mais recente para usar como base de valor
              const pAtivo = grupo.pAtivos[0] || grupo.historico[0];
              const rendaTotal = grupo.cliente.rendimentos?.reduce((s, r) => s + r.valor, 0) || 1;
              const valorPedido = pAtivo?.valorTotal || 0;
              const analiseScore = calcularScore(grupo.historico, rendaTotal, valorPedido);
              const totalAcoes = grupo.historico.length + grupo.pAtivos.length;

              return (
                <div key={grupo.cliente.cpf} className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden transition-all">
                  
                  {/* CABEÇALHO DO CLIENTE (Resumo) */}
                  <div className="p-6 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4 min-w-[250px] relative">
                      <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-slate-500">
                        <UserCircle size={24}/>
                      </div>
                      {/* O INDICADOR QUE VOCÊ PEDIU (Badge Vermelha se tiver múltiplos pedidos) */}
                      {totalAcoes > 1 && (
                         <div className="absolute -top-1 left-8 bg-blue-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0B0F1A]">
                            {totalAcoes}
                         </div>
                      )}
                      <div>
                        <h3 className="font-bold text-white">{grupo.cliente.nome}</h3>
                        <p className="text-xs font-mono text-slate-500">{grupo.cliente.cpf}</p>
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Renda Declarada</p>
                        <p className="text-emerald-400 font-bold text-sm">R$ {rendaTotal.toLocaleString('pt-BR')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Custo da Avaliação</p>
                        <p className="text-white font-bold text-sm">R$ {valorPedido.toLocaleString('pt-BR')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Score de Crédito</p>
                        <div className="flex items-center gap-2">
                           <span className={`text-sm font-black ${analiseScore.score >= 70 ? 'text-emerald-400' : analiseScore.score >= 40 ? 'text-amber-400' : 'text-rose-500'}`}>
                             {analiseScore.score}
                           </span>
                           <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${analiseScore.color}`}>{analiseScore.label}</span>
                        </div>
                      </div>
                    </div>

                    <button onClick={() => setExpandedClient(expandedClient === grupo.cliente.cpf ? null : grupo.cliente.cpf)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                      <ChevronDown className={`transition-transform ${expandedClient === grupo.cliente.cpf ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* CONTEÚDO EXPANSÍVEL (Detalhes Mapeados) */}
                  <AnimatePresence>
                    {expandedClient === grupo.cliente.cpf && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="border-t border-slate-800 bg-slate-900/60">
                        <div className="p-6 space-y-6">
                          
                          {/* Lista Completa (Ativos + Histórico) */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <History size={14} /> Cronologia Completa do CPF
                            </h4>
                            
                            {[...grupo.pAtivos, ...grupo.historico].map(p => {
                               const isActive = grupo.pAtivos.some(ativo => ativo.id === p.id);
                               const isLegado = p.status === 'PENDENTE'; // Trata o erro do PENDENTE antigo

                               return (
                                <div key={p.id} className={`flex items-center justify-between p-4 rounded-xl border ${isActive ? 'bg-blue-500/5 border-blue-500/20' : 'bg-slate-800/30 border-slate-700/50'}`}>
                                  <div className="flex items-center gap-6">
                                    <div>
                                      <p className="text-xs text-slate-500">Veículo</p>
                                      <p className="text-sm font-bold text-slate-300">{p.automovel.modelo}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500">Valor</p>
                                      <p className="text-sm font-bold text-white">R$ {p.valorTotal?.toLocaleString('pt-BR') || '---'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500">Situação</p>
                                      {isActive ? (
                                        <span className="text-[10px] font-black uppercase text-blue-400 animate-pulse">AGUARDANDO AUDITORIA</span>
                                      ) : (
                                        <span className={`text-[10px] font-black uppercase ${p.status === 'APROVADO' ? 'text-emerald-500' : p.status === 'REJEITADO' ? 'text-rose-500' : 'text-slate-500'}`}>
                                          {new Date(p.dataInicio) < new Date() && (p.status === 'PENDENTE' || p.status === 'PENDENTE_BANCO') ? 'EXPIRADO' : p.status.replace('_', ' ')}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Os botões voltam a aparecer! (E aceitam o PENDENTE antigo também) */}
                                  {isActive && (
                                    <div className="flex gap-2">
                                      <button onClick={() => handleDecisaoCredito(p.id, 'REJEITADO')} className="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white text-xs font-bold transition-all">Reprovar</button>
                                      <button onClick={() => handleDecisaoCredito(p.id, 'APROVADO')} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 text-xs font-bold transition-all">Liberar Crédito</button>
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