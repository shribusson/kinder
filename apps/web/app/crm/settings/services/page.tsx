'use client';

import { useEffect, useState } from 'react';
import { IconPlus, IconEdit, IconTrash, IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { apiBaseUrl, getAuthHeaders } from '@/app/lib/api';

interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  sortOrder: number;
  services: Service[];
}

interface Service {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  price?: number;
  priceNote?: string;
  unit?: string;
  sortOrder: number;
  isActive: boolean;
}

export default function ServicesSettingsPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Category modal
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<ServiceCategory | null>(null);
  const [catForm, setCatForm] = useState({ name: '', slug: '', icon: '', sortOrder: 0 });

  // Service modal
  const [svcModalOpen, setSvcModalOpen] = useState(false);
  const [editingSvc, setEditingSvc] = useState<Service | null>(null);
  const [svcForm, setSvcForm] = useState({
    categoryId: '',
    name: '',
    description: '',
    price: '',
    priceNote: '',
    unit: '',
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/services/categories`, {
        headers: getAuthHeaders(),
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        if (data.length > 0 && expandedCategories.size === 0) {
          setExpandedCategories(new Set(data.map((c: ServiceCategory) => c.id)));
        }
      }
    } catch (e) {
      console.error('Failed to fetch categories:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ============ Category CRUD ============

  const openCatModal = (cat?: ServiceCategory) => {
    if (cat) {
      setEditingCat(cat);
      setCatForm({ name: cat.name, slug: cat.slug, icon: cat.icon || '', sortOrder: cat.sortOrder });
    } else {
      setEditingCat(null);
      setCatForm({ name: '', slug: '', icon: '', sortOrder: 0 });
    }
    setCatModalOpen(true);
  };

  const saveCat = async () => {
    try {
      const url = editingCat
        ? `${apiBaseUrl}/services/categories/${editingCat.id}`
        : `${apiBaseUrl}/services/categories`;
      const res = await fetch(url, {
        method: editingCat ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(catForm),
      });
      if (res.ok) {
        setCatModalOpen(false);
        fetchCategories();
      } else {
        const err = await res.json();
        alert(err.message || 'Error saving category');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving category');
    }
  };

  const deleteCat = async (id: string, name: string) => {
    if (!confirm(`Удалить категорию "${name}" и все её услуги?`)) return;
    try {
      await fetch(`${apiBaseUrl}/services/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      fetchCategories();
    } catch (e) {
      console.error(e);
      alert('Error deleting category');
    }
  };

  // ============ Service CRUD ============

  const openSvcModal = (categoryId: string, svc?: Service) => {
    if (svc) {
      setEditingSvc(svc);
      setSvcForm({
        categoryId: svc.categoryId,
        name: svc.name,
        description: svc.description || '',
        price: svc.price?.toString() || '',
        priceNote: svc.priceNote || '',
        unit: svc.unit || '',
        sortOrder: svc.sortOrder,
        isActive: svc.isActive,
      });
    } else {
      setEditingSvc(null);
      setSvcForm({
        categoryId,
        name: '',
        description: '',
        price: '',
        priceNote: '',
        unit: '',
        sortOrder: 0,
        isActive: true,
      });
    }
    setSvcModalOpen(true);
  };

  const saveSvc = async () => {
    try {
      const url = editingSvc
        ? `${apiBaseUrl}/services/${editingSvc.id}`
        : `${apiBaseUrl}/services`;
      const body: any = {
        categoryId: svcForm.categoryId,
        name: svcForm.name,
        description: svcForm.description || undefined,
        price: svcForm.price ? parseFloat(svcForm.price) : undefined,
        priceNote: svcForm.priceNote || undefined,
        unit: svcForm.unit || undefined,
        sortOrder: svcForm.sortOrder,
        isActive: svcForm.isActive,
      };
      const res = await fetch(url, {
        method: editingSvc ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSvcModalOpen(false);
        fetchCategories();
      } else {
        const err = await res.json();
        alert(err.message || 'Error saving service');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving service');
    }
  };

  const deleteSvc = async (id: string, name: string) => {
    if (!confirm(`Удалить услугу "${name}"?`)) return;
    try {
      await fetch(`${apiBaseUrl}/services/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      fetchCategories();
    } catch (e) {
      console.error(e);
      alert('Error deleting service');
    }
  };

  const toggleSvcActive = async (svc: Service) => {
    try {
      await fetch(`${apiBaseUrl}/services/${svc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ isActive: !svc.isActive }),
      });
      fetchCategories();
    } catch (e) {
      console.error(e);
    }
  };

  const autoSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[а-яё]/g, (c) => {
        const map: Record<string, string> = {
          'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i',
          'й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t',
          'у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y',
          'ь':'','э':'e','ю':'yu','я':'ya'
        };
        return map[c] || c;
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-slate-900">Услуги</h1>
        <p className="text-sm text-slate-500">Загрузка...</p>
      </div>
    );
  }

  const totalServices = categories.reduce((sum, c) => sum + c.services.length, 0);
  const activeServices = categories.reduce((sum, c) => sum + c.services.filter(s => s.isActive).length, 0);

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Услуги</h1>
            <p className="text-sm text-slate-500">
              {categories.length} категорий, {totalServices} услуг ({activeServices} активных)
            </p>
          </div>
          <button
            onClick={() => openCatModal()}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <IconPlus size={16} />
            Добавить категорию
          </button>
        </div>

        {/* Categories with Services */}
        {categories.length === 0 ? (
          <div className="card text-center py-12">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Нет категорий</h3>
            <p className="text-sm text-slate-500 mb-4">Создайте категорию для группировки услуг</p>
            <button
              onClick={() => openCatModal()}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors inline-flex items-center gap-2"
            >
              <IconPlus size={16} />
              Добавить категорию
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="card">
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    className="flex items-center gap-3 text-left flex-1"
                  >
                    {expandedCategories.has(cat.id)
                      ? <IconChevronDown size={20} className="text-slate-400" />
                      : <IconChevronRight size={20} className="text-slate-400" />
                    }
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {cat.icon && <span className="mr-2">{cat.icon}</span>}
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-500">{cat.services.length} услуг</p>
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openSvcModal(cat.id)}
                      className="rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-200 transition-colors flex items-center gap-1"
                    >
                      <IconPlus size={14} />
                      Услуга
                    </button>
                    <button
                      onClick={() => openCatModal(cat)}
                      className="rounded-lg bg-orange-100 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-200 transition-colors"
                    >
                      <IconEdit size={14} />
                    </button>
                    <button
                      onClick={() => deleteCat(cat.id, cat.name)}
                      className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 transition-colors"
                    >
                      <IconTrash size={14} />
                    </button>
                  </div>
                </div>

                {/* Services List */}
                {expandedCategories.has(cat.id) && cat.services.length > 0 && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-slate-500 uppercase">
                          <th className="pb-2">Название</th>
                          <th className="pb-2">Цена</th>
                          <th className="pb-2">Ед.</th>
                          <th className="pb-2 text-center">Активна</th>
                          <th className="pb-2 text-right">Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cat.services.map(svc => (
                          <tr key={svc.id} className={`border-t border-slate-50 ${!svc.isActive ? 'opacity-50' : ''}`}>
                            <td className="py-2">
                              <div className="font-medium text-slate-900">{svc.name}</div>
                              {svc.description && (
                                <div className="text-xs text-slate-500 truncate max-w-xs">{svc.description}</div>
                              )}
                            </td>
                            <td className="py-2">
                              {svc.price != null ? (
                                <span className="font-medium">{svc.price.toLocaleString()} тг</span>
                              ) : (
                                <span className="text-slate-400">{svc.priceNote || '—'}</span>
                              )}
                            </td>
                            <td className="py-2 text-slate-500">{svc.unit || '—'}</td>
                            <td className="py-2 text-center">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={svc.isActive}
                                  onChange={() => toggleSvcActive(svc)}
                                  className="sr-only peer"
                                />
                                <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-orange-600"></div>
                              </label>
                            </td>
                            <td className="py-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => openSvcModal(cat.id, svc)}
                                  className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                                >
                                  <IconEdit size={14} />
                                </button>
                                <button
                                  onClick={() => deleteSvc(svc.id, svc.name)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <IconTrash size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Modal */}
      {catModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-6">
              {editingCat ? 'Редактировать категорию' : 'Новая категория'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Название <span className="text-red-500">*</span></label>
                <input
                  value={catForm.name}
                  onChange={e => {
                    const name = e.target.value;
                    setCatForm(f => ({
                      ...f,
                      name,
                      ...(!editingCat ? { slug: autoSlug(name) } : {}),
                    }));
                  }}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug <span className="text-red-500">*</span></label>
                <input
                  value={catForm.slug}
                  onChange={e => setCatForm(f => ({ ...f, slug: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Иконка</label>
                  <input
                    value={catForm.icon}
                    onChange={e => setCatForm(f => ({ ...f, icon: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="🔧"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Порядок</label>
                  <input
                    type="number"
                    value={catForm.sortOrder}
                    onChange={e => setCatForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setCatModalOpen(false)}
                  className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  onClick={saveCat}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {svcModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-6">
              {editingSvc ? 'Редактировать услугу' : 'Новая услуга'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Категория</label>
                <select
                  value={svcForm.categoryId}
                  onChange={e => setSvcForm(f => ({ ...f, categoryId: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Название <span className="text-red-500">*</span></label>
                <input
                  value={svcForm.name}
                  onChange={e => setSvcForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Описание</label>
                <textarea
                  value={svcForm.description}
                  onChange={e => setSvcForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Цена (тг)</label>
                  <input
                    type="number"
                    value={svcForm.price}
                    onChange={e => setSvcForm(f => ({ ...f, price: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ед. измерения</label>
                  <input
                    value={svcForm.unit}
                    onChange={e => setSvcForm(f => ({ ...f, unit: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="шт / час"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Примечание к цене</label>
                <input
                  value={svcForm.priceNote}
                  onChange={e => setSvcForm(f => ({ ...f, priceNote: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="от 5000 тг"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="svcActive"
                  checked={svcForm.isActive}
                  onChange={e => setSvcForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="svcActive" className="text-sm font-medium">Активна</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setSvcModalOpen(false)}
                  className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  onClick={saveSvc}
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
