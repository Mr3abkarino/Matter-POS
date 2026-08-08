import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, setDoc } from 'firebase/firestore';
import { dbCloud } from '../../db/firebase';
import { ShoppingCart, Plus, Minus, Check, Printer, Edit2, Trash2, Wifi, WifiOff, X, ChevronUp, PauseCircle, PlayCircle } from 'lucide-react';

// 🛒 1. مكون السلة المستقل
function CartContent({
  cart,
  orderType,
  setOrderType,
  heldOrders,
  editingInvoiceId,
  setIsMobileCartOpen,
  handleHoldOrder,
  handleRecallOrder,
  handleDeleteHeldOrder,
  selectedZoneId,
  setSelectedZoneId,
  uniqueDeliveryZones,
  selectedDriver,
  setSelectedDriver,
  driversList,
  customerName,
  setCustomerName,
  customerPhone,
  handleCustomerPhoneChange,
  customerAddress,
  setCustomerAddress,
  updateQuantity,
  deliveryFee,
  handleCheckout,
  totalAmount
}: any) {
  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <h2 className="font-black text-slate-800 text-base mb-3 flex items-center justify-between border-b pb-2">
          <span className="flex items-center gap-2">
            <ShoppingCart className="text-indigo-600" size={20} />
            <span>سلة الطلبات</span>
          </span>
          <div className="flex items-center gap-1.5">
            {cart.length > 0 && (
              <button
                onClick={handleHoldOrder}
                className="bg-amber-50 hover:bg-amber-100 text-amber-700 px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 border border-amber-200 transition-all active:scale-95"
                title="تعليق الطلب لحين عودة العميل"
              >
                <PauseCircle size={14} />
                <span>تعليق</span>
              </button>
            )}

            {editingInvoiceId && (
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-lg font-bold">تعديل فاتورة</span>
            )}
            <button onClick={() => setIsMobileCartOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
        </h2>

        {heldOrders.length > 0 && (
          <div className="bg-amber-50/70 border border-amber-200 p-2 rounded-2xl mb-3">
            <span className="text-[10px] font-black text-amber-900 block mb-1">⏸️ طلبات معلقة ({heldOrders.length}):</span>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {heldOrders.map((h: any) => (
                <div key={h.id} className="bg-white px-2 py-1 rounded-xl border border-amber-300 text-[10px] font-bold flex items-center gap-1.5 shrink-0 shadow-sm">
                  <span>{h.time} ({h.cart.length} أصناف)</span>
                  <button onClick={() => handleRecallOrder(h)} className="text-emerald-600 font-black hover:bg-emerald-50 p-0.5 rounded" title="استرجاع"><PlayCircle size={12} /></button>
                  <button onClick={() => handleDeleteHeldOrder(h.id)} className="text-rose-600 hover:bg-rose-50 p-0.5 rounded" title="حذف"><X size={12} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

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

        {orderType === 'دليفري' && (
          <div className="flex flex-col gap-2 mb-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
            <select
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value)}
              className="w-full p-2.5 rounded-xl border text-xs font-bold bg-white text-slate-800 focus:outline-none"
            >
              <option value="">اختر منطقة التوصيل...</option>
              {uniqueDeliveryZones.map((z: any) => z && (
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
              {driversList.map((d: string) => (
                <option key={d} value={d}>🛵 الطيار: {d}</option>
              ))}
            </select>

            <input
              type="tel"
              inputMode="tel"
              autoComplete="off"
              placeholder="رقم الهاتف (جلب تلقائي)"
              value={customerPhone}
              onChange={(e) => handleCustomerPhoneChange(e.target.value)}
              className="p-2.5 rounded-xl border text-xs font-bold bg-white focus:outline-none focus:border-indigo-600"
            />

            <input
              type="text"
              autoComplete="off"
              placeholder="اسم العميل"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
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

        <div className="max-h-36 lg:max-h-56 overflow-y-auto flex flex-col gap-2 my-2 pr-1">
          {cart.length === 0 ? (
            <p className="text-center py-6 text-slate-400 font-bold text-xs">السلة فارغة، اضغط على صنف لإضافته</p>
          ) : (
            cart.map((i: any) => (
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
}

export function POSView({ initialEditingInvoice, onClearEditingInvoice }: { initialEditingInvoice?: any; onClearEditingInvoice?: () => void }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderType, setOrderType] = useState<'تيك أواي' | 'صالة' | 'دليفري'>('تيك أواي');
  const [cart, setCart] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState<boolean>(false);

  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [driversList, setDriversList] = useState<string[]>([]);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  
  const [heldOrders, setHeldOrders] = useState<any[]>([]);

  const [activeProductForSizes, setActiveProductForSizes] = useState<any>(null);
  const [stuffedCrust, setStuffedCrust] = useState<boolean>(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);

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

    const savedHeld = localStorage.getItem('dc_held_orders');
    if (savedHeld) setHeldOrders(JSON.parse(savedHeld));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const unsubProds = onSnapshot(collection(dbCloud, "products"), (snap) => {
      const prods = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (prods.length > 0) {
        setAllProducts(prods);
        localStorage.setItem('dc_cached_products', JSON.stringify(prods));
      }
    });

    const unsubZones = onSnapshot(collection(dbCloud, "deliveryZones"), (snap) => {
      const zones = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setDeliveryZones(zones);
      localStorage.setItem('dc_cached_zones', JSON.stringify(zones));
    });

    return () => { unsubProds(); unsubZones(); };
  }, []);

  useEffect(() => {
    if (initialEditingInvoice) {
      handleEditInvoice(initialEditingInvoice);
      if (onClearEditingInvoice) onClearEditingInvoice();
    }
  }, [initialEditingInvoice]);

  const handleCustomerPhoneChange = async (phone: string) => {
    setCustomerPhone(phone);
    const cleanPhone = phone.trim();

    if (cleanPhone.length >= 10) {
      try {
        const docRef = doc(dbCloud, "customers", cleanPhone);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const cData = docSnap.data();
          if (cData.name) setCustomerName(cData.name);
          if (cData.address) setCustomerAddress(cData.address);
          if (cData.zoneId) setSelectedZoneId(cData.zoneId);
        }
      } catch (err) {
        console.warn("Auto customer fetch error", err);
      }
    }
  };

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

  const rawCategories = allProducts
    .map(p => (p.catId || p.category || p.catName || 'عام').toString().trim())
    .filter(Boolean);

  const activeCategories = ['الكل', ...Array.from(new Set(rawCategories))];

  // 📍 تصفية مانعة للتكرار بشكل قاطع للقائمة المنسدلة
  const uniqueDeliveryZones = Array.from(
    deliveryZones.reduce((map, zone) => {
      const name = (zone.name || '').trim();
      if (name && !map.has(name)) {
        map.set(name, zone);
      }
      return map;
    }, new Map()).values()
  );

  const selectedZone = deliveryZones.find(z => z.id === selectedZoneId);
  const deliveryFee = orderType === 'دليفري' && selectedZone ? Number(selectedZone.fee || 0) : 0;

  const filteredProducts = allProducts.filter(p => {
    const prodCat = (p.catId || p.category || p.catName || 'عام').toString().trim();
    const matchCategory = selectedCategory === 'الكل' || prodCat === selectedCategory.trim();
    const matchSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase());
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

  const handleHoldOrder = () => {
    if (cart.length === 0) return alert("السلة فارغة لتعليقها!");
    const held = {
      id: Date.now().toString(),
      cart,
      orderType,
      selectedZoneId,
      selectedDriver,
      customerName,
      customerPhone,
      customerAddress,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };
    const updated = [held, ...heldOrders];
    setHeldOrders(updated);
    localStorage.setItem('dc_held_orders', JSON.stringify(updated));

    setCart([]); setCustomerName(''); setCustomerPhone(''); setCustomerAddress(''); setSelectedZoneId(''); setSelectedDriver('');
  };

  const handleRecallOrder = (order: any) => {
    setCart(order.cart || []);
    setOrderType(order.orderType || 'تيك أواي');
    setSelectedZoneId(order.selectedZoneId || '');
    setSelectedDriver(order.selectedDriver || '');
    setCustomerName(order.customerName || '');
    setCustomerPhone(order.customerPhone || '');
    setCustomerAddress(order.customerAddress || '');

    const updated = heldOrders.filter(o => o.id !== order.id);
    setHeldOrders(updated);
    localStorage.setItem('dc_held_orders', JSON.stringify(updated));
  };

  const handleDeleteHeldOrder = (id: string) => {
    const updated = heldOrders.filter(o => o.id !== id);
    setHeldOrders(updated);
    localStorage.setItem('dc_held_orders', JSON.stringify(updated));
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

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalAmount = subTotal + deliveryFee;

  const printInvoiceWindow = (inv: any) => {
    const printWindow = window.open('', '_blank', 'width=380,height=600');
    if (printWindow) {
      const logoUrl = window.location.origin + '/logo.png';

      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8" />
          <title>فاتورة ${inv.orderType}</title>
          <style>
            @media print {
              @page { margin: 0; size: auto; }
              body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            * { box-sizing: border-box; }
            body {
              font-family: 'Tahoma', 'Arial', sans-serif;
              width: 175px;
              margin: 0 auto;
              padding: 2px 2px;
              color: #000;
              background: #fff;
              direction: rtl;
              text-align: right;
              font-size: 10px;
              line-height: 1.25;
              font-weight: 900;
              -webkit-font-smoothing: antialiased;
            }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 4px; margin-bottom: 4px; }
            .logo { 
              width: 55px; 
              height: 55px; 
              margin: 0 auto 2px auto; 
              display: block; 
              object-fit: contain;
              filter: grayscale(100%) contrast(500%);
              -webkit-filter: grayscale(100%) contrast(500%);
            }
            .brand-box {
              border: 2px solid #000;
              padding: 2px 1px;
              margin: 2px 0;
              border-radius: 4px;
              background-color: #fff;
            }
            .brand-title { 
              font-size: 14px; 
              font-weight: 900; 
              margin: 0; 
              text-transform: uppercase; 
              color: #000;
            }
            .brand-sub { font-size: 8px; font-weight: 900; color: #000; margin-top: 1px; }
            .badge-wrap { margin-top: 2px; }
            .badge { 
              display: inline-block; 
              border: 2px solid #000; 
              color: #000; 
              font-size: 11px; 
              font-weight: 900; 
              padding: 1px 8px; 
              border-radius: 4px; 
            }
            .details-box { border: 1.5px solid #000; border-radius: 4px; padding: 4px; margin-bottom: 4px; font-size: 9px; font-weight: 900; }
            .details-row { display: flex; justify-content: space-between; margin-bottom: 1.5px; word-break: break-word; }
            .address-row { border-top: 1.5px dashed #000; margin-top: 3px; padding-top: 3px; font-size: 9.5px; font-weight: 900; }
            
            .table { width: 100%; border-collapse: collapse; margin-bottom: 4px; table-layout: fixed; }
            .table th { border-bottom: 2px solid #000; font-size: 9px; font-weight: 900; padding: 3px 0; text-align: right; }
            .table td { padding: 3px 0; border-bottom: 1px dashed #000; font-size: 9.5px; font-weight: 900; word-wrap: break-word; }
            
            .total-box { border: 2px solid #000; border-radius: 4px; padding: 3px; text-align: center; margin-top: 4px; }
            .total-label { font-size: 9px; font-weight: 900; margin-bottom: 1px; }
            .total-val { font-size: 16px; font-weight: 900; }
            
            .summary-line { display: flex; justify-content: space-between; font-size: 9px; font-weight: 900; margin-bottom: 1.5px; }
            .footer { text-align: center; font-size: 8px; font-weight: 900; margin-top: 5px; border-top: 1.5px dashed #000; padding-top: 3px; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${logoUrl}" class="logo" id="invLogo" alt="DC Logo" />
            <div class="brand-box">
              <h1 class="brand-title">DREAM CORNER</h1>
              <div class="brand-sub">مطعم دريم كورنر - بيتزا و ساندوتشات</div>
            </div>
            <div class="badge-wrap"><span class="badge">${inv.orderType}</span></div>
          </div>
          <div class="details-box">
            <div class="details-row">
              <span>التاريخ: ${new Date(inv.createdAt || Date.now()).toLocaleDateString('ar-EG')}</span>
              <span>الوقت: ${new Date(inv.createdAt || Date.now()).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            ${inv.driverName ? `<div class="details-row"><span>🛵 الطيار:</span><span><b>${inv.driverName}</b></span></div>` : ''}
            ${inv.customerName ? `<div class="details-row"><span>👤 العميل:</span><span>${inv.customerName}</span></div>` : ''}
            ${inv.customerPhone ? `<div class="details-row"><span>📞 الهاتف:</span><span>${inv.customerPhone}</span></div>` : ''}
            ${inv.customerAddress ? `<div class="address-row">🏠 العنوان: ${inv.customerAddress}</div>` : ''}
          </div>
          <table class="table">
            <thead>
              <tr>
                <th style="width: 50%;">الصنف</th>
                <th style="width: 15%; text-align: center;">العدد</th>
                <th style="width: 35%; text-align: left;">المبلغ</th>
              </tr>
            </thead>
            <tbody>
               ${(inv.items || []).map((i: any) => `
                <tr>
                  <td><b>${i.name}</b></td>
                  <td style="text-align: center;"><b>${i.quantity}</b></td>
                  <td style="text-align: left; font-weight:900;"><b>${i.price * i.quantity} ج.م</b></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ${inv.deliveryFee > 0 ? `
            <div class="summary-line"><span>إجمالي الطلبات:</span><span>${inv.subTotal || (inv.total - inv.deliveryFee)} ج.م</span></div>
            <div class="summary-line"><span>خدمة التوصيل ${inv.zoneName ? `(${inv.zoneName})` : ''}:</span><span>${inv.deliveryFee} ج.م</span></div>
          ` : ''}
          <div class="total-box">
            <div class="total-label">الإجمالي النهائي المطلوب</div>
            <div class="total-val">${inv.total} ج.م</div>
          </div>
          <div class="footer">طعم يفرق .. جودة تليق بيك ❤️<br/>شكراً لتسوقكم من DREAM CORNER</div>

          <script>
            function executeDirectPrint() {
              window.focus();
              window.print();
              setTimeout(function() { window.close(); }, 300);
            }
            var img = document.getElementById('invLogo');
            if (img && !img.complete) {
              img.onload = executeDirectPrint;
              img.onerror = executeDirectPrint;
            } else {
              executeDirectPrint();
            }
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

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

        if (customerPhone.trim()) {
          try {
            const customerRef = doc(dbCloud, "customers", customerPhone.trim());
            await setDoc(customerRef, {
              name: customerName.trim(),
              phone: customerPhone.trim(),
              address: customerAddress.trim(),
              zoneId: selectedZoneId,
              lastOrderAt: Date.now()
            }, { merge: true });
          } catch (err) {
            console.warn("Auto save customer error", err);
          }
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

  const cartProps = {
    cart,
    orderType,
    setOrderType,
    heldOrders,
    editingInvoiceId,
    setIsMobileCartOpen,
    handleHoldOrder,
    handleRecallOrder,
    handleDeleteHeldOrder,
    selectedZoneId,
    setSelectedZoneId,
    uniqueDeliveryZones,
    selectedDriver,
    setSelectedDriver,
    driversList,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    handleCustomerPhoneChange,
    customerAddress,
    setCustomerAddress,
    updateQuantity,
    deliveryFee,
    handleCheckout,
    totalAmount
  };

  return (
    <div className="flex flex-col lg:flex-row flex-1 h-full overflow-hidden bg-slate-100 dir-rtl font-sans relative">
      <div className="flex-1 flex flex-col p-3 overflow-hidden pb-20 lg:pb-3">
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

        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 p-1 content-start">
          {filteredProducts.length === 0 ? (
            <p className="col-span-full text-center py-12 text-slate-400 font-bold text-xs">
              لا توجد منتجات حالياً
            </p>
          ) : (
            filteredProducts.map(p => (
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
            ))
          )}
        </div>
      </div>

      <div className="hidden lg:flex w-96 bg-white border-r border-slate-200 p-4 flex-col shadow-lg">
        <CartContent {...cartProps} />
      </div>

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

      {isMobileCartOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 shadow-2xl">
            <CartContent {...cartProps} />
          </div>
        </div>
      )}

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
