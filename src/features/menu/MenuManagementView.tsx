import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { dbCloud } from '../../db/firebase';
import { Plus, Trash2, FolderPlus, Utensils } from 'lucide-react';

export function MenuManagementView() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('🍕');

  const [prodName, setProdName] = useState('');
  const [prodCat, setProdCat] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodEmoji, setProdEmoji] = useState('🍕');

  // الاستماع المباشر للتغيرات السحابية
  useEffect(() => {
    const unsubCats = onSnapshot(collection(dbCloud, "categories"), (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubProds = onSnapshot(collection(dbCloud, "products"), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubCats();
      unsubProds();
    };
  }, []);

  // إضافة قسم للسحابة
  const handleAddCategory = async () => {
    if (!newCatLabel) return;
    await addDoc(collection(dbCloud, "categories"), {
      label: newCatLabel,
      emoji: newCatEmoji || '🍕'
    });
    setNewCatLabel('');
  };

  // إضافة صنف للسحابة
  const handleAddProduct = async () => {
    if (!prodName || !prodCat || !prodPrice) return;
    await addDoc(collection(dbCloud, "products"), {
      catId: prodCat,
      name: prodName,
      emoji: prodEmoji,
      price: parseFloat(prodPrice),
      sizes: []
    });
    setProdName('');
    setProdPrice('');
  };

  // حذف صنف من السحابة
  const handleDeleteProduct = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الصنف من المنيو السحابي؟')) {
      await deleteDoc(doc(dbCloud, "products", id));
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto bg-slate-100 dir-rtl font-sans">
      <h1 className="text-xl md:text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
        <Utensils className="text-indigo-600" size={28} />
        <span>إدارة المنيو السحابي</span>
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
            className="bg-slate-50 p-2.5 rounded-xl border text-xs font-bold focus:outline-none"
          />
          <input
            type="text"
            placeholder="الإيموجي (مثلاً: 🍖)"
            value={newCatEmoji}
            onChange={(e) => setNewCatEmoji(e.target.value)}
            className="bg-slate-50 p-2.5 rounded-xl border text-xs font-bold focus:outline-none"
          />
          <button
            onClick={handleAddCategory}
            className="bg-indigo-600 text-white py-2.5 rounded-xl font-bold text-xs shadow-md"
          >
            حفظ القسم أونلاين
          </button>
        </div>

        {/* إضافة صنف جديد */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-3 lg:col-span-2">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
            <Plus size={18} className="text-indigo-600" />
            <span>إضافة صنف للمنيو السحابي</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="اسم الصنف"
              value={prodName}
              onChange={(e) => setProdName(e.target.value)}
              className="bg-slate-50 p-2.5 rounded-xl border text-xs font-bold focus:outline-none"
            />
            <select
              value={prodCat}
              onChange={(e) => setProdCat(e.target.value)}
              className="bg-slate-50 p-2.5 rounded-xl border text-xs font-bold focus:outline-none"
            >
              <option value="">اختر القسم...</option>
              {categories.map(c => <option key={c.id} value={c.label}>{c.label}</option>)}
            </select>
            <input
              type="number"
              placeholder="السعر (ج.م)"
              value={prodPrice}
              onChange={(e) => setProdPrice(e.target.value)}
              className="bg-slate-50 p-2.5 rounded-xl border text-xs font-bold focus:outline-none"
            />
            <input
              type="text"
              placeholder="الإيموجي (🍕)"
              value={prodEmoji}
              onChange={(e) => setProdEmoji(e.target.value)}
              className="bg-slate-50 p-2.5 rounded-xl border text-xs font-bold focus:outline-none"
            />
          </div>
          <button
            onClick={handleAddProduct}
            className="bg-indigo-600 text-white py-2.5 rounded-xl font-bold text-xs shadow-md"
          >
            رفع الصنف للسحابة
          </button>
        </div>
      </div>

      {/* عرض الأصناف المزامنة */}
      <div className="mt-6 bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
        <h3 className="font-bold text-slate-800 text-sm mb-4">الأصناف الحالية على السيرفر السحابي</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map(p => (
            <div key={p.id} className="p-3 bg-slate-50 rounded-2xl border flex justify-between items-center">
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
