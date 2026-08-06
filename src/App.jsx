import React, { useState, useEffect } from "react";
import {
  Search, Plus, Minus, Trash2, Banknote, CreditCard, X, Check,
  Coffee, IceCream, Sandwich, UtensilsCrossed, GlassWater,
  Receipt, Sparkles, Bike, ShoppingBag, Utensils, Phone, User,
  Flame, Printer, LayoutDashboard, Users, Package,
  Wifi, WifiOff, TrendingUp, DollarSign, UserCheck, Key, LogOut, MapPin, TrendingDown, FileText, Database, Settings, Shield, PlusCircle, RefreshCw, Image, Layers, ChevronRight, Menu, Tag, ShoppingCart, Eye, Lock, Edit3
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

/* ---------------- 📌 VERSION CONTROL & CACHE BUSTING ---------------- */
const APP_VERSION = "2.9.0"; // تحديث لتفعيل تعديل الأصناف وحشو الأطراف

/* ---------------- 1. INITIAL MASTER DATA ---------------- */
const DEFAULT_RESTAURANT = {
  name: "دريم كورنر - Dream Corner",
  logo: "🍕",
  logoUrl: "",
  address: "البرامون - الدقهلية",
  phone: "01012345678",
  receiptFooter: "شكراً لزيارتكم دريم كورنر! نتمنى لكم وجبة شهية ❤️",
  paperWidth: "80mm",
  autoPrint: true
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

const DEFAULT_CATEGORIES = [
  { id: "البيتزا", label: "البيتزا", emoji: "🍕" },
  { id: "السندوتشات", label: "السندوتشات", emoji: "🥪" },
  { id: "الأصناف الجانبية", label: "الأصناف الجانبية", emoji: "🍟" },
  { id: "المشروبات", label: "المشروبات", emoji: "🥤" },
];

const DEFAULT_DELIVERY_ZONES = [
  { id: 1, name: "البرامون (داخل البلد)", fee: 10 },
  { id: 2, name: "البرامون (بر الترعة)", fee: 20 },
  { id: 3, name: "سرسو البرامون", fee: 30 },
  { id: 4, name: "البدالة", fee: 40 },
  { id: 5, name: "الخيارية", fee: 50 },
  { id: 6, name: "كفر البرامون", fee: 40 },
  { id: 7, name: "كفر بداوي", fee: 50 },
  { id: 8, name: "شربين", fee: 80 }
];

// 📌 المنيو الكامل بالأصناف والأحجام بالكامل
const DEFAULT_PRODUCTS = [
  // --- البيتزا ---
  { id: "p1", cat: "البيتزا", name: "بيتزا مارجريتا", price: 45, emoji: "🍕", stock: 50, sizes: [{ id: "sm", name: "صغير", price: 45 }, { id: "md", name: "وسط", price: 70 }, { id: "lg", name: "كبير", price: 90 }] },
  { id: "p2", cat: "البيتزا", name: "بيتزا ميكس جبنة ⭐", price: 60, emoji: "🧀", stock: 50, sizes: [{ id: "sm", name: "صغير", price: 60 }, { id: "md", name: "وسط", price: 90 }, { id: "lg", name: "كبير", price: 120 }] },
  { id: "p3", cat: "البيتزا", name: "بيتزا خضروات", price: 60, emoji: "🥦", stock: 50, sizes: [{ id: "sm", name: "صغير", price: 60 }, { id: "md", name: "وسط", price: 90 }, { id: "lg", name: "كبير", price: 120 }] },
  { id: "p4", cat: "البيتزا", name: "بيتزا هوت دوج", price: 70, emoji: "🌭", stock: 50, sizes: [{ id: "sm", name: "صغير", price: 70 }, { id: "md", name: "وسط", price: 100 }, { id: "lg", name: "كبير", price: 135 }] },
  { id: "p5", cat: "البيتزا", name: "بيتزا سجق", price: 70, emoji: "🍕", stock: 50, sizes: [{ id: "sm", name: "صغير", price: 70 }, { id: "md", name: "وسط", price: 100 }, { id: "lg", name: "كبير", price: 135 }] },
  { id: "p6", cat: "البيتزا", name: "بيتزا لحمة مفرومة", price: 75, emoji: "🥩", stock: 50, sizes: [{ id: "sm", name: "صغير", price: 75 }, { id: "md", name: "وسط", price: 110 }, { id: "lg", name: "كبير", price: 145 }] },
  { id: "p7", cat: "البيتزا", name: "بيتزا بيروني", price: 70, emoji: "🍕", stock: 50, sizes: [{ id: "sm", name: "صغير", price: 70 }, { id: "md", name: "وسط", price: 90 }, { id: "lg", name: "كبير", price: 110 }] },
  { id: "p8", cat: "البيتزا", name: "بيتزا سلامي", price: 70, emoji: "🍕", stock: 50, sizes: [{ id: "sm", name: "صغير", price: 70 }, { id: "md", name: "وسط", price: 90 }, { id: "lg", name: "كبير", price: 110 }] },
  { id: "p9", cat: "البيتزا", name: "بيتزا شاورما دجاج ⭐", price: 80, emoji: "🍗", stock: 50, sizes: [{ id: "sm", name: "صغير", price: 80 }, { id: "md", name: "وسط", price: 120 }, { id: "lg", name: "كبير", price: 155 }] },
  { id: "p10", cat: "البيتزا", name: "بيتزا دجاج رانش", price: 80, emoji: "🍗", stock: 50, sizes: [{ id: "sm", name: "صغير", price: 80 }, { id: "md", name: "وسط", price: 120 }, { id: "lg", name: "كبير", price: 155 }] },
  { id: "p11", cat: "البيتزا", name: "بيتزا دريم كورنر سبيشال ⭐", price: 90, emoji: "⭐", stock: 50, sizes: [{ id: "sm", name: "صغير", price: 90 }, { id: "md", name: "وسط", price: 130 }, { id: "lg", name: "كبير", price: 170 }] },
  { id: "p12", cat: "البيتزا", name: "بيتزا كرانشي (حار/بارد)", price: 80, emoji: "🌶️", stock: 50, sizes: [{ id: "sm", name: "صغير", price: 80 }, { id: "md", name: "وسط", price: 100 }, { id: "lg", name: "كبير", price: 130 }] },
  { id: "p13", cat: "البيتزا", name: "بيتزا ميكس دجاج", price: 85, emoji: "🍗", stock: 50, sizes: [{ id: "sm", name: "صغير", price: 85 }, { id: "md", name: "وسط", price: 105 }, { id: "lg", name: "كبير", price: 135 }] },

  // --- السندوتشات ---
  { id: "s1", cat: "السندوتشات", name: "كفتة مشوية", price: 65, emoji: "🥙", stock: 50, sizes: [{ id: "md", name: "وسط", price: 65 }, { id: "lg", name: "كبير", price: 75 }] },
  { id: "s2", cat: "السندوتشات", name: "سجق مشوي", price: 60, emoji: "🥙", stock: 50, sizes: [{ id: "md", name: "وسط", price: 60 }, { id: "lg", name: "كبير", price: 70 }] },
  { id: "s3", cat: "السندوتشات", name: "كبدة إسكندراني", price: 65, emoji: "🥙", stock: 50, sizes: [{ id: "md", name: "وسط", price: 65 }, { id: "lg", name: "كبير", price: 75 }] },
  { id: "s4", cat: "السندوتشات", name: "ميكس لحوم (سجق+كبدة)", price: 65, emoji: "🥙", stock: 50, sizes: [{ id: "md", name: "وسط", price: 65 }, { id: "lg", name: "كبير", price: 75 }] },
  { id: "s5", cat: "السندوتشات", name: "حواوشي دبل طعم", price: 45, emoji: "🫓", stock: 50 },
  { id: "s6", cat: "السندوتشات", name: "تشكن بانية", price: 70, emoji: "🥪", stock: 50, sizes: [{ id: "md", name: "وسط", price: 70 }, { id: "lg", name: "كبير", price: 85 }] },
  { id: "s7", cat: "السندوتشات", name: "زنجر سوبريم ⭐", price: 80, emoji: "🌶️", stock: 50, sizes: [{ id: "md", name: "وسط", price: 80 }, { id: "lg", name: "كبير", price: 95 }] },
  { id: "s8", cat: "السندوتشات", name: "سوبر كرانشي", price: 80, emoji: "🥪", stock: 50, sizes: [{ id: "md", name: "وسط", price: 80 }, { id: "lg", name: "كبير", price: 95 }] },
  { id: "s9", cat: "السندوتشات", name: "شيش طاووق", price: 75, emoji: "🍢", stock: 50, sizes: [{ id: "md", name: "وسط", price: 75 }, { id: "lg", name: "كبير", price: 90 }] },
  { id: "s10", cat: "السندوتشات", name: "تشكن رانش", price: 75, emoji: "🥪", stock: 50, sizes: [{ id: "md", name: "وسط", price: 75 }, { id: "lg", name: "كبير", price: 90 }] },
  { id: "s11", cat: "السندوتشات", name: "كلاسيك برجر", price: 55, emoji: "🍔", stock: 50, sizes: [{ id: "md", name: "وسط", price: 55 }, { id: "lg", name: "كبير", price: 65 }] },
  { id: "s12", cat: "السندوتشات", name: "تشيز برجر ليدر", price: 65, emoji: "🍔", stock: 50, sizes: [{ id: "md", name: "وسط", price: 65 }, { id: "lg", name: "كبير", price: 75 }] },
  { id: "s13", cat: "السندوتشات", name: "تشكن برجر مقرمش", price: 50, emoji: "🍔", stock: 50, sizes: [{ id: "md", name: "وسط", price: 50 }, { id: "lg", name: "كبير", price: 65 }] },
  { id: "s14", cat: "السندوتشات", name: "ميكس توست جبن", price: 60, emoji: "🥪", stock: 50 },

  // --- الأصناف الجانبية والمشروبات ---
  { id: "sd1", cat: "الأصناف الجانبية", name: "بطاطس مقلية ذهبية", price: 35, emoji: "🍟", stock: 100 },
  { id: "sd2", cat: "الأصناف الجانبية", name: "بطاطس بالجبنة الشيدر", price: 45, emoji: "🍟", stock: 100 },
  { id: "sd3", cat: "الأصناف الجانبية", name: "صوص رانش هوم ميد", price: 10, emoji: "🥣", stock: 200 },
  { id: "d1", cat: "المشروبات", name: "بيبسي كانز", price: 15, emoji: "🥤", stock: 100 },
  { id: "d2", cat: "المشروبات", name: "سفن أب كانز", price: 15, emoji: "🥤", stock: 100 },
  { id: "d3", cat: "المشروبات", name: "ميرندا برتقال كانز", price: 15, emoji: "🥤", stock: 100 },
  { id: "d4", cat: "المشروبات", name: "مياة معدنية صغيرة", price: 6, emoji: "🍾", stock: 200 }
];

const SALES_CHART_TIMELINE = [
  { time: "10 ص", sales: 120 }, { time: "12 ظ", sales: 450 },
  { time: "02 م", sales: 890 }, { time: "04 م", sales: 600 },
  { time: "06 م", sales: 1200 }, { time: "08 م", sales: 2100 }, { time: "10 م", sales: 1800 },
];

const fmt = (n) => n.toLocaleString("ar-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function SmartPOSApp() {
  // ⚡ فحص وتحديث الكاش التلقائي
  useEffect(() => {
    const savedVersion = localStorage.getItem("pos_app_version");
    if (savedVersion !== APP_VERSION) {
      localStorage.setItem("pos_app_version", APP_VERSION);
      localStorage.setItem("pos_products_v29", JSON.stringify(DEFAULT_PRODUCTS));
      localStorage.setItem("pos_delivery_zones_v29", JSON.stringify(DEFAULT_DELIVERY_ZONES));
      localStorage.setItem("pos_categories_v29", JSON.stringify(DEFAULT_CATEGORIES));
    }
  }, []);

  const [restaurantInfo, setRestaurantInfo] = useState(() => JSON.parse(localStorage.getItem("pos_restaurant") || JSON.stringify(DEFAULT_RESTAURANT)));
  const [usersDb, setUsersDb] = useState(() => JSON.parse(localStorage.getItem("pos_users") || JSON.stringify(DEFAULT_USERS_DB)));
  const [categories, setCategories] = useState(() => JSON.parse(localStorage.getItem("pos_categories_v29") || JSON.stringify(DEFAULT_CATEGORIES)));
  const [products, setProducts] = useState(() => JSON.parse(localStorage.getItem("pos_products_v29") || JSON.stringify(DEFAULT_PRODUCTS)));
  const [completedOrders, setCompletedOrders] = useState(() => JSON.parse(localStorage.getItem("pos_orders") || "[]"));
  const [deliveryZones, setDeliveryZones] = useState(() => JSON.parse(localStorage.getItem("pos_delivery_zones_v29") || JSON.stringify(DEFAULT_DELIVERY_ZONES)));

  useEffect(() => { localStorage.setItem("pos_restaurant", JSON.stringify(restaurantInfo)); }, [restaurantInfo]);
  useEffect(() => { localStorage.setItem("pos_users", JSON.stringify(usersDb)); }, [usersDb]);
  useEffect(() => { localStorage.setItem("pos_categories_v29", JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem("pos_products_v29", JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem("pos_orders", JSON.stringify(completedOrders)); }, [completedOrders]);
  useEffect(() => { localStorage.setItem("pos_delivery_zones_v29", JSON.stringify(deliveryZones)); }, [deliveryZones]);

  // Auth & UI States
  const [currentUser, setCurrentUser] = useState(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");

  const [currentView, setCurrentView] = useState("pos");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileCartDrawerOpen, setMobileCartDrawerOpen] = useState(false);

  // Cart & Orders
  const [cart, setCart] = useState([]);
  const [activeCat, setActiveCat] = useState("البيتزا");
  const [query, setQuery] = useState("");
  const [orderType, setOrderType] = useState("takeaway");
  
  const [selectedZone, setSelectedDeliveryZone] = useState(deliveryZones[0] || DEFAULT_DELIVERY_ZONES[0]);
  const [customerPhoneInput, setCustomerPhoneInput] = useState("");
  const [customerNameInput, setCustomerNameInput] = useState("");
  const [customerAddressInput, setCustomerAddressInput] = useState("");

  // Modals States
  const [selectedProductModal, setSelectedProductModal] = useState(null);
  const [activeSize, setActiveSize] = useState(null);
  
  // 🧀 خيار حشو الأطراف
  const [stuffedCrust, setStuffedCrust] = useState(false);

  // ✏️ تعديل صنف
  const [editProductModal, setEditProductModal] = useState(null);

  const [viewInvoiceModal, setViewInvoiceModal] = useState(null);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [shiftClosedReport, setShiftClosedReport] = useState(null);

  const [restockProduct, setRestockProduct] = useState(null);
  const [restockQty, setRestockQty] = useState("");
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("🍽️");

  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("");
  const [newProdCat, setNewProdCat] = useState("البيتزا");
  const [newProdImage, setNewProdImage] = useState("");

  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneFee, setNewZoneFee] = useState("");

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newURealName, setNewURealName] = useState("");
  const [newUName, setNewUName] = useState("");
  const [newUPass, setNewUPass] = useState("");
  const [newURole, setNewURole] = useState("cashier");

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

  const totalCartQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const deliveryFeeCalculated = orderType === "delivery" ? Number(selectedZone?.fee || 0) : 0;
  const total = subtotal + deliveryFeeCalculated;

  const handleProductClick = (p) => {
    if (p.stock <= 0) return;
    if (p.sizes && p.sizes.length > 0) {
      setSelectedProductModal(p);
      setActiveSize(p.sizes[0]);
      setStuffedCrust(false);
    } else {
      addToCartDirect(p, null, false);
    }
  };

  // 📌 إضافة صنف للسلة مع الأحجام وحشو الأطراف
  const addToCartDirect = (p, size, isStuffed) => {
    let crustPrice = 0;
    let crustLabel = "";

    if (p.cat === "البيتزا" && isStuffed) {
      const sizeId = size ? size.id : "sm";
      crustPrice = sizeId === "sm" ? 25 : sizeId === "md" ? 30 : 35;
      crustLabel = ` + حشو اطراف (+${crustPrice}ج)`;
    }

    const baseUnitPrice = size && size.price ? size.price : p.price;
    const finalUnitPrice = baseUnitPrice + crustPrice;
    const itemKey = `${p.id}-${size ? size.id : "def"}-${isStuffed ? "stuffed" : "normal"}`;

    setCart((prev) => {
      const existing = prev.find((i) => i.itemKey === itemKey);
      if (existing) return prev.map((i) => (i.itemKey === itemKey ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, {
        itemKey, id: p.id, name: `${p.name}${crustLabel}`, emoji: p.emoji, imageUrl: p.imageUrl,
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

    setProducts((prev) => prev.map((prod) => {
      const cartItem = cart.find((i) => i.id === prod.id);
      return cartItem ? { ...prod, stock: Math.max(0, prod.stock - cartItem.qty) } : prod;
    }));

    setCart([]);
    setCustomerNameInput(""); setCustomerPhoneInput(""); setCustomerAddressInput("");
    setMobileCartDrawerOpen(false);
  };

  // ✏️ حفظ تعديل الصنف من شاشة المخزون
  const handleSaveProductEdit = (e) => {
    e.preventDefault();
    if (!editProductModal) return;
    setProducts((prev) => prev.map((p) => p.id === editProductModal.id ? editProductModal : p));
    setEditProductModal(null);
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
            <p className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block">
              v{APP_VERSION} Full Edition
            </p>
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
    <div dir="rtl" className="h-screen w-full bg-slate-50 flex font-sans select-none overflow-hidden text-slate-800 relative">
      
      {/* HEADER FOR MOBILE TOGGLE */}
      <header className="lg:hidden h-14 bg-slate-900 text-white px-4 flex items-center justify-between z-20 shrink-0 w-full fixed top-0 inset-x-0">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 text-slate-300 hover:text-white">
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-xs text-white">{restaurantInfo.name}</span>
          <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-mono font-bold">v{APP_VERSION}</span>
        </div>
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs">{currentUser.name[0]}</div>
      </header>

      {/* SIDEBAR */}
      <aside className={`
        fixed lg:static inset-y-0 right-0 bg-slate-900 text-slate-300 min-h-screen flex flex-col justify-between transition-transform duration-300 z-40 shrink-0
        ${sidebarOpen ? "translate-x-0 w-64 shadow-2xl" : "translate-x-full lg:translate-x-0 lg:w-20"}
      `}>
        <div className="p-4 space-y-6 pt-16 lg:pt-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden">
                {restaurantInfo.logoUrl ? <img src={restaurantInfo.logoUrl} alt="Logo" className="w-full h-full object-cover" /> : restaurantInfo.logo}
              </div>
              <div className="truncate">
                <h1 className="font-extrabold text-white text-sm truncate">{restaurantInfo.name}</h1>
                <p className="text-[10px] text-emerald-400 font-bold truncate">محدث v{APP_VERSION}</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 p-1">
              <X size={18} />
            </button>
          </div>

          <nav className="space-y-1.5 font-bold text-xs">
            {permissions.canViewDashboard && (
              <button onClick={() => { setCurrentView("dashboard"); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${currentView === "dashboard" ? "bg-indigo-600 text-white shadow-md" : "hover:bg-slate-800 text-slate-400"}`}>
                <LayoutDashboard size={18} /> <span>لوحة التحكم</span>
              </button>
            )}

            <button onClick={() => { setCurrentView("pos"); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${currentView === "pos" ? "bg-indigo-600 text-white shadow-md" : "hover:bg-slate-800 text-slate-400"}`}>
              <Receipt size={18} /> <span>نقطة البيع (POS)</span>
            </button>

            {permissions.canManageInvoices && (
              <button onClick={() => { setCurrentView("invoices"); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${currentView === "invoices" ? "bg-indigo-600 text-white shadow-md" : "hover:bg-slate-800 text-slate-400"}`}>
                <FileText size={18} /> <span>سجل الفواتير ({completedOrders.length})</span>
              </button>
            )}

            {permissions.canInventory && (
              <button onClick={() => { setCurrentView("inventory"); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${currentView === "inventory" ? "bg-indigo-600 text-white shadow-md" : "hover:bg-slate-800 text-slate-400"}`}>
                <Package size={18} /> <span>المخزون والمنتجات</span>
              </button>
            )}

            {permissions.canSettings && (
              <button onClick={() => { setCurrentView("settings"); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${currentView === "settings" ? "bg-indigo-600 text-white shadow-md" : "hover:bg-slate-800 text-slate-400"}`}>
                <Settings size={18} /> <span>إعدادات النظام</span>
              </button>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="truncate">
            <p className="text-xs font-black text-white truncate">{currentUser.name}</p>
            <p className="text-[10px] text-indigo-400 font-bold">{currentUser.roleLabel}</p>
          </div>
          <button onClick={handleLogout} title="تسجيل الخروج" className="p-2 text-rose-400 hover:bg-slate-800 rounded-xl">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* OVERLAY FOR MOBILE SIDEBAR */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs lg:hidden z-30"></div>}

      {/* MAIN VIEW AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pt-14 lg:pt-0 relative">
        
        {/* DASHBOARD VIEW */}
        {currentView === "dashboard" && (
          <div className="flex-1 bg-slate-50 p-4 sm:p-6 overflow-y-auto space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">لوحة التحكم والمؤشرات المالية</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border shadow-xs"><p className="text-xs font-semibold text-slate-400">إجمالي المبيعات المحصلة</p><h3 className="text-2xl font-black text-slate-900 mt-1">{fmt(completedOrders.reduce((a,b)=>a+b.total, 0))} ج.م</h3></div>
              <div className="bg-white p-5 rounded-2xl border shadow-xs"><p className="text-xs font-semibold text-slate-400">عدد الفواتير</p><h3 className="text-2xl font-black text-indigo-600 mt-1">{completedOrders.length} فاتورة</h3></div>
            </div>
          </div>
        )}

        {/* POS VIEW */}
        {currentView === "pos" && (
          <div className="flex-1 flex flex-col md:flex-row min-h-0 relative pb-16 md:pb-0">
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50 border-l">
              
              <div className="sticky top-0 z-10 px-4 sm:px-6 py-3 flex flex-wrap justify-between bg-white border-b items-center gap-2 shadow-xs">
                <div className="flex gap-1.5 overflow-x-auto items-center w-full sm:w-auto">
                  {categories.map((c) => (
                    <button key={c.id} onClick={() => setActiveCat(c.id)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${activeCat === c.id ? "bg-indigo-600 text-white" : "bg-slate-50"}`}>
                      <span>{c.emoji || "🍽️"}</span> {c.label}
                    </button>
                  ))}
                </div>

                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="بحث صنف..." className="h-8 bg-slate-100 rounded-xl px-3 text-xs outline-none w-full sm:w-48" />
              </div>

              {/* Grid Products */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="grid gap-3 sm:gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}>
                  {products.filter(p=>p.cat===activeCat && p.name.includes(query)).map((p) => (
                    <button key={p.id} onClick={() => handleProductClick(p)} disabled={p.stock <= 0} className={`bg-white rounded-2xl border p-2.5 flex flex-col items-center text-center relative hover:shadow-md transition-all ${p.stock <= 0 ? "opacity-50" : ""}`}>
                      <span className={`absolute top-1.5 left-1.5 text-[9px] font-black px-1.5 py-0.5 rounded ${p.stock <= 0 ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-400"}`}>
                        {p.stock <= 0 ? "نفذت" : p.stock}
                      </span>
                      
                      <div className="w-10 h-10 my-1 flex items-center justify-center text-2xl overflow-hidden rounded-xl bg-slate-50">
                        {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : (p.emoji || "📦")}
                      </div>

                      <div className="font-bold text-xs text-slate-800 leading-snug">{p.name}</div>
                      <div className="text-indigo-600 font-black text-xs mt-1">
                        {p.sizes ? `${p.sizes[0].price} ج.م` : `${fmt(p.price)} ج.م`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CART PANEL FOR DESKTOP */}
            <aside className="hidden md:flex w-[340px] shrink-0 bg-white flex-col border-r shadow-xl">
              <div className="p-3 border-b bg-slate-50 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black">فاتورة جديد #{currentTicketNo}</span>
                  {cart.length > 0 && <button onClick={() => setCart([])} className="text-xs text-rose-600 font-bold">تصفير</button>}
                </div>
                
                <div className="grid grid-cols-3 gap-1 bg-slate-200 p-1 rounded-xl">
                  {["takeaway", "delivery", "dinein"].map((t) => (
                    <button key={t} onClick={() => setOrderType(t)} className={`py-1.5 rounded-lg text-xs font-black ${orderType === t ? "bg-indigo-600 text-white" : "text-slate-600"}`}>
                      {t === "takeaway" ? "تيك أواي" : t === "delivery" ? "دليفري" : "صالة"}
                    </button>
                  ))}
                </div>

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

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {cart.map((item) => (
                  <div key={item.itemKey} className="bg-slate-50 rounded-xl p-2 border flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-xs">{item.name} {item.sizeName && <span className="text-indigo-600">({item.sizeName})</span>}</h4>
                      <span className="text-[11px] text-slate-400">{fmt(item.unitPrice)} ج.م × {item.qty}</span>
                    </div>
                    <span className="font-black text-xs">{fmt(item.unitPrice * item.qty)} ج.م</span>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t bg-slate-50 space-y-2">
                <div className="space-y-1 text-xs font-semibold">
                  <div className="flex justify-between"><span>الفرعي:</span><span>{fmt(subtotal)} ج.م</span></div>
                  {orderType === "delivery" && <div className="flex justify-between text-indigo-700 font-bold"><span>خدمة توصيل ({selectedZone?.name}):</span><span>{fmt(deliveryFeeCalculated)} ج.م</span></div>}
                  <div className="flex justify-between font-black text-sm pt-1 border-t"><span>الإجمالي:</span><span className="text-indigo-600">{fmt(total)} ج.م</span></div>
                </div>
                <button onClick={checkout} disabled={cart.length === 0} className="w-full h-10 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-md">إتمام البيع والطباعة</button>
              </div>
            </aside>

            {/* FLOATING MOBILE CART BOTTOM BAR */}
            <div className="md:hidden fixed bottom-0 inset-x-0 bg-slate-900 text-white p-3 flex justify-between items-center z-30 shadow-2xl border-t border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">إجمالي السلة ({totalCartQty} صنف)</span>
                <span className="font-black text-emerald-400 text-base">{fmt(total)} ج.م</span>
              </div>
              <button onClick={() => setMobileCartDrawerOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg">
                <ShoppingCart size={16} /> عرض الفاتورة والإنهاء
              </button>
            </div>
          </div>
        )}

        {/* INVOICES HUB */}
        {currentView === "invoices" && (
          <div className="flex-1 bg-slate-50 p-4 sm:p-6 overflow-y-auto space-y-6">
            <h2 className="text-xl font-black text-slate-900">سجل الفواتير المنفذة والمحفوظة ({completedOrders.length})</h2>
            <div className="bg-white rounded-2xl border shadow-xs overflow-x-auto">
              <table className="w-full text-right text-xs min-w-[500px]">
                <thead className="bg-slate-50 border-b font-black text-slate-600">
                  <tr><th className="p-3">رقم الفاتورة</th><th className="p-3">التاريخ والوقت</th><th className="p-3">النوع</th><th className="p-3">الكاشير</th><th className="p-3">الإجمالي</th></tr>
                </thead>
                <tbody className="divide-y font-bold">
                  {completedOrders.map((o) => (
                    <tr key={o.id}>
                      <td className="p-3 font-mono font-black text-indigo-600">#{o.ticketNo}</td>
                      <td className="p-3 text-slate-500">{o.date} - {o.time}</td>
                      <td className="p-3">{o.orderType}</td>
                      <td className="p-3">{o.cashier}</td>
                      <td className="p-3 font-black text-emerald-600">{fmt(o.total)} ج.م</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 📦 INVENTORY VIEW WITH EDIT PRODUCT */}
        {currentView === "inventory" && (
          <div className="flex-1 bg-slate-50 p-4 sm:p-6 overflow-y-auto space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">إدارة المخزون والمنتجات والأقسام</h2>
              <div className="flex gap-2">
                <button onClick={() => setShowAddCategoryModal(true)} className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1">
                  <Tag size={14} /> قسم جديد
                </button>
                <button onClick={() => setShowAddProductModal(true)} className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1">
                  <Plus size={14} /> صنف جديد
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-xs overflow-x-auto">
              <table className="w-full text-right text-xs min-w-[550px]">
                <thead className="bg-slate-50 border-b font-black text-slate-600">
                  <tr><th className="p-3">الصنف والصورة</th><th className="p-3">القسم</th><th className="p-3">السعر</th><th className="p-3">المخزن</th><th className="p-3 text-center">إجراءات التحكم</th></tr>
                </thead>
                <tbody className="divide-y font-bold">
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td className="p-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                          {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : (p.emoji || "📦")}
                        </div>
                        <span>{p.name}</span>
                      </td>
                      <td className="p-3 text-indigo-600">{p.cat}</td>
                      <td className="p-3">{fmt(p.price)} ج.م</td>
                      <td className="p-3 font-black">{p.stock} قطعة</td>
                      <td className="p-3 text-center space-x-1.5 space-x-reverse">
                        {/* 📌 زر تعديل الصنف */}
                        <button onClick={() => setEditProductModal(p)} className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl font-bold">
                          ✏️ تعديل
                        </button>
                        <button onClick={() => setRestockProduct(p)} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-bold">
                          + تزويد
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
          <div className="flex-1 bg-slate-50 p-4 sm:p-6 overflow-y-auto space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">إعدادات المطعم والنظام</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="bg-white p-5 rounded-3xl border shadow-xs space-y-3 text-xs">
                <h3 className="font-extrabold text-sm text-slate-900 border-b pb-2 flex items-center gap-2">
                  <Settings size={16} className="text-indigo-600" /> بيانات المطعم والتواصل
                </h3>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">اسم المطعم</label>
                  <input type="text" value={restaurantInfo.name} onChange={(e) => setRestaurantInfo({ ...restaurantInfo, name: e.target.value })} className="w-full h-9 border rounded-xl px-3 font-bold outline-none" />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">رابط صورة اللوجو (Logo URL)</label>
                  <input type="text" value={restaurantInfo.logoUrl} onChange={(e) => setRestaurantInfo({ ...restaurantInfo, logoUrl: e.target.value })} placeholder="https://example.com/logo.png" className="w-full h-9 border rounded-xl px-3 font-bold outline-none" />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">العنوان التفصيلي</label>
                  <input type="text" value={restaurantInfo.address} onChange={(e) => setRestaurantInfo({ ...restaurantInfo, address: e.target.value })} className="w-full h-9 border rounded-xl px-3 font-bold outline-none" />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">رقم الهاتف للتواصل</label>
                  <input type="text" value={restaurantInfo.phone} onChange={(e) => setRestaurantInfo({ ...restaurantInfo, phone: e.target.value })} className="w-full h-9 border rounded-xl px-3 font-bold outline-none" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border shadow-xs space-y-3 text-xs">
                <h3 className="font-extrabold text-sm text-slate-900 border-b pb-2 flex items-center gap-2">
                  <Printer size={16} className="text-indigo-600" /> إعدادات طباعة الفواتير
                </h3>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">عرض ورق الطابعة Thermal Paper</label>
                  <select value={restaurantInfo.paperWidth} onChange={(e) => setRestaurantInfo({ ...restaurantInfo, paperWidth: e.target.value })} className="w-full h-9 border rounded-xl px-3 font-bold outline-none bg-white">
                    <option value="80mm">80mm (طابعة الكاشير القياسية)</option>
                    <option value="58mm">58mm (طابعة المحمول الصغيرة)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">تذييل ورسالة الترحيب أسفل الفاتورة</label>
                  <input type="text" value={restaurantInfo.receiptFooter} onChange={(e) => setRestaurantInfo({ ...restaurantInfo, receiptFooter: e.target.value })} className="w-full h-9 border rounded-xl px-3 font-bold outline-none" />
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* 📌 MODAL: اختيار الأحجام وخيار حشو الأطراف مع البيتزا */}
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
                      <div className="text-[11px] text-indigo-600 font-bold">{s.price} ج.م</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 🧀 خيار إضافة حشو الأطراف عند اختيار أي بيتزا */}
            {selectedProductModal.cat === "البيتزا" && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <label className="flex items-center gap-2 font-bold text-amber-900 text-xs cursor-pointer">
                  <input type="checkbox" checked={stuffedCrust} onChange={(e) => setStuffedCrust(e.target.checked)} className="rounded text-amber-600" />
                  <span>إضافة حشو أطراف بالجبنة 🧀</span>
                </label>
                <p className="text-[10px] text-amber-700 mt-1 font-semibold">
                  (صغير: +25ج | وسط: +30ج | كبير: +35ج)
                </p>
              </div>
            )}

            <button onClick={() => addToCartDirect(selectedProductModal, activeSize, stuffedCrust)} className="w-full h-11 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-lg">
              تأكيد وإضافة للسلة
            </button>
          </div>
        </div>
      )}

      {/* 📌 MODAL: تعديل صنف من المخزون */}
      {editProductModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSaveProductEdit} className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 font-black text-slate-900">
              <span>تعديل بيانات الصنف</span>
              <button type="button" onClick={() => setEditProductModal(null)}><X size={18} /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">اسم الصنف</label>
                <input type="text" required value={editProductModal.name} onChange={(e) => setEditProductModal({ ...editProductModal, name: e.target.value })} className="w-full h-9 border rounded-xl px-3 font-bold outline-none" />
              </div>
              <div>
                <label className="font-bold text-slate-600 block mb-1">السعر الأساسي (ج.م)</label>
                <input type="number" required value={editProductModal.price} onChange={(e) => setEditProductModal({ ...editProductModal, price: Number(e.target.value) })} className="w-full h-9 border rounded-xl px-3 font-bold outline-none" />
              </div>
              <div>
                <label className="font-bold text-slate-600 block mb-1">الكمية بالمخزن</label>
                <input type="number" required value={editProductModal.stock} onChange={(e) => setEditProductModal({ ...editProductModal, stock: Number(e.target.value) })} className="w-full h-9 border rounded-xl px-3 font-bold outline-none" />
              </div>
            </div>
            <button type="submit" className="w-full h-10 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-md">حفظ التعديلات</button>
          </form>
        </div>
      )}

    </div>
  );
}
