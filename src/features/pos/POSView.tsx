import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/dexie';
import { useCartStore } from '../../store/useCartStore';
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner';
import { Product, ProductSize } from '../../types';
import { Search, ShoppingCart, Plus, Minus, Trash2, CheckCircle } from 'lucide-react';

export const POSView: React.FC = () => {
  const [activeCat, setActiveCat] = useState<string>('البيتزا');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
  const [activeSize, setActiveSize] = useState<ProductSize | null>(null);
  const [stuffedCrust, setStuffedCrust] = useState<boolean>(false);

  const { 
    cart, addToCart, removeFromCart, updateQty, 
    orderType, setOrderType, getSubtotal, getTotal, clearCart 
  } = useCartStore();

  const categories = useLiveQuery(() => db.categories.toArray(), []) || [];
  const products = useLiveQuery(() => db.products.toArray(), []) || [];

  useBarcodeScanner((barcode) => {
    const foundProduct = products.find((p) => p.barcode === barcode);
    if (foundProduct) {
      if (foundProduct.sizes && foundProduct.sizes.length > 0) {
        setSelectedProductModal(foundProduct);
        setActiveSize(foundProduct.sizes[0]);
      } else {
        addToCart(foundProduct);
      }
    }
  });

  const handleProductClick = (p: Product) => {
    if (p.stock <= 0) return;
    if (p.sizes && p.sizes.length > 0) {
      setSelectedProductModal(p);
      setActiveSize(p.sizes[0]);
      setStuffedCrust(false);
    } else {
      addToCart(p);
    }
  };

  const handleConfirmModalAdd = () => {
    if (selectedProductModal) {
      addToCart(selectedProductModal, activeSize || undefined, stuffedCrust);
      setSelectedProductModal(null);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    await db.invoices.add({
      shiftId: 1,
      ticketNo: (await db.invoices.count()) + 1,
      subtotal: getSubtotal(),
      deliveryFee: orderType === 'delivery' ? 20 : 0,
      total: getTotal(),
      orderType,
      status: 'completed',
      cashierName: 'محمد مطر',
      items: [...cart],
      createdAt: Date.now(),
      dateStr: new Date().toLocaleDateString('ar-EG'),
      timeStr: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    });

    for (const item of cart) {
      const prod = await db.products.get(item.productId);
      if (prod) {
        await db.products.update(item.productId, { stock: Math.max(0, prod.stock - item.qty) });
      }
    }

    clearCart();
    alert('✅ تم إتمام البيع وحفظ الفاتورة في قاعدة البيانات بنجاح!');
  };

  const filteredProducts = products.filter(
    (p) => p.catId === activeCat && p.name.includes(searchQuery)
  );

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-slate-100 dir-rtl">
      
      <div className="flex-1 flex flex-col min-w-0 border-l border-slate-200">
        <div className="bg-white p-3 border-b flex flex-wrap justify-between items-center gap-2 shadow-xs shrink-0">
          <div className="flex gap-2 overflow-x-auto py-1">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeCat === c.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{c.emoji || '🍽️'}</span> {c.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute right-3 top-2.5 text-slate-400" size={16} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث صنف أو باركود..."
              className="w-full h-9 bg-slate-100 rounded-xl pr-9 pl-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-36">
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => handleProductClick(p)}
                disabled={p.stock <= 0}
                className={`bg-white rounded-2xl border border-slate-200 p-3 flex flex-col items-center text-center relative hover:shadow-lg transition-all ${
                  p.stock <= 0 ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'
                }`}
              >
                <span className={`absolute top-2 left-2 text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                  p.stock <= 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {p.stock <= 0 ? 'نفذت' : `${p.stock} قطعة`}
                </span>

                <div className="w-12 h-12 my-2 flex items-center justify-center text-3xl bg-slate-50 rounded-2xl">
                  {p.emoji || '🍕'}
                </div>

                <div className="font-bold text-xs text-slate-800 leading-snug">{p.name}</div>
                <div className="text-indigo-600 font-black text-xs mt-1">
                  {p.sizes ? `${p.sizes[0].price} ج.م` : `${p.price} ج.م`}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <aside className="w-full md:w-[360px] shrink-0 bg-white flex flex-col border-r border-slate-200 shadow-2xl">
        <div className="p-4 border-b bg-slate-50 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-black text-sm text-slate-900">سلة طلبات الوردية</span>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-xs text-rose-600 font-bold hover:underline">تصفير السلة</button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1 bg-slate-200 p-1 rounded-xl font-bold text-xs">
            {(['takeaway', 'delivery', 'dinein'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`py-1.5 rounded-lg transition-all ${
                  orderType === type ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                {type === 'takeaway' ? 'تيك أواي' : type === 'delivery' ? 'دليفري' : 'صالة'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
              <ShoppingCart size={40} className="stroke-1" />
              <p className="text-xs font-bold">السلة فارغة حالياً</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.itemKey} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex justify-between items-center">
                <div className="min-w-0">
                  <h4 className="font-bold text-xs truncate">{item.name}</h4>
                  <p className="text-[11px] text-indigo-600 font-semibold">{item.unitPrice} ج.م × {item.qty}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button onClick={() => updateQty(item.itemKey, -1)} className="p-1 bg-white border rounded-lg text-slate-600"><Minus size={12} /></button>
                  <span className="font-black text-xs w-5 text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item.itemKey, 1)} className="p-1 bg-white border rounded-lg text-slate-600"><Plus size={12} /></button>
                  <button onClick={() => removeFromCart(item.itemKey)} className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t bg-slate-50 space-y-3">
          <div className="space-y-1 text-xs font-bold">
            <div className="flex justify-between text-slate-500"><span>المبلغ الفرعي:</span><span>{getSubtotal()} ج.م</span></div>
            {orderType === 'delivery' && (
              <div className="flex justify-between text-indigo-600"><span>خدمة التوصيل:</span><span>20 ج.م</span></div>
            )}
            <div className="flex justify-between text-slate-900 text-sm font-black pt-1 border-t">
              <span>الإجمالي الكلي:</span><span className="text-indigo-600">{getTotal()} ج.م</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
          >
            <CheckCircle size={16} />
            <span>إتمام البيع وحفظ الفاتورة</span>
          </button>
        </div>
      </aside>

      {selectedProductModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl dir-rtl">
            <h3 className="font-black text-slate-900 border-b pb-2">{selectedProductModal.name}</h3>

            {selectedProductModal.sizes && (
              <div className="grid grid-cols-3 gap-2">
                {selectedProductModal.sizes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSize(s)}
                    className={`py-2 rounded-xl border text-xs font-bold ${
                      activeSize?.id === s.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-black' : 'border-slate-200'
                    }`}
                  >
                    <div>{s.name}</div>
                    <div className="text-[10px] text-indigo-600">{s.price} ج.م</div>
                  </button>
                ))}
              </div>
            )}

            {selectedProductModal.catId === 'البيتزا' && (
              <label className="flex items-center gap-2 text-xs font-bold text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stuffedCrust}
                  onChange={(e) => setStuffedCrust(e.target.checked)}
                  className="rounded text-amber-600"
                />
                <span>إضافة حشو أطراف بالجبنة 🧀</span>
              </label>
            )}

            <button
              onClick={handleConfirmModalAdd}
              className="w-full h-11 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-md"
            >
              تأكيد وإضافة للسلة
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
