'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DndContext, closestCenter, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconEdit, IconGripVertical } from '@tabler/icons-react';
import DealModal from './DealModal';
import { apiBaseUrl, getAuthHeaders } from '@/app/lib/api';
import { CRM_VISIBLE_DEAL_STAGES, isCrmVisibleDealStage, mapCrmStageToVisible } from '@kinder/shared';

interface Lead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface Deal {
  id: string;
  leadId: string;
  title: string;
  stage: string;
  amount: number;
  revenue?: number;
  metadata?: {
    failReason?: string;
    guaranteeUntil?: string;
  };
  lead?: Lead;
}

interface DealsKanbanProps {
  initialDeals: Deal[];
}

type VisibleStage = (typeof CRM_VISIBLE_DEAL_STAGES)[number];

const VISIBLE_STAGES: Array<{ value: VisibleStage; label: string; color: string }> = [
  { value: 'diagnostics', label: 'Контакт', color: 'bg-indigo-100 border-indigo-200' },
  { value: 'planned', label: 'Запись', color: 'bg-purple-100 border-purple-200' },
  { value: 'in_progress', label: 'Сервис', color: 'bg-yellow-100 border-yellow-200' },
];

function isVisibleStage(value: string): value is VisibleStage {
  return isCrmVisibleDealStage(value);
}

function SortableDealCard({ deal, onEdit }: { deal: Deal; onEdit: (deal: Deal) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group rounded-lg border border-slate-200 bg-white px-3 py-3 hover:border-orange-300 hover:shadow-md transition-all cursor-move"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <Link
            href={`/crm/deals/${deal.id}`}
            className="font-medium text-slate-900 hover:text-orange-600 text-sm block mb-1 truncate"
          >
            {deal.title}
          </Link>
          {deal.lead && (
            <p className="text-xs text-slate-500 mb-2 truncate">
              {deal.lead.name}
            </p>
          )}
          <p className="text-sm font-semibold text-slate-900">
            {deal.amount.toLocaleString()} ₸
          </p>
          {deal.revenue && (
            <p className="text-xs text-green-600">
              Выручка: {deal.revenue.toLocaleString()} ₸
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(deal);
            }}
            className="rounded p-1 text-slate-400 hover:bg-orange-50 hover:text-orange-600 transition-colors opacity-0 group-hover:opacity-100"
            title="Редактировать"
          >
            <IconEdit size={14} />
          </button>
          <div {...attributes} {...listeners} className="rounded p-1 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing">
            <IconGripVertical size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DealsKanban({ initialDeals }: DealsKanbanProps) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | undefined>();
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  const dealsByStage = VISIBLE_STAGES.reduce<Record<VisibleStage, Deal[]>>((acc, stage) => {
    acc[stage.value] = deals.filter((deal) => mapCrmStageToVisible(deal.stage) === stage.value);
    return acc;
  }, { diagnostics: [], planned: [], in_progress: [] });

  const successDealsCount = deals.filter((deal) => deal.stage === 'closed').length;
  const failedDealsCount = deals.filter((deal) => deal.stage === 'cancelled').length;

  useEffect(() => {
    refreshDeals();
  }, []);

  const refreshDeals = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/crm/deals`, {
        cache: 'no-store',
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setDeals(data);
      }
    } catch (error) {
      console.error('Failed to refresh deals:', error);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const deal = deals.find(d => d.id === event.active.id);
    setActiveDeal(deal || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDeal(null);

    const { active, over } = event;

    if (!over) return;

    const dealId = active.id as string;
    const overId = over.id as string;
    let newStage: VisibleStage | null = null;

    if (isVisibleStage(overId)) {
      newStage = overId;
    } else {
      const overDeal = deals.find((d) => d.id === overId);
      if (overDeal) {
        newStage = mapCrmStageToVisible(overDeal.stage);
      }
    }
    if (!newStage) return;

    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;

    const previousStage = deal.stage;
    const currentVisibleStage = mapCrmStageToVisible(deal.stage);
    if (currentVisibleStage === newStage) return;

    // Optimistically update UI
    setDeals(prev =>
      prev.map(d => (d.id === dealId ? { ...d, stage: newStage } : d))
    );

    try {
      const response = await fetch(`${apiBaseUrl}/crm/deals/${dealId}/stage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ stage: newStage }),
      });

      if (!response.ok) {
        throw new Error('Failed to update deal stage');
      }
    } catch (error) {
      console.error('Failed to update deal stage:', error);
      // Revert on error
      setDeals(prev =>
        prev.map(d => (d.id === dealId ? { ...d, stage: previousStage } : d))
      );
      alert('Ошибка обновления стадии заказа');
    }
  };

  const handleCreateClick = () => {
    setSelectedDeal(undefined);
    setIsModalOpen(true);
  };

  const handleEditClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    refreshDeals();
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between bg-white rounded-lg px-6 py-4 shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-col gap-1 text-sm text-slate-600">
          <div>
            Активные заказы: <span className="font-semibold text-slate-900">{dealsByStage.diagnostics.length + dealsByStage.planned.length + dealsByStage.in_progress.length}</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-700">
              Успех: {successDealsCount}
            </span>
            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-700">
              Провал: {failedDealsCount}
            </span>
          </div>
          <Link
            href="/crm/bookings/calendar"
            className="text-xs text-orange-600 hover:text-orange-700 underline underline-offset-2"
          >
            Открыть календарь записей
          </Link>
        </div>
        <button
          onClick={handleCreateClick}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
        >
          + Создать заказ
        </button>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {VISIBLE_STAGES.map((stage) => {
            const stageDeals = dealsByStage[stage.value] || [];
            return (
              <div
                key={stage.value}
                id={stage.value}
                className={`rounded-lg border-2 ${stage.color} p-4 min-h-[500px]`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-700">{stage.label}</h3>
                  <span className="text-xs font-medium text-slate-500 bg-white rounded-full px-2 py-0.5">
                    {stageDeals.length}
                  </span>
                </div>
                <SortableContext items={stageDeals.map(d => d.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {stageDeals.map((deal) => (
                      <SortableDealCard key={deal.id} deal={deal} onEdit={handleEditClick} />
                    ))}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeDeal && (
            <div className="rounded-lg border-2 border-orange-500 bg-white px-3 py-3 shadow-lg opacity-90 w-64">
              <p className="font-medium text-slate-900 text-sm mb-1">{activeDeal.title}</p>
              {activeDeal.lead && (
                <p className="text-xs text-slate-500 mb-2">{activeDeal.lead.name}</p>
              )}
              <p className="text-sm font-semibold text-slate-900">
                {activeDeal.amount.toLocaleString()} ₸
              </p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <DealModal
        deal={selectedDeal}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
