'use client';

import { Circuit } from '@/services/telemetryService';
import { SessionBookingModal, Automovel } from '@/features/booking/SessionBookingModal';

interface CircuitBookingModalProps {
  circuit: Circuit;
  availableCars: Automovel[];
  initialCar?: Automovel | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CircuitBookingModal({
  circuit,
  availableCars,
  initialCar,
  isOpen,
  onClose,
}: CircuitBookingModalProps) {
  return (
    <SessionBookingModal
      isOpen={isOpen}
      onClose={onClose}
      initialCircuitId={circuit.id}
      circuitCars={availableCars}
      initialCar={initialCar || availableCars[0] || null}
      lockCircuit={true}
      lockCar={false}
    />
  );
}
