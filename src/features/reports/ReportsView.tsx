import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { dbCloud } from '../../db/firebase';
import { ShiftReportModal } from './ShiftReportModal';
import {
  TrendingUp,
  Receipt,
  DollarSign,
  ShoppingBag,
  Award,
  Trash2,
  Percent,
  UserCheck,
  PieChart as PieChartIcon,
  Printer,
  Download
} from 'lucide-react';

export function ReportsView() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [selectedOrderType, setSelectedOrderType] = useState<string>('all');
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(dbCloud, "invoices"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error("Error fetching invoices:", err));

    return () => unsub();
  }, []);

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

  const totalSales = filteredInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
  const totalOrders = filteredInvoices.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
  const totalDeliveryFees = filteredInvoices.reduce((sum, inv) => sum + Number(inv.deliveryFee || 0), 0);

  // 📊 دالة تصدير البيانات إلى شيت Excel (CSV مع دعم العربي BOM)
  const handleExportExcel = () => {
    if (filteredInvoices.length === 0) {
      alert("لا توجد فواتير لتصديرها في هذه الفترة!");
      return;
    }

    const headers = ['رقم الفاتورة', 'التاريخ والوقت', 'نوع الطلب', 'الطيار / العميل', 'الإجمالي (ج.م)', 'خدمة التوصيل (ج.م)'];
    
    const rows = filteredInvoices.map(inv => [
      inv.id,
      new Date(inv.createdAt).toLocaleString('ar-EG'),
      inv.orderType || 'تيك أواي',
      inv.driverName ? `الطيار: ${inv.driverName}` : inv.customerName || 'عميل مباشر',
      inv.total || 0,
      inv.deliveryFee || 0
    ]);

    const BOM = '\uFEFF';
    const csvContent = BOM + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `تقارير_مبيعات_دريم_كورنر_${filterPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 🛵 تجميع وتقفيل حسابات الطيارين
  const driverSummary = filteredInvoices
    .filter(inv => inv.orderType === 'دليفري' && inv.driverName)
    .reduce((acc: any, inv: any) => {
      const driver = inv.driverName;
      if (!acc[driver]) {
        acc[driver] = { count: 0, totalCash: 0, totalDeliveryFees: 0 };
      }
      acc[driver].count += 1;
      acc[driver].totalCash += Number(inv.total || 0);
      acc[driver].totalDeliveryFees += Number(inv.deliveryFee || 0);
      return acc;
    }, {});

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
    .slice(0, 5);

  const orderTypeCounts = {
    'تيك أواي': filteredInvoices.filter(i => i.orderType === 'تيك أواي').length,
    'صالة': filteredInvoices.filter(i => i.orderType === 'صالة').length,
    'دليفري': filteredInvoices.filter(i => i.orderType === 'دليفري').length,
  };

  const handleDeleteInvoice = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الفاتورة من السجلات؟")) {
      await deleteDoc(doc(dbCloud, "invoices", id));
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto bg-slate-100 dir-rtl font-sans">
      
      {/* الهيدر والتصفية */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="text-indigo-600" size={28} />
            <span>لوحة التقارير والتحليلات</span>
          </h1>
          <p className="text-xs text-slate-500 font-bold mt-1">تابع المبيعات وتقفيل الطيارين لمطعم Dream Corner</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 📊 زر تصدير Excel */}
          <button
            onClick={handleExportExcel}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <Download size={16} />
            <span>تصدير Excel</span>
          </button>

          {/* 🖨️ زر تقفيل الشيفت اليومي */}
          <button
            onClick={() => setIsShiftModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <Printer size={16} />
            <span>تقفيل الشيفت (Z-Report)</span>
          </button>

          {/* فلاتر الفترة الزمنية */}
          <div className="flex flex-wrap gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            {(['today', 'week', 'month', 'all'] as const).map(period => (
              <button
                key={period}
                onClick={() => setFilterPeriod(period)}
                className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all ${
                  filterPeriod === period ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {period === 'today' ? 'اليوم' : period === 'week' ? 'هذا الأسبوع' : period === 'month' ? 'هذا الشهر' : 'الكل'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 📊 بطاقات الأرقام */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold mb-1">إجمالي المبيعات</p>
            <h3 className="text-2xl font-black text-slate-900">{totalSales.toLocaleString()} <span className="text-xs font-normal">ج.م</span></h3>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl"><DollarSign size={24} /></div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold mb-1">عدد الفواتير</p>
            <h3 className="text-2xl font-black text-slate-900">{totalOrders} <span className="text-xs font-normal">طلب</span></h3>
          </div>
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl"><Receipt size={24} /></div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold mb-1">متوسط قيمة الطلب</p>
            <h3 className="text-2xl font-black text-slate-900">{avgOrderValue} <span className="text-xs font-normal">ج.م</span></h3>
          </div>
          <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl"><Percent size={24} /></div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold mb-1">إيراد التوصيل</p>
            <h3 className="text-2xl font-black text-slate-900">{totalDeliveryFees} <span className="text-xs font-normal">ج.م</span></h3>
          </div>
          <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl"><ShoppingBag size={24} /></div>
        </div>
      </div>

      {/* 🛵 كشف وتقفيل حسابات الطيارين */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm mb-6">
        <h3 className="font-bold text-slate-900 text-sm mb-4 border-b pb-3 flex items-center gap-2">
          <UserCheck className="text-indigo-600" size={20} />
          <span>تقفيل حسابات طيارين الدليفري</span>
        </h3>

        {Object.keys(driverSummary).length === 0 ? (
          <p className="text-xs font-bold text-slate-400 text-center py-4">لا توجد طلبات دليفري مسجلة لطيارين في هذه الفترة</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.keys(driverSummary).map(driver => (
              <div key={driver} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-2">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-black text-xs text-indigo-900">🛵 الطيار: {driver}</span>
                  <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-lg font-bold">
                    {driverSummary[driver].count} أوردر
                  </span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>إجمالي النقدية للمستلم:</span>
                  <span className="text-emerald-600 font-black">{driverSummary[driver].totalCash} ج.م</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-slate-400">
                  <span>منها خدمة توصيل:</span>
                  <span>{driverSummary[driver].totalDeliveryFees} ج.م</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* الأكثر مبيعاً */}
        <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2 border-b pb-3">
            <Award className="text-amber-500" size={20} />
            <span>الأصناف الأكثر طلبًا</span>
          </h3>

          <div className="flex flex-col gap-3">
            {topItems.map((item, index) => (
              <div key={item.name} className="flex flex-col gap-1.5 p-3 bg-slate-50 rounded-2xl border">
                <div className="flex justify-between items-center text-xs font-black">
                  <span className="text-slate-900">{index + 1}. {item.name}</span>
                  <span className="text-indigo-600">{item.count} عدد ({item.totalRevenue} ج.م)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* أنواع الطلبات */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2 border-b pb-3">
            <PieChartIcon className="text-indigo-600" size={20} />
            <span>نسبة أنواع الطلبات</span>
          </h3>
          <div className="flex flex-col gap-3">
            <div className="p-3 bg-indigo-50 rounded-2xl flex justify-between font-bold text-xs"><span>🛵 دليفري</span><span>{orderTypeCounts['دليفري']}</span></div>
            <div className="p-3 bg-emerald-50 rounded-2xl flex justify-between font-bold text-xs"><span>🛍️ تيك أواي</span><span>{orderTypeCounts['تيك أواي']}</span></div>
            <div className="p-3 bg-amber-50 rounded-2xl flex justify-between font-bold text-xs"><span>🍽️ صالة</span><span>{orderTypeCounts['صالة']}</span></div>
          </div>
        </div>
      </div>

      {/* سجل الفواتير */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
        <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
          <Receipt className="text-indigo-600" size={20} />
          <span>سجل الفواتير</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b text-slate-400 font-bold bg-slate-50">
                <th className="p-3">الوقت</th>
                <th className="p-3">نوع الطلب</th>
                <th className="p-3">الطيار / العميل</th>
                <th className="p-3">الإجمالي</th>
                <th className="p-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 font-bold text-slate-800">
                  <td className="p-3 text-slate-500 text-[11px]">{new Date(inv.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="p-3">{inv.orderType}</td>
                  <td className="p-3">{inv.driverName ? `🛵 ${inv.driverName}` : inv.customerName || 'عميل مباشر'}</td>
                  <td className="p-3 font-black text-indigo-600">{inv.total} ج.م</td>
                  <td className="p-3 text-center">
                    <button onClick={() => handleDeleteInvoice(inv.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* النافذة المنبثقة لتقرير Z-Report الحراري */}
      <ShiftReportModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
      />

    </div>
  );
}
