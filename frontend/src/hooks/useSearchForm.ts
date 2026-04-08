import { useState, useCallback, useMemo } from 'react';
import { SearchParams, SearchFormData, DEFAULT_SEARCH, Location } from '@/types';

const parseDateFromString = (dateStr: string): Date => {
  return new Date(dateStr + 'T00:00:00');
};

const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const formatTimeForInput = (time: string): string => {
  return time.substring(0, 5);
};

export function useSearchForm(initialParams: SearchParams = DEFAULT_SEARCH) {
  const [searchParams, setSearchParams] = useState<SearchParams>(initialParams);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formData: SearchFormData = useMemo(() => ({
    pickupLocation: searchParams.location?.name || '',
    pickupDate: formatDateForInput(searchParams.dateRange.pickupDate),
    returnDate: formatDateForInput(searchParams.dateRange.returnDate),
    pickupTime: formatTimeForInput(searchParams.dateRange.pickupTime),
    returnTime: formatTimeForInput(searchParams.dateRange.returnTime),
  }), [searchParams]);

  const isPickupBeforeReturn = useMemo(() => {
    const pickup = new Date(searchParams.dateRange.pickupDate);
    const ret = new Date(searchParams.dateRange.returnDate);

    if (pickup > ret) return false;

    if (pickup.getTime() === ret.getTime()) {
      const pickupHour = parseInt(searchParams.dateRange.pickupTime.split(':')[0]);
      const returnHour = parseInt(searchParams.dateRange.returnTime.split(':')[0]);
      return pickupHour < returnHour;
    }
    return true;
  }, [searchParams.dateRange]);

  const rentalDays = useMemo(() => {
    const pickup = new Date(searchParams.dateRange.pickupDate);
    const ret = new Date(searchParams.dateRange.returnDate);
    const diffTime = Math.abs(ret.getTime() - pickup.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [searchParams.dateRange]);

  const setLocation = useCallback((location: Location | null) => {
    setSearchParams(prev => ({
      ...prev,
      location,
    }));
    if (location && errors.location) {
      setErrors(prev => ({ ...prev, location: '' }));
    }
  }, [errors]);

  const setPickupDate = useCallback((date: Date) => {
    setSearchParams(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        pickupDate: date,
      },
    }));
  }, []);

  const setReturnDate = useCallback((date: Date) => {
    setSearchParams(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        returnDate: date,
      },
    }));
  }, []);

  const setPickupTime = useCallback((time: string) => {
    setSearchParams(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        pickupTime: time,
      },
    }));
  }, []);

  const setReturnTime = useCallback((time: string) => {
    setSearchParams(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        returnTime: time,
      },
    }));
  }, []);

  const handleChange = useCallback((field: keyof SearchFormData, value: string) => {
    switch (field) {
      case 'pickupDate':
        setPickupDate(parseDateFromString(value));
        break;
      case 'returnDate':
        setReturnDate(parseDateFromString(value));
        break;
      case 'pickupTime':
        setPickupTime(value);
        break;
      case 'returnTime':
        setReturnTime(value);
        break;
    }
  }, [setPickupDate, setReturnDate, setPickupTime, setReturnTime]);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!searchParams.location) {
      newErrors.location = 'Selecione um local de retirada';
    }

    if (!searchParams.dateRange.pickupDate) {
      newErrors.pickupDate = 'Data de retirada obrigatória';
    }

    if (!searchParams.dateRange.returnDate) {
      newErrors.returnDate = 'Data de devolução obrigatória';
    }

    if (!isPickupBeforeReturn) {
      newErrors.dateRange = 'Data de devolução deve ser posterior à retirada';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [searchParams, isPickupBeforeReturn]);

  const handleSubmit = useCallback(async (onSuccess: (params: SearchParams) => void) => {
    return async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validate()) {
        return;
      }

      setIsSubmitting(true);

      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        onSuccess(searchParams);
      } catch (error) {
        setErrors({ submit: 'Erro ao buscar veículos. Tente novamente.' });
      } finally {
        setIsSubmitting(false);
      }
    };
  }, [searchParams, validate]);

  const resetForm = useCallback(() => {
    setSearchParams(DEFAULT_SEARCH);
    setErrors({});
  }, []);

  return {
    searchParams,
    formData,
    errors,
    isSubmitting,
    setLocation,
    setPickupDate,
    setReturnDate,
    setPickupTime,
    setReturnTime,
    isPickupBeforeReturn,
    rentalDays,
    handleChange,
    handleSubmit,
    validate,
    resetForm,
  };
}
