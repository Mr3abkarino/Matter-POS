import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { dbCloud } from '../../db/firebase';
import { ShoppingCart, Plus, Minus, Check, Printer, Edit2, Trash2, History, Wifi, WifiOff, X, ChevronUp } from 'lucide-react';

export function POSView() {
  const [selectedCategory, setSelectedCategory] = useState<string>('البيتزا');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderType, setOrderType] = useState<'تيك أواي' | 'صالة' | 'دليفري'>('تيك أواي');
  const [cart, setCart] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState<boolean>(false);

  // الحالات السحابية والمحلية
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [driversList, setDriversList] = useState<string[]>([]);

  // بيانات العميل والدليفري
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  
  // مودال الأحجام وحشو الأطراف
  const [activeProductForSizes, setActiveProductForSizes] = useState<any>(null);
  const [stuffedCrust, setStuffedCrust] = useState<boolean>(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);

  // 📡 مراقبة حالة النت
  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); syncOfflineInvoices(); };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const cachedProds = localStorage.getItem('dc_cached_products');
    if (cachedProds) setAllProducts(JSON.parse(cachedProds));

    const cachedZones = localStorage.getItem('dc_cached_zones');
    if (cachedZones) setDeliveryZones(JSON.parse(cachedZones));

    const savedDrivers = localStorage.getItem('dc_drivers');
    if (savedDrivers) setDriversList(JSON.parse(savedDrivers));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 🔄 المزامنة اللحظية
  useEffect(() => {
    if (!isOnline) return;

    const unsubProds = onSnapshot(collection(dbCloud, "products"), (snap) => {
      const prods = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllProducts(prods);
      localStorage.setItem('dc_cached_products', JSON.stringify(prods));
    });

    const unsubZones = onSnapshot(collection(dbCloud, "deliveryZones"), (snap) => {
      const zones = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setDeliveryZones(zones);
      localStorage.setItem('dc_cached_zones', JSON.stringify(zones));
    });

    const unsubInvoices = onSnapshot(collection(dbCloud, "invoices"), (snap) => {
      const invs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      invs.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      setRecentInvoices(invs.slice(0, 10));
    });

    return () => { unsubProds(); unsubZones(); unsubInvoices(); };
  }, [isOnline]);

  const syncOfflineInvoices = async () => {
    const offlineInvoices = JSON.parse(localStorage.getItem('dc_offline_invoices') || '[]');
    if (offlineInvoices.length > 0) {
      try {
        for (const inv of offlineInvoices) {
          await addDoc(collection(dbCloud, "invoices"), inv);
        }
        localStorage.removeItem('dc_offline_invoices');
        alert("⚡ تم مزامنة الفواتير المخزنة أوفلاين بنجاح!");
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

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalAmount = subTotal + deliveryFee;

  // 🖨️ تصميم احترافي وجذاب للفاتورة الحرارية
  const printInvoiceWindow = (inv: any) => {
    const printWindow = window.open('', '_blank', 'width=380,height=600');
    if (printWindow) {
      const logoUrl = window.location.origin + '/logo.png';

      printWindow.document.write(`
        <html dir="rtl">
        <head>
          <meta charset="utf-8" />
          <title>فاتورة ${inv.orderType}</title>
          <style>
            @media print {
              @page { margin: 0; size: auto; }
              body { margin: 0; padding: 8px; }
            }
            body {
              font-family: 'Courier New', Courier, Tahoma, Arial, sans-serif;
              width: 270px;
              margin: auto;
              padding: 10px;
              color: #000;
              background: #fff;
              direction: rtl;
              text-align: right;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .logo {
              width: 80px;
              height: 80px;
              margin: 0 auto 6px auto;
              display: block;
              filter: grayscale(100%) contrast(200%);
            }
            .brand-name {
              font-size: 18px;
              font-weight: 900;
              letter-spacing: 1px;
              margin: 2px 0;
            }
            .tagline {
              font-size: 10px;
              font-weight: bold;
              margin-bottom: 6px;
            }
            .order-type-badge {
              display: inline-block;
              border: 2px solid #000;
              padding: 3px 12px;
              font-size: 14px;
              font-weight: 900;
              border-radius: 4px;
              margin-top: 4px;
            }
            .info-block {
              font-size: 11px;
              font-weight: bold;
              margin-bottom: 8px;
              border-bottom: 1px dashed #000;
              padding-bottom: 8px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 8px;
            }
            .items-table th {
              border-bottom: 2px solid #000;
              font-size: 11px;
              font-weight: 900;
              padding-bottom: 4px;
              text-align: right;
            }
            .items-table td {
              font-size: 11px;
              font-weight: bold;
              padding: 4px 0;
              vertical-align: top;
            }
            .item-qty {
              font-weight: 900;
              font-size: 12px;
            }
            .divider {
              border-top: 2px dashed #000;
              margin: 8px 0;
            }
            .totals-section {
              font-size: 12px;
              font-weight: bold;
            }
            .grand-total {
              font-size: 16px;
              font-weight: 900;
              border: 2px solid #000;
              text-align: center;
              padding: 6px;
              margin-top: 6px;
              background-color: #f9f9f9;
            }
            .footer {
              text-align: center;
              font-size: 10px;
              font-weight: bold;
              margin-top: 12px;
              border-top: 1px dashed #000;
              padding-top: 8px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${logoUrl}" class="logo" alt="DC Logo" />
            <div class="brand-name">DREAM CORNER</div>
            <div class="tagline">بيتزا - برجر - كريب</div>
            <div class="order-type-badge">*** ${inv.orderType} ***</div>
          </div>

          <div class="info-block">
            <div class="info-row">
              <span>التاريخ: ${new Date(inv.createdAt || Date.now()).toLocaleDateString('ar-EG')}</span>
              <span>الوقت: ${new Date(inv.createdAt || Date.now()).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            ${inv.driverName ? `<div class="info-row"><span>🛵 الطيار:</span><span>${inv.driverName}</span></div>` : ''}
            ${inv.customerName ? `<div class="info-row"><span>👤 العميل:</span><span>${inv.customerName}</span></div>` : ''}
            ${inv.customerPhone ? `<div class="info-row"><span>📞 التليفون:</span><span>${inv.customerPhone}</span></div>` : ''}
            ${inv.customerAddress ? `<div style="margin-top:2px;">🏠 العنوان: <b>${inv.customerAddress}</b></div>` : ''}
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 55%;">الصنف</th>
                <th style="width: 15%; text-align: center;">العدد</th>
                <th style="width: 30%; text-align: left;">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              ${inv.items.map((i: any) => `
                <tr style="border-bottom: 1px #eee solid;">
                  <td>${i.name}</td>
                  <td style="text-align: center;" class="item-qty">${i.quantity}</td>
                  <td style="text-align: left;">${i.price * i.quantity} ج.م</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="divider"></div>

          <div class="totals-section">
            ${inv.deliveryFee > 0 ? `
              <div class="info-row">
                <span>المجموع:</span>
                <span>${inv.subTotal || (inv.total - inv.deliveryFee)} ج.م</span>
              </div>
              <div class="info-row">
                <span>خدمة التوصيل (${inv.zoneName || ''}):</span>
                <span>${inv.deliveryFee} ج.م</span>
              </div>
            ` : ''}
            <div class="grand-total">
              الإجمالي الكلي: ${inv.total} ج.م
            </div>
          </div>

          <div class="footer">
            طعم يفرق .. جودة تليق بيك ❤️<br/>
            شكراً لطلبكم من DREAM CORNER
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
    }
  };

  // 💾 حفظ أو تعديل الفاتورة
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
      driverName: orderType === 'دليفري' ? selectedDriver : '',
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
      const offlineInvoices = JSON.parse(localStorage.getItem('dc_offline_invoices') || '[]');
      offlineInvoices.push(invoiceData);
      localStorage.setItem('dc_offline_invoices', JSON.stringify(offlineInvoices));
      alert("⚠️ تم حفظ وطباعة الفاتورة محلياً وسيرفعها السيستم فور اتصال النت!");
    }

    printInvoiceWindow(invoiceData);
    setCart([]); setCustomerName(''); setCustomerPhone(''); setCustomerAddress(''); setSelectedZoneId(''); setSelectedDriver('');
    setIsMobileCartOpen(false);
  };

  const handleEditInvoice = (inv: any) => {
    setCart(inv.items || []);
    setOrderType(inv.orderType || 'تيك أواي');
    setCustomerName(inv.customerName || '');
    setCustomerPhone(inv.customerPhone || '');
    setCustomerAddress(inv.customerAddress || '');
    setSelectedDriver(inv.driverName || '');
    setEditingInvoiceId(inv.id);

    const zone = deliveryZones.find(z => z.name === inv.zoneName);
    if (zone) setSelectedZoneId(zone.id);

    setIsMobileCartOpen(true);
  };

  const handleDeleteInvoice = async (id: string) => {
    if (confirm("هل أنت متأكد من إلغاء وحذف هذه الفاتورة؟")) {
      await deleteDoc(doc(dbCloud, "invoices", id));
    }
  };

  // 🛒 مكون السلة السلس
  const CartContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div>
        <h2 className="font-black text-slate-800 text-base mb-3 flex items-center justify-between border-b pb-2">
          <span className="flex items-center gap-2">
            <ShoppingCart className="text-indigo-600" size={20} />
            <span>سلة الطلبات</span>
          </span>
          <div className="flex items-center gap-2">
            {editingInvoiceId && (
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-lg font-bold">تعديل فاتورة</span>
            )}
            <button onClick={() => setIsMobileCartOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
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

        {/* 🛵 حقول الدليفري */}
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

            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="w-full p-2.5 rounded-xl border text-xs font-bold bg-white text-slate-800 focus:outline-none"
            >
              <option value="">اختر الطيار المسؤول...</option>
              {driversList.map(d => (
                <option key={d} value={d}>🛵 الطيار: {d}</option>
              ))}
            </select>

            <input
              type="text"
              autoComplete="off"
              placeholder="اسم العميل"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="p-2.5 rounded-xl border text-xs font-bold bg-white focus:outline-none focus:border-indigo-600"
            />
            <input
              type="tel"
              inputMode="tel"
              autoComplete="off"
              placeholder="رقم الهاتف"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="p-2.5 rounded-xl border text-xs font-bold bg-white focus:outline-none focus:border-indigo-600"
            />
            <input
              type="text"
              autoComplete="off"
              placeholder="العنوان التفصيلي"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="p-2.5 rounded-xl border text-xs font-bold bg-white focus:outline-none focus:border-indigo-600"
            />
          </div>
        )}

        {/* قائمة عناصر السلة */}
        <div className="max-h-36 lg:max-h-56 overflow-y-auto flex flex-col gap-2 my-2 pr-1">
          {cart.length === 0 ? (
            <p className="text-center py-6 text-slate-400 font-bold text-xs">السلة فارغة، اضغط على صنف لإضافته</p>
          ) : (
            cart.map(i => (
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
            ))
          )}
        </div>
      </div>

      {/* الإجمالي والزر */}
      <div className="border-t pt-3 flex flex-col gap-2 bg-white">
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
          <span>{editingInvoiceId ? 'حفظ التعديلات وطباعة' : 'حفظ وطباعة الفاتورة'}</span>
          <span className="bg-indigo-800 px-3 py-1 rounded-xl">{totalAmount} ج.م</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row flex-1 h-full overflow-hidden bg-slate-100 dir-rtl font-sans relative">
      
      {/* 🍕 الأصناف والأقسام */}
      <div className="flex-1 flex flex-col p-3 overflow-hidden pb-20 lg:pb-3">
        
        {/* شريط البحث والاتصال */}
        <div className="flex gap-2 mb-3 items-center">
          <input
            className="flex-1 p-2.5 rounded-2xl border border-slate-200 text-xs font-bold focus:outline-none bg-white shadow-sm"
            placeholder="بحث عن صنف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className={`px-3 py-2.5 rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-sm ${
            isOnline ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
          }`}>
            {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span className="hidden sm:inline">{isOnline ? 'متصل' : 'أوفلاين'}</span>
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

        {/* 🍕 شبكة الأصناف المنسقة بدون تمدد عمودي (content-start) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 p-1 content-start">
          {filteredProducts.map(p => (
            <div
              key={p.id}
              onClick={() => p.sizes && p.sizes.length > 0 ? setActiveProductForSizes(p) : addToCart(p)}
              className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between items-center text-center h-28 active:scale-95"
            >
              <span className="text-xl mb-0.5">{p.emoji || '🍕'}</span>
              <h4 className="font-black text-slate-800 text-[11px] line-clamp-2 px-1 leading-snug">{p.name}</h4>
              <p className="text-indigo-600 font-black text-[10px] bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 mt-1">
                {p.sizes && p.sizes.length > 0 ? `يبدأ من ${p.sizes[0].price} ج.م` : `${p.price} ج.م`}
              </p>
            </div>
          ))}
        </div>

        {/* 📜 سجل آخر الفواتير */}
        <div className="mt-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="font-bold text-xs text-slate-700 mb-2 flex items-center gap-1.5">
            <History size={16} className="text-indigo-600" />
            <span>آخر الفواتير</span>
          </h4>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {recentInvoices.map(inv => (
              <div key={inv.id} className="bg-slate-50 p-2 rounded-xl border flex items-center gap-2 text-xs font-bold whitespace-nowrap">
                <span>{inv.orderType} - {inv.total} ج.م</span>
                <button onClick={() => printInvoiceWindow(inv)} title="طباعة" className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Printer size={14} /></button>
                <button onClick={() => handleEditInvoice(inv)} title="تعديل" className="p-1 text-amber-600 hover:bg-amber-50 rounded-lg"><Edit2 size={14} /></button>
                <button onClick={() => handleDeleteInvoice(inv.id)} title="إلغاء" className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🛒 السلة للشاشات الكبيرة */}
      <div className="hidden lg:flex w-96 bg-white border-r border-slate-200 p-4 flex-col shadow-lg">
        <CartContent />
      </div>

      {/* 🛒 زر السلة العائم للموبايل */}
      <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40">
        <button
          onClick={() => setIsMobileCartOpen(true)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3.5 rounded-2xl font-black text-sm flex justify-between items-center shadow-2xl border border-indigo-400 active:scale-95 transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="bg-indigo-800 p-1.5 rounded-xl">
              <ShoppingCart size={18} />
            </div>
            <span>عرض السلة ({totalItemsCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-black text-base">{totalAmount} ج.م</span>
            <ChevronUp size={18} />
          </div>
        </button>
      </div>

      {/* 🛒 نافذة السلة المنبثقة للموبايل */}
      {isMobileCartOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 shadow-2xl">
            <CartContent />
          </div>
        </div>
      )}

      {/* 🍕 مودال الأحجام وحشو الأطراف */}
      {activeProductForSizes && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-5 w-full max-w-xs text-right dir-rtl shadow-2xl">
            <h3 className="font-black text-slate-900 text-sm mb-3 text-center border-b pb-2">
              {activeProductForSizes.emoji || '🍕'} {activeProductForSizes.name}
            </h3>

            <div 
              onClick={() => setStuffedCrust(!stuffedCrust)}
              className={`flex items-center justify-between p-3 rounded-2xl border mb-4 cursor-pointer transition-all ${
                stuffedCrust ? 'bg-amber-50 border-amber-500 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                  stuffedCrust ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-slate-300'
                }`}>
                  {stuffedCrust && <Check size={14} />}
                </div>
                <span className="font-black text-xs">إضافة حشو أطراف 🧀</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500">(+25 / +30 / +35 ج.م)</span>
            </div>

            <div className="flex flex-col gap-2 mb-4">
              {activeProductForSizes.sizes.map((s: any) => {
                const crustExtra = stuffedCrust ? getCrustPrice(s.id || s.name) : 0;
                const finalPrice = Number(s.price) + crustExtra;

                return (
                  <button
                    key={s.id}
                    onClick={() => addToCart(activeProductForSizes, s)}
                    className="flex justify-between items-center p-3 rounded-2xl border border-slate-200 font-black text-xs hover:bg-indigo-50 hover:border-indigo-600 text-slate-800 transition-all active:scale-95"
                  >
                    <span>{s.name} {stuffedCrust && <span className="text-[10px] text-amber-600">(شامل الحشو)</span>}</span>
                    <span className="text-indigo-600 font-black">{finalPrice} ج.م</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => { setActiveProductForSizes(null); setStuffedCrust(false); }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-2xl font-bold text-xs"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
