import React, { useState } from 'react';
import { POSView } from './features/pos/POSView';
import { InvoicesView } from './features/invoices/InvoicesView';
import { ReportsView } from './features/reports/ReportsView';
import { CRMView } from './features/crm/CRMView';
import { SettingsView } from './features/settings/SettingsView';
import { ShiftView } from './features/shift/ShiftView';
import { MenuManagementView } from './features/menu/MenuManagementView';
import { LoginView } from './features/auth/LoginView';
import { Store, FileText, BarChart3, Users, Settings, Clock, Utensils, LogOut } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'pos' | 'invoices' | 'reports' | 'crm' | 'settings' | 'shift' | 'menu'>('pos');

  if (!currentUser) {
    return <LoginView onLogin={(user) => setCurrentUser(user)} />;
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans dir-rtl dir-rtl-force">
      <aside className="w-16 md:w-20 bg-slate-900 text-white flex flex-col items-center py-4 justify-between z-20 shadow-2xl shrink-0">
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-500/30">
            DC
          </div>

          <nav className="flex flex-col gap-2 w-full px-2">
            <button
              onClick={() => setActiveTab('pos')}
              className={`p-2.5 rounded-2xl flex flex-col items-center justify-center ${activeTab === 'pos' ? 'bg-indigo-600' : 'text-slate-400'}`}
            >
              <Store size={20} />
              <span className="text-[9px] font-bold mt-1 hidden md:block">الكاشير</span>
            </button>

            <button
              onClick={() => setActiveTab('shift')}
              className={`p-2.5 rounded-2xl flex flex-col items-center justify-center ${activeTab === 'shift' ? 'bg-indigo-600' : 'text-slate-400'}`}
            >
              <Clock size={20} />
              <span className="text-[9px] font-bold mt-1 hidden md:block">الوردية</span>
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('menu')}
                  className={`p-2.5 rounded-2xl flex flex-col items-center justify-center ${activeTab === 'menu' ? 'bg-indigo-600' : 'text-slate-400'}`}
                >
                  <Utensils size={20} />
                  <span className="text-[9px] font-bold mt-1 hidden md:block">المنيو</span>
                </button>

                <button
                  onClick={() => setActiveTab('reports')}
                  className={`p-2.5 rounded-2xl flex flex-col items-center justify-center ${activeTab === 'reports' ? 'bg-indigo-600' : 'text-slate-400'}`}
                >
                  <BarChart3 size={20} />
                  <span className="text-[9px] font-bold mt-1 hidden md:block">التقارير</span>
                </button>
              </>
            )}

            <button
              onClick={() => setActiveTab('invoices')}
              className={`p-2.5 rounded-2xl flex flex-col items-center justify-center ${activeTab === 'invoices' ? 'bg-indigo-600' : 'text-slate-400'}`}
            >
              <FileText size={20} />
              <span className="text-[9px] font-bold mt-1 hidden md:block">الفواتير</span>
            </button>

            <button
              onClick={() => setActiveTab('crm')}
              className={`p-2.5 rounded-2xl flex flex-col items-center justify-center ${activeTab === 'crm' ? 'bg-indigo-600' : 'text-slate-400'}`}
            >
              <Users size={20} />
              <span className="text-[9px] font-bold mt-1 hidden md:block">العملاء</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`p-2.5 rounded-2xl flex flex-col items-center justify-center ${activeTab === 'settings' ? 'bg-indigo-600' : 'text-slate-400'}`}
              >
                <Settings size={20} />
                <span className="text-[9px] font-bold mt-1 hidden md:block">الإعدادات</span>
              </button>
            )}
          </nav>
        </div>

        <button
          onClick={() => setCurrentUser(null)}
          className="text-slate-400 hover:text-rose-400 p-2"
          title="خروج"
        >
          <LogOut size={20} />
        </button>
      </aside>

      <main className="flex-1 h-full overflow-hidden flex flex-col">
        {activeTab === 'pos' && <POSView />}
        {activeTab === 'shift' && <ShiftView />}
        {activeTab === 'invoices' && <InvoicesView />}
        {activeTab === 'reports' && isAdmin && <ReportsView />}
        {activeTab === 'crm' && <CRMView />}
        {activeTab === 'settings' && isAdmin && <SettingsView />}
        {activeTab === 'menu' && isAdmin && <MenuManagementView />}
      </main>
    </div>
  );
}
