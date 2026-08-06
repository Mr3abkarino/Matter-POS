import React, { useState } from "react";
import {
  Search, Plus, Minus, Trash2, Banknote, CreditCard, X, Check,
  Coffee, IceCream, Sandwich, UtensilsCrossed, GlassWater,
  Receipt, Sparkles, Bike, ShoppingBag, Utensils, Phone, User,
  Flame, Printer, LayoutDashboard, Users, Package,
  Wifi, WifiOff, TrendingUp, DollarSign, UserCheck, Key, LogOut, MapPin, TrendingDown, FileText
} from "lucide-react";

/* ---------------- 1. USERS DATABASE (SECURE) ---------------- */
const USERS_DB = [
  { id: 1, username: "admin", password: "admin123", name: "محمد مطر", role: "admin", roleLabel: "👑 Admin" },
  { id: 2, username: "manager", password: "mgr123", name: "أحمد علي", role: "manager", roleLabel: "👔 Manager" },
  { id: 3, username: "cashier", password: "cash123", name: "محمود الكاشير", role: "cashier", roleLabel: "💳 Cashier" },
  { id: 4, username: "waiter", password: "waiter123", name: "مصطفى الويتر", role: "waiter", roleLabel: "🍽️ Waiter" },
];

const ROLE_PERMISSIONS = {
  admin: { canViewDashboard: true, canCheckout: true, canCRM: true, canInventory: true, canReports: true },
  manager: { canViewDashboard: true, canCheckout: true, canCRM: true, canInventory: true, canReports: true },
  cashier: { canViewDashboard: false, canCheckout: true, canCRM: true, canInventory: false, canReports: false },
  waiter: { canViewDashboard: false, canCheckout: false, canCRM: false, canInventory: false, canReports: false },
};

const CATEGORIES = [
  { id: "hot", label: "ساخن", icon: Coffee },
  { id: "cold", label: "بارد", icon: GlassWater },
  { id: "sand", label: "ساندوتش", icon: Sandwich },
  { id: "meal", label: "وجبات", icon: UtensilsCrossed },
];

const INITIAL_PRODUCTS = [
  {
    id: 1, cat: "hot", name: "قهوة تركي", price: 25, emoji: "☕", stock: 50,
    sizes: [{ id: "s", name: "سينجل", extra: 0 }, { id: "d", name: "دبل", extra: 10 }],
    modifiers: [{ id: "m1", name: "سكر زيادة", price: 0 }]
  },
  {
    id: 14, cat: "meal", name: "بيتزا مارجريتا", price: 60, emoji: "🍕", stock: 15,
    sizes: [{ id: "sm", name: "صغير", extra: 0 }, { id: "md", name: "وسط", extra: 25 }, { id: "lg", name: "كبير", extra: 50 }],
    modifiers: [{ id: "m_stuffed", name: "أطراف محشوة", price: 20 }]
  },
  { id: 13, cat: "meal", name: "وجبة برجر", price: 90, emoji: "🍔", stock: 25 },
  { id: 2, cat: "hot", name: "كابتشينو", price: 40, emoji: "☕", stock: 8 },
  { id: 6, cat: "cold", name: "عصير مانجو", price: 35, emoji: "🥭", stock: 3 },
  { id: 11, cat: "sand", name: "ساندوتش فراخ", price: 55, emoji: "🌯", stock: 0 },
];

const MOCK_CUSTOMERS = [
  { id: 1, name: "محمد مطر", phone: "01012345678", address: "شربين - شارع الجمهورية", points: 120, balance: 50.0, debt: 0.0 },
  { id: 2, name: "أحمد علي", phone: "01122334455", address: "شربين - بورسعيد", points: 45, balance: 0.0, debt: 110.0 },
];

const ORDER_TYPES = [
  { id: "takeaway", label: "تيك أواي", icon: ShoppingBag },
  { id: "delivery", label: "دليفري", icon: Bike },
  { id: "dinein", label: "صالة", icon: Utensils },
];

const fmt = (n) => n.toLocaleString("ar-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function SmartPOSApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");

  const [currentView, setCurrentView] = useState("pos");
  const [isOnline] = useState(navigator.onLine);
  
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
  const [cart, setCart] = useState([]);
  const [activeCat, setActiveCat] = useState("hot");
  const [query, setQuery] = useState("");
  const [ticketNo, setTicketNo] = useState(1060);
  const [applyTax, setApplyTax] = useState(true);

  const [orderType, setOrderType] = useState("takeaway");
  const [customerPhoneInput, setCustomerPhoneInput] = useState("");
  const [customerNameInput, setCustomerNameInput] = useState("");
  const [customerAddressInput, setCustomerAddressInput] = useState("");
  const [deliveryFee] = useState(15);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeSize, setActiveSize] = useState(null);
  const [selectedMods, setSelectedMods] = useState([]);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("");
  const [newProdCat, setNewProdCat] = useState("hot");

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
    setCart([]);
  };

  const permissions = currentUser ? ROLE_PERMISSIONS[currentUser.role] : {};

  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const tax = applyTax ? subtotal * 0.14 : 0;
  const currentDeliveryFee = orderType === "delivery" ? Number(deliveryFee) || 0 : 0;
  const total = subtotal + tax + currentDeliveryFee;

  const handleProductClick = (p) => {
    if (p.stock <= 0) return;
    if (p.sizes || p.modifiers) {
      setSelectedProduct(p);
      setActiveSize(p.sizes ? p.sizes[0] : null);
      setSelectedMods([]);
    } else {
      addToCartDirect(p, null, []);
    }
  };

  const addToCartDirect = (p, size, mods) => {
    const itemKey = `${p.id}-${size ? size.id : "def"}-${mods.map(m=>m.id).sort().join(",")}`;
    const extraPrice = (size ? size.extra : 0) + mods.reduce((a, b) => a + b.price, 0);
    const finalUnitPrice = p.price + extraPrice;

    setCart((prev) => {
      const existing = prev.find((i) => i.itemKey === itemKey);
      if (existing) return prev.map((i) => (i.itemKey === itemKey ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { itemKey, id: p.id, name: p.name, emoji: p.emoji, unitPrice: finalUnitPrice, sizeName: size ? size.name : null, selectedMods: mods, qty: 1 }];
    });
    setSelectedProduct(null);
  };

  const changeQty = (itemKey, delta) => {
    setCart((c) => c.map((i) => (i.itemKey === itemKey ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0));
  };

  const clearCart = () => setCart([]);

  const checkout = () => {
    if (cart.length === 0) return;
    setProducts((prev) => prev.map((prod) => {
      const cartItem = cart.find((i) => i.id === prod.id);
      return cartItem ? { ...prod, stock: Math.max(0, prod.stock - cartItem.qty) } : prod;
    }));
    clearCart();
    setTicketNo((t) => t + 1);
    setMobileCartOpen(false);
  };

  const handleAddNewProduct = (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;
    const newProductObj = {
      id: Date.now(),
      cat: newProdCat,
      name: newProdName,
      price: Number(newProdPrice),
      stock: Number(newProdStock) || 10,
      emoji: newProdCat === "hot" ? "☕" : newProdCat === "cold" ? "🧃" : "🥪"
    };
    setProducts([newProductObj, ...products]);
    setNewProdName("");
    setNewProdPrice("");
    setNewProdStock("");
    setShowAddProductModal(false);
  };

  // 🔑 1. CLEAN & SECURE LOGIN SCREEN (بدون إظهار الباسوردات)
  if (!currentUser) {
    return (
      <div dir="rtl" className="h-screen w-full bg-slate-900 flex items-center justify-center p-4 font-sans select-none">
        <div className="bg-white rounded-3xl max-w-sm w-full p-8 space-y-6 shadow-2xl border border-slate-100">
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black mx-auto text-xl shadow-lg shadow-indigo-600/30">
              POS
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">تسجيل الدخول</h2>
            <p className="text-xs text-slate-400 font-semibold">أدخل بيانات الحساب للوصول للنظام</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold text-center">
                {loginError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-600 block">اسم المستخدم</label>
              <div className="relative">
                <User size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="اسم المستخدم..."
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 text-xs font-bold outline-none focus:bg-white focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-600 block">كلمة السر</label>
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

          <p className="text-[11px] text-center text-slate-400 font-semibold">
            جميع الحقوق محفوظة © ElHadary FIN
          </p>

        </div>
      </div>
    );
  }

  // 2. MAIN APPLICATION AFTER LOGIN
  return (
    <div dir="rtl" className="h-screen w-full bg-slate-50 flex flex-col font-sans select-none overflow-hidden text-slate-800">
      
      {/* Navigation Header */}
      <header className="min-h-16 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between px-4 sm:px-6 py-2 shrink-0 shadow-xs z-20 gap-2">
        <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md text-sm">POS</div>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">النظام المالي الذكي</h1>
              <p className="text-[10px] text-slate-400 font-semibold">ElHadary FIN Ecosystem</p>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 text-xs font-bold overflow-x-auto">
            {permissions.canViewDashboard && (
              <button onClick={() => setCurrentView("dashboard")} className={`px-3 py-1.5 rounded-lg transition-all ${currentView === "dashboard" ? "bg-white text-indigo-600 shadow-sm font-extrabold" : "text-slate-500"}`}>
                <LayoutDashboard size={14} className="inline mr-1" /> لوحة التحكم
              </button>
            )}
            <button onClick={() => setCurrentView("pos")} className={`px-3 py-1.5 rounded-lg transition-all ${currentView === "pos" ? "bg-white text-indigo-600 shadow-sm font-extrabold" : "text-slate-500"}`}>
              <Receipt size={14} className="inline mr-1" /> نقطة البيع
            </button>
            {permissions.canCRM && (
              <button onClick={() => setCurrentView("crm")} className={`px-3 py-1.5 rounded-lg transition-all ${currentView === "crm" ? "bg-white text-indigo-600 shadow-sm font-extrabold" : "text-slate-500"}`}>
                <Users size={14} className="inline mr-1" /> العملاء
              </button>
            )}
            {permissions.canInventory && (
              <button onClick={() => setCurrentView("inventory")} className={`px-3 py-1.5 rounded-lg transition-all ${currentView === "inventory" ? "bg-white text-indigo-600 shadow-sm font-extrabold" : "text-slate-500"}`}>
                <Package size={14} className="inline mr-1" /> المخزون
              </button>
            )}
            {permissions.canReports && (
              <button onClick={() => setCurrentView("reports")} className={`px-3 py-1.5 rounded-lg transition-all ${currentView === "reports" ? "bg-white text-indigo-600 shadow-sm font-extrabold" : "text-slate-500"}`}>
                <FileText size={14} className="inline mr-1" /> التقارير
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl text-xs font-bold text-indigo-700 flex items-center gap-1.5">
            <User size={14} /> <span>{currentUser.name}</span>
          </div>
          <button onClick={handleLogout} className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl"><LogOut size={16} /></button>
        </div>
      </header>

      {/* DASHBOARD VIEW */}
      {currentView === "dashboard" && permissions.canViewDashboard && (
        <div className="flex-1 bg-slate-50 p-6 overflow-y-auto space-y-6">
          <h2 className="text-xl font-black text-slate-900">لوحة التحكم والأداء اليومي</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border shadow-xs"><p className="text-xs font-semibold text-slate-400">مبيعات اليوم</p><h3 className="text-2xl font-black text-slate-900 mt-1">11,970.00 ج.م</h3></div>
            <div className="bg-white p-5 rounded-2xl border shadow-xs"><p className="text-xs font-semibold text-slate-400">صافي الربح</p><h3 className="text-2xl font-black text-emerald-600 mt-1">8,420.00 ج.م</h3></div>
            <div className="bg-white p-5 rounded-2xl border shadow-xs"><p className="text-xs font-semibold text-slate-400">الفواتير</p><h3 className="text-2xl font-black text-slate-900 mt-1">142 فاتورة</h3></div>
            <div className="bg-white p-5 rounded-2xl border shadow-xs"><p className="text-xs font-semibold text-slate-400">المصروفات</p><h3 className="text-2xl font-black text-rose-600 mt-1">1,200.00 ج.م</h3></div>
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
                  <button key={c.id} onClick={() => setActiveCat(c.id)} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${activeCat === c.id ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 text-slate-600 border-slate-200"}`}>
                    <c.icon size={14} /> {c.label}
                  </button>
                ))}
              </div>
              <div className="relative w-full sm:w-60 mt-2 sm:mt-0">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="بحث صنف..." className="w-full h-9 bg-slate-100 rounded-xl pr-8 pl-3 text-xs outline-none border focus:bg-white focus:border-indigo-500" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="grid gap-3 sm:gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}>
                {products.filter(p=>p.cat===activeCat && p.name.includes(query)).map((p) => (
                  <button key={p.id} onClick={() => handleProductClick(p)}
                    className="bg-white rounded-2xl border border-slate-100 p-3 flex flex-col items-center text-center relative hover:shadow-md transition-all">
                    <span className="absolute top-2 left-2 text-[9px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{p.stock}</span>
                    <div className="text-3xl mb-2 mt-1">{p.emoji}</div>
                    <div className="font-bold text-xs text-slate-800 leading-snug">{p.name}</div>
                    <div className="text-indigo-600 font-black text-xs mt-1">{fmt(p.price)} ج.م</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="md:hidden bg-white border-t p-3 flex justify-between items-center shadow-lg">
              <span className="font-black text-indigo-600 text-sm">{fmt(total)} ج.م</span>
              <button onClick={() => setMobileCartOpen(true)} className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl">عرض الفاتورة ({cart.length})</button>
            </div>
          </main>

          <aside className={`w-full md:w-[360px] shrink-0 bg-white flex flex-col shadow-xl border-r fixed md:relative inset-y-0 right-0 z-30 transition-transform ${mobileCartOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}>
            <div className="p-3 border-b bg-slate-50/70 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black">فاتورة جديد #{ticketNo}</span>
                {cart.length > 0 && <button onClick={clearCart} className="text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md font-bold flex items-center gap-1"><Trash2 size={12} /> تصفير</button>}
              </div>
              <div className="grid grid-cols-3 gap-1 bg-slate-200/60 p-1 rounded-xl">
                {ORDER_TYPES.map((t) => (
                  <button key={t.id} onClick={() => setOrderType(t.id)} className={`py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1 ${orderType === t.id ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600"}`}>
                    <t.icon size={13} /> {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {cart.map((item) => (
                <div key={item.itemKey} className="bg-slate-50 rounded-xl p-2.5 border flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">{item.name} {item.sizeName && `(${item.sizeName})`}</h4>
                    <span className="text-[11px] text-slate-400">{fmt(item.unitPrice)} ج.م × {item.qty}</span>
                  </div>
                  <span className="font-black text-xs text-slate-900">{fmt(item.unitPrice * item.qty)} ج.م</span>
                </div>
              ))}
            </div>

            <div className="p-4 border-t bg-slate-50/50 space-y-3">
              <div className="space-y-1 text-xs font-semibold text-slate-500">
                <div className="flex justify-between"><span>الفرعي:</span><span>{fmt(subtotal)} ج.م</span></div>
                <div className="flex justify-between items-center text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
                    <input type="checkbox" checked={applyTax} onChange={(e) => setApplyTax(e.target.checked)} className="rounded text-indigo-600" />
                    <span>الضريبة (14%):</span>
                  </label>
                  <span>{fmt(tax)} ج.م</span>
                </div>
                <div className="flex justify-between text-slate-900 font-black text-sm pt-1 border-t"><span>الإجمالي:</span><span className="text-indigo-600">{fmt(total)} ج.م</span></div>
              </div>
              <button onClick={checkout} disabled={cart.length === 0} className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-black text-xs rounded-xl shadow-md">إتمام البيع والطباعة</button>
            </div>
          </aside>
        </div>
      )}

      {/* CRM CUSTOMERS VIEW */}
      {currentView === "crm" && (
        <div className="flex-1 bg-slate-50 p-6 overflow-y-auto space-y-6">
          <h2 className="text-xl font-black text-slate-900">إدارة العملاء ونقاط الولاء (CRM)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {customers.map((c) => (
              <div key={c.id} className="bg-white p-5 rounded-2xl border shadow-xs space-y-3">
                <div className="flex justify-between">
                  <h3 className="font-black text-sm text-slate-900">{c.name}</h3>
                  <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{c.phone}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                  <div className="bg-amber-50 p-2 rounded-xl text-amber-700">النقاط: {c.points}</div>
                  <div className="bg-teal-50 p-2 rounded-xl text-teal-700">المحفظة: {fmt(c.balance)}</div>
                  <div className="bg-rose-50 p-2 rounded-xl text-rose-700">الديون: {fmt(c.debt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INVENTORY VIEW */}
      {currentView === "inventory" && (
        <div className="flex-1 bg-slate-50 p-6 overflow-y-auto space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-900">إدارة المخزون والمنتجات</h2>
            <button onClick={() => setShowAddProductModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Plus size={15} /> إضافة صنف جديد
            </button>
          </div>

          <div className="bg-white rounded-2xl border shadow-xs overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b font-black text-slate-600">
                <tr><th className="p-3">الصنف</th><th className="p-3">السعر</th><th className="p-3">المخزن</th><th className="p-3">الحالة</th></tr>
              </thead>
              <tbody className="divide-y font-bold">
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="p-3 flex items-center gap-2"><span className="text-xl">{p.emoji}</span><span>{p.name}</span></td>
                    <td className="p-3">{fmt(p.price)} ج.م</td>
                    <td className="p-3 font-black">{p.stock} قطعه</td>
                    <td className="p-3">{p.stock > 0 ? <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">متوفر</span> : <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded">منتهي</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORTS VIEW */}
      {currentView === "reports" && (
        <div className="flex-1 bg-slate-50 p-6 overflow-y-auto space-y-4">
          <h2 className="text-xl font-black text-slate-900">التقارير المالية وحركة المبيعات</h2>
          <div className="bg-white p-6 rounded-2xl border shadow-xs space-y-3 font-bold text-xs">
            <div className="flex justify-between border-b pb-2"><span>إجمالي الإيرادات:</span><span className="text-indigo-600">11,970.00 ج.م</span></div>
            <div className="flex justify-between border-b pb-2"><span>إجمالي المصروفات:</span><span className="text-rose-600">1,200.00 ج.م</span></div>
            <div className="flex justify-between font-black text-sm pt-2 text-slate-900"><span>صافي الربح:</span><span className="text-emerald-600">8,420.00 ج.م</span></div>
          </div>
        </div>
      )}

      {/* MODAL: ADD PRODUCT */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddNewProduct} className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 font-black text-slate-900">
              <span>إضافة صنف جديد</span>
              <button type="button" onClick={() => setShowAddProductModal(false)}><X size={18} /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">اسم الصنف</label>
                <input type="text" required value={newProdName} onChange={(e) => setNewProdName(e.target.value)} placeholder="مثال: شاي لبتون" className="w-full h-9 border rounded-xl px-2 font-bold outline-none" />
              </div>
              <div>
                <label className="font-bold text-slate-600 block mb-1">السعر (ج.م)</label>
                <input type="number" required value={newProdPrice} onChange={(e) => setNewProdPrice(e.target.value)} placeholder="20" className="w-full h-9 border rounded-xl px-2 font-bold outline-none" />
              </div>
              <div>
                <label className="font-bold text-slate-600 block mb-1">الكمية بالمخزن</label>
                <input type="number" required value={newProdStock} onChange={(e) => setNewProdStock(e.target.value)} placeholder="30" className="w-full h-9 border rounded-xl px-2 font-bold outline-none" />
              </div>
            </div>
            <button type="submit" className="w-full h-10 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-md">حفظ وإضافة للمخزون</button>
          </form>
        </div>
      )}

      {/* MODAL: PRODUCT SIZES */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 font-black text-slate-900">
              <span className="text-base flex items-center gap-2">{selectedProduct.emoji} {selectedProduct.name}</span>
              <button onClick={() => setSelectedProduct(null)} className="text-slate-400"><X size={18} /></button>
            </div>
            {selectedProduct.sizes && (
              <div>
                <label className="text-xs font-black text-slate-400 block mb-2">اختر الحجم المطلـوب:</label>
                <div className="grid grid-cols-3 gap-2">
                  {selectedProduct.sizes.map((s) => (
                    <button key={s.id} onClick={() => setActiveSize(s)} className={`py-2 rounded-xl border text-xs font-bold ${activeSize?.id === s.id ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-black" : "border-slate-200"}`}>
                      <div>{s.name}</div>
                      {s.extra > 0 && <div className="text-[10px] text-slate-400">+{s.extra} ج.م</div>}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button onClick={() => addToCartDirect(selectedProduct, activeSize, selectedMods)} className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/30">
              تأكيد وإضافة للسلة
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
