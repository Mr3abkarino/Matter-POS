import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { dbCloud } from '../../db/firebase';
import { UserCheck, CheckCircle2, FileText, Eye, X } from 'lucide-react';

export function DriverSettlementView() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedDriverForDetails, setSelectedDriverForDetails] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(dbCloud, "invoices"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      // جلب فواتير اليوم
      const today = new Date().setHours(0,0,0,0);
      const invs = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter((i: any) => i.createdAt >= today);
      setInvoices(invs);
    });
    return () => unsub();
  }, []);

  // تجميع الحسابات للطيارين الذين لديهم أوردرات لم تُحصّل بعد (isSettled !== true)
  const activeInvoices = invoices.filter(inv => inv.orderType === 'دليفري' && inv.driverName && !inv.isSettled);

  const driverSummary = activeInvoices.reduce((acc: any, inv: any) => {
    const driver = inv.driverName;
    if (!acc[driver]) acc[driver] = { count: 0, totalCash: 0, totalDeliveryFees: 0, invoices: [] };
    acc[driver].count += 1;
    acc[driver].totalCash += Number(inv.total || 0);
    acc[driver].totalDeliveryFees += Number(inv.deliveryFee || 0);
    acc[driver].invoices.push(inv);
    return acc;
  }, {});

  // 💵 دالة تقفيل واستلام النقدية من الطيار
  const handleSettleDriver = async (driverName: string) => {
    const driverData = driverSummary[driverName];
    if (!driverData) return;

    if (confirm(`هل تم استلام مبلغ (${driverData.totalCash} ج.م) من الطيار ${driverName} وتقفيل الحساب؟`)) {
      try {
        // تحديث جميع فواتير هذا الطيار لتصبح تسوية مكتمِلة
        for (const inv of driverData.invoices) {
          await updateDoc(doc(dbCloud, "invoices", inv.id), {
            isSettled: true,
            settledAt: Date.now()
          });
        }
        alert(`✅ تم تقفيل حساب الطيار ${driverName} بنجاح!`);
      } catch (error) {
        console.error("Error settling driver:", error);
        alert("حدث خطأ أثناء تقفيل الحساب!");
      }
    }
  };

  return (
    <div className="flex-1 p-4 md:p-6 bg-slate-100 dir-rtl font-sans overflow-y-auto">
      
      {/* الهيدر */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
            <UserCheck className="text-indigo-600" size={28} />
            <span>تقفيل حسابات الطيارين (اليوم)</span>
          </h1>
          <p className="text-xs text-slate-500 font-bold mt-1">مراجعة وتوريد نقدية أوردرات الدليفري</p>
        </div>
      </div>

      {Object.keys(driverSummary).length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-sm">
          <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={40} />
          <h3 className="font-black text-slate-800 text-sm">جميع حسابات الطيارين مقفلة ومتوفرة!</h3>
          <p className="text-xs text-slate-400 font-bold mt-1">لا توجد مبالغ معلقة بانتظار التوريد حالياً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(driverSummary).map(driver => {
            const data = driverSummary[driver];
            return (
              <div key={driver} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                    <span className="font-black text-base text-slate-900">🛵 {driver}</span>
                    <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-1 rounded-xl font-black">
                      {data.count} أوردر
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-3 space-y-2">
                    <div className="flex justify-between font-black text-sm text-slate-700">
                      <span>المبلغ المطلوب توريده:</span>
                      <span className="text-emerald-600 font-black text-base">{data.totalCash} ج.م</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 font-bold">
                      <span>شاملة رسوم التوصيل:</span>
                      <span>{data.totalDeliveryFees} ج.م</span>
                    </div>
                  </div>
                </div>

                {/* أزرار التفاعل والإجراءات */}
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedDriverForDetails(driver)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-xs flex items-center justify-center gap-1 transition-all"
                    title="عرض الفواتير والتفاصيل"
                  >
                    <Eye size={16} />
                    <span className="hidden sm:inline">التفاصيل</span>
                  </button>

                  <button
                    onClick={() => handleSettleDriver(driver)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                  >
                    <CheckCircle2 size={16} />
                    <span>تصفية وتوريد النقدية</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 📄 نافذة تفاصيل فواتير الطيار */}
      {selectedDriverForDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md dir-rtl shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 mb-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <FileText size={18} className="text-indigo-600" />
                <span>فواتير الطيار: {selectedDriverForDetails}</span>
              </h3>
              <button onClick={() => setSelectedDriverForDetails(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto flex flex-col gap-2 mb-4">
              {driverSummary[selectedDriverForDetails]?.invoices.map((inv: any) => (
                <div key={inv.id} className="p-2.5 bg-slate-50 rounded-2xl border text-xs font-bold flex justify-between items-center">
                  <div>
                    <div className="text-slate-800">{inv.customerName || 'عميل دليفري'}</div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(inv.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <span className="font-black text-indigo-600">{inv.total} ج.م</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedDriverForDetails(null)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-2xl font-bold text-xs"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
