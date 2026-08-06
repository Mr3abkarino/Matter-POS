import React, { useState, useEffect } from 'react';
import { db } from '../../db/dexie';
import { Lock, User, ShieldCheck } from 'lucide-react';

export function LoginView({ onLogin }: { onLogin: (user: any) => void }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // التأكد التلقائي من وجود حسابات وتجهيزها إذا كانت الداتابيز فارغة
  useEffect(() => {
    const initUsers = async () => {
      try {
        const count = await db.users.count();
        if (count === 0) {
          await db.users.bulkPut([
            { id: 1, username: 'admin', password: '123', name: 'المدير المسؤول', role: 'admin' },
            { id: 2, username: 'casher', password: '123', name: 'كاشير الورديات', role: 'casher' }
          ]);
        }
      } catch (err) {
        console.error('Error initializing users:', err);
      }
    };
    initUsers();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // البحث عن المستخدم في قاعدة البيانات المحلية
      let user = await db.users.where('username').equals(username.trim()).first();

      // تجنيب العطل: إذا لم يجد المستخدم وكان المدخل admin / 123
      if (!user && username.trim() === 'admin' && password === '123') {
        const id = await db.users.put({
          username: 'admin',
          password: '123',
          name: 'المدير المسؤول',
          role: 'admin'
        });
        user = await db.users.get(id);
      }

      if (user && user.password === password) {
        onLogin(user);
      } else {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    } catch (err) {
      // دخول طوارئ مباشر في حالة وجود خطأ في الداتابيز
      if (username === 'admin' && password === '123') {
        onLogin({ username: 'admin', name: 'المدير المسؤول', role: 'admin' });
      } else {
        setError('حدث خطأ في الاتصال بقاعدة البيانات المحلية');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center p-4 dir-rtl font-sans z-50">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-center border border-slate-800">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-white text-2xl mx-auto shadow-lg shadow-indigo-500/30">
          DC
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">دريم كورنر POS</h2>
          <p className="text-xs text-slate-500 mt-1">تسجيل الدخول للنظام</p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 text-xs p-2.5 rounded-xl font-bold border border-rose-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-3 text-right">
          <div>
            <label className="text-xs font-bold text-slate-700">اسم المستخدم:</label>
            <div className="relative mt-1">
              <User size={16} className="absolute right-3 top-3 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-slate-50 pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">كلمة المرور:</label>
            <div className="relative mt-1">
              <Lock size={16} className="absolute right-3 top-3 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="123"
                className="w-full bg-slate-50 pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white py-3 rounded-xl font-bold text-xs shadow-md shadow-indigo-200 transition-all mt-2 flex items-center justify-center gap-2"
          >
            <ShieldCheck size={16} />
            <span>{loading ? 'جاري التحقق...' : 'تسجيل الدخول'}</span>
          </button>
        </form>

        <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-400 font-semibold">
          بيانات الدخول الافتراضية: <br/>
          <span className="text-indigo-600">admin / 123</span>
        </div>
      </div>
    </div>
  );
}
