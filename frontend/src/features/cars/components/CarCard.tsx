'use client';

import { motion } from 'framer-motion';
import { Star, MapPin, ChevronRight, Car as CarIcon } from 'lucide-react';
import { Automovel } from './BookingModal';

interface CarCardProps {
  carro: Automovel;
  index: number;
  onSelect: (car: Automovel) => void;
}

export function CarCard({ carro, index, onSelect }: CarCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.03)] hover:border-blue-100 hover:shadow-[0_40px_80px_-20px_rgba(37,99,235,0.1)] transition-all duration-500 flex flex-col"
    >
      {/* Área da Imagem com fundo "Off-white" do Layout */}
      <div className="aspect-[16/10] relative overflow-hidden bg-[#F8F8FA] p-8">
        {carro.imageUrl ? (
          <img 
            src={carro.imageUrl} 
            alt={carro.modelo} 
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-2xl" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CarIcon size={48} className="text-slate-200" />
          </div>
        )}
        
        {/* Badge de Ano Minimalista */}
        <div className="absolute top-6 left-6">
          <span className="bg-white text-slate-900 text-[10px] font-black px-4 py-2 rounded-full shadow-sm border border-slate-100 uppercase tracking-widest">
            Model {carro.ano}
          </span>
        </div>
      </div>

      {/* Conteúdo Informativo */}
      <div className="p-8 flex-1 flex flex-col">
        <div className="flex-1">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">{carro.marca}</p>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-4">{carro.modelo}</h3>
          
          <div className="flex items-center gap-5 pt-2">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <MapPin size={14} className="text-blue-500" /> BH, MG
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <Star size={14} className="text-amber-400 fill-amber-400" /> 4.9
            </div>
          </div>
        </div>

        {/* Rodapé do Card com Preço e Ação */}
        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Preço diário</p>
            <p className="text-3xl font-black text-slate-900">
              R$ {carro.precoPorDia}
              <span className="text-xs text-slate-400 font-bold ml-1">/DIA</span>
            </p>
          </div>
          
          <button 
            onClick={() => onSelect(carro)}
            className="w-14 h-14 bg-slate-900 hover:bg-blue-600 text-white rounded-[20px] flex items-center justify-center transition-all duration-500 group/btn shadow-xl shadow-slate-900/10 hover:shadow-blue-600/30"
          >
            <ChevronRight size={28} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}