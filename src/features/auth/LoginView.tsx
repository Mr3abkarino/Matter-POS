import React, { useState } from 'react';
import { db } from '../../db/dexie';
import { Lock, User } from 'lucide-react';

export function LoginView({ onLogin }: { onLogin: (user: any) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = await db.users.where('username').equals(username).first();
    if (user && user.password === password) {
      onLogin(user);
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center p-4 dir-rtl font-sans">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-center">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-white text-2xl mx-auto shadow-lg shadow-indigo-500/30">
          DC
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">دريم كورنر POS</h2>
          <p className="text-xs text-slate-500 mt-1">تسجيل الدخول للنظام</p>
        </div>

        {error && <div className="bg-rose-50 text-rose-600 text-xs p-2.5 rounded-xl font-bold">{error}</div>}

        <form onSubmit={handleLogin} className="flex flex-col gap-3 text-right">
          <div>
            <label className="text-xs font-bold text-slate-700">اسم المستخدم:</label>
            <div className="relative mt-1">
              <User size={16} className="absolute right-3 top-3 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin أو casher"
                className="w-full bg-slate-50 pr-9 pl-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="w-full bg-slate-50 pr-9 pl-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-xs shadow-md shadow-indigo-200 transition-all mt-2"
          >
            تسجيل الدخول
          </button>
        </form>
      </div>
    </div>
  );
}
