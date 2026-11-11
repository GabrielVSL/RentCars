'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, ArrowRight, RotateCcw } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format, parseISO } from 'date-fns';
import { PremiumDatePicker } from '@/components/ui/PremiumDatePicker';
import 'react-day-picker/dist/style.css';

interface CarsFilterProps {
  start: string;
  end: string;
  onDateChange: (start: string, end: string) => void; 
  onClear: () => void;
}

export function CarsFilter({ start, end, onDateChange, onClear }: CarsFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
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

  const handleRangeSelect = (range: DateRange | undefined) => {
    setLocalRange(range);
    if (range?.from && range?.to) {
      onDateChange(format(range.from, 'yyyy-MM-dd'), format(range.to, 'yyyy-MM-dd'));
      setIsOpen(false);
    }
  };

  const displayStart = isOpen && localRange?.from ? format(localRange.from, 'dd/MM/yyyy') : (start ? format(parseISO(start), 'dd/MM/yyyy') : 'Selecione');
  const displayEnd = isOpen && localRange?.to ? format(localRange.to, 'dd/MM/yyyy') : (end ? format(parseISO(end), 'dd/MM/yyyy') : 'Selecione');

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0F1117]/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-3 mb-10 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-20 z-40 relative"
    >
      <div className="flex items-center gap-3 px-4">
        <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-[#FF1717] shrink-0">
          <Flag size={18} />
        </div>
        <div className="shrink-0 font-mono">
          <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-none mb-1">Paddock de Retirada</p>
          <p className="text-sm font-bold text-white">Circuitos Homologados FIA 🏁</p>
        </div>
      </div>

      <div className="relative flex-1 max-w-md w-full" ref={popupRef}>
        <div 
          onClick={handleOpen} 
          className={`flex items-center bg-black/40 rounded-2xl p-1.5 border transition-all cursor-pointer hover:border-white/20 font-mono ${
            isOpen ? 'border-[#FF1717] ring-2 ring-[#FF1717]/20' : 'border-white/10'
          }`}
        >
          <div className="flex-1 px-4 py-1.5 flex flex-col">
            <span className="text-[9px] uppercase font-bold text-white/40 tracking-widest leading-none mb-1">Início da Bateria</span>
            <span className={`text-xs font-bold leading-none ${start ? 'text-white' : 'text-white/40'}`}>{displayStart}</span>
          </div>

          <ArrowRight size={14} className="text-[#FF1717] shrink-0 mx-2" />

          <div className="flex-1 px-4 py-1.5 flex flex-col">
            <span className="text-[9px] uppercase font-bold text-white/40 tracking-widest leading-none mb-1">Fim da Bateria</span>
            <span className={`text-xs font-bold leading-none ${end ? 'text-white' : 'text-white/40'}`}>{displayEnd}</span>
          </div>
        </div>

        {/* Popover Calendário */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50 bg-[#08090C] border border-white/20 rounded-3xl p-5 shadow-2xl flex flex-col items-center"
            >
              <PremiumDatePicker
                range={localRange}
                setRange={handleRangeSelect}
              />
              <div className="w-full pt-3 mt-3 border-t border-white/10 flex items-center justify-between font-mono text-[11px] text-white/50">
                <span>Clique 1: Retirada · Clique 2: Devolução</span>
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="text-[#FF1717] font-bold hover:underline cursor-pointer"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 px-2">
        {isSearchActive && (
          <button 
            type="button"
            onClick={onClear} 
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-mono text-xs font-bold transition-all border border-white/10 cursor-pointer"
          >
            <RotateCcw size={14} className="text-[#FF1717]" />
            <span>Limpar Filtro</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
