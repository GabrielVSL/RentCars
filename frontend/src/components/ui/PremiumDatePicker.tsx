'use client';

import { DayPicker, DateRange } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-day-picker/dist/style.css';

interface PremiumDatePickerProps {
  range: DateRange | undefined;
  setRange: (range: DateRange | undefined) => void;
  disabled?: (day: Date) => boolean;
  bookedDates?: { from: Date; to: Date }[];
}

export function PremiumDatePicker({ range, setRange, disabled, bookedDates }: PremiumDatePickerProps) {

  // Lógica de seleção limpa, suave e previsível (2 cliques exatos)
  const handleDayClick = (day: Date) => {
    if (disabled && disabled(day)) return;

    if (!range?.from || (range.from && range.to)) {
      // 1º Clique: Seleciona data de retirada
      setRange({ from: day, to: undefined });
    } else {
      // 2º Clique: Já temos 'from', fechamos o range
      if (day < range.from) {
        // Clicou numa data anterior: reinicia definindo nova data de retirada
        setRange({ from: day, to: undefined });
      } else {
        // Data posterior ou igual: fecha o período com sucesso
        setRange({ from: range.from, to: day });
      }
    }
  };

  return (
    <div className="rentcars-calendar select-none">
      <DayPicker
        mode="range"
        selected={range}
        onDayClick={handleDayClick}
        disabled={disabled}
        locale={ptBR}
        numberOfMonths={1}
        showOutsideDays={false}
        modifiers={{
          booked: bookedDates || [],
        }}
        modifiersClassNames={{
          booked: 'booked',
        }}
        components={{
          Chevron: ({ orientation }) =>
            orientation === 'left' ? (
              <ChevronLeft size={18} className="text-slate-700" />
            ) : (
              <ChevronRight size={18} className="text-slate-700" />
            ),
        }}
      />
    </div>
  );
}
