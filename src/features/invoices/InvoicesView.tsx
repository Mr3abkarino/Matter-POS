import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/dexie';
import { Invoice } from '../../types';
import { ThermalReceipt } from '../../components/print/ThermalReceipt';
import { Eye, Printer, RotateCcw, Search, FileText } from 'lucide-react';

export const InvoicesView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // جلب الفواتير مباشرة من Dexie وتنسيق ترتيبها من الأحدث للأقدم
  const invoices = useLiveQuery(
    () => db.invoices.orderBy('createdAt').reverse().toArray(),
    []
  ) || [];

  // دالة معالجة المرتجع وإرجاع الكميات للمخزن
  const handleRefundInvoice = async (invoice: Invoice) => {
    if (!invoice.id) return;
    if (!window.confirm(`هل أنت متأكد من إلغاء الفاتورة #${invoice.ticketNo} وإرجاع الأصناف للمخزن؟`)) return;

    // 1. تحديث حالة الفاتورة إلى cancelled
    await db.invoices.update(invoice.id, { status: 'cancelled' });

    // 2. إرجاع كميات المخزن تلقائياً بداخل Dexie
    for (const item of invoice.items) {
      const prod = await db.products.get(item.productId);
      if (prod) {
        await db.products.update(item.productId, { stock: prod.stock + item.qty });
      }
    }

    alert('✅ تم إلغاء الفاتورة وإعادة الأصناف إلى المخزون بنجاح!');
  };

  // دالة إرسال الفاتورة للطباعة
  const handlePrint = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const filteredInvoices = invoices.filter((inv) =>
    inv.ticketNo.toString().includes(searchQuery) ||
    (inv.customerPhone && inv.customerPhone.includes(searchQuery))
  );

  return (
    <div className="flex-1 bg-slate-50 p-4 sm:p-6 overflow-y-auto space-y-6 dir-rtl">
      
      {/* عنوان الشاشة والبحث */}
      <div className="flex flex-wrap justify-between items-center gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="text-indigo-600" /> سجل الفواتير والمرتجعات
          </h2>
          <p className="text-xs text-slate-400 font-bold mt-1">
            إجمالي الفواتير المسجلة: {invoices.length} فاتورة
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute right-3 top-2.5 text-slate-400" size={16} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث برقم الفاتورة أو تليفون العميل..."
            className="w-full h-10 bg-white border border-slate-200 rounded-xl pr-9 pl-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* جدول الفواتير */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-50 border-b font-black text-slate-600">
            <tr>
              <th className="p-3">رقم الفاتورة</th>
              <th className="p-3">التاريخ والوقت</th>
              <th className="p-3">نوع الطلب</th>
              <th className="p-3">الكاشير</th>
              <th className="p-3">الإجمالي</th>
              <th className="p-3">الحالة</th>
              <th className="p-3 text-center">إجراءات التحكم</th>
            </tr>
          </thead>
          <tbody className="divide-y font-bold">
            {filteredInvoices.map((inv) => (
              <tr key={inv.id} className={inv.status === 'cancelled' ? 'bg-rose-50/50 opacity-60' : ''}>
                <td className="p-3 font-mono font-black text-indigo-600">#{inv.ticketNo}</td>
                <td className="p-3 text-slate-500">{inv.dateStr} - {inv.timeStr}</td>
                <td className="p-3">
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                    {inv.orderType === 'delivery' ? '🛵 دليفري' : '🛍️ تيك أواي'}
                  </span>
                </td>
                <td className="p-3 text-slate-700">{inv.cashierName}</td>
                <td className="p-3 font-black text-emerald-600">{inv.total} ج.م</td>
                <td className="p-3">
                  {inv.status === 'cancelled' ? (
                    <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-[10px]">مرتجع / ملغاة</span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px]">مكتملة</span>
                  )}
                </td>
                <td className="p-3 text-center space-x-1.5 space-x-reverse">
                  <button
                    onClick={() => setSelectedInvoice(inv)}
                    className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                    title="معاينة"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => handlePrint(inv)}
                    className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                    title="طباعة"
                  >
                    <Printer size={15} />
                  </button>
                  {inv.status !== 'cancelled' && (
                    <button
                      onClick={() => handleRefundInvoice(inv)}
                      className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100"
                      title="إلغاء ومرتجع"
                    >
                      <RotateCcw size={15} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal معاينة وتفاصيل الفاتورة */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 font-black text-slate-900">
              <span>معاينة فاتورة #{selectedInvoice.ticketNo}</span>
              <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-2 text-xs font-bold">
              <div className="flex justify-between text-slate-500">
                <span>التاريخ والوقت:</span>
                <span>{selectedInvoice.dateStr} - {selectedInvoice.timeStr}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>الكاشير:</span>
                <span>{selectedInvoice.cashierName}</span>
              </div>

              <div className="border-t pt-2 space-y-1">
                {selectedInvoice.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between bg-slate-50 p-2 rounded-lg">
                    <span>{item.name}</span>
                    <span>{item.qty} × {item.unitPrice} = {item.qty * item.unitPrice} ج.م</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-2 flex justify-between font-black text-sm text-indigo-600">
                <span>الإجمالي الكلي:</span>
                <span>{selectedInvoice.total} ج.م</span>
              </div>
            </div>

            <button
              onClick={() => handlePrint(selectedInvoice)}
              className="w-full h-10 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <Printer size={15} />
              <span>طباعة الإيصال الحراري</span>
            </button>
          </div>
        </div>
      )}

      {/* طباعة حرارية خفية في الخلفية للتنفيذ اللحظي */}
      <div className="hidden print:block font-mono">
        {selectedInvoice && (
          <ThermalReceipt
            invoice={selectedInvoice}
            settings={{
              name: 'دريم كورنر - Dream Corner',
              address: 'البرامون - الدقهلية',
              phone: '01012345678',
              printerName: 'POS-80',
              paperWidth: '80mm',
              receiptFooter: 'شكراً لزيارتكم دريم كورنر!',
              autoPrint: true,
              language: 'ar',
              theme: 'light'
            }}
          />
        )}
      </div>
    </div>
  );
};
