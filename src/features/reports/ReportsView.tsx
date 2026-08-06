import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/dexie';
import { useShiftStore } from '../../store/useShiftStore';
import { TrendingUp, Lock, Unlock, DollarSign, Calendar, ShieldCheck } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { activeShift, openShift, closeShift, loadActiveShift } = useShiftStore();
  
  const [openingBalanceInput, setOpeningBalanceInput] = useState('');
  const [closingBalanceInput, setClosingBalanceInput] = useState('');
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [lastReport, setLastReport] = useState<any>(null);

  // جلب الفواتير لحساب التقارير الشاملة
  const invoices = useLiveQuery(() => db.invoices.toArray(), []) || [];
  const activeInvoices = invoices.filter((inv) => inv.status !== 'cancelled');
  const totalRevenue = activeInvoices.reduce((sum, inv) => sum + inv.total, 0);

  const handleOpenShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const balance = Number(openingBalanceInput) || 0;
    await openShift('محمد مطر (Admin)', balance);
    setOpeningBalanceInput('');
    alert('✅ تم فتح الوردية بنجاح وبدء تتبع المبيعات!');
  };

  const handleCloseShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCash = Number(closingBalanceInput) || 0;
    
    if (activeShift) {
      const shiftInvoices = activeInvoices.filter((inv) => inv.shiftId === activeShift.id);
      const shiftSales = shiftInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const expected = activeShift.openingBalance + shiftSales;
      const diff = enteredCash - expected;

      setLastReport({
        cashier: activeShift.cashierName,
        opening: activeShift.openingBalance,
        sales: shiftSales,
        expected,
        entered: enteredCash,
        diff,
        status: diff === 0 ? 'متطابق تماماً ✅' : diff > 0 ? `زيادة قدرها +${diff} ج.م` : `عجز قدره ${diff} ج.م ⚠️`
      });

      await closeShift(enteredCash);
      setShowCloseModal(false);
      setClosingBalanceInput('');
    }
  };

  return (
    <div className="flex-1 bg-slate-50 p-4 sm:p-6 overflow-y-auto space-y-6 dir-rtl">
      
      {/* الهيدر */}
      <div className="border-b pb-4 flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="text-indigo-600" /> التقارير المالية وإدارة الورديات
          </h2>
          <p className="text-xs text-slate-400 font-bold mt-1">متابعة الخزينة، أداء الورديات، وإحصائيات المبيعات</p>
        </div>

        {activeShift ? (
          <button
            onClick={() => setShowCloseModal(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Lock size={15} /> تقفيل الوردية الحالية
          </button>
        ) : (
          <span className="bg-rose-100 text-rose-700 px-3 py-1.5 rounded-xl text-xs font-bold">
            ⚠️ لا توجد وردية مفتوحة حالياً
          </span>
        )}
      </div>

      {/* لوحة فتح وردية جديدة إذا لم تكن مفتوحة */}
      {!activeShift && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs max-w-md space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Unlock size={17} className="text-indigo-600" /> فتح وردية جديدة
          </h3>
          <form onSubmit={handleOpenShiftSubmit} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-600 block mb-1">النقدية الافتتاحية بالدرج (الرصيد / الفكة)</label>
              <input
                type="number"
                required
                value={openingBalanceInput}
                onChange={(e) => setOpeningBalanceInput(e.target.value)}
                placeholder="أدخل المبلغ الافتتاحي (مثل 200)..."
                className="w-full h-10 border border-slate-200 rounded-xl px-3 font-black text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button type="submit" className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-md">
              بدء وفتح الوردية 🚀
            </button>
          </form>
        </div>
      )}

      {/* كروت الإحصائيات المباشرة */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-400">إجمالي المبيعات المحصلة</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{totalRevenue} ج.م</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-400">إجمالي الفواتير النشطة</p>
          <h3 className="text-2xl font-black text-indigo-600 mt-1">{activeInvoices.length} فاتورة</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-400">متوسط قيمة الفاتورة</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">
            {activeInvoices.length > 0 ? (totalRevenue / activeInvoices.length).toFixed(2) : 0} ج.م
          </h3>
        </div>
      </div>

      {/* عرض تفاصيل آخر تقرير وردية تم تقفيله */}
      {lastReport && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs max-w-lg space-y-3">
          <h3 className="font-extrabold text-sm text-slate-900 border-b pb-2 flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600" /> تقرير تقفيل آخر وردية
          </h3>
          <div className="space-y-1.5 text-xs font-bold">
            <div className="flex justify-between"><span>الكاشير:</span><span>{lastReport.cashier}</span></div>
            <div className="flex justify-between"><span>الرصيد الافتتاحي:</span><span>{lastReport.opening} ج.م</span></div>
            <div className="flex justify-between text-indigo-600"><span>مبيعات الوردية:</span><span>{lastReport.sales} ج.م</span></div>
            <div className="flex justify-between border-t pt-1"><span>المتوقع بالدرج:</span><span>{lastReport.expected} ج.م</span></div>
            <div className="flex justify-between text-emerald-600"><span>الموجود فعلياً بالعد:</span><span>{lastReport.entered} ج.م</span></div>
            <div className="flex justify-between pt-2 border-t font-black text-indigo-700">
              <span>نتيجة المطابقة:</span><span>{lastReport.status}</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal تقفيل الوردية */}
      {showCloseModal && activeShift && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCloseShiftSubmit} className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 font-black text-slate-900">
              <span className="flex items-center gap-1.5 text-amber-600"><Lock size={17} /> تقفيل وتسليم الوردية</span>
              <button type="button" onClick={() => setShowCloseModal(false)}>✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border space-y-1 font-bold">
                <div className="flex justify-between"><span>الرصيد الافتتاحي:</span><span>{activeShift.openingBalance} ج.م</span></div>
                <div className="text-[11px] text-slate-400">وقت الفتح: {new Date(activeShift.startTime).toLocaleTimeString('ar-EG')}</div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">أدخل إجمالي النقدية الفعلية بالدرج بعد العد:</label>
                <input
                  type="number"
                  required
                  value={closingBalanceInput}
                  onChange={(e) => setClosingBalanceInput(e.target.value)}
                  placeholder="المبلغ الفعلي (ج.م)..."
                  className="w-full h-10 border rounded-xl px-3 font-black text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button type="submit" className="w-full h-10 bg-amber-600 text-white font-black text-xs rounded-xl shadow-md">
              تأكيد تقفيل الوردية واستخراج التقرير
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
