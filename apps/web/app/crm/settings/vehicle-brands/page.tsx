'use client';

import { useEffect, useState } from 'react';
import { IconPlus, IconEdit, IconTrash, IconSearch, IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { apiBaseUrl, getAuthHeaders } from '@/app/lib/api';

interface Brand {
  id: string;
  name: string;
  cyrillicName?: string;
  country?: string;
  popular: boolean;
  yearFrom?: number;
  yearTo?: number;
}

interface Model {
  id: string;
  brandId: string;
  name: string;
  cyrillicName?: string;
  class?: string;
  yearFrom?: number;
  yearTo?: number;
}

export default function VehicleBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'popular'>('all');

  // Expanded brand -> models
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);

  // Brand modal
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandForm, setBrandForm] = useState({
    id: '', name: '', cyrillicName: '', country: '', popular: false,
    yearFrom: '', yearTo: '',
  });

  // Model modal
  const [modelModalOpen, setModelModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [modelForm, setModelForm] = useState({
    id: '', brandId: '', name: '', cyrillicName: '', class: '',
    yearFrom: '', yearTo: '',
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/vehicles/brands`, {
        headers: getAuthHeaders(),
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        setBrands(json.data || json);
      }
    } catch (e) {
      console.error('Failed to fetch brands:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async (brandId: string) => {
    setModelsLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/vehicles/brands/${brandId}/models`, {
        headers: getAuthHeaders(),
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        setModels(json.data || json);
      }
    } catch (e) {
      console.error('Failed to fetch models:', e);
    } finally {
      setModelsLoading(false);
    }
  };

  const toggleBrand = (brandId: string) => {
    if (expandedBrand === brandId) {
      setExpandedBrand(null);
      setModels([]);
    } else {
      setExpandedBrand(brandId);
      fetchModels(brandId);
    }
  };

  // ============ Brand CRUD ============

  const openBrandModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setBrandForm({
        id: brand.id,
        name: brand.name,
        cyrillicName: brand.cyrillicName || '',
        country: brand.country || '',
        popular: brand.popular,
        yearFrom: brand.yearFrom?.toString() || '',
        yearTo: brand.yearTo?.toString() || '',
      });
    } else {
      setEditingBrand(null);
      setBrandForm({ id: '', name: '', cyrillicName: '', country: '', popular: false, yearFrom: '', yearTo: '' });
    }
    setBrandModalOpen(true);
  };

  const saveBrand = async () => {
    try {
      const body: any = {
        name: brandForm.name,
        cyrillicName: brandForm.cyrillicName || undefined,
        country: brandForm.country || undefined,
        popular: brandForm.popular,
        yearFrom: brandForm.yearFrom ? parseInt(brandForm.yearFrom) : undefined,
        yearTo: brandForm.yearTo ? parseInt(brandForm.yearTo) : undefined,
      };
      if (!editingBrand) {
        body.id = brandForm.id || brandForm.name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
      }

      const url = editingBrand
        ? `${apiBaseUrl}/vehicles/brands/${editingBrand.id}`
        : `${apiBaseUrl}/vehicles/brands`;
      const res = await fetch(url, {
        method: editingBrand ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setBrandModalOpen(false);
        fetchBrands();
      } else {
        const err = await res.json();
        alert(err.message || 'Error');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving brand');
    }
  };

  const deleteBrand = async (id: string, name: string) => {
    if (!confirm(`Удалить марку "${name}" и все её модели?`)) return;
    try {
      await fetch(`${apiBaseUrl}/vehicles/brands/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      fetchBrands();
      if (expandedBrand === id) {
        setExpandedBrand(null);
        setModels([]);
      }
    } catch (e) {
      console.error(e);
      alert('Error deleting brand');
    }
  };

  const togglePopular = async (brand: Brand) => {
    try {
      await fetch(`${apiBaseUrl}/vehicles/brands/${brand.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ popular: !brand.popular }),
      });
      fetchBrands();
    } catch (e) {
      console.error(e);
    }
  };

  // ============ Model CRUD ============

  const openModelModal = (brandId: string, model?: Model) => {
    if (model) {
      setEditingModel(model);
      setModelForm({
        id: model.id,
        brandId: model.brandId,
        name: model.name,
        cyrillicName: model.cyrillicName || '',
        class: model.class || '',
        yearFrom: model.yearFrom?.toString() || '',
        yearTo: model.yearTo?.toString() || '',
      });
    } else {
      setEditingModel(null);
      setModelForm({
        id: '', brandId, name: '', cyrillicName: '', class: '',
        yearFrom: '', yearTo: '',
      });
    }
    setModelModalOpen(true);
  };

  const saveModel = async () => {
    try {
      const body: any = {
        name: modelForm.name,
        cyrillicName: modelForm.cyrillicName || undefined,
        class: modelForm.class || undefined,
        yearFrom: modelForm.yearFrom ? parseInt(modelForm.yearFrom) : undefined,
        yearTo: modelForm.yearTo ? parseInt(modelForm.yearTo) : undefined,
      };
      if (!editingModel) {
        body.id = modelForm.id || `${modelForm.brandId}_${modelForm.name.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
        body.brandId = modelForm.brandId;
      }

      const url = editingModel
        ? `${apiBaseUrl}/vehicles/models/${editingModel.id}`
        : `${apiBaseUrl}/vehicles/models`;
      const res = await fetch(url, {
        method: editingModel ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setModelModalOpen(false);
        if (expandedBrand) fetchModels(expandedBrand);
      } else {
        const err = await res.json();
        alert(err.message || 'Error');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving model');
    }
  };

  const deleteModel = async (id: string, name: string) => {
    if (!confirm(`Удалить модель "${name}"?`)) return;
    try {
      await fetch(`${apiBaseUrl}/vehicles/models/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (expandedBrand) fetchModels(expandedBrand);
    } catch (e) {
      console.error(e);
      alert('Error deleting model');
    }
  };

  // Filter
  const filteredBrands = brands.filter(b => {
    if (filter === 'popular' && !b.popular) return false;
    if (search) {
      const q = search.toLowerCase();
      return b.name.toLowerCase().includes(q) || (b.cyrillicName?.toLowerCase().includes(q));
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-slate-900">Марки автомобилей</h1>
        <p className="text-sm text-slate-500">Загрузка...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Марки автомобилей</h1>
            <p className="text-sm text-slate-500">
              {brands.length} марок, {brands.filter(b => b.popular).length} популярных
            </p>
          </div>
          <button
            onClick={() => openBrandModal()}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <IconPlus size={16} />
            Добавить марку
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск марки..."
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === 'all' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setFilter('popular')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === 'popular' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Популярные
            </button>
          </div>
        </div>

        {/* Brands List */}
        <div className="flex flex-col gap-2">
          {filteredBrands.map(brand => (
            <div key={brand.id} className="card">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleBrand(brand.id)}
                  className="flex items-center gap-3 text-left flex-1"
                >
                  {expandedBrand === brand.id
                    ? <IconChevronDown size={18} className="text-slate-400" />
                    : <IconChevronRight size={18} className="text-slate-400" />
                  }
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{brand.name}</span>
                      {brand.cyrillicName && (
                        <span className="text-slate-500 text-sm">({brand.cyrillicName})</span>
                      )}
                      {brand.popular && (
                        <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">Популярная</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {brand.country && <span>{brand.country}</span>}
                      {brand.yearFrom && (
                        <span>{brand.yearFrom}{brand.yearTo ? `–${brand.yearTo}` : '–н.в.'}</span>
                      )}
                    </div>
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePopular(brand)}
                    className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                      brand.popular
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                    title={brand.popular ? 'Убрать из популярных' : 'Сделать популярной'}
                  >
                    {brand.popular ? '★' : '☆'}
                  </button>
                  <button
                    onClick={() => openBrandModal(brand)}
                    className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                  >
                    <IconEdit size={16} />
                  </button>
                  <button
                    onClick={() => deleteBrand(brand.id, brand.name)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              </div>

              {/* Models */}
              {expandedBrand === brand.id && (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500 uppercase">Модели</span>
                    <button
                      onClick={() => openModelModal(brand.id)}
                      className="rounded-lg bg-green-100 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-200 transition-colors flex items-center gap-1"
                    >
                      <IconPlus size={12} />
                      Модель
                    </button>
                  </div>
                  {modelsLoading ? (
                    <p className="text-sm text-slate-400">Загрузка...</p>
                  ) : models.length === 0 ? (
                    <p className="text-sm text-slate-400">Нет моделей</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {models.map(m => (
                        <div key={m.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                          <div>
                            <span className="text-sm font-medium text-slate-900">{m.name}</span>
                            {m.cyrillicName && (
                              <span className="text-xs text-slate-500 ml-1">({m.cyrillicName})</span>
                            )}
                            {m.class && (
                              <span className="text-xs text-slate-400 ml-2">Класс {m.class}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openModelModal(brand.id, m)}
                              className="p-1 text-orange-600 hover:bg-orange-100 rounded"
                            >
                              <IconEdit size={12} />
                            </button>
                            <button
                              onClick={() => deleteModel(m.id, m.name)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <IconTrash size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Brand Modal */}
      {brandModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-6">
              {editingBrand ? 'Редактировать марку' : 'Новая марка'}
            </h2>
            <div className="space-y-4">
              {!editingBrand && (
                <div>
                  <label className="block text-sm font-medium mb-1">ID (латиница, заглавные)</label>
                  <input
                    value={brandForm.id}
                    onChange={e => setBrandForm(f => ({ ...f, id: e.target.value.toUpperCase() }))}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="TOYOTA"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Название (лат) <span className="text-red-500">*</span></label>
                  <input
                    value={brandForm.name}
                    onChange={e => setBrandForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Toyota"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Кириллица</label>
                  <input
                    value={brandForm.cyrillicName}
                    onChange={e => setBrandForm(f => ({ ...f, cyrillicName: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Тойота"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Страна</label>
                <input
                  value={brandForm.country}
                  onChange={e => setBrandForm(f => ({ ...f, country: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Япония"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Год от</label>
                  <input
                    type="number"
                    value={brandForm.yearFrom}
                    onChange={e => setBrandForm(f => ({ ...f, yearFrom: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Год до</label>
                  <input
                    type="number"
                    value={brandForm.yearTo}
                    onChange={e => setBrandForm(f => ({ ...f, yearTo: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="brandPopular"
                  checked={brandForm.popular}
                  onChange={e => setBrandForm(f => ({ ...f, popular: e.target.checked }))}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="brandPopular" className="text-sm font-medium">Популярная марка</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setBrandModalOpen(false)}
                  className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  onClick={saveBrand}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Model Modal */}
      {modelModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-6">
              {editingModel ? 'Редактировать модель' : 'Новая модель'}
            </h2>
            <div className="space-y-4">
              {!editingModel && (
                <div>
                  <label className="block text-sm font-medium mb-1">ID</label>
                  <input
                    value={modelForm.id}
                    onChange={e => setModelForm(f => ({ ...f, id: e.target.value.toUpperCase() }))}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="TOYOTA_CAMRY"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Название (лат) <span className="text-red-500">*</span></label>
                  <input
                    value={modelForm.name}
                    onChange={e => setModelForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Camry"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Кириллица</label>
                  <input
                    value={modelForm.cyrillicName}
                    onChange={e => setModelForm(f => ({ ...f, cyrillicName: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Камри"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Класс авто</label>
                <select
                  value={modelForm.class}
                  onChange={e => setModelForm(f => ({ ...f, class: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Не указан</option>
                  <option value="A">A (Мини)</option>
                  <option value="B">B (Малый)</option>
                  <option value="C">C (Средний)</option>
                  <option value="D">D (Большой)</option>
                  <option value="E">E (Бизнес)</option>
                  <option value="F">F (Представительский)</option>
                  <option value="S">S (Спорт)</option>
                  <option value="M">M (Минивэн)</option>
                  <option value="J">J (Внедорожник)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Год от</label>
                  <input
                    type="number"
                    value={modelForm.yearFrom}
                    onChange={e => setModelForm(f => ({ ...f, yearFrom: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Год до</label>
                  <input
                    type="number"
                    value={modelForm.yearTo}
                    onChange={e => setModelForm(f => ({ ...f, yearTo: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setModelModalOpen(false)}
                  className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  onClick={saveModel}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
