import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { dbCloud } from '../../db/firebase';
import { ShoppingCart, Plus, Minus, Check, Printer, Edit2, Trash2, History, Wifi, WifiOff } from 'lucide-react';

export function POSView() {
  const [selectedCategory, setSelectedCategory] = useState<string>('البيتزا');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderType, setOrderType] = useState<'تيك أواي' | 'صالة' | 'دليفري'>('تيك أواي');
  const [cart, setCart] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // الحالات السحابية والمحلية
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);

  // بيانات العميل والدليفري
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  
  // مودال الأحجام وحشو الأطراف
  const [activeProductForSizes, setActiveProductForSizes] = useState<any>(null);
  const [stuffedCrust, setStuffedCrust] = useState<boolean>(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);

  // 📡 مراقبة حالة النت + المزامنة التلقائية للفواتير الأوفلاين
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineInvoices(); // مزامنة الفواتير اللي اتعملت والنت فاصل
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // كاش المنتجات الأوفلاين
    const cachedProds = localStorage.getItem('dc_cached_products');
    if (cachedProds) setAllProducts(JSON.parse(cachedProds));

    const cachedZones = localStorage.getItem('dc_cached_zones');
    if (cachedZones) setDeliveryZones(JSON.parse(cachedZones));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 🔄 المزامنة اللحظية مع Firebase عند وجود النت
  useEffect(() => {
    if (!isOnline) return;

    const unsubProds = onSnapshot(collection(dbCloud, "products"), (snap) => {
      const prods = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllProducts(prods);
      localStorage.setItem('dc_cached_products', JSON.stringify(prods)); // حفظ نسخة كاش
    });

    const unsubZones = onSnapshot(collection(dbCloud, "deliveryZones"), async (snap) => {
      const zones = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setDeliveryZones(zones);
      localStorage.setItem('dc_cached_zones', JSON.stringify(zones)); // حفظ نسخة كاش
    });

    const unsubInvoices = onSnapshot(collection(dbCloud, "invoices"), (snap) => {
      const invs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      invs.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      setRecentInvoices(invs.slice(0, 10));
    });

    return () => { unsubProds(); unsubZones(); unsubInvoices(); };
  }, [isOnline]);

  // 🚀 رفع الفواتير الأوفلاين للسحابة فور عودة النت
  const syncOfflineInvoices = async () => {
    const offlineInvoices = JSON.parse(localStorage.getItem('dc_offline_invoices') || '[]');
    if (offlineInvoices.length > 0) {
      try {
        for (const inv of offlineInvoices) {
          await addDoc(collection(dbCloud, "invoices"), inv);
        }
        localStorage.removeItem('dc_offline_invoices');
        alert("⚡ تم مزامنة الفواتير المخزنة أوفلاين مع السحابة بنجاح!");
      } catch (e) {
        console.error("Offline Sync Error:", e);
      }
    }
  };

  const activeCategories = Array.from(
    new Set(
      allProducts
        .map(p => (p.catId || p.category || '').toString().trim())
        .filter(cat => cat && cat !== 'السندوتشات')
    )
  );

  useEffect(() => {
    if (activeCategories.length > 0 && (!selectedCategory || !activeCategories.includes(selectedCategory))) {
      setSelectedCategory(activeCategories[0]);
    }
  }, [allProducts]);

  const uniqueDeliveryZones = Array.from(new Set(deliveryZones.map(z => z.name)))
    .map(name => deliveryZones.find(z => z.name === name));

  const selectedZone = deliveryZones.find(z => z.id === selectedZoneId);
  const deliveryFee = orderType === 'دليفري' && selectedZone ? Number(selectedZone.fee || 0) : 0;

  const filteredProducts = allProducts.filter(p => {
    const prodCat = (p.catId || p.category || '').toString().trim();
    const matchCategory = prodCat === selectedCategory.trim();
    const matchSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const getCrustPrice = (sizeId: string) => {
    if (sizeId === 's' || sizeId === 'صغير') return 25;
    if (sizeId === 'm' || sizeId === 'وسط') return 30;
    if (sizeId === 'l' || sizeId === 'كبير') return 35;
    return 30;
  };

  const addToCart = (product: any, size?: any) => {
    let crustFee = 0;
    let extraTitle = '';

    if (size && stuffedCrust) {
      crustFee = getCrustPrice(size.id || size.name);
      extraTitle = ' + حشو أطراف';
    }

    const itemKey = size 
      ? `${product.id}-${size.id}-${stuffedCrust ? 'crust' : 'normal'}` 
      : `${product.id}`;
      
    const itemName = size 
      ? `${product.name} (${size.name}${extraTitle})` 
      : product.name;
      
    const itemPrice = size 
      ? Number(size.price) + crustFee 
      : Number(product.price);

    setCart(prev => {
      const existing = prev.find(i => i.itemKey === itemKey);
      if (existing) {
        return prev.map(i => i.itemKey === itemKey ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { itemKey, productId: product.id, name: itemName, price: itemPrice, quantity: 1 }];
    });

    setActiveProductForSizes(null);
    setStuffedCrust(false);
  };

  const updateQuantity = (itemKey: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.itemKey === itemKey) {
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : null;
      }
      return i;
    }).filter(Boolean));
  };

  const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalAmount = subTotal + deliveryFee;

  // 🖨️ طباعة الفاتورة محلياً (تشتغل 100% بدون نت)
  const printInvoiceWindow = (inv: any) => {
    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl"><head>
        <style>
          body { font-family: Tahoma, sans-serif; width: 280px; margin: auto; font-weight: bold; font-size: 12px; }
          .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
          .item { display: flex; justify-content: space-between; margin-bottom: 4px; }
          .divider { border-top: 1px dashed #000; margin: 6px 0; }
          .total { font-size: 14px; border: 2px solid #000; padding: 6px; text-align: center; margin-top: 8px; }
        </style></head>
        <body>
          <div class="header">
            <h2 style="margin:0">DREAM CORNER</h2>
            <p style="margin:2px 0">نوع الطلب: ${inv.orderType}</p>
            ${inv.customerName ? `<p style="margin:2px 0">العميل: ${inv.customerName}</p>` : ''}
            ${inv.customerPhone ? `<p style="margin:2px 0">الهاتف: ${inv.customerPhone}</p>` : ''}
            ${inv.customerAddress ? `<p style="margin:2px 0">العنوان: ${inv.customerAddress}</p>` : ''}
          </div>
          ${inv.items.map((i: any) => `<div class="item"><span>${i.name} × ${i.quantity}</span><span>${i.price * i.quantity} ج.م</span></div>`).join('')}
          ${inv.deliveryFee > 0 ? `<div class="item"><span>خدمة التوصيل (${inv.zoneName || ''})</span><span>${inv.deliveryFee} ج.م</span></div>` : ''}
          <div class="divider"></div>
          <div class="total">الإجمالي الكلي: ${inv.total} ج.م</div>
        </body></html>
      `);
      printWindow.document.close();
      setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
    }
  };

  // 💾 حفظ أو تعديل الفاتورة (أونلاين أو أوفلاين)
  const handleCheckout = async () => {
    if (cart.length === 0) return alert("السلة فارغة!");
    if (orderType === 'دليفري' && !selectedZoneId) return alert("يرجى اختيار منطقة الدليفري!");

    const invoiceData = {
      items: cart,
      subTotal,
      deliveryFee,
      total: totalAmount,
      orderType,
      zoneName: selectedZone?.name || '',
      customerName,
      customerPhone,
      customerAddress,
      createdAt: Date.now()
    };

    if (isOnline) {
      try {
        if (editingInvoiceId) {
          await updateDoc(doc(dbCloud, "invoices", editingInvoiceId), invoiceData);
          setEditingInvoiceId(null);
        } else {
          await addDoc(collection(dbCloud, "invoices"), invoiceData);
        }
      } catch (e) {
        console.error("Firestore Save Error:", e);
      }
    } else {
      // 💾 الحفظ المحلي عند انقطاع النت
      const offlineInvoices = JSON.parse(localStorage.getItem('dc_offline_invoices') || '[]');
      offlineInvoices.push(invoiceData);
      localStorage.setItem('dc_offline_invoices', JSON.stringify(offlineInvoices));
      alert("⚠️ النت فاصل: تم طباعة الفاتورة وحفظها محلياً وسيتم رفعهما تلقائياً عند عودة النت!");
    }

    printInvoiceWindow(invoiceData);
    setCart([]); setCustomerName(''); setCustomerPhone(''); setCustomerAddress(''); setSelectedZoneId('');
  };

  return (
    <div className="flex flex-col lg:flex-row flex-1 h-full overflow-hidden bg-slate-100 dir-rtl font-sans">
      
      {/* 🍕 الأصناف والأقسام */}
      <div className="flex-1 flex flex-col p-3 overflow-hidden">
        
        {/* شريط البحث + مؤشر انقطاع النت */}
        <div className="flex gap-2 mb-3 items-center">
          <input
            className="flex-1 p-2.5 rounded-2xl border border-slate-200 text-xs font-bold focus:outline-none bg-white shadow-sm"
            placeholder="بحث عن صنف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* 📡 مؤشر الحالة (أونلاين / أوفلاين) */}
          <div className={`px-3 py-2.5 rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-sm ${
            isOnline ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
          }`}>
            {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span>{isOnline ? 'متصل' : 'أوفلاين (شغال محلياً)'}</span>
          </div>
        </div>

        {/* شريط الأقسام */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
          {activeCategories.map((catName) => (
            <button
              key={catName}
              onClick={() => setSelectedCategory(catName)}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs whitespace-nowrap transition-all shadow-sm ${
                selectedCategory === catName 
                  ? 'bg-indigo-600 text-white scale-105' 
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {catName}
            </button>
          ))}
        </div>

        {/* شبكة الأصناف */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-1">
          {filteredProducts.map(p => (
            <div
              key={p.id}
              onClick={() => p.sizes && p.sizes.length > 0 ? setActiveProductForSizes(p) : addToCart(p)}
              className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between items-center text-center active:scale-95"
            >
              <span className="text-2xl mb-1">{p.emoji || '🍕'}</span>
              <h4 className="font-black text-slate-800 text-xs mb-1">{p.name}</h4>
              <p className="text-indigo-600 font-black text-xs">
                {p.sizes && p.sizes.length > 0 ? `يبدأ من ${p.sizes[0].price} ج.م` : `${p.price} ج.م`}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 🛒 السلة */}
      <div className="w-full lg:w-96 bg-white border-r border-slate-200 p-4 flex flex-col shadow-lg">
        <h2 className="font-black text-slate-800 text-base mb-3 flex items-center justify-between border-b pb-2">
          <span className="flex items-center gap-2">
            <ShoppingCart className="text-indigo-600" size={20} />
            <span>سلة الطلبات</span>
          </span>
        </h2>

        {/* نوع الطلب */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl mb-3">
          {(['تيك أواي', 'صالة', 'دليفري'] as const).map(t => (
            <button
              key={t}
              onClick={() => setOrderType(t)}
              className={`py-1.5 rounded-xl font-black text-[11px] transition-all ${
                orderType === t ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* حقول الدليفري */}
        {orderType === 'دليفري' && (
          <div className="flex flex-col gap-2 mb-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
            <select
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value)}
              className="w-full p-2.5 rounded-xl border text-xs font-bold bg-white text-slate-800 focus:outline-none"
            >
              <option value="">اختر منطقة التوصيل...</option>
              {uniqueDeliveryZones.map(z => z && (
                <option key={z.id || z.name} value={z.id}>
                  {z.name} (+{z.fee} ج.م)
                </option>
              ))}
            </select>
            <input
              placeholder="اسم العميل"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="p-2.5 rounded-xl border text-xs font-bold bg-white focus:outline-none"
            />
            <input
              placeholder="رقم الهاتف"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="p-2.5 rounded-xl border text-xs font-bold bg-white focus:outline-none"
            />
            <input
              placeholder="العنوان التفصيلي"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="p-2.5 rounded-xl border text-xs font-bold bg-white focus:outline-none"
            />
          </div>
        )}

        {/* قائمة السلة */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 my-2 pr-1">
          {cart.map(i => (
            <div key={i.itemKey} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex-1">
                <h5 className="font-bold text-slate-800 text-xs">{i.name}</h5>
                <p className="text-indigo-600 font-black text-[11px]">{i.price * i.quantity} ج.م</p>
              </div>
              <div className="flex items-center gap-1 bg-white border rounded-xl p-1 shadow-sm">
                <button onClick={() => updateQuantity(i.itemKey, -1)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-600"><Minus size={12} /></button>
                <span className="font-black text-xs px-1.5">{i.quantity}</span>
                <button onClick={() => updateQuantity(i.itemKey, 1)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-600"><Plus size={12} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* الإجمالي والزر */}
        <div className="border-t pt-3 flex flex-col gap-2">
          {deliveryFee > 0 && (
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>خدمة التوصيل:</span>
              <span>{deliveryFee} ج.م</span>
            </div>
          )}
          <button
            onClick={handleCheckout}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3.5 rounded-2xl font-black text-sm flex justify-between items-center shadow-lg transition-all active:scale-95"
          >
            <span>حفظ وطباعة الفاتورة</span>
            <span className="bg-indigo-800 px-3 py-1 rounded-xl">{totalAmount} ج.م</span>
          </button>
        </div>
      </div>

      {/* 🍕 مودال الأحجام */}
      {activeProductForSizes && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-5 w-full max-w-xs text-right dir-rtl shadow-2xl">
            <h3 className="font-black text-slate-900 text-sm mb-3 text-center border-b pb-2">
              {activeProductForSizes.emoji || '🍕'} {activeProductForSizes.name}
            </h3>
            <div onClick={() => setStuffedCrust(!stuffedCrust)} className="flex items-center justify-between p-3 rounded-2xl border mb-4 cursor-pointer">
              <span className="font-black text-xs">إضافة حشو أطراف 🧀</span>
            </div>
            <div className="flex flex-col gap-2 mb-4">
              {activeProductForSizes.sizes.map((s: any) => (
                <button
                  key={s.id}
                  onClick={() => addToCart(activeProductForSizes, s)}
                  className="flex justify-between p-3 rounded-2xl border font-black text-xs hover:bg-indigo-50"
                >
                  <span>{s.name}</span>
                  <span>{s.price} ج.م</span>
                </button>
              ))}
            </div>
            <button onClick={() => setActiveProductForSizes(null)} className="w-full bg-slate-100 py-2.5 rounded-2xl text-xs font-bold">إلغاء</button>
          </div>
        </div>
      )}

    </div>
  );
}
