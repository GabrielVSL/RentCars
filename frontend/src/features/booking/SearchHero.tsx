'use client';

import HeroVideo from './HeroVideo';
import SearchSection from './SearchSection';

interface SearchHeroProps {
  videoSrc?: string;
  posterSrc?: string;
}

export default function SearchHero({ videoSrc, posterSrc }: SearchHeroProps) {
  // Default placeholders
  const defaultVideoSrc = 'https://res.cloudinary.com/db4qol7fr/video/upload/v1775671109/14155424_3840_2160_30fps_nltdls.mp4';
  const defaultPosterSrc = 'https://res.cloudinary.com/db4qol7fr/video/upload/v1775671109/14155424_3840_2160_30fps_nltdls.jpg';

  return (
    <div className="relative bg-[#F5F5F7]">
      {/* Hero Video Section - 100vh */}
      <HeroVideo videoSrc={videoSrc || defaultVideoSrc} posterSrc={posterSrc || defaultPosterSrc} />

      {/* O Pulo do Gato: Margem negativa (-mt-32) puxa a busca para cima do vídeo! */}
      <div className="relative z-30 -mt-32 pb-20">
        <SearchSection />
      </div>
    </div>
  );
}