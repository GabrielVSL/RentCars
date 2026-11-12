'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import { format, parseISO, startOfDay } from 'date-fns';
import 'react-day-picker/dist/style.css';

interface CarsFilterProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onClear: () => void;
}

export function getDayOperationProfile(dateStr: string): {
  label: string;
  tone: string;
} | null {
  if (!dateStr) return null;
  const parsed = parseISO(dateStr);
  const day = parsed.getDay();
  if (day === 1) {
    return { label: 'Manutenção FIA · Fechado', tone: 'text-rose-400' };
  }
  if (day === 5 || day === 6 || day === 0) {
    return { label: 'Sex–Dom · Full Grid + Noturno', tone: 'text-emerald-400' };
  }
  return { label: 'Ter–Qui · Operação Reduzida (2 turnos)', tone: 'text-amber-300' };
}

export function CarsFilter({ selectedDate, onDateChange, onClear }: CarsFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const parsedSelected = selectedDate ? parseISO(selectedDate) : undefined;
  const profile = getDayOperationProfile(selectedDate);

  const handleDaySelect = (day: Date | undefined) => {
    if (!day) return;
    if (day.getDay() === 1) return; // Segunda-feira fechada para manutenção FIA
    onDateChange(format(day, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={popupRef}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center gap-2.5 pb-1.5 border-b text-xs font-medium transition-colors cursor-pointer ${
            selectedDate
              ? 'border-[#FF1717] text-white'
              : 'border-white/15 hover:border-white/40 text-white/75 hover:text-white'
          }`}
        >
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
            Data:
          </span>
          <span className="tabular-nums">
            {selectedDate ? format(parseISO(selectedDate), 'dd/MM/yyyy') : 'Qualquer sessão'}
          </span>
          {profile && (
            <span className={`hidden sm:inline text-[10px] font-mono ${profile.tone}`}>
              ({profile.label})
            </span>
          )}
          <ChevronDown
            size={13}
            className={`text-white/45 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {selectedDate && (
          <button
            type="button"
            onClick={onClear}
            className="text-white/40 hover:text-white p-1 transition-colors cursor-pointer"
            title="Limpar data"
          >
            <X size={13} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-3 z-50 w-[320px] bg-[#0B0E14] border border-white/15 rounded-xl p-4 shadow-2xl"
          >
            <div className="bg-white rounded-lg p-2.5">
              <DayPicker
                mode="single"
                selected={parsedSelected}
                onSelect={handleDaySelect}
                disabled={(day) => day < startOfDay(new Date()) || day.getDay() === 1}
                locale={ptBR}
                showOutsideDays={false}
              />
            </div>

            <div className="mt-3 pt-3 border-t border-white/10 space-y-1 text-[10px] font-mono">
              <p className="text-rose-400/90">• Segunda: Pista fechada (Manutenção FIA)</p>
              <p className="text-amber-300/85">• Ter–Qui: Operação reduzida (Manhã/Tarde)</p>
              <p className="text-emerald-400/90">• Sex–Dom: Full Grid + Sessão Noturna</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
