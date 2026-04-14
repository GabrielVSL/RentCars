'use client';

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchForm } from '@/hooks/useSearchForm';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { PremiumDatePicker } from '@/components/ui/PremiumDatePicker';
import { MapPin, CalendarDays, Clock, Search, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { format, parseISO, startOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';
import type { Location } from '@/types'; 

const LOCATION_OPTIONS = [
  { value: 'BH_CENTRO', label: 'Belo Horizonte - Centro', description: 'Minas Gerais, Brasil', icon: <MapPin size={16} className="text-blue-500"/> },
  { value: 'CNF_AIRPORT', label: 'Aeroporto de Confins (CNF)', description: 'Confins, MG', icon: <MapPin size={16} className="text-blue-500"/> },
];

const TIME_OPTIONS = Array.from({ length: 36 }).map((_, i) => {
  const hour = Math.floor(i / 2) + 6;
  const minute = i % 2 === 0 ? '00' : '30';
  const timeString = `${hour.toString().padStart(2, '0')}:${minute}`;
  return { value: timeString, label: timeString, icon: <Clock size={14} className="text-slate-400" /> };
});

const buildLocationFromOption = (opt: typeof LOCATION_OPTIONS[0] | null | undefined): Location | null => {
  if (!opt) return null;
  return { id: '', name: opt.label, city: opt.label.split(' - ')[0], state: 'MG', country: 'Brasil' };
};

export default function SearchSection({ onSuccess }: { onSuccess?: () => void }) {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // A ISOLAÇÃO: O Calendário brinca aqui dentro, sem travar o formulário global
  const [localRange, setLocalRange] = useState<DateRange | undefined>(undefined);

  const {
    formData,
    isSubmitting,
    rentalDays,
    setLocation,
    setPickupDate,
    setReturnDate,
    setPickupTime,
    setReturnTime
  } = useSearchForm();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Quando abre o calendário, puxa os dados do form
  const handleOpenCalendar = () => {
    if (!isCalendarOpen) {
      setLocalRange(formData.pickupDate ? {
        from: new Date(formData.pickupDate + 'T00:00:00'),
        to: formData.returnDate ? new Date(formData.returnDate + 'T00:00:00') : undefined
      } : undefined);
    }
    setIsCalendarOpen(!isCalendarOpen);
  };

  const handleRangeSelect = (range: DateRange | undefined) => {
    setLocalRange(range); // O visual na tela atualiza na hora, sem travar
    
    // Só envia pro form global quando o cliente escolheu as DUAS datas
    if (range?.from && range?.to) {
      setPickupDate(range.from);
      setReturnDate(range.to);
      setIsCalendarOpen(false); 
    }
  };

  const handleLocationChange = (value: string | null) => {
    setLocation(buildLocationFromOption(LOCATION_OPTIONS.find(opt => opt.value === value) || null));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
    onSuccess?.();
    setTimeout(() => navigate('/cars'), 1000);
  };

  return (
    <section className="relative overflow-visible w-full">
      <div className="container mx-auto px-4 max-w-[1000px]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-widest bg-white/90 backdrop-blur-md border border-slate-200/50 px-5 py-2.5 rounded-full shadow-sm">
              <Sparkles size={14} className="text-blue-500" />
              <span>Sua jornada começa aqui</span>
            </div>
          </div>

          <div className="relative bg-white rounded-[40px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.12)] p-6 md:p-8 border border-slate-100">
            <form onSubmit={onSubmit} className="flex flex-col gap-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* LOCAL DE RETIRADA */}
                <div className="lg:col-span-5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Onde você retira?</label>
                  <Select
                    options={LOCATION_OPTIONS}
                    value={LOCATION_OPTIONS.find(opt => opt.label === formData.pickupLocation)?.value || null}
                    onValueChange={handleLocationChange}
                    placeholder="Cidade ou Aeroporto"
                    className="bg-[#F5F5F7] border-transparent text-slate-900 font-bold rounded-2xl h-16 hover:bg-[#EEEEF0] transition-all shadow-inner"
                  />
                </div>

                {/* CALENDÁRIO UNIFICADO (POPOVER) */}
                <div className="lg:col-span-7 relative" ref={calendarRef}>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Período do Aluguel</label>
                  
                  <div 
                    onClick={handleOpenCalendar}
                    className={`flex items-center bg-[#F5F5F7] rounded-2xl h-16 px-6 cursor-pointer transition-all shadow-inner hover:bg-[#EEEEF0] ${isCalendarOpen ? 'ring-4 ring-blue-500/10 border-blue-500 bg-white' : 'border-transparent'}`}
                  >
                    <CalendarDays size={20} className="text-blue-500 mr-4 shrink-0" />
                    
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Retirada</p>
                      {/* Mostra a data local se o calendário estiver aberto, senão mostra a salva no form */}
                      <p className="text-sm font-black text-slate-900">
                        {isCalendarOpen && localRange?.from 
                          ? format(localRange.from, 'dd/MM/yyyy') 
                          : (formData.pickupDate ? format(new Date(formData.pickupDate + 'T00:00:00'), 'dd/MM/yyyy') : 'Selecionar')}
                      </p>
                    </div>
                    
                    <ArrowRight size={16} className="text-slate-300 mx-4 shrink-0" />
                    
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Devolução</p>
                      <p className="text-sm font-black text-slate-900">
                        {isCalendarOpen && localRange?.to 
                          ? format(localRange.to, 'dd/MM/yyyy') 
                          : (formData.returnDate ? format(new Date(formData.returnDate + 'T00:00:00'), 'dd/MM/yyyy') : 'Selecionar')}
                      </p>
                    </div>
                  </div>

                  {/* O CALENDÁRIO PREMIUM */}
                  <AnimatePresence>
                    {isCalendarOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 right-0 mt-4 bg-white p-6 rounded-[32px] border border-slate-100 shadow-2xl z-50 flex justify-center"
                      >
                        <PremiumDatePicker 
                          range={localRange} 
                          setRange={handleRangeSelect} 
                          disabled={(day) => day < startOfDay(new Date())}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* HORÁRIOS E BOTÃO */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                <div className="lg:col-span-5 flex gap-3">
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Hora Retirada</label>
                    <Select options={TIME_OPTIONS} value={formData.pickupTime} onValueChange={setPickupTime} placeholder="08:00" className="bg-[#F5F5F7] rounded-2xl h-14 font-bold" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Hora Devolução</label>
                    <Select options={TIME_OPTIONS} value={formData.returnTime} onValueChange={setReturnTime} placeholder="18:00" className="bg-[#F5F5F7] rounded-2xl h-14 font-bold" />
                  </div>
                </div>

                <div className="lg:col-span-3 h-14 flex items-center justify-center bg-blue-50 rounded-2xl border border-blue-100 mt-6">
                  <p className="text-sm font-medium text-blue-900">
                    <strong className="font-black text-blue-600 text-lg mr-1">{rentalDays || 0}</strong> diárias
                  </p>
                </div>

                <div className="lg:col-span-4 mt-6">
                  <Button type="submit" isLoading={isSubmitting} className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black rounded-2xl h-14 shadow-lg flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5">
                    {!isSubmitting && <Search size={20} />} Explorar Frota
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}