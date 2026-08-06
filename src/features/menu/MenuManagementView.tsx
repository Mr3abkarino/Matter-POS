import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/dexie';
import { Plus, Trash2, Edit, FolderPlus, Utensils } from 'lucide-react';

export function MenuManagementView() {
  const categories = useLiveQuery(() => db.categories.toArray()) || [];
  const products = useLiveQuery(() => db.products.toArray()) || [];

  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('🍕');

  const [prodName, setProdName] = useState('');
  const [prodCat, setProdCat] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodEmoji, setProdEmoji] = useState('🍕');

  // إضافة قسم جديد
  const handleAddCategory = async () => {
    if (!newCatLabel) return;
    await db.categories.add({
      id: newCatLabel,
      label: newCatLabel,
      emoji: newCatEmoji || '🍕'
    });
    setNewCatLabel('');
  };

  // إضافة صنف جديد
  const handleAddProduct = async () => {
    if (!prodName || !prodCat || !prodPrice) return;
    await db.products.add({
      id: `p_${Date.now()}`,
      catId: prodCat,
      name: prodName,
      emoji: prodEmoji,
      price: parseFloat(prodPrice),
      stock: 100,
      sizes: []
    });
    setProdName('');
    setProdPrice('');
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الصنف؟')) {
      await db.products.delete(id);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto bg-slate-100 dir-rtl font-sans">
      <h1 className="text-xl md:text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
        <Utensils className="text-indigo-600" size={28} />
        <span>إدارة الأصناف والأقسام</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* إضافة قسم جديد */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-3">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
            <FolderPlus size={18} className="text-indigo-600" />
            <span>إضافة قسم جديد</span>
          </h3>
          <input
            type="text"
            placeholder="اسم القسم (مثلاً: مشويات)"
            value={newCatLabel}
            onChange={(e) => setNewCatLabel(e.target.value)}
            className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none"
          />
          <input
            type="text"
            placeholder="الإيموجي (مثلاً: 🍖)"
            value={newCatEmoji}
            onChange={(e) => setNewCatEmoji(e.target.value)}
            className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none"
          />
          <button
            onClick={handleAddCategory}
            className="bg-indigo-600 text-white py-2.5 rounded-xl font-bold text-xs shadow-md shadow-indigo-200"
          >
            حفظ القسم
          </button>
        </div>

        {/* إضافة صنف جديد */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-3 lg:col-span-2">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
            <Plus size={18} className="text-indigo-600" />
            <span>إضافة صنف للمنيو</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="اسم الصنف"
              value={prodName}
              onChange={(e) => setProdName(e.target.value)}
              className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none"
            />
            <select
              value={prodCat}
              onChange={(e) => setProdCat(e.target.value)}
              className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none"
            >
              <option value="">اختر القسم...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <input
              type="number"
              placeholder="السعر الإفتراضي (ج.م)"
              value={prodPrice}
              onChange={(e) => setProdPrice(e.target.value)}
              className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none"
            />
            <input
              type="text"
              placeholder="الإيموجي (🍕)"
              value={prodEmoji}
              onChange={(e) => setProdEmoji(e.target.value)}
              className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none"
            />
          </div>
          <button
            onClick={handleAddProduct}
            className="bg-indigo-600 text-white py-2.5 rounded-xl font-bold text-xs shadow-md shadow-indigo-200"
          >
            إضافة الصنف للمنيو
          </button>
        </div>
      </div>

      {/* قائمة الأصناف الحالية */}
      <div className="mt-6 bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
        <h3 className="font-bold text-slate-800 text-sm mb-4">قائمة الأصناف الحالية</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map(p => (
            <div key={p.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-xs text-slate-900">{p.emoji} {p.name}</span>
                <p className="text-[10px] text-slate-400">{p.catId} - {p.price} ج.م</p>
              </div>
              <button
                onClick={() => handleDeleteProduct(p.id)}
                className="text-rose-600 bg-rose-50 p-2 rounded-xl hover:bg-rose-100"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
