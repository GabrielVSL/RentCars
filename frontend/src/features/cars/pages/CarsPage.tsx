'use client';

import { useState, useEffect } from 'react';
import { Loader2, Car } from 'lucide-react'; // Importamos o Car para o Empty State
import { motion } from 'framer-motion';
import { api } from '@/services/api';

import { CarsFilter } from '../components/CarsFilter';
import { CarCard } from '../components/CarCard';
import { BookingModal, Automovel } from '../components/BookingModal';

export default function CarsPage() {
    const [carros, setCarros] = useState<Automovel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCar, setSelectedCar] = useState<Automovel | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterDates, setFilterDates] = useState({ start: '', end: '' });

    useEffect(() => {
        const saved = localStorage.getItem('rentcars_search_params');
        if (saved) {
            const p = JSON.parse(saved);
            setFilterDates({ start: p.pickupDate || '', end: p.returnDate || '' });
        }
    }, []);

    useEffect(() => {
        const fetchCars = async () => {
            setIsLoading(true);
            try {
                let url = '/api/automoveis';
                if (filterDates.start && filterDates.end) {
                    url += `?inicio=${filterDates.start}T00:00:00&fim=${filterDates.end}T23:59:59`;
                }
                const response = await api.get(url);
                setCarros(response.data);
            } catch (error) { 
                console.error("Erro ao buscar carros:", error); 
            } finally { 
                setIsLoading(false); 
            }
        };
        fetchCars();
    }, [filterDates.start, filterDates.end]);

    const handleOpenBooking = (car: Automovel) => {
        setSelectedCar(car);
        setIsModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F5F7] pt-10 pb-32 selection:bg-blue-500/30">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">

                <CarsFilter 
                    start={filterDates.start} 
                    end={filterDates.end} 
                    onDateChange={(start, end) => setFilterDates({ start, end })} 
                    onClear={() => {
                        setFilterDates({ start: '', end: '' });
                        localStorage.removeItem('rentcars_search_params');
                    }}
                />

                <header className="mb-16">
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
                        Frota <span className="text-blue-600">Veicular.</span>
                    </h1>
                    <p className="text-slate-500 mt-4 text-xl font-medium max-w-2xl">
                        Veículos selecionados rigorosamente para garantir a melhor experiência na estrada.
                    </p>
                </header>

                {/* A MÁGICA DO EMPTY STATE AQUI */}
                {carros.length === 0 ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[40px] shadow-sm border border-slate-100">
                        <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mb-6">
                            <Car className="text-slate-300" size={48} />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Nenhum veículo disponível</h3>
                        <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">Todos os nossos carros estão rodando por aí nas datas selecionadas. Tente alterar o período da sua viagem.</p>
                        <button
                            onClick={() => {
                                setFilterDates({ start: '', end: '' });
                                localStorage.removeItem('rentcars_search_params');
                            }}
                            className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-600 transition-all shadow-lg"
                        >
                            Limpar Filtro de Datas
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {carros.map((carro, idx) => (
                            <CarCard 
                                key={carro.id} 
                                carro={carro} 
                                index={idx} 
                                onSelect={handleOpenBooking} 
                            />
                        ))}
                    </div>
                )}
            </div>

            <BookingModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                car={selectedCar} 
            />
        </div>
    );
}