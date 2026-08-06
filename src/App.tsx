import React, { useState } from 'react';
import { POSView } from './features/pos/POSView';
import { InvoicesView } from './features/invoices/InvoicesView';
import { ReportsView } from './features/reports/ReportsView';
import { CRMView } from './features/crm/CRMView';
import { SettingsView } from './features/settings/SettingsView';
import { ShiftView } from './features/shift/ShiftView';
import { Store, FileText, BarChart3, Users, Settings, Clock } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'pos' | 'invoices' | 'reports' | 'crm' | 'settings' | 'shift'>('pos');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans dir-rtl dir-rtl-force">
      <aside className="w-16 md:w-20 bg-slate-900 text-white flex flex-col items-center py-4 justify-between z-20 shadow-2xl shrink-0">
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-500/30">
            DC
          </div>

          <nav className="flex flex-col gap-3 w-full px-2">
            <button
              onClick={() => setActiveTab('pos')}
              title="الكاشير"
              className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all ${
                activeTab === 'pos' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Store size={22} />
              <span className="text-[10px] font-bold mt-1 hidden md:block">الكاشير</span>
            </button>

            <button
              onClick={() => setActiveTab('shift')}
              title="الوردية والدرج"
              className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all ${
                activeTab === 'shift' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Clock size={22} />
              <span className="text-[10px] font-bold mt-1 hidden md:block">الوردية</span>
            </button>

            <button
              onClick={() => setActiveTab('invoices')}
              title="الفواتير"
              className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all ${
                activeTab === 'invoices' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <FileText size={22} />
              <span className="text-[10px] font-bold mt-1 hidden md:block">الفواتير</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              title="التقارير"
              className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all ${
                activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <BarChart3 size={22} />
              <span className="text-[10px] font-bold mt-1 hidden md:block">التقارير</span>
            </button>

            <button
              onClick={() => setActiveTab('crm')}
              title="العملاء والدليفري"
              className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all ${
                activeTab === 'crm' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Users size={22} />
              <span className="text-[10px] font-bold mt-1 hidden md:block">العملاء</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              title="الإعدادات"
              className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all ${
                activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Settings size={22} />
              <span className="text-[10px] font-bold mt-1 hidden md:block">الإعدادات</span>
            </button>
          </nav>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] text-slate-500 font-bold hidden md:block">نشط</span>
        </div>
      </aside>

      <main className="flex-1 h-full overflow-hidden flex flex-col">
        {activeTab === 'pos' && <POSView />}
        {activeTab === 'shift' && <ShiftView />}
        {activeTab === 'invoices' && <InvoicesView />}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'crm' && <CRMView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}
