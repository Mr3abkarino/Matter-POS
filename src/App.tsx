import React, { useState, useEffect } from 'react';
import { POSView } from './features/pos/POSView';
import { MenuManagementView } from './features/menu/MenuManagementView';
import { ReportsView } from './features/reports/ReportsView';
import { SettingsView } from './features/settings/SettingsView';
import { KitchenView } from './features/kitchen/KitchenView';
import { DriverSettlementView } from './features/delivery/DriverSettlementView'; 
import { RecentInvoicesView } from './features/invoices/RecentInvoicesView'; // 📜 شاشة سجل الفواتير
import { 
  ShoppingCart, 
  LogOut, 
  ShieldAlert, 
  UserCheck, 
  TrendingUp, 
  Settings,
  ChefHat,
  Bike,
  History
} from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<'admin' | 'cashier'>('cashier');
  const [currentTab, setCurrentTab] = useState<'pos' | 'kitchen' | 'delivery' | 'invoices' | 'reports' | 'menu' | 'settings'>('pos');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  // 💾 الاستعادة التلقائية للجلسة عند الـ Refresh لمنع الخروج
  useEffect(() => {
    const savedLogin = localStorage.getItem('dc_is_logged_in');
    const savedRole = localStorage.getItem('dc_user_role') as 'admin' | 'cashier';
    if (savedLogin === 'true' && savedRole) {
      setIsLoggedIn(true);
      setRole(savedRole);
    }
  }, []);

  // ⚡ استماع اختصارات الكيبورد السريعة للتنقل بين الشاشات (F1 - F2 - F3 - F4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'F1') {
        e.preventDefault();
        setCurrentTab('pos');
      } else if (e.key === 'F2') {
        e.preventDefault();
        setCurrentTab('kitchen');
      } else if (e.key === 'F3') {
        e.preventDefault();
        setCurrentTab('delivery');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setCurrentTab('invoices');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 🔐 تسجيل الدخول برمز PIN
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '0000') {
      loginUser('cashier');
    } else if (pin === '8888') {
      loginUser('admin');
    } else {
      setError('رمز PIN غير صحيح!');
    }
  };

  const loginUser = (userRole: 'admin' | 'cashier') => {
    setIsLoggedIn(true);
    setRole(userRole);
    setError('');
    setPin('');
    localStorage.setItem('dc_is_logged_in', 'true');
    localStorage.setItem('dc_user_role', userRole);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('dc_is_logged_in');
    localStorage.removeItem('dc_user_role');
  };

  // 🔒 شاشة تسجيل الدخول باللوجو الرسمي
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 dir-rtl font-sans">
        <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl text-center">
          {/* 🍔 اللوجو الأساسي */}
          <div className="bg-black w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl p-2 border-2 border-indigo-500 overflow-hidden">
            <img src="/logo.png" alt="Dream Corner Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-1">دريم كورنر POS</h1>
          <p className="text-slate-500 text-xs font-bold mb-6">نظام إدارة المبيعات ونقاط البيع</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <input
                type="password"
                maxLength={4}
                placeholder="أدخل رمز PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full text-center text-2xl font-black tracking-widest p-3.5 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
              />
              {error && <p className="text-rose-600 text-xs font-bold mt-2">{error}</p>}
            </div>

            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-3.5 rounded-2xl font-black text-sm shadow-lg transition-all active:scale-95"
            >
              دخول النظام
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden dir-rtl font-sans">
      {/* 📌 الشريط الجانبي */}
      <aside className="w-20 lg:w-64 bg-slate-900 text-white flex flex-col justify-between p-4 shadow-xl shrink-0">
        <div>
          {/* 🍔 اللوجو في أعلى القائمة الجانبية */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="bg-black p-1 rounded-2xl border border-slate-700 w-11 h-11 flex items-center justify-center overflow-hidden shrink-0">
              <img src="/logo.png" alt="DC Logo" className="w-full h-full object-contain" />
            </div>
            <div className="hidden lg:block">
              <h2 className="font-black text-sm text-white">DREAM CORNER</h2>
              <span className="text-[10px] text-indigo-400 font-bold flex items-center gap-1">
                {role === 'admin' ? <ShieldAlert size={12}/> : <UserCheck size={12}/>}
                {role === 'admin' ? 'مدير النظام' : 'حساب كاشير'}
              </span>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {/* 🛒 زر الكاشير */}
            <button
              onClick={() => setCurrentTab('pos')}
              className={`flex items-center gap-3 p-3 rounded-2xl font-bold text-xs transition-all ${
                currentTab === 'pos' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <ShoppingCart size={20} />
              <span className="hidden lg:block">الكاشير (F1)</span>
            </button>

            {/* 👨‍🍳 زر شاشة المطبخ */}
            <button
              onClick={() => setCurrentTab('kitchen')}
              className={`flex items-center gap-3 p-3 rounded-2xl font-bold text-xs transition-all ${
                currentTab === 'kitchen' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <ChefHat size={20} />
              <span className="hidden lg:block">شاشة المطبخ (F2)</span>
            </button>

            {/* 🛵 زر تقفيل الطيارين */}
            <button
              onClick={() => setCurrentTab('delivery')}
              className={`flex items-center gap-3 p-3 rounded-2xl font-bold text-xs transition-all ${
                currentTab === 'delivery' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Bike size={20} />
              <span className="hidden lg:block">تقفيل الطيارين (F3)</span>
            </button>

            {/* 📜 زر سجل الفواتير الجديد */}
            <button
              onClick={() => setCurrentTab('invoices')}
              className={`flex items-center gap-3 p-3 rounded-2xl font-bold text-xs transition-all ${
                currentTab === 'invoices' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <History size={20} />
              <span className="hidden lg:block">سجل الفواتير (F4)</span>
            </button>

            {/* 🔒 أزرار الأدمن فقط */}
            {role === 'admin' && (
              <>
                <button
                  onClick={() => setCurrentTab('reports')}
                  className={`flex items-center gap-3 p-3 rounded-2xl font-bold text-xs transition-all ${
                    currentTab === 'reports' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <TrendingUp size={20} />
                  <span className="hidden lg:block">التقارير الشاملة</span>
                </button>

                <button
                  onClick={() => setCurrentTab('menu')}
                  className={`flex items-center gap-3 p-3 rounded-2xl font-bold text-xs transition-all ${
                    currentTab === 'menu' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-base">🍔</span>
                  <span className="hidden lg:block">إدارة المنيو</span>
                </button>

                <button
                  onClick={() => setCurrentTab('settings')}
                  className={`flex items-center gap-3 p-3 rounded-2xl font-bold text-xs transition-all ${
                    currentTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Settings size={20} />
                  <span className="hidden lg:block">الإعدادات والطابعة</span>
                </button>
              </>
            )}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 text-rose-400 hover:bg-rose-500/10 rounded-2xl font-bold text-xs transition-all"
        >
          <LogOut size={20} />
          <span className="hidden lg:block">تسجيل الخروج</span>
        </button>
      </aside>

      {/* 🖥️ العرض الرئيسي حسب التبويب */}
      <main className="flex-1 flex overflow-hidden">
        {currentTab === 'pos' ? (
          <POSView />
        ) : currentTab === 'kitchen' ? (
          <KitchenView />
        ) : currentTab === 'delivery' ? (
          <DriverSettlementView />
        ) : currentTab === 'invoices' ? (
          <RecentInvoicesView />
        ) : currentTab === 'reports' ? (
          <ReportsView />
        ) : currentTab === 'menu' ? (
          <MenuManagementView />
        ) : (
          <SettingsView />
        )}
      </main>
    </div>
  );
}
