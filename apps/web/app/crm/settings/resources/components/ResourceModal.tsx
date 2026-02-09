'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '@/app/components/Modal';
import { apiBaseUrl, getAuthHeaders } from '@/app/lib/api';

interface Resource {
  id: string;
  name: string;
  type: 'specialist' | 'room' | 'equipment';
  email?: string;
  phone?: string;
  hourlyRate?: number;
  isActive: boolean;
  workingHours?: Record<string, any>;
}

interface ResourceModalProps {
  resource?: Resource;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RESOURCE_TYPES = [
  { value: 'specialist', label: 'Специалист' },
  { value: 'room', label: 'Кабинет' },
  { value: 'equipment', label: 'Оборудование' },
];

export default function ResourceModal({ resource, isOpen, onClose, onSuccess }: ResourceModalProps) {
  const [formData, setFormData] = useState({
    name: resource?.name || '',
    type: resource?.type || 'specialist',
    email: resource?.email || '',
    phone: resource?.phone || '',
    hourlyRate: resource?.hourlyRate || 0,
    isActive: resource?.isActive ?? true,
    createUser: false,
    userPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const accountId = typeof window !== 'undefined' ? localStorage.getItem('accountId') : null;

      const url = resource
        ? `${apiBaseUrl}/crm/resources/${resource.id}`
        : `${apiBaseUrl}/crm/resources`;
      const method = resource ? 'PATCH' : 'POST';

      const payload: any = {
        name: formData.name,
        type: formData.type,
        isActive: formData.isActive,
      };

      if (formData.email) payload.email = formData.email;
      if (formData.phone) payload.phone = formData.phone;
      if (formData.type === 'specialist' && formData.hourlyRate) {
        payload.hourlyRate = formData.hourlyRate;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Ошибка сохранения');
      }

      // Create user account if requested (only for new specialists)
      if (!resource && formData.type === 'specialist' && formData.createUser && formData.email) {
        try {
          const [firstName, ...lastNameParts] = formData.name.split(' ');
          const lastName = lastNameParts.join(' ') || firstName;

          const userResponse = await fetch(`${apiBaseUrl}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders(),
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.userPassword,
              firstName,
              lastName,
              phone: formData.phone,
              role: 'mechanic',
              accountId,
            }),
          });

          if (!userResponse.ok) {
            const errorData = await userResponse.json().catch(() => ({}));
            console.error('Failed to create user:', errorData);
            toast.error('Ресурс создан, но не удалось создать учётную запись');
          } else {
            toast.success('Ресурс и учётная запись успешно созданы!');
          }
        } catch (userError) {
          console.error('Error creating user:', userError);
          toast.error('Ресурс создан, но не удалось создать учётную запись');
        }
      } else {
        toast.success(resource ? 'Ресурс успешно обновлен!' : 'Ресурс успешно создан!');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMessage = err.message || 'Произошла ошибка';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={resource ? 'Редактировать ресурс' : 'Добавить ресурс'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            Название *
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            placeholder="Мастер Виктор"
          />
        </div>

        {/* Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">
            Тип ресурса *
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            {RESOURCE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Email (for specialists) */}
        {formData.type === 'specialist' && (
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              placeholder="specialist@example.com"
            />
          </div>
        )}

        {/* Phone (for specialists) */}
        {formData.type === 'specialist' && (
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
              Телефон
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              placeholder="+7 (XXX) XXX-XX-XX"
            />
          </div>
        )}

        {/* Hourly Rate (for specialists) */}
        {formData.type === 'specialist' && (
          <div>
            <label htmlFor="hourlyRate" className="block text-sm font-medium text-slate-700 mb-1">
              Цена/час (₸) *
            </label>
            <input
              id="hourlyRate"
              type="number"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                target.value = target.value.replace(/^0+(?=\d)/, '');
              }}
              required
              min="0"
              step="100"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="5000"
            />
          </div>
        )}

        {/* Create User Account (for new specialists only) */}
        {!resource && formData.type === 'specialist' && formData.email && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
            <div className="flex items-center gap-3">
              <input
                id="createUser"
                type="checkbox"
                checked={formData.createUser}
                onChange={(e) => setFormData({ ...formData, createUser: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="createUser" className="text-sm font-medium text-blue-900">
                Создать учётную запись для входа в систему
              </label>
            </div>

            {formData.createUser && (
              <div>
                <label htmlFor="userPassword" className="block text-sm font-medium text-blue-900 mb-1">
                  Пароль для входа *
                </label>
                <input
                  id="userPassword"
                  type="password"
                  value={formData.userPassword}
                  onChange={(e) => setFormData({ ...formData, userPassword: e.target.value })}
                  required={formData.createUser}
                  minLength={6}
                  className="w-full rounded-lg border border-blue-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Минимум 6 символов"
                />
                <p className="text-xs text-blue-700 mt-1">
                  Email: {formData.email}, роль: Механик
                </p>
              </div>
            )}
          </div>
        )}

        {/* Active Status */}
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
          <input
            id="isActive"
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 text-orange-600 bg-slate-100 border-slate-300 rounded focus:ring-orange-500 focus:ring-2"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
            Ресурс активен и доступен для бронирования
          </label>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:bg-slate-50 disabled:cursor-not-allowed transition-colors"
          >
            Отмена
          </button>
        </div>
      </form>
    </Modal>
  );
}
