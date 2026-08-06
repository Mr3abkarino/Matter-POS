import React, { useState, useMemo, useEffect } from "react";
import {
  Search, Plus, Minus, Trash2, Banknote, CreditCard, X, Check,
  Coffee, IceCream, Sandwich, UtensilsCrossed, GlassWater,
  Receipt, Sparkles, Bike, ShoppingBag, Utensils, MapPin, Phone, User,
  PauseCircle, PlayCircle, Clock, Flame, CheckCircle2, ArrowRight,
  Lock, Unlock, FileText, Printer, LayoutDashboard, Users, Package,
  AlertTriangle, Wifi, WifiOff, RefreshCw, TrendingUp, DollarSign,
  Wallet, Award, ShieldCheck, UserCheck, Gift, History, CreditCard as DebtIcon
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

/* ---------------- 1. COMPLETE MASTER DATA MODEL ---------------- */

const ROLES = [
  { id: "admin", label: "👑 Admin (مدير النظام)", color: "bg-purple-600 text-white" },
  { id: "manager", label: "👔 Manager (مدير الصالة)", color: "bg-indigo-600 text-white" },
  { id: "cashier", label: "💳 Cashier (الكاشير)", color: "bg-teal-600 text-white" },
  { id: "waiter", label: "🍽️ Waiter (الويتر)", color: "bg-amber-600 text-white" },
];

const ROLE_PERMISSIONS = {
  admin: { canCheckout: true, canShift: true, canKDS: true, canHold: true, isWaiterOnly: false },
  manager: { canCheckout: true, canShift: true, canKDS: true, canHold: true, isWaiterOnly: false },
  cashier: { canCheckout: true, canShift: false, canKDS: true, canHold: true, isWaiterOnly: false },
  waiter: { canCheckout: false, canShift: false, canKDS: true, canHold: true, isWaiterOnly: true },
};

const CATEGORIES = [
  { id: "hot", label: "مشروبات ساخنة", icon: Coffee },
  { id: "cold", label: "مشروبات باردة", icon: GlassWater },
  { id: "sand", label: "ساندويتشات", icon: Sandwich },
  { id: "meal", label: "وجبات وبدائل", icon: UtensilsCrossed },
];

const PRODUCTS = [
  {
    id: 1, cat: "hot", name: "قهوة تركي", price: 25, cost: 10, emoji: "☕", stock: 50, minStock: 10,
    sizes: [{ id: "s", name: "سينجل", extra: 0 }, { id: "d", name: "دبل", extra: 10 }],
    modifiers: [{ id: "m1", name: "سكر زيادة", price: 0 }, { id: "m2", name: "على الريحة", price: 0 }, { id: "m3", name: "حليب إضافي", price: 5 }]
  },
  {
    id: 13, cat: "meal", name: "وجبة برجر", price: 90, cost: 45, emoji: "🍔", stock: 25, minStock: 8,
    sizes: [{ id: "single", name: "سينجل", extra: 0 }, { id: "double", name: "دبل باتي", extra: 35 }],
    modifiers: [{ id: "mod_cheese", name: "جبنة شيدر إضافية", price: 15 }, { id: "mod_no_onion", name: "بدون بصل", price: 0 }, { id: "mod_spicy", name: "صوص سبايسي 🌶️", price: 5 }]
  },
  {
    id: 14, cat: "meal", name: "بيتزا مارجريتا", price: 60, cost: 25, emoji: "🍕", stock: 15, minStock: 5,
    sizes: [
      { id: "sm", name: "صغير (Small)", extra: 0 },
      { id: "md", name: "وسط (Medium)", extra: 30 },
      { id: "lg", name: "كبير (Large)", extra: 60 }
    ],
    modifiers: [{ id: "m_stuffed", name: "أطراف محشوة جبنة", price: 20 }, { id: "m_extra_cheese", name: "زيادة موزاريلا", price: 15 }]
  },
  { id: 2, cat: "hot", name: "كابتشينو", price: 40, cost: 18, emoji: "☕", stock: 8, minStock: 10 },
  { id: 6, cat: "cold", name: "عصير مانجو", price: 35, cost: 12, emoji: "🥭", stock: 3, minStock: 5 },
  { id: 11, cat: "sand", name: "ساندوتش فراخ", price: 55, cost: 25, emoji: "🌯", stock: 0, minStock: 5 },
];

const ORDER_TYPES = [
  { id: "takeaway", label: "تيك أواي", icon: ShoppingBag, color: "bg-amber-500 text-white border-amber-500" },
  { id: "delivery", label: "دليفري", icon: Bike, color: "bg-indigo-600 text-white border-indigo-600" },
  { id: "dinein", label: "صالة", icon: Utensils, color: "bg-teal-600 text-white border-teal-600" },
];

const MOCK_CUSTOMERS = [
  {
    id: 1, name: "محمد مطر", phone: "01012345678", address: "شربين - بجوار شركة WE",
    points: 120, balance: 50.0, debt: 0.0,
    history: [{ ticketNo: 1012, date: "2026-08-01", total: 140, type: "delivery" }]
  },
  {
    id: 2, name: "أحمد علي", phone: "01122334455", address: "شربين - شارع بورسعيد",
    points: 45, balance: 0.0, debt: 110.0,
    history: [{ ticketNo: 1030, date: "2026-08-04", total: 110, type: "delivery" }]
  }
];

const PRINT_FORMATS = [
  { id: "80mm", label: "حراري 80mm", width: "80mm" },
  { id: "58mm", label: "حراري 58mm", width: "58mm" },
  { id: "A4", label: "A4 تقرير", width: "210mm" },
];

const SALES_TIMELINE_DATA = [
  { time: "10 ص", sales: 420 }, { time: "12 ظ", sales: 850 },
  { time: "02 م", sales: 1400 }, { time: "04 م", sales: 1100 },
  { time: "06 م", sales: 2300 }, { time: "08 م", sales: 3100 }, { time: "10 م", sales: 2800 },
];

const TOP_PRODUCTS_DATA = [
  { name: "وجبة برجر", qty: 48, revenue: 4320 },
  { name: "قهوة تركي", qty: 35, revenue: 875 },
  { name: "عصير مانجو", qty: 29, revenue: 1015 },
];

const STAFF_SALES_DATA = [
  { name: "محمد (الكاشير)", sales: 4500, orders: 38 },
  { name: "أحمد (ويتر)", sales: 3200, orders: 25 },
];

const fmt = (n) => n.toLocaleString("ar-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtTime = (date) => {
  const diffMinutes = Math.floor((new Date() - new Date(date)) / 60000);
  return `${diffMinutes} دقيقة`;
};

/* ---------------- 2. MAIN APPLICATION COMPONENT ---------------- */

export default function SmartPOSApp() {
  // Navigation View State: pos, kitchen, dashboard, reports, crm, inventory
  const [currentView, setCurrentView] = useState("pos");
  const [currentRole, setCurrentRole] = useState("admin");
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Network & Offline State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueue, setSyncQueue] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Shift Management
  const [shiftActive, setShiftActive] = useState(true);
  const [startCash, setStartCash] = useState(500);
  const [shiftStartTime, setShiftStartTime] = useState(new Date());
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [actualEndingCash, setActualEndingCash] = useState("");
  const [lastZReport, setLastZReport] = useState(null);

  // Products & Inventory
  const [products, setProducts] = useState(PRODUCTS);
  const [cart, setCart] = useState([]);
  const [activeCat, setActiveCat] = useState("hot");
  const [query, setQuery] = useState("");
  const [payMethod, setPayMethod] = useState("cash"); // cash, card, debt
  const [received, setReceived] = useState("");
  const [ticketNo, setTicketNo] = useState(1060);

  // Order Details & CRM
  const [orderType, setOrderType] = useState("takeaway");
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [customerPhoneInput, setCustomerPhoneInput] = useState("");
  const [customerNameInput, setCustomerNameInput] = useState("");
  const [customerAddressInput, setCustomerAddressInput] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(15);
  const [redeemedDiscount, setRedeemedDiscount] = useState(0);

  // Kitchen Orders & Hold Orders
  const [kitchenOrders, setKitchenOrders] = useState([]);
  const [heldOrders, setHeldOrders] = useState([]);
  const [showHoldModal, setShowHoldModal] = useState(false);

  // Modifiers Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeSize, setActiveSize] = useState(null);
  const [selectedMods, setSelectedMods] = useState([]);
  const [itemNote, setItemNote] = useState("");

  // Printing State
  const [printFormat, setPrintFormat] = useState("80mm");
  const [lastPrintedTicket, setLastPrintedTicket] = useState(null);

  // Financial Stats
  const [expenses] = useState(1200);
  const [completedOrders, setCompletedOrders] = useState([
    { id: 1058, total: 240, cost: 110, tax: 29.4, date: "2026-08-06" },
    { id: 1059, total: 180, cost: 80, tax: 22.0, date: "2026-08-06" },
  ]);

  const permissions = ROLE_PERMISSIONS[currentRole];

  // Keyboard Shortcuts (F2, F3, F4, F8, F9, ESC)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentView !== "pos") return;
      if (e.key === "F2") {
        e.preventDefault();
        document.getElementById("pos-search-input")?.focus();
      } else if (e.key === "F3") {
        e.preventDefault();
        setOrderType((prev) => (prev === "takeaway" ? "delivery" : prev === "delivery" ? "dinein" : "takeaway"));
      } else if (e.key === "F4") {
        e.preventDefault();
        if (canCheckout) checkout();
      } else if (e.key === "F8") {
        e.preventDefault();
        if (cart.length > 0) handleHoldOrder();
      } else if (e.key === "F9") {
        e.preventDefault();
        setShowHoldModal((prev) => !prev);
      } else if (e.key === "Escape") {
        setSelectedProduct(null);
        setShowHoldModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentView, cart, payMethod, received, customerPhoneInput, orderType]);

  // Online / Offline Status Engine
  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); triggerAutoSync(); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Customer Auto-Lookup by Phone
  useEffect(() => {
    if (customerPhoneInput.trim().length >= 8) {
      const found = customers.find((c) => c.phone.includes(customerPhoneInput.trim()));
      if (found) {
        setActiveCustomer(found);
        setCustomerNameInput(found.name);
        setCustomerAddressInput(found.address);
      }
    }
  }, [customerPhoneInput, customers]);

  const triggerAutoSync = () => {
    if (syncQueue.length === 0) return;
    setIsSyncing(true);
    setTimeout(() => {
      setSyncQueue([]);
      setIsSyncing(false);
    }, 2000);
  };

  // Cart Calculations
  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const totalCost = cart.reduce((s, i) => s + i.cost * i.qty, 0);
  const tax = subtotal * 0.14;
  const currentDeliveryFee = orderType === "delivery" ? Number(deliveryFee) || 0 : 0;
  const rawTotal = subtotal + tax + currentDeliveryFee;
  const total = Math.max(0, rawTotal - redeemedDiscount);
  const change = payMethod === "cash" && received !== "" ? Math.max(0, Number(received) - total) : 0;
  
  const isDeliveryValid = orderType !== "delivery" || (customerPhoneInput.trim() !== "" && customerAddressInput.trim() !== "");
  const canCheckout = shiftActive && cart.length > 0 && isDeliveryValid && (payMethod !== "cash" || Number(received) >= total);

  // Cart Management
  const handleProductClick = (p) => {
    if (p.stock <= 0) return;
    if (p.sizes || p.modifiers) {
      setSelectedProduct(p);
      setActiveSize(p.sizes ? p.sizes[0] : null);
      setSelectedMods([]);
      setItemNote("");
    } else {
      addToCartDirect(p, null, [], "");
    }
  };

  const addToCartDirect = (p, size, mods, note) => {
    const itemKey = `${p.id}-${size ? size.id : "def"}-${mods.map(m=>m.id).sort().join(",")}-${note}`;
    const extraPrice = (size ? size.extra : 0) + mods.reduce((a, b) => a + b.price, 0);
    const finalUnitPrice = p.price + extraPrice;

    setCart((prev) => {
      const existing = prev.find((i) => i.itemKey === itemKey);
      if (existing) {
        return prev.map((i) => (i.itemKey === itemKey ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, {
        itemKey, id: p.id, name: p.name, emoji: p.emoji, cost: p.cost,
        unitPrice: finalUnitPrice, sizeName: size ? size.name : null, selectedMods: mods, note, qty: 1
      }];
    });
    setSelectedProduct(null);
  };

  const changeQty = (itemKey, delta) => {
    setCart((c) => c.map((i) => (i.itemKey === itemKey ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0));
  };

  const clearCart = () => {
    setCart([]);
    setReceived("");
    setRedeemedDiscount(0);
    setActiveCustomer(null);
    setCustomerPhoneInput("");
    setCustomerNameInput("");
    setCustomerAddressInput("");
    setTicketNo(1000 + Math.floor(Math.random() * 900));
  };

  // Hold & Resume
  const handleHoldOrder = () => {
    if (cart.length === 0) return;
    const newHold = {
      id: Date.now(), ticketNo, cart: [...cart], orderType, customerName: customerNameInput,
      total, time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })
    };
    setHeldOrders((prev) => [newHold, ...prev]);
    clearCart();
  };

  const handleResumeOrder = (h) => {
    setCart(h.cart);
    setTicketNo(h.ticketNo);
    setOrderType(h.orderType);
    setCustomerNameInput(h.customerName || "");
    setHeldOrders((prev) => prev.filter((o) => o.id !== h.id));
    setShowHoldModal(false);
  };

  // 💥 CHECKOUT EXECUTION (Stock Deduct, KDS Sync, Printing & CRM)
  const checkout = () => {
    if (!canCheckout) return;

    // 1. Deduct Stock
    setProducts((prev) => prev.map((prod) => {
      const cartItem = cart.find((i) => i.id === prod.id);
      return cartItem ? { ...prod, stock: Math.max(0, prod.stock - cartItem.qty) } : prod;
    }));

    // 2. Add to Kitchen Display (KDS)
    const newKitchenOrder = {
      id: Date.now(), ticketNo, orderType, createdAt: new Date(), status: "pending",
      items: cart.map((i) => ({ name: i.name, qty: i.qty, sizeName: i.sizeName, mods: i.selectedMods.map((m) => m.name), note: i.note }))
    };
    setKitchenOrders((prev) => [newKitchenOrder, ...prev]);

    // 3. Update CRM (Points & Debts)
    if (activeCustomer) {
      const earnedPoints = Math.floor(total / 10);
      setCustomers((prev) => prev.map((c) => c.id === activeCustomer.id ? {
        ...c, points: Math.max(0, c.points - (redeemedDiscount * 10) + earnedPoints),
        debt: payMethod === "debt" ? c.debt + total : c.debt,
        history: [{ ticketNo, date: new Date().toISOString().split("T")[0], total, type: orderType }, ...c.history]
      } : c));
    }

    // 4. Record Completed Order & Offline Sync Queue
    const orderRecord = { id: Date.now(), ticketNo, total, cost: totalCost, tax, date: new Date().toISOString().split("T")[0] };
    if (!isOnline) setSyncQueue((prev) => [...prev, orderRecord]);
    setCompletedOrders((prev) => [orderRecord, ...prev]);

    // 5. Thermal Print & Reset
    const ticketData = { ticketNo, orderType, date: new Date().toLocaleDateString("ar-EG"), time: new Date().toLocaleTimeString("ar-EG"), cart: [...cart], subtotal, tax, total, payMethod };
    setLastPrintedTicket(ticketData);

    setTimeout(() => {
      window.print();
      clearCart();
    }, 200);
  };

  // Shift Operations
  const handleOpenShift = (e) => { e.preventDefault(); setShiftActive(true); setShiftStartTime(new Date()); setShowOpenShiftModal(false); };
  const handleCloseShift = () => {
    const expectedCash = Number(startCash) + completedOrders.reduce((a, b) => a + b.total, 0);
    const actual = Number(actualEndingCash) || 0;
    setLastZReport({ shiftStart: shiftStartTime?.toLocaleTimeString("ar-EG"), shiftEnd: new Date().toLocaleTimeString("ar-EG"), startCash: Number(startCash), totalSales: completedOrders.reduce((a,b)=>a+b.total,0), expectedCash, actualEndingCash: actual, difference: actual - expectedCash });
    setShiftActive(false);
    setShowCloseShiftModal(false);
  };

  // Financial Aggregations
  const totalRevenue = completedOrders.reduce((a, b) => a + b.total, 0);
  const totalCOGS = completedOrders.reduce((a, b) => a + b.cost, 0);
  const totalTaxes = completedOrders.reduce((a, b) => a + b.tax, 0);
  const netProfit = totalRevenue - totalCOGS - expenses - totalTaxes;

  return (
    <div dir="rtl" className="h-screen w-full bg-slate-100 flex flex-col font-sans select-none overflow-hidden text-slate-800">
      
      {/* Dynamic Printing CSS Rules */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #thermal-print-area, #thermal-print-area * { visibility: visible; }
          #thermal-print-area {
            position: absolute; left: 0; top: 0;
            width: ${printFormat === "80mm" ? "80mm" : printFormat === "58mm" ? "58mm" : "210mm"};
            padding: ${printFormat === "A4" ? "15mm" : "4mm"}; background: #fff; color: #000;
            font-family: ${printFormat === "A4" ? "sans-serif" : "'Courier New', monospace"};
          }
          @page { size: ${printFormat === "80mm" ? "80mm auto" : printFormat === "58mm" ? "58mm auto" : "A4"}; margin: 0; }
        }
      `}</style>

      {/* Top Application Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-20 print:hidden">
        <div className="flex items-center gap-3">
          <h1 className="font-black text-xl text-slate-900 flex items-center gap-2">
            <Sparkles className="text-teal-500" size={20} /> Smart POS
          </h1>

          {/* Role Badge */}
          <button onClick={() => setShowRoleModal(true)} className="bg-slate-100 border px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-black">
            <UserCheck size={15} className="text-teal-600" />
            <span className={`px-2 py-0.5 rounded ${ROLES.find(r=>r.id===currentRole)?.color}`}>{ROLES.find(r=>r.id===currentRole)?.label}</span>
          </button>

          {/* Main Navigation Views */}
          <div className="flex bg-slate-100 p-1 rounded-xl border text-xs font-black">
            <button onClick={() => setCurrentView("pos")} className={`px-3 py-1.5 rounded-lg ${currentView === "pos" ? "bg-teal-600 text-white shadow" : "text-slate-600"}`}>
              <Receipt size={14} className="inline mr-1" /> نقطة البيع
            </button>
            <button onClick={() => setCurrentView("kitchen")} className={`px-3 py-1.5 rounded-lg ${currentView === "kitchen" ? "bg-amber-500 text-white shadow" : "text-slate-600"}`}>
              <Flame size={14} className="inline mr-1" /> المطبخ ({kitchenOrders.filter(o=>o.status!=="delivered").length})
            </button>
            <button onClick={() => setCurrentView("dashboard")} className={`px-3 py-1.5 rounded-lg ${currentView === "dashboard" ? "bg-indigo-600 text-white shadow" : "text-slate-600"}`}>
              <LayoutDashboard size={14} className="inline mr-1" /> لوحة التحكم
            </button>
            <button onClick={() => setCurrentView("crm")} className={`px-3 py-1.5 rounded-lg ${currentView === "crm" ? "bg-purple-600 text-white shadow" : "text-slate-600"}`}>
              <Users size={14} className="inline mr-1" /> العملاء CRM
            </button>
            <button onClick={() => setCurrentView("inventory")} className={`px-3 py-1.5 rounded-lg ${currentView === "inventory" ? "bg-slate-900 text-white shadow" : "text-slate-600"}`}>
              <Package size={14} className="inline mr-1" /> المخزون
            </button>
          </div>
        </div>

        {/* Shift & Network Status */}
        <div className="flex items-center gap-3">
          {shiftActive ? (
            <button onClick={() => setShowCloseShiftModal(true)} className="bg-teal-50 border border-teal-200 text-teal-700 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5">
              <Unlock size={14} /> الوردية مفتوحة
            </button>
          ) : (
            <button onClick={() => setShowOpenShiftModal(true)} className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 animate-pulse">
              <Lock size={14} /> فتح الوردية
            </button>
          )}

          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border ${isOnline ? "bg-teal-50 text-teal-700 border-teal-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span>{isOnline ? "أونلاين" : "أوفلاين Sync"}</span>
          </div>
        </div>
      </header>

      {/* VIEW SWITCHER */}
      {currentView === "pos" ? (
        <div className="flex-1 flex min-h-0 relative print:hidden">
          
          {/* Shift Lock Screen Overlay */}
          {!shiftActive && (
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs z-30 flex flex-col items-center justify-center text-white space-y-3">
              <Lock size={40} className="text-rose-400" />
              <h2 className="text-xl font-black">الوردية مغلقة حالياً</h2>
              <button onClick={() => setShowOpenShiftModal(true)} className="bg-teal-600 text-white font-black px-6 py-2 rounded-xl text-sm shadow-lg">فتح وردية جديدة</button>
            </div>
          )}

          {/* Product Grid Area */}
          <main className="flex-1 flex flex-col min-w-0 bg-slate-50 border-l border-slate-200">
            <div className="px-6 py-3 flex items-center justify-between bg-white border-b border-slate-200">
              <div className="flex gap-2 overflow-x-auto">
                {CATEGORIES.map((c) => (
                  <button key={c.id} onClick={() => setActiveCat(c.id)} className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold border transition-all ${activeCat === c.id ? "bg-teal-600 text-white border-teal-600" : "bg-slate-50 text-slate-600"}`}>
                    <c.icon size={15} /> {c.label}
                  </button>
                ))}
              </div>
              <div className="relative w-64">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input id="pos-search-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="بحث... (F2)" className="w-full h-9 bg-slate-100 rounded-full pr-9 pl-3 text-xs outline-none focus:bg-white border focus:border-teal-500" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}>
                {products.filter(p=>p.cat===activeCat && p.name.includes(query)).map((p) => {
                  const isOut = p.stock <= 0;
                  return (
                    <button key={p.id} onClick={() => handleProductClick(p)} disabled={isOut}
                      className={`bg-white rounded-2xl border p-4 flex flex-col items-center text-center relative transition-all ${isOut ? "opacity-40 bg-slate-100" : "hover:shadow-lg border-slate-200"}`}>
                      <span className={`absolute top-2 left-2 text-[10px] font-black px-1.5 py-0.5 rounded-md ${isOut ? "bg-rose-100 text-rose-700" : "bg-teal-50 text-teal-700"}`}>
                        {isOut ? "منتهي" : `المخزن: ${p.stock}`}
                      </span>
                      <div className="text-4xl mb-2 mt-1">{p.emoji}</div>
                      <div className="font-bold text-sm text-slate-800">{p.name}</div>
                      <div className="text-teal-600 font-black text-sm mt-1">{fmt(p.price)} ج.م</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </main>

          {/* Cart & Order Panel */}
          <aside className="w-[400px] shrink-0 bg-white flex flex-col shadow-xl border-r border-slate-200">
            {/* Order Type & Hold Controls */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-400">نوع الطلب (F3)</span>
                <div className="flex items-center gap-2">
                  <button onClick={handleHoldOrder} disabled={cart.length === 0} className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-lg font-black disabled:opacity-30">
                    <PauseCircle size={13} className="inline mr-1" /> تعليق (F8)
                  </button>
                  <button onClick={() => setShowHoldModal(true)} className="bg-slate-200 text-slate-800 text-xs px-2 py-1 rounded-lg font-black">
                    المعلقة ({heldOrders.length})
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1">
                {ORDER_TYPES.map((t) => (
                  <button key={t.id} onClick={() => setOrderType(t.id)} className={`py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1 border ${orderType === t.id ? t.color : "bg-white text-slate-600"}`}>
                    <t.icon size={13} /> {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Customer Search Form */}
            {orderType === "delivery" && (
              <div className="p-3 bg-indigo-50/60 border-b border-indigo-100 space-y-2 text-xs">
                <input value={customerPhoneInput} onChange={(e) => setCustomerPhoneInput(e.target.value)} placeholder="رقم الهاتف (بحث تلقائي)..." className="w-full h-8 border rounded-lg px-2 bg-white outline-none" />
                <input value={customerNameInput} onChange={(e) => setCustomerNameInput(e.target.value)} placeholder="اسم العميل..." className="w-full h-8 border rounded-lg px-2 bg-white outline-none" />
                <input value={customerAddressInput} onChange={(e) => setCustomerAddressInput(e.target.value)} placeholder="العنوان التفصيلي..." className="w-full h-8 border rounded-lg px-2 bg-white outline-none" />
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.map((item) => (
                <div key={item.itemKey} className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-col gap-1.5">
                  <div className="flex justify-between items-start font-bold text-sm text-slate-800">
                    <div>
                      <span>{item.name}</span>
                      {item.sizeName && <span className="text-xs text-slate-500 mr-1">({item.sizeName})</span>}
                    </div>
                    <span>{fmt(item.unitPrice * item.qty)} ج.م</span>
                  </div>
                  {item.selectedMods.length > 0 && (
                    <div className="text-[11px] text-teal-700 flex flex-wrap gap-1">
                      {item.selectedMods.map(m => <span key={m.id} className="bg-teal-50 px-1 rounded">+ {m.name}</span>)}
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                    <span className="text-xs text-slate-400">{fmt(item.unitPrice)} ج.م/قطعة</span>
                    <div className="flex items-center gap-2 bg-white border rounded-lg p-0.5">
                      <button onClick={() => changeQty(item.itemKey, -1)} className="w-5 h-5 bg-slate-100 font-bold text-xs rounded">-</button>
                      <span className="text-xs font-black w-4 text-center">{item.qty}</span>
                      <button onClick={() => changeQty(item.itemKey, 1)} className="w-5 h-5 bg-slate-100 font-bold text-xs rounded">+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals & Checkout Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="space-y-1 text-xs font-semibold text-slate-500">
                <div className="flex justify-between"><span>الفرعي:</span><span>{fmt(subtotal)} ج.م</span></div>
                <div className="flex justify-between"><span>الضريبة (14%):</span><span>{fmt(tax)} ج.م</span></div>
                {orderType === "delivery" && <div className="flex justify-between text-indigo-700"><span>التوصيل:</span><span>{fmt(currentDeliveryFee)} ج.م</span></div>}
                <div className="flex justify-between text-slate-900 font-black text-base pt-1 border-t"><span>الإجمالي:</span><span className="text-teal-600">{fmt(total)} ج.م</span></div>
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-3 gap-1.5">
                <button onClick={() => setPayMethod("cash")} className={`py-1.5 rounded-lg text-xs font-black border ${payMethod === "cash" ? "bg-amber-500 text-white" : "bg-white"}`}>كاش</button>
                <button onClick={() => setPayMethod("card")} className={`py-1.5 rounded-lg text-xs font-black border ${payMethod === "card" ? "bg-indigo-600 text-white" : "bg-white"}`}>فيزا</button>
                <button onClick={() => setPayMethod("debt")} className={`py-1.5 rounded-lg text-xs font-black border ${payMethod === "debt" ? "bg-rose-600 text-white" : "bg-white"}`}>آجل / دين</button>
              </div>

              <button onClick={checkout} disabled={!canCheckout} className="w-full h-11 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2">
                <Printer size={16} /> إتمام البيع والطباعة (F4)
              </button>
            </div>
          </aside>
        </div>
      ) : currentView === "kitchen" ? (
        /* KDS KITCHEN VIEW */
        <div className="flex-1 bg-slate-950 p-6 overflow-x-auto text-white">
          <h2 className="text-xl font-black mb-4">شاشة المطبخ الحية (KDS)</h2>
          <div className="flex gap-4 items-start">
            {kitchenOrders.filter(o=>o.status!=="delivered").map((order) => (
              <div key={order.id} className="w-72 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-black text-lg">#{order.ticketNo}</span>
                  <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-amber-400 font-bold">{fmtTime(order.createdAt)}</span>
                </div>
                <div className="space-y-2 text-xs">
                  {order.items.map((i, idx) => (
                    <div key={idx} className="border-b border-slate-800/60 pb-1">
                      <div className="font-bold text-slate-100 flex justify-between"><span>{i.name}</span><span className="text-amber-400">×{i.qty}</span></div>
                      {i.mods.length > 0 && <div className="text-[10px] text-teal-400">+ {i.mods.join(", ")}</div>}
                    </div>
                  ))}
                </div>
                <button onClick={() => setKitchenOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: "delivered" } : o))}
                  className="w-full py-2 bg-teal-600 text-white font-black text-xs rounded-xl">
                  اكتمال وتسليم
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : currentView === "dashboard" ? (
        /* DASHBOARD & ANALYTICS VIEW */
        <div className="flex-1 bg-slate-100 p-6 overflow-y-auto space-y-6">
          <h2 className="text-2xl font-black text-slate-900">لوحة التحكم والأداء اليومي</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border shadow-sm">
              <span className="text-xs font-bold text-slate-400">المبيعات الإجمالية</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{fmt(totalRevenue)} ج.م</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border shadow-sm">
              <span className="text-xs font-bold text-slate-400">صافي الأرباح (Net Profit)</span>
              <h3 className="text-2xl font-black text-teal-600 mt-1">{fmt(netProfit)} ج.م</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border shadow-sm">
              <span className="text-xs font-bold text-slate-400">عدد الفواتير</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{completedOrders.length}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border shadow-sm">
              <span className="text-xs font-bold text-slate-400">الضرائب (VAT 14%)</span>
              <h3 className="text-2xl font-black text-purple-600 mt-1">{fmt(totalTaxes)} ج.م</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
            <h3 className="font-black text-slate-900">منحنى المبيعات الساعي</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SALES_TIMELINE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="sales" stroke="#0d9488" fill="#0d9488" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : currentView === "inventory" ? (
        /* INVENTORY VIEW */
        <div className="flex-1 bg-slate-100 p-6 overflow-y-auto space-y-4">
          <h2 className="text-2xl font-black text-slate-900">إدارة المخزون والتنبيهات</h2>
          <div className="bg-white rounded-3xl border overflow-hidden">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 border-b p-4">
                <tr><th className="p-4">الصنف</th><th className="p-4">السعر</th><th className="p-4">الكمية بالمخزن</th><th className="p-4">الحالة</th></tr>
              </thead>
              <tbody className="divide-y font-bold">
                {products.map(p => (
                  <tr key={p.id}>
                    <td className="p-4">{p.emoji} {p.name}</td>
                    <td className="p-4">{fmt(p.price)} ج.م</td>
                    <td className="p-4 font-black">{p.stock}</td>
                    <td className="p-4">
                      {p.stock <= 0 ? <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-xs">منتهي</span> : <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-xs">متوفر</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CRM CUSTOMERS VIEW */
        <div className="flex-1 bg-slate-100 p-6 overflow-y-auto space-y-4">
          <h2 className="text-2xl font-black text-slate-900">إدارة العملاء والديون CRM</h2>
          <div className="grid grid-cols-3 gap-4">
            {customers.map(c => (
              <div key={c.id} className="bg-white p-5 rounded-3xl border space-y-2">
                <h3 className="font-black text-slate-900">{c.name} ({c.phone})</h3>
                <div className="grid grid-cols-3 gap-1 text-center text-xs font-bold pt-2">
                  <div className="bg-amber-50 p-2 rounded-xl">النقاط: {c.points}</div>
                  <div className="bg-teal-50 p-2 rounded-xl">المحفظة: {fmt(c.balance)}</div>
                  <div className="bg-rose-50 p-2 rounded-xl text-rose-700">الديون: {fmt(c.debt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODALS SECTION */}
      
      {/* 1. Modifiers & Sizes Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between border-b pb-3 font-black text-slate-900">
              <span className="text-lg">{selectedProduct.emoji} {selectedProduct.name}</span>
              <button onClick={() => setSelectedProduct(null)}><X size={18} /></button>
            </div>
            {selectedProduct.sizes && (
              <div>
                <label className="text-xs font-black text-slate-400 block mb-2">الحجم</label>
                <div className="grid grid-cols-3 gap-2">
                  {selectedProduct.sizes.map(s => (
                    <button key={s.id} onClick={() => setActiveSize(s)} className={`py-2 rounded-xl border text-xs font-bold ${activeSize?.id === s.id ? "border-teal-600 bg-teal-50 text-teal-700" : "border-slate-200"}`}>{s.name}</button>
                  ))}
                </div>
              </div>
            )}
            {selectedProduct.modifiers && (
              <div>
                <label className="text-xs font-black text-slate-400 block mb-2">الإضافات</label>
                <div className="space-y-1.5">
                  {selectedProduct.modifiers.map(m => {
                    const sel = selectedMods.some(x => x.id === m.id);
                    return (
                      <button key={m.id} onClick={() => setSelectedMods(prev => sel ? prev.filter(x => x.id !== m.id) : [...prev, m])} className={`w-full py-2 px-3 border rounded-xl text-xs font-bold flex justify-between ${sel ? "border-teal-600 bg-teal-50 text-teal-700" : ""}`}>
                        <span>{m.name}</span><span>+{m.price} ج.م</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <button onClick={() => addToCartDirect(selectedProduct, activeSize, selectedMods, itemNote)} className="w-full h-11 bg-teal-600 text-white font-black rounded-xl text-sm">
              إضافة للسلة
            </button>
          </div>
        </div>
      )}

      {/* 2. Open / Close Shift Modals */}
      {showOpenShiftModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleOpenShift} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-black text-slate-900 text-base">فتح وردية جديدة</h3>
            <input type="number" required value={startCash} onChange={(e) => setStartCash(e.target.value)} placeholder="عهدّة الكاش المبدئية..." className="w-full h-10 border rounded-xl px-3 text-sm font-black outline-none" />
            <button type="submit" className="w-full h-11 bg-teal-600 text-white font-black rounded-xl text-sm">تأكيد وبدء البيع</button>
          </form>
        </div>
      )}

      {showCloseShiftModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-black text-slate-900 text-base">إغلاق الوردية وحساب الكاش</h3>
            <input type="number" required value={actualEndingCash} onChange={(e) => setActualEndingCash(e.target.value)} placeholder="المبلغ الفعلي بالصندوق..." className="w-full h-10 border rounded-xl px-3 text-sm font-black outline-none bg-amber-50" />
            <button onClick={handleCloseShift} className="w-full h-11 bg-amber-500 text-white font-black rounded-xl text-sm">تأكيد توليد Z-Report</button>
          </div>
        </div>
      )}

      {/* 🧾 THERMAL PRINT CONTAINER */}
      {lastPrintedTicket && (
        <div id="thermal-print-area" className="hidden print:block text-black">
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "bold" }}>مطعم وكافيه سمارت</h2>
            <p style={{ fontSize: "10px" }}>فاتورة #{lastPrintedTicket.ticketNo} - {lastPrintedTicket.time}</p>
            <div style={{ borderBottom: "1px dashed #000", margin: "6px 0" }}></div>
            <table style={{ width: "100%", fontSize: "11px", textAlign: "right" }}>
              <tbody>
                {lastPrintedTicket.cart.map((i, idx) => (
                  <tr key={idx}><td>{i.name} ×{i.qty}</td><td style={{ textAlign: "left" }}>{fmt(i.unitPrice * i.qty)}</td></tr>
                ))}
              </tbody>
            </table>
            <div style={{ borderBottom: "1px dashed #000", margin: "6px 0" }}></div>
            <p style={{ textAlign: "left", fontWeight: "bold", fontSize: "12px" }}>الإجمالي: {fmt(lastPrintedTicket.total)} ج.م</p>
          </div>
        </div>
      )}

    </div>
  );
}
