'use client';

import { SessionBookingModal, Automovel } from '@/features/booking/SessionBookingModal';

export type { Automovel };

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  car: Automovel | null;
}

export function BookingModal({ isOpen, onClose, car }: BookingModalProps) {
  return (
    <SessionBookingModal
      isOpen={isOpen}
      onClose={onClose}
      initialCar={car}
      lockCar={true}
      lockCircuit={false}
    />
  );
}
