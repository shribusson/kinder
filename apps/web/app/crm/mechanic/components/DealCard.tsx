'use client';

import Link from 'next/link';
import { Clock, Car, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Deal {
  id: string;
  title: string;
  stage: string;
  lead: {
    name: string;
    phone?: string;
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
    licensePlate?: string;
  };
  estimatedHours?: number;
  timeEntries: Array<{
    durationMinutes: number | null;
  }>;
}

interface DealCardProps {
  deal: Deal;
  onStartTimer: (dealId: string) => void;
  hasActiveTimer: boolean;
}

const stageLabels: Record<string, string> = {
  diagnostics: 'Диагностика',
  planned: 'Запланирован',
  in_progress: 'В работе',
  ready: 'Готов',
  closed: 'Закрыт',
  cancelled: 'Отменён',
};

const stageColors: Record<string, string> = {
  diagnostics: 'bg-blue-100 text-blue-800',
  planned: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  ready: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function DealCard({ deal, onStartTimer, hasActiveTimer }: DealCardProps) {
  const carInfo = deal.vehicle
    ? `${deal.vehicle.brand.cyrillicName || deal.vehicle.brand.name} ${
        deal.vehicle.model.cyrillicName || deal.vehicle.model.name
      }`
    : 'Авто не указан';

  const totalMinutes = deal.timeEntries.reduce(
    (sum, entry) => sum + (entry.durationMinutes || 0),
    0
  );
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow touch-manipulation">
      <Link href={`/crm/mechanic/deals/${deal.id}`} className="block">
        <div className="mb-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-gray-900 truncate">
                {deal.lead.name}
              </h3>
              {deal.lead.phone && (
                <p className="text-sm text-gray-600">{deal.lead.phone}</p>
              )}
            </div>
            <span
              className={`inline-block px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ml-2 ${
                stageColors[deal.stage] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {stageLabels[deal.stage] || deal.stage}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
            <Car className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{carInfo}</span>
            {deal.vehicle?.licensePlate && (
              <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                {deal.vehicle.licensePlate}
              </span>
            )}
          </div>

          {deal.estimatedHours && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>
                План: {deal.estimatedHours}ч | Факт: {totalHours}ч
              </span>
            </div>
          )}
        </div>
      </Link>

      {deal.stage === 'in_progress' && !hasActiveTimer && (
        <Button
          onClick={(e) => {
            e.preventDefault();
            onStartTimer(deal.id);
          }}
          className="w-full h-11 gap-2 bg-green-600 hover:bg-green-700 touch-manipulation"
        >
          <PlayCircle className="w-5 h-5" />
          Начать работу
        </Button>
      )}
    </div>
  );
}
