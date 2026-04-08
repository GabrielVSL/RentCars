'use client';

import HeroVideo from './HeroVideo';
import SearchSection from './SearchSection';

interface SearchHeroProps {
  videoSrc?: string;
  posterSrc?: string;
}

export default function SearchHero({ videoSrc, posterSrc }: SearchHeroProps) {
  // Default placeholders - user will replace with real CDN URLs
  const defaultVideoSrc = 'https://res.cloudinary.com/db4qol7fr/video/upload/v1775671109/14155424_3840_2160_30fps_nltdls.mp4';
  const defaultPosterSrc = 'https://res.cloudinary.com/db4qol7fr/video/upload/v1775671109/14155424_3840_2160_30fps_nltdls.jpg';

  return (
    <>
      {/* Hero Video Section - 100vh fullscreen background video */}
      <HeroVideo videoSrc={videoSrc || defaultVideoSrc} posterSrc={posterSrc || defaultPosterSrc} />

      {/* Search Form Section - Scroll reveal below the hero */}
      <SearchSection />

      {/* Optional: Additional content sections can go below */}
      {/* <CarsPreview /> */}
    </>
  );
}
