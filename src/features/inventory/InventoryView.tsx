import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/dexie';
import { Product } from '../../types';
import { Package, Plus, Edit3, Tag, Search, X } from 'lucide-react';

export const InventoryView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // فورم إضافة صنف جديد
  const [newName, setNewName] = useState('');
  const [newCatId, setNewCatId] = useState('البيتزا');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');
  const [hasSizes, setHasSizes] = useState(false);
  const [smallPrice, setSmallPrice] = useState('');
  const [medPrice, setMedPrice] = useState('');
  const [largePrice, setLargePrice] = useState('');

  // فورم إضافة قسم جديد
  const [newCatIdInput, setNewCatIdInput] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('🍕');

  // جلب البيانات من IndexedDB
  const products = useLiveQuery(() => db.products.toArray(), []) || [];
  const categories = useLiveQuery(() => db.categories.toArray(), []) || [];

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice) return;

    const basePrice = Number(newPrice);
    const sizes = hasSizes ? [
      { id: 'sm', name: 'صغير', price: Number(smallPrice) || basePrice },
      { id: 'md', name: 'وسط', price: Number(medPrice) || basePrice + 25 },
      { id: 'lg', name: 'كبير', price: Number(largePrice) || basePrice + 45 },
    ] : undefined;

    await db.products.add({
      catId: newCatId,
      name: newName,
      price: basePrice,
      stock: Number(newStock) || 10,
      emoji: '📦',
      sizes,
      createdAt: Date.now(),
    });

    setNewName(''); setNewPrice(''); setNewStock(''); setHasSizes(false);
    setShowAddModal(false);
    alert('✅ تم إضافة الصنف بنجاح للمخزون!');
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatIdInput) return;

    await db.categories.add({
      id: newCatIdInput,
      label: newCatIdInput,
      emoji: newCatEmoji,
    });

    setNewCatIdInput('');
    setShowCategoryModal(false);
    alert('✅ تم إضافة القسم بنجاح!');
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.id) return;

    await db.products.update(editingProduct.id, {
      name: editingProduct.name,
      price: editingProduct.price,
      stock: editingProduct.stock,
    });

    setEditingProduct(null);
    alert('✅ تم تحديث بيانات الصنف بنجاح!');
  };

  const filteredProducts = products.filter((p) => p.name.includes(searchQuery));

  return (
    <div className="flex-1 bg-slate-50 p-4 sm:p-6 overflow-y-auto space-y-6 dir-rtl">
      
      {/* الهيدر وأزرار التحكم */}
      <div className="flex flex-wrap justify-between items-center gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Package className="text-indigo-600" /> إدارة المخزون والأصناف
          </h2>
          <p className="text-xs text-slate-400 font-bold mt-1">إجمالي المنتجات المسجلة: {products.length} صنف</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
          >
            <Tag size={15} /> قسم جديد
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
          >
            <Plus size={15} /> صنف جديد
          </button>
        </div>
      </div>

      {/* البحث */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute right-3 top-2.5 text-slate-400" size={16} />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث عن صنف في المخزن..."
          className="w-full h-10 bg-white border border-slate-200 rounded-xl pr-9 pl-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* جدول المخزون */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-50 border-b font-black text-slate-600">
            <tr>
              <th className="p-3">الصنف</th>
              <th className="p-3">القسم</th>
              <th className="p-3">السعر الأساسي</th>
              <th className="p-3">الأحجام والمتغيرات</th>
              <th className="p-3">المخزن</th>
              <th className="p-3 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y font-bold">
            {filteredProducts.map((p) => (
              <tr key={p.id}>
                <td className="p-3 flex items-center gap-2">
                  <span className="text-xl">{p.emoji || '📦'}</span>
                  <span>{p.name}</span>
                </td>
                <td className="p-3 text-indigo-600">{p.catId}</td>
                <td className="p-3">{p.price} ج.م</td>
                <td className="p-3 text-slate-500">
                  {p.sizes ? p.sizes.map((s) => `${s.name}: ${s.price}ج`).join(' | ') : 'حجم موحد'}
                </td>
                <td className="p-3 font-black text-slate-800">{p.stock} قطعة</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => setEditingProduct(p)}
                    className="px-3 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl font-bold flex items-center gap-1 mx-auto"
                  >
                    <Edit3 size={13} /> تعديل
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal إضافة صنف جديد */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddProduct} className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 font-black text-slate-900">
              <span>إضافة صنف جديد للمخزن</span>
              <button type="button" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">القسم</label>
                <select
                  value={newCatId}
                  onChange={(e) => setNewCatId(e.target.value)}
                  className="w-full h-9 border rounded-xl px-3 font-bold bg-white outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">اسم الصنف</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="مثال: بيتزا رانش..."
                  className="w-full h-9 border rounded-xl px-3 font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">السعر الأساسي</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="70"
                    className="w-full h-9 border rounded-xl px-3 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">الكمية بالمخزن</label>
                  <input
                    type="number"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    placeholder="50"
                    className="w-full h-9 border rounded-xl px-3 font-bold outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t">
                <label className="flex items-center gap-2 font-bold text-indigo-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasSizes}
                    onChange={(e) => setHasSizes(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>تفعيل أحجام متعددة (صغير / وسط / كبير)</span>
                </label>

                {hasSizes && (
                  <div className="mt-2 space-y-2 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                    <div className="flex justify-between items-center">
                      <span>صغير:</span>
                      <input type="number" value={smallPrice} onChange={(e) => setSmallPrice(e.target.value)} placeholder="السعر" className="w-20 h-7 border rounded px-2 bg-white text-center" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>وسط:</span>
                      <input type="number" value={medPrice} onChange={(e) => setMedPrice(e.target.value)} placeholder="السعر" className="w-20 h-7 border rounded px-2 bg-white text-center" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>كبير:</span>
                      <input type="number" value={largePrice} onChange={(e) => setLargePrice(e.target.value)} placeholder="السعر" className="w-20 h-7 border rounded px-2 bg-white text-center" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button type="submit" className="w-full h-10 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-md">
              حفظ الصنف في المخزن
            </button>
          </form>
        </div>
      )}

      {/* Modal إضافة قسم جديد */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddCategory} className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 font-black text-slate-900">
              <span>إضافة قسم جديد</span>
              <button type="button" onClick={() => setShowCategoryModal(false)}><X size={18} /></button>
            </div>

            <div className="space-y-3 text-xs">
              <input
                type="text"
                required
                value={newCatIdInput}
                onChange={(e) => setNewCatIdInput(e.target.value)}
                placeholder="اسم القسم (مثل: مقبلات)..."
                className="w-full h-9 border rounded-xl px-3 font-bold outline-none"
              />
              <input
                type="text"
                value={newCatEmoji}
                onChange={(e) => setNewCatEmoji(e.target.value)}
                placeholder="رمز الإيموجي (Emoji)..."
                className="w-full h-9 border rounded-xl px-3 font-bold outline-none"
              />
            </div>

            <button type="submit" className="w-full h-10 bg-emerald-600 text-white font-black text-xs rounded-xl shadow-md">
              حفظ القسم
            </button>
          </form>
        </div>
      )}

      {/* Modal تعديل صنف */}
      {editingProduct && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleUpdateProduct} className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 font-black text-slate-900">
              <span>تعديل الصنف: {editingProduct.name}</span>
              <button type="button" onClick={() => setEditingProduct(null)}><X size={18} /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">اسم الصنف</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full h-9 border rounded-xl px-3 font-bold outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-600 block mb-1">السعر الأساسي</label>
                <input
                  type="number"
                  required
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                  className="w-full h-9 border rounded-xl px-3 font-bold outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-600 block mb-1">الكمية بالمخزن</label>
                <input
                  type="number"
                  required
                  value={editingProduct.stock}
                  onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                  className="w-full h-9 border rounded-xl px-3 font-bold outline-none"
                />
              </div>
            </div>

            <button type="submit" className="w-full h-10 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-md">
              حفظ التعديلات
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
