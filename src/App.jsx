import React, { useState, useEffect } from "react";
import {
  Search, Plus, Minus, Trash2, Banknote, CreditCard, X, Check,
  Coffee, IceCream, Sandwich, UtensilsCrossed, GlassWater,
  Receipt, Sparkles, Bike, ShoppingBag, Utensils, Phone, User,
  Flame, Printer, LayoutDashboard, Users, Package,
  Wifi, WifiOff, TrendingUp, DollarSign, UserCheck, Key, LogOut, MapPin, TrendingDown, FileText, Database, Settings, Shield, PlusCircle, RefreshCw, Image, Layers, ChevronRight, Menu
} from "lucide-react";

/* ---------------- 1. INITIAL FALLBACK DATA ---------------- */
const DEFAULT_RESTAURANT = {
  name: "مطعم وفول الحضري",
  logo: "🍔",
  logoUrl: "", // رابط صورة لوجو إن وجد
  address: "شربين - بجوار شركة WE - الدقهلية",
  phone: "01012345678",
  receiptFooter: "شكراً لزيارتكم! نتمنى لكم وجبة شهية ❤️",
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

// مناطق الدليفري الافتراضية
const DEFAULT_DELIVERY_ZONES = [
  { id: 1, name: "وسط البلد / داخل شربين", fee: 15 },
  { id: 2, name: "القرى والقريبة", fee: 25 },
  { id: 3, name: "المناطق البعيدة", fee: 35 },
];

const DEFAULT_PRODUCTS = [
  {
    id: 1, cat: "hot", name: "قهوة تركي", price: 25, emoji: "☕", imageUrl: "", stock: 50,
    sizes: [{ id: "s", name: "سينجل", extra: 0 }, { id: "d", name: "دبل", extra: 10 }],
    modifiers: [{ id: "m1", name: "سكر زيادة", price: 0 }, { id: "m2", name: "على الريحة", price: 0 }]
  },
  {
    id: 14, cat: "meal", name: "بيتزا مارجريتا", price: 60, emoji: "🍕", imageUrl: "", stock: 15,
    sizes: [{ id: "sm", name: "صغير", extra: 0 }, { id: "md", name: "وسط", extra: 25 }, { id: "lg", name: "كبير", extra: 50 }],
    modifiers: [{ id: "m_stuffed", name: "أطراف محشوة", price: 20 }]
  },
  { id: 13, cat: "meal", name: "وجبة برجر", price: 90, emoji: "🍔", imageUrl: "", stock: 25 },
  { id: 2, cat: "hot", name: "كابتشينو", price: 40, emoji: "☕", imageUrl: "", stock: 12 },
];

const fmt = (n) => n.toLocaleString("ar-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function SmartPOSApp() {
  // 💾 التخزين والمزامنة
  const [restaurantInfo, setRestaurantInfo] = useState(() => JSON.parse(localStorage.getItem("pos_restaurant") || JSON.stringify(DEFAULT_RESTAURANT)));
  const [usersDb, setUsersDb] = useState(() => JSON.parse(localStorage.getItem("pos_users") || JSON.stringify(DEFAULT_USERS_DB)));
  const [products, setProducts] = useState(() => JSON.parse(localStorage.getItem("pos_products") || JSON.stringify(DEFAULT_PRODUCTS)));
  const [completedOrders, setCompletedOrders] = useState(() => JSON.parse(localStorage.getItem("pos_orders") || "[]"));
  const [deliveryZones, setDeliveryZones] = useState(() => JSON.parse(localStorage.getItem("pos_delivery_zones") || JSON.stringify(DEFAULT_DELIVERY_ZONES)));

  useEffect(() => { localStorage.setItem("pos_restaurant", JSON.stringify(restaurantInfo)); }, [restaurantInfo]);
  useEffect(() => { localStorage.setItem("pos_users", JSON.stringify(usersDb)); }, [usersDb]);
  useEffect(() => { localStorage.setItem("pos_products", JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem("pos_orders", JSON.stringify(completedOrders)); }, [completedOrders]);
  useEffect(() => { localStorage.setItem("pos_delivery_zones", JSON.stringify(deliveryZones)); }, [deliveryZones]);

  // Auth & UI States
  const [currentUser, setCurrentUser] = useState(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");

  const [currentView, setCurrentView] = useState("pos"); // pos, dashboard, invoices, inventory, settings
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Cart & Orders
  const [cart, setCart] = useState([]);
  const [activeCat, setActiveCat] = useState("hot");
  const [query, setQuery] = useState("");
  const [orderType, setOrderType] = useState("takeaway");
  
  // الدليفري والمنطقة المختارة
  const [selectedZone, setSelectedDeliveryZone] = useState(deliveryZones[0] || { fee: 15 });
  const [customerPhoneInput, setCustomerPhoneInput] = useState("");
  const [customerNameInput, setCustomerNameInput] = useState("");
  const [customerAddressInput, setCustomerAddressInput] = useState("");

  // Modals States
  const [selectedProductModal, setSelectedProductModal] = useState(null);
  const [activeSize, setActiveSize] = useState(null);
  const [selectedMods, setSelectedMods] = useState([]);

  // Restock & Zone & Product Add States
  const [restockProduct, setRestockProduct] = useState(null);
  const [restockQty, setRestockQty] = useState("");
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("");
  const [newProdCat, setNewProdCat] = useState("hot");
  const [newProdImage, setNewProdImage] = useState("");

  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneFee, setNewZoneFee] = useState("");

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

  // Financial Calculations
  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const deliveryFeeCalculated = orderType === "delivery" ? Number(selectedZone?.fee || 0) : 0;
  const total = subtotal + deliveryFeeCalculated;

  // الضغط على الصنف (فتح المودال إذا وجد أحجام إضافية)
  const handleProductClick = (p) => {
    if (p.stock <= 0) return;
    if ((p.sizes && p.sizes.length > 0) || (p.modifiers && p.modifiers.length > 0)) {
      setSelectedProductModal(p);
      setActiveSize(p.sizes ? p.sizes[0] : null);
      setSelectedMods([]);
    } else {
      addToCartDirect(p, null, []);
    }
  };

  const addToCartDirect = (p, size, mods) => {
    const itemKey = `${p.id}-${size ? size.id : "def"}-${mods ? mods.map(m=>m.id).sort().join(",") : ""}`;
    const extraPrice = (size ? size.extra : 0) + (mods ? mods.reduce((a, b) => a + b.price, 0) : 0);
    const finalUnitPrice = p.price + extraPrice;

    setCart((prev) => {
      const existing = prev.find((i) => i.itemKey === itemKey);
      if (existing) return prev.map((i) => (i.itemKey === itemKey ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, {
        itemKey, id: p.id, name: p.name, emoji: p.emoji, imageUrl: p.imageUrl,
        unitPrice: finalUnitPrice, sizeName: size ? size.name : null, qty: 1
      }];
    });
    setSelectedProductModal(null);
  };

  const checkout = () => {
    if (cart.length === 0) return;

    const newOrder = {
      id: Date.now(),
      ticketNo: currentTicketNo,
      total,
      subtotal,
      deliveryFee: deliveryFeeCalculated,
      zoneName: orderType === "delivery" ? selectedZone?.name : null,
      orderType,
      customerName: customerNameInput || "عميل نقدًا",
      customerPhone: customerPhoneInput || "",
      customerAddress: customerAddressInput || "",
      items: [...cart],
      status: "completed",
      date: new Date().toLocaleDateString("ar-EG"),
      time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      cashier: currentUser.name
    };

    setCompletedOrders((prev) => [newOrder, ...prev]);

    // خصم المخزون
    setProducts((prev) => prev.map((prod) => {
      const cartItem = cart.find((i) => i.id === prod.id);
      return cartItem ? { ...prod, stock: Math.max(0, prod.stock - cartItem.qty) } : prod;
    }));

    setCart([]);
    setCustomerNameInput("");
    setCustomerPhoneInput("");
    setCustomerAddressInput("");
  };

  // تزويد المخزون
  const handleRestockSubmit = (e) => {
    e.preventDefault();
    if (!restockProduct || !restockQty) return;
    const qtyToAdd = Number(restockQty);
    setProducts((prev) => prev.map((p) => p.id === restockProduct.id ? { ...p, stock: p.stock + qtyToAdd } : p));
    setRestockProduct(null);
    setRestockQty("");
  };

  // إضافة صنف جديد
  const handleAddNewProduct = (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;
    const newProd = {
      id: Date.now(),
      cat: newProdCat,
      name: newProdName,
      price: Number(newProdPrice),
      stock: Number(newProdStock) || 10,
      emoji: "📦",
      imageUrl: newProdImage.trim()
    };
    setProducts((prev) => [newProd, ...prev]);
    setNewProdName(""); setNewProdPrice(""); setNewProdStock(""); setNewProdImage("");
    setShowAddProductModal(false);
  };

  // إضافة منطقة دليفري جديدة
  const handleAddZoneSubmit = (e) => {
    e.preventDefault();
    if (!newZoneName || !newZoneFee) return;
    const zoneObj = { id: Date.now(), name: newZoneName, fee: Number(newZoneFee) };
    setDeliveryZones((prev) => [...prev, zoneObj]);
    setNewZoneName(""); setNewZoneFee("");
  };

  if (!currentUser) {
    return (
      <div dir="rtl" className="h-screen w-full bg-slate-900 flex items-center justify-center p-4 font-sans select-none">
        <div className="bg-white rounded-3xl max-w-sm w-full p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black mx-auto text-2xl shadow-lg">
              {restaurantInfo.logoUrl ? <img src={restaurantInfo.logoUrl} alt="logo" className="w-full h-full object-cover rounded-2xl" /> : restaurantInfo.logo}
            </div>
            <h2 className="text-xl font-black text-slate-900">{restaurantInfo.name}</h2>
            <p className="text-xs text-slate-400 font-semibold">تسجيل الدخول للنظام المالي</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold text-center">{loginError}</div>}
            <input type="text" required value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} placeholder="اسم المستخدم..." className="w-full h-11 bg-slate-50 border rounded-xl px-4 text-xs font-bold outline-none" />
            <input type="password" required value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="••••••••" className="w-full h-11 bg-slate-50 border rounded-xl px-4 text-xs font-bold outline-none" />
            <button type="submit" className="w-full h-12 bg-indigo-600 text-white font-black text-sm rounded-xl shadow-lg">دخول النظام</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="h-screen w-full bg-slate-50 flex font-sans select-none overflow-hidden text-slate-800">
      
      {/* 📌 1. SIDEBAR (القائمة الجانبية المودرن) */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-slate-900 text-slate-300 min-h-screen flex flex-col justify-between transition-all duration-300 z-30 shrink-0`}>
        <div className="p-4 space-y-6">
          
          {/* Logo & Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden">
                {restaurantInfo.logoUrl ? <img src={restaurantInfo.logoUrl} alt="Logo" className="w-full h-full object-cover" /> : restaurantInfo.logo}
              </div>
              {sidebarOpen && (
                <div className="truncate">
                  <h1 className="font-extrabold text-white text-sm truncate">{restaurantInfo.name}</h1>
                  <p className="text-[10px] text-slate-400 font-bold truncate">النظام المالي الموحد</p>
                </div>
              )}
            </div>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-white p-1">
              <Menu size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 font-bold text-xs">
            {permissions.canViewDashboard && (
              <button onClick={() => setCurrentView("dashboard")} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${currentView === "dashboard" ? "bg-indigo-600 text-white shadow-md" : "hover:bg-slate-800 text-slate-400"}`}>
                <LayoutDashboard size={18} /> {sidebarOpen && <span>لوحة التحكم</span>}
              </button>
            )}

            <button onClick={() => setCurrentView("pos")} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${currentView === "pos" ? "bg-indigo-600 text-white shadow-md" : "hover:bg-slate-800 text-slate-400"}`}>
              <Receipt size={18} /> {sidebarOpen && <span>نقطة البيع (POS)</span>}
            </button>

            {permissions.canManageInvoices && (
              <button onClick={() => setCurrentView("invoices")} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${currentView === "invoices" ? "bg-indigo-600 text-white shadow-md" : "hover:bg-slate-800 text-slate-400"}`}>
                <FileText size={18} /> {sidebarOpen && <span>سجل الفواتير ({completedOrders.length})</span>}
              </button>
            )}

            {permissions.canInventory && (
              <button onClick={() => setCurrentView("inventory")} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${currentView === "inventory" ? "bg-indigo-600 text-white shadow-md" : "hover:bg-slate-800 text-slate-400"}`}>
                <Package size={18} /> {sidebarOpen && <span>المخزون والمنتجات</span>}
              </button>
            )}

            {permissions.canSettings && (
              <button onClick={() => setCurrentView("settings")} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${currentView === "settings" ? "bg-indigo-600 text-white shadow-md" : "hover:bg-slate-800 text-slate-400"}`}>
                <Settings size={18} /> {sidebarOpen && <span>إعدادات النظام</span>}
              </button>
            )}
          </nav>
        </div>

        {/* User Info Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          {sidebarOpen && (
            <div className="truncate">
              <p className="text-xs font-black text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-indigo-400 font-bold">{currentUser.roleLabel}</p>
            </div>
          )}
          <button onClick={handleLogout} title="تسجيل الخروج" className="p-2 text-rose-400 hover:bg-slate-800 rounded-xl">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* MAIN VIEW AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* DASHBOARD VIEW */}
        {currentView === "dashboard" && (
          <div className="flex-1 bg-slate-50 p-6 overflow-y-auto space-y-6">
            <h2 className="text-2xl font-black text-slate-900">لوحة التحكم والأداء اليومي</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border shadow-xs"><p className="text-xs font-semibold text-slate-400">إجمالي المبيعات المحصلة</p><h3 className="text-2xl font-black text-slate-900 mt-1">{fmt(completedOrders.reduce((a,b)=>a+b.total, 0))} ج.م</h3></div>
              <div className="bg-white p-5 rounded-2xl border shadow-xs"><p className="text-xs font-semibold text-slate-400">عدد الفواتير</p><h3 className="text-2xl font-black text-indigo-600 mt-1">{completedOrders.length} فاتورة</h3></div>
            </div>
          </div>
        )}

        {/* POS VIEW */}
        {currentView === "pos" && (
          <div className="flex-1 flex flex-col md:flex-row min-h-0 relative">
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50 border-l">
              <div className="px-6 py-3 flex justify-between bg-white border-b items-center">
                <div className="flex gap-1.5 overflow-x-auto">
                  {CATEGORIES.map((c) => (
                    <button key={c.id} onClick={() => setActiveCat(c.id)} className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${activeCat === c.id ? "bg-indigo-600 text-white" : "bg-slate-50"}`}>
                      <c.icon size={14} className="inline mr-1" /> {c.label}
                    </button>
                  ))}
                </div>
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="بحث صنف..." className="h-9 bg-slate-100 rounded-xl pr-4 pl-3 text-xs outline-none" />
              </div>

              {/* Grid Products */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
                  {products.filter(p=>p.cat===activeCat && p.name.includes(query)).map((p) => (
                    <button key={p.id} onClick={() => handleProductClick(p)} disabled={p.stock <= 0} className={`bg-white rounded-2xl border p-3 flex flex-col items-center text-center relative hover:shadow-md transition-all ${p.stock <= 0 ? "opacity-50" : ""}`}>
                      <span className={`absolute top-2 left-2 text-[9px] font-black px-1.5 py-0.5 rounded ${p.stock <= 0 ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-400"}`}>
                        {p.stock <= 0 ? "نفذت" : p.stock}
                      </span>
                      
                      {/* عرض الصورة أو Emoji */}
                      <div className="w-12 h-12 my-2 flex items-center justify-center text-3xl overflow-hidden rounded-xl bg-slate-50">
                        {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : p.emoji}
                      </div>

                      <div className="font-bold text-xs text-slate-800 leading-snug">{p.name}</div>
                      <div className="text-indigo-600 font-black text-xs mt-1">{fmt(p.price)} ج.م</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cart Panel */}
            <aside className="w-[360px] bg-white flex flex-col border-r shadow-xl">
              <div className="p-3 border-b bg-slate-50 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black">فاتورة جديد #{currentTicketNo}</span>
                  {cart.length > 0 && <button onClick={() => setCart([])} className="text-xs text-rose-600 font-bold">تصفير</button>}
                </div>
                
                {/* أزرار نوع الطلب */}
                <div className="grid grid-cols-3 gap-1 bg-slate-200 p-1 rounded-xl">
                  {["takeaway", "delivery", "dinein"].map((t) => (
                    <button key={t} onClick={() => setOrderType(t)} className={`py-1.5 rounded-lg text-xs font-black ${orderType === t ? "bg-indigo-600 text-white" : "text-slate-600"}`}>
                      {t === "takeaway" ? "تيك أواي" : t === "delivery" ? "دليفري" : "صالة"}
                    </button>
                  ))}
                </div>

                {/* 📌 خيارات مناطق الدليفري وأسعار التوصيل */}
                {orderType === "delivery" && (
                  <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl space-y-2 text-xs">
                    <div>
                      <label className="font-bold text-indigo-900 block mb-1">اختر منطقة التوصيل:</label>
                      <select
                        value={selectedZone?.id}
                        onChange={(e) => setSelectedDeliveryZone(deliveryZones.find(z => z.id === Number(e.target.value)))}
                        className="w-full h-8 bg-white border border-indigo-200 rounded-lg px-2 font-bold outline-none"
                      >
                        {deliveryZones.map((z) => (
                          <option key={z.id} value={z.id}>{z.name} (+{z.fee} ج.م)</option>
                        ))}
                      </select>
                    </div>

                    <input value={customerPhoneInput} onChange={(e) => setCustomerPhoneInput(e.target.value)} placeholder="رقم الهاتف..." className="w-full h-7 bg-white border rounded-lg px-2 text-xs font-bold outline-none" />
                    <input value={customerNameInput} onChange={(e) => setCustomerNameInput(e.target.value)} placeholder="اسم العميل..." className="w-full h-7 bg-white border rounded-lg px-2 text-xs font-bold outline-none" />
                    <input value={customerAddressInput} onChange={(e) => setCustomerAddressInput(e.target.value)} placeholder="العنوان..." className="w-full h-7 bg-white border rounded-lg px-2 text-xs font-bold outline-none" />
                  </div>
                )}
              </div>

              {/* قائمة عناصر السلة */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {cart.map((item) => (
                  <div key={item.itemKey} className="bg-slate-50 rounded-xl p-2.5 border flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-xs">{item.name} {item.sizeName && <span className="text-indigo-600">({item.sizeName})</span>}</h4>
                      <span className="text-[11px] text-slate-400">{fmt(item.unitPrice)} ج.م × {item.qty}</span>
                    </div>
                    <span className="font-black text-xs">{fmt(item.unitPrice * item.qty)} ج.م</span>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t bg-slate-50 space-y-2">
                <div className="space-y-1 text-xs font-semibold">
                  <div className="flex justify-between"><span>الفرعي:</span><span>{fmt(subtotal)} ج.م</span></div>
                  {orderType === "delivery" && <div className="flex justify-between text-indigo-700 font-bold"><span>خدمة توصيل ({selectedZone?.name}):</span><span>{fmt(deliveryFeeCalculated)} ج.م</span></div>}
                  <div className="flex justify-between font-black text-sm pt-1 border-t"><span>الإجمالي:</span><span className="text-indigo-600">{fmt(total)} ج.م</span></div>
                </div>
                <button onClick={checkout} disabled={cart.length === 0} className="w-full h-10 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-md">إتمام البيع والطباعة</button>
              </div>
            </aside>
          </div>
        )}

        {/* 📋 INVOICES HUB */}
        {currentView === "invoices" && (
          <div className="flex-1 bg-slate-50 p-6 overflow-y-auto space-y-6">
            <h2 className="text-xl font-black text-slate-900">سجل الفواتير المنفذة والمحفوظة ({completedOrders.length})</h2>
            <div className="bg-white rounded-2xl border shadow-xs overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b font-black text-slate-600">
                  <tr><th className="p-3">رقم الفاتورة</th><th className="p-3">التاريخ والوقت</th><th className="p-3">النوع</th><th className="p-3">العميل</th><th className="p-3">الكاشير</th><th className="p-3">الإجمالي</th></tr>
                </thead>
                <tbody className="divide-y font-bold">
                  {completedOrders.map((o) => (
                    <tr key={o.id}>
                      <td className="p-3 font-mono font-black text-indigo-600">#{o.ticketNo}</td>
                      <td className="p-3 text-slate-500">{o.date} - {o.time}</td>
                      <td className="p-3">{o.orderType}</td>
                      <td className="p-3">{o.customerName}</td>
                      <td className="p-3">{o.cashier}</td>
                      <td className="p-3 font-black text-emerald-600">{fmt(o.total)} ج.م</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 📦 INVENTORY VIEW */}
        {currentView === "inventory" && (
          <div className="flex-1 bg-slate-50 p-6 overflow-y-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-900">إدارة المخزون وإعادة الشحن</h2>
              <button onClick={() => setShowAddProductModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1">
                <Plus size={15} /> إضافة صنف جديد
              </button>
            </div>

            <div className="bg-white rounded-2xl border shadow-xs overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b font-black text-slate-600">
                  <tr><th className="p-3">الصنف والصورة</th><th className="p-3">السعر</th><th className="p-3">المخزن</th><th className="p-3">الحالة</th><th className="p-3 text-center">تزويد المخزن</th></tr>
                </thead>
                <tbody className="divide-y font-bold">
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td className="p-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                          {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : p.emoji}
                        </div>
                        <span>{p.name}</span>
                      </td>
                      <td className="p-3">{fmt(p.price)} ج.م</td>
                      <td className="p-3 font-black">{p.stock} قطعة</td>
                      <td className="p-3">{p.stock > 0 ? <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px]">متوفر</span> : <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-[10px]">منتهي</span>}</td>
                      <td className="p-3 text-center">
                        <button onClick={() => setRestockProduct(p)} className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-bold">
                          + تزويد الكمية
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ⚙️ SETTINGS VIEW */}
        {currentView === "settings" && permissions.canSettings && (
          <div className="flex-1 bg-slate-50 p-6 overflow-y-auto space-y-8">
            <h2 className="text-xl font-black text-slate-900">إعدادات المطعم والتوصيل</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* ملف المطعم واللوجو */}
              <div className="bg-white p-6 rounded-3xl border shadow-xs space-y-3 text-xs">
                <h3 className="font-extrabold text-sm text-slate-900 border-b pb-2">بيانات المطعم واللوجو</h3>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">اسم المطعم</label>
                  <input type="text" value={restaurantInfo.name} onChange={(e) => setRestaurantInfo({ ...restaurantInfo, name: e.target.value })} className="w-full h-9 border rounded-xl px-3 font-bold outline-none" />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">رابط صورة اللوجو (Logo URL)</label>
                  <input type="text" value={restaurantInfo.logoUrl} onChange={(e) => setRestaurantInfo({ ...restaurantInfo, logoUrl: e.target.value })} placeholder="https://example.com/logo.png" className="w-full h-9 border rounded-xl px-3 font-bold outline-none" />
                </div>
              </div>

              {/* 📌 إدارة مناطق وأسعار التوصيل (Delivery Zones) */}
              <div className="bg-white p-6 rounded-3xl border shadow-xs space-y-4 text-xs">
                <h3 className="font-extrabold text-sm text-slate-900 border-b pb-2">مناطق وأسعار الدليفري</h3>
                
                <form onSubmit={handleAddZoneSubmit} className="flex gap-2">
                  <input type="text" required value={newZoneName} onChange={(e) => setNewZoneName(e.target.value)} placeholder="اسم المنطقة..." className="flex-1 h-9 border rounded-xl px-3 font-bold outline-none" />
                  <input type="number" required value={newZoneFee} onChange={(e) => setNewZoneFee(e.target.value)} placeholder="السعر (ج.م)" className="w-24 h-9 border rounded-xl px-3 font-bold outline-none" />
                  <button type="submit" className="px-4 bg-indigo-600 text-white rounded-xl font-bold">+ إضافة</button>
                </form>

                <div className="space-y-1.5 pt-2">
                  {deliveryZones.map((z) => (
                    <div key={z.id} className="p-2.5 bg-slate-50 rounded-xl border flex justify-between items-center font-bold">
                      <span>{z.name}</span>
                      <span className="text-indigo-600">{z.fee} ج.م</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* 📌 2. MODAL اختيار الأحجام والإضافات المحدث بالكامل */}
      {selectedProductModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 font-black text-slate-900">
              <span className="text-base flex items-center gap-2">{selectedProductModal.name}</span>
              <button onClick={() => setSelectedProductModal(null)} className="text-slate-400"><X size={18} /></button>
            </div>

            {selectedProductModal.sizes && (
              <div>
                <label className="text-xs font-black text-slate-400 block mb-2">اختر الحجم المطلـوب:</label>
                <div className="grid grid-cols-3 gap-2">
                  {selectedProductModal.sizes.map((s) => (
                    <button key={s.id} onClick={() => setActiveSize(s)} className={`py-2 rounded-xl border text-xs font-bold ${activeSize?.id === s.id ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-black" : "border-slate-200"}`}>
                      <div>{s.name}</div>
                      {s.extra > 0 && <div className="text-[10px] text-slate-400">+{s.extra} ج.م</div>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => addToCartDirect(selectedProductModal, activeSize, selectedMods)} className="w-full h-11 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-lg">
              تأكيد وإضافة للسلة
            </button>
          </div>
        </div>
      )}

      {/* MODAL تزويد الكمية للمخزون */}
      {restockProduct && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleRestockSubmit} className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 font-black text-slate-900">
              <span>تزويد مخزون: {restockProduct.name}</span>
              <button type="button" onClick={() => setRestockProduct(null)}><X size={18} /></button>
            </div>
            <input type="number" required value={restockQty} onChange={(e) => setRestockQty(e.target.value)} placeholder="الكمية المضافة جديدة (+)" className="w-full h-10 border rounded-xl px-3 font-black outline-none text-base text-indigo-600" />
            <button type="submit" className="w-full h-10 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-md">تأكيد وإعادة التفعيل</button>
          </form>
        </div>
      )}

      {/* MODAL إضافة صنف جديد ودعم رابط صورة */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddNewProduct} className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 font-black text-slate-900">
              <span>إضافة صنف جديد</span>
              <button type="button" onClick={() => setShowAddProductModal(false)}><X size={18} /></button>
            </div>
            <div className="space-y-3 text-xs">
              <input type="text" required value={newProdName} onChange={(e) => setNewProdName(e.target.value)} placeholder="اسم الصنف..." className="w-full h-9 border rounded-xl px-3 font-bold outline-none" />
              <input type="number" required value={newProdPrice} onChange={(e) => setNewProdPrice(e.target.value)} placeholder="السعر (ج.م)..." className="w-full h-9 border rounded-xl px-3 font-bold outline-none" />
              <input type="number" required value={newProdStock} onChange={(e) => setNewProdStock(e.target.value)} placeholder="الكمية بالمخزن..." className="w-full h-9 border rounded-xl px-3 font-bold outline-none" />
              <input type="text" value={newProdImage} onChange={(e) => setNewProdImage(e.target.value)} placeholder="رابط صورة الصنف (اختياري)..." className="w-full h-9 border rounded-xl px-3 font-bold outline-none" />
            </div>
            <button type="submit" className="w-full h-10 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-md">حفظ وإضافة للمخزون</button>
          </form>
        </div>
      )}

    </div>
  );
}
