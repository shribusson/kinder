'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DndContext, closestCenter, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconEdit, IconGripVertical } from '@tabler/icons-react';
import DealModal from './DealModal';
import { apiBaseUrl, getAuthHeaders } from '@/app/lib/api';

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
  lead?: Lead;
}

interface DealsKanbanProps {
  initialDeals: Deal[];
}

const STAGES = [
  { value: 'diagnostics', label: 'На диагностике', color: 'bg-indigo-100 border-indigo-200' },
  { value: 'planned', label: 'Запланирована', color: 'bg-purple-100 border-purple-200' },
  { value: 'in_progress', label: 'В работе', color: 'bg-yellow-100 border-yellow-200' },
  { value: 'ready', label: 'Готова', color: 'bg-teal-100 border-teal-200' },
  { value: 'closed', label: 'Закрыта', color: 'bg-green-100 border-green-200' },
  { value: 'cancelled', label: 'Отменена', color: 'bg-red-100 border-red-200' },
];

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

  const dealsByStage = STAGES.reduce<Record<string, Deal[]>>((acc, stage) => {
    acc[stage.value] = deals.filter(deal => deal.stage === stage.value);
    return acc;
  }, {});

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
    const newStage = over.id as string;

    // Check if we're dropping on a stage column
    if (!STAGES.find(s => s.value === newStage)) {
      return;
    }

    const deal = deals.find(d => d.id === dealId);
    if (!deal || deal.stage === newStage) return;

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
        prev.map(d => (d.id === dealId ? { ...d, stage: deal.stage } : d))
      );
      alert('Ошибка обновления стадии сделки');
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
        <div className="text-sm text-slate-600">
          Всего сделок: <span className="font-semibold text-slate-900">{deals.length}</span>
        </div>
        <button
          onClick={handleCreateClick}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
        >
          + Создать сделку
        </button>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 xl:grid-cols-7">
          {STAGES.map((stage) => {
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
