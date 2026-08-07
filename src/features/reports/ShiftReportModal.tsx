import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { dbCloud } from '../../db/firebase';
import { Printer, X, FileText, CheckCircle, Clock } from 'lucide-react';

interface ShiftReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShiftReportModal({ isOpen, onClose }: ShiftReportModalProps) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    takeawayCount: 0,
    takeawayTotal: 0,
    deliveryCount: 0,
    deliveryTotal: 0,
    hallCount: 0,
    hallTotal: 0,
  });

  useEffect(() => {
    if (isOpen) {
      fetchTodayStats();
    }
  }, [isOpen]);

  const fetchTodayStats = async () => {
    setLoading(true);
    try {
      // جلب فواتير اليوم ابتداءً من الساعة 12 صباحاً
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const q = query(
        collection(dbCloud, 'invoices'),
        where('createdAt', '>=', startOfDay.getTime())
      );

      const querySnapshot = await getDocs(q);
      
      let totalSales = 0;
      let takeawayCount = 0, takeawayTotal = 0;
      let deliveryCount = 0, deliveryTotal = 0;
      let hallCount = 0, hallTotal = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const amount = Number(data.total || 0);
        totalSales += amount;

        if (data.orderType === 'دليفري') {
          deliveryCount++;
          deliveryTotal += amount;
        } else if (data.orderType === 'صالة') {
          hallCount++;
          hallTotal += amount;
        } else {
          takeawayCount++;
          takeawayTotal += amount;
        }
      });

      setStats({
        totalSales,
        totalOrders: querySnapshot.size,
        takeawayCount,
        takeawayTotal,
        deliveryCount,
        deliveryTotal,
        hallCount,
        hallTotal,
      });
    } catch (error) {
      console.error('خطأ في جلب تقرير اليوم:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 dir-rtl font-sans">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200">
        
        {/* الهيدر الرئيسي */}
        <div className="bg-slate-900 text-white p-5 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="text-indigo-400" size={22} />
            <h2 className="font-black text-base">تقرير تقفيل الشيفت (Z-Report)</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* 🖨️ الجزء المخصص للطباعة على الورق الحراري */}
        <div id="printable-z-report" className="p-6 text-slate-900 text-sm font-bold">
          
          <div className="text-center border-b-2 border-dashed border-slate-300 pb-4 mb-4">
            <h1 className="text-2xl font-black">DREAM CORNER</h1>
            <p className="text-xs text-slate-500 font-bold mt-1">تقرير تقفيل المبيعات اليومية (Z-REPORT)</p>
            <p className="text-[11px] text-slate-400 mt-1">
              التاريخ: {new Date().toLocaleDateString('ar-EG')} - {new Date().toLocaleTimeString('ar-EG')}
            </p>
          </div>

          {loading ? (
            <div className="py-10 text-center text-slate-400">جاري حساب إحصائيات اليوم...</div>
          ) : (
            <div className="space-y-4">
              
              {/* إجمالي اليوم */}
              <div className="bg-slate-100 p-4 rounded-2xl text-center border border-slate-200">
                <span className="text-xs text-slate-500 block font-black mb-1">إجمالي المبيعات الكلية</span>
                <span className="text-3xl font-black text-indigo-600">{stats.totalSales} ج.م</span>
                <span className="text-xs text-slate-500 block mt-1">إجمالي الفواتير: {stats.totalOrders} فاتورة</span>
              </div>

              {/* تفاصيل الشيفت */}
              <div className="border-t border-b border-dashed border-slate-300 py-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span>🛍️ تيك أواي ({stats.takeawayCount}):</span>
                  <span className="font-black">{stats.takeawayTotal} ج.م</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>🛵 دليفري ({stats.deliveryCount}):</span>
                  <span className="font-black">{stats.deliveryTotal} ج.م</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>🍽️ صالة ({stats.hallCount}):</span>
                  <span className="font-black">{stats.hallTotal} ج.م</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-2">
                تم استخراج هذا التقرير إلكترونياً عبر نظام Dream Corner POS
              </div>
            </div>
          )}
        </div>

        {/* أزرار الإجراءات */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg"
          >
            <Printer size={18} />
            <span>طباعة التقرير (Z-Report)</span>
          </button>
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-5 py-3 rounded-2xl font-black text-xs"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
}
