'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { DndContext, closestCenter, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconEdit, IconGripVertical, IconTrash } from '@tabler/icons-react';
import LeadModal from './LeadModal';
import { apiBaseUrl, getAuthHeaders } from '@/app/lib/api';

interface Lead {
  id: string;
  name: string;
  source: string;
  stage: string;
  phone?: string;
  email?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
}

interface LeadsTableProps {
  initialLeads: Lead[];
}

type KanbanStage = 'new' | 'qualified' | 'lost';

const STAGE_LABELS: Record<string, string> = {
  new: 'Непросмотрен',
  contacted: 'Связались',
  qualified: 'Квалифицирован',
  trial_booked: 'Записан на диагностику',
  attended: 'Диагностика проведена',
  won: 'Выигран',
  lost: 'Не подходит',
};

const SOURCE_LABELS: Record<string, string> = {
  website: 'Сайт',
  instagram: 'Instagram',
  '2gis': '2GIS',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  phone: 'Телефон',
  referral: 'Рекомендация',
  other: 'Другое',
};

const KANBAN_STAGES: Array<{ value: KanbanStage; label: string; color: string }> = [
  { value: 'new', label: 'Непросмотрен', color: 'bg-orange-100 border-orange-200' },
  { value: 'qualified', label: 'Квалифицирован', color: 'bg-green-100 border-green-200' },
  { value: 'lost', label: 'Не подходит', color: 'bg-red-100 border-red-200' },
];

function mapLeadStageToKanbanStage(stage: string): KanbanStage {
  if (stage === 'new') return 'new';
  if (stage === 'lost') return 'lost';
  return 'qualified';
}

function isKanbanStage(value: string): value is KanbanStage {
  return value === 'new' || value === 'qualified' || value === 'lost';
}

function SortableLeadCard({
  lead,
  onEdit,
  onDelete,
  deletingId,
}: {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string, name: string) => void;
  deletingId: string | null;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group rounded-lg border border-slate-200 bg-white px-3 py-3 hover:border-orange-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link
            href={`/crm/leads/${lead.id}`}
            className="block truncate text-sm font-medium text-slate-900 hover:text-orange-600"
          >
            {lead.name}
          </Link>
          <p className="mt-1 text-xs text-slate-500 truncate">
            {SOURCE_LABELS[lead.source] || lead.source}
          </p>
          <p className="mt-2 text-xs text-slate-600 truncate">
            {lead.phone || lead.email || 'Контакт не указан'}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(lead);
            }}
            className="rounded p-1 text-slate-400 hover:bg-orange-50 hover:text-orange-600 transition-colors"
            title="Редактировать"
          >
            <IconEdit size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(lead.id, lead.name);
            }}
            disabled={deletingId === lead.id}
            className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
            title="Удалить"
          >
            <IconTrash size={14} />
          </button>
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab rounded p-1 text-slate-400 hover:text-slate-600 active:cursor-grabbing"
            title="Перетащить"
          >
            <IconGripVertical size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LeadsTable({ initialLeads }: LeadsTableProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>();
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    refreshLeads();
  }, []);

  const refreshLeads = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/crm/leads`, {
        cache: 'no-store',
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      }
    } catch (error) {
      console.error('Failed to refresh leads:', error);
    }
  };

  const handleCreateClick = () => {
    setSelectedLead(undefined);
    setIsModalOpen(true);
  };

  const handleEditClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string, name: string) => {
    if (!confirm(`Вы уверены, что хотите удалить лида "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`${apiBaseUrl}/crm/leads/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete lead');
      }

      setLeads((prev) => prev.filter((lead) => lead.id !== id));
      toast.success(`Лид "${name}" успешно удален`);
    } catch (error) {
      console.error('Failed to delete lead:', error);
      toast.error('Ошибка удаления лида');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSuccess = () => {
    refreshLeads();
  };

  const leadsByStage = KANBAN_STAGES.reduce<Record<KanbanStage, Lead[]>>(
    (acc, stage) => {
      acc[stage.value] = leads.filter((lead) => mapLeadStageToKanbanStage(lead.stage) === stage.value);
      return acc;
    },
    { new: [], qualified: [], lost: [] },
  );

  const handleDragStart = (event: DragStartEvent) => {
    const lead = leads.find((item) => item.id === event.active.id);
    setActiveLead(lead ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;

    const draggedId = active.id as string;
    const overId = over.id as string;
    const draggedLead = leads.find((lead) => lead.id === draggedId);
    if (!draggedLead) return;

    let targetStage: KanbanStage | null = null;
    if (isKanbanStage(overId)) {
      targetStage = overId;
    } else {
      const targetLead = leads.find((lead) => lead.id === overId);
      if (targetLead) {
        targetStage = mapLeadStageToKanbanStage(targetLead.stage);
      }
    }

    if (!targetStage) return;

    const previousStage = draggedLead.stage;
    const currentKanbanStage = mapLeadStageToKanbanStage(draggedLead.stage);
    if (currentKanbanStage === targetStage) return;

    setLeads((prev) =>
      prev.map((lead) => (lead.id === draggedId ? { ...lead, stage: targetStage } : lead)),
    );

    try {
      const response = await fetch(`${apiBaseUrl}/crm/leads/${draggedId}/stage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ stage: targetStage }),
      });

      if (!response.ok) {
        throw new Error('Failed to update lead stage');
      }
    } catch (error) {
      console.error('Failed to update lead stage:', error);
      setLeads((prev) =>
        prev.map((lead) => (lead.id === draggedId ? { ...lead, stage: previousStage } : lead)),
      );
      toast.error('Ошибка обновления стадии лида');
    }
  };

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-slate-600">
            Всего лидов: <span className="font-semibold text-slate-900">{leads.length}</span>
          </div>
          <button
            onClick={handleCreateClick}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
          >
            + Создать лид
          </button>
        </div>
        {leads.length === 0 ? (
          <div className="py-8 text-center text-slate-500">Нет лидов. Создайте первого!</div>
        ) : (
          <DndContext
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {KANBAN_STAGES.map((stage) => {
                const stageLeads = leadsByStage[stage.value];
                return (
                  <div key={stage.value} className={`rounded-lg border-2 ${stage.color} p-4 min-h-[460px]`} id={stage.value}>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-700">{stage.label}</h3>
                      <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500">
                        {stageLeads.length}
                      </span>
                    </div>
                    <SortableContext items={stageLeads.map((lead) => lead.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2">
                        {stageLeads.map((lead) => (
                          <SortableLeadCard
                            key={lead.id}
                            lead={lead}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                            deletingId={deletingId}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </div>
                );
              })}
            </div>

            <DragOverlay>
              {activeLead && (
                <div className="w-64 rounded-lg border-2 border-orange-500 bg-white px-3 py-3 shadow-lg opacity-90">
                  <p className="text-sm font-medium text-slate-900 mb-1">{activeLead.name}</p>
                  <p className="text-xs text-slate-500 mb-1">
                    {SOURCE_LABELS[activeLead.source] || activeLead.source}
                  </p>
                  <p className="text-xs text-slate-600">
                    {STAGE_LABELS[activeLead.stage] || activeLead.stage}
                  </p>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      <LeadModal
        lead={selectedLead}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
