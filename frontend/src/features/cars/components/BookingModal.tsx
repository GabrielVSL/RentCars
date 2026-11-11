'use client';

import { PremiumDatePicker } from '@/components/ui/PremiumDatePicker';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Gauge, Info, Loader2, AlertTriangle, CheckCircle2, RotateCcw, LogIn } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { startOfDay, format } from 'date-fns';
import { api } from '@/services/api';
import { toast } from '@/store/useToastStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { resolveStudioCarImage } from '@/lib/carPresentation';

export interface Automovel {
    id: number;
    matricula: string;
    marca: string;
    modelo: string;
    ano: number;
    placa: string;
    imageUrl?: string;
    precoPorDia?: number;
    potenciaCv?: number;
    aceleracao0a100?: string;
    velocidadeMaxima?: string;
    categoria?: string;
    ativoBox?: boolean;
    circuito?: {
        id: string;
        nome: string;
        pais?: string;
    };
}

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    car: Automovel | null;
}

const CIRCUIT_META_BY_ID: Record<string, { circuit: string; flag: string; code: string }> = {
    nurburgring: { circuit: 'Nürburgring Nordschleife', flag: '🇩🇪', code: 'NBR-GRN' },
    spa: { circuit: 'Spa-Francorchamps', flag: '🇧🇪', code: 'SPA-EAU' },
    monza: { circuit: 'Autodromo Nazionale Monza', flag: '🇮🇹', code: 'MNZ-PAR' },
    monaco: { circuit: 'Circuit de Monaco', flag: '🇲🇨', code: 'MCO-GP' },
    le_mans: { circuit: 'Circuit de la Sarthe (Le Mans)', flag: '🇫🇷', code: 'LMS-24' },
    silverstone: { circuit: 'Silverstone Circuit', flag: '🇬🇧', code: 'SLV-UK' },
    interlagos: { circuit: 'Autódromo de Interlagos', flag: '🇧🇷', code: 'INT-SP' },
    suzuka: { circuit: 'Suzuka International', flag: '🇯🇵', code: 'SZK-JP' },
};

function getCarCircuitInfo(car: Automovel) {
    if (car.circuito?.id && CIRCUIT_META_BY_ID[car.circuito.id]) {
        return CIRCUIT_META_BY_ID[car.circuito.id];
    }
    const m = `${car.modelo} ${car.marca}`.toLowerCase();
    if (m.includes('cayman') || m.includes('gt4')) return CIRCUIT_META_BY_ID.monaco;
    if (m.includes('gt3') || m.includes('porsche')) return CIRCUIT_META_BY_ID.nurburgring;
    if (m.includes('m8')) return CIRCUIT_META_BY_ID.le_mans;
    if (m.includes('m4') || m.includes('bmw')) return CIRCUIT_META_BY_ID.spa;
    if (m.includes('black series')) return CIRCUIT_META_BY_ID.silverstone;
    if (m.includes('amg') || m.includes('mercedes')) return CIRCUIT_META_BY_ID.monza;
    if (m.includes('e-tron') || m.includes('etron')) return CIRCUIT_META_BY_ID.suzuka;
    return CIRCUIT_META_BY_ID.interlagos;





}

export function BookingModal({ isOpen, onClose, car }: BookingModalProps) {
    const { user, token } = useAuthStore();
    const { setAuthView } = useUIStore();
    const { formatPrice } = useCurrencyStore();
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

    // Validação anti-conflito inteligente com bloqueio de overbooking
    const handleRangeSelect = (newRange: DateRange | undefined) => {
        setConflictError(null);

        if (newRange?.from && newRange?.to) {
            const hasConflict = datasOcupadas.some(ocupado => {
                return newRange.from! <= ocupado.to && newRange.to! >= ocupado.from;
            });

            if (hasConflict) {
                setConflictError("A janela selecionada engloba baterias de pista já reservadas. Escolha outras datas.");
                setRange({ from: newRange.from, to: undefined });
                return;
            }
        }

        setRange(newRange);
    };

    const confirmBooking = async () => {
        if (!range?.from || !range?.to || !car) return;

        // Validação de autenticação imediata e amigável
        if (!token || !user) {
            toast.info("Você precisa estar conectado para realizar uma reserva. Faça login ou crie sua conta!");
            onClose();
            setAuthView('login');
            return;
        }

        if (user.role !== 'CLIENTE') {
            toast.error("Apenas clientes podem solicitar reservas de veículos. Faça login com uma conta de Cliente.");
            return;
        }

        try {
            setIsSubmitting(true);
            const diffDays = Math.ceil((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24));
            const valorCalculado = diffDays > 0 ? diffDays * (car.precoPorDia || 0) : 0;

            const payload = {
                automovel: { id: car.id },
                dataInicio: `${range.from.getFullYear()}-${String(range.from.getMonth() + 1).padStart(2, '0')}-${String(range.from.getDate()).padStart(2, '0')}T00:00:00`,
                dataFim: `${range.to.getFullYear()}-${String(range.to.getMonth() + 1).padStart(2, '0')}-${String(range.to.getDate()).padStart(2, '0')}T23:59:59`,
                valorTotal: valorCalculado
            };

            await api.post('/api/pedidos', payload);
            toast.success("Sessão de pista solicitada com sucesso! Aguarde a avaliação da locadora e agente de crédito.");
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.response?.data || "Erro ao realizar pedido.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!car) return null;

    const circuitInfo = getCarCircuitInfo(car);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/85 backdrop-blur-md" />

                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-5xl bg-[#0D0F15] border border-white/15 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col md:flex-row max-h-[92vh] text-white"
                    >
                        {/* Lado Esquerdo: Detalhes e Foto do Carro */}
                        <div className="flex-1 bg-[#08090C] p-8 md:p-10 flex flex-col justify-between relative overflow-y-auto custom-scrollbar border-b md:border-b-0 md:border-r border-white/10">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-mono font-bold text-[#FF1717] uppercase tracking-widest bg-[#FF1717]/10 px-2.5 py-0.5 rounded-full border border-[#FF1717]/30">
                                        ● {circuitInfo.code}
                                    </span>
                                    <span className="text-xs font-mono text-white/50">{circuitInfo.flag} {circuitInfo.circuit}</span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black font-sans tracking-tight text-white">{car.modelo}</h2>
                                <p className="text-xs font-mono text-white/40 uppercase tracking-widest">{car.marca} · Homologação FIA</p>
                            </div>

                            {/* Moldura de Veículo de Pista */}
                            <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl border border-white/10 my-6 relative group bg-gradient-to-b from-[#181B24] to-[#0A0B0E] p-4 flex items-center justify-center">
                                {car.imageUrl ? (
                                    <img 
                                        src={resolveStudioCarImage(car)} 
                                        alt={car.modelo} 
                                        className="w-full h-full object-contain filter drop-shadow-[0_15px_20px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-500" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-black/40 text-white/30 font-mono text-xs">
                                        TELEMETRY VIEW
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 font-mono">
                                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 flex items-center gap-3">
                                    <ShieldCheck className="text-[#FF1717] shrink-0" size={22} />
                                    <div>
                                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Franquia</p>
                                        <p className="font-bold text-white text-xs">Cobertura de Pista</p>
                                    </div>
                                </div>
                                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 flex items-center gap-3">
                                    <Gauge className="text-white shrink-0" size={22} />
                                    <div>
                                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Diária Base</p>
                                        <p className="font-bold text-[#FF1717] text-xs">{formatPrice(car.precoPorDia)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lado Direito: Calendário & Reserva */}
                        <div className="flex-[1.2] p-8 md:p-10 overflow-y-auto custom-scrollbar flex flex-col bg-[#0D0F15]">
                            <div className="mb-4">
                                <h3 className="text-xl md:text-2xl font-black font-sans tracking-tight text-white uppercase">Selecione as Datas da Bateria</h3>
                                <p className="text-white/50 text-xs font-mono mt-1">Sessões cronometradas no {circuitInfo.circuit}</p>
                            </div>

                            {/* Guia Visual do Processo de 2 Cliques */}
                            <div className="mb-4 p-3.5 rounded-2xl flex items-center justify-between text-xs font-mono transition-all bg-black/50 border border-white/10">
                                {!range?.from ? (
                                    <span className="text-white/60 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[#FF1717] animate-ping" />
                                        Passo 1: Clique no dia de <strong className="text-white">retirada / início</strong>
                                    </span>
                                ) : !range?.to ? (
                                    <span className="text-[#FF1717] flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[#FF1717] animate-pulse" />
                                        Início: <strong>{format(range.from, "dd/MM/yyyy")}</strong> — Clique no término
                                    </span>
                                ) : (
                                    <div className="flex items-center justify-between w-full">
                                        <span className="text-white flex items-center gap-2">
                                            <CheckCircle2 size={16} className="text-[#FF1717]" />
                                            Bateria: <strong className="text-[#FF1717]">{format(range.from, "dd/MM")}</strong> até <strong className="text-[#FF1717]">{format(range.to, "dd/MM")}</strong> ({Math.max(1, Math.ceil((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24)))} {Math.max(1, Math.ceil((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24))) === 1 ? 'diária' : 'diárias'})
                                        </span>
                                        <button 
                                            type="button" 
                                            onClick={() => { setRange(undefined); setConflictError(null); }} 
                                            className="text-xs text-white/50 hover:text-white font-bold flex items-center gap-1 hover:underline transition-colors ml-2 cursor-pointer"
                                        >
                                            <RotateCcw size={12} /> Trocar
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Calendário */}
                            <div className="mx-auto bg-black/40 p-4 rounded-3xl border border-white/10 shadow-inner w-full flex flex-col items-center">
                                <PremiumDatePicker
                                    range={range}
                                    setRange={handleRangeSelect}
                                    disabled={isDayDisabled}
                                    bookedDates={datasOcupadas} 
                                />
                                
                                {/* LEGENDA */}
                                <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-white/10 w-full text-[10px] font-mono">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
                                        <span className="text-white/50 uppercase">Livre</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#FF1717]"></div>
                                        <span className="text-[#FF1717] font-bold uppercase">Selecionado</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-white/10 line-through text-white/30 flex items-center justify-center text-[8px]">✕</div>
                                        <span className="text-white/30 uppercase">Em Pista</span>
                                    </div>
                                </div>
                            </div>

                            {/* Alerta de Conflito Inline */}
                            <AnimatePresence>
                                {conflictError && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-3">
                                        <div className="p-3.5 bg-rose-950/60 border border-rose-500/40 rounded-2xl flex items-start gap-2.5">
                                            <AlertTriangle className="text-rose-400 shrink-0 mt-0.5" size={16} />
                                            <p className="text-xs font-mono text-rose-300">{conflictError}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Resumo Financeiro */}
                            <div className="mt-auto pt-6">
                                {range?.from && range?.to ? (
                                    (() => {
                                        const diffDays = Math.ceil((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24));

                                        if (diffDays > 0) {
                                            const total = diffDays * (car.precoPorDia || 0);
                                            return (
                                                <div className="bg-black/60 border border-white/15 p-5 rounded-2xl flex justify-between items-center text-white shadow-2xl mb-4 font-mono">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Cálculo de Sessão</p>
                                                        <p className="text-xs text-white/80">{diffDays} {diffDays === 1 ? 'diária' : 'diárias'} x {formatPrice(car.precoPorDia)}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-bold text-[#FF1717] uppercase tracking-widest mb-0.5">Total</p>
                                                        <p className="text-2xl font-black text-[#FF1717]">{formatPrice(total)}</p>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className="mb-4 p-3 bg-rose-950/40 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-mono flex items-center gap-2">
                                                <Info size={16} /> O término deve ser posterior ao início da sessão.
                                            </div>
                                        );
                                    })()
                                ) : (
                                    <div className="mb-4 p-3.5 bg-white/5 border border-white/10 rounded-2xl text-xs font-mono text-white/60 flex items-start gap-2.5">
                                        <Info size={16} className="shrink-0 mt-0.5 text-[#FF1717]" />
                                        <p>Selecione as datas para calcular a sessão com telemetria e apólice de pista.</p>
                                    </div>
                                )}

                                {!user && (
                                    <div className="mb-4 p-3.5 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3 text-amber-200 font-mono">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="text-amber-400 shrink-0" size={16} />
                                            <p className="text-xs">
                                                Faça login para emitir a credencial da reserva.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onClose();
                                                setAuthView('login');
                                            }}
                                            className="px-3 py-1 bg-amber-500 text-black rounded-lg text-xs font-bold hover:bg-amber-400 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                                        >
                                            <LogIn size={12} /> Entrar
                                        </button>
                                    </div>
                                )}

                                <div className="flex gap-3 font-mono">
                                    <button 
                                        type="button" 
                                        onClick={onClose} 
                                        className="flex-1 py-3.5 text-white/60 font-bold hover:bg-white/5 rounded-2xl transition-colors text-xs uppercase tracking-wider cursor-pointer"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={confirmBooking}
                                        disabled={isSubmitting || !range?.from || !range?.to || diffDaysValidation(range) <= 0}
                                        className="flex-[2] bg-[#FF1717] hover:bg-white disabled:bg-white/10 disabled:text-white/30 text-white hover:text-black font-black py-3.5 rounded-2xl transition-all shadow-[0_0_20px_rgba(255,23,23,0.4)] flex items-center justify-center gap-2 text-xs uppercase tracking-widest cursor-pointer"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="animate-spin text-white" size={16} />
                                        ) : !user ? (
                                            <>
                                                <LogIn size={16} /> Fazer Login para Reservar
                                            </>
                                        ) : (
                                            'Emitir Credencial de Pista'
                                        )}
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

function diffDaysValidation(range: DateRange | undefined) {
    if (!range?.from || !range?.to) return 0;
    return Math.ceil((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24));
}
