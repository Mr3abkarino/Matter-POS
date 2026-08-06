import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/dexie';
import { Clock, DollarSign, Lock, Unlock, AlertCircle, CheckCircle } from 'lucide-react';

export function ShiftView() {
  const [openingBalance, setOpeningBalance] = useState('');
  const [closingActual, setClosingActual] = useState('');

  // جلب الشيفت الحالي المفتوح
  const activeShift = useLiveQuery(async () => {
    return await db.shifts.where('status').equals('active').first();
  });

  // جلب فواتير الشيفت الحالي
  const shiftInvoices = useLiveQuery(async () => {
    if (!activeShift) return [];
    return await db.invoices.where('shiftId').equals(activeShift.id).toArray();
  }, [activeShift]) || [];

  const totalShiftSales = shiftInvoices.reduce((sum, inv) => sum + inv.total, 0);

  // بداية اليوم / فتح وردية جديدة
  const handleStartShift = async () => {
    const amount = parseFloat(openingBalance) || 0;
    await db.shifts.add({
      startTime: Date.now(),
      openingBalance: amount,
      status: 'active'
    });
    setOpeningBalance('');
  };

  // تقفيل الوردية الحالية
  const handleCloseShift = async () => {
    if (!activeShift) return;
    const actual = parseFloat(closingActual) || 0;
    const expected = activeShift.openingBalance + totalShiftSales;
    const difference = actual - expected; // موجبة = زيادة، سالبة = عجز

    await db.shifts.update(activeShift.id, {
      endTime: Date.now(),
      closingBalanceActual: actual,
      closingBalanceExpected: expected,
      totalSales: totalShiftSales,
      difference: difference,
      status: 'closed'
    });

    setClosingActual('');
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto bg-slate-100 dir-rtl font-sans">
      <h1 className="text-xl md:text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
        <Clock className="text-indigo-600" size={28} />
        <span>إدارة الوردية والدرج (الشيفت)</span>
      </h1>

      {!activeShift ? (
        /* 1. بداية وردية جديدة */
        <div className="bg-white max-w-lg mx-auto w-full rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-5 text-center">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <Unlock size={32} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">بدء وردية جديدة (بداية اليوم)</h2>
            <p className="text-xs text-slate-500 mt-1">أدخل المبلغ الموجود حالياً في الدرج كعهدة أولية</p>
          </div>

          <div className="flex flex-col gap-2 text-right">
            <label className="text-xs font-bold text-slate-700">مبلغ افتتاح الدرج (ج.م):</label>
            <div className="relative">
              <DollarSign className="absolute right-3 top-3 text-slate-400" size={18} />
              <input
                type="number"
                placeholder="0.00"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                className="w-full bg-slate-50 pr-9 pl-4 py-2.5 rounded-2xl border border-slate-200 font-bold text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            onClick={handleStartShift}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all"
          >
            فتح الوردية والبدء في البيع
          </button>
        </div>
      ) : (
        /* 2. الوردية الحالية وتقفيل اليوم */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                <h3 className="font-bold text-slate-900 text-base">الوردية الحالية (نشطة)</h3>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-600 font-bold px-2.5 py-1 rounded-full">
                بداية: {new Date(activeShift.startTime).toLocaleTimeString('ar-EG')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-500 font-semibold">عهدة الدرج الأولية:</span>
                <h4 className="text-xl font-black text-slate-900 mt-1">{activeShift.openingBalance} ج.م</h4>
              </div>

              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <span className="text-xs text-indigo-600 font-semibold">مبيعات الوردية حتى الآن:</span>
                <h4 className="text-xl font-black text-indigo-600 mt-1">{totalShiftSales} ج.م</h4>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex justify-between items-center">
              <span className="text-xs font-bold text-amber-900">المفروض يكون في الدرج حالياً:</span>
              <span className="text-lg font-black text-amber-900">{activeShift.openingBalance + totalShiftSales} ج.م</span>
            </div>
          </div>

          {/* نموذج إغلاق الوردية */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
              <Lock className="text-rose-600" size={20} />
              <span>تقفيل الوردية وإغلاق اليوم</span>
            </h3>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700">عد الفلوس الفعلية التي في الدرج (ج.م):</label>
              <input
                type="number"
                placeholder="أدخل المبلغ بعد العد اليدوي..."
                value={closingActual}
                onChange={(e) => setClosingActual(e.target.value)}
                className="w-full bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200 font-bold text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {closingActual !== '' && (
              <div className="p-3 rounded-2xl font-bold text-xs flex justify-between items-center bg-slate-100">
                <span>الفارق (عجز / زيادة):</span>
                <span className={`text-sm font-black ${
                  (parseFloat(closingActual) - (activeShift.openingBalance + totalShiftSales)) < 0 
                    ? 'text-rose-600' 
                    : 'text-emerald-600'
                }`}>
                  {(parseFloat(closingActual) - (activeShift.openingBalance + totalShiftSales))} ج.م
                </span>
              </div>
            )}

            <button
              onClick={handleCloseShift}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-rose-200 transition-all mt-2"
            >
              إغلاق الوردية نهائياً وحفظ التقرير
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
