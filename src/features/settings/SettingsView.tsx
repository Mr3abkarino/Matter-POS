import React from 'react';
import { Settings, Store, Printer, Database } from 'lucide-react';

export function SettingsView() {
  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-slate-100 dir-rtl font-sans">
      <h1 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
        <Settings className="text-indigo-600" size={28} />
        <span>إعدادات النظام</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Store className="text-indigo-600" size={20} />
            <span>بيانات المحل والفاتورة</span>
          </h3>
          <div className="text-xs text-slate-600 flex flex-col gap-1">
            <p><b>اسم المطعم:</b> دريم كورنر</p>
            <p><b>العنوان:</b> البرامون - بجوار عيادة د. إلهام العشري</p>
            <p><b>رقم الهاتف:</b> 01006113627</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Database className="text-indigo-600" size={20} />
            <span>حالة قاعدة البيانات المحليّة</span>
          </h3>
          <p className="text-xs text-slate-500">النظام يعمل بخاصية Offline-First المربوطة بـ IndexedDB المحلية لضمان الأمان والسرعة.</p>
        </div>
      </div>
    </div>
  );
}
