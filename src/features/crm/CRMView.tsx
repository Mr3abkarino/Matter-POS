import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/dexie';
import { Users, Phone, MapPin } from 'lucide-react';

export function CRMView() {
  const customers = useLiveQuery(() => db.customers.toArray()) || [];
  const deliveryOrders = useLiveQuery(() => db.invoices.where('orderType').equals('دليفري').toArray()) || [];

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-slate-100 dir-rtl font-sans">
      <h1 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
        <Users className="text-indigo-600" size={28} />
        <span>العملاء وطلبات الدليفري</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* قائمة طلبات الدليفري */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
          <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <span>🛵 طلبات الدليفري الحالية</span>
            <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-bold">{deliveryOrders.length}</span>
          </h3>
          {deliveryOrders.length === 0 ? (
            <p className="text-slate-400 text-center py-10">لا توجد طلبات دليفري مسجلة</p>
          ) : (
            <div className="flex flex-col gap-3 overflow-y-auto max-h-96">
              {deliveryOrders.map((order: any) => (
                <div key={order.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-800 text-sm">طلب دليفري #{order.id}</span>
                    <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleTimeString('ar-EG')}</p>
                  </div>
                  <span className="font-black text-indigo-600">{order.total} ج.م</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* قائمة العملاء */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
          <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <span>👥 قاعدة بيانات العملاء</span>
            <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-bold">{customers.length}</span>
          </h3>
          {customers.length === 0 ? (
            <p className="text-slate-400 text-center py-10">لم يتم تسجيل عملاء جدد بعد</p>
          ) : (
            <div className="flex flex-col gap-3 overflow-y-auto max-h-96">
              {customers.map((c: any) => (
                <div key={c.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{c.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Phone size={12} /> {c.phone}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
