'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Star, ChevronRight, Loader2, Info, CheckCircle2 } from 'lucide-react';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';

interface Automovel {
    id: number;
    matricula: string;
    marca: string;
    modelo: string;
    ano: number;
    placa: string;
    imageUrl?: string;
}

export default function CarsPage() {
    const [carros, setCarros] = useState<Automovel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCar, setSelectedCar] = useState<Automovel | null>(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    // Estado para o Pedido
    const [dates, setDates] = useState({ start: '', end: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { user } = useAuthStore();
    const setAuthView = useUIStore((state) => state.setAuthView);

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const response = await api.get('/api/automoveis');
                setCarros(response.data);
            } catch (error) {
                console.error("Erro ao carregar carros:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCars();
    }, []);

    const handleBookingInit = (car: Automovel) => {
        if (!user) {
            setAuthView('login');
            return;
        }
        setSelectedCar(car);
        setIsBookingModalOpen(true);
    };

    const confirmBooking = async () => {
        if (!dates.start || !dates.end) {
            alert("Selecione as datas de retirada e devolução.");
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                automovel: { id: selectedCar?.id },
                dataInicio: new Date(dates.start).toISOString(),
                dataFim: new Date(dates.end).toISOString(),
            };

            await api.post('/api/pedidos', payload);
            alert("Pedido realizado com sucesso! Aguarde a avaliação da empresa.");
            setIsBookingModalOpen(false);
        } catch (error: any) {
            alert(error.response?.data || "Erro ao realizar pedido.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <header className="mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Frota Disponível</h1>
                    <p className="text-slate-500 mt-2 text-lg">Escolha o veículo perfeito para sua próxima jornada.</p>
                </header>

                {/* Grid de Carros */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {carros.map((carro, idx) => (
                        <motion.div
                            key={carro.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group bg-white rounded-[32px] overflow-hidden border border-slate-200/60 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500"
                        >
                            <div className="aspect-[16/10] relative overflow-hidden bg-slate-100">
                                {carro.imageUrl ? (
                                    <img src={carro.imageUrl} alt={carro.modelo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center"><CarFront size={48} className="text-slate-300" /></div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className="bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                        {carro.ano}
                                    </span>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">{carro.marca}</p>
                                        <h3 className="text-2xl font-bold text-slate-900">{carro.modelo}</h3>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 py-4 border-y border-slate-50 mb-6">
                                    <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                                        <MapPin size={14} /> BH, MG
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                                        <Star size={14} className="text-amber-400 fill-amber-400" /> 4.9
                                    </div>
                                </div>

                                {(!user || user.role === 'CLIENTE') && (
                                    <button
                                        onClick={() => handleBookingInit(carro)}
                                        className="w-full bg-slate-900 hover:bg-blue-600 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 group/btn"
                                    >
                                        Alugar Agora
                                        <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Modal de Reserva (O Coração do Sistema) */}
            <AnimatePresence>
                {isBookingModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBookingModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden p-10">

                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Calendar size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Confirmar Reserva</h2>
                                <p className="text-slate-500 mt-2">Você está alugando um <strong>{selectedCar?.modelo}</strong></p>
                            </div>

                            <div className="space-y-6 mb-10">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                                    {/* Input Retirada Premium */}
                                    <div className="group relative bg-slate-50 border border-slate-200 hover:border-blue-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 rounded-2xl p-3 transition-all">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Data de Retirada</label>
                                        <input
                                            type="datetime-local"
                                            value={dates.start}
                                            onChange={(e) => setDates({ ...dates, start: e.target.value })}
                                            className="w-full bg-transparent text-slate-900 font-medium text-sm outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                        />
                                    </div>

                                    {/* Input Devolução Premium */}
                                    <div className="group relative bg-slate-50 border border-slate-200 hover:border-blue-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 rounded-2xl p-3 transition-all">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Data de Devolução</label>
                                        <input
                                            type="datetime-local"
                                            value={dates.end}
                                            onChange={(e) => setDates({ ...dates, end: e.target.value })}
                                            className="w-full bg-transparent text-slate-900 font-medium text-sm outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                        />
                                    </div>

                                </div>

                                <div className="bg-blue-50/70 p-4 rounded-2xl flex gap-3 items-start border border-blue-100">
                                    <Info className="text-blue-600 shrink-0 mt-0.5" size={20} />
                                    <p className="text-sm text-blue-900/80 leading-relaxed font-medium">
                                        Seu pedido passará por uma <strong className="text-blue-700">análise financeira</strong> antes da aprovação do contrato.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => setIsBookingModalOpen(false)} className="flex-1 py-4 text-slate-500 font-semibold hover:bg-slate-50 rounded-2xl transition-colors">Cancelar</button>
                                <button
                                    onClick={confirmBooking}
                                    disabled={isSubmitting}
                                    className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirmar Pedido'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Sub-componente de ícone
function CarFront({ className, size }: { className?: string; size?: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
            <circle cx="7.5" cy="17.5" r="2.5" /><circle cx="16.5" cy="17.5" r="2.5" /><path d="M2 12h12" />
        </svg>
    );
}