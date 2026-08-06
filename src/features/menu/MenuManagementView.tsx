import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { dbCloud } from '../../db/firebase';
import { Plus, Trash2, FolderPlus, Utensils, UploadCloud, CheckCircle2 } from 'lucide-react';

export function MenuManagementView() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('🍕');

  const [prodName, setProdName] = useState('');
  const [prodCat, setProdCat] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodEmoji, setProdEmoji] = useState('🍕');

  // 🔄 المزامنة اللحظية مع Firebase
  useEffect(() => {
    const unsubCats = onSnapshot(collection(dbCloud, "categories"), (snapshot) => {
      setCategories(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error("Firestore Cat Error:", err));

    const unsubProds = onSnapshot(collection(dbCloud, "products"), (snapshot) => {
      setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error("Firestore Prod Error:", err));

    return () => {
      unsubCats();
      unsubProds();
    };
  }, []);

  // 🚀 رفع منيو دريم كورنر الحقيقي بالكامل للسحابة
  const seedBulkData = async () => {
    setLoading(true);
    try {
      // 1. الأقسام
      const defaultCats = [
        { label: 'البيتزا', emoji: '🍕' },
        { label: 'سندوتشات اللحوم', emoji: '🥩' },
        { label: 'سندوتشات الدجاج', emoji: '🍗' },
        { label: 'البرجر', emoji: '🍔' },
        { label: 'التوست', emoji: '🍞' },
        { label: 'الأصناف الجانبية', emoji: '🍟' },
        { label: 'المشروبات', emoji: '🥤' }
      ];

      for (const c of defaultCats) {
        await addDoc(collection(dbCloud, "categories"), c);
      }

      // 2. أصناف منيو دريم كورنر بالأسعار والأحجام الحقيقية
      const defaultProducts = [
        // --- البيتزا ---
        { catId: 'البيتزا', name: 'بيتزا مارجريتا', price: 45, emoji: '🍕', sizes: [{ id: 's', name: 'صغير', price: 45 }, { id: 'm', name: 'وسط', price: 70 }, { id: 'l', name: 'كبير', price: 90 }] },
        { catId: 'البيتزا', name: 'بيتزا ميكس جبنة', price: 75, emoji: '🍕', sizes: [{ id: 's', name: 'صغير', price: 75 }, { id: 'm', name: 'وسط', price: 105 }, { id: 'l', name: 'كبير', price: 135 }] },
        { catId: 'البيتزا', name: 'بيتزا خضروات', price: 60, emoji: '🍕', sizes: [{ id: 's', name: 'صغير', price: 60 }, { id: 'm', name: 'وسط', price: 90 }, { id: 'l', name: 'كبير', price: 120 }] },
        { catId: 'البيتزا', name: 'بيتزا هوت دوج', price: 70, emoji: '🍕', sizes: [{ id: 's', name: 'صغير', price: 70 }, { id: 'm', name: 'وسط', price: 100 }, { id: 'l', name: 'كبير', price: 135 }] },
        { catId: 'البيتزا', name: 'بيتزا سجق', price: 70, emoji: '🍕', sizes: [{ id: 's', name: 'صغير', price: 70 }, { id: 'm', name: 'وسط', price: 100 }, { id: 'l', name: 'كبير', price: 135 }] },
        { catId: 'البيتزا', name: 'بيتزا لحم مفروم', price: 80, emoji: '🍕', sizes: [{ id: 's', name: 'صغير', price: 80 }, { id: 'm', name: 'وسط', price: 120 }, { id: 'l', name: 'كبير', price: 150 }] },
        { catId: 'البيتزا', name: 'بيتزا بيبروني', price: 70, emoji: '🍕', sizes: [{ id: 's', name: 'صغير', price: 70 }, { id: 'm', name: 'وسط', price: 90 }, { id: 'l', name: 'كبير', price: 110 }] },
        { catId: 'البيتزا', name: 'بيتزا سلامي', price: 80, emoji: '🍕', sizes: [{ id: 's', name: 'صغير', price: 80 }, { id: 'm', name: 'وسط', price: 120 }, { id: 'l', name: 'كبير', price: 135 }] },
        { catId: 'البيتزا', name: 'بيتزا شاورما دجاج', price: 80, emoji: '🍕', sizes: [{ id: 's', name: 'صغير', price: 80 }, { id: 'm', name: 'وسط', price: 120 }, { id: 'l', name: 'كبير', price: 155 }] },
        { catId: 'البيتزا', name: 'بيتزا دجاج رانش', price: 80, emoji: '🍕', sizes: [{ id: 's', name: 'صغير', price: 80 }, { id: 'm', name: 'وسط', price: 120 }, { id: 'l', name: 'كبير', price: 155 }] },
        { catId: 'البيتزا', name: 'بيتزا دريم كورنر (سبيشيال)', price: 110, emoji: '🍕', sizes: [{ id: 's', name: 'صغير', price: 110 }, { id: 'm', name: 'وسط', price: 135 }, { id: 'l', name: 'كبير', price: 180 }] },
        { catId: 'البيتزا', name: 'بيتزا كرانشي (حار أو بارد)', price: 90, emoji: '🍕', sizes: [{ id: 's', name: 'صغير', price: 90 }, { id: 'm', name: 'وسط', price: 120 }, { id: 'l', name: 'كبير', price: 150 }] },
        { catId: 'البيتزا', name: 'بيتزا ميكس دجاج', price: 90, emoji: '🍕', sizes: [{ id: 's', name: 'صغير', price: 90 }, { id: 'm', name: 'وسط', price: 120 }, { id: 'l', name: 'كبير', price: 150 }] },
        { catId: 'البيتزا', name: 'بيتزا ميكس لحوم', price: 80, emoji: '🍕', sizes: [{ id: 's', name: 'صغير', price: 80 }, { id: 'm', name: 'وسط', price: 120 }, { id: 'l', name: 'كبير', price: 150 }] },

        // --- سندوتشات اللحوم ---
        { catId: 'سندوتشات اللحوم', name: 'كفتة مشوية', price: 75, emoji: '🥖', sizes: [] },
        { catId: 'سندوتشات اللحوم', name: 'سجق', price: 70, emoji: '🥖', sizes: [] },
        { catId: 'سندوتشات اللحوم', name: 'كبدة إسكندراني', price: 75, emoji: '🥖', sizes: [] },
        { catId: 'سندوتشات اللحوم', name: 'ميكس لحوم (كفتة+سجق)', price: 75, emoji: '🥖', sizes: [] },
        { catId: 'سندوتشات اللحوم', name: 'حواوشي', price: 45, emoji: '🫓', sizes: [] },

        // --- سندوتشات الدجاج ---
        { catId: 'سندوتشات الدجاج', name: 'تشيكن بانية', price: 85, emoji: '🥪', sizes: [] },
        { catId: 'سندوتشات الدجاج', name: 'زنجر سوبريم', price: 95, emoji: '🥪', sizes: [] },
        { catId: 'سندوتشات الدجاج', name: 'سوبر كرانشي', price: 95, emoji: '🥪', sizes: [] },
        { catId: 'سندوتشات الدجاج', name: 'شيش طاووق', price: 90, emoji: '🥪', sizes: [] },
        { catId: 'سندوتشات الدجاج', name: 'تشيكن رانش', price: 90, emoji: '🥪', sizes: [] },
        { catId: 'سندوتشات الدجاج', name: 'كوردون بلو', price: 95, emoji: '🥪', sizes: [] },

        // --- البرجر ---
        { catId: 'البرجر', name: 'كلاسيك برجر', price: 75, emoji: '🍔', sizes: [] },
        { catId: 'البرجر', name: 'تشيز برجر', price: 85, emoji: '🍔', sizes: [] },
        { catId: 'البرجر', name: 'تشيكن برجر', price: 75, emoji: '🍔', sizes: [] },

        // --- التوست ---
        { catId: 'التوست', name: 'ميكس توست', price: 65, emoji: '🍞', sizes: [] },

        // --- الأصناف الجانبية ---
        { catId: 'الأصناف الجانبية', name: 'بطاطس مقلية', price: 35, emoji: '🍟', sizes: [] },
        { catId: 'الأصناف الجانبية', name: 'بطاطس بالجبنة الشيدر', price: 45, emoji: '🍟', sizes: [] },
        { catId: 'الأصناف الجانبية', name: 'صوص رانش', price: 15, emoji: '🥣', sizes: [] },
        { catId: 'الأصناف الجانبية', name: 'صوص باربيكيو', price: 15, emoji: '🥣', sizes: [] },

        // --- المشروبات ---
        { catId: 'المشروبات', name: 'بيبسي', price: 15, emoji: '🥤', sizes: [] },
        { catId: 'المشروبات', name: 'سفن أب', price: 15, emoji: '🥤', sizes: [] },
        { catId: 'المشروبات', name: 'ميرندا', price: 15, emoji: '🥤', sizes: [] },
        { catId: 'المشروبات', name: 'مياه معدنية', price: 6, emoji: '💧', sizes: [] }
      ];

      for (const p of defaultProducts) {
        await addDoc(collection(dbCloud, "products"), p);
      }

      // 3. مناطق الدليفري
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

      alert("🎉 تم رفع منيو دريم كورنر الحقيقي بالكامل بنجاح!");
    } catch (error: any) {
      console.error("Bulk Seed Error:", error);
      alert("حدث خطأ أثناء الرفع: " + (error?.message || error));
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCatLabel.trim()) return;
    await addDoc(collection(dbCloud, "categories"), {
      label: newCatLabel.trim(),
      emoji: newCatEmoji.trim() || '🍕'
    });
    setNewCatLabel('');
  };

  const handleAddProduct = async () => {
    if (!prodName.trim() || !prodCat || !prodPrice) return;
    await addDoc(collection(dbCloud, "products"), {
      catId: prodCat,
      name: prodName.trim(),
      emoji: prodEmoji.trim() || '🍕',
      price: parseFloat(prodPrice),
      sizes: []
    });
    setProdName('');
    setProdPrice('');
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الصنف؟')) {
      await deleteDoc(doc(dbCloud, "products", id));
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto bg-slate-100 dir-rtl font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
          <Utensils className="text-indigo-600" size={28} />
          <span>إدارة منيو دريم كورنر</span>
        </h1>

        <button
          onClick={seedBulkData}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg transition-all active:scale-95"
        >
          <UploadCloud size={20} />
          <span>{loading ? 'جاري رفع المنيو الحقيقي...' : 'اضغط هنا لرفع منيو Dream Corner الحقيقي 🚀'}</span>
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
            placeholder="اسم القسم (مثلاً: بيتزا)"
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
            className="bg-indigo-600 text-white py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-indigo-700 transition-all"
          >
            حفظ القسم أونلاين
          </button>
        </div>

        {/* إضافة صنف فردي */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-3 lg:col-span-2">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
            <Plus size={18} className="text-indigo-600" />
            <span>إضافة صنف فردي</span>
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
            className="bg-indigo-600 text-white py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-indigo-700 transition-all"
          >
            حفظ الصنف
          </button>
        </div>
      </div>

      {/* الأصناف الحالية */}
      <div className="mt-6 bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
        <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>الأصناف المتاحة أونلاين ({products.length})</span>
        </h3>
        {products.length === 0 ? (
          <p className="text-slate-400 text-center py-6 text-xs font-bold">لا توجد أصناف في السحابة حتى الآن، اضغط على زر الرفع أعلى اليسار لرفع منيو Dream Corner بالكامل.</p>
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
                  className="text-rose-600 bg-rose-50 p-2 rounded-xl hover:bg-rose-100 transition-all"
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
