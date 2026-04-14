'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Smartphone, ArrowRight, Sparkles, Clock, MapPin, CheckCircle2 } from 'lucide-react';

// Variantes de entrada na tela (Surgimento suave)
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 20 } }
};

// ==========================================
// KEYFRAMES CONTÍNUOS (O "UAU" Factor)
// ==========================================
const floatUpAndDown = {
  y: [0, -12, 0],
  transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
};

const slideLeftAndRight = {
  x: [0, -30, 0],
  transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
};

const pulseGlow = {
  scale: [1, 1.1, 1],
  opacity: [0.3, 0.6, 0.3],
  transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
};

export function BentoAdvantages() {
  return (
    <section className="py-32 px-6 bg-[#F5F5F7] overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        
        {/* Cabeçalho */}
        <div className="max-w-3xl mb-20 relative z-10">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-6">
            <Sparkles size={16} className="text-blue-500 animate-pulse" />
            <span className="text-xs font-black text-slate-600 uppercase tracking-widest">A Revolução da Mobilidade</span>
          </motion.div>
          
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.95] mb-6">
            Alugar um carro agora <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 drop-shadow-sm">
               é fácil quanto um Pix.
            </span>
          </h2>
          <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl">
            Desenhamos uma experiência sem atritos. Esqueça balcões, papelada e esperas. Sua chave digital está a alguns cliques de distância.
          </p>
        </div>

        {/* O BENTO GRID ANIMADO */}
        <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          
          {/* CARD 1: Destaque Principal (Aprovação com UI Simulada) */}
          <motion.div variants={cardVariants} className="md:col-span-2 lg:col-span-2 bg-white rounded-[40px] p-10 md:p-12 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden relative group hover:shadow-[0_40px_100px_-20px_rgba(37,99,235,0.15)] transition-all duration-500">
            {/* Brilho Ambiente Azul no fundo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-[80px] -mr-20 -mt-20 opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-[24px] flex items-center justify-center mb-8 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-500">
                  <Zap className="text-white" size={32} />
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter mb-4">Aprovação Instantânea</h3>
                <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-sm">
                  Nosso motor de crédito integrado ao banco analisa seu perfil em tempo real. Sem filas, sem ansiedade.
                </p>
              </div>

              {/* Animação Interna: Cards Deslizando (Slide-to-side) */}
              <div className="mt-12 relative h-32 w-full bg-[#F5F5F7] rounded-3xl border border-slate-100 overflow-hidden flex items-center pl-8">
                 <motion.div animate={slideLeftAndRight} className="flex gap-4">
                    {/* Item Aprovado */}
                    <div className="bg-white px-5 py-3.5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 shrink-0">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle2 size={20} className="text-emerald-500"/></div>
                      <div>
                        <div className="h-2.5 w-20 bg-slate-200 rounded-full mb-2" />
                        <div className="h-2 w-12 bg-slate-100 rounded-full" />
                      </div>
                    </div>
                    {/* Item em Processamento */}
                    <div className="bg-white px-5 py-3.5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 shrink-0 opacity-60">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><Clock size={20} className="text-blue-500"/></div>
                      <div>
                        <div className="h-2.5 w-24 bg-slate-200 rounded-full mb-2" />
                        <div className="h-2 w-16 bg-slate-100 rounded-full" />
                      </div>
                    </div>
                 </motion.div>
                 {/* Gradiente para esconder a borda direita suavemente */}
                 <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#F5F5F7] to-transparent z-10" />
              </div>
            </div>
          </motion.div>

          {/* CARD 2: Chave Digital (Celular Flutuante) */}
          <motion.div variants={cardVariants} className="md:col-span-1 lg:col-span-1 bg-white rounded-[40px] p-10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.05)] border border-slate-100 relative group overflow-hidden">
            <motion.div animate={pulseGlow} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-300/20 blur-[60px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 h-full flex flex-col justify-between items-center text-center">
              {/* Celular com animação flutuante */}
              <motion.div animate={floatUpAndDown} className="w-24 h-24 bg-emerald-50 rounded-[32px] border border-emerald-100 flex items-center justify-center mb-8 shadow-inner relative mt-6">
                <Smartphone className="text-emerald-500 relative z-10" size={40} strokeWidth={1.5} />
                {/* Ping no celular */}
                <div className="absolute top-2 right-2 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-75" />
              </motion.div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-3">Chave Digital</h3>
                <p className="text-slate-500 font-medium">Abra o veículo direto pelo Bluetooth do app e pé na estrada.</p>
              </div>
            </div>
          </motion.div>

          {/* CARD 3: Cobertura (Modo Dark Premium para contraste no grid) */}
          <motion.div variants={cardVariants} className="md:col-span-1 lg:col-span-1 bg-slate-900 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
            {/* Textura Granulada */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-[24px] border border-white/20 flex items-center justify-center mb-8">
                <ShieldCheck className="text-white" size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tighter mb-3">Cobertura <br/>Total.</h3>
                <p className="text-slate-400 font-medium mb-8">Seguro premium e KM livre inclusos, sem asteriscos.</p>
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:scale-110 transition-all duration-300 cursor-pointer">
                  <ArrowRight size={20} className="text-white" />
                </div>
              </div>
            </div>
            
            {/* Ícone gigante girando no fundo */}
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -right-16 -bottom-16 opacity-[0.03] pointer-events-none"
            >
              <ShieldCheck size={250} className="text-white" />
            </motion.div>
          </motion.div>

          {/* CARD 4: Largo Inferior (Pinos do Mapa Flutuando) */}
          <motion.div variants={cardVariants} className="md:col-span-3 lg:col-span-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[40px] p-10 md:p-14 shadow-[0_30px_80px_-20px_rgba(37,99,235,0.3)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
            
            <div className="relative z-10 text-center md:text-left">
              <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">Em todo o Brasil.</h3>
              <p className="text-blue-100 text-lg md:text-xl font-medium max-w-xl">
                Mais de 150 pontos de retirada estratégicos em aeroportos e grandes centros comerciais esperando por você.
              </p>
            </div>

            {/* Pinos de Mapa Assíncronos */}
            <div className="relative z-10 w-full md:w-auto h-32 md:h-auto flex-1 flex items-center justify-center md:justify-end gap-6 mr-4">
              <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl rotate-[-12deg]">
                 <MapPin className="text-cyan-500" size={28} />
              </motion.div>
              
              <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.7 }} className="w-24 h-24 bg-white/20 backdrop-blur-xl border border-white/30 rounded-[36px] flex items-center justify-center shadow-2xl z-10">
                 <MapPin className="text-white" size={40} />
              </motion.div>
              
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.2 }} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl rotate-[15deg]">
                 <MapPin className="text-blue-600" size={20} />
              </motion.div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}