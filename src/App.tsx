import React, { useState, useEffect } from 'react';
import { POSView } from './features/pos/POSView';
import { MenuManagementView } from './features/menu/MenuManagementView';
import { Utensils, ShoppingCart, LogOut, ShieldAlert, UserCheck } from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<'admin' | 'cashier'>('cashier');
  const [currentTab, setCurrentTab] = useState<'pos' | 'menu'>('pos');
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

  // 🔐 تسجيل الدخول برمز PIN
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '0000') {
      // رمز الكاشير
      loginUser('cashier');
    } else if (pin === '8888') {
      // رمز الأدمن
      loginUser('admin');
    } else {
      setError('رمز PIN غير صحيح! (الكاشير: 0000 | الأدمن: 8888)');
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

  // 🔒 شاشة تسجيل الدخول
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 dir-rtl font-sans">
        <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl text-center">
          <div className="bg-indigo-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Utensils size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-1">دريم كورنر POS</h1>
          <p className="text-slate-500 text-xs font-bold mb-6">نظام إدارة المبيعات ونقاط البيع</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <input
                type="password"
                maxLength={4}
                placeholder="أدخل رمز PIN (مثال: 0000)"
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

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-bold flex justify-around">
            <span>رمز الكاشير: <b>0000</b></span>
            <span>رمز الأدمن: <b>8888</b></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden dir-rtl font-sans">
      {/* الشريط الجانبي */}
      <aside className="w-20 lg:w-64 bg-slate-900 text-white flex flex-col justify-between p-4 shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="bg-indigo-600 p-2.5 rounded-2xl">
              <Utensils size={24} />
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
            <button
              onClick={() => setCurrentTab('pos')}
              className={`flex items-center gap-3 p-3 rounded-2xl font-bold text-xs transition-all ${
                currentTab === 'pos' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <ShoppingCart size={20} />
              <span className="hidden lg:block">الكاشير (POS)</span>
            </button>

            {/* زر إدارة المنيو متاح فقط للأدمن */}
            {role === 'admin' && (
              <button
                onClick={() => setCurrentTab('menu')}
                className={`flex items-center gap-3 p-3 rounded-2xl font-bold text-xs transition-all ${
                  currentTab === 'menu' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Utensils size={20} />
                <span className="hidden lg:block">إدارة المنيو</span>
              </button>
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

      {/* عرض الشاشة المختارة */}
      <main className="flex-1 flex overflow-hidden">
        {currentTab === 'pos' ? <POSView /> : <MenuManagementView />}
      </main>
    </div>
  );
}
