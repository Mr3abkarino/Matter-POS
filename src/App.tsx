import React, { useState, useEffect } from 'react';
import { useShiftStore } from './store/useShiftStore';
import { POSView } from './features/pos/POSView';
import { InventoryView } from './features/inventory/InventoryView';
import { InvoicesView } from './features/invoices/InvoicesView';
import { ReportsView } from './features/reports/ReportsView';
import { CRMView } from './features/crm/CRMView';
import { SettingsView } from './features/settings/SettingsView';
import { LayoutDashboard, Package, FileText, BarChart3, Users, Settings, Lock } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState('pos');
  const { currentShift, openShift } = useShiftStore();

  useEffect(() => {
    if (!currentShift) {
      openShift('الوردية الأساسية', 'كاشير');
    }
  }, [currentShift, openShift]);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden dir-rtl font-sans">
      {/* القائمة الجانبية */}
      <aside className="w-20 bg-slate-950 flex flex-col items-center py-6 justify-between border-l border-slate-800 text-white">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
            DC
          </div>
          
          <nav className="flex flex-col gap-3">
            <button
              onClick={() => setActiveTab('pos')}
              className={`p-3 rounded-2xl transition-all ${activeTab === 'pos' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-900'}`}
              title="الكاشير والبيع"
            >
              <LayoutDashboard size={22} />
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`p-3 rounded-2xl transition-all ${activeTab === 'inventory' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-900'}`}
              title="المخزون والأصناف"
            >
              <Package size={22} />
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`p-3 rounded-2xl transition-all ${activeTab === 'invoices' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-900'}`}
              title="سجل الفواتير"
            >
              <FileText size={22} />
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`p-3 rounded-2xl transition-all ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-900'}`}
              title="التقارير والأرباح"
            >
              <BarChart3 size={22} />
            </button>
            <button
              onClick={() => setActiveTab('crm')}
              className={`p-3 rounded-2xl transition-all ${activeTab === 'crm' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-900'}`}
              title="العملاء"
            >
              <Users size={22} />
            </button>
          </nav>
        </div>

        <button
          onClick={() => setActiveTab('settings')}
          className={`p-3 rounded-2xl transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-900'}`}
          title="الإعدادات"
        >
          <Settings size={22} />
        </button>
      </aside>

      {/* محتوى الشاشة النشطة */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {activeTab === 'pos' && <POSView />}
        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'invoices' && <InvoicesView />}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'crm' && <CRMView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}

export default App;
