import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { dbCloud } from '../../db/firebase';
import { UserCheck, RefreshCw } from 'lucide-react';

export function DriverSettlementView() {
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(dbCloud, "invoices"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      // فقط فواتير اليوم
      const today = new Date().setHours(0,0,0,0);
      setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(i => i.createdAt >= today));
    });
    return () => unsub();
  }, []);

  const driverSummary = invoices
    .filter(inv => inv.orderType === 'دليفري' && inv.driverName)
    .reduce((acc: any, inv: any) => {
      const driver = inv.driverName;
      if (!acc[driver]) acc[driver] = { count: 0, totalCash: 0, totalDeliveryFees: 0 };
      acc[driver].count += 1;
      acc[driver].totalCash += Number(inv.total || 0);
      acc[driver].totalDeliveryFees += Number(inv.deliveryFee || 0);
      return acc;
    }, {});

  return (
    <div className="flex-1 p-6 bg-slate-100 dir-rtl font-sans">
      <h1 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
        <UserCheck className="text-indigo-600" /> تقفيل حسابات الطيارين (اليوم)
      </h1>
      
      {Object.keys(driverSummary).length === 0 ? (
        <p className="text-slate-500 font-bold">لا توجد طلبات دليفري اليوم.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(driverSummary).map(driver => (
            <div key={driver} className="bg-white p-5 rounded-3xl border shadow-sm">
              <div className="flex justify-between items-center mb-4 pb-3 border-b">
                <span className="font-black text-indigo-900">🛵 {driver}</span>
                <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-lg font-bold">{driverSummary[driver].count} أوردر</span>
              </div>
              <div className="flex justify-between font-black text-sm text-slate-700 mb-2">
                <span>المبلغ المطلوب توريده:</span>
                <span className="text-emerald-600">{driverSummary[driver].totalCash} ج.م</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-bold">
                <span>رسوم التوصيل:</span>
                <span>{driverSummary[driver].totalDeliveryFees} ج.م</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
