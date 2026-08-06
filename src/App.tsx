import React, { useState, useEffect } from 'react';
import { seedInitialData } from './db/dexie';
import { useShiftStore } from './store/useShiftStore';
import { POSView } from './features/pos/POSView';
import { InvoicesView } from './features/invoices/InvoicesView';
import { InventoryView } from './features/inventory/InventoryView';
import { CRMView } from './features/crm/CRMView';
import { ReportsView } from './features/reports/ReportsView';
import { SettingsView } from './features/settings/SettingsView';
import { Receipt, FileText, Package, Users, TrendingUp, Settings, Menu, X, LogOut, Lock } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'pos' | 'invoices' | 'inventory' | 'crm' | 'reports' | 'settings'>('pos');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { activeShift, loadActiveShift } = useShiftStore();

  useEffect(() => {
    // تهيئة قاعدة البيانات المحلية وإدراج الأصناف الافتراضية إذا كانت فارغة
    seedInitialData().then(() => {
      loadActiveShift();
    });
  }, [loadActiveShift]);

  const navItems = [
    { id: 'pos', label: 'نقطة البيع (POS)', icon: Receipt },
    { id: 'invoices', label: 'سجل الفواتير والمرتجعات', icon: FileText },
    { id: 'inventory', label: 'المخزون والمنتجات', icon: Package },
    { id: 'crm', label: 'العملاء والديون (CRM)', icon: Users },
    { id: 'reports', label: 'التقارير والورديات', icon: TrendingUp },
    { id: 'settings', label: 'إعدادات النظام', icon: Settings },
  ];

  return (
    <div dir="rtl" className="h-screen w-full bg-slate-100 flex font-sans select-none overflow-hidden text-slate-800 relative">
      
      {/* رأس الشاشة للموبايل */}
      <header className="lg:hidden h-14 bg-slate-900 text-white px-4 flex items-center justify-between z-20 shrink-0 w-full fixed top-0 inset-x-0">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 text-slate-300 hover:text-white">
          <Menu size={22} />
        </button>
        <span className="font-extrabold text-xs">دريم كورنر - POS Pro</span>
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs">م</div>
      </header>

      {/* القائمة الجانبية (Sidebar) */}
      <aside className={`
        fixed lg:static inset-y-0 right-0 bg-slate-900 text-slate-300 min-h-screen flex flex-col justify-between transition-transform duration-300 z-40 shrink-0
        ${sidebarOpen ? 'translate-x-0 w-64 shadow-2xl' : 'translate-x-full lg:translate-x-0 lg:w-64'}
      `}>
        <div className="p-4 space-y-6 pt-16 lg:pt-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h1 className="font-extrabold text-white text-sm">دريم كورنر</h1>
              <p className="text-[10px] text-emerald-400 font-bold">TypeScript + Dexie Engine</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 p-1">
              <X size={18} />
            </button>
          </div>

          <nav className="space-y-1.5 font-bold text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { setCurrentView(item.id as any); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
                    currentView === item.id ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-white">محمد مطر</p>
            <p className="text-[10px] text-indigo-400 font-bold">👑 Admin</p>
          </div>
          <span className={`w-3 h-3 rounded-full ${activeShift ? 'bg-emerald-500' : 'bg-rose-500'}`} title={activeShift ? 'وردية مفتوحة' : 'وردية مغلقة'} />
        </div>
      </aside>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs lg:hidden z-30"></div>}

      {/* منطقة عرض الشاشات */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pt-14 lg:pt-0 relative">
        {currentView === 'pos' && <POSView />}
        {currentView === 'invoices' && <InvoicesView />}
        {currentView === 'inventory' && <InventoryView />}
        {currentView === 'crm' && <CRMView />}
        {currentView === 'reports' && <ReportsView />}
        {currentView === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}
