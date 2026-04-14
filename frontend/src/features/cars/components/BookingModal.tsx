'use client';

import { PremiumDatePicker } from '@/components/ui/PremiumDatePicker';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Car, Info, Loader2, AlertTriangle } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { startOfDay } from 'date-fns';
import { api } from '@/services/api';

export interface Automovel {
    id: number;
    matricula: string;
    marca: string;
    modelo: string;
    ano: number;
    placa: string;
    imageUrl?: string;
    precoPorDia?: number;
}

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    car: Automovel | null;
}

export function BookingModal({ isOpen, onClose, car }: BookingModalProps) {
    const [range, setRange] = useState<DateRange | undefined>();
    const [datasOcupadas, setDatasOcupadas] = useState<{ from: Date, to: Date }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [conflictError, setConflictError] = useState<string | null>(null);

    // Busca os dias bloqueados ignorando o fuso horário (Timezone Fix)
    useEffect(() => {
        if (!isOpen || !car) return;

        setRange(undefined);
        setConflictError(null);

        const fetchOcupacao = async () => {
            try {
                const response = await api.get(`/api/pedidos/ocupados/${car.id}`).catch(() => ({ data: [] }));
                
                const formatadas = response.data.map((d: any) => {
                    const fromDate = d.from.split('T')[0];
                    const toDate = d.to.split('T')[0];
                    return {
                        from: new Date(fromDate + 'T00:00:00'),
                        to: new Date(toDate + 'T23:59:59')
                    };
                });
                
                // ESSE LOG VAI SALVAR A NOSSA VIDA:
                console.log("Datas bloqueadas recebidas do Java:", formatadas);
                
                setDatasOcupadas(formatadas);
            } catch (error) {
                console.error("Erro ao buscar datas ocupadas");
            }
        };
        fetchOcupacao();
    }, [isOpen, car]);

    // Função que pinta os dias de cinza no calendário
    const isDayDisabled = (day: Date) => {
        const hoje = startOfDay(new Date());
        if (day < hoje) return true;
        
        return datasOcupadas.some(intervalo =>
            day >= intervalo.from && day <= intervalo.to
        );
    };

    // A MÁGICA ANTI-OVERLAP: Impede o usuário de selecionar passando por cima de um dia alugado
    const handleRangeSelect = (newRange: DateRange | undefined) => {
        setConflictError(null);

        if (newRange?.from && newRange?.to) {
            const hasConflict = datasOcupadas.some(ocupado => {
                // Checa se o intervalo escolhido "engole" algum dia ocupado
                return newRange.from! <= ocupado.to && newRange.to! >= ocupado.from;
            });

            if (hasConflict) {
                setConflictError("As datas selecionadas conflitam com uma reserva existente. Escolha um período livre.");
                setRange({ from: newRange.from, to: undefined }); // Deixa só o primeiro clique
                return;
            }
        }
        setRange(newRange);
    };

    const confirmBooking = async () => {
        if (!range?.from || !range?.to || !car) return;

        try {
            setIsSubmitting(true);
            const diffDays = Math.ceil((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24));
            const valorCalculado = diffDays > 0 ? diffDays * (car.precoPorDia || 0) : 0;

            const payload = {
                automovel: { id: car.id },
                dataInicio: range.from.toISOString(),
                dataFim: range.to.toISOString(),
                valorTotal: valorCalculado
            };

            await api.post('/api/pedidos', payload);
            alert("Pedido realizado com sucesso! Aguarde a avaliação da empresa.");
            onClose();
        } catch (error: any) {
            alert(error.response?.data || "Erro ao realizar pedido.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!car) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                    >
                        {/* Lado Esquerdo: Detalhes do Carro */}
                        <div className="flex-1 bg-[#F5F5F7] p-10 flex flex-col justify-center relative overflow-y-auto custom-scrollbar">
                            <div className="absolute top-10 left-10">
                                <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">{car.marca}</p>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{car.modelo}</h2>
                            </div>

                            <img src={car.imageUrl || ''} alt={car.modelo} className="w-full max-w-md mx-auto drop-shadow-2xl my-20 object-contain" />

                            <div className="grid grid-cols-2 gap-4 mt-auto">
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3"><ShieldCheck className="text-emerald-500" size={24} /><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seguro</p><p className="font-bold text-slate-900 text-sm">Proteção Total</p></div></div>
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3"><Car className="text-blue-500" size={24} /><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ano</p><p className="font-bold text-slate-900 text-sm">{car.ano}</p></div></div>
                            </div>
                        </div>

                        {/* Lado Direito: Calendário */}
                        <div className="flex-[1.2] p-10 overflow-y-auto custom-scrollbar flex flex-col bg-white">
                            <div className="mb-6">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Selecione as datas</h3>
                                <p className="text-slate-500 font-medium mt-1">Sua jornada com o {car.modelo} começa quando?</p>
                            </div>

                            <div className="mx-auto bg-slate-50/50 p-6 pb-4 rounded-[32px] border border-slate-100 shadow-inner w-full">
                                <div className="flex justify-center">
                                    <PremiumDatePicker
                                        range={range}
                                        setRange={handleRangeSelect}
                                        disabled={isDayDisabled}
                                        bookedDates={datasOcupadas} 
                                    />
                                </div>
                                
                                {/* LEGENDA VISUAL */}
                                <div className="flex items-center justify-center gap-8 mt-6 pt-6 border-t border-slate-200/60">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-5 h-5 rounded-full bg-white border-2 border-slate-200 shadow-sm"></div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Livre</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                                            <div className="w-full h-px bg-slate-400 transform rotate-45 scale-150"></div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reservado</span>
                                    </div>
                                </div>
                            </div>

                            {/* Alerta de Conflito Inline */}
                            <AnimatePresence>
                                {conflictError && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-4">
                                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3">
                                            <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={18} />
                                            <p className="text-sm font-bold text-rose-700">{conflictError}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Resumo Financeiro */}
                            <div className="mt-auto pt-6">
                                {range?.from && range?.to ? (
                                    (() => {
                                        const diffDays = Math.ceil((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24));
                                        const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

                                        if (diffDays > 0) {
                                            const total = diffDays * (car.precoPorDia || 0);
                                            return (
                                                <div className="bg-slate-900 p-6 rounded-3xl flex justify-between items-center text-white shadow-xl shadow-slate-900/20 mb-6">
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Resumo</p>
                                                        <p className="font-medium">{diffDays} {diffDays === 1 ? 'diária' : 'diárias'} x {formatCurrency(car.precoPorDia || 0)}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">Total</p>
                                                        <p className="text-3xl font-black">{formatCurrency(total)}</p>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold flex items-center gap-2">
                                                <Info size={18} /> A devolução deve ser posterior à retirada.
                                            </div>
                                        );
                                    })()
                                ) : (
                                    <div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-sm font-medium text-blue-800 flex items-start gap-3">
                                        <Info size={20} className="shrink-0 mt-0.5 text-blue-600" />
                                        <p>Selecione a data de <strong>Retirada</strong> e <strong>Devolução</strong> no calendário acima para calcular o valor do aluguel.</p>
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <button onClick={onClose} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-colors">Cancelar</button>
                                    <button
                                        onClick={confirmBooking}
                                        disabled={isSubmitting || !range?.from || !range?.to || diffDaysValidation(range) <= 0}
                                        className="flex-[2] bg-blue-600 disabled:bg-slate-300 disabled:shadow-none hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirmar Reserva'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// Função auxiliar de validação (para o botão)
function diffDaysValidation(range: DateRange | undefined) {
    if (!range?.from || !range?.to) return 0;
    return Math.ceil((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24));
}