import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/dexie';
import { ShoppingCart, Plus, Minus, Printer, Search } from 'lucide-react';

export function POSView() {
  const [selectedCategory, setSelectedCategory] = useState('البيتزا');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderType, orderTypeSetter] = useState('تيك أواي');
  const [cart, setCart] = useState<any[]>([]);

  // جلب التصنيفات وكل المنتجات من قاعدة البيانات المحلية
  const categories = useLiveQuery(() => db.categories.toArray()) || [];
  const allProducts = useLiveQuery(() => db.products.toArray()) || [];

  // تصفية المنتجات حسب القسم المحدد وحسب بحث المستخدم بمرونة كاملة
  const filteredProducts = allProducts.filter(p => {
    const matchCategory = p.catId === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // إضافة منتج للسلة
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
  };

  // تعديل الكمية
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

  // إتمام الطلب والطباعة الحرارية الحقيقية
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const invoiceData = {
      shiftId: 1,
      items: cart,
      total: totalAmount,
      orderType: orderType,
      createdAt: Date.now()
    };

    // حفظ الفاتورة في قاعدة البيانات
    const newInvoiceId = await db.invoices.add(invoiceData);

    // طباعة الفاتورة الحرارية
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
            </style>
          </head>
          <body>
            <h2>دريم كورنر</h2>
            <h4>بيتزا وسندوتشات</h4>
            <div class="footer" style="font-size: 10px;">البرامون - بجوار عيادة د. إلهام العشري</div>
            <hr/>
            <div class="info">رقم الفاتورة: #${newInvoiceId}</div>
            <div class="info">النوع: ${orderType}</div>
            <div class="info">التاريخ: ${new Date().toLocaleString('ar-EG')}</div>
            <hr/>
            <div>
              ${cart.map(item => `
                <div class="item-row">
                  <span>${item.name} (${item.quantity}x)</span>
                  <span>${item.price * item.quantity} ج.م</span>
                </div>
              `).join('')}
            </div>
            <hr/>
            <div class="total-row">
              <span>الإجمالي الصافي:</span>
              <span>${totalAmount} ج.م</span>
            </div>
            <hr/>
            <div class="footer">
              شكراً لزيارتكم!<br/>
              خدمة سريعة - جودة عالية<br/>
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

    // تفريغ السلة
    setCart([]);
  };

  const totalCartPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="flex flex-col lg:flex-row flex-1 h-full overflow-hidden bg-slate-100">
      {/* القسم الأول: المنتجات والأقسام (يأخذ المساحة الأكبر على الهاتف) */}
      <div className="flex-1 flex flex-col p-3 overflow-hidden">
        {/* شريط البحث */}
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

        {/* أقسام المنيو */}
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

        {/* شبكة المنتجات */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 pr-1">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-500 transition-all cursor-pointer group"
              onClick={() => {
                if (product.sizes && product.sizes.length > 0) {
                  addToCart(product, product.sizes[1] || product.sizes[0]);
                } else {
                  addToCart(product);
                }
              }}
            >
              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xl">{product.emoji}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-semibold">
                    {product.stock}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-xs group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {product.name}
                </h3>
              </div>
              
              <div className="mt-2">
                {product.sizes && product.sizes.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {product.sizes.map((s: any) => (
                      <button
                        key={s.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product, s);
                        }}
                        className="text-[10px] bg-slate-100 hover:bg-indigo-600 hover:text-white px-1.5 py-0.5 rounded transition-colors font-bold text-slate-700"
                      >
                        {s.name}: {s.price}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-indigo-600 font-black text-xs">
                    {product.price} ج.م
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* القسم الثاني: سلة الطلبات الجانبية (مدمجة وصغيرة على الهاتف h-48، وكاملة على الكمبيوتر lg:w-96) */}
      <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-r border-slate-200 flex flex-col shadow-lg h-44 lg:h-full">
        {/* نوع الطلب */}
        <div className="p-2 border-b border-slate-100 hidden lg:block">
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
            {['تيك أواي', 'دليفري', 'صالة'].map(type => (
              <button
                key={type}
                onClick={() => orderTypeSetter(type)}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  orderType === type ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* عناصر السلة */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
          {cart.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 gap-2 py-2">
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

        {/* الملخص وإتمام الدفع */}
        <div className="p-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between lg:flex-col lg:items-stretch gap-2">
          <div className="flex lg:justify-between items-center gap-2">
            <span className="font-bold text-slate-600 text-xs">الإجمالي:</span>
            <span className="font-black text-base text-indigo-600">{totalCartPrice} ج.م</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="flex-1 lg:flex-none bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-200 transition-all"
          >
            <Printer size={16} />
            <span>حفظ وطباعة الفاتورة</span>
          </button>
        </div>
      </div>
    </div>
  );
}
