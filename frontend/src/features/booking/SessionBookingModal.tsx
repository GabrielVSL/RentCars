'use client';

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  ShieldCheck,
  Flag,
  Gauge,
  Sparkles,
  Wallet,
  AlertTriangle,
  Loader2,
  Fuel,
  LogIn,
  KeyRound,
  CalendarClock,
} from 'lucide-react';
import { api } from '@/services/api';
import { toast } from '@/store/useToastStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { resolveStudioCarImage, getCarDisplaySpecs } from '@/lib/carPresentation';
import { CIRCUITS } from '@/services/telemetryService';
import { CountryFlag } from '@/components/ui/CountryFlag';

export interface CircuitoRef {
  id: string;
  nome: string;
  pais?: string;
}

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
  circuito?: CircuitoRef;
  circuitosDisponiveis?: CircuitoRef[];
}

export interface TrackSlotItem {
  id: number;
  data: string; // YYYY-MM-DD
  turno: 'MANHA' | 'TARDE' | 'NOTURNO' | string;
  vagasTotais: number;
  vagasOcupadas: number;
  taxaAdicionalTurno: number;
}

export type ServiceType = 'VISITA_BOX' | 'FAST_LAP' | 'TRACK_EXPERIENCE' | 'PACOTE_VIP';

interface ServiceOption {
  id: ServiceType;
  title: string;
  badge?: string;
  description: string;
  multiplier: number;
  fixedPrice?: number;
  requiresCar: boolean;
  requiresCnh: boolean;
  icon: typeof Flag;
}

const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: 'VISITA_BOX',
    title: 'Visita ao Box & Paddock VIP',
    badge: 'Isento CNH',
    description: 'Tour guiado pelos boxes, telemetria ao vivo, lounge VIP e acesso ao pitlane.',
    multiplier: 0,
    fixedPrice: 890,
    requiresCar: false,
    requiresCnh: false,
    icon: ShieldCheck,
  },
  {
    id: 'FAST_LAP',
    title: 'Fast Lap (Carona c/ Piloto)',
    badge: 'Isento CNH',
    description: '2 voltas rápidas no banco do carona com piloto profissional levando o supercarro ao limite.',
    multiplier: 0.55,
    requiresCar: true,
    requiresCnh: false,
    icon: Flag,
  },
  {
    id: 'TRACK_EXPERIENCE',
    title: 'Track Experience (Pilotar)',
    badge: 'Mais Escolhido',
    description: 'Você no volante em bateria exclusiva com briefing técnico, rádio no capacete e VBOX.',
    multiplier: 1.0,
    requiresCar: true,
    requiresCnh: true,
    icon: Gauge,
  },
  {
    id: 'PACOTE_VIP',
    title: 'Pacote VIP Full Day',
    badge: 'Box Exclusivo',
    description: 'Experiência estendida de pista com telemetria 4K comentada, box privativo e suporte dedicado.',
    multiplier: 1.7,
    requiresCar: true,
    requiresCnh: true,
    icon: Sparkles,
  },
];

const CIRCUIT_COUNTRY_CODES: Record<string, string> = {
  nurburgring: 'DE',
  spa: 'BE',
  monza: 'IT',
  monaco: 'MC',
  le_mans: 'FR',
  silverstone: 'GB',
  interlagos: 'BR',
  suzuka: 'JP',
};

const TURNO_LABELS: Record<string, string> = {
  MANHA: 'Manhã · 08h–12h',
  TARDE: 'Tarde · 13h–17h',
  NOTURNO: 'Noturno · 19h–22h',
};

interface SessionBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCar?: Automovel | null;
  initialCircuitId?: string | null;
  circuitCars?: Automovel[];
  lockCircuit?: boolean;
  lockCar?: boolean;
}

interface UserProfile {
  saldoCarteira: number;
  tierFidelidade: string;
  porcentagemDesconto: number;
  inadimplente: boolean;
  cnhNumero?: string;
  dataNascimento?: string;
}

export function SessionBookingModal({
  isOpen,
  onClose,
  initialCar = null,
  initialCircuitId = null,
  circuitCars = [],
  lockCircuit = false,
  lockCar = false,
}: SessionBookingModalProps) {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const { formatPrice } = useCurrencyStore();

  const [selectedService, setSelectedService] = useState<ServiceType>('TRACK_EXPERIENCE');
  const [selectedCar, setSelectedCar] = useState<Automovel | null>(initialCar);
  const [selectedCircuitId, setSelectedCircuitId] = useState<string>(initialCircuitId || 'nurburgring');

  const [slots, setSlots] = useState<TrackSlotItem[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  const [formaPagamento, setFormaPagamento] = useState<'CARTEIRA_APEXPAY' | 'FATURA_APEXPAY'>('CARTEIRA_APEXPAY');
  const [cnhInput, setCnhInput] = useState('');
  const [dobInput, setDobInput] = useState('1995-05-15');
  const [perfil, setPerfil] = useState<UserProfile | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<{ trackingCode: string; status: string; valorFinal: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sincroniza carro e circuito iniciais ao abrir o modal
  useEffect(() => {
    if (!isOpen) return;
    setCreatedBooking(null);
    setErrorMsg(null);

    if (initialCar) {
      setSelectedCar(initialCar);
      const carCircuit =
        initialCircuitId ||
        initialCar.circuitosDisponiveis?.[0]?.id ||
        initialCar.circuito?.id ||
        'nurburgring';
      setSelectedCircuitId(carCircuit);
    } else if (initialCircuitId) {
      setSelectedCircuitId(initialCircuitId);
      setSelectedCar(circuitCars.length > 0 ? circuitCars[0] : null);
    }
  }, [isOpen, initialCar, initialCircuitId, circuitCars]);

  // Carrega perfil + saldo ApexPay se usuário estiver logado
  useEffect(() => {
    if (!isOpen || !token || !user) {
      setPerfil(null);
      return;
    }
    api
      .get('/api/usuarios/me')
      .then((res) => {
        setPerfil(res.data);
        if (res.data?.cnhNumero) setCnhInput(res.data.cnhNumero);
        if (res.data?.dataNascimento) setDobInput(res.data.dataNascimento);
      })
      .catch(() => setPerfil(null));
  }, [isOpen, token, user]);

  // Carrega os TrackSlots reais do circuito selecionado
  useEffect(() => {
    if (!isOpen || !selectedCircuitId) return;
    setLoadingSlots(true);
    api
      .get(`/api/slots/${selectedCircuitId}`)
      .then((res) => {
        const list: TrackSlotItem[] = Array.isArray(res.data) ? res.data : [];
        setSlots(list);
        if (list.length > 0) {
          const firstAvailable = list.find((s) => s.vagasOcupadas < s.vagasTotais) || list[0];
          setSelectedDate(firstAvailable.data);
          setSelectedSlotId(firstAvailable.id);
        } else {
          setSelectedDate('');
          setSelectedSlotId(null);
        }
      })
      .catch(() => {
        setSlots([]);
      })
      .finally(() => setLoadingSlots(false));
  }, [isOpen, selectedCircuitId]);

  const availableCircuitsForCar = useMemo(() => {
    if (lockCircuit || !selectedCar) {
      const found = CIRCUITS.find((c) => c.id === selectedCircuitId);
      return found ? [{ id: found.id, nome: found.name }] : [];
    }
    if (selectedCar.circuitosDisponiveis && selectedCar.circuitosDisponiveis.length > 0) {
      return selectedCar.circuitosDisponiveis;
    }
    if (selectedCar.circuito) {
      return [selectedCar.circuito];
    }
    return [{ id: 'nurburgring', nome: 'Nürburgring Nordschleife' }];
  }, [lockCircuit, selectedCar, selectedCircuitId]);

  const uniqueDates = useMemo(() => {
    const set = Array.from(new Set(slots.map((s) => s.data)));
    return set.slice(0, 7);
  }, [slots]);

  const slotsForSelectedDate = useMemo(() => {
    return slots.filter((s) => s.data === selectedDate);
  }, [slots, selectedDate]);

  const activeSlot = useMemo(
    () => slots.find((s) => s.id === selectedSlotId) || null,
    [slots, selectedSlotId]
  );

  const activeService = useMemo(
    () => SERVICE_OPTIONS.find((s) => s.id === selectedService) || SERVICE_OPTIONS[2],
    [selectedService]
  );

  const activeCircuitMeta = useMemo(
    () => CIRCUITS.find((c) => c.id === selectedCircuitId) || CIRCUITS[0],
    [selectedCircuitId]
  );

  const pricing = useMemo(() => {
    let base = 0;
    if (activeService.fixedPrice) {
      base = activeService.fixedPrice;
    } else if (selectedCar?.precoPorDia) {
      base = Number(selectedCar.precoPorDia) * activeService.multiplier;
    }
    const shiftFee = activeSlot?.taxaAdicionalTurno ? Number(activeSlot.taxaAdicionalTurno) : 0;
    const subtotal = Math.round((base + shiftFee) * 100) / 100;
    const discountPct = perfil?.porcentagemDesconto || 0;
    const discountVal = Math.round(subtotal * (discountPct / 100) * 100) / 100;
    const finalPrice = Math.max(0, Math.round((subtotal - discountVal) * 100) / 100);
    return { base, shiftFee, subtotal, discountPct, discountVal, finalPrice };
  }, [activeService, selectedCar, activeSlot, perfil]);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!token || !user) {
      toast.info('Faça login ou crie sua conta de piloto para concluir o agendamento.');
      onClose();
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    if (user.role !== 'CLIENTE') {
      setErrorMsg('Apenas contas de Piloto/Cliente podem agendar sessões. Crie uma conta de Cliente no menu Cadastrar-se.');
      return;
    }

    if (perfil?.inadimplente) {
      setErrorMsg('Sua conta ApexPay está inadimplente. Quite o débito na carteira antes de agendar novas sessões.');
      return;
    }

    if (!activeSlot) {
      setErrorMsg('Selecione uma data e turno disponíveis.');
      return;
    }

    if (activeService.requiresCar && !selectedCar) {
      setErrorMsg('Selecione o supercarro homologado para a sessão.');
      return;
    }

    if (activeService.requiresCnh && !cnhInput.trim() && !perfil?.cnhNumero) {
      setErrorMsg('Informe sua CNH (11 dígitos) para serviços de pilotagem ou use o atalho de homologação.');
      return;
    }

    try {
      setIsSubmitting(true);
      const startHour =
        activeSlot.turno === 'MANHA' ? '08:00:00' : activeSlot.turno === 'TARDE' ? '13:00:00' : '19:00:00';
      const endHour =
        activeSlot.turno === 'MANHA' ? '12:00:00' : activeSlot.turno === 'TARDE' ? '17:00:00' : '22:00:00';

      const payload: Record<string, unknown> = {
        tipoServico: selectedService,
        trackSlot: { id: activeSlot.id },
        dataInicio: `${activeSlot.data}T${startHour}`,
        dataFim: `${activeSlot.data}T${endHour}`,
        valorTotal: pricing.subtotal,
        formaPagamento,
      };

      if (activeService.requiresCar && selectedCar) {
        payload.automovel = { id: selectedCar.id };
      }

      if (activeService.requiresCnh) {
        if (cnhInput.trim()) payload.cnhInformada = cnhInput.trim();
        if (dobInput) payload.dataNascimentoInformada = dobInput;
      }

      const res = await api.post('/api/pedidos', payload);
      setCreatedBooking({
        trackingCode: res.data.trackingCode || 'APX-CONFIRMED',
        status: res.data.status,
        valorFinal: res.data.valorFinal ?? pricing.finalPrice,
      });
      toast.success('Sessão registrada no sistema!');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Não foi possível concluir o agendamento.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const carSpecs = selectedCar ? getCarDisplaySpecs(selectedCar) : null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md font-sans text-white"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl max-h-[92vh] bg-[#0B0D12] border border-white/10 rounded-3xl shadow-[0_25px_90px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col"
        >
          {/* Cabeçalho */}
          <div className="px-6 py-4 sm:py-5 border-b border-white/10 bg-[#08090C] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <CountryFlag
                countryCode={CIRCUIT_COUNTRY_CODES[selectedCircuitId] || 'DE'}
                className="w-6 h-4 rounded-sm shrink-0"
              />
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#FF1717]">
                  Arrive & Drive · Sessão Cronometrada
                </p>
                <h2 className="text-lg sm:text-xl font-medium text-white tracking-tight">
                  {activeCircuitMeta.name}
                  {selectedCar && activeService.requiresCar ? ` · ${selectedCar.marca} ${selectedCar.modelo}` : ''}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X size={16} />
            </button>
          </div>

          {/* Corpo com Scroll */}
          <div className="p-5 sm:p-7 overflow-y-auto custom-scrollbar flex-1 space-y-6">
            {createdBooking ? (
              <div className="py-10 text-center space-y-5 max-w-md mx-auto">
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <Check size={28} />
                </div>
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-emerald-400 mb-1">
                    Sessão Confirmada na Pista
                  </p>
                  <h3 className="text-2xl font-medium text-white tracking-tight">
                    Credencial Emitida!
                  </h3>
                  <p className="text-xs text-white/65 mt-2 leading-relaxed">
                    Seu supercarro estará abastecido e aquecido no box de{' '}
                    <strong className="text-white">{activeCircuitMeta.name}</strong> no turno selecionado.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-left space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-white/45">Protocolo</span>
                    <span className="text-white font-semibold">{createdBooking.trackingCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/45">Modalidade</span>
                    <span className="text-white">{activeService.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/45">Data / Turno</span>
                    <span className="text-emerald-400">
                      {activeSlot?.data.split('-').reverse().join('/')} · {activeSlot?.turno}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2">
                    <span className="text-white/45">Valor Final</span>
                    <span className="text-white font-bold">{formatPrice(createdBooking.valorFinal)}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate('/meus-alugueis');
                    }}
                    className="flex-1 bg-[#FF1717] hover:bg-[#e01414] text-white text-xs font-medium py-3 rounded-full cursor-pointer transition-colors"
                  >
                    Ver Minhas Sessões
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-medium py-3 rounded-full border border-white/10 cursor-pointer transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirm} className="space-y-6">
                {/* Faixa informativa rápida sobre o que está incluso */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5 rounded-xl bg-white/[0.025] border border-white/[0.07] text-[11px] text-white/65">
                  <span className="flex items-center gap-1.5">
                    <Fuel size={13} className="text-[#FF1717]" /> Gasolina 102 oct & Pneus Cup 2 R inclusos
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-emerald-400" /> Seguro Base de Pista + Telemetria VBOX
                  </span>
                </div>

                {/* Alerta de Inadimplência caso o piloto esteja com saldo negativo */}
                {perfil?.inadimplente && (
                  <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="text-rose-400 shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="text-xs font-semibold text-rose-200">
                          Conta ApexPay Inadimplente ({formatPrice(perfil.saldoCarteira)})
                        </p>
                        <p className="text-[11px] text-rose-300/80 mt-0.5">
                          Novas reservas ficam bloqueadas até a quitação do saldo devedor. Juros diários de 0,1% incidem sobre débitos vencidos.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate('/apexpay');
                      }}
                      className="shrink-0 bg-rose-500 hover:bg-rose-400 text-white text-xs font-medium px-4 py-2 rounded-full cursor-pointer transition-colors"
                    >
                      Quitar no ApexPay
                    </button>
                  </div>
                )}

                {/* 1. Escolha o Autódromo (quando aberto pela Frota, mostra os 3 circuitos onde o carro corre) */}
                {!lockCircuit && availableCircuitsForCar.length > 0 && (
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-white/55 block mb-2.5">
                      1. Autódromo Homologado para este Modelo ({availableCircuitsForCar.length} boxes)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {availableCircuitsForCar.map((c) => {
                        const isActive = c.id === selectedCircuitId;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setSelectedCircuitId(c.id)}
                            className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                              isActive
                                ? 'border-[#FF1717] bg-[#FF1717]/10 text-white'
                                : 'border-white/10 bg-white/[0.03] hover:border-white/25 text-white/70'
                            }`}
                          >
                            <CountryFlag
                              countryCode={CIRCUIT_COUNTRY_CODES[c.id] || 'DE'}
                              className="w-5 h-3.5 rounded-[2px] shrink-0"
                            />
                            <span className="text-xs font-medium truncate">{c.nome}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Escolha da Experiência / Modalidade */}
                <div>
                  <label className="text-[11px] font-mono uppercase tracking-wider text-white/55 block mb-2.5">
                    {lockCircuit ? '1.' : '2.'} Experiência na Bateria
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {SERVICE_OPTIONS.map((srv) => {
                      const isSelected = selectedService === srv.id;
                      const IconComp = srv.icon;
                      const estPrice = srv.fixedPrice
                        ? srv.fixedPrice
                        : selectedCar?.precoPorDia
                        ? Number(selectedCar.precoPorDia) * srv.multiplier
                        : 0;
                      return (
                        <button
                          key={srv.id}
                          type="button"
                          onClick={() => setSelectedService(srv.id)}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#FF1717] bg-[#FF1717]/10 ring-1 ring-[#FF1717]/40'
                              : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5 w-full">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                  isSelected ? 'bg-[#FF1717] text-white' : 'bg-white/10 text-white/60'
                                }`}
                              >
                                <IconComp size={14} />
                              </div>
                              <span className="text-xs font-medium text-white">{srv.title}</span>
                            </div>
                            {srv.badge && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/75 shrink-0">
                                {srv.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-white/60 leading-relaxed mb-2">{srv.description}</p>
                          <span className="text-[11px] font-mono text-[#FF1717] font-medium">
                            {estPrice > 0 ? formatPrice(estPrice) : 'Selecione um veículo'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Escolha do Supercarro no Box (quando aberto por /pistas e o serviço usa carro) */}
                {activeService.requiresCar && !lockCar && circuitCars.length > 0 && (
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-white/55 block mb-2.5">
                      2. Escolha o Supercarro do Box ({circuitCars.length} disponíveis)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {circuitCars.map((car) => {
                        const isCarSelected = selectedCar?.id === car.id;
                        const specs = getCarDisplaySpecs(car);
                        return (
                          <button
                            key={car.id}
                            type="button"
                            onClick={() => setSelectedCar(car)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isCarSelected
                                ? 'border-[#FF1717] bg-[#FF1717]/10 ring-1 ring-[#FF1717]/40'
                                : 'border-white/10 bg-transparent hover:bg-white/[0.04] hover:border-white/25'
                            }`}
                          >
                            <div className="aspect-[16/9] w-full flex items-center justify-center p-1 mb-2">
                              <img
                                src={resolveStudioCarImage(car)}
                                alt={car.modelo}
                                className="w-full h-full object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,0.9)]"
                              />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-white truncate">
                                {car.marca} {car.modelo}
                              </p>
                              <p className="text-[10px] text-white/50 font-mono mt-0.5">
                                {specs.power} · {formatPrice(car.precoPorDia)}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Carro pré-selecionado quando aberto pela Frota */}
                {activeService.requiresCar && lockCar && selectedCar && carSpecs && (
                  <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.025] border border-white/10">
                    <img
                      src={resolveStudioCarImage(selectedCar)}
                      alt={selectedCar.modelo}
                      className="w-24 h-14 object-contain shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-white/45">
                        {selectedCar.marca} · {carSpecs.category}
                      </p>
                      <p className="text-sm font-medium text-white truncate">{selectedCar.modelo}</p>
                      <p className="text-[11px] font-mono text-white/55">
                        {carSpecs.power} · 0–100 km/h {carSpecs.accel} · Máx. {carSpecs.topSpeed}
                      </p>
                    </div>
                  </div>
                )}

                {/* 4. Data e Turno (TrackSlot real do banco) */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-white/55 flex items-center gap-1.5">
                      <CalendarClock size={13} className="text-[#FF1717]" />
                      <span>Data &amp; Turno da Bateria (Vagas em Tempo Real)</span>
                    </label>
                    <span className="text-[10px] font-mono text-white/40">
                      Seg fechado (Manutenção FIA) · Ter–Qui reduzido · Sex–Dom full grid
                    </span>
                  </div>

                  {loadingSlots ? (
                    <div className="flex items-center gap-2 text-xs text-white/50 py-4">
                      <Loader2 size={14} className="animate-spin text-[#FF1717]" /> Buscando disponibilidade dos boxes...
                    </div>
                  ) : uniqueDates.length === 0 ? (
                    <p className="text-xs text-white/50 py-2">
                      Sem slots publicados para este circuito no momento.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {uniqueDates.map((d) => {
                          const isDateActive = d === selectedDate;
                          const parsed = new Date(`${d}T12:00:00`);
                          const dowNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                          const dowLabel = dowNames[parsed.getDay()] || '';
                          const label = `${dowLabel} ${d.split('-').reverse().slice(0, 2).join('/')}`;
                          const isWeekendPrime = parsed.getDay() === 5 || parsed.getDay() === 6 || parsed.getDay() === 0;
                          return (
                            <button
                              key={d}
                              type="button"
                              onClick={() => {
                                setSelectedDate(d);
                                const firstForDate = slots.find(
                                  (s) => s.data === d && s.vagasOcupadas < s.vagasTotais
                                );
                                if (firstForDate) setSelectedSlotId(firstForDate.id);
                              }}
                              className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer border flex items-center gap-1.5 ${
                                isDateActive
                                  ? 'bg-white text-[#08090C] border-white font-semibold'
                                  : 'bg-white/[0.03] text-white/70 border-white/10 hover:border-white/30'
                              }`}
                            >
                              <span>{label}</span>
                              {isWeekendPrime && (
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isDateActive ? 'bg-[#FF1717]' : 'bg-emerald-400/80'
                                  }`}
                                  title="Fim de semana: grade completa + noturno"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {selectedDate && (() => {
                        const dayNum = new Date(`${selectedDate}T12:00:00`).getDay();
                        const isPrime = dayNum === 5 || dayNum === 6 || dayNum === 0;
                        return (
                          <p className={`text-[10px] font-mono ${isPrime ? 'text-emerald-400/90' : 'text-amber-300/85'}`}>
                            {isPrime
                              ? '● Fim de Semana / Alta Procura: 3 turnos ativos (inclui Sessão Noturna) e capacidade ampliada.'
                              : '● Terça a Quinta / Operação Técnica: 2 turnos diurnos com capacidade reduzida.'}
                          </p>
                        );
                      })()}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {slotsForSelectedDate.map((slot) => {
                          const livres = slot.vagasTotais - slot.vagasOcupadas;
                          const esgotado = livres <= 0;
                          const isSelected = slot.id === selectedSlotId;
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              disabled={esgotado}
                              onClick={() => setSelectedSlotId(slot.id)}
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                                isSelected
                                  ? 'border-[#FF1717] bg-[#FF1717]/10'
                                  : 'border-white/10 bg-white/[0.025] hover:border-white/25'
                              }`}
                            >
                              <div className="flex items-center justify-between text-xs font-medium text-white">
                                <span>{TURNO_LABELS[slot.turno] || slot.turno}</span>
                              </div>
                              <div className="flex items-center justify-between mt-1.5 text-[10px] font-mono">
                                <span className={esgotado ? 'text-rose-400' : 'text-emerald-400'}>
                                  {esgotado ? 'Box lotado' : `${livres} boxes livres`}
                                </span>
                                <span className="text-white/55">
                                  {Number(slot.taxaAdicionalTurno) > 0
                                    ? `+${formatPrice(slot.taxaAdicionalTurno)}`
                                    : 'Sem taxa extra'}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. CNH (se pilotagem) & Pagamento ApexPay */}
                {activeService.requiresCnh && (
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                        <KeyRound size={13} className="text-[#FF1717]" /> Habilitação do Piloto (Módulo 11 · Idade ≥ 21)
                      </label>
                      <button
                        type="button"
                        onClick={() => setCnhInput('52798802310')}
                        className="text-[10px] font-mono text-[#FF1717] hover:underline cursor-pointer"
                      >
                        Preencher CNH de teste (52798802310)
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Número da CNH (11 dígitos)"
                        value={cnhInput}
                        onChange={(e) => setCnhInput(e.target.value)}
                        className="bg-white/5 border border-white/15 focus:border-[#FF1717] px-3.5 py-2.5 rounded-xl text-xs text-white placeholder-white/35 outline-none"
                      />
                      <input
                        type="date"
                        value={dobInput}
                        onChange={(e) => setDobInput(e.target.value)}
                        className="bg-white/5 border border-white/15 focus:border-[#FF1717] px-3.5 py-2.5 rounded-xl text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Forma de Pagamento & Desconto Fidelidade ApexPay */}
                <div className="p-4 rounded-2xl bg-[#08090C] border border-white/10 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-white">
                      <Wallet size={15} className="text-[#FF1717]" />
                      <span>Checkout ApexPay</span>
                      {perfil && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                          Tier {perfil.tierFidelidade} · Saldo: {formatPrice(perfil.saldoCarteira)}
                        </span>
                      )}
                    </div>
                    {perfil && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          navigate('/apexpay');
                        }}
                        className="text-[11px] text-white/60 hover:text-white underline cursor-pointer"
                      >
                        Depositar na Carteira
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setFormaPagamento('CARTEIRA_APEXPAY')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        formaPagamento === 'CARTEIRA_APEXPAY'
                          ? 'border-[#FF1717] bg-[#FF1717]/10'
                          : 'border-white/10 bg-white/[0.02]'
                      }`}
                    >
                      <p className="text-xs font-medium text-white">Pagar com Saldo ApexPay</p>
                      <p className="text-[10px] text-white/55 mt-0.5">
                        Débito imediato em carteira com aprovação instantânea (Green Flag).
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormaPagamento('FATURA_APEXPAY')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        formaPagamento === 'FATURA_APEXPAY'
                          ? 'border-[#FF1717] bg-[#FF1717]/10'
                          : 'border-white/10 bg-white/[0.02]'
                      }`}
                    >
                      <p className="text-xs font-medium text-white">Fatura Pós-Paga ApexPay</p>
                      <p className="text-[10px] text-white/55 mt-0.5">
                        Reserva sem saldo prévio; gera débito em aberto sujeito a juros se não quitado.
                      </p>
                    </button>
                  </div>

                  {/* Resumo Financeiro */}
                  <div className="pt-3 border-t border-white/10 space-y-1 text-xs font-mono">
                    <div className="flex justify-between text-white/55">
                      <span>Modalidade + Taxa de Turno</span>
                      <span>{formatPrice(pricing.subtotal)}</span>
                    </div>
                    {pricing.discountPct > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Desconto Fidelidade ({pricing.discountPct}%)</span>
                        <span>-{formatPrice(pricing.discountVal)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-sans font-semibold text-white pt-1">
                      <span>Total da Sessão</span>
                      <span className="text-[#FF1717] tabular-nums">{formatPrice(pricing.finalPrice)}</span>
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2.5">
                    <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {!token || !user ? (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate('/login', { state: { from: window.location.pathname } });
                    }}
                    className="w-full bg-white text-[#08090C] hover:bg-[#FF1717] hover:text-white text-xs font-semibold uppercase tracking-wider py-4 rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn size={16} />
                    <span>Entrar ou Cadastrar-se para Reservar Sessão</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting || Boolean(perfil?.inadimplente)}
                    className="w-full bg-[#FF1717] hover:bg-[#e01414] disabled:opacity-45 disabled:cursor-not-allowed text-white text-xs font-semibold uppercase tracking-wider py-4 rounded-full transition-all shadow-lg shadow-[#FF1717]/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Processando Reserva no Box...</span>
                      </>
                    ) : (
                      <span>Confirmar Agendamento de Sessão</span>
                    )}
                  </button>
                )}
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
