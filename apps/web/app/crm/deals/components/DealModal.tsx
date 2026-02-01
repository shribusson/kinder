'use client';

import Modal from '@/app/components/Modal';
import DealForm from './DealForm';

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

interface DealModalProps {
  deal?: Deal;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DealModal({ deal, isOpen, onClose, onSuccess }: DealModalProps) {
  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={deal ? 'Редактировать сделку' : 'Создать сделку'}
      size="lg"
    >
      <DealForm deal={deal} onSuccess={handleSuccess} onCancel={onClose} />
    </Modal>
  );
}
