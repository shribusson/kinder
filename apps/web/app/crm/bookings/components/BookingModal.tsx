'use client';

import Modal from '@/app/components/Modal';
import BookingForm from './BookingForm';

interface Booking {
  id: string;
  leadId: string;
  specialist: string;
  resourceId?: string;
  scheduledAt: string;
  status: string;
  lead?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  resource?: {
    id: string;
    name: string;
    type: string;
    isActive: boolean;
  };
}

interface BookingModalProps {
  booking?: Booking;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookingModal({ booking, isOpen, onClose, onSuccess }: BookingModalProps) {
  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={booking ? 'Редактировать запись' : 'Создать запись'}
      size="lg"
    >
      <BookingForm booking={booking} onSuccess={handleSuccess} onCancel={onClose} />
    </Modal>
  );
}
