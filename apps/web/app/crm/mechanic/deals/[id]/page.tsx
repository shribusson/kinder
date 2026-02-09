'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Clock, Car, Phone, PlayCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiCall } from '@/lib/api';

interface DealDetails {
  id: string;
  title: string;
  stage: string;
  amount: number;
  estimatedHours?: number;
  totalHoursSpent: number;
  lead: {
    name: string;
    phone?: string;
    email?: string;
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
    year?: number;
    licensePlate?: string;
    vin?: string;
    mileage?: number;
    serviceHistory: Array<{
      id: string;
      serviceDate: string;
      description: string;
      cost?: number;
      mileageAtService?: number;
    }>;
  };
  dealItems: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    service: {
      name: string;
      category: {
        name: string;
      };
    };
  }>;
  timeEntries: Array<{
    id: string;
    startedAt: string;
    endedAt: string | null;
    durationMinutes: number | null;
    notes?: string;
  }>;
}

const stageLabels: Record<string, string> = {
  diagnostics: 'Диагностика',
  planned: 'Запланирован',
  in_progress: 'В работе',
  ready: 'Готов',
  closed: 'Закрыт',
  cancelled: 'Отменён',
};

export default function MechanicDealDetail() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [deal, setDeal] = useState<DealDetails | null>(null);
  const [isStartingTimer, setIsStartingTimer] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDeal();
  }, [dealId]);

  const loadDeal = async () => {
    try {
      const response = await apiCall(`/mechanic/deals/${dealId}`, {
        method: 'GET',
      });

      if (response.success) {
        setDeal(response.data);
      }
    } catch (error) {
      console.error('Error loading deal:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить заказ',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTimer = async () => {
    setIsStartingTimer(true);
    try {
      // Get resource ID from dashboard
      const dashboardResponse = await apiCall('/mechanic/dashboard', {
        method: 'GET',
      });

      if (!dashboardResponse.success) {
        throw new Error('Failed to get resource ID');
      }

      const response = await apiCall('/mechanic/time/start', {
        method: 'POST',
        body: {
          dealId,
          resourceId: dashboardResponse.data.resource.id,
        },
      });

      if (response.success) {
        toast({
          title: 'Успешно',
          description: 'Таймер запущен',
        });
        router.push('/crm/mechanic');
      }
    } catch (error: any) {
      console.error('Error starting timer:', error);
      toast({
        title: 'Ошибка',
        description: error?.response?.data?.message || 'Не удалось запустить таймер',
        variant: 'destructive',
      });
    } finally {
      setIsStartingTimer(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">Заказ не найден</p>
        </div>
      </div>
    );
  }

  const carInfo = deal.vehicle
    ? `${deal.vehicle.brand.cyrillicName || deal.vehicle.brand.name} ${
        deal.vehicle.model.cyrillicName || deal.vehicle.model.name
      }${deal.vehicle.year ? ` ${deal.vehicle.year}` : ''}`
    : 'Не указан';

  const hasActiveTimer = deal.timeEntries.some(entry => !entry.endedAt);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="p-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-3 -ml-2 h-10 gap-2 touch-manipulation"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{deal.lead.name}</h1>
          <p className="text-sm text-gray-600 mt-1">
            Статус: {stageLabels[deal.stage] || deal.stage}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Start Timer Button */}
        {deal.stage === 'in_progress' && !hasActiveTimer && (
          <Button
            onClick={handleStartTimer}
            disabled={isStartingTimer}
            className="w-full h-12 gap-2 bg-green-600 hover:bg-green-700 touch-manipulation"
          >
            {isStartingTimer ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Запуск...
              </>
            ) : (
              <>
                <PlayCircle className="w-5 h-5" />
                Начать работу
              </>
            )}
          </Button>
        )}

        {/* Customer Info */}
        <section className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Контакты</h2>
          <div className="space-y-2">
            <p className="text-gray-900">{deal.lead.name}</p>
            {deal.lead.phone && (
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4" />
                <a href={`tel:${deal.lead.phone}`} className="underline">
                  {deal.lead.phone}
                </a>
              </div>
            )}
            {deal.lead.email && (
              <p className="text-gray-700">{deal.lead.email}</p>
            )}
          </div>
        </section>

        {/* Vehicle Info */}
        {deal.vehicle && (
          <section className="bg-white rounded-lg border p-4">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Car className="w-5 h-5" />
              Автомобиль
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Модель:</span>
                <span className="font-medium text-gray-900">{carInfo}</span>
              </div>
              {deal.vehicle.licensePlate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Гос. номер:</span>
                  <span className="font-mono font-medium text-gray-900">
                    {deal.vehicle.licensePlate}
                  </span>
                </div>
              )}
              {deal.vehicle.vin && (
                <div className="flex justify-between">
                  <span className="text-gray-600">VIN:</span>
                  <span className="font-mono text-xs text-gray-900">
                    {deal.vehicle.vin}
                  </span>
                </div>
              )}
              {deal.vehicle.mileage && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Пробег:</span>
                  <span className="font-medium text-gray-900">
                    {deal.vehicle.mileage.toLocaleString()} км
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Services */}
        {deal.dealItems.length > 0 && (
          <section className="bg-white rounded-lg border p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Услуги</h2>
            <div className="space-y-3">
              {deal.dealItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start pb-3 border-b last:border-0 last:pb-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.service.name}</p>
                    <p className="text-sm text-gray-600">{item.service.category.name}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-gray-900">
                      {(item.unitPrice * item.quantity).toLocaleString()} ₸
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-gray-600">
                        {item.quantity} × {item.unitPrice.toLocaleString()} ₸
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t flex justify-between items-center">
                <span className="font-semibold text-gray-900">Итого:</span>
                <span className="text-xl font-bold text-gray-900">
                  {deal.amount.toLocaleString()} ₸
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Time Tracking */}
        <section className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Время работы
          </h2>

          {deal.estimatedHours && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-900">Планируемое время:</span>
                <span className="font-semibold text-blue-900">
                  {deal.estimatedHours}ч
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-blue-900">Фактическое время:</span>
                <span className="font-semibold text-blue-900">
                  {deal.totalHoursSpent}ч
                </span>
              </div>
            </div>
          )}

          {deal.timeEntries.length === 0 ? (
            <p className="text-gray-500 text-sm">Время еще не засекалось</p>
          ) : (
            <div className="space-y-2">
              {deal.timeEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <div>
                    <p className="text-sm text-gray-900">
                      {new Date(entry.startedAt).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {entry.notes && (
                      <p className="text-xs text-gray-600">{entry.notes}</p>
                    )}
                  </div>
                  <span className="font-semibold text-gray-900">
                    {entry.durationMinutes
                      ? `${Math.round(entry.durationMinutes / 60 * 10) / 10}ч`
                      : 'Активен'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Service History */}
        {deal.vehicle && deal.vehicle.serviceHistory.length > 0 && (
          <section className="bg-white rounded-lg border p-4">
            <h2 className="font-semibold text-gray-900 mb-3">
              История обслуживания
            </h2>
            <div className="space-y-3">
              {deal.vehicle.serviceHistory.slice(0, 5).map((entry) => (
                <div key={entry.id} className="border-b pb-3 last:border-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm text-gray-600">
                      {new Date(entry.serviceDate).toLocaleDateString('ru-RU')}
                    </span>
                    {entry.mileageAtService && (
                      <span className="text-xs text-gray-500">
                        {entry.mileageAtService.toLocaleString()} км
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-900">{entry.description}</p>
                  {entry.cost && (
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {entry.cost.toLocaleString()} ₸
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
