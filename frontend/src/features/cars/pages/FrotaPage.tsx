'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, CarFront, X, Loader2, AlertCircle, UploadCloud, Edit2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { carSchema, CarFormInputs } from '@/schemas/carSchema';
import { api } from '@/services/api';

interface Automovel {
  id: number;
  matricula: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  imageUrl?: string; // Agora recebemos a imagem do Java
}

export default function FrotaPage() {
  const [carros, setCarros] = useState<Automovel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para o fluxo de Imagem e Edição
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [carroEditando, setCarroEditando] = useState<Automovel | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CarFormInputs>({
    resolver: zodResolver(carSchema)
  });

  const fetchCarros = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/automoveis');
      setCarros(response.data);
    } catch (error) {
      console.error("Erro ao buscar frota:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCarros(); }, []);

  // --- LÓGICA DE UPLOAD CLOUDINARY ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'rentcars_preset'); // O nome que você deu lá no site

      // ATENÇÃO: Troque "SEU_CLOUD_NAME" pelo seu nome real do Cloudinary
      const res = await fetch('https://api.cloudinary.com/v1_1/db4qol7fr/image/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (data.secure_url) {
        setPreviewImage(data.secure_url);
      }
    } catch (error) {
      alert("Erro ao subir a imagem.");
    } finally {
      setIsUploading(false);
    }
  };

  // --- LÓGICA DE SALVAR (CRIAR ou ATUALIZAR) ---
  const onSubmit = async (data: CarFormInputs) => {
    try {
      setIsSubmitting(true);
      
      const payload = { ...data, imageUrl: previewImage };

      if (carroEditando) {
        await api.put(`/api/automoveis/${carroEditando.id}`, payload);
      } else {
        await api.post('/api/automoveis', payload);
      }
      
      await fetchCarros();
      fecharModal();
    } catch (error) {
      alert("Erro ao salvar veículo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- LÓGICA DE EXCLUIR ---
  const handleExcluir = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este veículo? Essa ação não pode ser desfeita.")) {
      try {
        await api.delete(`/api/automoveis/${id}`);
        setCarros(carros.filter(c => c.id !== id));
      } catch (error) {
        alert("Erro ao excluir veículo.");
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
      placa: carro.placa
    });
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setCarroEditando(null);
    setPreviewImage(null);
    reset({ matricula: '', marca: '', modelo: '', ano: new Date().getFullYear(), placa: '' });
  };

  const carrosFiltrados = carros.filter(c => 
    c.modelo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.marca.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestão de Frota</h1>
            <p className="text-slate-500 mt-1">Gerencie os veículos da sua empresa.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-sm">
            <Plus size={16} /> Novo Veículo
          </button>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Buscar por modelo ou marca..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/60 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 className="animate-spin mb-4" size={32} />
          </div>
        ) : carrosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 bg-white border border-dashed border-slate-200 rounded-3xl">
            <CarFront size={32} className="text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">Nenhum veículo encontrado</h3>
            <button onClick={() => setIsModalOpen(true)} className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-2">Adicionar o primeiro veículo</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {carrosFiltrados.map((carro) => (
                <motion.div key={carro.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="group bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col relative overflow-hidden">
                  
                  {/* Botões de Ação Overlay */}
                  <div className="absolute top-7 right-7 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => abrirModalEdicao(carro)} className="p-2 bg-white/90 backdrop-blur text-slate-700 hover:text-blue-600 rounded-full shadow-sm">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleExcluir(carro.id)} className="p-2 bg-white/90 backdrop-blur text-slate-700 hover:text-red-600 rounded-full shadow-sm">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Imagem do Carro ou Placeholder */}
                  <div className="aspect-[16/9] w-full bg-slate-100 rounded-2xl mb-5 flex items-center justify-center overflow-hidden">
                    {carro.imageUrl ? (
                      <img src={carro.imageUrl} alt={carro.modelo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <CarFront className="text-slate-300 w-16 h-16" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-400 tracking-wider uppercase mb-1">{carro.marca} • {carro.ano}</p>
                    <h3 className="text-lg font-bold text-slate-900 mb-4">{carro.modelo}</h3>
                    <div className="flex justify-between border-t border-slate-50 pt-4 text-sm">
                      <div><p className="text-slate-400 text-xs">Placa</p><p className="font-medium text-slate-700">{carro.placa}</p></div>
                      <div className="text-right"><p className="text-slate-400 text-xs">Matrícula</p><p className="font-medium text-slate-700">{carro.matricula}</p></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Modal de Cadastro/Edição com Imagem */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={fecharModal} className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                  <h2 className="text-xl font-bold text-slate-900">{carroEditando ? 'Editar Veículo' : 'Novo Veículo'}</h2>
                  <button onClick={fecharModal} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"><X size={18} /></button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar">
                  {/* Área de Upload */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Foto do Veículo</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${previewImage ? 'border-transparent bg-slate-50 p-1' : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 bg-slate-50'}`}
                    >
                      {isUploading ? (
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                      ) : previewImage ? (
                        <div className="relative w-full h-full rounded-xl overflow-hidden group">
                           <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <p className="text-white text-sm font-medium">Trocar foto</p>
                           </div>
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="text-slate-400 mb-2" size={32} />
                          <p className="text-sm font-medium text-slate-600">Clique para enviar uma foto</p>
                          <p className="text-xs text-slate-400 mt-1">PNG, JPG até 5MB</p>
                        </>
                      )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  </div>

                  {/* Formulário */}
                  <form id="carForm" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-5">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Matrícula</label>
                      <input {...register('matricula')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all" />
                      {errors.matricula && <span className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.matricula.message}</span>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Marca</label>
                      <input {...register('marca')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Modelo</label>
                      <input {...register('modelo')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Ano</label>
                      <input type="number" {...register('ano', { valueAsNumber: true })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Placa</label>
                      <input {...register('placa')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400" />
                    </div>
                  </form>
                </div>

                <div className="px-8 py-5 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                  <button type="button" onClick={fecharModal} className="px-5 py-2.5 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancelar</button>
                  <button type="submit" form="carForm" disabled={isSubmitting || isUploading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all shadow-md flex items-center gap-2">
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Salvar Veículo'}
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