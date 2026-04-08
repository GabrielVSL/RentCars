'use client';

import Header from '@/components/layout/Header.tsx';
import { SearchHero } from '@/features/booking';

export default function HomeLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Floating transparent header - no layout shift */}
      <Header transparent={true} />
      {/* Fullscreen hero content - no padding interference */}
      <main className="flex-1">
        <SearchHero />
      </main>
    </div>
  );
}
