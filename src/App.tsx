import React, { useState } from 'react';
import { POSView } from './features/pos/POSView';
import { InvoicesView } from './features/invoices/InvoicesView';
import { ReportsView } from './features/reports/ReportsView';
import { CRMView } from './features/crm/CRMView';
import { ShoppingBag, FileText, BarChart3, Users, Store } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'pos' | 'invoices' | 'reports' | 'crm'>('pos');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans dir-rtl dir-rtl-force">
      {/* الشريط الجانبي للتنقل (Sidebar) */}
      <aside className="w-16 md:w-20 bg-slate-900 text-white flex flex-col items-center py-4 justify-between z-20 shadow-2xl shrink-0">
        <div className="flex flex-col items-center gap-6 w-full">
          {/* شعار المحل */}
          <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-500/30">
            DC
          </div>

          {/* أزرار التنقل بين الشاشات */}
          <nav className="flex flex-col gap-3 w-full px-2">
            <button
              onClick={() => setActiveTab('pos')}
              title="شاشة البيع (POS)"
              className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all ${
                activeTab === 'pos'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Store size={22} />
              <span className="text-[10px] font-bold mt-1 hidden md:block">الكاشير</span>
            </button>

            <button
              onClick={() => setActiveTab('invoices')}
              title="سجل الفواتير"
              className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all ${
                activeTab === 'invoices'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileText size={22} />
              <span className="text-[10px] font-bold mt-1 hidden md:block">الفواتير</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              title="التقارير والأرباح"
              className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all ${
                activeTab === 'reports'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BarChart3 size={22} />
              <span className="text-[10px] font-bold mt-1 hidden md:block">التقارير</span>
            </button>

            <button
              onClick={() => setActiveTab('crm')}
              title="العملاء والدليفري"
              className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all ${
                activeTab === 'crm'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users size={22} />
              <span className="text-[10px] font-bold mt-1 hidden md:block">العملاء</span>
            </button>
          </nav>
        </div>

        {/* حالة النظام أوفلاين */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="متصل بالكامل / نظام أوفلاين محلي" />
          <span className="text-[9px] text-slate-500 font-bold hidden md:block">نشط</span>
        </div>
      </aside>

      {/* شاشة العرض الرئيسية المتبدلة */}
      <main className="flex-1 h-full overflow-hidden flex flex-col">
        {activeTab === 'pos' && <POSView />}
        {activeTab === 'invoices' && <InvoicesView />}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'crm' && <CRMView />}
      </main>
    </div>
  );
}
