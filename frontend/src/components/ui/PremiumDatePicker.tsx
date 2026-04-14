'use client';

import { DayPicker, DateRange } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-day-picker/dist/style.css';

interface PremiumDatePickerProps {
  range: DateRange | undefined;
  setRange: (range: DateRange | undefined) => void;
  disabled?: (day: Date) => boolean;
  bookedDates?: { from: Date, to: Date }[]; // NOVA PROPRIEDADE AQUI
}

export function PremiumDatePicker({ range, setRange, disabled, bookedDates }: PremiumDatePickerProps) {

  const handleSelect = (newRange: DateRange | undefined, selectedDay: Date) => {
    if (range?.from && range?.to) {
      setRange({ from: selectedDay, to: undefined });
    } else {
      setRange(newRange);
    }
  };

  return (
    <DayPicker
      mode="range"
      selected={range}
      onSelect={handleSelect}
      disabled={disabled}
      locale={ptBR}
      numberOfMonths={1}
      showOutsideDays
      
      // NOVA MÁGICA: Mapeando os dias reservados
      modifiers={{
        single_day: (date) => 
          !!(range?.from && range?.to && range.from.getTime() === range.to.getTime() && date.getTime() === range.from.getTime()),
        booked: bookedDates || [] // Passamos as datas bloqueadas para o DayPicker
      }}

      components={{
        IconLeft: () => <ChevronLeft size={18} className="text-slate-700" />,
        IconRight: () => <ChevronRight size={18} className="text-slate-700" />
      }}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-full",
        caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "text-base font-black text-slate-900 capitalize",
        nav: "space-x-1 flex items-center",
        nav_button: "h-8 w-8 bg-slate-50 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors border border-slate-100",
        nav_button_previous: "absolute left-1 top-1",
        nav_button_next: "absolute right-1 top-1",
        nav_icon: "w-4 h-4 fill-slate-700",
        table: "w-full border-collapse",
        head_row: "flex w-full",
        head_cell: "text-slate-400 font-black text-[10px] uppercase tracking-widest w-full text-center flex-1",
        row: "flex w-full mt-1",
        cell: "flex-1 text-center text-sm p-0 relative",
        day: "h-10 w-full p-0 font-bold rounded-full hover:bg-slate-100 text-slate-700 transition-colors bg-transparent border border-transparent outline-none",
        day_today: "text-blue-600 font-black",
        day_outside: "text-slate-300 opacity-50 font-medium",
        day_selected: "bg-slate-900 text-white hover:bg-slate-800",
        
        // Mantemos o disabled padrão (Para dias no passado)
        day_disabled: "text-slate-400 opacity-50 bg-slate-50 cursor-not-allowed hover:bg-slate-50",
        day_hidden: "invisible",
      }}
      modifiersClassNames={{
        range_start: "!bg-slate-900 !text-white !rounded-l-full !rounded-r-none",
        range_end: "!bg-slate-900 !text-white !rounded-r-full !rounded-l-none",
        range_middle: "!bg-blue-50 !text-blue-900 !rounded-none",
        single_day: "!rounded-full",
        
        // VISUAL IDÊNTICO À LEGENDA: Fundo cinza com a linha diagonal atravessando o número
        booked: "relative !text-slate-400 !bg-slate-100 !cursor-not-allowed hover:!bg-slate-100 overflow-hidden before:content-[''] before:absolute before:w-[150%] before:h-[1.5px] before:bg-slate-400 before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-45"
      }}
    />
  );
}