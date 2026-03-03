'use client';

import { useEffect, useState } from 'react';
import { IconPlus, IconEdit, IconTrash, IconUser, IconDoor, IconTool, IconAlertCircle } from '@tabler/icons-react';
import ResourceModal from './components/ResourceModal';
import { apiBaseUrl, getAuthHeaders } from '@/app/lib/api';

interface Resource {
  id: string;
  name: string;
  type: 'specialist' | 'room' | 'equipment';
  email?: string;
  phone?: string;
  isActive: boolean;
  workingHours?: Record<string, any>;
  userId?: string;
  user?: { id: string; email: string; firstName: string; lastName: string; role: string; isActive: boolean } | null;
  createdAt: string;
  updatedAt: string;
}

const RESOURCE_TYPE_INFO = {
  specialist: { label: 'Специалист', icon: IconUser, color: 'blue' },
  room: { label: 'Кабинет', icon: IconDoor, color: 'green' },
  equipment: { label: 'Оборудование', icon: IconTool, color: 'purple' },
};

export default function ResourcesSettingsPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'specialist' | 'room' | 'equipment'>('all');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/crm/resources`, {
        cache: 'no-store',
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedResource(undefined);
    setIsModalOpen(true);
  };

  const handleEditClick = (resource: Resource) => {
    setSelectedResource(resource);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Вы уверены, что хотите удалить "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`${apiBaseUrl}/crm/resources/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete resource');
      }

      setResources((prev) => prev.filter((resource) => resource.id !== id));
    } catch (error) {
      console.error('Failed to delete resource:', error);
      alert('Ошибка удаления ресурса');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (resource: Resource) => {
    try {
      const response = await fetch(`${apiBaseUrl}/crm/resources/${resource.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          isActive: !resource.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle resource');
      }

      setResources((prev) =>
        prev.map((r) =>
          r.id === resource.id ? { ...r, isActive: !r.isActive } : r
        )
      );
    } catch (error) {
      console.error('Failed to toggle resource:', error);
      alert('Ошибка изменения статуса');
    }
  };

  const handleSuccess = () => {
    fetchResources();
  };

  const filteredResources = filter === 'all'
    ? resources
    : resources.filter((r) => r.type === filter);

  const stats = {
    total: resources.length,
    specialists: resources.filter((r) => r.type === 'specialist').length,
    rooms: resources.filter((r) => r.type === 'room').length,
    equipment: resources.filter((r) => r.type === 'equipment').length,
    active: resources.filter((r) => r.isActive).length,
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ресурсы</h1>
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
            <h1 className="text-2xl font-bold text-slate-900">Ресурсы</h1>
            <p className="text-sm text-slate-500">
              Управление специалистами, кабинетами и оборудованием
            </p>
          </div>
          <button
            onClick={handleCreateClick}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <IconPlus size={16} />
            Добавить ресурс
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="card text-center">
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs text-slate-500">Всего</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.specialists}</div>
            <div className="text-xs text-slate-500">Специалистов</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">{stats.rooms}</div>
            <div className="text-xs text-slate-500">Кабинетов</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.equipment}</div>
            <div className="text-xs text-slate-500">Оборудования</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
            <div className="text-xs text-slate-500">Активных</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-orange-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => setFilter('specialist')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === 'specialist'
                ? 'bg-orange-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Специалисты
          </button>
          <button
            onClick={() => setFilter('room')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === 'room'
                ? 'bg-orange-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Кабинеты
          </button>
          <button
            onClick={() => setFilter('equipment')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === 'equipment'
                ? 'bg-orange-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Оборудование
          </button>
        </div>

        {/* Resources List */}
        {filteredResources.length === 0 ? (
          <div className="card text-center py-12">
            <IconAlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Нет ресурсов
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Добавьте специалистов, кабинеты или оборудование
            </p>
            <button
              onClick={handleCreateClick}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors inline-flex items-center gap-2"
            >
              <IconPlus size={16} />
              Добавить ресурс
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((resource) => {
              const typeInfo = RESOURCE_TYPE_INFO[resource.type];
              const IconComponent = typeInfo.icon;

              return (
                <div
                  key={resource.id}
                  className={`card hover:shadow-lg transition-shadow ${
                    !resource.isActive ? 'opacity-60' : ''
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-${typeInfo.color}-100`}>
                        <IconComponent size={20} className={`text-${typeInfo.color}-600`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{resource.name}</h3>
                        <p className="text-xs text-slate-500">{typeInfo.label}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={resource.isActive}
                        onChange={() => handleToggleActive(resource)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>

                  {/* Contact Info */}
                  {(resource.email || resource.phone) && (
                    <div className="space-y-1 mb-4 pb-4 border-b border-slate-100">
                      {resource.phone && (
                        <div className="text-sm text-slate-600 flex items-center gap-2">
                          <span>📞</span>
                          <span>{resource.phone}</span>
                        </div>
                      )}
                      {resource.email && (
                        <div className="text-sm text-slate-600 flex items-center gap-2">
                          <span>✉️</span>
                          <span className="truncate">{resource.email}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleEditClick(resource)}
                      className="rounded-lg bg-orange-100 px-3 py-2 text-xs font-medium text-orange-700 hover:bg-orange-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <IconEdit size={14} />
                      Изменить
                    </button>
                    <button
                      onClick={() => handleDelete(resource.id, resource.name)}
                      disabled={deletingId === resource.id}
                      className="rounded-lg bg-red-100 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                    >
                      <IconTrash size={14} />
                      {deletingId === resource.id ? 'Удаление...' : 'Удалить'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ResourceModal
        resource={selectedResource}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
