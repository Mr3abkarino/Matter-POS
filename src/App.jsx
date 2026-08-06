import React, { useState, useEffect } from "react";
import {
  Search, Plus, Minus, Trash2, Banknote, CreditCard, X, Check,
  Coffee, IceCream, Sandwich, UtensilsCrossed, GlassWater,
  Receipt, Sparkles, Bike, ShoppingBag, Utensils, Phone, User,
  Flame, Printer, LayoutDashboard, Users, Package,
  Wifi, WifiOff, TrendingUp, DollarSign, UserCheck, Key, LogOut, MapPin, TrendingDown, FileText, Database, Settings, Shield, PlusCircle, RefreshCw
} from "lucide-react";

/* ---------------- 1. INITIAL FALLBACK DATA ---------------- */
const DEFAULT_RESTAURANT = {
  name: "مطعم وفول الحضري",
  logo: "🍔",
  address: "شربين - بجوار شركة WE - الدقهلية",
  phone: "01012345678",
  receiptFooter: "شكراً لزيارتكم! نتمنى لكم وجبة شهية ❤️",
  autoPrint: true,
  paperWidth: "80mm"
};

const DEFAULT_USERS_DB = [
  { id: 1, username: "admin", password: "admin123", name: "محمد مطر", role: "admin", roleLabel: "👑 Admin" },
  { id: 2, username: "manager", password: "mgr123", name: "أحمد علي", role: "manager", roleLabel: "👔 Manager" },
  { id: 3, username: "cashier", password: "cash123", name: "محمود الكاشير", role: "cashier", roleLabel: "💳 Cashier" },
  { id: 4, username: "waiter", password: "waiter123", name: "مصطفى الويتر", role: "waiter", roleLabel: "🍽️ Waiter" },
];

const ROLE_PERMISSIONS = {
  admin: { canViewDashboard: true, canCheckout: true, canCRM: true, canInventory: true, canReports: true, canManageInvoices: true, canSettings: true },
  manager: { canViewDashboard: true, canCheckout: true, canCRM: true, canInventory: true, canReports: true, canManageInvoices: true, canSettings: true },
  cashier: { canViewDashboard: false, canCheckout: true, canCRM: true, canInventory: false, canReports: false, canManageInvoices: false, canSettings: false },
  waiter: { canViewDashboard: false, canCheckout: false, canCRM: false, canInventory: false, canReports: false, canManageInvoices: false, canSettings: false },
};

const CATEGORIES = [
  { id: "hot", label: "ساخن", icon: Coffee },
  { id: "cold", label: "بارد", icon: GlassWater },
  { id: "sand", label: "ساندوتش", icon: Sandwich },
  { id: "meal", label: "وجبات", icon: UtensilsCrossed },
];

const DEFAULT_PRODUCTS = [
  { id: 1, cat: "hot", name: "قهوة تركي", price: 25, emoji: "☕", stock: 50 },
  { id: 14, cat: "meal", name: "بيتزا مارجريتا", price: 60, emoji: "🍕", stock: 15 },
  { id: 13, cat: "meal", name: "وجبة برجر", price: 90, emoji: "🍔", stock: 25 },
  { id: 2, cat: "hot", name: "كابتشينو", price: 40, emoji: "☕", stock: 0 }, // صنف منتهي للتجربة
];

const fmt = (n) => n.toLocaleString("ar-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function SmartPOSApp() {
  // 💾 1. تحميل الإعدادات والبيانات من LocalStorage
  const [restaurantInfo, setRestaurantInfo] = useState(() => JSON.parse(localStorage.getItem("pos_restaurant") || JSON.stringify(DEFAULT_RESTAURANT)));
  const [usersDb, setUsersDb] = useState(() => JSON.parse(localStorage.getItem("pos_users") || JSON.stringify(DEFAULT_USERS_DB)));
  const [products, setProducts] = useState(() => JSON.parse(localStorage.getItem("pos_products") || JSON.stringify(DEFAULT_PRODUCTS)));
  const [completedOrders, setCompletedOrders] = useState(() => JSON.parse(localStorage.getItem("pos_orders") || "[]"));

  // 💾 2. الحفظ التلقائي عند التعديل
  useEffect(() => { localStorage.setItem("pos_restaurant", JSON.stringify(restaurantInfo)); }, [restaurantInfo]);
  useEffect(() => { localStorage.setItem("pos_users", JSON.stringify(usersDb)); }, [usersDb]);
  useEffect(() => { localStorage.setItem("pos_products", JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem("pos_orders", JSON.stringify(completedOrders)); }, [completedOrders]);

  // Auth & View States
  const [currentUser, setCurrentUser] = useState(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");

  const [currentView, setCurrentView] = useState("pos"); // pos, dashboard, invoices, inventory, settings
  const [cart, setCart] = useState([]);
  const [activeCat, setActiveCat] = useState("hot");
  const [query, setQuery] = useState("");
  const [applyTax, setApplyTax] = useState(false);
  const [orderType, setOrderType] = useState("takeaway");

  // Restock & User Management Modal States
  const [restockProduct, setRestockProduct] = useState(null);
  const [restockQty, setRestockQty] = useState("");

  const [newUserModal, setNewUserModal] = useState(false);
  const [newUName, setNewUName] = useState("");
  const [newUPass, setNewUPass] = useState("");
  const [newURole, setNewURole] = useState("cashier");
  const [newURealName, setNewURealName] = useState("");

  const currentTicketNo = completedOrders.length + 1;

  const handleLogin = (e) => {
    e.preventDefault();
    const user = usersDb.find((u) => u.username.toLowerCase() === usernameInput.trim().toLowerCase() && u.password === passwordInput);
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
    setCart([]);
  };

  const permissions = currentUser ? ROLE_PERMISSIONS[currentUser.role] : {};

  // Cart Financials
  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const tax = applyTax ? subtotal * 0.14 : 0;
  const total = subtotal + tax;

  const addToCartDirect = (p) => {
    if (p.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === p.id);
      if (existing) return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { id: p.id, name: p.name, emoji: p.emoji, unitPrice: p.price, qty: 1 }];
    });
  };

  const checkout = () => {
    if (cart.length === 0) return;

    const newOrder = {
      id: Date.now(),
      ticketNo: currentTicketNo,
      total,
      subtotal,
      tax,
      orderType,
      items: [...cart],
      status: "completed",
      date: new Date().toLocaleDateString("ar-EG"),
      time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      cashier: currentUser.name
    };

    setCompletedOrders((prev) => [newOrder, ...prev]);

    // خصم المخزن
    setProducts((prev) => prev.map((prod) => {
      const cartItem = cart.find((i) => i.id === prod.id);
      return cartItem ? { ...prod, stock: Math.max(0, prod.stock - cartItem.qty) } : prod;
    }));

    setCart([]);
  };

  // 📦 1. تزويد وإعادات شحن المخزون للصنف
  const handleRestockSubmit = (e) => {
    e.preventDefault();
    if (!restockProduct || !restockQty) return;
    const qtyToAdd = Number(restockQty);
    setProducts((prev) => prev.map((p) => p.id === restockProduct.id ? { ...p, stock: p.stock + qtyToAdd } : p));
    setRestockProduct(null);
    setRestockQty("");
  };

  // 👥 2. إضافة مستخدم جديد للنظام
  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    if (!newUName || !newUPass) return;
    const newUser = {
      id: Date.now(),
      username: newUName.trim(),
      password: newUPass,
      name: newURealName || newUName,
      role: newURole,
      roleLabel: newURole === "admin" ? "👑 Admin" : newURole === "manager" ? "👔 Manager" : "💳 Cashier"
    };
    setUsersDb((prev) => [...prev, newUser]);
    setNewUName(""); setNewUPass(""); setNewURealName("");
    setNewUserModal(false);
  };

  // 🔑 3. تعديل باسورد مستخدم
  const handleUpdatePassword = (userId, newPass) => {
    setUsersDb((prev) => prev.map((u) => u.id === userId ? { ...u, password: newPass } : u));
    alert("✅ تم تحديث كلمة السر بنجاح!");
  };

  if (!currentUser) {
    return (
      <div dir="rtl" className="h-screen w-full bg-slate-900 flex items-center justify-center p-4 font-sans select-none">
        <div className="bg-white rounded-3xl max-w-sm w-full p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black mx-auto text-2xl shadow-lg shadow-indigo-600/30">
              {restaurantInfo.logo}
            </div>
            <h2 className="text-xl font-black text-slate-900">{restaurantInfo.name}</h2>
            <p className="text-xs text-slate-400 font-semibold">تسجيل الدخول للنظام المالي</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && <div className="p-3 bg-rose-50 border text-rose-600 rounded-xl text-xs font-bold text-center">{loginError}</div>}
            <input type="text" required value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} placeholder="اسم المستخدم..." className="w-full h-11 bg-slate-50 border rounded-xl px-4 text-xs font-bold outline-none" />
            <input type="password" required value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="••••••••" className="w-full h-11 bg-slate-50 border rounded-xl px-4 text-xs font-bold outline-none" />
            <button type="submit" className="w-full h-12 bg-indigo-600 text-white font-black text-sm rounded-xl shadow-lg">دخول النظام</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="h-screen w-full bg-slate-50 flex flex-col font-sans select-none overflow-hidden text-slate-800">
      
      {/* Header */}
      <header className="min-h-16 bg-white border-b flex flex-wrap items-center justify-between px-4 sm:px-6 py-2 shrink-0 shadow-xs z-20 gap-2">
        <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md text-base">
              {restaurantInfo.logo}
            </div>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base text-slate-900">{restaurantInfo.name}</h1>
              <p className="text-[10px] text-slate-400 font-semibold">{restaurantInfo.address}</p>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl border text-xs font-bold overflow-x-auto">
            {permissions.canViewDashboard && (
              <button onClick={() => setCurrentView("dashboard")} className={`px-3 py-1.5 rounded-lg ${currentView === "dashboard" ? "bg-white text-indigo-600 shadow-sm font-extrabold" : "text-slate-500"}`}>
                <LayoutDashboard size={14} className="inline mr-1" /> لوحة التحكم
              </button>
            )}
            <button onClick={() => setCurrentView("pos")} className={`px-3 py-1.5 rounded-lg ${currentView === "pos" ? "bg-white text-indigo-600 shadow-sm font-extrabold" : "text-slate-500"}`}>
              <Receipt size={14} className="inline mr-1" /> نقطة البيع
            </button>
            {permissions.canManageInvoices && (
              <button onClick={() => setCurrentView("invoices")} className={`px-3 py-1.5 rounded-lg ${currentView === "invoices" ? "bg-white text-indigo-600 shadow-sm font-extrabold" : "text-slate-500"}`}>
                <FileText size={14} className="inline mr-1" /> الفواتير ({completedOrders.length})
              </button>
            )}
            {permissions.canInventory && (
              <button onClick={() => setCurrentView("inventory")} className={`px-3 py-1.5 rounded-lg ${currentView === "inventory" ? "bg-white text-indigo-600 shadow-sm font-extrabold" : "text-slate-500"}`}>
                <Package size={14} className="inline mr-1" /> المخزون
              </button>
            )}
            
            {/* ⚙️ 4. تبويب الإعدادات المدمج */}
            {permissions.canSettings && (
              <button onClick={() => setCurrentView("settings")} className={`px-3 py-1.5 rounded-lg ${currentView === "settings" ? "bg-indigo-600 text-white font-extrabold" : "text-slate-500"}`}>
                <Settings size={14} className="inline mr-1" /> الإعدادات
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-indigo-50 border px-3 py-1 rounded-xl text-xs font-bold text-indigo-700 flex items-center gap-1.5">
            <User size={14} /> <span>{currentUser.name}</span>
          </div>
          <button onClick={handleLogout} className="p-2 text-rose-600 bg-rose-50 border rounded-xl"><LogOut size={16} /></button>
        </div>
      </header>

      {/* DASHBOARD VIEW */}
      {currentView === "dashboard" && permissions.canViewDashboard && (
        <div className="flex-1 bg-slate-50 p-6 overflow-y-auto space-y-6">
          <h2 className="text-xl font-black text-slate-900">لوحة التحكم والأداء</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border shadow-xs"><p className="text-xs font-semibold text-slate-400">المبيعات</p><h3 className="text-2xl font-black text-slate-900 mt-1">{fmt(completedOrders.reduce((a,b)=>a+b.total,0))} ج.م</h3></div>
            <div className="bg-white p-5 rounded-2xl border shadow-xs"><p className="text-xs font-semibold text-slate-400">عدد الفواتير</p><h3 className="text-2xl font-black text-indigo-600 mt-1">{completedOrders.length} فاتورة</h3></div>
          </div>
        </div>
      )}

      {/* POS VIEW */}
      {currentView === "pos" && (
        <div className="flex-1 flex flex-col md:flex-row min-h-0 relative">
          <main className="flex-1 flex flex-col min-w-0 bg-slate-50 border-l">
            <div className="px-6 py-3 flex justify-between bg-white border-b">
              <div className="flex gap-1.5">
                {CATEGORIES.map((c) => (
                  <button key={c.id} onClick={() => setActiveCat(c.id)} className={`px-3.5 py-2 rounded-xl text-xs font-bold border ${activeCat === c.id ? "bg-indigo-600 text-white" : "bg-slate-50"}`}>
                    <c.icon size={14} className="inline mr-1" /> {c.label}
                  </button>
                ))}
              </div>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="بحث..." className="h-9 bg-slate-100 rounded-xl pr-4 pl-3 text-xs outline-none" />
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}>
                {products.filter(p=>p.cat===activeCat && p.name.includes(query)).map((p) => (
                  <button key={p.id} onClick={() => addToCartDirect(p)} disabled={p.stock <= 0} className={`bg-white rounded-2xl border p-4 flex flex-col items-center text-center relative hover:shadow-md ${p.stock <= 0 ? "opacity-50" : ""}`}>
                    <span className={`absolute top-2 left-2 text-[9px] font-black px-1.5 py-0.5 rounded ${p.stock <= 0 ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-400"}`}>
                      {p.stock <= 0 ? "نفذت" : p.stock}
                    </span>
                    <div className="text-3xl mb-2">{p.emoji}</div>
                    <div className="font-bold text-xs">{p.name}</div>
                    <div className="text-indigo-600 font-black text-xs mt-1">{fmt(p.price)} ج.م</div>
                  </button>
                ))}
              </div>
            </div>
          </main>

          <aside className="w-[360px] bg-white flex flex-col border-r shadow-xl">
            <div className="p-3 border-b bg-slate-50 space-y-2">
              <span className="text-xs font-black">فاتورة جديد #{currentTicketNo}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="bg-slate-50 rounded-xl p-2.5 border flex justify-between">
                  <div><h4 className="font-bold text-xs">{item.name}</h4><span className="text-[11px] text-slate-400">{fmt(item.unitPrice)} ج.م × {item.qty}</span></div>
                  <span className="font-black text-xs">{fmt(item.unitPrice * item.qty)} ج.م</span>
                </div>
              ))}
            </div>

            <div className="p-4 border-t bg-slate-50 space-y-3">
              <div className="space-y-1 text-xs font-semibold">
                <div className="flex justify-between"><span>الإجمالي:</span><span className="text-indigo-600 font-black">{fmt(total)} ج.م</span></div>
              </div>
              <button onClick={checkout} disabled={cart.length === 0} className="w-full h-10 bg-indigo-600 text-white font-black text-xs rounded-xl">إتمام البيع والطباعة</button>
            </div>
          </aside>
        </div>
      )}

      {/* 📦 INVENTORY VIEW WITH RESTOCK BUTTON */}
      {currentView === "inventory" && (
        <div className="flex-1 bg-slate-50 p-6 overflow-y-auto space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-900">إدارة المخزون وتزويد الاصناف</h2>
          </div>

          <div className="bg-white rounded-2xl border shadow-xs overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b font-black text-slate-600">
                <tr><th className="p-3">الصنف</th><th className="p-3">السعر</th><th className="p-3">المخزن الحالي</th><th className="p-3">الحالة</th><th className="p-3 text-center">إجراءات</th></tr>
              </thead>
              <tbody className="divide-y font-bold">
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="p-3 flex items-center gap-2"><span className="text-xl">{p.emoji}</span><span>{p.name}</span></td>
                    <td className="p-3">{fmt(p.price)} ج.م</td>
                    <td className="p-3 font-black">{p.stock} قطعة</td>
                    <td className="p-3">
                      {p.stock > 0 ? (
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px]">متوفر</span>
                      ) : (
                        <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-[10px]">منتهي المخزون ⚠️</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {/* 📌 زر إعادة شحن وتزويد المخزون للصنف */}
                      <button onClick={() => setRestockProduct(p)} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-xl font-bold flex items-center gap-1 mx-auto transition-all">
                        <PlusCircle size={13} /> تزويد الكمية +
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ⚙️ SETTINGS VIEW (تبويب الإعدادات الشامل) */}
      {currentView === "settings" && permissions.canSettings && (
        <div className="flex-1 bg-slate-50 p-6 overflow-y-auto space-y-8">
          
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">إعدادات المطعم والنظام</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. إعدادات بيانات المطعم */}
            <div className="bg-white p-6 rounded-3xl border shadow-xs space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 border-b pb-3 flex items-center gap-2">
                <Settings size={18} className="text-indigo-600" /> ملف المطعم واللوجو
              </h3>
              
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">اسم المطعم</label>
                  <input type="text" value={restaurantInfo.name} onChange={(e) => setRestaurantInfo({ ...restaurantInfo, name: e.target.value })} className="w-full h-10 border rounded-xl px-3 font-bold outline-none" />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">اللوجو (رمز تعبيري Emoji)</label>
                  <input type="text" value={restaurantInfo.logo} onChange={(e) => setRestaurantInfo({ ...restaurantInfo, logo: e.target.value })} className="w-full h-10 border rounded-xl px-3 font-bold outline-none" />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">العنوان التفصيلي</label>
                  <input type="text" value={restaurantInfo.address} onChange={(e) => setRestaurantInfo({ ...restaurantInfo, address: e.target.value })} className="w-full h-10 border rounded-xl px-3 font-bold outline-none" />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">رقم الهاتف التواصل</label>
                  <input type="text" value={restaurantInfo.phone} onChange={(e) => setRestaurantInfo({ ...restaurantInfo, phone: e.target.value })} className="w-full h-10 border rounded-xl px-3 font-bold outline-none" />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">رسالة الترحيب أسفل الفاتورة</label>
                  <input type="text" value={restaurantInfo.receiptFooter} onChange={(e) => setRestaurantInfo({ ...restaurantInfo, receiptFooter: e.target.value })} className="w-full h-10 border rounded-xl px-3 font-bold outline-none" />
                </div>
              </div>
            </div>

            {/* 2. التحكم بالحسابات والباسوردات */}
            <div className="bg-white p-6 rounded-3xl border shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Shield size={18} className="text-indigo-600" /> المستخدمين وكلمات السر
                </h3>
                <button onClick={() => setNewUserModal(true)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1">
                  <Plus size={14} /> إضافة مستخدم
                </button>
              </div>

              <div className="space-y-3">
                {usersDb.map((u) => (
                  <div key={u.id} className="p-3 bg-slate-50 rounded-2xl border flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{u.name} ({u.roleLabel})</div>
                      <div className="text-[11px] text-slate-400 font-mono">Username: {u.username}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        defaultValue={u.password}
                        onBlur={(e) => handleUpdatePassword(u.id, e.target.value)}
                        className="w-24 h-8 bg-white border rounded-lg px-2 text-center font-mono font-bold"
                        title="تغيير كلمة السر ثم اضغط خارج الحقل للتأكيد"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 1: تزويد الكمية للمخزون */}
      {restockProduct && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleRestockSubmit} className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 font-black text-slate-900">
              <span>تزويد مخزون: {restockProduct.name}</span>
              <button type="button" onClick={() => setRestockProduct(null)}><X size={18} /></button>
            </div>
            <div className="space-y-2 text-xs">
              <p className="text-slate-500 font-bold">الكمية الحالية المتوفرة بالمخزن: <span className="text-indigo-600 font-black">{restockProduct.stock} قطعة</span></p>
              <div>
                <label className="font-bold text-slate-600 block mb-1">الكمية المضافة جديدة (+)</label>
                <input type="number" required value={restockQty} onChange={(e) => setRestockQty(e.target.value)} placeholder="مثال: 50" className="w-full h-10 border rounded-xl px-3 font-black outline-none text-base text-indigo-600" />
              </div>
            </div>
            <button type="submit" className="w-full h-10 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-md">تأكيد التزويد وإعادة التفعيل</button>
          </form>
        </div>
      )}

      {/* MODAL 2: إضافة مستخدم جديد */}
      {newUserModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddUserSubmit} className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 font-black text-slate-900">
              <span>إضافة موظف / مستخدم جديد</span>
              <button type="button" onClick={() => setNewUserModal(false)}><X size={18} /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">اسم الموظف الثلاثي</label>
                <input type="text" required value={newURealName} onChange={(e) => setNewURealName(e.target.value)} placeholder="أحمد علي" className="w-full h-9 border rounded-xl px-2 font-bold outline-none" />
              </div>
              <div>
                <label className="font-bold text-slate-600 block mb-1">اسم المستخدم (Username)</label>
                <input type="text" required value={newUName} onChange={(e) => setNewUName(e.target.value)} placeholder="ahmed123" className="w-full h-9 border rounded-xl px-2 font-bold outline-none" />
              </div>
              <div>
                <label className="font-bold text-slate-600 block mb-1">كلمة السر</label>
                <input type="password" required value={newUPass} onChange={(e) => setNewUPass(e.target.value)} placeholder="••••••••" className="w-full h-9 border rounded-xl px-2 font-bold outline-none" />
              </div>
              <div>
                <label className="font-bold text-slate-600 block mb-1">الدور والصلاحية</label>
                <select value={newURole} onChange={(e) => setNewURole(e.target.value)} className="w-full h-9 border rounded-xl px-2 font-bold outline-none bg-white">
                  <option value="cashier">الكاشير (Cashier)</option>
                  <option value="waiter">الويتر (Waiter)</option>
                  <option value="manager">المدير (Manager)</option>
                  <option value="admin">مدير النظام (Admin)</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full h-10 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-md">حفظ الكارنية والمستخدم</button>
          </form>
        </div>
      )}

    </div>
  );
}
