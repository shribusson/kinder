'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '@/app/components/Modal';
import { apiBaseUrl } from '@/app/lib/api';

interface Integration {
  id: string;
  channel: string;
  status: string;
  settings?: Record<string, any>;
}

interface IntegrationModalProps {
  integration?: Integration;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CHANNELS = [
  { value: 'telegram', label: 'Telegram Bot' },
  { value: 'whatsapp', label: 'WhatsApp Business' },
  { value: 'telephony', label: 'Телефония (Asterisk)' },
  { value: 'instagram', label: 'Instagram' },
];

export default function IntegrationModal({ integration, isOpen, onClose, onSuccess }: IntegrationModalProps) {
  const [formData, setFormData] = useState({
    channel: integration?.channel || 'telegram',
    // Telegram fields
    telegramBotToken: '',
    telegramWebhookSecret: '',
    // WhatsApp fields
    wabaPhoneId: '',
    wabaAccessToken: '',
    wabaWebhookVerifyToken: '',
    // Telephony fields
    asteriskAriUrl: '',
    asteriskAriUsername: '',
    asteriskAriPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const accountId = typeof window !== 'undefined' ? localStorage.getItem('accountId') : null;

      // Build credentials object based on channel
      let credentials: Record<string, string> = {};
      let settings: Record<string, any> = {};

      if (formData.channel === 'telegram') {
        credentials = {
          botToken: formData.telegramBotToken,
          webhookSecret: formData.telegramWebhookSecret,
        };
        settings = {
          webhookUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL || apiBaseUrl}/crm/integrations/telegram/webhook`,
        };
      } else if (formData.channel === 'whatsapp') {
        credentials = {
          phoneId: formData.wabaPhoneId,
          accessToken: formData.wabaAccessToken,
          webhookVerifyToken: formData.wabaWebhookVerifyToken,
        };
        settings = {
          webhookUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL || apiBaseUrl}/crm/integrations/whatsapp/webhook`,
        };
      } else if (formData.channel === 'telephony') {
        credentials = {
          ariUrl: formData.asteriskAriUrl,
          ariUsername: formData.asteriskAriUsername,
          ariPassword: formData.asteriskAriPassword,
        };
        settings = {
          webhookUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL || apiBaseUrl}/crm/integrations/telephony/webhook`,
        };
      }

      // For simplicity, we'll store credentials as JSON string (in production, encrypt them!)
      const credentialsEncrypted = JSON.stringify(credentials);

      const url = integration
        ? `${apiBaseUrl}/crm/integrations/${integration.id}`
        : `${apiBaseUrl}/crm/integrations`;
      const method = integration ? 'PATCH' : 'POST';

      const payload: any = {
        credentialsEncrypted,
        settings,
      };

      if (!integration) {
        payload.channel = formData.channel;
        payload.accountId = accountId;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Ошибка сохранения');
      }

      toast.success(integration ? 'Интеграция успешно обновлена!' : 'Интеграция успешно создана!');
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
      title={integration ? 'Настройка интеграции' : 'Добавить интеграцию'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Channel Selection */}
        <div>
          <label htmlFor="channel" className="block text-sm font-medium text-slate-700 mb-1">
            Канал интеграции *
          </label>
          <select
            id="channel"
            value={formData.channel}
            onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
            disabled={!!integration}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100"
          >
            {CHANNELS.map((channel) => (
              <option key={channel.value} value={channel.value}>
                {channel.label}
              </option>
            ))}
          </select>
          {integration && (
            <p className="mt-1 text-xs text-slate-500">
              Канал нельзя изменить после создания
            </p>
          )}
        </div>

        {/* Telegram Fields */}
        {formData.channel === 'telegram' && (
          <>
            <div>
              <label htmlFor="telegramBotToken" className="block text-sm font-medium text-slate-700 mb-1">
                Bot Token *
              </label>
              <input
                id="telegramBotToken"
                type="password"
                value={formData.telegramBotToken}
                onChange={(e) => setFormData({ ...formData, telegramBotToken: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="1234567890:ABCdefGhIJKlmNoPQRstuVWXyz"
              />
              <p className="mt-1 text-xs text-slate-500">
                Получите токен у @BotFather в Telegram
              </p>
            </div>
            <div>
              <label htmlFor="telegramWebhookSecret" className="block text-sm font-medium text-slate-700 mb-1">
                Webhook Secret (опционально)
              </label>
              <input
                id="telegramWebhookSecret"
                type="password"
                value={formData.telegramWebhookSecret}
                onChange={(e) => setFormData({ ...formData, telegramWebhookSecret: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="your-secret-key"
              />
            </div>
          </>
        )}

        {/* WhatsApp Fields */}
        {formData.channel === 'whatsapp' && (
          <>
            <div>
              <label htmlFor="wabaPhoneId" className="block text-sm font-medium text-slate-700 mb-1">
                Phone Number ID *
              </label>
              <input
                id="wabaPhoneId"
                type="text"
                value={formData.wabaPhoneId}
                onChange={(e) => setFormData({ ...formData, wabaPhoneId: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="123456789012345"
              />
              <p className="mt-1 text-xs text-slate-500">
                Из настроек WhatsApp Business API
              </p>
            </div>
            <div>
              <label htmlFor="wabaAccessToken" className="block text-sm font-medium text-slate-700 mb-1">
                Access Token *
              </label>
              <input
                id="wabaAccessToken"
                type="password"
                value={formData.wabaAccessToken}
                onChange={(e) => setFormData({ ...formData, wabaAccessToken: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="EAAabcd..."
              />
            </div>
            <div>
              <label htmlFor="wabaWebhookVerifyToken" className="block text-sm font-medium text-slate-700 mb-1">
                Webhook Verify Token *
              </label>
              <input
                id="wabaWebhookVerifyToken"
                type="text"
                value={formData.wabaWebhookVerifyToken}
                onChange={(e) => setFormData({ ...formData, wabaWebhookVerifyToken: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="your-verify-token"
              />
            </div>
          </>
        )}

        {/* Telephony Fields */}
        {formData.channel === 'telephony' && (
          <>
            <div>
              <label htmlFor="asteriskAriUrl" className="block text-sm font-medium text-slate-700 mb-1">
                Asterisk ARI URL *
              </label>
              <input
                id="asteriskAriUrl"
                type="url"
                value={formData.asteriskAriUrl}
                onChange={(e) => setFormData({ ...formData, asteriskAriUrl: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="http://localhost:8088/ari"
              />
            </div>
            <div>
              <label htmlFor="asteriskAriUsername" className="block text-sm font-medium text-slate-700 mb-1">
                ARI Username *
              </label>
              <input
                id="asteriskAriUsername"
                type="text"
                value={formData.asteriskAriUsername}
                onChange={(e) => setFormData({ ...formData, asteriskAriUsername: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="asterisk"
              />
            </div>
            <div>
              <label htmlFor="asteriskAriPassword" className="block text-sm font-medium text-slate-700 mb-1">
                ARI Password *
              </label>
              <input
                id="asteriskAriPassword"
                type="password"
                value={formData.asteriskAriPassword}
                onChange={(e) => setFormData({ ...formData, asteriskAriPassword: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="••••••••"
              />
            </div>
          </>
        )}

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
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
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
