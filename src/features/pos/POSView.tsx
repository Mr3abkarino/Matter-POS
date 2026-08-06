import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { dbCloud } from '../../db/firebase';
import { ShoppingCart, Plus, Minus, Trash2, User, Phone, MapPin, RefreshCw } from 'lucide-react';

export function POSView() {
  const [selectedCategory, setSelectedCategory] = useState('البيتزا');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderType, setOrderType] = useState<'تيك أواي' | 'صالة' | 'دليفري'>('تيك أواي');
  const [cart, setCart] = useState<any[]>([]);

  // الحالات السحابية
  const [rawCategories, setRawCategories] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);

  // بيانات العميل والدليفري
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  
  // مودال الأحجام
  const [activeProductForSizes, setActiveProductForSizes] = useState<any>(null);

  // 🔄 المزامنة اللحظية
  useEffect(() => {
    const unsubCats = onSnapshot(collection(dbCloud, "categories"), (snap) => {
      setRawCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubProds = onSnapshot(collection(dbCloud, "products"), (snap) => {
      setAllProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubZones = onSnapshot(collection(dbCloud, "deliveryZones"), (snap) => {
      setDeliveryZones(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubCats(); unsubProds(); unsubZones(); };
  }, []);

  // 🧹 إزالة الأقسام المكررة للعرض فقط
  const categories = Array.from(new Set(rawCategories.map(c => c.label)))
    .map(label => rawCategories.find(c => c.label === label));

  const selectedZone = deliveryZones.find(z => z.id === selectedZoneId);
  const deliveryFee = orderType === 'دليفري' && selectedZone ? Number(selectedZone.fee || 0) : 0;

  // فلترة الأصناف حسب القسم والبحث
  const filteredProducts = allProducts.filter(p => {
    const matchCategory = p.catId === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // إضافة للسلة
  const addToCart = (product: any, size?: any) => {
    const itemKey = size ? `${product.id}-${size.id}` : `${product.id}`;
    const itemName = size ? `${product.name} (${size.name})` : product.name;
    const itemPrice = size ? Number(size.price) : Number(product.price);

    setCart(prev => {
      const existing = prev.find(i => i.itemKey === itemKey);
      if (existing) {
        return prev.map(i => i.itemKey === itemKey ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { itemKey, productId: product.id, name: itemName, price: itemPrice, quantity: 1 }];
    });
    setActiveProductForSizes(null);
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

  // 💾 حفظ الفاتورة وطباعتها
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

    try {
      await addDoc(collection(dbCloud, "invoices"), invoiceData);

      // نافذة الطباعة
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
              <p style="margin:2px 0">نوع الطلب: ${orderType}</p>
              ${customerName ? `<p style="margin:2px 0">العميل: ${customerName}</p>` : ''}
              ${customerPhone ? `<p style="margin:2px 0">الهاتف: ${customerPhone}</p>` : ''}
            </div>
            ${cart.map(i => `<div class="item"><span>${i.name} × ${i.quantity}</span><span>${i.price * i.quantity} ج.م</span></div>`).join('')}
            ${deliveryFee > 0 ? `<div class="item"><span>خدمة التوصيل (${selectedZone?.name})</span><span>${deliveryFee} ج.م</span></div>` : ''}
            <div class="divider"></div>
            <div class="total">الإجمالي الكلي: ${totalAmount} ج.م</div>
          </body></html>
        `);
        printWindow.document.close();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
      }

      setCart([]); setCustomerName(''); setCustomerPhone(''); setCustomerAddress(''); setSelectedZoneId('');
      alert("تم إتمام الطلب وطباعة الفاتورة بنجاح! 🚀");
    } catch (e: any) {
      alert("حدث خطأ في حفظ الفاتورة: " + e.message);
    }
  };

  // 🧹 دالة تنظيف التكرار من السحابة
  const clearDuplicates = async () => {
    if (!confirm("هل تريد تنظيف قاعدة البيانات وإزالة التكرارات؟")) return;
    const catSnap = await getDocs(collection(dbCloud, "categories"));
    const seenLabels = new Set();
    for (const d of catSnap.docs) {
      const data = d.data();
      if (seenLabels.has(data.label)) {
        await deleteDoc(doc(dbCloud, "categories", d.id));
      } else {
        seenLabels.add(data.label);
      }
    }
    alert("تم تنظيف الأقسام المكررة بنجاح!");
  };

  return (
    <div className="flex flex-col lg:flex-row flex-1 h-full overflow-hidden bg-slate-100 dir-rtl font-sans">
      
      {/* 🍕 قسم الأصناف والأقسام (اليمين) */}
      <div className="flex-1 flex flex-col p-3 overflow-hidden">
        
        {/* شريط البحث والتحكم */}
        <div className="flex gap-2 mb-3">
          <input
            className="flex-1 p-2.5 rounded-2xl border border-slate-200 text-xs font-bold focus:outline-none bg-white shadow-sm"
            placeholder="بحث عن صنف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={clearDuplicates} title="تنظيف التكرار" className="bg-white p-2.5 rounded-2xl border text-slate-600 hover:text-indigo-600">
            <RefreshCw size={18} />
          </button>
        </div>

        {/* شريط الأقسام المصفى */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
          {categories.map((c: any) => c && (
            <button
              key={c.id || c.label}
              onClick={() => setSelectedCategory(c.label)}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs whitespace-nowrap transition-all shadow-sm ${
                selectedCategory === c.label 
                  ? 'bg-indigo-600 text-white scale-105' 
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {c.emoji || '🍕'} {c.label}
            </button>
          ))}
        </div>

        {/* شبكة الأصناف */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-1">
          {filteredProducts.length === 0 ? (
            <p className="col-span-full text-center py-10 text-slate-400 font-bold text-xs">لا توجد أصناف في قسم {selectedCategory}</p>
          ) : (
            filteredProducts.map(p => (
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
            ))
          )}
        </div>
      </div>

      {/* 🛒 السلة وتفاصيل الطلب (الشمال) */}
      <div className="w-full lg:w-96 bg-white border-r border-slate-200 p-4 flex flex-col shadow-lg">
        <h2 className="font-black text-slate-800 text-base mb-3 flex items-center gap-2 border-b pb-2">
          <ShoppingCart className="text-indigo-600" size={20} />
          <span>سلة الطلبات</span>
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
              className="w-full p-2 rounded-xl border text-xs font-bold bg-white focus:outline-none"
            >
              <option value="">اختر منطقة التوصيل...</option>
              {deliveryZones.map(z => (
                <option key={z.id} value={z.id}>{z.name} (+{z.fee} ج.م)</option>
              ))}
            </select>
            <input
              placeholder="اسم العميل"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="p-2 rounded-xl border text-xs font-bold bg-white focus:outline-none"
            />
            <input
              placeholder="رقم الهاتف"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="p-2 rounded-xl border text-xs font-bold bg-white focus:outline-none"
            />
          </div>
        )}

        {/* قائمة المحتويات */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 my-2 pr-1">
          {cart.length === 0 ? (
            <p className="text-center py-10 text-slate-400 font-bold text-xs">السلة فارغة، اضغط على صنف لإضافته</p>
          ) : (
            cart.map(i => (
              <div key={i.itemKey} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex-1">
                  <h5 className="font-bold text-slate-800 text-xs">{i.name}</h5>
                  <p className="text-indigo-600 font-black text-[11px]">{i.price * i.quantity} ج.م</p>
                </div>
                <div className="flex items-center gap-1 bg-white border rounded-xl p-1 shadow-sm">
                  <button onClick={() => updateQuantity(i.itemKey, -1)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-600">
                    <Minus size={12} />
                  </button>
                  <span className="font-black text-xs px-1.5">{i.quantity}</span>
                  <button onClick={() => updateQuantity(i.itemKey, 1)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-600">
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* الحساب والإجمالي */}
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

      {/* 🍕 مودال اختيار أحجام البيتزا */}
      {activeProductForSizes && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-5 w-full max-w-xs text-right dir-rtl shadow-2xl animate-in fade-in zoom-in duration-150">
            <h3 className="font-black text-slate-900 text-sm mb-3 text-center border-b pb-2">
              {activeProductForSizes.emoji || '🍕'} {activeProductForSizes.name}
            </h3>
            <p className="text-xs text-slate-500 font-bold mb-3 text-center">اختر الحجم المطلوب:</p>
            <div className="flex flex-col gap-2 mb-4">
              {activeProductForSizes.sizes.map((s: any) => (
                <button
                  key={s.id}
                  onClick={() => addToCart(activeProductForSizes, s)}
                  className="flex justify-between items-center p-3 rounded-2xl border border-slate-200 font-black text-xs hover:bg-indigo-50 hover:border-indigo-600 text-slate-800 transition-all active:scale-95"
                >
                  <span>{s.name}</span>
                  <span className="text-indigo-600 font-black">{s.price} ج.م</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setActiveProductForSizes(null)}
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
