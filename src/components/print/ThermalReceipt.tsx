import React from 'react';
import { Invoice, RestaurantSettings } from '../../types';

interface ThermalReceiptProps {
  invoice: Invoice;
  settings: RestaurantSettings;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ invoice, settings }) => {
  const is58mm = settings.paperWidth === '58mm';

  return (
    <div
      dir="rtl"
      className={`bg-white text-black font-mono p-2 mx-auto ${
        is58mm ? 'w-[58mm] text-[10px]' : 'w-[80mm] text-[12px]'
      }`}
      style={{ fontFamily: 'Courier New, monospace' }}
    >
      {/* هيدر الفاتورة واللوجو */}
      <div className="text-center space-y-1">
        <h2 className="font-black text-sm">{settings.name}</h2>
        <p>{settings.address}</p>
        <p>تليفون: {settings.phone}</p>
      </div>

      <div className="border-b border-dashed border-black my-2"></div>

      {/* بيانات الطلب والوردية */}
      <div className="space-y-0.5">
        <div className="flex justify-between font-bold">
          <span>فاتورة رقم: #{invoice.ticketNo}</span>
          <span>{invoice.orderType === 'delivery' ? 'دليفري' : 'تيك أواي'}</span>
        </div>
        <p>التاريخ: {invoice.dateStr} - {invoice.timeStr}</p>
        <p>الكاشير: {invoice.cashierName}</p>
        {invoice.customerName && <p>العميل: {invoice.customerName}</p>}
        {invoice.customerPhone && <p>الهاتف: {invoice.customerPhone}</p>}
      </div>

      <div className="border-b border-dashed border-black my-2"></div>

      {/* جدول العناصر المشتراة */}
      <table className="w-full text-right">
        <thead>
          <tr className="border-b border-black">
            <th className="py-1">الصنف</th>
            <th className="py-1 text-center">العدد</th>
            <th className="py-1 text-left">الإجمالي</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dashed divide-slate-300">
          {invoice.items.map((item, idx) => (
            <tr key={idx}>
              <td className="py-1 leading-tight">
                {item.name}
              </td>
              <td className="py-1 text-center">{item.qty}</td>
              <td className="py-1 text-left">{item.unitPrice * item.qty} ج.م</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-b border-dashed border-black my-2"></div>

      {/* الإجمالي المالي */}
      <div className="space-y-1 font-bold">
        <div className="flex justify-between">
          <span>المبلغ الفرعي:</span>
          <span>{invoice.subtotal} ج.م</span>
        </div>
        {invoice.deliveryFee > 0 && (
          <div className="flex justify-between">
            <span>خدمة التوصيل:</span>
            <span>{invoice.deliveryFee} ج.م</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-black pt-1 border-t border-black">
          <span>الإجمالي النهائي:</span>
          <span>{invoice.total} ج.م</span>
        </div>
      </div>

      <div className="border-b border-dashed border-black my-2"></div>

      {/* فوتر الفاتورة ورسالة الترحيب */}
      <div className="text-center pt-1 font-sans">
        <p className="font-semibold">{settings.receiptFooter}</p>
      </div>
    </div>
  );
};
