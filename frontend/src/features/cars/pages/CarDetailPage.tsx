'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, ChevronUp, Loader2, ArrowLeft } from 'lucide-react';
import { api } from '@/services/api';
import { BookingModal, Automovel } from '../components/BookingModal';
import { CarBlueprintSvg } from '../components/CarBlueprintSvg';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useAuthStore } from '@/store/useAuthStore';
import {
  getCarDetailSheet,
  getCarDisplaySpecs,
  resolveEditorialCarImage,
  resolveSideCarImage,
  resolveStudioCarImage,
} from '@/lib/carPresentation';

interface HeroAngleOption {
  id: string;
  label: string;
  src: string;
  isBannerCrop?: boolean;
}

export default function CarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { formatPrice } = useCurrencyStore();
  const { user } = useAuthStore();
  const isStaff = Boolean(user && user.role !== 'CLIENTE');
  const staffTarget = user?.role === 'BANCO' ? '/analises' : '/frota';

  const [car, setCar] = useState<Automovel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeAngleIdx, setActiveAngleIdx] = useState(0);
  const [showMoreSpecs, setShowMoreSpecs] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    setActiveAngleIdx(0);
    setShowMoreSpecs(false);

    const fetchCar = async () => {
      if (!id) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setNotFound(false);

      try {
        const res = await api.get(`/api/automoveis/${id}`);
        setCar(res.data);
      } catch {
        // Fallback caso o servidor esteja com versão anterior sem GET /{id}
        try {
          const allRes = await api.get('/api/automoveis');
          const list = Array.isArray(allRes.data) ? (allRes.data as Automovel[]) : [];
          const found = list.find((item) => String(item.id) === String(id)) ?? null;
          setCar(found);
          setNotFound(!found);
        } catch {
          setNotFound(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  const heroAngles = useMemo<HeroAngleOption[]>(() => {
    if (!car) return [];
    const studioSrc = resolveStudioCarImage(car);
    const sideSrc = resolveSideCarImage(car);
    const editorial = resolveEditorialCarImage(car);

    const options: HeroAngleOption[] = [];
    if (sideSrc) {
      options.push({ id: 'side', label: 'Perfil Lateral', src: sideSrc });
    }
    options.push({ id: 'studio', label: 'Estúdio 3/4', src: studioSrc });
    if (editorial.isDedicatedRear) {
      options.push({ id: 'rear', label: 'Traseira Pista', src: editorial.src, isBannerCrop: true });
    }
    return options;
  }, [car]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#08090C]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#FF1717]" size={34} />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
            Carregando especificações...
          </span>
        </div>
      </div>
    );
  }

  if (notFound || !car) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#08090C] text-white px-6 text-center">
        <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#FF1717] mb-3">
          404 · Veículo não localizado
        </p>
        <h1 className="text-3xl font-medium tracking-tight mb-3">
          Automóvel indisponível no box
        </h1>
        <p className="text-sm text-white/60 max-w-md mb-8">
          O modelo solicitado não foi encontrado no catálogo ativo. Volte à frota para explorar os supercarros disponíveis.
        </p>
        <Link
          to="/cars"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FF1717] text-white text-xs font-medium hover:bg-[#e01414] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Voltar para Frota</span>
        </Link>
      </div>
    );
  }

  const displaySpecs = getCarDisplaySpecs(car);
  const detailSheet = getCarDetailSheet(car);
  const studioImage = resolveStudioCarImage(car);
  const editorial = resolveEditorialCarImage(car);
  const activeAngle = heroAngles[activeAngleIdx] ?? heroAngles[0];

  return (
    <div className="min-h-screen bg-[#08090C] text-white pt-24 pb-24 selection:bg-[#FF1717] selection:text-white font-sans">
      {/* =====================================================================
          1. BREADCRUMB + TÍTULO DISPLAY MONUMENTAL + PALCO HERO DO CARRO
         ===================================================================== */}
      <section className="relative overflow-hidden pb-16 sm:pb-24">
        {/* Halo de iluminação de estúdio */}
        <div className="absolute top-36 left-1/2 -translate-x-1/2 w-[900px] h-[440px] bg-[radial-gradient(ellipse,rgba(255,255,255,0.06)_0%,transparent_68%)] pointer-events-none" />

        <div className="container mx-auto max-w-6xl px-6 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-white/45 mb-8 sm:mb-10" aria-label="Navegação estrutural">
            <Link to="/cars" className="hover:text-white transition-colors">
              Frota
            </Link>
            <ChevronRight size={12} className="text-white/30" />
            <span className="text-white/60">{car.marca}</span>
            <ChevronRight size={12} className="text-white/30" />
            <span className="text-white/90 font-medium">{car.modelo}</span>
          </nav>

          {/* Tipografia Monumental estilo estúdio automotivo */}
          <div className="relative select-none pointer-events-none mb-2 sm:-mb-6">
            <p className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-[0.06em] uppercase leading-[0.95] bg-gradient-to-b from-white/35 via-white/15 to-transparent bg-clip-text text-transparent">
              {detailSheet.heroTitleTop}
            </p>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-[0.04em] uppercase leading-[0.95] bg-gradient-to-b from-white/25 via-white/10 to-transparent bg-clip-text text-transparent">
              {detailSheet.heroTitleSub}
            </h1>
          </div>

          {/* Palco Principal do Veículo + Dots de Vista à Direita */}
          <div className="relative flex items-center justify-center my-2 sm:my-4">
            {/* Sombra realista de chão */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[72%] max-w-2xl h-10 rounded-full bg-black/90 blur-xl pointer-events-none" />

            <div className="w-full max-w-4xl h-56 sm:h-80 md:h-96 flex items-center justify-center relative">
              <AnimatePresence mode="wait">
                {activeAngle && (
                  <motion.img
                    key={activeAngle.id}
                    src={activeAngle.src}
                    alt={`${car.marca} ${car.modelo} — ${activeAngle.label}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className={`w-full h-full drop-shadow-[0_24px_38px_rgba(0,0,0,0.9)] ${
                      activeAngle.isBannerCrop
                        ? 'object-cover rounded-2xl max-w-3xl opacity-90'
                        : 'object-contain'
                    }`}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Pontos laterais à direita (seletor real de vistas do estúdio) */}
            {heroAngles.length > 1 && (
              <div
                className="hidden sm:flex flex-col items-center gap-3 absolute right-0 top-1/2 -translate-y-1/2 z-20"
                aria-label="Selecionar ângulo do veículo"
              >
                {heroAngles.map((angle, idx) => {
                  const isActive = idx === activeAngleIdx;
                  return (
                    <button
                      key={angle.id}
                      type="button"
                      onClick={() => setActiveAngleIdx(idx)}
                      title={angle.label}
                      aria-label={angle.label}
                      className={`transition-all cursor-pointer rounded-full ${
                        isActive
                          ? 'w-4 h-4 bg-[#FF1717] ring-4 ring-[#FF1717]/20'
                          : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/70'
                      }`}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Seletor discreto mobile para ângulos */}
          {heroAngles.length > 1 && (
            <div className="flex sm:hidden justify-center gap-2.5 mt-3 mb-4">
              {heroAngles.map((angle, idx) => (
                <button
                  key={angle.id}
                  type="button"
                  onClick={() => setActiveAngleIdx(idx)}
                  className={`px-3 py-1 rounded-full text-[11px] border transition-colors ${
                    idx === activeAngleIdx
                      ? 'border-[#FF1717] text-white bg-[#FF1717]/15'
                      : 'border-white/10 text-white/50'
                  }`}
                >
                  {angle.label}
                </button>
              ))}
            </div>
          )}

          {/* 3 Métricas Centrais Abaixo do Veículo (exatamente como a print) */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto text-center pt-6 sm:pt-8">
            <div>
              <p className="text-lg sm:text-xl font-medium tracking-tight text-white tabular-nums">
                {displaySpecs.accel}
              </p>
              <p className="text-[11px] sm:text-xs text-white/50 mt-1">
                Aceleração de 0 a 100 km/h
              </p>
            </div>
            <div>
              <p className="text-lg sm:text-xl font-medium tracking-tight text-white tabular-nums">
                {displaySpecs.power}
              </p>
              <p className="text-[11px] sm:text-xs text-white/50 mt-1">
                Potência máxima homologada
              </p>
            </div>
            <div>
              <p className="text-lg sm:text-xl font-medium tracking-tight text-white tabular-nums">
                {displaySpecs.topSpeed}
              </p>
              <p className="text-[11px] sm:text-xs text-white/50 mt-1">
                Velocidade máxima em circuito
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. SEÇÃO EDITORIAL ("Design & Engenharia" — Foto Dark à Esquerda + Texto à Direita)
         ===================================================================== */}
      <section className="py-16 sm:py-24 px-6 border-t border-white/[0.06]">
        <div className="container mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 items-center">
          <div className="md:col-span-6 relative">
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[#050608] border border-white/[0.06] flex items-center justify-center">
              {/* Vinheta radial e brilho vermelho sutil de pista */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(255,23,23,0.08)_0%,rgba(8,9,12,0.92)_78%)] z-10 pointer-events-none" />
              <img
                src={editorial.src}
                alt={`${car.marca} ${car.modelo} detalhe de design`}
                className={
                  editorial.isDedicatedRear
                    ? 'w-full h-full object-cover opacity-90'
                    : 'w-full h-full object-contain scale-[1.28] translate-x-6 brightness-90 contrast-115 drop-shadow-[0_18px_28px_rgba(0,0,0,0.9)]'
                }
                loading="lazy"
              />
            </div>
          </div>

          <div className="md:col-span-6 space-y-3.5">
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-white/45">
              {car.marca} · {displaySpecs.circuit}
            </p>
            <h2 className="text-2xl sm:text-4xl font-medium tracking-tight text-white">
              {detailSheet.designTitle}
            </h2>
            <p className="text-sm sm:text-base text-white/65 font-normal leading-relaxed">
              {detailSheet.designDescription}
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. CARACTERÍSTICAS TÉCNICAS COM BLUEPRINT VETORIAL NO CENTRO
         ===================================================================== */}
      <section className="py-16 sm:py-24 px-6 border-t border-white/[0.06]">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl sm:text-4xl font-medium tracking-tight text-white mb-14 sm:mb-16">
            Características
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
            {/* Coluna Esquerda: 5 Especificações */}
            <div className="md:col-span-4 space-y-6 text-center">
              {detailSheet.leftSpecs.map((spec) => (
                <div key={spec.label}>
                  <p className="text-[11px] text-white/45 mb-1">{spec.label}</p>
                  <p className="text-base sm:text-lg font-medium text-white tracking-tight">
                    {spec.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Centro: Wireframe Blueprint Top-Down SVG */}
            <div className="md:col-span-4 flex items-center justify-center py-4">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.06)_0%,transparent_70%)] pointer-events-none" />
                <CarBlueprintSvg
                  architecture={detailSheet.blueprint}
                  className="w-40 sm:w-48 h-auto text-white/80"
                />
              </div>
            </div>

            {/* Coluna Direita: 5 Especificações */}
            <div className="md:col-span-4 space-y-6 text-center">
              {detailSheet.rightSpecs.map((spec) => (
                <div key={spec.label}>
                  <p className="text-[11px] text-white/45 mb-1">{spec.label}</p>
                  <p className="text-base sm:text-lg font-medium text-white tracking-tight">
                    {spec.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Divisor e Toggle "Ver mais características" */}
          <div className="mt-14">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-x-0 h-[1px] bg-white/10" />
              <button
                type="button"
                onClick={() => setShowMoreSpecs((prev) => !prev)}
                className="relative z-10 inline-flex items-center gap-2 bg-[#08090C] px-5 py-1.5 text-xs font-medium text-white/65 hover:text-white transition-colors cursor-pointer"
              >
                <span>{showMoreSpecs ? 'Ocultar características' : 'Ver mais características'}</span>
                {showMoreSpecs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            <AnimatePresence>
              {showMoreSpecs && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-10 text-center">
                    {detailSheet.extraSpecs.map((extra) => (
                      <div
                        key={extra.label}
                        className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.07]"
                      >
                        <p className="text-[11px] text-white/45 mb-1">{extra.label}</p>
                        <p className="text-sm font-medium text-white/90">{extra.value}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. BLOCO FINAL DE CONVERSÃO (Estúdio 3/4 + Preço + CTA "Reservar Sessão")
         ===================================================================== */}
      <section className="pt-16 sm:pt-20 pb-8 px-6 border-t border-white/[0.06] relative overflow-hidden">
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[700px] h-[280px] bg-[radial-gradient(ellipse,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none" />

        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="relative flex flex-col items-center">
            {/* Nome + Preço posicionados de forma editorial acima/à direita */}
            <div className="w-full flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-2 sm:mb-0 sm:px-8">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/45">
                  {car.marca} ·{' '}
                  {car.circuitosDisponiveis && car.circuitosDisponiveis.length > 0
                    ? car.circuitosDisponiveis.map((c) => c.nome.split(' ')[0]).join(' · ')
                    : displaySpecs.circuit}
                </p>
              </div>
              <div className="sm:text-right">
                <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-white">
                  {car.modelo}
                </h3>
                <p className="text-xs sm:text-sm text-white/55 mt-0.5 tabular-nums">
                  a partir de <span className="text-white font-medium">{formatPrice(car.precoPorDia)}</span> / sessão
                </p>
              </div>
            </div>

            {/* Recorte 3/4 Studio */}
            <div className="relative w-full max-w-2xl h-56 sm:h-72 flex items-center justify-center my-2">
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[74%] h-8 rounded-full bg-black/90 blur-xl pointer-events-none" />
              <img
                src={studioImage}
                alt={`${car.marca} ${car.modelo}`}
                className="relative z-10 w-full h-full object-contain drop-shadow-[0_22px_32px_rgba(0,0,0,0.9)]"
                loading="lazy"
              />
            </div>

            {/* Botões de Ação */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
              {isStaff ? (
                <Link
                  to={staffTarget}
                  className="px-10 py-3 border border-white/20 bg-white/10 hover:bg-[#FF1717] hover:border-[#FF1717] text-white text-xs sm:text-sm font-medium tracking-wide rounded-full transition-all duration-200 shadow-lg active:scale-[0.98]"
                >
                  {user?.role === 'BANCO' ? 'Painel de Auditoria' : 'Gerenciar nos Boxes'}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsBookingOpen(true)}
                  className="px-10 py-3 border border-[#FF1717] bg-[#FF1717] hover:bg-[#e01414] text-white text-xs sm:text-sm font-medium tracking-wide rounded-full transition-all duration-200 cursor-pointer shadow-lg shadow-[#FF1717]/25 hover:shadow-[#FF1717]/40 active:scale-[0.98]"
                >
                  Reservar Sessão
                </button>
              )}

              <Link
                to="/cars"
                className="text-xs font-medium text-white/50 hover:text-white transition-colors px-4 py-2"
              >
                Ver toda a frota
              </Link>
            </div>
          </div>
        </div>
      </section>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        car={car}
      />
    </div>
  );
}
