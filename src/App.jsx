import React, { useState, useMemo, useEffect } from "react";
import {
  Search, Plus, Minus, Trash2, Banknote, CreditCard, X, Check,
  Coffee, IceCream, Sandwich, UtensilsCrossed, GlassWater,
  Receipt, Sparkles, Bike, ShoppingBag, Utensils, MapPin, Phone, User,
  PauseCircle, PlayCircle, Clock, Flame, CheckCircle2, ArrowRight,
  Lock, Unlock, FileText, Printer, LayoutDashboard, Users, Package,
  Wifi, WifiOff, RefreshCw, TrendingUp, DollarSign, Wallet, Award,
  ShieldCheck, UserCheck, Gift, History, CreditCard as DebtIcon, TrendingDown
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

/* ---------------- Master Data ---------------- */
const ROLES = [
  { id: "admin", label: "👑 Admin (مدير النظام)", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { id: "manager", label: "👔 Manager (مدير الصالة)", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { id: "cashier", label: "💳 Cashier (الكاشير)", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { id: "waiter", label: "🍽️ Waiter (الويتر)", color: "bg-amber-100 text-amber-700 border-amber-200" },
];

const CATEGORIES = [
  { id: "hot", label: "مشروبات ساخنة", icon: Coffee },
  { id: "cold", label: "مشروبات باردة", icon: GlassWater },
  { id: "sand", label: "ساندويتشات", icon: Sandwich },
  { id: "meal", label: "وجبات وبدائل", icon: UtensilsCrossed },
];

const PRODUCTS = [
  {
    id: 1, cat: "hot", name: "قهوة تركي", price: 25, cost: 10, emoji: "☕", stock: 50,
    sizes: [{ id: "s", name: "سينجل", extra: 0 }, { id: "d", name: "دبل", extra: 10 }],
    modifiers: [{ id: "m1", name: "سكر زيادة", price: 0 }, { id: "m2", name: "على الريحة", price: 0 }]
  },
  {
    id: 13, cat: "meal", name: "وجبة برجر", price: 90, cost: 45, emoji: "🍔", stock: 25,
    sizes: [{ id: "single", name: "سينجل", extra: 0 }, { id: "double", name: "دبل باتي", extra: 35 }],
    modifiers: [{ id: "mod_cheese", name: "جبنة شيدر إضافية", price: 15 }, { id: "mod_spicy", name: "صوص سبايسي 🌶️", price: 5 }]
  },
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
  const [currentView, setCurrentView] = useState("dashboard");
  const [currentRole, setCurrentRole] = useState("admin");
  const [showRoleModal, setShowRoleModal] = useState(false);

  const [isOnline] = useState(navigator.onLine);
  const [shiftActive, setShiftActive] = useState(true);
  const [cart, setCart] = useState([]);
  const [activeCat, setActiveCat] = useState("hot");
  const [query, setQuery] = useState("");
  const [payMethod, setPayMethod] = useState("cash");
  const [ticketNo, setTicketNo] = useState(1060);
  const [orderType, setOrderType] = useState("takeaway");
  const [kitchenOrders, setKitchenOrders] = useState([]);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = subtotal * 0.14;
  const total = subtotal + tax;

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
    setTicketNo((t) => t + 1);
  };

  return (
    <div dir="rtl" className="h-screen w-full bg-slate-50 flex flex-col font-sans select-none overflow-hidden text-slate-800">
      
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 shadow-xs z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-600/20">
              POS
            </div>
            <div>
              <h1 className="font-extrabold text-base text-slate-900 leading-tight">النظام المالي الذكي</h1>
              <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                ElHadary FIN • 
                <span className="text-indigo-600 font-mono">
                  v{typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.1'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/60 text-xs font-bold">
            <button onClick={() => setCurrentView("dashboard")} className={`px-4 py-2 rounded-xl transition-all ${currentView === "dashboard" ? "bg-white text-indigo-600 shadow-sm font-extrabold" : "text-slate-500 hover:text-slate-800"}`}>
              <LayoutDashboard size={15} className="inline mr-1.5" /> لوحة التحكم
            </button>
            <button onClick={() => setCurrentView("pos")} className={`px-4 py-2 rounded-xl transition-all ${currentView === "pos" ? "bg-white text-indigo-600 shadow-sm font-extrabold" : "text-slate-500 hover:text-slate-800"}`}>
              <Receipt size={15} className="inline mr-1.5" /> نقطة البيع
            </button>
            <button onClick={() => setCurrentView("kitchen")} className={`px-4 py-2 rounded-xl transition-all ${currentView === "kitchen" ? "bg-white text-indigo-600 shadow-sm font-extrabold" : "text-slate-500 hover:text-slate-800"}`}>
              <Flame size={15} className="inline mr-1.5 text-amber-500" /> المطبخ (KDS)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setShowRoleModal(true)} className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${ROLES.find(r=>r.id===currentRole)?.color}`}>
            <UserCheck size={15} />
            <span>{ROLES.find(r=>r.id===currentRole)?.label}</span>
          </button>

          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${isOnline ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span>{isOnline ? "متصل" : "أوفلاين"}</span>
          </div>
        </div>
      </header>

      {/* DASHBOARD VIEW */}
      {currentView === "dashboard" && (
        <div className="flex-1 bg-slate-50 p-8 overflow-y-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">لوحة التحكم والأداء</h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">نظرة عامة على الإيرادات والأداء المالي لليوم</p>
            </div>
            <div className="flex bg-white p-1 rounded-2xl border border-slate-200 text-xs font-bold shadow-xs">
              <button className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl shadow-sm">اليوم</button>
              <button className="px-4 py-1.5 text-slate-500 hover:text-slate-800">الأسبوع</button>
              <button className="px-4 py-1.5 text-slate-500 hover:text-slate-800">الشهر</button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400">مبيعات اليوم</p>
                <h3 className="text-2xl font-black text-slate-900">11,970.00 <span className="text-xs text-slate-400 font-normal">ج.م</span></h3>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg inline-block">↑ +14.5%</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
                <TrendingUp size={22} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400">مصروفات الشهر</p>
                <h3 className="text-2xl font-black text-slate-900">1,200.00 <span className="text-xs text-slate-400 font-normal">ج.م</span></h3>
                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg inline-block">↓ -4.2%</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl font-bold">
                <TrendingDown size={22} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400">صافي الربح المتوقع</p>
                <h3 className="text-2xl font-black text-emerald-600">8,420.00 <span className="text-xs text-slate-400 font-normal">ج.م</span></h3>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg inline-block">ممتاز ⚡</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
                <DollarSign size={22} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400">عدد الفواتير</p>
                <h3 className="text-2xl font-black text-slate-900">142 <span className="text-xs text-slate-400 font-normal">فاتورة</span></h3>
                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg inline-block">8 طلبات/ساعة</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
                <Receipt size={22} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-slate-900 text-base">المؤشرات المالية والساعية</h3>
                <span className="text-xs text-slate-400 font-semibold">تحديث مباشر</span>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={SALES_TIMELINE_DATA}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(value) => [`${value} ج.م`, "المبيعات"]} />
                    <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base">ملخص أداء المنتجات</h3>
              <div className="space-y-4 pt-2">
                {PRODUCTS.slice(0, 4).map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{p.emoji}</span>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">{p.name}</h4>
                        <span className="text-xs text-slate-400">المخزن: {p.stock}</span>
                      </div>
                    </div>
                    <span className="font-black text-sm text-indigo-600">{fmt(p.price)} ج.م</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POS VIEW */}
      {currentView === "pos" && (
        <div className="flex-1 flex min-h-0">
          <main className="flex-1 flex flex-col min-w-0 bg-slate-50 border-l border-slate-100">
            <div className="px-6 py-3.5 flex justify-between bg-white border-b border-slate-100">
              <div className="flex gap-2">
                {CATEGORIES.map((c) => (
                  <button key={c.id} onClick={() => setActiveCat(c.id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold border transition-all ${activeCat === c.id ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20" : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-white"}`}>
                    <c.icon size={15} /> {c.label}
                  </button>
                ))}
              </div>
              <div className="relative w-72">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="بحث سريـع... (F2)" className="w-full h-10 bg-slate-100/80 rounded-2xl pr-10 pl-4 text-xs outline-none focus:bg-white border focus:border-indigo-500 font-semibold" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
                {PRODUCTS.filter(p=>p.cat===activeCat && p.name.includes(query)).map((p) => (
                  <button key={p.id} onClick={() => addToCart(p)}
                    className="bg-white rounded-3xl border border-slate-100 p-5 flex flex-col items-center text-center relative transition-all duration-200 hover:shadow-lg hover:border-indigo-300 group">
                    <span className="absolute top-3 left-3 text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
                      {p.stock} متبقي
                    </span>
                    <div className="text-4xl mb-3 mt-1 group-hover:scale-110 transition-transform">{p.emoji}</div>
                    <div className="font-extrabold text-sm text-slate-800 leading-snug">{p.name}</div>
                    <div className="text-indigo-600 font-black text-sm mt-2">{fmt(p.price)} ج.م</div>
                  </button>
                ))}
              </div>
            </div>
          </main>

          <aside className="w-[380px] shrink-0 bg-white flex flex-col shadow-xl border-r border-slate-100">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="font-black text-slate-900 text-sm">فاتورة جديد #{ticketNo}</span>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl">
                {ORDER_TYPES.find(t=>t.id===orderType)?.label}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2 py-20">
                  <Receipt size={48} strokeWidth={1.5} />
                  <p className="text-xs font-bold text-slate-400">السلة فارغة حالياً</p>
                </div>
              )}
              {cart.map((item) => (
                <div key={item.id} className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">{item.name}</h4>
                    <span className="text-xs text-slate-400">{fmt(item.price)} ج.م × {item.qty}</span>
                  </div>
                  <span className="font-black text-sm text-slate-900">{fmt(item.price * item.qty)} ج.م</span>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4">
              <div className="space-y-1.5 text-xs font-semibold text-slate-500">
                <div className="flex justify-between"><span>الفرعي:</span><span>{fmt(subtotal)} ج.م</span></div>
                <div className="flex justify-between"><span>الضريبة (14%):</span><span>{fmt(tax)} ج.م</span></div>
                <div className="flex justify-between text-slate-900 font-black text-base pt-2 border-t border-slate-200">
                  <span>الإجمالي:</span><span className="text-indigo-600">{fmt(total)} ج.م</span>
                </div>
              </div>

              <button onClick={checkout} disabled={cart.length === 0} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-600/20 transition-all">
                إتمام البيع والطباعة
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Role Selection Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-black text-slate-900 text-base border-b pb-3">تبديل دور المستخدم</h3>
            <div className="space-y-2">
              {ROLES.map((role) => (
                <button key={role.id} onClick={() => { setCurrentRole(role.id); setShowRoleModal(false); }}
                  className={`w-full p-3 rounded-2xl border text-right font-bold text-xs flex justify-between ${currentRole === role.id ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-black" : "border-slate-200"}`}>
                  <span>{role.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
