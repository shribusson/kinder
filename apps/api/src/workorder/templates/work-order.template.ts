export interface WorkOrderData {
  orderNumber: number;
  date: string;
  customerName: string;
  customerPhone?: string;
  carModel?: string;
  licensePlate?: string;
  vin?: string;
  mechanicName?: string;
  companyName?: string;
  companyInn?: string;
  companyOkpo?: string;
  companyAddress?: string;
  companyPhone?: string;
  services: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  totalAmount: number;
}

export function generateWorkOrderHTML(data: WorkOrderData): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-KZ', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formattedTotal = formatCurrency(data.totalAmount);

  return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Заказ-наряд №${data.orderNumber.toString().padStart(6, '0')}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; line-height: 1.4; color: #333; background: white; }
        .container { width: 100%; max-width: 210mm; margin: 0 auto; padding: 20mm; }
        .header { border-bottom: 3px solid #000; padding-bottom: 12px; margin-bottom: 16px; }
        .company-name { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
        .company-details { font-size: 11px; color: #666; line-height: 1.3; }
        .document-title { font-size: 24px; font-weight: bold; text-align: center; margin: 16px 0; }
        .order-number { font-size: 16px; font-weight: bold; margin: 8px 0; }
        .section { margin-bottom: 12px; }
        .section-title { font-size: 12px; font-weight: bold; background: #f5f5f5; padding: 6px 8px; margin-bottom: 6px; border-left: 3px solid #000; }
        .customer-info { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 11px; margin-bottom: 8px; }
        .info-field { display: flex; flex-direction: column; }
        .info-label { font-weight: bold; margin-bottom: 2px; font-size: 10px; color: #666; }
        .info-value { font-size: 11px; color: #333; min-height: 16px; }
        .services-table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 11px; }
        .services-table th { background: #f0f0f0; border: 1px solid #ccc; padding: 6px 8px; text-align: left; font-weight: bold; }
        .services-table td { border: 1px solid #ccc; padding: 6px 8px; }
        .numeric { text-align: right; font-family: 'Courier New', monospace; }
        .totals { margin-top: 12px; border-top: 2px solid #000; padding-top: 8px; }
        .total-amount { font-size: 14px; font-weight: bold; display: flex; justify-content: space-between; align-items: baseline; border-top: 1px solid #ccc; padding-top: 6px; margin-top: 6px; }
        .amount-number { font-size: 16px; font-family: 'Courier New', monospace; }
        .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px; font-size: 10px; }
        .signature-line { border-top: 1px solid #000; width: 100%; height: 60px; margin-bottom: 4px; }
        .signature-label { font-size: 9px; text-align: center; color: #666; margin-top: 2px; }
        .footer { margin-top: 40px; font-size: 8px; color: #999; border-top: 1px solid #eee; padding-top: 6px; text-align: center; }
        @media print { body { margin: 0; } .container { box-shadow: none; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="company-name">${escapeHtml(data.companyName || 'АВТОСЕРВИС')}</div>
            <div class="company-details">
                ${data.companyInn ? `<div>ИНН: ${escapeHtml(data.companyInn)}</div>` : ''}
                ${data.companyOkpo ? `<div>ОКПО: ${escapeHtml(data.companyOkpo)}</div>` : ''}
                ${data.companyAddress ? `<div>Адрес: ${escapeHtml(data.companyAddress)}</div>` : ''}
                ${data.companyPhone ? `<div>Телефон: ${escapeHtml(data.companyPhone)}</div>` : ''}
            </div>
        </div>
        <div class="document-title">ЗАКАЗ-НАРЯД</div>
        <div class="order-number">№ ${data.orderNumber.toString().padStart(6, '0')}</div>
        <div style="text-align: center; font-size: 11px; margin-bottom: 12px;">
            от "${formatDate(new Date(data.date))}"
        </div>
        <div class="section">
            <div class="section-title">ДАННЫЕ КЛИЕНТА И АВТОМОБИЛЯ</div>
            <div class="customer-info">
                <div class="info-field"><div class="info-label">Клиент:</div><div class="info-value">${escapeHtml(data.customerName)}</div></div>
                <div class="info-field"><div class="info-label">Телефон:</div><div class="info-value">${escapeHtml(data.customerPhone || '-')}</div></div>
                <div class="info-field"><div class="info-label">Марка автомобиля:</div><div class="info-value">${escapeHtml(data.carModel || '-')}</div></div>
                <div class="info-field"><div class="info-label">Гос. номер:</div><div class="info-value">${escapeHtml(data.licensePlate || '-')}</div></div>
                <div class="info-field"><div class="info-label">VIN:</div><div class="info-value">${escapeHtml(data.vin || '-')}</div></div>
                <div class="info-field"><div class="info-label">Мастер:</div><div class="info-value">${escapeHtml(data.mechanicName || '-')}</div></div>
            </div>
        </div>
        <div class="section">
            <div class="section-title">ВИДЫ РАБОТ И УСЛУГ</div>
            <table class="services-table">
                <thead><tr>
                    <th>Наименование работ и услуг</th>
                    <th style="width: 60px;" class="numeric">Кол-во</th>
                    <th style="width: 70px;" class="numeric">Цена</th>
                    <th style="width: 70px;" class="numeric">Сумма</th>
                </tr></thead>
                <tbody>
                    ${data.services.map((s) => `<tr>
                        <td>${escapeHtml(s.name)}</td>
                        <td class="numeric">${s.quantity}</td>
                        <td class="numeric">${formatCurrency(s.unitPrice)}</td>
                        <td class="numeric">${formatCurrency(s.total)}</td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>
        <div class="totals">
            <div class="total-amount">
                <span>ИТОГО К ОПЛАТЕ:</span>
                <span class="amount-number">${formattedTotal}</span>
            </div>
        </div>
        <div class="signatures">
            <div><div class="signature-line"></div><div class="signature-label">Подпись исполнителя (мастера)</div></div>
            <div><div class="signature-line"></div><div class="signature-label">Подпись клиента</div></div>
        </div>
        <div class="footer">Квитанция является бланком строгой отчетности</div>
    </div>
</body>
</html>`;
}

function formatDate(date: Date): string {
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, (c) => map[c]);
}
