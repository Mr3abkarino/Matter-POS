import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { dbCloud } from '../../db/firebase';
import { Plus, Trash2, FolderPlus, Utensils, CloudUpload } from 'lucide-react';

export function MenuManagementView() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('🍕');

  const [prodName, setProdName] = useState('');
  const [prodCat, setProdCat] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodEmoji, setProdEmoji] = useState('🍕');

  // 🔄 المزامنة اللحظية للأصناف والأقسام مع Firebase
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

  // 🚀 دالة رفع المنيو والمناطق الأساسية للسحابة
  const seedInitialData = async () => {
    try {
      const catSnap = await getDocs(collection(dbCloud, "categories"));
      if (!catSnap.empty) {
        if (!confirm("البيانات موجودة بالفعل على السحابة، هل تريد إضافة المنيو الافتراضي مرة أخرى؟")) {
          return;
        }
      }

      // 1. الأقسام
      const defaultCats = [
        { label: 'البيتزا', emoji: '🍕' },
        { label: 'السندوتشات', emoji: '🥪' },
        { label: 'البرجر', emoji: '🍔' },
        { label: 'التوست', emoji: '🍞' },
        { label: 'الأصناف الجانبية', emoji: '🍟' },
        { label: 'المشروبات', emoji: '🥤' }
      ];
      for (const c of defaultCats) {
        await addDoc(collection(dbCloud, "categories"), c);
      }

      // 2. مناطق الدليفري
      const defaultZones = [
        { name: 'البرامون (داخل البلد)', fee: 10 },
        { name: 'البرامون (بر الترعة)', fee: 20 },
        { name: 'سرسو البرامون', fee: 30 },
        { name: 'كفر بدواي', fee: 50 },
        { name: 'الخيارية', fee: 50 },
        { name: 'كفر البرامون', fee: 40 },
        { name: 'البدالة', fee: 40 }
      ];
      for (const z of defaultZones) {
        await addDoc(collection(dbCloud, "deliveryZones"), z);
      }

      alert("تم رفع المنيو ومناطق الدليفري بنجاح إلى Firebase! 🚀");
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء الرفع، تأكد من إعدادات Firebase");
    }
  };

  const handleAddCategory = async () => {
    if (!newCatLabel) return;
    await addDoc(collection(dbCloud, "categories"), {
      label: newCatLabel,
      emoji: newCatEmoji || '🍕'
    });
    setNewCatLabel('');
  };

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

  const handleDeleteProduct = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الصنف من المنيو السحابي؟')) {
      await deleteDoc(doc(dbCloud, "products", id));
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto bg-slate-100 dir-rtl font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
          <Utensils className="text-indigo-600" size={28} />
          <span>إدارة المنيو السحابي</span>
        </h1>

        {/* 🔘 زرار الرفع الأخضر */}
        <button
          onClick={seedInitialData}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-md transition-all active:scale-95"
        >
          <CloudUpload size={18} />
          <span>رفع المنيو والمناطق الأساسية للسحابة</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* إضافة قسم جديد */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-3">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
            <FolderPlus size={18} className="text-indigo-600" />
            <span>إضافة قسم جديد</span>
          </h3>
          <input
            type="text"
            placeholder="اسم القسم (مثل: بيتزا)"
            value={newCatLabel}
            onChange={(e) => setNewCatLabel(e.target.value)}
            className="bg-slate-50 p-2.5 rounded-xl border text-xs font-bold focus:outline-none"
          />
          <input
            type="text"
            placeholder="الإيموجي (🍕)"
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
        <h3 className="font-bold text-slate-800 text-sm mb-4">الأصناف الحالية على السيرفر السحابي ({products.length})</h3>
        {products.length === 0 ? (
          <p className="text-slate-400 text-center py-6 text-xs font-bold">لا توجد أصناف في السحابة حتى الآن، اضغط على زر الرفع أعلى اليسار.</p>
        ) : (
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
        )}
      </div>
    </div>
  );
}
