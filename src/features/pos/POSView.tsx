import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import { dbCloud } from '../../db/firebase';
import { ShoppingCart, Plus, Minus, Printer, Search, X, User, Phone, MapPin, Truck } from 'lucide-react';

export function POSView() {
  const [selectedCategory, setSelectedCategory] = useState('البيتزا');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderType, setOrderType] = useState('تيك أواي');
  const [cart, setCart] = useState<any[]>([]);

  // الحالات السحابية
  const [categories, setCategories] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);

  // حالات العميل والدليفري
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  
  const [activeProductForSizes, setActiveProductForSizes] = useState<any>(null);

  // 🔄 المزامنة اللحظية (Real-time Sync)
  useEffect(() => {
    const unsubCats = onSnapshot(collection(dbCloud, "categories"), (snap) => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubProds = onSnapshot(collection(dbCloud, "products"), (snap) => {
      setAllProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubZones = onSnapshot(collection(dbCloud, "deliveryZones"), (snap) => {
      setDeliveryZones(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubCats(); unsubProds(); unsubZones(); };
  }, []);

  const selectedZone = deliveryZones.find(z => z.id === selectedZoneId);
  const deliveryFee = orderType === 'دليفري' && selectedZone ? selectedZone.fee : 0;

  const filteredProducts = allProducts.filter(p => {
    const matchCategory = p.catId === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const addToCart = (product: any, size?: any) => {
    const itemKey = size ? `${product.id}-${size.id}` : `${product.id}`;
    const itemName = size ? `${product.name} (${size.name})` : product.name;
    const itemPrice = size ? size.price : product.price;

    setCart(prev => {
      const existing = prev.find(i => i.itemKey === itemKey);
      if (existing) return prev.map(i => i.itemKey === itemKey ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { itemKey, productId: product.id, name: itemName, price: itemPrice, quantity: 1 }];
    });
    setActiveProductForSizes(null);
  };

  const updateQuantity = (itemKey: string, delta: number) => {
    setCart(prev => prev.map(i => i.itemKey === itemKey ? { ...i, quantity: i.quantity + delta } : i).filter(i => i.quantity > 0));
  };

  // 💾 حفظ الفاتورة في السحابة وطباعتها
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalAmount = subTotal + deliveryFee;

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

    // حفظ في Firebase
    await addDoc(collection(dbCloud, "invoices"), invoiceData);

    // الطباعة الاحترافية
    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl"><head>
        <style>
          body { font-family: Tahoma; width: 280px; margin: auto; font-weight: 800; }
          .divider { border-top: 2px dashed #000; margin: 6px 0; }
          .info { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px; }
          .total { border: 2.5px solid #000; padding: 6px; font-size: 14px; display: flex; justify-content: space-between; margin-top: 6px; }
        </style></head>
        <body>
          <h2 style="text-align:center; margin:0">DREAM CORNER</h2>
          <div class="divider"></div>
          ${cart.map(i => `<div class="info"><span>${i.name} (${i.quantity}x)</span><span>${i.price * i.quantity} ج.م</span></div>`).join('')}
          <div class="total"><span>الصافي:</span><span>${totalAmount} ج.م</span></div>
        </body></html>
      `);
      printWindow.document.close();
      setTimeout(() => { printWindow.print(); printWindow.close(); }, 350);
    }

    setCart([]); setCustomerName(''); setCustomerPhone(''); setCustomerAddress(''); setSelectedZoneId('');
  };

  return (
    <div className="flex flex-col lg:flex-row flex-1 h-full overflow-hidden bg-slate-100 dir-rtl">
      {/* الأصناف */}
      <div className="flex-1 p-3 overflow-hidden">
        <input className="w-full p-2 mb-3 rounded-xl border" placeholder="بحث..." onChange={(e) => setSearchQuery(e.target.value)} />
        <div className="flex gap-2 overflow-x-auto pb-3">
          {categories.map(c => (
            <button key={c.id} onClick={() => setSelectedCategory(c.label)} className={`px-4 py-2 rounded-xl font-bold text-xs ${selectedCategory === c.label ? 'bg-indigo-600 text-white' : 'bg-white'}`}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredProducts.map(p => (
            <div key={p.id} className="bg-white p-3 rounded-xl border cursor-pointer" onClick={() => p.sizes?.length ? setActiveProductForSizes(p) : addToCart(p)}>
              <span className="text-xl">{p.emoji}</span>
              <h4 className="font-bold text-xs">{p.name}</h4>
              <p className="text-indigo-600 font-bold text-xs">{p.price} ج.م</p>
            </div>
          ))}
        </div>
      </div>

      {/* السلة */}
      <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 p-3 flex flex-col">
        {orderType === 'دليفري' && (
          <select onChange={(e) => setSelectedZoneId(e.target.value)} className="w-full p-2 mb-2 rounded-lg border text-xs">
            <option value="">اختر المنطقة...</option>
            {deliveryZones.map(z => <option key={z.id} value={z.id}>{z.name} ({z.fee} ج.م)</option>)}
          </select>
        )}
        <div className="flex-1 overflow-y-auto">
          {cart.map(i => (
            <div key={i.itemKey} className="flex justify-between p-2 border-b text-xs font-bold">
              <span>{i.name} ({i.quantity})</span>
              <span>{i.price * i.quantity} ج.م</span>
            </div>
          ))}
        </div>
        <button onClick={handleCheckout} className="bg-indigo-600 text-white p-3 rounded-xl font-black mt-2">
          إجمالي: {cart.reduce((s, i) => s + (i.price * i.quantity), 0) + deliveryFee} ج.م
        </button>
      </div>
    </div>
  );
}
