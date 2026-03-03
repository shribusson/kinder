'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import LeadModal from '../../components/LeadModal';
import { apiBaseUrl, getAuthHeaders } from '@/app/lib/api';

interface Lead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  source: string;
  stage: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
}

interface LeadDetailActionsProps {
  lead: Lead;
}

export default function LeadDetailActions({ lead }: LeadDetailActionsProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Вы уверены, что хотите удалить лида "${lead.name}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`${apiBaseUrl}/crm/leads/${lead.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete lead');
      }

      router.push('/crm/leads');
    } catch (error) {
      console.error('Failed to delete lead:', error);
      alert('Ошибка удаления лида');
      setIsDeleting(false);
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    router.refresh();
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <IconEdit size={16} />
          Редактировать
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <IconTrash size={16} />
          {isDeleting ? 'Удаление...' : 'Удалить'}
        </button>
      </div>

      <LeadModal
        lead={lead}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
