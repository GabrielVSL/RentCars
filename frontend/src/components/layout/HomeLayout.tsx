'use client';

import Header from '@/components/layout/Header';
import AuthModule from '@/components/auth/AuthModule';
import HeroVideo from '@/features/booking/HeroVideo';
import SearchSection from '@/features/booking/SearchSection';
import { TrustMarquee } from '@/features/home/TrustMarquee';
import { BentoAdvantages } from '@/features/home/BentoAdvantages';

export default function HomeLayout() {
  const defaultVideoSrc = 'https://res.cloudinary.com/db4qol7fr/video/upload/v1775671109/14155424_3840_2160_30fps_nltdls.mp4';
  const defaultPosterSrc = 'https://res.cloudinary.com/db4qol7fr/video/upload/v1775671109/14155424_3840_2160_30fps_nltdls.jpg';

  return (
    // Aplicando a cor premium (Off-White) em toda a extensão do site
    <div className="min-h-screen flex flex-col bg-[#F5F5F7]">
      <Header transparent={true} />
      <AuthModule />
      
      <main className="flex-1 flex flex-col">
        
        {/* 1. O Vídeo (Agora com a base derretendo para o Off-White) */}
        <section className="relative h-screen">
          <HeroVideo videoSrc={defaultVideoSrc} posterSrc={defaultPosterSrc} />
        </section>
        
        {/* 2. As Marcas */}
        <TrustMarquee />
        
        {/* 3. O Bento Grid */}
        <BentoAdvantages />

        {/* 4. O CTA Final */}
        <section className="relative py-24 px-4 overflow-hidden">
          <div className="container mx-auto max-w-5xl relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                Pronto para assumir a <span className="text-blue-600">direção?</span>
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                Selecione as datas e encontre o veículo perfeito para a sua próxima viagem. O processo leva menos de 2 minutos.
              </p>
            </div>
            
            {/* O formulário SearchSection */}
            <div className="transform hover:scale-[1.01] transition-transform duration-500">
              <SearchSection />
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}