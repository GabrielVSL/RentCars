import { motion } from 'framer-motion';
import { Gauge, Smartphone, Headset, Sparkles } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

// Efeito Text Reveal (Sobe de baixo para cima mascarado)
const revealVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 250, damping: 25 } }
};

export function BentoAdvantages() {
  return (
    // Fundo transparente para herdar o Off-White do Layout
    <section className="bg-transparent py-24 px-4 overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16 md:w-2/3"
        >
          <motion.h2 variants={revealVariants} className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            A nova definição de <span className="text-blue-600">liberdade.</span>
          </motion.h2>
          <motion.p variants={revealVariants} className="text-slate-500 text-lg md:text-xl font-light">
            Desenhamos uma experiência de locação sem atritos. Esqueça burocracias, taxas ocultas ou filas intermináveis. O controle está nas suas mãos.
          </motion.p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Sombra Super Soft: shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] */}
          <motion.div variants={cardVariants} className="md:col-span-2 relative overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-white/50 p-10 group transition-transform hover:-translate-y-2 duration-500">
            <div className="absolute -right-10 -bottom-10 text-slate-50 group-hover:text-blue-50 transition-colors duration-500">
              <Gauge size={280} strokeWidth={1} />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-8 shadow-sm">
                <Gauge className="text-blue-600" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Quilometragem Livre</h3>
              <p className="text-slate-500 max-w-sm leading-relaxed">Dirija sem olhar para o hodômetro. Todos os nossos planos premium incluem quilometragem ilimitada para você ir mais longe.</p>
            </div>
          </motion.div>

          <motion.div variants={cardVariants} className="relative overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-white/50 p-10 transition-transform hover:-translate-y-2 duration-500">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-8 shadow-sm">
              <Smartphone className="text-emerald-500" size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">1-Click Cancel</h3>
            <p className="text-slate-500 leading-relaxed">Imprevistos acontecem. Cancele sua reserva gratuitamente até 24h antes da retirada.</p>
          </motion.div>

          <motion.div variants={cardVariants} className="relative overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-white/50 p-10 transition-transform hover:-translate-y-2 duration-500">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mb-8 shadow-sm">
              <Headset className="text-purple-500" size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Suporte Concierge</h3>
            <p className="text-slate-500 leading-relaxed">Atendimento humano 24/7. Problemas na estrada? Nós resolvemos em minutos.</p>
          </motion.div>

          <motion.div variants={cardVariants} className="md:col-span-2 relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 to-blue-700 shadow-[0_20px_50px_-12px_rgba(37,99,235,0.25)] p-10 transition-transform hover:-translate-y-2 duration-500">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-8 border border-white/20">
                <Sparkles className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Frota Impecável</h3>
              <p className="text-blue-100 max-w-md leading-relaxed">Veículos do ano, com menos de 10.000 km rodados, higienização de padrão hospitalar e revisões rigorosas.</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}