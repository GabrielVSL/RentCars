'use client';

import Header from '@/components/layout/Header';
import HeroVideo from '@/features/booking/HeroVideo';
import SearchSection from '@/features/booking/SearchSection';
import { TrustMarquee } from '@/features/home/TrustMarquee';
import { BentoAdvantages } from '@/features/home/BentoAdvantages';

export default function HomeLayout() {
  const defaultVideoSrc = 'https://res.cloudinary.com/db4qol7fr/video/upload/v1775671109/14155424_3840_2160_30fps_nltdls.mp4';
  const defaultPosterSrc = 'https://res.cloudinary.com/db4qol7fr/video/upload/v1775671109/14155424_3840_2160_30fps_nltdls.jpg';

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7]">
      <Header transparent={true} />
      
      <main className="flex-1">
        
        {/* ATO 1: O GANCHO (Hero + Busca Sobreposta) */}
        <section className="relative">
          <HeroVideo videoSrc={defaultVideoSrc} posterSrc={defaultPosterSrc} />
          <div className="relative z-30 pt-12">
            <SearchSection />
          </div>
        </section>
        
        {/* ATO 2: A AUTORIDADE (Marcas que confiam) */}
        <TrustMarquee />
        
        {/* ATO 3: A QUEBRA DE OBJEÇÕES (Bento Grid Premium) */}
        <BentoAdvantages />

        {/* ATO 4: O CLÍMAX (CTA Final Irresistível) */}
        <section className="py-32 px-6 bg-white overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative">
            {/* Brilho de fundo sutil para dar profundidade */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-100/50 blur-[120px] rounded-full pointer-events-none" />
            
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-tight relative z-10">
              A estrada está chamando. <br />
              <span className="text-blue-600">Responda.</span>
            </h2>
            <p className="text-slate-500 text-xl md:text-2xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed relative z-10">
              Escolha seu veículo, aprove seu crédito e comece sua jornada em menos de 2 minutos.
            </p>
            
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="relative z-10 bg-slate-900 text-white text-lg font-bold px-12 py-5 rounded-full hover:bg-blue-600 hover:scale-105 transition-all shadow-2xl hover:shadow-blue-500/20"
            >
              Explorar Frota Agora
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}