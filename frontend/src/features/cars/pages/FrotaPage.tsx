'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, X, Loader2, AlertCircle, UploadCloud, Edit2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { carSchema, CarFormInputs } from '@/schemas/carSchema';
import { api } from '@/services/api';
import { toast } from '@/store/useToastStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { resolveStudioCarImage } from '@/lib/carPresentation';

interface Automovel {
  id: number;
  matricula: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  imageUrl?: string;
  precoPorDia: number;
  categoria?: string;
  potenciaCv?: number;
  aceleracao0a100?: string;
  velocidadeMaxima?: string;
  circuitosDisponiveis?: { id: string; nome: string }[];
}

const STUDIO_PRESETS = [
  { label: 'Porsche GT3 RS', url: '/cars/porsche-studio.webp' },
  { label: 'BMW M4 Comp', url: '/cars/bmw-studio.webp' },
  { label: 'AMG GT Track', url: '/cars/amg-studio.webp' },
  { label: 'Audi R8 V10', url: '/cars/audi-studio.webp' },
  { label: 'Cayman GT4 RS', url: '/cars/cayman-studio.webp' },
  { label: 'BMW M8 Comp', url: '/cars/m8-studio.webp' },
  { label: 'AMG Black Series', url: '/cars/amg-bs-studio.webp' },
  { label: 'Audi RS e-tron GT', url: '/cars/etrongt-studio.webp' },
];

export default function FrotaPage() {
  const { formatPrice } = useCurrencyStore();
  const [carros, setCarros] = useState<Automovel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [carroEditando, setCarroEditando] = useState<Automovel | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CarFormInputs>({
    resolver: zodResolver(carSchema),
  });

  const fetchCarros = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/automoveis/minha-frota');
      setCarros(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erro ao buscar frota:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCarros();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_PRESET || 'rentcars_preset');

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'db4qol7fr'}/image/upload`,
        { method: 'POST', body: formData }
      );

      const data = await res.json();
      if (data.secure_url) {
        setPreviewImage(data.secure_url);
      }
    } catch {
      toast.error('Erro ao subir a imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: CarFormInputs) => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...data,
        potenciaCv: Number.isNaN(data.potenciaCv) ? undefined : data.potenciaCv,
        imageUrl: previewImage || undefined,
      };

      if (carroEditando) {
        await api.put(`/api/automoveis/${carroEditando.id}`, payload);
        toast.success('Veículo atualizado no box.');
      } else {
        await api.post('/api/automoveis', payload);
        toast.success('Veículo adicionado à frota.');
      }

      await fetchCarros();
      fecharModal();
    } catch {
      toast.error('Erro ao salvar veículo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExcluir = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este veículo? Essa ação não pode ser desfeita.')) {
      try {
        await api.delete(`/api/automoveis/${id}`);
        setCarros((prev) => prev.filter((c) => c.id !== id));
        toast.success('Veículo removido da frota.');
      } catch {
        toast.error('Erro ao excluir veículo.');
      }
    }
  };

  const abrirModalEdicao = (carro: Automovel) => {
    setCarroEditando(carro);
    setPreviewImage(carro.imageUrl || null);
    reset({
      matricula: carro.matricula,
      marca: carro.marca,
      modelo: carro.modelo,
      ano: carro.ano,
      placa: carro.placa,
      precoPorDia: carro.precoPorDia,
      categoria: carro.categoria || 'GT3',
      potenciaCv: carro.potenciaCv || 525,
      aceleracao0a100: carro.aceleracao0a100 || '3.2s',
      velocidadeMaxima: carro.velocidadeMaxima || '296 km/h',
    });
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setCarroEditando(null);
    setPreviewImage(null);
    reset({
      matricula: '',
      marca: '',
      modelo: '',
      ano: new Date().getFullYear(),
      placa: '',
      precoPorDia: 0,
      categoria: 'GT3',
      potenciaCv: 525,
      aceleracao0a100: '3.2s',
      velocidadeMaxima: '296 km/h',
    });
  };

  const carrosFiltrados = carros.filter(
    (c) =>
      c.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.marca.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputClass =
    'w-full bg-white/[0.04] border border-white/15 text-white placeholder:text-white/35 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FF1717] transition-colors';

  return (
    <div className="min-h-screen bg-[#08090C] text-white pt-28 pb-24 selection:bg-[#FF1717] selection:text-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Cabeçalho Editorial Escuro */}
        <header className="pb-8 border-b border-white/10 mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#FF1717] mb-2">
              Race Control · Boxes &amp; Máquinas
            </p>
            <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-white">
              Gestão de Frota
            </h1>
            <p className="text-white/55 text-sm mt-2">
              Gerencie os supercarros disponíveis para sessões cronometradas e tarifas base de pista.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-[#FF1717] hover:bg-[#e01414] text-white px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#FF1717]/25 shrink-0"
          >
            <Plus size={15} />
            <span>Novo Veículo</span>
          </button>
        </header>

        {/* Busca inline minimalista */}
        <div className="mb-12 flex items-center justify-between gap-4 border-b border-white/10 pb-3">
          <div className="relative flex-1 max-w-md flex items-center">
            <Search className="text-white/35 mr-3 shrink-0" size={16} />
            <input
              type="text"
              placeholder="Filtrar por modelo ou montadora..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm text-white placeholder:text-white/35 outline-none"
            />
          </div>
          <span className="text-[11px] font-mono text-white/40 uppercase tracking-widest">
            {carrosFiltrados.length} em operação
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-white/45">
            <Loader2 className="animate-spin text-[#FF1717]" size={28} />
            <span className="text-xs font-mono uppercase tracking-widest">Carregando boxes...</span>
          </div>
        ) : carrosFiltrados.length === 0 ? (
          <div className="py-20 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-medium text-white">Nenhum veículo encontrado</h3>
              <p className="text-sm text-white/50 mt-1">
                Ajuste a busca ou cadastre um novo supercarro nos boxes oficiais.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-medium text-white border border-white/20 hover:border-[#FF1717] px-6 py-2.5 rounded-full transition-colors cursor-pointer"
            >
              Adicionar primeiro veículo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14">
            <AnimatePresence>
              {carrosFiltrados.map((carro) => (
                <motion.div
                  key={carro.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="group flex flex-col"
                >
                  {/* Topo + ações */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-mono text-white/45 uppercase tracking-[0.2em]">
                        {carro.marca} · {carro.ano}
                      </p>
                      <h3 className="text-lg font-medium text-white truncate mt-0.5">
                        {carro.modelo}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => abrirModalEdicao(carro)}
                        className="p-2 rounded-full border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
                        title="Editar veículo"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExcluir(carro.id)}
                        className="p-2 rounded-full border border-white/10 text-white/60 hover:text-rose-400 hover:border-rose-500/40 transition-colors cursor-pointer"
                        title="Excluir veículo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Palco transparente sem fundo branco */}
                  <div className="relative h-44 w-full flex items-center justify-center my-2">
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[75%] h-5 rounded-full bg-black/80 blur-lg pointer-events-none" />
                    <img
                      src={resolveStudioCarImage(carro)}
                      alt={carro.modelo}
                      className="relative z-10 w-full h-full object-contain drop-shadow-[0_14px_20px_rgba(0,0,0,0.85)] group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  </div>

                  {/* Dados em linhas ultrafinas */}
                  <div className="border-t border-white/10 pt-3.5 mt-2 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-[10px] font-mono uppercase text-white/40">Sessão Base</p>
                      <p className="font-medium text-white tabular-nums mt-0.5">
                        {formatPrice(carro.precoPorDia)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono uppercase text-white/40">Placa</p>
                      <p className="font-mono text-white/80 mt-0.5">{carro.placa}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-mono uppercase text-white/40">Matrícula</p>
                      <p className="font-mono text-white/80 truncate mt-0.5">{carro.matricula}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Modal Dark Luxury de Cadastro/Edição */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={fecharModal}
                className="absolute inset-0 bg-black/75 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                className="relative w-full max-w-xl bg-[#0D1017] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="px-7 py-5 border-b border-white/10 flex items-center justify-between shrink-0">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#FF1717]">
                      Homologação de Box
                    </p>
                    <h2 className="text-lg font-medium text-white mt-0.5">
                      {carroEditando ? 'Editar Veículo' : 'Novo Veículo'}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={fecharModal}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.06] text-white/60 hover:text-white cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="p-7 overflow-y-auto custom-scrollbar">
                  {/* Área de Imagem Studio: URL direta + Presets + Upload */}
                  <div className="mb-6 space-y-3">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-white/55">
                      Imagem Studio (URL, Preset ou Upload)
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-36 border border-dashed border-white/20 hover:border-[#FF1717] rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/[0.02]"
                    >
                      {isUploading ? (
                        <Loader2 className="animate-spin text-[#FF1717]" size={26} />
                      ) : previewImage ? (
                        <div className="relative w-full h-full p-3 flex items-center justify-center group">
                          <img src={previewImage} alt="Preview" className="h-full object-contain" />
                          <span className="absolute bottom-2 right-3 text-[10px] font-mono uppercase bg-black/70 px-2.5 py-1 rounded text-white/80">
                            Trocar foto
                          </span>
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="text-white/40 mb-2" size={26} />
                          <p className="text-xs font-medium text-white/75">
                            Clique para enviar foto (.webp / .png) ou selecione um preset abaixo
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <input
                      type="text"
                      value={previewImage || ''}
                      onChange={(e) => setPreviewImage(e.target.value || null)}
                      placeholder="/cars/porsche-studio.webp ou https://..."
                      className={inputClass}
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {STUDIO_PRESETS.map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => setPreviewImage(preset.url)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono border transition-colors cursor-pointer ${
                            previewImage === preset.url
                              ? 'bg-[#FF1717] text-white border-[#FF1717]'
                              : 'bg-white/[0.03] text-white/60 border-white/10 hover:text-white'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Formulário */}
                  <form id="carForm" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/55 mb-1.5">
                        Matrícula
                      </label>
                      <input {...register('matricula')} className={inputClass} />
                      {errors.matricula && (
                        <span className="text-rose-400 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {errors.matricula.message}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/55 mb-1.5">
                        Marca
                      </label>
                      <input {...register('marca')} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/55 mb-1.5">
                        Modelo
                      </label>
                      <input {...register('modelo')} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/55 mb-1.5">
                        Ano
                      </label>
                      <input type="number" {...register('ano', { valueAsNumber: true })} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/55 mb-1.5">
                        Placa
                      </label>
                      <input {...register('placa')} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/55 mb-1.5">
                        Categoria Track
                      </label>
                      <select {...register('categoria')} className={`${inputClass} bg-[#0D1017]`}>
                        <option value="GT3">GT3</option>
                        <option value="GT2">GT2</option>
                        <option value="GT4">GT4</option>
                        <option value="SUPERCAR">SUPERCAR</option>
                        <option value="HYPERCAR">HYPERCAR</option>
                        <option value="ELECTRIC">ELECTRIC</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/55 mb-1.5">
                        Potência (cv)
                      </label>
                      <input
                        type="number"
                        {...register('potenciaCv', { valueAsNumber: true })}
                        placeholder="Ex: 525"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/55 mb-1.5">
                        0–100 km/h
                      </label>
                      <input
                        {...register('aceleracao0a100')}
                        placeholder="Ex: 3.2s"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/55 mb-1.5">
                        Velocidade Máxima
                      </label>
                      <input
                        {...register('velocidadeMaxima')}
                        placeholder="Ex: 296 km/h"
                        className={inputClass}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/55 mb-1.5">
                        Valor Base da Sessão (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register('precoPorDia', { valueAsNumber: true })}
                        placeholder="Ex: 3500.00"
                        className={inputClass}
                      />
                      {errors.precoPorDia && (
                        <span className="text-rose-400 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {errors.precoPorDia.message}
                        </span>
                      )}
                    </div>
                  </form>
                </div>

                <div className="px-7 py-5 border-t border-white/10 flex justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={fecharModal}
                    className="px-5 py-2.5 rounded-full text-xs font-medium text-white/65 hover:text-white border border-white/10 hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    form="carForm"
                    disabled={isSubmitting || isUploading}
                    className="bg-[#FF1717] hover:bg-[#e01414] text-white px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : 'Salvar Veículo'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
