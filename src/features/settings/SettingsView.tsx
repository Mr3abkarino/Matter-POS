import React, { useState } from 'react';
import { db } from '../../db/dexie';
import { Settings, Printer, Shield, Database, RotateCcw, Download, Upload } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [restaurantName, setRestaurantName] = useState('دريم كورنر - Dream Corner');
  const [phone, setPhone] = useState('01012345678');
  const [address, setAddress] = useState('البرامون - الدقهلية');
  const [paperWidth, setPaperWidth] = useState<'80mm' | '58mm'>('80mm');

  // دالة تصدير النسخة الاحتياطية (JSON Backup)
  const handleExportBackup = async () => {
    const backupData = {
      products: await db.products.toArray(),
      categories: await db.categories.toArray(),
      customers: await db.customers.toArray(),
      invoices: await db.invoices.toArray(),
      suppliers: await db.suppliers.toArray(),
      shifts: await db.shifts.toArray(),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DreamCorner_POS_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    alert('✅ تم تصدير النسخة الاحتياطية بنجاح!');
  };

  // دالة تهيئة وتصفير النظام بالكامل
  const handleFactoryReset = async () => {
    if (window.confirm('⚠️ تحذير خطير: هل أنت متأكد من مسح كافة بيانات المبيعات والمخزن وإعادة ضبط المصنع؟')) {
      await db.delete();
      window.location.reload();
    }
  };

  return (
    <div className="flex-1 bg-slate-50 p-4 sm:p-6 overflow-y-auto space-y-6 dir-rtl">
      
      <div className="border-b pb-4">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Settings className="text-indigo-600" /> إعدادات النظام والنسخ الاحتياطي
        </h2>
        <p className="text-xs text-slate-400 font-bold mt-1">إدارة بيانات المطعم، الطابعة الحرارية، والنسخ الاحتياطي</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. بيانات المطعم */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3 text-xs">
          <h3 className="font-extrabold text-sm text-slate-900 border-b pb-2 flex items-center gap-2">
            <Settings size={16} className="text-indigo-600" /> بيانات المطعم
          </h3>
          <div>
            <label className="font-bold text-slate-600 block mb-1">اسم المطعم</label>
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="w-full h-9 border rounded-xl px-3 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="font-bold text-slate-600 block mb-1">العنوان</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full h-9 border rounded-xl px-3 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="font-bold text-slate-600 block mb-1">رقم الهاتف</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-9 border rounded-xl px-3 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* 2. إعدادات الطباعة */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3 text-xs">
          <h3 className="font-extrabold text-sm text-slate-900 border-b pb-2 flex items-center gap-2">
            <Printer size={16} className="text-indigo-600" /> إعدادات الطباعة الحرارية
          </h3>
          <div>
            <label className="font-bold text-slate-600 block mb-1">مقاس الورق الحراري (Thermal Paper)</label>
            <select
              value={paperWidth}
              onChange={(e) => setPaperWidth(e.target.value as '80mm' | '58mm')}
              className="w-full h-9 border rounded-xl px-3 font-bold outline-none bg-white"
            >
              <option value="80mm">80mm (قياسي)</option>
              <option value="58mm">58mm (صغير)</option>
            </select>
          </div>
        </div>

        {/* 3. النسخ الاحتياطي للبيانات */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3 text-xs">
          <h3 className="font-extrabold text-sm text-slate-900 border-b pb-2 flex items-center gap-2">
            <Database size={16} className="text-indigo-600" /> النسخ الاحتياطي واستعادة البيانات
          </h3>
          <p className="text-slate-400 font-semibold">حفظ نسخة احتياطية محلية من كافة الفواتير والمنتجات بصيغة JSON.</p>
          <button
            onClick={handleExportBackup}
            className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-md flex items-center justify-center gap-2"
          >
            <Download size={15} /> تصدير نسخة احتياطية
          </button>
        </div>

        {/* 4. إعادة التصفير */}
        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-xs space-y-3 text-xs">
          <h3 className="font-extrabold text-sm text-rose-600 border-b pb-2 flex items-center gap-2">
            <RotateCcw size={16} /> ضبط المصنع وتصفير النظام
          </h3>
          <p className="text-slate-400 font-semibold">مسح كامل قاعدة البيانات المحلية وبدء دورة عمل جديدة نظيفة.</p>
          <button
            onClick={handleFactoryReset}
            className="w-full h-10 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl shadow-md"
          >
            ⚠️ إعادة تصفير النظام بالكامل
          </button>
        </div>

      </div>
    </div>
  );
};
