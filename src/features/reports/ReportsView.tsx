import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { dbCloud } from '../../db/firebase';
import {
  TrendingUp,
  Receipt,
  DollarSign,
  ShoppingBag,
  Award,
  Trash2,
  Percent,
  PieChart as PieChartIcon
} from 'lucide-react';

export function ReportsView() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [selectedOrderType, setSelectedOrderType] = useState<string>('all');

  // 🔄 المزامنة اللحظية للفواتير من السحابة
  useEffect(() => {
    const q = query(collection(dbCloud, "invoices"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error("Error fetching invoices:", err));

    return () => unsub();
  }, []);

  // 🗓️ تصفية الفواتير حسب الفترة الزمنية المحددة
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const filteredInvoices = invoices.filter(inv => {
    const invTime = inv.createdAt || 0;
    let matchTime = true;
    if (filterPeriod === 'today') matchTime = invTime >= startOfToday;
    else if (filterPeriod === 'week') matchTime = invTime >= startOfWeek;
    else if (filterPeriod === 'month') matchTime = invTime >= startOfMonth;

    let matchType = true;
    if (selectedOrderType !== 'all') matchType = inv.orderType === selectedOrderType;

    return matchTime && matchType;
  });

  // 📊 الأرقام والمؤشرات الرئيسية (KPIs)
  const totalSales = filteredInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
  const totalOrders = filteredInvoices.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
  const totalDeliveryFees = filteredInvoices.reduce((sum, inv) => sum + Number(inv.deliveryFee || 0), 0);

  // 🍕 تحليل وتجميع أفضل الأصناف المبيعة (Top Selling Items)
  const itemSalesMap: { [key: string]: { name: string; count: number; totalRevenue: number } } = {};

  filteredInvoices.forEach(inv => {
    if (Array.isArray(inv.items)) {
      inv.items.forEach((item: any) => {
        const name = item.name || 'صنف غير معروف';
        const qty = Number(item.quantity || 1);
        const price = Number(item.price || 0);

        if (!itemSalesMap[name]) {
          itemSalesMap[name] = { name, count: 0, totalRevenue: 0 };
        }
        itemSalesMap[name].count += qty;
        itemSalesMap[name].totalRevenue += (price * qty);
      });
    }
  });

  const topItems = Object.values(itemSalesMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // أفضل 5 أصناف

  // 🚚 توزيع الطلبات حسب النوع (تيك أواي / صالة / دليفري)
  const orderTypeCounts = {
    'تيك أواي': filteredInvoices.filter(i => i.orderType === 'تيك أواي').length,
    'صالة': filteredInvoices.filter(i => i.orderType === 'صالة').length,
    'دليفري': filteredInvoices.filter(i => i.orderType === 'دليفري').length,
  };

  // 🗑️ حذف فاتورة (في حالة الإلغاء أو الخطأ)
  const handleDeleteInvoice = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الفاتورة من السجلات؟")) {
      await deleteDoc(doc(dbCloud, "invoices", id));
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto bg-slate-100 dir-rtl font-sans">
      
      {/* 👑 الهيدر والتصفية */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="text-indigo-600" size={28} />
            <span>لوحة التقارير والتحليلات</span>
          </h1>
          <p className="text-xs text-slate-500 font-bold mt-1">تابع المبيعات والأداء المالي لمطعم Dream Corner لحظياً</p>
        </div>

        {/* أدوات تصفية الفترة */}
        <div className="flex flex-wrap gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          {(['today', 'week', 'month', 'all'] as const).map(period => (
            <button
              key={period}
              onClick={() => setFilterPeriod(period)}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all ${
                filterPeriod === period
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {period === 'today' ? 'اليوم' : period === 'week' ? 'هذا الأسبوع' : period === 'month' ? 'هذا الشهر' : 'الكل'}
            </button>
          ))}
        </div>
      </div>

      {/* 📈 بطاقات الأرقام والمؤشرات الرئيسية (KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold mb-1">إجمالي المبيعات</p>
            <h3 className="text-2xl font-black text-slate-900">{totalSales.toLocaleString()} <span className="text-xs font-normal">ج.م</span></h3>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold mb-1">عدد الفواتير</p>
            <h3 className="text-2xl font-black text-slate-900">{totalOrders} <span className="text-xs font-normal">طلب</span></h3>
          </div>
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl">
            <Receipt size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold mb-1">متوسط قيمة الطلب</p>
            <h3 className="text-2xl font-black text-slate-900">{avgOrderValue} <span className="text-xs font-normal">ج.م</span></h3>
          </div>
          <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl">
            <Percent size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold mb-1">إيراد التوصيل</p>
            <h3 className="text-2xl font-black text-slate-900">{totalDeliveryFees} <span className="text-xs font-normal">ج.م</span></h3>
          </div>
          <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">
            <ShoppingBag size={24} />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* 🏆 الأكثر مبيعاً (Top 5 Products) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2 border-b pb-3">
            <Award className="text-amber-500" size={20} />
            <span>الأصناف الأكثر طلبًا (الأعلى مبيعاً)</span>
          </h3>

          {topItems.length === 0 ? (
            <div className="flex-1 flex justify-center items-center py-10 text-slate-400 font-bold text-xs">
              لا توجد مبيعات مسجلة في هذه الفترة
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {topItems.map((item, index) => {
                const maxCount = topItems[0].count || 1;
                const percentage = Math.round((item.count / maxCount) * 100);

                return (
                  <div key={item.name} className="flex flex-col gap-1.5 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center text-xs font-black">
                      <span className="flex items-center gap-2 text-slate-900">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white ${index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-slate-400' : 'bg-amber-700'}`}>
                          {index + 1}
                        </span>
                        {item.name}
                      </span>
                      <span className="text-indigo-600">{item.count} عدد <span className="text-slate-400 font-normal">({item.totalRevenue} ج.م)</span></span>
                    </div>
                    {/* شريط الأداء البصري */}
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 📊 توزيع أنواع الطلبات */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2 border-b pb-3">
            <PieChartIcon className="text-indigo-600" size={20} />
            <span>نسبة أنواع الطلبات</span>
          </h3>

          <div className="flex flex-col gap-3 my-auto">
            <div className="p-3.5 bg-indigo-50 rounded-2xl border border-indigo-100 flex justify-between items-center">
              <span className="font-bold text-xs text-indigo-900">🛵 دليفري (توصيل)</span>
              <span className="font-black text-indigo-600 text-sm">{orderTypeCounts['دليفري']} طلب</span>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-between items-center">
              <span className="font-bold text-xs text-emerald-900">🛍️ تيك أواي (سفري)</span>
              <span className="font-black text-emerald-600 text-sm">{orderTypeCounts['تيك أواي']} طلب</span>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-100 flex justify-between items-center">
              <span className="font-bold text-xs text-amber-900">🍽️ صالة (محلي)</span>
              <span className="font-black text-amber-600 text-sm">{orderTypeCounts['صالة']} طلب</span>
            </div>
          </div>
        </div>

      </div>

      {/* 🧾 جدول تفاصيل الفواتير المسجلة */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 border-b pb-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Receipt className="text-indigo-600" size={20} />
            <span>سجل الفواتير التفصيلي ({filteredInvoices.length})</span>
          </h3>

          <select
            value={selectedOrderType}
            onChange={(e) => setSelectedOrderType(e.target.value)}
            className="p-2 rounded-xl border text-xs font-bold bg-slate-50 text-slate-700 focus:outline-none"
          >
            <option value="all">كل أنواع الطلبات</option>
            <option value="تيك أواي">تيك أواي فقط</option>
            <option value="دليفري">دليفري فقط</option>
            <option value="صالة">صالة فقط</option>
          </select>
        </div>

        {filteredInvoices.length === 0 ? (
          <p className="text-slate-400 text-center py-10 text-xs font-bold">لا توجد فواتير مطابقة للبحث حتى الآن</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b text-slate-400 font-bold bg-slate-50">
                  <th className="p-3">التاريخ والوقت</th>
                  <th className="p-3">نوع الطلب</th>
                  <th className="p-3">اسم العميل / المنطقة</th>
                  <th className="p-3">الأصناف</th>
                  <th className="p-3">الإجمالي</th>
                  <th className="p-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-all font-bold text-slate-800">
                    <td className="p-3 text-slate-500 text-[11px]">
                      {inv.createdAt ? new Date(inv.createdAt).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }) : 'غير محدد'}
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black ${
                        inv.orderType === 'دليفري' ? 'bg-blue-100 text-blue-700' :
                        inv.orderType === 'صالة' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {inv.orderType}
                      </span>
                    </td>
                    <td className="p-3">
                      {inv.customerName || 'عميل مباشر'}
                      {inv.zoneName && <span className="block text-[10px] text-slate-400">({inv.zoneName})</span>}
                    </td>
                    <td className="p-3 text-[11px] text-slate-600 max-w-xs truncate">
                      {Array.isArray(inv.items) ? inv.items.map((i: any) => `${i.name} (${i.quantity})`).join(', ') : '-'}
                    </td>
                    <td className="p-3 font-black text-indigo-600 text-sm">
                      {inv.total} ج.م
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDeleteInvoice(inv.id)}
                        className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all"
                        title="حذف الفاتورة"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
