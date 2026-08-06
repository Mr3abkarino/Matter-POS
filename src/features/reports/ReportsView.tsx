import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { dbCloud } from '../../db/firebase';
import { BarChart3, TrendingUp, ShoppingBag, DollarSign } from 'lucide-react';

export function ReportsView() {
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'yesterday' | 'week' | 'month' | 'all'>('today');
  const [invoices, setInvoices] = useState<any[]>([]);

  // 🔄 المزامنة اللحظية للتقارير مع Firebase
  useEffect(() => {
    const q = query(collection(dbCloud, "invoices"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setInvoices(docs);
    });

    return () => unsubscribe();
  }, []);

  // تصفية الفواتير حسب الوقت المختار
  const filteredInvoices = invoices.filter(inv => {
    const invDate = new Date(inv.createdAt);
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;
    const startOfWeek = startOfToday - (now.getDay() * 86400000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    if (filterPeriod === 'today') return inv.createdAt >= startOfToday;
    if (filterPeriod === 'yesterday') return inv.createdAt >= startOfYesterday && inv.createdAt < startOfToday;
    if (filterPeriod === 'week') return inv.createdAt >= startOfWeek;
    if (filterPeriod === 'month') return inv.createdAt >= startOfMonth;
    return true; // كل المدة
  });

  const totalSales = filteredInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalOrders = filteredInvoices.length;
  const avgOrderValue = totalOrders > 0 ? (totalSales / totalOrders).toFixed(1) : 0;

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto bg-slate-100 dir-rtl font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
          <BarChart3 className="text-indigo-600" size={28} />
          <span>التقارير والأرباح السحابية</span>
        </h1>

        {/* فلاتر الفترة الزمنية */}
        <div className="flex gap-1 bg-slate-200 p-1 rounded-2xl w-full md:w-auto overflow-x-auto">
          {[
            { id: 'today', label: 'اليوم' },
            { id: 'yesterday', label: 'أمس' },
            { id: 'week', label: 'هذا الأسبوع' },
            { id: 'month', label: 'هذا الشهر' },
            { id: 'all', label: 'كل المدة' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setFilterPeriod(p.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterPeriod === p.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* كروت الإحصائيات اللحظية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-xl">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">إجمالي المبيعات</p>
            <h3 className="text-2xl font-black text-slate-900">{totalSales} ج.م</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold text-xl">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">عدد الطلبات</p>
            <h3 className="text-2xl font-black text-slate-900">{totalOrders} طلب</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-bold text-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">متوسط قيمة الطلب</p>
            <h3 className="text-2xl font-black text-slate-900">{avgOrderValue} ج.م</h3>
          </div>
        </div>
      </div>

      {/* سجل التقرير التفصيلي */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 flex-1">
        <h3 className="font-bold text-slate-800 text-sm mb-4">تفاصيل الفواتير عن الفترة المختارة</h3>
        {filteredInvoices.length === 0 ? (
          <p className="text-slate-400 text-center py-10 text-xs font-bold">لا توجد مبيعات في هذه الفترة</p>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredInvoices.map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="font-bold text-indigo-600 text-xs">فاتورة #${inv.id.slice(-6)} ({inv.orderType})</span>
                  <p className="text-[10px] text-slate-400 font-semibold">{new Date(inv.createdAt).toLocaleString('ar-EG')}</p>
                </div>
                <span className="font-black text-slate-900 text-sm">{inv.total} ج.م</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
