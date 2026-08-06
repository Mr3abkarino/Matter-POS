import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/dexie';
import { BarChart3, TrendingUp, ShoppingBag, DollarSign } from 'lucide-react';

export function ReportsView() {
  const invoices = useLiveQuery(() => db.invoices.toArray()) || [];

  const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalOrders = invoices.length;
  const avgOrderValue = totalOrders > 0 ? (totalSales / totalOrders).toFixed(1) : 0;

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-slate-100 dir-rtl font-sans">
      <h1 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
        <BarChart3 className="text-indigo-600" size={28} />
        <span>التقارير والأرباح</span>
      </h1>

      {/* كروت الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-xl">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">إجمالي المبيعات</p>
            <h3 className="text-2xl font-black text-slate-900">{totalSales} ج.م</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold text-xl">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">إجمالي الطلبات</p>
            <h3 className="text-2xl font-black text-slate-900">{totalOrders} طلب</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-bold text-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">متوسط قيمة الطلب</p>
            <h3 className="text-2xl font-black text-slate-900">{avgOrderValue} ج.م</h3>
          </div>
        </div>
      </div>

      {/* سجل الفواتير المفصل */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex-1">
        <h3 className="font-bold text-lg text-slate-800 mb-4">سجل حركة المبيعات الأخيرة</h3>
        {invoices.length === 0 ? (
          <p className="text-slate-400 text-center py-10">لا توجد مبيعات مسجلة حتى الآن</p>
        ) : (
          <div className="flex flex-col gap-3">
            {invoices.map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="font-bold text-indigo-600 text-sm">فاتورة #{inv.id}</span>
                  <p className="text-xs text-slate-500">{new Date(inv.createdAt).toLocaleString('ar-EG')} - ({inv.orderType})</p>
                </div>
                <div className="text-left">
                  <span className="font-black text-slate-900 text-base">{inv.total} ج.م</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
