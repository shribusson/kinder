'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, FileDown, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiCall } from '@/lib/api';

interface WorkOrderSectionProps {
  dealId: string;
  customerName: string;
  carModel?: string;
  licensePlate?: string;
  workOrder?: {
    id: string;
    orderNumber: number;
    generatedAt: string;
    pdfUrl: string;
    customerName: string;
  };
}

export function WorkOrderSection({
  dealId,
  customerName,
  carModel,
  licensePlate,
  workOrder: initialWorkOrder,
}: WorkOrderSectionProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [workOrder, setWorkOrder] = useState(initialWorkOrder);
  const { toast } = useToast();

  const handleGenerateWorkOrder = async () => {
    setIsGenerating(true);
    try {
      const response = await apiCall(`/workorder/generate/${dealId}`, {
        method: 'POST',
      });

      if (response.success) {
        setWorkOrder(response.data);
        toast({
          title: 'Успешно',
          description: 'Заказ-наряд создан',
        });
      }
    } catch (error) {
      console.error('Error generating work order:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать заказ-наряд',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!workOrder?.pdfUrl) return;

    const link = document.createElement('a');
    link.href = workOrder.pdfUrl;
    link.download = `work-order-${dealId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Заказ-наряд
      </h3>

      {workOrder ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Номер</p>
              <p className="font-semibold">
                {workOrder.orderNumber.toString().padStart(6, '0')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Клиент</p>
              <p className="font-semibold truncate">{workOrder.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Создано</p>
              <p className="font-semibold text-sm">
                {new Date(workOrder.generatedAt).toLocaleDateString('ru-KZ')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Статус</p>
              <p className="font-semibold text-green-600">✓ Готов</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              className="gap-2"
            >
              <FileDown className="w-4 h-4" />
              Скачать PDF
            </Button>
            <Button
              onClick={() => window.open(workOrder.pdfUrl, '_blank')}
              variant="outline"
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              Просмотреть
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Заказ-наряд не создан</p>
              <p className="text-sm text-gray-600 mt-1">
                Убедитесь, что в настройках указаны реквизиты компании, затем создайте заказ-наряд.
              </p>
            </div>
          </div>

          <Button
            onClick={handleGenerateWorkOrder}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Создание...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Создать заказ-наряд
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
