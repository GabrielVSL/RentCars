'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Smartphone, ChevronRight } from 'lucide-react';

export default function FeaturesSection() {
  return (
    // Fundo escuro absoluto para dar contraste com os brilhos
    <section className="relative bg-[#0A0A0C] py-32 overflow-hidden selection:bg-blue-500/30">
      
      {/* LUZES DE FUNDO (AMBIENT GLOWS) - O segredo da Family.co */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Cabeçalho com Tipografia Premium */}
        <div className="mb-20 max-w-2xl">
          <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tighter leading-[1.1]">
            Experiência premium. <br />
            <span className="text-[#88888C]">Sem burocracia.</span>
          </h2>
          <p className="mt-6 text-lg text-[#88888C] font-medium leading-relaxed">
            Esqueça as filas em locadoras. Na RentCars, a aprovação do seu carro e a análise de crédito acontecem em segundos, direto do seu celular.
          </p>
        </div>

        {/* BENTO GRID (O Layout Assimétrico) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Destaque Largo (Ocupa 2 colunas) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 group relative bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.04] rounded-[40px] p-10 overflow-hidden transition-all duration-500"
          >
            {/* Efeito de brilho no hover (Hover Glow) */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 mb-8">
                <Zap className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white tracking-tight mb-3">Aprovação Instantânea</h3>
                <p className="text-[#88888C] text-lg max-w-md">Nosso motor de crédito analisa seu perfil em tempo real, liberando a chave digital antes mesmo de você chegar na agência.</p>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Vertical */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group relative bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.04] rounded-[40px] p-10 overflow-hidden transition-all duration-500 flex flex-col justify-between"
          >
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 mb-8">
              <Smartphone className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight mb-3">100% Digital</h3>
              <p className="text-[#88888C]">Da escolha do veículo até a assinatura do contrato. Tudo no app.</p>
            </div>
          </motion.div>

          {/* Card 3: Vertical Inferior */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group relative bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.04] rounded-[40px] p-10 overflow-hidden transition-all duration-500 flex flex-col justify-between"
          >
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 mb-8">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight mb-3">Seguro Total</h3>
              <p className="text-[#88888C]">Cobertura premium inclusa em todos os contratos, sem letras miúdas.</p>
            </div>
          </motion.div>

          {/* Card 4: Chamada para Ação (Call to Action Largo) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 relative bg-blue-600 rounded-[40px] p-10 overflow-hidden transition-all duration-500 cursor-pointer group"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 h-full">
              <div>
                <h3 className="text-3xl font-bold text-white tracking-tight mb-2">Pronto para acelerar?</h3>
                <p className="text-blue-200 text-lg">Veja nossa frota disponível agora mesmo.</p>
              </div>
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0 shadow-xl">
                <ChevronRight className="text-blue-600" size={28} />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}