'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiCall } from '@/lib/api';

interface TimeEntry {
  id: string;
  startedAt: string;
  deal: {
    id: string;
    title: string;
    lead: {
      name: string;
    };
    vehicle?: {
      brand: {
        cyrillicName?: string;
        name: string;
      };
      model: {
        cyrillicName?: string;
        name: string;
      };
    };
  };
}

interface TimerWidgetProps {
  timer: TimeEntry | null;
  onTimerStopped: () => void;
}

export function TimerWidget({ timer, onTimerStopped }: TimerWidgetProps) {
  const [elapsed, setElapsed] = useState(0);
  const [isStopping, setIsStopping] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!timer) {
      setElapsed(0);
      return;
    }

    const startTime = new Date(timer.startedAt).getTime();

    const updateElapsed = () => {
      setElapsed(Date.now() - startTime);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStop = async () => {
    if (!timer) return;

    setIsStopping(true);
    try {
      const response = await apiCall(`/mechanic/time/${timer.id}/stop`, {
        method: 'PUT',
      });

      if (response.success) {
        toast({
          title: 'Успешно',
          description: 'Таймер остановлен',
        });
        onTimerStopped();
      }
    } catch (error) {
      console.error('Error stopping timer:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось остановить таймер',
        variant: 'destructive',
      });
    } finally {
      setIsStopping(false);
    }
  };

  if (!timer) {
    return null;
  }

  const carInfo = timer.deal.vehicle
    ? `${timer.deal.vehicle.brand.cyrillicName || timer.deal.vehicle.brand.name} ${
        timer.deal.vehicle.model.cyrillicName || timer.deal.vehicle.model.name
      }`
    : '';

  return (
    <div className="sticky top-0 z-10 bg-yellow-100 border-b border-yellow-200 p-4 shadow-md">
      {/* Mobile-first layout */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 mb-1">Заказ в работе</p>
          <p className="font-semibold truncate text-gray-900">
            {timer.deal.lead.name}
          </p>
          {carInfo && (
            <p className="text-sm text-gray-700 truncate">{carInfo}</p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          {/* Large, readable timer */}
          <div className="text-3xl font-bold tabular-nums text-yellow-900">
            {formatDuration(elapsed)}
          </div>
        </div>
      </div>
      {/* Large touch-friendly stop button */}
      <Button
        onClick={handleStop}
        disabled={isStopping}
        className="w-full mt-3 h-12 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold touch-manipulation active:bg-red-800"
      >
        {isStopping ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Остановка...
          </>
        ) : (
          'Остановить таймер'
        )}
      </Button>
    </div>
  );
}
