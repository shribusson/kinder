'use client';

import { useState, useEffect } from 'react';
import { TimerWidget } from './components/TimerWidget';
import { DealCard } from './components/DealCard';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiCall } from '@/lib/api';

interface DashboardData {
  resource: {
    id: string;
    name: string;
  };
  assignedDeals: Array<any>;
  activeTimer: any | null;
  stats: {
    hoursWorked: number;
    dealsCompleted: number;
    dealsInProgress: number;
  };
}

export default function MechanicDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await apiCall('/mechanic/dashboard', {
        method: 'GET',
      });

      if (response.success) {
        setDashboard(response.data);
      } else {
        toast({
          title: 'Ошибка',
          description: response.error || 'Не удалось загрузить данные',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить панель',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTimer = async (dealId: string) => {
    if (!dashboard?.resource) return;

    try {
      const response = await apiCall('/mechanic/time/start', {
        method: 'POST',
        body: {
          dealId,
          resourceId: dashboard.resource.id,
        },
      });

      if (response.success) {
        toast({
          title: 'Успешно',
          description: 'Таймер запущен',
        });
        // Reload dashboard to get updated timer
        loadDashboard();
      }
    } catch (error: any) {
      console.error('Error starting timer:', error);
      toast({
        title: 'Ошибка',
        description: error?.response?.data?.message || 'Не удалось запустить таймер',
        variant: 'destructive',
      });
    }
  };

  const handleTimerStopped = () => {
    // Reload dashboard after timer stopped
    loadDashboard();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">
            Не удалось загрузить данные
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Убедитесь, что вы авторизованы как механик
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      {/* Active Timer Widget - Sticky on mobile */}
      <TimerWidget timer={dashboard.activeTimer} onTimerStopped={handleTimerStopped} />

      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Привет, {dashboard.resource.name}!
          </h1>
          <p className="text-gray-600">Ваши заказы на сегодня</p>
        </div>

        {/* Today's Stats - Horizontal scroll on mobile */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-900">
            Статистика за сегодня
          </h2>
          <div className="flex gap-3 overflow-x-auto snap-x pb-2">
            <StatCard
              label="Часов отработано"
              value={dashboard.stats.hoursWorked}
              unit="ч"
            />
            <StatCard
              label="Выполнено"
              value={dashboard.stats.dealsCompleted}
              unit="шт"
            />
            <StatCard
              label="В работе"
              value={dashboard.stats.dealsInProgress}
              unit="шт"
            />
          </div>
        </section>

        {/* Assigned Deals - Single column on mobile */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-900">
            Мои заказы ({dashboard.assignedDeals.length})
          </h2>
          {dashboard.assignedDeals.length === 0 ? (
            <div className="bg-white border rounded-lg p-8 text-center">
              <p className="text-gray-500">У вас пока нет назначенных заказов</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboard.assignedDeals.map((deal) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  onStartTimer={handleStartTimer}
                  hasActiveTimer={!!dashboard.activeTimer}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  unit: string;
}

function StatCard({ label, value, unit }: StatCardProps) {
  return (
    <div className="bg-white border rounded-lg p-4 min-w-[140px] snap-start shadow-sm">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">
        {value}
        <span className="text-lg text-gray-600 ml-1">{unit}</span>
      </p>
    </div>
  );
}
