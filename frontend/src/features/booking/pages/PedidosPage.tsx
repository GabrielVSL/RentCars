'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, XCircle, Clock, Calendar, 
  User, CarFront, Loader2, X, ChevronRight, FileText, Edit3, Send
} from 'lucide-react';
import { api } from '@/services/api';

interface Pedido {
  id: number;
  cliente: { nome: string; email: string; cpf?: string; profissao?: string };
  automovel: { marca: string; modelo: string; placa: string; matricula: string; imageUrl?: string };
  dataInicio: string;
  dataFim: string;
  status: 'PENDENTE_EMPRESA' | 'APROVADO' | 'REJEITADO' | 'CANCELADO' | 'REVISAO_CLIENTE';
  dataPedido: string;
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'TODOS' | 'PENDENTE_EMPRESA' | 'APROVADO' | 'REVISAO_CLIENTE'>('TODOS');
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Estados para o Modo de Edição (Contraproposta)
  const [isEditing, setIsEditing] = useState(false);
  const [editDates, setEditDates] = useState({ start: '', end: '' });

  const fetchPedidos = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/pedidos');
      setPedidos(response.data);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPedidos(); }, []);

  // Prepara as datas quando um pedido é selecionado
  useEffect(() => {
    if (pedidoSelecionado) {
      // Formata a data ISO para o formato aceito pelo input datetime-local (YYYY-MM-DDThh:mm)
      setEditDates({
        start: new Date(pedidoSelecionado.dataInicio).toISOString().slice(0, 16),
        end: new Date(pedidoSelecionado.dataFim).toISOString().slice(0, 16)
      });
      setIsEditing(false); // Sempre reseta o modo de edição ao abrir outro pedido
    }
  }, [pedidoSelecionado]);

  const handleDecisao = async (id: number, novoStatus: 'APROVADO' | 'REJEITADO') => {
    try {
      setIsProcessing(true);
      await api.put(`/api/pedidos/${id}/avaliar?status=${novoStatus}`);
      atualizarEstadoLocal(id, novoStatus);
    } catch (error) {
      alert("Erro ao processar decisão.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEnviarContraproposta = async () => {
    if (!pedidoSelecionado) return;
    try {
      setIsProcessing(true);
      const payload = {
        dataInicio: new Date(editDates.start).toISOString(),
        dataFim: new Date(editDates.end).toISOString()
      };
      
      await api.put(`/api/pedidos/${pedidoSelecionado.id}/modificar`, payload);
      
      // Atualiza a lista e o painel com as novas datas e o novo status
      setPedidos(prev => prev.map(p => p.id === pedidoSelecionado.id ? { ...p, status: 'REVISAO_CLIENTE', dataInicio: payload.dataInicio, dataFim: payload.dataFim } : p));
      setPedidoSelecionado(prev => prev ? { ...prev, status: 'REVISAO_CLIENTE', dataInicio: payload.dataInicio, dataFim: payload.dataFim } : null);
      setIsEditing(false);
    } catch (error) {
      alert("Erro ao enviar contraproposta.");
    } finally {
      setIsProcessing(false);
    }
  };

  const atualizarEstadoLocal = (id: number, novoStatus: Pedido['status']) => {
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, status: novoStatus } : p));
    if (pedidoSelecionado?.id === id) {
      setPedidoSelecionado(prev => prev ? { ...prev, status: novoStatus } : null);
    }
  };

  const pedidosFiltrados = pedidos.filter(p => filter === 'TODOS' || p.status === filter);

  return (
    <div className="min-h-screen bg-slate-50/50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestão de Pedidos</h1>
            <p className="text-slate-500 mt-1">Analise contratos, aprove ou sugira novas datas.</p>
          </div>

          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
            {['TODOS', 'PENDENTE_EMPRESA', 'REVISAO_CLIENTE', 'APROVADO'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${filter === f ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {f === 'REVISAO_CLIENTE' ? 'Em Revisão' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </header>

        {/* ... (O meio do código com a lista de cards não mudou. Mantive igual para focar no Slide-over) ... */}
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-[32px] p-20 text-center">
            <Clock size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-900">Nenhum pedido encontrado</h3>
            <p className="text-slate-500">A fila de avaliações está vazia no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {pedidosFiltrados.map((pedido) => (
                <motion.div
                  key={pedido.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setPedidoSelecionado(pedido)}
                  className="group bg-white border border-slate-200 hover:border-blue-300 rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col"
                >
                  <div className="aspect-video w-full bg-slate-100 relative overflow-hidden">
                    {pedido.automovel.imageUrl ? (
                      <img src={pedido.automovel.imageUrl} alt={pedido.automovel.modelo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><CarFront size={40} className="text-slate-300" /></div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                        pedido.status === 'PENDENTE_EMPRESA' ? 'bg-amber-100 text-amber-700' :
                        pedido.status === 'REVISAO_CLIENTE' ? 'bg-purple-100 text-purple-700' :
                        pedido.status === 'APROVADO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {pedido.status === 'REVISAO_CLIENTE' ? 'AGUARDANDO CLIENTE' : pedido.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{pedido.automovel.modelo}</h3>
                    <p className="text-sm text-slate-500 mb-4">{pedido.cliente.nome}</p>
                    
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                        <Calendar size={16} className="text-slate-400" />
                        {new Date(pedido.dataInicio).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-blue-600 group-hover:translate-x-1 transition-transform">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* PAINEL LATERAL DE DETALHES COM MODO EDIÇÃO */}
      <AnimatePresence>
        {pedidoSelecionado && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPedidoSelecionado(null)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col overflow-hidden">
              
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText size={20} className="text-blue-600" /> Detalhes do Contrato
                </h2>
                <button onClick={() => setPedidoSelecionado(null)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
                <div className="aspect-video w-full bg-slate-100 rounded-2xl overflow-hidden relative shadow-inner">
                  {pedidoSelecionado.automovel.imageUrl ? (
                    <img src={pedidoSelecionado.automovel.imageUrl} alt="Carro" className="w-full h-full object-cover" />
                  ) : <div className="w-full h-full flex items-center justify-center"><CarFront size={48} className="text-slate-300" /></div>}
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Veículo Solicitado</p>
                  <h3 className="text-2xl font-bold text-slate-900">{pedidoSelecionado.automovel.modelo}</h3>
                  <p className="text-slate-600 font-medium mt-1">{pedidoSelecionado.automovel.marca} • Placa: {pedidoSelecionado.automovel.placa}</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Dados do Cliente</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm"><User size={18} /></div>
                    <div>
                      <p className="font-bold text-slate-900">{pedidoSelecionado.cliente.nome}</p>
                      <p className="text-sm text-slate-500">{pedidoSelecionado.cliente.email}</p>
                    </div>
                  </div>
                </div>

                {/* Bloco de Datas: Alterna entre Leitura e Edição */}
                <div className={`rounded-2xl p-5 border transition-colors ${isEditing ? 'bg-amber-50/50 border-amber-200' : 'bg-blue-50/50 border-blue-100'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isEditing ? 'text-amber-600' : 'text-blue-500'}`}>Período do Aluguel</p>
                    {!isEditing && pedidoSelecionado.status === 'PENDENTE_EMPRESA' && (
                      <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        <Edit3 size={12} /> Sugerir Novas Datas
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Retirada</label>
                      {isEditing ? (
                        <input type="datetime-local" value={editDates.start} onChange={e => setEditDates({...editDates, start: e.target.value})} className="w-full bg-white border border-amber-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
                      ) : (
                        <p className="font-bold text-slate-900">{new Date(pedidoSelecionado.dataInicio).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Devolução</label>
                      {isEditing ? (
                        <input type="datetime-local" value={editDates.end} onChange={e => setEditDates({...editDates, end: e.target.value})} className="w-full bg-white border border-amber-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
                      ) : (
                        <p className="font-bold text-slate-900">{new Date(pedidoSelecionado.dataFim).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Dinâmico */}
              <div className="p-6 border-t border-slate-100 bg-white shrink-0">
                {isEditing ? (
                  <div className="flex gap-3">
                    <button onClick={() => setIsEditing(false)} className="flex-1 py-3.5 px-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancelar</button>
                    <button onClick={handleEnviarContraproposta} disabled={isProcessing} className="flex-[2] py-3.5 px-4 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2">
                      {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18} /> Enviar Contraproposta</>}
                    </button>
                  </div>
                ) : pedidoSelecionado.status === 'PENDENTE_EMPRESA' ? (
                  <div className="flex gap-3">
                    <button onClick={() => handleDecisao(pedidoSelecionado.id, 'REJEITADO')} disabled={isProcessing} className="flex-1 py-3.5 px-4 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"><XCircle className="mx-auto" size={20} /></button>
                    <button onClick={() => handleDecisao(pedidoSelecionado.id, 'APROVADO')} disabled={isProcessing} className="flex-[3] py-3.5 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                      {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <><CheckCircle2 size={18} /> Aprovar Original</>}
                    </button>
                  </div>
                ) : (
                  <div className={`w-full py-4 rounded-xl font-bold text-center flex items-center justify-center gap-2 ${
                    pedidoSelecionado.status === 'APROVADO' ? 'bg-green-50 text-green-600' : 
                    pedidoSelecionado.status === 'REVISAO_CLIENTE' ? 'bg-purple-50 text-purple-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {pedidoSelecionado.status === 'REVISAO_CLIENTE' ? <Clock size={20} /> : pedidoSelecionado.status === 'APROVADO' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    {pedidoSelecionado.status === 'REVISAO_CLIENTE' ? 'AGUARDANDO CLIENTE' : `PEDIDO ${pedidoSelecionado.status}`}
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