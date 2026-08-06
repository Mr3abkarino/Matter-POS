import React, { useState, useEffect } from "react";
import {
  Search, Plus, Minus, Trash2, Banknote, CreditCard, X, Check,
  Coffee, IceCream, Sandwich, UtensilsCrossed, GlassWater,
  Receipt, Sparkles, Bike, ShoppingBag, Utensils, Phone, User,
  Flame, Printer, LayoutDashboard, Users, Package,
  Wifi, WifiOff, TrendingUp, DollarSign, UserCheck, Key, LogOut, MapPin, TrendingDown, FileText, Database, Settings, Shield, PlusCircle, RefreshCw, Image, Layers, ChevronRight, Menu, Tag, ShoppingCart, Eye, Lock, Edit3, Calendar, RotateCcw, Award
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

/* ---------------- 📌 VERSION CONTROL & ENTERPRISE ENGINE ---------------- */
const APP_VERSION = "4.0.0"; // تحديث شامل: تقارير زمنية، جرد خزينة، إدارة عملاء، وتعديل الأحجام

/* ---------------- 1. INITIAL MASTER DATA ---------------- */
const DEFAULT_RESTAURANT = {
  name: "دريم كورنر - Dream Corner",
  logo: "🍕",
  logoUrl: "",
  address: "البرامون - الدقهلية",
  phone: "01012345678",
  printerName: "POS-80 Thermal Printer",
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

const DEFAULT_CUSTOMERS = [
  { id: 1, name: "محمد مطر", phone: "01012345678", address: "البرامون - شارع البحر", points: 150, debt: 0.0 },
  { id: 2, name: "أحمد علي", phone: "01122334455", address: "سرسو البرامون", points: 45, debt: 80.0 },
];

const DEFAULT_PRODUCTS = [
  { id: "p1", cat: "البيتزا", name: "بيتزا مارجريتا", price: 45, emoji: "🍕", stock: 50, sizes: [{ id: "sm", name: "صغير", price: 45 }, { id: "md", name: "وسط", price: 70 }, { id: "lg", name: "كبير", price: 90 }] },
  { id: "p2", cat: "البيتزا", name: "بيتزا ميكس جبنة ⭐", price: 60, emoji: "🧀", stock: 50, sizes: [{ id: "sm", name: "صغير", price: 60 }, { id: "md", name: "وسط", price: 90 }, { id: "lg", name: "كبير", price: 120 }] },
  { id: "p3", cat: "البيتزا", name: "بيتزا خضروات", price: 60, emoji: "🥦", stock: 50, sizes: [{ id: "sm", name: "صغير", price: 60 }, { id: "md", name: "وسط", price: 90 }, { id: "lg", name: "كبير", price: 120 }] },
  { id: "p4", cat: "البيتزا", name: "بيتزا هوت دوج", price: 70, emoji: "🌭", stock: 50, sizes: [{ id: "sm", name: "صغير", price: 70 }, { id: "md", name: "وسط", price: 100 }, { id: "lg", name: "كبير", price: 135 }] },
  { id: "p5", cat: "البيتزا", name: "بيتزا سجق", price: 70, emoji: "🍕", stock: 50, sizes: [{ id: "sm", name: "صغير", price: 70 }, { id: "md", name: "وسط", price: 100 }, { id: "lg", name: "كبير", price: 135 }] },
  { id: "p6", cat: "البيتزا", name: "بيتزا لحمة مفرومة", price: 75, emoji: "🥩", stock: 50, sizes: [{ id: "sm", name: "صغير", price: 75 }, { id: "md", name: "وسط", price: 110 }, { id: "lg", name: "كبير", price: 145 }] },
  { id: "p9", cat: "البيتزا", name: "بيتزا شاورما دجاج ⭐", price: 80, emoji: "🍗", stock: 50, sizes: [{ id: "sm", name: "صغير", price: 80 }, { id: "md", name: "وسط", price: 120 }, { id: "lg", name: "كبير", price: 155 }] },
  { id: "s1", cat: "السندوتشات", name: "كفتة مشوية", price: 65, emoji: "🥙", stock: 50, sizes: [{ id: "md", name: "وسط", price: 65 }, { id: "lg", name: "كبير", price: 75 }] },
  { id: "s7", cat: "السندوتشات", name: "زنجر سوبريم ⭐", price: 80, emoji: "🌶️", stock: 50, sizes: [{ id: "md", name: "وسط", price: 80 }, { id: "lg", name: "كبير", price: 95 }] },
  { id: "sd1", cat: "الأصناف الجانبية", name: "بطاطس مقلية ذهبية", price: 35, emoji: "🍟", stock: 100 },
  { id: "d1", cat: "المشروبات", name: "بيبسي كانز", price: 15, emoji: "🥤", stock: 100 }
];

const fmt = (n) => n.toLocaleString("ar-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function SmartPOSApp() {
  // ⚡ 1. فحص النسخة والتحديث الإجباري عند نزول نسخة جديدة فقط
  useEffect(() => {
    const savedVersion = localStorage.getItem("pos_app_version");
    if (savedVersion !== APP_VERSION) {
      localStorage.setItem("pos_app_version", APP_VERSION);
      localStorage.setItem("pos_products_v40", JSON.stringify(DEFAULT_PRODUCTS));
      localStorage.setItem("pos_delivery_zones_v40", JSON.stringify(DEFAULT_DELIVERY_ZONES));
      localStorage.setItem("pos_categories_v40", JSON.stringify(DEFAULT_CATEGORIES));
      localStorage.setItem("pos_customers_v40", JSON.stringify(DEFAULT_CUSTOMERS));
    }
  }, []);

  // 🔒 2. استرجاع الجلسة المحفوظة تلقائياً عند الـ Refresh
  const [currentUser, setCurrentUser] = useState(() => {
    const sessionUser = localStorage.getItem("pos_session_user");
    return sessionUser ? JSON.parse(sessionUser) : null;
  });

  const [restaurantInfo, setRestaurantInfo] = useState(() => JSON.parse(localStorage.getItem("pos_restaurant") || JSON.stringify(DEFAULT_RESTAURANT)));
  const [usersDb, setUsersDb] = useState(() => JSON.parse(localStorage.getItem("pos_users") || JSON.stringify(DEFAULT_USERS_DB)));
  const [categories, setCategories] = useState(() => JSON.parse(localStorage.getItem("pos_categories_v40") || JSON.stringify(DEFAULT_CATEGORIES)));
  const [products, setProducts] = useState(() => JSON.parse(localStorage.getItem("pos_products_v40") || JSON.stringify(DEFAULT_PRODUCTS)));
  const [completedOrders, setCompletedOrders] = useState(() => JSON.parse(localStorage.getItem("pos_orders") || "[]"));
  const [deliveryZones, setDeliveryZones] = useState(() => JSON.parse(localStorage.getItem("pos_delivery_zones_v40") || JSON.stringify(DEFAULT_DELIVERY_ZONES)));
  const [customers, setCustomers] = useState(() => JSON.parse(localStorage.getItem("pos_customers_v40") || JSON.stringify(DEFAULT_CUSTOMERS)));

  useEffect(() => { localStorage.setItem("pos_restaurant", JSON.stringify(restaurantInfo)); }, [restaurantInfo]);
  useEffect(() => { localStorage.setItem("pos_users", JSON.stringify(usersDb)); }, [usersDb]);
  useEffect(() => { localStorage.setItem("pos_categories_v40", JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem("pos_products_v40", JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem("pos_orders", JSON.stringify(completedOrders)); }, [completedOrders]);
  useEffect(() => { localStorage.setItem("pos_delivery_zones_v40", JSON.stringify(deliveryZones)); }, [deliveryZones]);
  useEffect(() => { localStorage.setItem("pos_customers_v40", JSON.stringify(customers)); }, [customers]);

  // Auth & UI States
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");

  const [currentView, setCurrentView] = useState("pos"); // pos, dashboard, invoices, inventory, crm, settings, reports
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileCartDrawerOpen, setMobileCartDrawerOpen] = useState(false);

  // Cart & Orders
  const [cart, setCart] = useState([]);
  const [editingOrderId, setEditingOrderId] = useState(null); // معرف الفاتورة الجاري تعديلها
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
  const [stuffedCrust, setStuffedCrust] = useState(false);

  // Modals التحكم
  const [editProductModal, setEditProductModal] = useState(null);
  const [viewInvoiceModal, setViewInvoiceModal] = useState(null);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [shiftClosedReport, setShiftClosedReport] = useState(null);
  const [showAddCustomerModal, setShowAddCategoryModalCustomerModal] = useState(false);

  // 📅 التقارير الزمنية
  const [reportTimeFilter, setReportTimeFilter] = useState("today"); // today, yesterday, week, month, all
  const [cashDrawerInput, setCashDrawerInput] = useState("");
  const [cashDrawerResult, setCashDrawerResult] = useState(null);

  // Form States
  const [restockProduct, setRestockProduct] = useState(null);
  const [restockQty, setRestockQty] = useState("");
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("🍽️");

  // New Product with Custom Sizes
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("");
  const [newProdCat, setNewProdCat] = useState("البيتزا");
  const [newProdImage, setNewProdImage] = useState("");
  const [hasSizesCheck, setHasSizesCheck] = useState(false);
  const [sizeSmallP, setSizeSmallPrice] = useState("");
  const [sizeMediumP, setSizeMediumPrice] = useState("");
  const [sizeLargeP, setSizeLargePrice] = useState("");

  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustAddr, setNewCustAddress] = useState("");

  const currentTicketNo = completedOrders.length + 1;

  const handleLogin = (e) => {
    e.preventDefault();
    const user = usersDb.find((u) => u.username.toLowerCase() === usernameInput.trim().toLowerCase() && u.password === passwordInput);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem("pos_session_user", JSON.stringify(user));
      setLoginError("");
      const permissions = ROLE_PERMISSIONS[user.role];
      setCurrentView(permissions.canViewDashboard ? "dashboard" : "pos");
    } else {
      setLoginError("اسم المستخدم أو كلمة السر غير صحيحة!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("pos_session_user");
    setCurrentUser(null);
    setUsernameInput(""); setPasswordInput(""); setCart([]);
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

  // 🖨️ محرك الطباعة الشامل
  const handlePrintReceipt = (orderData) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>فاتورة #${orderData.ticketNo}</title>
          <style>
            body { font-family: sans-serif; width: ${restaurantInfo.paperWidth || "80mm"}; margin: 0 auto; padding: 8px; font-size: 11px; }
            .text-center { text-align: center; }
            .border-b { border-bottom: 1px dashed #000; margin: 6px 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { text-align: right; padding: 3px 0; }
          </style>
        </head>
        <body>
          <div class="text-center">
            <h2>${restaurantInfo.name}</h2>
            <p>${restaurantInfo.address}<br/>تليفون: ${restaurantInfo.phone}</p>
          </div>
          <div class="border-b"></div>
          <p>رقم الفاتورة: #${orderData.ticketNo}<br/>التاريخ: ${orderData.date} - ${orderData.time}<br/>الكاشير: ${orderData.cashier}</p>
          <div class="border-b"></div>
          <table>
            <thead><tr><th>الصنف</th><th>العدد</th><th>السعر</th></tr></thead>
            <tbody>
              ${orderData.items.map(i => `<tr><td>${i.name} ${i.sizeName ? `(${i.sizeName})` : ''}</td><td>${i.qty}</td><td>${i.unitPrice * i.qty} ج.م</td></tr>`).join('')}
            </tbody>
          </table>
          <div class="border-b"></div>
          <div style="font-weight: bold; font-size: 13px;">الإجمالي النهائي: ${orderData.total} ج.م</div>
          <div class="border-b"></div>
          <div class="text-center"><p>${restaurantInfo.receiptFooter}</p></div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const checkout = () => {
    if (cart.length === 0) return;

    if (editingOrderId) {
      // ✏️ حفظ التعديلات على الفاتورة الحالية
      setCompletedOrders((prev) => prev.map((ord) => ord.id === editingOrderId ? {
        ...ord, total, subtotal, deliveryFee: deliveryFeeCalculated, items: [...cart],
        customerName: customerNameInput || ord.customerName, customerPhone: customerPhoneInput || ord.customerPhone
      } : ord));
      setEditingOrderId(null);
      alert("✅ تم تعديل الفاتورة بنجاح!");
    } else {
      // إتمام فاتورة جديدة
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
        cashier: currentUser.name,
        timestamp: Date.now()
      };

      setCompletedOrders((prev) => [newOrder, ...prev]);

      setProducts((prev) => prev.map((prod) => {
        const cartItem = cart.find((i) => i.id === prod.id);
        return cartItem ? { ...prod, stock: Math.max(0, prod.stock - cartItem.qty) } : prod;
      }));

      if (restaurantInfo.autoPrint) {
        handlePrintReceipt(newOrder);
      }
    }

    setCart([]);
    setCustomerNameInput(""); setCustomerPhoneInput(""); setCustomerAddressInput("");
    setMobileCartDrawerOpen(false);
  };

  // ✏️ استرجاع الفاتورة للتعديل في السلة
  const handleStartEditInvoice = (order) => {
    setEditingOrderId(order.id);
    setCart([...order.items]);
    setOrderType(order.orderType);
    setCustomerNameInput(order.customerName);
    setCustomerPhoneInput(order.customerPhone);
    setCurrentView("pos");
    setViewInvoiceModal(null);
  };

  const handleCancelInvoice = (orderId) => {
    if (!window.confirm("هل أنت متأكد من إلغاء الفاتورة وإرجاع الأصناف للمخزن؟")) return;
    setCompletedOrders((prev) => prev.map((ord) => {
      if (ord.id === orderId) {
        ord.items.forEach((item) => {
          setProducts((pList) => pList.map((p) => p.id === item.id ? { ...p, stock: p.stock + item.qty } : p));
        });
        return { ...ord, status: "cancelled" };
      }
      return ord;
    }));
    setViewInvoiceModal(null);
  };

  // 🧹 تصفير وإعادة تهيئة النظام بالكامل (Factory Reset)
  const handleFactoryReset = () => {
    if (window.confirm("⚠️ تحذير خطير: هل أنت متأكد من إعادة تصفير النظام وتهيئة كافة المبيعات والفواتير؟")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // ➕ إضافة صنف مع تفعيل الأحجام
  const handleAddNewProduct = (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;
    const basePrice = Number(newProdPrice);

    let sizesArr = null;
    if (hasSizesCheck) {
      sizesArr = [
        { id: "sm", name: "صغير", price: Number(sizeSmallP) || basePrice },
        { id: "md", name: "وسط", price: Number(sizeMediumP) || (basePrice + 25) },
        { id: "lg", name: "كبير", price: Number(sizeLargeP) || (basePrice + 45) },
      ];
    }

    const newProd = {
      id: Date.now(),
      cat: newProdCat,
      name: newProdName,
      price: basePrice,
      stock: Number(newProdStock) || 10,
      emoji: "📦",
      imageUrl: newProdImage.trim(),
      sizes: sizesArr
    };

    setProducts((prev) => [newProd, ...prev]);
    setNewProdName(""); setNewProdPrice(""); setNewProdStock(""); setNewProdImage("");
    setHasSizesCheck(false); setSizeSmallPrice(""); setSizeMediumPrice(""); setSizeLargePrice("");
    setShowAddProductModal(false);
  };

  const handleAddNewCategory = (e) => {
    e.preventDefault();
    if (!newCatLabel) return;
    const catId = newCatLabel.trim();
    setCategories((prev) => [...prev, { id: catId, label: newCatLabel, emoji: newCatEmoji }]);
    setActiveCat(catId);
    setNewCatLabel("");
    setShowAddCategoryModal(false);
  };

  const handleAddCustomerSubmit = (e) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;
    const newCust = {
      id: Date.now(),
      name: newCustName,
      phone: newCustPhone,
      address: newCustAddr,
      points: 10,
      debt: 0.0
    };
    setCustomers((prev) => [...prev, newCust]);
    setNewCustName(""); setNewCustPhone(""); setNewCustAddress("");
    setShowAddCategoryModalCustomerModal(false);
  };

  // 📅 فلترة الفواتير حسب التقارير الزمنية
  const getFilteredOrdersByTime = () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const weekStart = todayStart - (86400000 * 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return completedOrders.filter((ord) => {
      if (ord.status === "cancelled") return false;
      const t = ord.timestamp || Date.now();
      if (reportTimeFilter === "today") return t >= todayStart;
      if (reportTimeFilter === "yesterday") return t >= yesterdayStart && t < todayStart;
      if (reportTimeFilter === "week") return t >= weekStart;
      if (reportTimeFilter === "month") return t >= monthStart;
      return true; // all
    });
  };

  // 💰 جرد الخزينة المقارن
  const handleCalculateCashDrawer = () => {
    const active = getFilteredOrdersByTime();
    const expectedRevenue = active.reduce((a, b) => a + b.total, 0);
    const entered = Number(cashDrawerInput) || 0;
    const diff = entered - expectedRevenue;

    setCashDrawerResult({
      expected: expectedRevenue,
      entered,
      diff,
      status: diff === 0 ? "متطابق تماماً ✅" : diff > 0 ? `زيادة قدرها +${diff} ج.م 📈` : `عجز قدره ${diff} ج.م ⚠️`
    });
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
            <p className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block">Enterprise v{APP_VERSION}</p>
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
                <p className="text-[10px] text-emerald-400 font-bold truncate">Enterprise v{APP_VERSION}</p>
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

            {/* 📌 1. صفحة إدارة العملاء CRM */}
            {permissions.canCRM && (
              <button onClick={() => { setCurrentView("crm"); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${currentView === "crm" ? "bg-indigo-600 text-white shadow-md" : "hover:bg-slate-800 text-slate-400"}`}>
                <Users size={18} /> <span>دليل العملاء ({customers.length})</span>
              </button>
            )}

            {permissions.canInventory && (
              <button onClick={() => { setCurrentView("inventory"); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${currentView === "inventory" ? "bg-indigo-600 text-white shadow-md" : "hover:bg-slate-800 text-slate-400"}`}>
                <Package size={18} /> <span>المخزون والمنتجات</span>
              </button>
            )}

            {/* 📌 6. صفحة التقارير الشاملة والجرد */}
            {permissions.canReports && (
              <button onClick={() => { setCurrentView("reports"); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${currentView === "reports" ? "bg-indigo-600 text-white shadow-md" : "hover:bg-slate-800 text-slate-400"}`}>
                <TrendingUp size={18} /> <span>التقارير وجرد الخزينة</span>
              </button>
            )}

            {permissions.canSettings && (
              <button onClick={() => { setCurrentView("settings"); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${currentView === "settings" ? "bg-indigo-600 text-white shadow-md" : "hover:bg-slate-800 text-slate-400"}`}>
                <Settings size={18} /> <span>إعدادات النظام</span>
              </button>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between pt-1">
            <div className="truncate">
              <p className="text-xs font-black text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-indigo-400 font-bold">{currentUser.roleLabel}</p>
            </div>
            <button onClick={handleLogout} title="تسجيل الخروج" className="p-2 text-rose-400 hover:bg-slate-800 rounded-xl">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs lg:hidden z-30"></div>}

      {/* MAIN VIEW AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pt-14 lg:pt-0 relative">
        
        {/* DASHBOARD VIEW */}
        {currentView === "dashboard" && (
          <div className="flex-1 bg-slate-50 p-4 sm:p-6 overflow-y-auto space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">لوحة التحكم والأداء اليومي</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border shadow-xs"><p className="text-xs font-semibold text-slate-400">إجمالي المبيعات المحصلة</p><h3 className="text-2xl font-black text-slate-900 mt-1">{fmt(completedOrders.filter(o=>o.status!=="cancelled").reduce((a,b)=>a+b.total, 0))} ج.م</h3></div>
              <div className="bg-white p-5 rounded-2xl border shadow-xs"><p className="text-xs font-semibold text-slate-400">عدد الفواتير النشطة</p><h3 className="text-2xl font-black text-indigo-600 mt-1">{completedOrders.filter(o=>o.status!=="cancelled").length} فاتورة</h3></div>
              <div className="bg-white p-5 rounded-2xl border shadow-xs"><p className="text-xs font-semibold text-slate-400">عدد العملاء</p><h3 className="text-2xl font-black text-amber-600 mt-1">{customers.length} عميل</h3></div>
            </div>
          </div>
        )}

        {/* POS VIEW */}
        {currentView === "pos" && (
          <div className="flex-1 flex flex-col md:flex-row min-h-0 relative pb-24 md:pb-0">
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
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-32">
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

            {/* CART PANEL */}
            <aside className="hidden md:flex w-[340px] shrink-0 bg-white flex-col border-r shadow-xl">
              <div className="p-3 border-b bg-slate-50 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black">
                    {editingOrderId ? `تعديل فاتورة #${completedOrders.find(o=>o.id===editingOrderId)?.ticketNo}` : `فاتورة جديد #${currentTicketNo}`}
                  </span>
                  {cart.length > 0 && <button onClick={() => { setCart([]); setEditingOrderId(null); }} className="text-xs text-rose-600 font-bold">تصفير</button>}
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
                    <select
                      value={selectedZone?.id}
                      onChange={(e) => setSelectedDeliveryZone(deliveryZones.find(z => z.id === Number(e.target.value)))}
                      className="w-full h-8 bg-white border rounded-lg px-2 font-bold outline-none"
                    >
                      {deliveryZones.map((z) => (
                        <option key={z.id} value={z.id}>{z.name} (+{z.fee} ج.م)</option>
                      ))}
                    </select>
                    <input value={customerPhoneInput} onChange={(e) => setCustomerPhoneInput(e.target.value)} placeholder="رقم الهاتف..." className="w-full h-7 bg-white border rounded-lg px-2 text-xs font-bold" />
                    <input value={customerNameInput} onChange={(e) => setCustomerNameInput(e.target.value)} placeholder="اسم العميل..." className="w-full h-7 bg-white border rounded-lg px-2 text-xs font-bold" />
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
                  {orderType === "delivery" && <div className="flex justify-between text-indigo-700 font-bold"><span>خدمة توصيل:</span><span>{fmt(deliveryFeeCalculated)} ج.م</span></div>}
                  <div className="flex justify-between font-black text-sm pt-1 border-t"><span>الإجمالي:</span><span className="text-indigo-600">{fmt(total)} ج.م</span></div>
                </div>
                <button onClick={checkout} disabled={cart.length === 0} className="w-full h-10 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-md">
                  {editingOrderId ? "حفظ التعديلات والتحديث" : "إتمام البيع والطباعة"}
                </button>
              </div>
            </aside>

            {/* FLOATING MOBILE CART BOTTOM BAR */}
            <div className="md:hidden fixed bottom-0 inset-x-0 bg-slate-900 text-white p-3 flex justify-between items-center z-30 shadow-2xl border-t border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">إجمالي السلة ({totalCartQty} صنف)</span>
                <span className="font-black text-emerald-400 text-base">{fmt(total)} ج.م</span>
              </div>
              <button onClick={() => setMobileCartDrawerOpen(true)} className="bg-indigo-600 text-white font-black text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg">
                <ShoppingCart size={16} /> عرض الفاتورة والإنهاء
              </button>
            </div>
          </div>
        )}

        {/* 👥 1. CRM CUSTOMERS VIEW */}
        {currentView === "crm" && permissions.canCRM && (
          <div className="flex-1 bg-slate-50 p-4 sm:p-6 overflow-y-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-900">دليل وإدارة العملاء (CRM)</h2>
                <p className="text-xs text-slate-400 font-semibold">متابعة سجل الطلبات، الديون، ونقاط الولاء</p>
              </div>
              <button onClick={() => setShowAddCategoryModalCustomerModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <Plus size={15} /> إضافة عميل جديد
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {customers.map((c) => (
                <div key={c.id} className="bg-white p-5 rounded-2xl border shadow-xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-black text-sm text-slate-900">{c.name}</h3>
                      <p className="text-xs text-slate-400">{c.address}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{c.phone}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold pt-2 border-t">
                    <div className="bg-amber-50 p-2 rounded-xl text-amber-700">نقاط الولاء: {c.points} ⭐</div>
                    <div className="bg-rose-50 p-2 rounded-xl text-rose-700">الديون: {fmt(c.debt)} ج.م</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 📜 2. INVOICES HUB WITH EDIT & REPRINT */}
        {currentView === "invoices" && (
          <div className="flex-1 bg-slate-50 p-4 sm:p-6 overflow-y-auto space-y-6">
            <h2 className="text-xl font-black text-slate-900">سجل الفواتير المنفذة والتحكم الكامل ({completedOrders.length})</h2>
            <div className="bg-white rounded-2xl border shadow-xs overflow-x-auto">
              <table className="w-full text-right text-xs min-w-[600px]">
                <thead className="bg-slate-50 border-b font-black text-slate-600">
                  <tr>
                    <th className="p-3">رقم الفاتورة</th>
                    <th className="p-3">التاريخ والوقت</th>
                    <th className="p-3">النوع</th>
                    <th className="p-3">الكاشير</th>
                    <th className="p-3">الإجمالي</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3 text-center">التحكم والإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-bold">
                  {completedOrders.map((o) => (
                    <tr key={o.id} className={o.status === "cancelled" ? "bg-rose-50/50 opacity-60" : ""}>
                      <td className="p-3 font-mono font-black text-indigo-600">#{o.ticketNo}</td>
                      <td className="p-3 text-slate-500">{o.date} - {o.time}</td>
                      <td className="p-3">{o.orderType}</td>
                      <td className="p-3">{o.cashier}</td>
                      <td className="p-3 font-black text-emerald-600">{fmt(o.total)} ج.م</td>
                      <td className="p-3">
                        {o.status === "cancelled" ? <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-[10px]">ملغاة</span> : <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px]">مكتملة</span>}
                      </td>
                      <td className="p-3 text-center space-x-1.5 space-x-reverse">
                        <button onClick={() => setViewInvoiceModal(o)} className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100" title="معاينة وتفاصيل"><Eye size={15} /></button>
                        
                        {/* 📌 إعادة الطباعة */}
                        <button onClick={() => handlePrintReceipt(o)} className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200" title="إعادة الطباعة"><Printer size={15} /></button>
                        
                        {/* 📌 التعديل على الفاتورة */}
                        {o.status !== "cancelled" && (
                          <button onClick={() => handleStartEditInvoice(o)} className="p-1.5 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100" title="تعديل الفاتورة"><Edit3 size={15} /></button>
                        )}

                        {/* 📌 إلغاء الفاتورة */}
                        {o.status !== "cancelled" && (
                          <button onClick={() => handleCancelInvoice(o.id)} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100" title="إلغاء الفاتورة"><Trash2 size={15} /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 📦 INVENTORY VIEW WITH FULL SIZES & EDIT */}
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
                  <tr><th className="p-3">الصنف</th><th className="p-3">القسم</th><th className="p-3">السعر الأساسي</th><th className="p-3">أسعار الأحجام</th><th className="p-3">المخزن</th><th className="p-3 text-center">إجراءات</th></tr>
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
                      <td className="p-3 text-slate-500">
                        {p.sizes ? p.sizes.map(s=>`${s.name}:${s.price}ج`).join(" | ") : "حجم موحد"}
                      </td>
                      <td className="p-3 font-black">{p.stock} قطعة</td>
                      <td className="p-3 text-center space-x-1.5 space-x-reverse">
                        <button onClick={() => setEditProductModal(p)} className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl font-bold">✏️ تعديل</button>
                        <button onClick={() => setRestockProduct(p)} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-bold">+ تزويد</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 📅 6. REPORTS & CASH DRAWER RECONCILIATION */}
        {currentView === "reports" && permissions.canReports && (
          <div className="flex-1 bg-slate-50 p-4 sm:p-6 overflow-y-auto space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">التقارير الشاملة وجرد الخزينة</h2>
                <p className="text-xs text-slate-400 font-semibold">اختر النطاق الزمني لعرض التقارير والجرد</p>
              </div>

              {/* 📌 الفلتر الزمني للتقارير */}
              <div className="flex bg-white p-1 rounded-xl border text-xs font-bold">
                {[
                  { id: "today", label: "اليوم" },
                  { id: "yesterday", label: "أمس" },
                  { id: "week", label: "آخر أسبوع" },
                  { id: "month", label: "هذا الشهر" },
                  { id: "all", label: "كل الوقت" }
                ].map((f) => (
                  <button key={f.id} onClick={() => setReportTimeFilter(f.id)} className={`px-3 py-1.5 rounded-lg ${reportTimeFilter === f.id ? "bg-indigo-600 text-white" : "text-slate-500"}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* كروت الإحصائيات الزمنية */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border shadow-xs">
                <p className="text-xs font-semibold text-slate-400">إجمالي المبيعات بالفترة المختارة</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{fmt(getFilteredOrdersByTime().reduce((a,b)=>a+b.total,0))} ج.م</h3>
              </div>
              <div className="bg-white p-5 rounded-2xl border shadow-xs">
                <p className="text-xs font-semibold text-slate-400">عدد الفواتير المنفذة</p>
                <h3 className="text-2xl font-black text-indigo-600 mt-1">{getFilteredOrdersByTime().length} فاتورة</h3>
              </div>
              <div className="bg-white p-5 rounded-2xl border shadow-xs">
                <p className="text-xs font-semibold text-slate-400">متوسط قيمة الفاتورة</p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">
                  {getFilteredOrdersByTime().length > 0 ? fmt(getFilteredOrdersByTime().reduce((a,b)=>a+b.total,0) / getFilteredOrdersByTime().length) : "0.00"} ج.م
                </h3>
              </div>
            </div>

            {/* 💰 7. جرد الخزينة (Cash Reconciliation Box) */}
            <div className="bg-white p-6 rounded-3xl border shadow-xs space-y-4 max-w-lg">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <DollarSign size={18} className="text-indigo-600" /> حاسبة جرد وتطبيق الخزينة
              </h3>
              <p className="text-xs text-slate-400 font-semibold">أدخل المبلغ النخدي الموجود بالدرج لمطابقته مع النظام</p>

              <div className="flex gap-2">
                <input
                  type="number"
                  value={cashDrawerInput}
                  onChange={(e) => setCashDrawerInput(e.target.value)}
                  placeholder="المبلغ المادي بالدرج (ج.م)..."
                  className="flex-1 h-10 border rounded-xl px-3 font-bold text-xs outline-none"
                />
                <button onClick={handleCalculateCashDrawer} className="px-4 bg-indigo-600 text-white rounded-xl text-xs font-bold">جرد الآن</button>
              </div>

              {cashDrawerResult && (
                <div className="p-4 bg-slate-50 rounded-2xl border space-y-1.5 text-xs font-bold">
                  <div className="flex justify-between"><span>المتوقع بالسيستم:</span><span>{fmt(cashDrawerResult.expected)} ج.م</span></div>
                  <div className="flex justify-between"><span>الموجود بالدرج:</span><span>{fmt(cashDrawerResult.entered)} ج.م</span></div>
                  <div className="flex justify-between border-t pt-2 text-indigo-600 font-black">
                    <span>نتيجة المطابقة:</span><span>{cashDrawerResult.status}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ⚙️ SETTINGS & FACTORY RESET VIEW */}
        {currentView === "settings" && permissions.canSettings && (
          <div className="flex-1 bg-slate-50 p-4 sm:p-6 overflow-y-auto space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">إعدادات النظام والطباعة والتهيئة</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* بيانات المطعم والطباعة */}
              <div className="bg-white p-5 rounded-3xl border shadow-xs space-y-3 text-xs">
                <h3 className="font-extrabold text-sm text-slate-900 border-b pb-2 flex items-center gap-2">
                  <Settings size={16} className="text-indigo-600" /> بيانات المطعم والطابعة
                </h3>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">اسم المطعم</label>
                  <input type="text" value={restaurantInfo.name} onChange={(e) => setRestaurantInfo({ ...restaurantInfo, name: e.target.value })} className="w-full h-9 border rounded-xl px-3 font-bold outline-none" />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">اسم الطابعة المتصلة (Printer Device Name)</label>
                  <input type="text" value={restaurantInfo.printerName} onChange={(e) => setRestaurantInfo({ ...restaurantInfo, printerName: e.target.value })} placeholder="POS-80 Printer" className="w-full h-9 border rounded-xl px-3 font-bold outline-none" />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">مقاس الورق الحراري Thermal Paper</label>
                  <select value={restaurantInfo.paperWidth} onChange={(e) => setRestaurantInfo({ ...restaurantInfo, paperWidth: e.target.value })} className="w-full h-9 border rounded-xl px-3 font-bold outline-none bg-white">
                    <option value="80mm">80mm (طابعة كاشير قياسية)</option>
                    <option value="58mm">58mm (طابعة صغيرة)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">تذييل ورسالة الفاتورة</label>
                  <input type="text" value={restaurantInfo.receiptFooter} onChange={(e) => setRestaurantInfo({ ...restaurantInfo, receiptFooter: e.target.value })} className="w-full h-9 border rounded-xl px-3 font-bold outline-none" />
                </div>
                <button onClick={() => handlePrintReceipt({ ticketNo: 999, date: "اليوم", time: "12:00", cashier: "تجربة", items: [{ name: "تجربة طابعة", qty: 1, unitPrice: 10 }], total: 10 })} className="w-full h-9 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl mt-2">
                  🖨️ تجربة طباعة إيصال اختباري
                </button>
              </div>

              {/* 📌 5. زر التهيئة وإعادة التصفير الشامل */}
              <div className="bg-white p-5 rounded-3xl border shadow-xs space-y-3 text-xs border-rose-100">
                <h3 className="font-extrabold text-sm text-rose-600 border-b pb-2 flex items-center gap-2">
                  <RotateCcw size={16} /> تهيئة وإعادة تصفير النظام
                </h3>
                <p className="text-slate-400 font-semibold leading-relaxed">
                  عند الضغط على هذا الزر سيتم مسح كافة الفواتير المسجلة والسجل المالي للبدء بموسم أو يوم جديد بالكامل.
                </p>
                <button onClick={handleFactoryReset} className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-600/20">
                  ⚠️ تهيئة وتصفير النظام الآن
                </button>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* 📌 MODAL: إضافة صنف مع تفعيل وتحديد أسعار الأحجام */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddNewProduct} className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b pb-3 font-black text-slate-900">
              <span>إضافة صنف جديد وتحديد الأحجام</span>
              <button type="button" onClick={() => setShowAddProductModal(false)}><X size={18} /></button>
            </div>
            <div className="space-y-3 text-xs">
              <select value={newProdCat} onChange={(e) => setNewProdCat(e.target.value)} className="w-full h-9 border rounded-xl px-3 font-bold bg-white">
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.emoji} {c.label}</option>))}
              </select>
              <input type="text" required value={newProdName} onChange={(e) => setNewProdName(e.target.value)} placeholder="اسم الصنف..." className="w-full h-9 border rounded-xl px-3 font-bold" />
              <input type="number" required value={newProdPrice} onChange={(e) => setNewProdPrice(e.target.value)} placeholder="السعر الأساسي / الصغير (ج.م)..." className="w-full h-9 border rounded-xl px-3 font-bold" />
              <input type="number" required value={newProdStock} onChange={(e) => setNewProdStock(e.target.value)} placeholder="الكمية بالمخزن..." className="w-full h-9 border rounded-xl px-3 font-bold" />
              <input type="text" value={newProdImage} onChange={(e) => setNewProdImage(e.target.value)} placeholder="رابط صورة الصنف (اختياري)..." className="w-full h-9 border rounded-xl px-3 font-bold" />

              {/* 📐 تفعيل الأحجام المخصصة للصنف */}
              <div className="pt-2 border-t">
                <label className="flex items-center gap-2 font-bold text-indigo-700 cursor-pointer">
                  <input type="checkbox" checked={hasSizesCheck} onChange={(e) => setHasSizesCheck(e.target.checked)} className="rounded text-indigo-600" />
                  <span>تفعيل أحجام متعددة (صغير / وسط / كبير)</span>
                </label>

                {hasSizesCheck && (
                  <div className="mt-2 space-y-2 p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
                    <div className="flex justify-between items-center">
                      <span>سعر الصغير:</span>
                      <input type="number" value={sizeSmallP} onChange={(e) => setSizeSmallPrice(e.target.value)} placeholder={newProdPrice || "45"} className="w-20 h-7 border rounded px-2 text-center bg-white font-bold" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>سعر الوسط:</span>
                      <input type="number" value={sizeMediumP} onChange={(e) => setSizeMediumPrice(e.target.value)} placeholder="70" className="w-20 h-7 border rounded px-2 text-center bg-white font-bold" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>سعر الكبير:</span>
                      <input type="number" value={sizeLargeP} onChange={(e) => setSizeLargePrice(e.target.value)} placeholder="90" className="w-20 h-7 border rounded px-2 text-center bg-white font-bold" />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <button type="submit" className="w-full h-10 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-md">حفظ الصنف والأحجام</button>
          </form>
        </div>
      )}

      {/* MODAL: إضافة عميل جديد */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddCustomerSubmit} className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 font-black text-slate-900">
              <span>إضافة عميل جديد</span>
              <button type="button" onClick={() => setShowAddCategoryModalCustomerModal(false)}><X size={18} /></button>
            </div>
            <div className="space-y-3 text-xs">
              <input type="text" required value={newCustName} onChange={(e) => setNewCustName(e.target.value)} placeholder="اسم العميل..." className="w-full h-9 border rounded-xl px-3 font-bold" />
              <input type="text" required value={newCustPhone} onChange={(e) => setNewCustPhone(e.target.value)} placeholder="رقم الهاتف..." className="w-full h-9 border rounded-xl px-3 font-bold" />
              <input type="text" value={newCustAddr} onChange={(e) => setNewCustAddress(e.target.value)} placeholder="العنوان التفصيلي..." className="w-full h-9 border rounded-xl px-3 font-bold" />
            </div>
            <button type="submit" className="w-full h-10 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-md">حفظ العميل</button>
          </form>
        </div>
      )}

      {/* MODAL: تعديل صنف وأحجامه من المخزون */}
      {editProductModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={(e) => { e.preventDefault(); setProducts(products.map(p => p.id === editProductModal.id ? editProductModal : p)); setEditProductModal(null); }} className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 font-black text-slate-900">
              <span>تعديل بيانات الصنف والأحجام</span>
              <button type="button" onClick={() => setEditProductModal(null)}><X size={18} /></button>
            </div>
            <div className="space-y-3 text-xs">
              <input type="text" required value={editProductModal.name} onChange={(e) => setEditProductModal({ ...editProductModal, name: e.target.value })} placeholder="اسم الصنف" className="w-full h-9 border rounded-xl px-3 font-bold" />
              <input type="number" required value={editProductModal.price} onChange={(e) => setEditProductModal({ ...editProductModal, price: Number(e.target.value) })} placeholder="السعر الأساسي" className="w-full h-9 border rounded-xl px-3 font-bold" />
              <input type="number" required value={editProductModal.stock} onChange={(e) => setEditProductModal({ ...editProductModal, stock: Number(e.target.value) })} placeholder="الكمية بالمخزن" className="w-full h-9 border rounded-xl px-3 font-bold" />
            </div>
            <button type="submit" className="w-full h-10 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-md">حفظ التعديلات</button>
          </form>
        </div>
      )}

      {/* MODAL: اختيار الأحجام عند البيع */}
      {selectedProductModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 font-black text-slate-900">
              <span className="text-base flex items-center gap-2">{selectedProductModal.name}</span>
              <button onClick={() => setSelectedProductModal(null)} className="text-slate-400"><X size={18} /></button>
            </div>

            {selectedProductModal.sizes && (
              <div>
                <label className="text-xs font-black text-slate-400 block mb-2">اختر الحجم المطلوب:</label>
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

            {selectedProductModal.cat === "البيتزا" && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <label className="flex items-center gap-2 font-bold text-amber-900 text-xs cursor-pointer">
                  <input type="checkbox" checked={stuffedCrust} onChange={(e) => setStuffedCrust(e.target.checked)} className="rounded text-amber-600" />
                  <span>إضافة حشو أطراف بالجبنة 🧀</span>
                </label>
              </div>
            )}

            <button onClick={() => addToCartDirect(selectedProductModal, activeSize, stuffedCrust)} className="w-full h-11 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-lg">
              تأكيد وإضافة للسلة
            </button>
          </div>
        </div>
      )}

      {/* MODAL: معاينة التفاصيل */}
      {viewInvoiceModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 font-black text-slate-900">
              <span>تفاصيل فاتورة #{viewInvoiceModal.ticketNo}</span>
              <button onClick={() => setViewInvoiceModal(null)} className="text-slate-400"><X size={18} /></button>
            </div>

            <div className="space-y-2 text-xs font-bold">
              <div className="flex justify-between text-slate-500"><span>التاريخ والوقت:</span><span>{viewInvoiceModal.date} - {viewInvoiceModal.time}</span></div>
              <div className="flex justify-between text-slate-500"><span>نوع الطلب:</span><span>{viewInvoiceModal.orderType}</span></div>
              <div className="flex justify-between text-slate-500"><span>الكاشير:</span><span>{viewInvoiceModal.cashier}</span></div>
              
              <div className="border-t pt-2 space-y-1">
                {viewInvoiceModal.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between bg-slate-50 p-2 rounded-lg">
                    <span>{item.name}</span>
                    <span>{item.qty} × {fmt(item.unitPrice)} ج.م</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-2 flex justify-between font-black text-sm text-indigo-600">
                <span>الإجمالي الكلي:</span><span>{fmt(viewInvoiceModal.total)} ج.م</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => handlePrintReceipt(viewInvoiceModal)} className="flex-1 h-10 bg-indigo-600 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5">
                <Printer size={15} /> طباعة
              </button>
              {viewInvoiceModal.status !== "cancelled" && (
                <button onClick={() => handleCancelInvoice(viewInvoiceModal.id)} className="h-10 px-4 bg-rose-50 text-rose-600 font-black text-xs rounded-xl">
                  إلغاء
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
