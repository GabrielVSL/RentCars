'use client';

import { useState, useEffect } from 'react';
import { Circuit, TrackCar } from '@/services/telemetryService';
import { X, Check, ShieldCheck, Flag, Gauge, Sparkles } from 'lucide-react';
import { CountryFlag } from '@/components/ui/CountryFlag';

interface CircuitBookingModalProps {
  circuit: Circuit;
  initialCar?: TrackCar | null;
  isOpen: boolean;
  onClose: () => void;
}

export type ServiceType = 'VISITA_BOX' | 'FAST_LAP' | 'TRACK_EXPERIENCE' | 'PACOTE_VIP';

interface ServiceOption {
  id: ServiceType;
  title: string;
  badge?: string;
  description: string;
  priceEstimate: string;
  requiresCar: boolean;
  icon: typeof Flag;
}

const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: 'VISITA_BOX',
    title: 'Visita ao Box & Paddock VIP',
    badge: 'Acesso VIP',
    description: 'Tour guiado pelos boxes, telemetria ao vivo dos treinos, lounge VIP e coquetel executivo.',
    priceEstimate: 'R$ 890 / pessoa',
    requiresCar: false,
    icon: ShieldCheck,
  },
  {
    id: 'FAST_LAP',
    title: 'Fast Lap com Piloto Instrutor',
    badge: 'Alta Emoção',
    description: 'Sinta as forças G no banco do carona enquanto um piloto profissional leva o supercarro ao limite.',
    priceEstimate: 'A partir de R$ 2.400',
    requiresCar: true,
    icon: Flag,
  },
  {
    id: 'TRACK_EXPERIENCE',
    title: 'Track Experience (Pilotar na Pista)',
    badge: 'Mais Escolhido',
    description: 'Você no cockpit no comando do supercarro, com briefing técnico, rádio e instrutor ao lado.',
    priceEstimate: 'A partir de R$ 4.900',
    requiresCar: true,
    icon: Gauge,
  },
  {
    id: 'PACOTE_VIP',
    title: 'Pacote VIP Full Day',
    badge: 'Experiência Completa',
    description: 'Dia completo de pista: pilotagem de 2 supercarros, gravação onboard 4K, telemetria e camarote.',
    priceEstimate: 'Sob Consulta',
    requiresCar: true,
    icon: Sparkles,
  },
];

export default function CircuitBookingModal({
  circuit,
  initialCar,
  isOpen,
  onClose,
}: CircuitBookingModalProps) {
  const [selectedService, setSelectedService] = useState<ServiceType>('TRACK_EXPERIENCE');
  const [selectedCar, setSelectedCar] = useState<TrackCar | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(circuit.nextDates?.[0] || '2026-11-21');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (initialCar) {
      setSelectedCar(initialCar);
    } else if (circuit.availableCars && circuit.availableCars.length > 0) {
      setSelectedCar(circuit.availableCars[0]);
    }
  }, [circuit, initialCar]);

  useEffect(() => {
    if (circuit.nextDates && circuit.nextDates.length > 0) {
      setSelectedDate(circuit.nextDates[0]);
    }
  }, [circuit]);

  if (!isOpen) return null;

  const activeServiceObj = SERVICE_OPTIONS.find((s) => s.id === selectedService) || SERVICE_OPTIONS[2];
  const cars = circuit.availableCars || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-sans text-white"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-[#0C0E13] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Fixo */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#08090C] shrink-0">
          <div className="flex items-center gap-3">
            <CountryFlag countryCode={circuit.country} className="w-6 h-4 rounded-sm" />
            <div>
              <p className="text-[11px] font-mono tracking-wider text-white/50 uppercase">
                Disponibilidade & Agendamento
              </p>
              <h3 className="text-lg sm:text-xl font-normal text-white tracking-tight">
                {circuit.name}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Fechar (ESC)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Conteúdo com Scroll interno limpo */}
        <div className="p-5 sm:p-6 overflow-y-auto no-scrollbar flex-1">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* 1. SELEÇÃO DO TIPO DE SERVIÇO */}
              <div>
                <label className="text-xs font-normal text-white/70 block mb-2 uppercase tracking-wider">
                  1. Escolha a Experiência Desejada
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SERVICE_OPTIONS.map((srv) => {
                    const isSelected = selectedService === srv.id;
                    const IconComp = srv.icon;
                    return (
                      <div
                        key={srv.id}
                        onClick={() => setSelectedService(srv.id)}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#FF1717] bg-[#FF1717]/10 ring-1 ring-[#FF1717]/40 shadow-lg'
                            : 'border-white/10 bg-white/5 hover:bg-white/[0.08] hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isSelected ? 'bg-[#FF1717] text-white' : 'bg-white/10 text-white/60'}`}>
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
                        <p className="text-[11px] text-white/60 leading-relaxed mb-2">
                          {srv.description}
                        </p>
                        <span className="text-[10px] font-mono text-[#FF1717] font-medium">
                          {srv.priceEstimate}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. SELEÇÃO DO SUPERCARRO (SE O SERVIÇO REQUER PILOTAGEM) */}
              {activeServiceObj.requiresCar && cars.length > 0 && (
                <div>
                  <label className="text-xs font-normal text-white/70 block mb-2 uppercase tracking-wider">
                    2. Selecione o Supercarro Homologado no Box
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {cars.map((car) => {
                      const isCarSelected = selectedCar?.id === car.id;
                      return (
                        <div
                          key={car.id}
                          onClick={() => setSelectedCar(car)}
                          className={`p-2.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                            isCarSelected
                              ? 'border-[#FF1717] bg-[#FF1717]/10 ring-1 ring-[#FF1717]/40 shadow-lg'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="aspect-[16/10] w-full rounded-lg bg-gradient-to-b from-white/[0.04] to-black/50 mb-2 overflow-hidden flex items-center justify-center p-1.5">
                            <img
                              src={car.image}
                              alt={car.model}
                              className="w-full h-full object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.85)]"
                            />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-white truncate">
                              {car.brand} {car.model}
                            </p>
                            <p className="text-[10px] text-white/50 mt-0.5 font-mono">
                              {car.power} · 0-100 {car.acceleration}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. SELEÇÃO DA DATA DA SESSÃO */}
              <div>
                <label className="text-xs font-normal text-white/70 block mb-2 uppercase tracking-wider">
                  3. Data Disponível para Visita / Track Day
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {circuit.nextDates?.map((dateStr, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedDate(dateStr)}
                      className={`px-3 py-1.5 rounded-full text-xs font-normal transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedDate === dateStr
                          ? 'bg-[#FF1717] text-white shadow-md'
                          : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{dateStr}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. DADOS PARA CONFIRMAÇÃO DO CONCIERGE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                <div>
                  <label className="text-[11px] text-white/60 block mb-1">Seu Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: Gabriel Silva"
                    className="w-full bg-white/5 border border-white/15 focus:border-[#FF1717] px-3 py-2 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/60 block mb-1">WhatsApp / Telefone</label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+55 (11) 99999-9999"
                    className="w-full bg-white/5 border border-white/15 focus:border-[#FF1717] px-3 py-2 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* RESUMO DA RESERVA */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                <div>
                  <span className="text-white/50 block text-[10px] uppercase font-mono">Resumo</span>
                  <span className="text-white font-medium">
                    {activeServiceObj.title}
                    {activeServiceObj.requiresCar && selectedCar ? ` · ${selectedCar.model}` : ''}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-white/50 block text-[10px] uppercase font-mono">Data</span>
                  <span className="text-emerald-400 font-mono text-xs">{selectedDate}</span>
                </div>
              </div>

              {/* BOTÃO PRINCIPAL */}
              <button
                type="submit"
                className="w-full bg-[#FF1717] hover:bg-[#e01414] text-white text-xs font-medium uppercase tracking-wider py-3.5 rounded-full transition-all cursor-pointer shadow-lg shadow-[#FF1717]/25 hover:shadow-[#FF1717]/40 active:scale-98"
              >
                Solicitar Agendamento com o Concierge ↗
              </button>
            </form>
          ) : (
            /* TELA DE SUCESSO ELEGANTE */
            <div className="py-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <Check size={24} />
              </div>
              <div>
                <h3 className="text-xl font-normal text-white tracking-tight">
                  Solicitação Registrada com Sucesso!
                </h3>
                <p className="text-xs text-white/65 mt-2 max-w-md mx-auto leading-relaxed">
                  Obrigado, <span className="text-white font-medium">{clientName || 'Cliente'}</span>. Nosso concierge de pista entrará em contato via WhatsApp para confirmar seu horário, credencial VIP e detalhes técnicos da sessão em <span className="text-white font-medium">{circuit.name}</span>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 max-w-sm mx-auto text-left text-xs space-y-1">
                <p className="text-white/50 text-[10px] font-mono uppercase">Protocolo VIP Apex</p>
                <p className="text-white font-mono text-[11px]">#APX-{Math.floor(100000 + Math.random() * 900000)}</p>
                <p className="text-white/70 text-[11px] pt-1">
                  {activeServiceObj.title} · {selectedDate}
                </p>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="bg-white/10 hover:bg-white/15 text-white text-xs font-medium px-6 py-2.5 rounded-full transition-colors cursor-pointer"
              >
                Concluir & Voltar à Pista
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
