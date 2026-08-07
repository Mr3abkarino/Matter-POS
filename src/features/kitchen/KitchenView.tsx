import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { dbCloud } from '../../db/firebase';
import { ChefHat, CheckCircle2, Clock, Bike, Utensils, ShoppingBag } from 'lucide-react';

export function KitchenView() {
  const [activeOrders, setActiveOrders] = useState<any[]>([]);

  useEffect(() => {
    // 📡 الاستماع اللحظي للطلبات التي لم يتم تسليمها بعد
    const unsub = onSnapshot(collection(dbCloud, "invoices"), (snap) => {
      const orders = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter((o: any) => o.status !== 'completed' && o.status !== 'delivered')
        .sort((a: any, b: any) => (a.createdAt || 0) - (b.createdAt || 0));

      // تشغيل صوت جرس تنبيه عند وصول طلب جديد
      if (orders.length > activeOrders.length && activeOrders.length !== 0) {
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.play();
        } catch (e) {
          console.log("Audio play error:", e);
        }
      }

      setActiveOrders(orders);
    });

    return () => unsub();
  }, [activeOrders.length]);

  // 🔄 تحديث حالة الطلب
  const updateOrderStatus = async (orderId: string, currentStatus: string) => {
    let nextStatus = 'preparing';
    if (!currentStatus || currentStatus === 'pending') nextStatus = 'preparing';
    else if (currentStatus === 'preparing') nextStatus = 'ready';
    else if (currentStatus === 'ready') nextStatus = 'completed';

    await updateDoc(doc(dbCloud, "invoices", orderId), {
      status: nextStatus
    });
  };

  const getOrderTypeBadge = (type: string) => {
    switch (type) {
      case 'دليفري':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1"><Bike size={14} /> دليفري</span>;
      case 'صالة':
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1"><Utensils size={14} /> صالة</span>;
      default:
        return <span className="bg-purple-100 text-purple-800 border border-purple-300 px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1"><ShoppingBag size={14} /> تيك أواي</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 dir-rtl font-sans">
      
      {/* الهيدر */}
      <div className="flex justify-between items-center bg-slate-800 p-4 rounded-2xl border border-slate-700 mb-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 p-2.5 rounded-2xl text-slate-900">
            <ChefHat size={28} />
          </div>
          <div>
            <h1 className="text-xl font-black">شاشة المطبخ (KDS)</h1>
            <p className="text-slate-400 text-xs font-bold">الطلبات النشطة المطلوبة للتحضير الآن</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-2xl flex items-center gap-2">
          <span className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></span>
          <span className="font-black text-sm">{activeOrders.length} طلبات قيد الانتظار</span>
        </div>
      </div>

      {/* شبكة الطلبات */}
      {activeOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <CheckCircle2 size={64} className="mb-3 text-emerald-500/50" />
          <h2 className="text-lg font-black">لا توجد طلبات معلقة حالياً</h2>
          <p className="text-xs font-bold text-slate-600">أي طلب جديد من الـ POS هيظهر هنا فوراً مع صوت جرس</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {activeOrders.map((order) => {
            const minutesAgo = Math.floor((Date.now() - (order.createdAt || Date.now())) / 60000);
            const isLate = minutesAgo > 15;

            return (
              <div 
                key={order.id} 
                className={`bg-slate-800 border-2 rounded-3xl p-4 flex flex-col justify-between shadow-xl transition-all ${
                  isLate ? 'border-rose-500/80 bg-rose-950/20' : order.status === 'ready' ? 'border-emerald-500/80 bg-emerald-950/20' : 'border-slate-700'
                }`}
              >
                <div>
                  {/* راس الطلب */}
                  <div className="flex justify-between items-start mb-3 border-b border-slate-700/60 pb-3">
                    <div>
                      {getOrderTypeBadge(order.orderType)}
                      {order.driverName && (
                        <p className="text-[11px] text-amber-400 font-bold mt-1">🛵 الطيار: {order.driverName}</p>
                      )}
                    </div>
                    
                    <div className={`flex items-center gap-1 font-black text-xs px-2.5 py-1 rounded-xl border ${
                      isLate ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse' : 'bg-slate-700 text-slate-300 border-slate-600'
                    }`}>
                      <Clock size={12} />
                      <span>منذ {minutesAgo} دقيقة</span>
                    </div>
                  </div>

                  {/* تفاصيل الاصناف */}
                  <div className="flex flex-col gap-2 my-3 max-h-60 overflow-y-auto pr-1">
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-900/80 p-2.5 rounded-2xl border border-slate-700/50">
                        <span className="font-black text-sm text-slate-100">{item.name}</span>
                        <span className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-xl">
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* زر الحركة للحالة */}
                <div className="mt-4 pt-3 border-t border-slate-700/60">
                  <button
                    onClick={() => updateOrderStatus(order.id, order.status)}
                    className={`w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all ${
                      order.status === 'ready'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : order.status === 'preparing'
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {order.status === 'ready' ? (
                      <>
                        <CheckCircle2 size={16} />
                        <span>تم التسليم (إنهاء الطلب)</span>
                      </>
                    ) : order.status === 'preparing' ? (
                      <>
                        <ChefHat size={16} />
                        <span>الطلب جاهز للتسليم 📦</span>
                      </>
                    ) : (
                      <>
                        <Clock size={16} />
                        <span>بدء التحضير 👨‍🍳</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
