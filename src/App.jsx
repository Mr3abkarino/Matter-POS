import React, { useState, useEffect } from "react";
import {
  Search, Plus, Minus, Trash2, Banknote, CreditCard, X, Check,
  Coffee, IceCream, Sandwich, UtensilsCrossed, GlassWater,
  Receipt, Sparkles, Bike, ShoppingBag, Utensils, Phone, User,
  PauseCircle, PlayCircle, Clock, Flame, CheckCircle2, ArrowRight,
  Lock, Unlock, FileText, Printer, LayoutDashboard, Users, Package,
  Wifi, WifiOff, RefreshCw, TrendingUp, DollarSign, Wallet, Award,
  ShieldCheck, UserCheck, Gift, History, TrendingDown, MapPin, LogOut, Key
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

/* ---------------- 1. USER ACCOUNTS & CREDENTIALS ---------------- */
const USERS_DB = [
  { id: 1, username: "admin", password: "admin123", name: "محمد مطر", role: "admin", roleLabel: "👑 Admin (مدير النظام)" },
  { id: 2, username: "manager", password: "mgr123", name: "أحمد علي", role: "manager", roleLabel: "👔 Manager (المدير)" },
  { id: 3, username: "cashier", password: "cash123", name: "محمود الكاشير", role: "cashier", roleLabel: "💳 Cashier (الكاشير)" },
  { id: 4, username: "waiter", password: "waiter123", name: "مصطفى الويتر", role: "waiter", roleLabel: "🍽️ Waiter (الويتر)" },
];

const ROLE_PERMISSIONS = {
  admin: { canViewDashboard: true, canCheckout: true, canKDS: true, canCRM: true, canInventory: true },
  manager: { canViewDashboard: true, canCheckout: true, canKDS: true, canCRM: true, canInventory: true },
  cashier: { canViewDashboard: false, canCheckout: true, canKDS: true, canCRM: true, canInventory: false },
  waiter: { canViewDashboard: false, canCheckout: false, canKDS: true, canCRM: false, canInventory: false },
};

const CATEGORIES = [
  { id: "hot", label: "ساخن", icon: Coffee },
  { id: "cold", label: "بارد", icon: GlassWater },
  { id: "sand", label: "ساندوتش", icon: Sandwich },
  { id: "meal", label: "وجبات", icon: UtensilsCrossed },
];

const PRODUCTS = [
  { id: 1, cat: "hot", name: "قهوة تركي", price: 25, cost: 10, emoji: "☕", stock: 50 },
  { id: 13, cat: "meal", name: "وجبة برجر", price: 90, cost: 45, emoji: "🍔", stock: 25 },
  { id: 14, cat: "meal", name: "بيتزا مارجريتا", price: 60, cost: 25, emoji: "🍕", stock: 15 },
  { id: 2, cat: "hot", name: "كابتشينو", price: 40, cost: 18, emoji: "☕", stock: 8 },
  { id: 6, cat: "cold", name: "عصير مانجو", price: 35, cost: 12, emoji: "🥭", stock: 3 },
  { id: 11, cat: "sand", name: "ساندوتش فراخ", price: 55, cost: 25, emoji: "🌯", stock: 0 },
];

const ORDER_TYPES = [
  { id: "takeaway", label: "تيك أواي", icon: ShoppingBag },
  { id: "delivery", label: "دليفري", icon: Bike },
  { id: "dinein", label: "صالة", icon: Utensils },
];

const SALES_TIMELINE_DATA = [
  { time: "10 ص", sales: 420 }, { time: "12 ظ", sales: 850 },
  { time: "02 م", sales: 1400 }, { time: "04 م", sales: 1100 },
  { time: "06 م", sales: 2300 }, { time: "08 م", sales: 3100 }, { time: "10 م", sales: 2800 },
];

const fmt = (n) => n.toLocaleString("ar-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function SmartPOSApp() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(null); // null = Auth Screen Active
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");

  const [currentView, setCurrentView] = useState("pos");
  const [isOnline] = useState(navigator.onLine);
  const [cart, setCart] = useState([]);
  const [activeCat, setActiveCat] = useState("hot");
  const [query, setQuery] = useState("");
  const [ticketNo, setTicketNo] = useState(1060);
  
  const [orderType, setOrderType] = useState("takeaway");
  const [customerNameInput, setCustomerNameInput] = useState("");
  const [customerPhoneInput, setCustomerPhoneInput] = useState("");
  const [customerAddressInput, setCustomerAddressInput] = useState("");
  const [deliveryFee] = useState(15);

  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  // Authentication Logic
  const handleLogin = (e) => {
    e.preventDefault();
    const user = USERS_DB.find(
      (u) => u.username.toLowerCase() === usernameInput.trim().toLowerCase() && u.password === passwordInput
    );

    if (user) {
      setCurrentUser(user);
      setLoginError("");
      const permissions = ROLE_PERMISSIONS[user.role];
      setCurrentView(permissions.canViewDashboard ? "dashboard" : "pos");
    } else {
      setLoginError("اسم المستخدم أو كلمة السر غير صحيحة!");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUsernameInput("");
    setPasswordInput("");
    setLoginError("");
    setCart([]);
  };

  const permissions = currentUser ? ROLE_PERMISSIONS[currentUser.role] : {};

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = subtotal * 0.14;
  const currentDeliveryFee = orderType === "delivery" ? Number(deliveryFee) || 0 : 0;
  const total = subtotal + tax + currentDeliveryFee;

  const addToCart = (product) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const checkout = () => {
    if (cart.length === 0) return;
    setCart([]);
    setCustomerNameInput("");
    setCustomerPhoneInput("");
    setCustomerAddressInput("");
    setTicketNo((t) => t + 1);
    setMobileCartOpen(false);
  };

  // 🔑 1. AUTHENTICATION LOGIN SCREEN (شاشة تسجيل الدخول)
  if (!currentUser) {
    return (
      <div dir="rtl" className="h-screen w-full bg-slate-900 flex items-center justify-center p-4 font-sans select-none">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl border border-slate-100">
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black mx-auto shadow-lg shadow-indigo-600/30 text-xl">
              POS
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">تسجيل الدخول للنظام</h2>
            <p className="text-xs text-slate-400 font-semibold">أدخل اسم المستخدم وكلمة السر المخصصة لدورك</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold text-center">
                {loginError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-600 block">اسم المستخدم (Username)</label>
              <div className="relative">
                <User size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="admin / manager / cashier / waiter"
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 text-xs font-bold outline-none focus:bg-white focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-600 block">كلمة السر (Password)</label>
              <div className="relative">
                <Key size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 text-xs font-bold outline-none focus:bg-white focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
            >
              دخول النظام
            </button>
          </form>

          {/* Quick Demo Credentials Guide */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5 text-[11px] font-semibold text-slate-500">
            <p className="font-bold text-slate-700 mb-1">💡 الحسابات الافتراضية للتجربة:</p>
            <div className="flex justify-between"><span>👑 Admin:</span><span className="font-mono font-bold text-slate-900">admin / admin123</span></div>
            <div className="flex justify-between"><span>👔 Manager:</span><span className="font-mono font-bold text-slate-900">manager / mgr123</span></div>
            <div className="flex justify-between"><span>💳 Cashier:</span><span className="font-mono font-bold text-slate-900">cashier / cash123</span></div>
            <div className="flex justify-between"><span>🍽️ Waiter:</span><span className="font-mono font-bold text-slate-900">waiter / waiter123</span></div>
          </div>

        </div>
      </div>
    );
  }

  // 🔐 2. MAIN POS & DASHBOARD SYSTEM APPLICATION
  return (
    <div dir="rtl" className="h-screen w-full bg-slate-50 flex flex-col font-sans select-none overflow-hidden text-slate-800">
      
      {/* Navigation Header */}
      <header className="min-h-16 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between px-4 sm:px-6 py-2 shrink-0 shadow-xs z-20 gap-2">
        <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-600/20 text-sm">
              POS
            </div>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">النظام المالي الذكي</h1>
              <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                ElHadary FIN • <span className="text-indigo-600 font-mono font-bold">v{typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.1'}</span>
              </p>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 text-xs font-bold overflow-x-auto">
            {permissions.canViewDashboard && (
              <button onClick={() => setCurrentView("dashboard")} className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${currentView === "dashboard" ? "bg-white text-indigo-600 shadow-sm font-extrabold" : "text-slate-500"}`}>
                <LayoutDashboard size={14} className="inline mr-1" /> لوحة التحكم
              </button>
            )}
            <button onClick={() => setCurrentView("pos")} className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${currentView === "pos" ? "bg-white text-indigo-600 shadow-sm font-extrabold" : "text-slate-500"}`}>
              <Receipt size={14} className="inline mr-1" /> نقطة البيع
            </button>
            {permissions.canKDS && (
              <button onClick={() => setCurrentView("kitchen")} className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${currentView === "kitchen" ? "bg-white text-indigo-600 shadow-sm font-extrabold" : "text-slate-500"}`}>
                <Flame size={14} className="inline mr-1 text-amber-500" /> المطبخ
              </button>
            )}
          </div>
        </div>

        {/* User Info & Logout Button */}
        <div className="flex items-center gap-2">
          <div className="bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl text-xs font-bold text-indigo-700 flex items-center gap-1.5">
            <User size={14} />
            <span>{currentUser.name}</span>
            <span className="text-[10px] opacity-75">({currentUser.roleLabel})</span>
          </div>

          <button
            onClick={handleLogout}
            title="تسجيل الخروج"
            className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* DASHBOARD VIEW */}
      {currentView === "dashboard" && permissions.canViewDashboard && (
        <div className="flex-1 bg-slate-50 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">لوحة التحكم والأداء</h2>
              <p className="text-xs text-slate-400 font-semibold">أهلاً بك، {currentUser.name}</p>
            </div>
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold shadow-xs">
              <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg shadow-sm">اليوم</button>
              <button className="px-3 py-1 text-slate-500">الأسبوع</button>
              <button className="px-3 py-1 text-slate-500">الشهر</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400">مبيعات اليوم</p>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">11,970.00 <span className="text-xs text-slate-400 font-normal">ج.م</span></h3>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg inline-block">↑ +14.5%</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <TrendingUp size={20} />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400">مصروفات الشهر</p>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">1,200.00 <span className="text-xs text-slate-400 font-normal">ج.م</span></h3>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg inline-block">↓ -4.2%</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <TrendingDown size={20} />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400">صافي الربح المتوقع</p>
                <h3 className="text-xl sm:text-2xl font-black text-emerald-600">8,420.00 <span className="text-xs text-slate-400 font-normal">ج.م</span></h3>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg inline-block">ممتاز ⚡</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <DollarSign size={20} />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400">عدد الفواتير</p>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">142 <span className="text-xs text-slate-400 font-normal">فاتورة</span></h3>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg inline-block">8 طلبات/ساعة</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Receipt size={20} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">المؤشرات المالية والساعية</h3>
                <span className="text-[11px] text-slate-400 font-semibold">تحديث مباشر</span>
              </div>
              <div className="h-60 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={SALES_TIMELINE_DATA}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(value) => [`${value} ج.م`, "المبيعات"]} />
                    <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">ملخص أداء المنتجات</h3>
              <div className="space-y-3 pt-1">
                {PRODUCTS.slice(0, 4).map((p) => (
                  <div key={p.id} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-none">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{p.emoji}</span>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-800">{p.name}</h4>
                        <span className="text-[10px] text-slate-400">المخزن: {p.stock}</span>
                      </div>
                    </div>
                    <span className="font-black text-xs sm:text-sm text-indigo-600">{fmt(p.price)} ج.م</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POS VIEW */}
      {currentView === "pos" && (
        <div className="flex-1 flex flex-col md:flex-row min-h-0 relative">
          <main className="flex-1 flex flex-col min-w-0 bg-slate-50 border-l border-slate-100">
            <div className="px-4 sm:px-6 py-3 flex flex-wrap gap-2 justify-between items-center bg-white border-b border-slate-100">
              <div className="flex gap-1.5 overflow-x-auto">
                {CATEGORIES.map((c) => (
                  <button key={c.id} onClick={() => setActiveCat(c.id)} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${activeCat === c.id ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-slate-50 text-slate-600 border-slate-200"}`}>
                    <c.icon size={14} /> {c.label}
                  </button>
                ))}
              </div>
              <div className="relative w-full sm:w-60 mt-2 sm:mt-0">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="بحث..." className="w-full h-9 bg-slate-100 rounded-xl pr-8 pl-3 text-xs outline-none focus:bg-white border focus:border-indigo-500" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="grid gap-3 sm:gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}>
                {PRODUCTS.filter(p=>p.cat===activeCat && p.name.includes(query)).map((p) => (
                  <button key={p.id} onClick={() => addToCart(p)}
                    className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-4 flex flex-col items-center text-center relative hover:shadow-md transition-all">
                    <span className="absolute top-2 left-2 text-[9px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {p.stock}
                    </span>
                    <div className="text-3xl sm:text-4xl mb-2 mt-1">{p.emoji}</div>
                    <div className="font-bold text-xs sm:text-sm text-slate-800 leading-snug">{p.name}</div>
                    <div className="text-indigo-600 font-black text-xs sm:text-sm mt-1">{fmt(p.price)} ج.م</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="md:hidden bg-white border-t border-slate-200 p-3 flex justify-between items-center shadow-lg">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">إجمالي السلة</span>
                <span className="font-black text-indigo-600 text-sm">{fmt(total)} ج.م</span>
              </div>
              <button onClick={() => setMobileCartOpen(true)} className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5">
                <Receipt size={15} /> عرض الفاتورة ({cart.length})
              </button>
            </div>
          </main>

          <aside className={`w-full md:w-[360px] shrink-0 bg-white flex flex-col shadow-xl border-r border-slate-100 fixed md:relative inset-y-0 right-0 z-30 transition-transform ${mobileCartOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}>
            <div className="p-3 border-b border-slate-100 bg-slate-50/70 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-slate-900">فاتورة جديد #{ticketNo}</span>
                <button onClick={() => setMobileCartOpen(false)} className="md:hidden text-slate-400"><X size={18} /></button>
              </div>

              <div className="grid grid-cols-3 gap-1 bg-slate-200/60 p-1 rounded-xl">
                {ORDER_TYPES.map((t) => (
                  <button key={t.id} onClick={() => setOrderType(t.id)}
                    className={`py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition-all ${orderType === t.id ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600"}`}>
                    <t.icon size={13} /> {t.label}
                  </button>
                ))}
              </div>

              {orderType === "delivery" && (
                <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1.5 text-xs">
                  <input value={customerPhoneInput} onChange={(e) => setCustomerPhoneInput(e.target.value)} placeholder="رقم الهاتف..." className="w-full h-7 rounded-lg border px-2 font-mono bg-white outline-none" />
                  <input value={customerNameInput} onChange={(e) => setCustomerNameInput(e.target.value)} placeholder="اسم العميل..." className="w-full h-7 rounded-lg border px-2 bg-white outline-none" />
                  <input value={customerAddressInput} onChange={(e) => setCustomerAddressInput(e.target.value)} placeholder="العنوان..." className="w-full h-7 rounded-lg border px-2 bg-white outline-none" />
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {cart.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-1.5 py-12">
                  <Receipt size={40} strokeWidth={1.5} />
                  <p className="text-xs font-bold text-slate-400">السلة فارغة حالياً</p>
                </div>
              )}
              {cart.map((item) => (
                <div key={item.id} className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">{item.name}</h4>
                    <span className="text-[11px] text-slate-400">{fmt(item.price)} ج.م × {item.qty}</span>
                  </div>
                  <span className="font-black text-xs text-slate-900">{fmt(item.price * item.qty)} ج.م</span>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
              <div className="space-y-1 text-xs font-semibold text-slate-500">
                <div className="flex justify-between"><span>الفرعي:</span><span>{fmt(subtotal)} ج.م</span></div>
                <div className="flex justify-between"><span>الضريبة (14%):</span><span>{fmt(tax)} ج.م</span></div>
                {orderType === "delivery" && <div className="flex justify-between text-indigo-700 font-bold"><span>التوصيل:</span><span>{fmt(currentDeliveryFee)} ج.م</span></div>}
                <div className="flex justify-between text-slate-900 font-black text-sm pt-1 border-t">
                  <span>الإجمالي:</span><span className="text-indigo-600">{fmt(total)} ج.م</span>
                </div>
              </div>

              {permissions.canCheckout ? (
                <button onClick={checkout} disabled={cart.length === 0} className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-black text-xs rounded-xl shadow-md shadow-indigo-600/20">
                  إتمام البيع والطباعة
                </button>
              ) : (
                <button onClick={checkout} disabled={cart.length === 0} className="w-full h-10 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-200 text-white font-black text-xs rounded-xl shadow-md shadow-amber-600/20">
                  إرسال الطلب للمطبخ فقط (Waiter Mode)
                </button>
              )}
            </div>
          </aside>
        </div>
      )}

    </div>
  );
}
