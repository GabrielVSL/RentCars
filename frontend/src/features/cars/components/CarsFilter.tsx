'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CalendarDays, ArrowRight, XCircle, Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import { format, parseISO, startOfDay } from 'date-fns';
import { PremiumDatePicker } from '@/components/ui/PremiumDatePicker';
import 'react-day-picker/dist/style.css';

interface CarsFilterProps {
  start: string;
  end: string;
  // 1. MUDANÇA CRÍTICA: Agora envia as duas datas juntas
  onDateChange: (start: string, end: string) => void; 
  onClear: () => void;
}

export function CarsFilter({ start, end, onDateChange, onClear }: CarsFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // 2. A ISOLAÇÃO: O calendário guarda os cliques aqui até o usuário terminar
  const [localRange, setLocalRange] = useState<DateRange | undefined>();

  const isSearchActive = start !== '' && end !== '';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = () => {
    if (!isOpen) {
      setLocalRange(start ? {
        from: parseISO(start),
        to: end ? parseISO(end) : undefined
      } : undefined);
    }
    setIsOpen(!isOpen);
  };

  // 3. LÓGICA SEGURA: Só avisa o sistema e fecha o Popover no SEGUNDO clique
  const handleRangeSelect = (range: DateRange | undefined) => {
    setLocalRange(range); // Atualiza só a bolha visual do calendário
    
    if (range?.from && range?.to) {
      onDateChange(format(range.from, 'yyyy-MM-dd'), format(range.to, 'yyyy-MM-dd'));
      setIsOpen(false); // Fecha suavemente depois do segundo clique
    }
  };

  const displayStart = isOpen && localRange?.from ? format(localRange.from, 'dd/MM/yyyy') : (start ? format(parseISO(start), 'dd/MM/yyyy') : 'Selecione');
  const displayEnd = isOpen && localRange?.to ? format(localRange.to, 'dd/MM/yyyy') : (end ? format(parseISO(end), 'dd/MM/yyyy') : 'Selecione');

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 backdrop-blur-xl rounded-[32px] shadow-sm border border-slate-200 p-3 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-20 z-40 relative"
    >
      <div className="flex items-center gap-3 px-4">
        <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner shrink-0">
          <MapPin size={18} />
        </div>
        <div className="shrink-0">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Retirada em</p>
          <p className="text-sm font-bold text-slate-900">Belo Horizonte, MG</p>
        </div>
      </div>

      <div className="relative flex-1 max-w-md w-full" ref={popupRef}>
        <div onClick={handleOpen} className={`flex items-center bg-slate-100/50 rounded-2xl p-1.5 border transition-all cursor-pointer hover:bg-slate-100 ${isOpen ? 'border-blue-400 ring-4 ring-blue-500/10' : 'border-slate-200/50'}`}>
          <div className="flex-1 px-4 py-1.5 flex flex-col">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Início</p>
            <p className={`text-sm font-bold ${start || localRange?.from ? 'text-slate-900' : 'text-slate-400'}`}>{displayStart}</p>
          </div>
          <div className="px-2 text-slate-300"><ArrowRight size={14} /></div>
          <div className="flex-1 px-4 py-1.5 flex flex-col">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Devolução</p>
            <p className={`text-sm font-bold ${end || localRange?.to ? 'text-slate-900' : 'text-slate-400'}`}>{displayEnd}</p>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 mt-4 bg-white p-6 rounded-[32px] border border-slate-100 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.15)] z-50 origin-top"
            >
              <div className="mb-6 flex items-center gap-2 pb-4 border-b border-slate-50">
                <CalendarIcon size={18} className="text-blue-600" />
                <div>
                  <p className="font-bold text-slate-900 text-sm">Selecione o período</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clique no início e depois no fim</p>
                </div>
              </div>
              <PremiumDatePicker range={localRange} setRange={handleRangeSelect} disabled={(day) => day < startOfDay(new Date())} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="hidden lg:flex items-center gap-4 px-6 border-l border-slate-200 shrink-0">
        {isSearchActive ? (
          <>
            <div className="flex items-center gap-2">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </div>
              <span className="text-xs font-bold text-slate-700">Filtro Ativo</span>
            </div>
            <button 
              onClick={() => { onClear(); setIsOpen(false); setLocalRange(undefined); }}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-red-500 transition-colors"
            >
              <XCircle size={14} /> Limpar
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2 opacity-50">
            <CalendarDays size={16} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-400">Sem datas</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}