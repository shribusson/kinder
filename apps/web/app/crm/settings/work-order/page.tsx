'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiCall } from '@/lib/api';

interface WorkOrderSettings {
  companyName?: string;
  inn?: string;
  okpo?: string;
  address?: string;
  phone?: string;
}

export default function WorkOrderSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<WorkOrderSettings>({});
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await apiCall('/account/settings', {
        method: 'GET',
      });

      if (response.success && response.data?.workOrderSettings) {
        setSettings(response.data.workOrderSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await apiCall('/account/settings', {
        method: 'PATCH',
        body: {
          workOrderSettings: settings,
        },
      });

      if (response.success) {
        toast({
          title: 'Успешно',
          description: 'Настройки сохранены',
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Настройки заказ-наряда</h1>
        <p className="text-gray-600">
          Укажите реквизиты компании для генерации заказ-нарядов
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="space-y-6 bg-white p-6 rounded-lg border"
      >
        <div>
          <label className="block text-sm font-medium mb-2">
            Название компании
          </label>
          <Input
            value={settings.companyName || ''}
            onChange={(e) =>
              setSettings({ ...settings, companyName: e.target.value })
            }
            placeholder="Название вашей компании"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">ИНН</label>
            <Input
              value={settings.inn || ''}
              onChange={(e) => setSettings({ ...settings, inn: e.target.value })}
              placeholder="12345678901"
              maxLength={12}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">ОКПО</label>
            <Input
              value={settings.okpo || ''}
              onChange={(e) => setSettings({ ...settings, okpo: e.target.value })}
              placeholder="12345678"
              maxLength={8}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Адрес</label>
          <Textarea
            value={settings.address || ''}
            onChange={(e) =>
              setSettings({ ...settings, address: e.target.value })
            }
            placeholder="Улица, дом, город"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Телефон</label>
          <Input
            value={settings.phone || ''}
            onChange={(e) =>
              setSettings({ ...settings, phone: e.target.value })
            }
            placeholder="+7 (999) 123-45-67"
          />
        </div>

        <Button
          type="submit"
          disabled={isSaving}
          className="gap-2 w-full"
          size="lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Сохранить настройки
            </>
          )}
        </Button>
      </form>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold mb-2 text-blue-900">ℹ️ Информация</h3>
        <p className="text-sm text-blue-800">
          Эти реквизиты будут отображаться в автоматически генерируемых
          заказ-нарядах. Убедитесь, что все данные заполнены корректно.
        </p>
      </div>
    </div>
  );
}
