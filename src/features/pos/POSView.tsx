import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/dexie';
import { ShoppingCart, Plus, Minus, Printer, Search, X, User, Phone, MapPin, Truck } from 'lucide-react';

export function POSView() {
  const [selectedCategory, setSelectedCategory] = useState('البيتزا');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderType, setOrderType] = useState('تيك أواي');
  const [cart, setCart] = useState<any[]>([]);

  // بيانات الدليفري ومناطق التوصيل
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState<number | ''>('');
  
  const [activeProductForSizes, setActiveProductForSizes] = useState<any>(null);

  const categories = useLiveQuery(() => db.categories.toArray()) || [];
  const allProducts = useLiveQuery(() => db.products.toArray()) || [];
  const deliveryZones = useLiveQuery(() => db.deliveryZones.toArray()) || [];

  // جلب خدمة التوصيل المختارة
  const selectedZone = deliveryZones.find(z => z.id === Number(selectedZoneId));
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

    setCart(prevCart => {
      const existing = prevCart.find(i => i.itemKey === itemKey);
      if (existing) {
        return prevCart.map(i => 
          i.itemKey === itemKey ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, { itemKey, productId: product.id, name: itemName, price: itemPrice, quantity: 1 }];
    });

    setActiveProductForSizes(null);
  };

  const updateQuantity = (itemKey: string, delta: number) => {
    setCart(prevCart => {
      return prevCart.map(i => {
        if (i.itemKey === itemKey) {
          const newQty = i.quantity + delta;
          return newQty > 0 ? { ...i, quantity: newQty } : null;
        }
        return i;
      }).filter(Boolean);
    });
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalAmount = subTotal + deliveryFee;
    
    if (orderType === 'دليفري' && customerPhone) {
      const existingCust = await db.customers.where('phone').equals(customerPhone).first();
      if (!existingCust) {
        await db.customers.add({ name: customerName, phone: customerPhone, address: customerAddress });
      }
    }

    const invoiceData = {
      shiftId: 1,
      items: cart,
      subTotal: subTotal,
      deliveryFee: deliveryFee,
      total: totalAmount,
      orderType: orderType,
      zoneName: selectedZone ? selectedZone.name : '',
      customerName: orderType === 'دليفري' ? customerName : '',
      customerPhone: orderType === 'دليفري' ? customerPhone : '',
      customerAddress: orderType === 'دليفري' ? customerAddress : '',
      createdAt: Date.now()
    };

    const newInvoiceId = await db.invoices.add(invoiceData);

    // طباعة الإيصال مع خدمة التوصيل
    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>فاتورة رقم #${newInvoiceId} - دريم كورنر</title>
            <style>
              body { font-family: 'Cairo', sans-serif; padding: 10px; width: 280px; margin: auto; color: #000; }
              h2, h4 { text-align: center; margin: 4px 0; }
              hr { border: dashed 1px #000; }
              .info { font-size: 12px; margin-bottom: 5px; }
              .item-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px; }
              .total-row { font-weight: bold; font-size: 15px; margin-top: 8px; display: flex; justify-content: space-between; }
              .footer { text-align: center; font-size: 12px; margin-top: 10px; }
              .delivery-box { border: 1px solid #000; padding: 6px; border-radius: 6px; margin: 6px 0; font-size: 12px; }
            </style>
          </head>
          <body>
            <h2>دريم كورنر</h2>
            <h4>طعم يفرق .. جودة تليق بك</h4>
            <div class="footer" style="font-size: 10px;">البرامون - بجوار عيادة د. إلهام العشري</div>
            <hr/>
            <div class="info">رقم الفاتورة: #${newInvoiceId}</div>
            <div class="info">النوع: ${orderType}</div>
            <div class="info">التاريخ: ${new Date().toLocaleString('ar-EG')}</div>
            
            ${orderType === 'دليفري' ? `
              <div class="delivery-box">
                <div><b>العميل:</b> ${customerName || 'غير محدد'}</div>
                <div><b>الهاتف:</b> ${customerPhone || '-'}</div>
                <div><b>المنطقة:</b> ${selectedZone ? selectedZone.name : '-'}</div>
                <div><b>العنوان:</b> ${customerAddress || '-'}</div>
              </div>
            ` : ''}

            <hr/>
            <div>
              ${cart.map(item => `
                <div class="item-row">
                  <span>${item.name} (${item.quantity}x)</span>
                  <span>${item.price * item.quantity} ج.م</span>
                </div>
              `).join('')}
            </div>
            
            ${orderType === 'دليفري' ? `
              <hr/>
              <div class="item-row">
                <span>رسوم التوصيل (${selectedZone?.name || ''}):</span>
                <span>${deliveryFee} ج.م</span>
              </div>
            ` : ''}

            <hr/>
            <div class="total-row">
              <span>الإجمالي الكلي:</span>
              <span>${totalAmount} ج.م</span>
            </div>
            <hr/>
            <div class="footer">
              01006113627
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 400);
    }

    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setSelectedZoneId('');
  };

  const subCartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalCartTotal = subCartTotal + deliveryFee;

  return (
    <div className="flex flex-col lg:flex-row flex-1 h-full overflow-hidden bg-slate-100 relative">
      {/* 1. قائمة الأصناف والأقسام */}
      <div className="flex-1 flex flex-col p-3 overflow-hidden">
        <div className="relative mb-3">
          <Search className="absolute right-3 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="بحث عن صنف أو باركود..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white pr-9 pl-4 py-2 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 text-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 whitespace-nowrap transition-all shadow-sm ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-indigo-200 shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 pr-1">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-500 transition-all cursor-pointer group"
              onClick={() => {
                if (product.sizes && product.sizes.length > 0) {
                  setActiveProductForSizes(product);
                } else {
                  addToCart(product);
                }
              }}
            >
              <div>
                <div className="flex justify-between items-start mb-1.5">
                  <span className="text-2xl">{product.emoji}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-semibold">
                    {product.stock}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-xs group-hover:text-indigo-600 transition-colors">
                  {product.name}
                </h3>
              </div>
              
              <div className="mt-2">
                <div className="text-indigo-600 font-black text-xs">
                  {product.sizes && product.sizes.length > 0 ? `يبدأ من ${product.sizes[0].price} ج.م` : `${product.price} ج.م`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. سلة الطلبات واختيار منطقة التوصيل */}
      <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-r border-slate-200 flex flex-col shadow-lg h-80 lg:h-full">
        {/* أزرار نوع الطلب */}
        <div className="p-2 border-b border-slate-100 bg-slate-50">
          <div className="grid grid-cols-3 gap-1 bg-slate-200 p-1 rounded-xl">
            {['تيك أواي', 'دليفري', 'صالة'].map(type => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  orderType === type 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* خيارات مناطق التوصيل والعميل عند اختيار دليفري */}
          {orderType === 'دليفري' && (
            <div className="mt-2 flex flex-col gap-1.5 p-2 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded-lg border border-slate-200">
                <Truck size={14} className="text-indigo-600" />
                <select
                  value={selectedZoneId}
                  onChange={(e) => setSelectedZoneId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full text-xs bg-transparent focus:outline-none font-bold text-slate-700"
                >
                  <option value="">اختر منطقة التوصيل...</option>
                  {deliveryZones.map(zone => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} ({zone.fee} ج.م)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200">
                <User size={14} className="text-indigo-600" />
                <input
                  type="text"
                  placeholder="اسم العميل..."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs bg-transparent focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200">
                <Phone size={14} className="text-indigo-600" />
                <input
                  type="text"
                  placeholder="رقم التليفون..."
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full text-xs bg-transparent focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200">
                <MapPin size={14} className="text-indigo-600" />
                <input
                  type="text"
                  placeholder="تفاصيل العنوان..."
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full text-xs bg-transparent focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* عناصر السلة */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
          {cart.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 gap-2 py-4">
              <ShoppingCart size={22} strokeWidth={1.5} />
              <p className="font-semibold text-xs">السلة فارغة حالياً</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.itemKey} className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-xs">{item.name}</h4>
                  <span className="text-indigo-600 font-bold text-[11px]">{item.price * item.quantity} ج.م</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQuantity(item.itemKey, -1)}
                    className="w-6 h-6 bg-white rounded-md border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="font-bold text-xs w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.itemKey, 1)}
                    className="w-6 h-6 bg-white rounded-md border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ملخص السلة والتوصيل */}
        <div className="p-2.5 border-t border-slate-100 bg-slate-50 flex flex-col gap-2">
          {orderType === 'دليفري' && (
            <div className="flex justify-between text-xs text-slate-500 font-semibold border-b border-slate-200 pb-1.5">
              <span>خدمة التوصيل ({selectedZone ? selectedZone.name : 'غير ممتد'}):</span>
              <span className="font-bold text-slate-800">{deliveryFee} ج.م</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-bold text-slate-600 text-[11px]">الإجمالي الكلي:</span>
              <span className="font-black text-base text-indigo-600">{finalCartTotal} ج.م</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-200 transition-all"
            >
              <Printer size={16} />
              <span>حفظ وطباعة الفاتورة</span>
            </button>
          </div>
        </div>
      </div>

      {/* النافذة المنبثقة للأحجام */}
      {activeProductForSizes && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeProductForSizes.emoji}</span>
                <h3 className="font-black text-slate-900 text-base">{activeProductForSizes.name}</h3>
              </div>
              <button
                onClick={() => setActiveProductForSizes(null)}
                className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs font-bold text-slate-500 text-center">اختر الحجم المطلوب:</p>

            <div className="flex flex-col gap-2">
              {activeProductForSizes.sizes.map((size: any) => (
                <button
                  key={size.id}
                  onClick={() => addToCart(activeProductForSizes, size)}
                  className="flex justify-between items-center p-3.5 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-2xl border border-slate-200 transition-all font-bold text-slate-800 group"
                >
                  <span className="text-sm">{size.name}</span>
                  <span className="text-indigo-600 group-hover:text-white font-black text-sm">{size.price} ج.م</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
