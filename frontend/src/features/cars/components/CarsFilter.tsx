'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, ArrowRight, RotateCcw } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format, parseISO, startOfDay } from 'date-fns';
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    if (!isOpen) {
      setLocalRange(
        start
          ? {
              from: parseISO(start),
              to: end ? parseISO(end) : undefined,
            }
          : undefined
      );
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

  const displayStart =
    isOpen && localRange?.from
      ? format(localRange.from, 'dd/MM/yyyy')
      : start
        ? format(parseISO(start), 'dd/MM/yyyy')
        : 'Data inicial';
  const displayEnd =
    isOpen && localRange?.to
      ? format(localRange.to, 'dd/MM/yyyy')
      : end
        ? format(parseISO(end), 'dd/MM/yyyy')
        : 'Data final';

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/[0.08] p-3 mb-10 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-20 z-40"
    >
      <div className="flex items-center gap-3 px-3">
        <div className="w-9 h-9 bg-white/[0.04] border border-white/[0.08] rounded-xl flex items-center justify-center text-[#FF1717] shrink-0">
          <CalendarDays size={17} />
        </div>
        <div className="shrink-0">
          <p className="text-[10px] font-mono text-white/45 uppercase tracking-[0.2em] leading-none mb-1">
            Disponibilidade por Bateria
          </p>
          <p className="text-xs sm:text-sm font-medium text-white/90">
            Consulte veículos livres no período
          </p>
        </div>
      </div>

      <div className="relative flex-1 max-w-md w-full" ref={popupRef}>
        <div
          onClick={handleOpen}
          className={`flex items-center bg-[#08090C]/70 rounded-xl p-1.5 border transition-all cursor-pointer hover:border-white/25 ${
            isOpen ? 'border-[#FF1717]/80 ring-1 ring-[#FF1717]/30' : 'border-white/10'
          }`}
        >
          <div className="flex-1 px-3.5 py-1.5 flex flex-col">
            <span className="text-[9px] font-mono uppercase text-white/40 tracking-widest leading-none mb-1">
              Início
            </span>
            <span className={`text-xs font-medium leading-none ${start ? 'text-white' : 'text-white/45'}`}>
              {displayStart}
            </span>
          </div>

          <ArrowRight size={14} className="text-[#FF1717] shrink-0 mx-1.5" />

          <div className="flex-1 px-3.5 py-1.5 flex flex-col">
            <span className="text-[9px] font-mono uppercase text-white/40 tracking-widest leading-none mb-1">
              Término
            </span>
            <span className={`text-xs font-medium leading-none ${end ? 'text-white' : 'text-white/45'}`}>
              {displayEnd}
            </span>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50 bg-[#0C0E13] border border-white/15 rounded-2xl p-5 shadow-2xl flex flex-col items-center"
            >
              <div className="bg-white rounded-xl p-3 shadow-lg">
                <PremiumDatePicker
                  range={localRange}
                  setRange={handleRangeSelect}
                  disabled={(day) => day < startOfDay(new Date())}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isSearchActive && (
        <button
          type="button"
          onClick={onClear}
          className="px-4 py-2 text-xs font-medium text-white/75 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
        >
          <RotateCcw size={13} />
          <span>Limpar</span>
        </button>
      )}
    </motion.div>
  );
}
