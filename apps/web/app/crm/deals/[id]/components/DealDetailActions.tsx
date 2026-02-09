'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import DealModal from '../../components/DealModal';
import { apiBaseUrl, getAuthHeaders } from '@/app/lib/api';

interface Deal {
  id: string;
  leadId: string;
  title: string;
  stage: string;
  amount: number;
  revenue?: number;
  lead?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
}

interface DealDetailActionsProps {
  deal: Deal;
}

export default function DealDetailActions({ deal }: DealDetailActionsProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Вы уверены, что хотите удалить сделку "${deal.title}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`${apiBaseUrl}/crm/deals/${deal.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete deal');
      }

      router.push('/crm/deals');
    } catch (error) {
      console.error('Failed to delete deal:', error);
      alert('Ошибка удаления сделки');
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

      <DealModal
        deal={deal}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
