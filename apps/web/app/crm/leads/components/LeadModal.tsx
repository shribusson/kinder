'use client';

import Modal from '@/app/components/Modal';
import LeadForm from './LeadForm';

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

interface LeadModalProps {
  lead?: Lead;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LeadModal({ lead, isOpen, onClose, onSuccess }: LeadModalProps) {
  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lead ? 'Редактировать лида' : 'Создать лида'}
      size="lg"
    >
      <LeadForm lead={lead} onSuccess={handleSuccess} onCancel={onClose} />
    </Modal>
  );
}
