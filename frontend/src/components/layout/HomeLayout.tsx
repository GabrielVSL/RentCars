'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroVideo from '@/features/booking/HeroVideo';
import { EditorialRideBanner } from '@/features/home/EditorialRideBanner';
import { BrandShowcaseStrip } from '@/features/home/BrandShowcaseStrip';
import { FleetCompareSection } from '@/features/home/FleetCompareSection';
import { ApexPaySection } from '@/features/home/ApexPaySection';
import { BookingModal, Automovel } from '@/features/cars/components/BookingModal';
import { api } from '@/services/api';

export default function HomeLayout() {
  const [cars, setCars] = useState<Automovel[]>([]);
  const [isLoadingCars, setIsLoadingCars] = useState(true);
  const [focusedBrand, setFocusedBrand] = useState<{ brand: string; seq: number } | null>(null);
  const [selectedCar, setSelectedCar] = useState<Automovel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    api
      .get('/api/automoveis')
      .then((res) => setCars(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCars([]))
      .finally(() => setIsLoadingCars(false));
  }, []);

  const handleOpenBooking = (car: Automovel) => {
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08090C] text-white selection:bg-[#FF1717] selection:text-white">
      <Header transparent={true} />

      <main className="flex-1">
        {/* 1. Hero Cinematográfica */}
        <HeroVideo videoSrc="/hero.mp4" posterSrc="/hero-poster.jpg" />

        <div id="main-content" />

        {/* 2. Banner Editorial */}
        <EditorialRideBanner />

        {/* 3. Faixa de Marcas com Spotlight */}
        <BrandShowcaseStrip
          onSelectBrand={(brand) =>
            setFocusedBrand((prev) => ({ brand, seq: (prev?.seq ?? 0) + 1 }))
          }
        />

        {/* 4. Comparativo Interativo de Frota sem Fundo */}
        <FleetCompareSection
          cars={cars}
          isLoading={isLoadingCars}
          focusedBrand={focusedBrand}
          onSelectCar={handleOpenBooking}
        />

        {/* 5. Seção ApexPay (Cartão 3D, Tiers & Crédito de Pista) */}
        <ApexPaySection />
      </main>

      <Footer />

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        car={selectedCar}
      />
    </div>
  );
}
