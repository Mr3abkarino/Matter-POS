import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/dexie';
import { FileText, Printer, Trash2, Edit3, Plus, Minus, Check } from 'lucide-react';

export function InvoicesView() {
  const invoices = useLiveQuery(() => db.invoices.toArray()) || [];
  const [editingInvoice, setEditingInvoice] = useState<any>(null);

  // دالة إعادة الطباعة
  const handleReprint = (inv: any) => {
    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>فاتورة رقم #${inv.id} - دريم كورنر</title>
            <style>
              body { font-family: 'Cairo', sans-serif; padding: 10px; width: 280px; margin: auto; color: #000; }
              h2, h4 { text-align: center; margin: 4px 0; }
              hr { border: dashed 1px #000; }
              .info { font-size: 12px; margin-bottom: 5px; }
              .item-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px; }
              .total-row { font-weight: bold; font-size: 15px; margin-top: 8px; display: flex; justify-content: space-between; }
              .footer { text-align: center; font-size: 12px; margin-top: 10px; }
            </style>
          </head>
          <body>
            <h2>دريم كورنر</h2>
            <h4>طعم يفرق .. جودة تليق بك</h4>
            <div class="footer" style="font-size: 10px;">البرامون - بجوار عيادة د. إلهام العشري</div>
            <hr/>
            <div class="info">رقم الفاتورة: #${inv.id} (نسخة اعادة طباعة)</div>
            <div class="info">النوع: ${inv.orderType}</div>
            <div class="info">التاريخ: ${new Date(inv.createdAt).toLocaleString('ar-EG')}</div>
            <hr/>
            <div>
              ${inv.items.map((item: any) => `
                <div class="item-row">
                  <span>${item.name} (${item.quantity}x)</span>
                  <span>${item.price * item.quantity} ج.م</span>
                </div>
              `).join('')}
            </div>
            <hr/>
            <div class="total-row">
              <span>الإجمالي الصافي:</span>
              <span>${inv.total} ج.م</span>
            </div>
            <hr/>
            <div class="footer">
              01006113627
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 400);
    }
  };

  // إلغاء/حذف الفاتورة بالكامل
  const handleDeleteInvoice = async (id: number) => {
    if (confirm('هل أنت تأكد من إلغاء وحذف هذه الفاتورة؟')) {
      await db.invoices.delete(id);
    }
  };

  // تعديل كمية صنف داخل الفاتورة
  const handleUpdateItemQty = (itemKey: string, delta: number) => {
    if (!editingInvoice) return;
    const updatedItems = editingInvoice.items.map((item: any) => {
      if (item.itemKey === itemKey) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean);

    const newTotal = updatedItems.reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0);
    setEditingInvoice({
      ...editingInvoice,
      items: updatedItems,
      total: newTotal
    });
  };

  // حفظ التعديلات على الفاتورة في قاعدة البيانات
  const handleSaveEdit = async () => {
    if (!editingInvoice) return;
    await db.invoices.update(editingInvoice.id, {
      items: editingInvoice.items,
      total: editingInvoice.total
    });
    setEditingInvoice(null);
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto bg-slate-100 dir-rtl font-sans">
      <h1 className="text-xl md:text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
        <FileText className="text-indigo-600" size={28} />
        <span>سجل الفواتير والمبيعات</span>
      </h1>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200 shadow-sm">
          <FileText size={48} className="mx-auto mb-3 text-slate-300" />
          <p className="font-bold">لا توجد فواتير مسجلة حتى الآن</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {invoices.map((inv: any) => (
            <div key={inv.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between gap-4">
              <div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
                  <div>
                    <span className="font-black text-slate-900 text-base">فاتورة #{inv.id}</span>
                    <span className="mr-2 text-xs bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-md">
                      {inv.orderType}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(inv.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* أصناف الفاتورة */}
                <div className="flex flex-col gap-1.5 mb-3">
                  {inv.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-xs text-slate-700 font-semibold">
                      <span>{item.name} x{item.quantity}</span>
                      <span>{item.price * item.quantity} ج.م</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* الإجمالي والأزرار */}
              <div className="border-t border-slate-100 pt-3">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-slate-500 font-bold">الإجمالي:</span>
                  <span className="text-base font-black text-indigo-600">{inv.total} ج.م</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleReprint(inv)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
                  >
                    <Printer size={14} />
                    <span>طباعة</span>
                  </button>
                  <button
                    onClick={() => setEditingInvoice(inv)}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
                  >
                    <Edit3 size={14} />
                    <span>تعديل</span>
                  </button>
                  <button
                    onClick={() => handleDeleteInvoice(inv.id)}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
                  >
                    <Trash2 size={14} />
                    <span>إلغاء</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* نافذة تعديل الفاتورة */}
      {editingInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">تعديل الفاتورة #{editingInvoice.id}</h3>
              <button
                onClick={() => setEditingInvoice(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                إغلاق
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {editingInvoice.items.map((item: any) => (
                <div key={item.itemKey} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">{item.name}</h4>
                    <span className="text-indigo-600 text-xs font-bold">{item.price * item.quantity} ج.م</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateItemQty(item.itemKey, -1)}
                      className="w-6 h-6 bg-white border border-slate-200 rounded-md flex items-center justify-center text-slate-600"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="font-bold text-xs">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateItemQty(item.itemKey, 1)}
                      className="w-6 h-6 bg-white border border-slate-200 rounded-md flex items-center justify-center text-slate-600"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="font-bold text-sm text-slate-600">الإجمالي الجديد:</span>
              <span className="font-black text-lg text-indigo-600">{editingInvoice.total} ج.م</span>
            </div>

            <button
              onClick={handleSaveEdit}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all"
            >
              <Check size={18} />
              <span>حفظ التعديلات</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
