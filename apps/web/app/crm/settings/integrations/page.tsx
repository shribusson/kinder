'use client';

import { useEffect, useState } from 'react';
import { IconCheck, IconX, IconSettings, IconPlug, IconAlertCircle } from '@tabler/icons-react';
import IntegrationModal from './components/IntegrationModal';
import { apiBaseUrl } from '@/app/lib/api';

interface Integration {
  id: string;
  channel: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  settings?: Record<string, any>;
}

const CHANNEL_INFO: Record<string, { name: string; icon: string; description: string }> = {
  telegram: {
    name: 'Telegram',
    icon: '📱',
    description: 'Получайте сообщения из Telegram Bot',
  },
  whatsapp: {
    name: 'WhatsApp',
    icon: '💬',
    description: 'Интеграция с WhatsApp Business API',
  },
  telephony: {
    name: 'Телефония',
    icon: '📞',
    description: 'Asterisk VoIP интеграция',
  },
  instagram: {
    name: 'Instagram',
    icon: '📷',
    description: 'Direct сообщения из Instagram',
  },
  website: {
    name: 'Веб-сайт',
    icon: '🌐',
    description: 'Формы захвата лидов с сайта',
  },
};

export default function IntegrationsSettingsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | undefined>();
  const [testingId, setTestingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const accountId = typeof window !== 'undefined' ? localStorage.getItem('accountId') : null;
      const response = await fetch(`${apiBaseUrl}/crm/integrations?accountId=${accountId}`, {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data);
      }
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async (integrationId: string) => {
    setTestingId(integrationId);
    try {
      const response = await fetch(`${apiBaseUrl}/crm/integrations/${integrationId}/test`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ Тест успешен!\n\n${result.message}`);
      } else {
        throw new Error('Test failed');
      }
    } catch (error) {
      alert('❌ Тест не пройден. Проверьте настройки интеграции.');
    } finally {
      setTestingId(null);
    }
  };

  const handleDelete = async (id: string, channel: string) => {
    if (!confirm(`Вы уверены, что хотите удалить интеграцию "${CHANNEL_INFO[channel]?.name || channel}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`${apiBaseUrl}/crm/integrations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete integration');
      }

      setIntegrations((prev) => prev.filter((int) => int.id !== id));
    } catch (error) {
      console.error('Failed to delete integration:', error);
      alert('Ошибка удаления интеграции');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateClick = () => {
    setSelectedIntegration(undefined);
    setIsModalOpen(true);
  };

  const handleEditClick = (integration: Integration) => {
    setSelectedIntegration(integration);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    fetchIntegrations();
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Интеграции</h1>
          <p className="text-sm text-slate-500">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Интеграции</h1>
            <p className="text-sm text-slate-500">
              Управление подключениями к внешним сервисам
            </p>
          </div>
          <button
            onClick={handleCreateClick}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <IconPlug size={16} />
            Добавить интеграцию
          </button>
        </div>

        {/* Integrations Grid */}
        {integrations.length === 0 ? (
          <div className="card text-center py-12">
            <IconAlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Нет настроенных интеграций
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Добавьте первую интеграцию для подключения внешних каналов связи
            </p>
            <button
              onClick={handleCreateClick}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors inline-flex items-center gap-2"
            >
              <IconPlug size={16} />
              Добавить интеграцию
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => {
              const info = CHANNEL_INFO[integration.channel] || {
                name: integration.channel,
                icon: '🔌',
                description: 'Внешняя интеграция',
              };

              return (
                <div key={integration.id} className="card hover:shadow-lg transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{info.icon}</div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{info.name}</h3>
                        <p className="text-xs text-slate-500">{info.description}</p>
                      </div>
                    </div>
                    {integration.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                        <IconCheck size={12} />
                        Активна
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        <IconX size={12} />
                        Неактивна
                      </span>
                    )}
                  </div>

                  {/* Meta Info */}
                  <div className="space-y-2 text-sm text-slate-600 mb-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Создана:</span>
                      <span className="text-xs font-medium">
                        {new Date(integration.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Обновлена:</span>
                      <span className="text-xs font-medium">
                        {new Date(integration.updatedAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleTest(integration.id)}
                      disabled={testingId === integration.id}
                      className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {testingId === integration.id ? 'Тест...' : 'Тест'}
                    </button>
                    <button
                      onClick={() => handleEditClick(integration)}
                      className="rounded-lg bg-orange-100 px-3 py-2 text-xs font-medium text-orange-700 hover:bg-orange-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <IconSettings size={14} />
                      Настроить
                    </button>
                    <button
                      onClick={() => handleDelete(integration.id, integration.channel)}
                      disabled={deletingId === integration.id}
                      className="rounded-lg bg-red-100 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === integration.id ? 'Удаление...' : 'Удалить'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Section */}
        <div className="card bg-orange-50 border border-orange-100">
          <div className="flex gap-3">
            <div className="text-orange-600">
              <IconAlertCircle size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-orange-900 mb-1">
                Как настроить интеграции
              </h3>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• <strong>Telegram:</strong> Создайте бота через @BotFather и получите API токен</li>
                <li>• <strong>WhatsApp:</strong> Настройте WhatsApp Business API и получите Phone ID + Access Token</li>
                <li>• <strong>Телефония:</strong> Укажите параметры подключения к Asterisk ARI</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <IntegrationModal
        integration={selectedIntegration}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
