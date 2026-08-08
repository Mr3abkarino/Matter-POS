import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, setDoc, deleteDoc, doc } from 'firebase/firestore';
import { dbCloud } from '../../db/firebase';
import { MapPin, Plus, Trash2, Edit2, Check, X } from 'lucide-react';

export function DeliveryZonesView() {
  const [zones, setZones] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [fee, setFee] = useState('');

  // 🔄 جلب مناطق التوصيل لحظياً مع منع أي تكرار بالاسم في العرض
  useEffect(() => {
    const unsub = onSnapshot(collection(dbCloud, "deliveryZones"), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // تصفية العناصر بحيث لا تظهر المنطقة المكررة سوى مرة واحدة
      const uniqueMap = new Map();
      data.forEach(item => {
        const cleanName = (item.name || '').trim();
        if (cleanName && !uniqueMap.has(cleanName)) {
          uniqueMap.set(cleanName, item);
        }
      });

      setZones(Array.from(uniqueMap.values()));
    });
    return () => unsub();
  }, []);

  const handleOpenAdd = () => {
    setEditingZone(null);
    setName('');
    setFee('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (z: any) => {
    setEditingZone(z);
    setName(z.name || '');
    setFee(z.fee?.toString() || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanFee = Number(fee);

    if (!cleanName || isNaN(cleanFee)) {
      return alert("يرجى إدخال اسم المنطقة وسعر صحيح للتوصيل!");
    }

    const zoneData = {
      name: cleanName,
      fee: cleanFee,
      updatedAt: Date.now()
    };

    try {
      // ⚡ استخدام اسم المنطقة كمعرّف (ID) لمنع التكرار مستقبلاً في القاعدة
      const zoneRef = doc(dbCloud, "deliveryZones", cleanName);
      await setDoc(zoneRef, zoneData, { merge: true });

      setIsModalOpen(false);
      setName('');
      setFee('');
      setEditingZone(null);
    } catch (err) {
      console.error("Error saving zone:", err);
      alert("حدث خطأ أثناء الحفظ! تأكد من صلاحيات قاعدة البيانات.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه المنطقة نهائياً؟")) {
      try {
        await deleteDoc(doc(dbCloud, "deliveryZones", id));
      } catch (err) {
        alert("خطأ أثناء الحذف!");
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto bg-slate-100 dir-rtl font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
            <MapPin className="text-indigo-600" size={28} />
            <span>إدارة مناطق التوصيل وأسعارها</span>
          </h1>
          <p className="text-xs text-slate-500 font-bold mt-1">تعديل أو إضافة مناطق جديدة لتظهر أوتوماتيكياً في شاشة الكاشير</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
        >
          <Plus size={16} />
          <span>إضافة منطقة جديدة</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {zones.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-bold text-xs">
            لا توجد مناطق توصيل مسجلة حالياً
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b text-slate-400 font-bold bg-slate-50">
                  <th className="p-3.5">اسم المنطقة</th>
                  <th className="p-3.5">سعر التوصيل</th>
                  <th className="p-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {zones.map((z) => (
                  <tr key={z.id} className="hover:bg-slate-50 font-bold text-slate-800 transition-all">
                    <td className="p-3.5 font-black text-slate-900 text-sm">📍 {z.name}</td>
                    <td className="p-3.5 font-black text-indigo-600 text-base">{z.fee} ج.م</td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(z)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                          title="تعديل السعر"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(z.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="حذف"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm dir-rtl shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-black text-slate-900 text-base">
                {editingZone ? 'تعديل سعر منطقة التوصيل' : 'إضافة منطقة توصيل جديدة'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">اسم المنطقة:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: بر الترعة، مركز الشروق..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border text-xs font-bold bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">سعر التوصيل (ج.م):</label>
                <input
                  type="number"
                  required
                  placeholder="25"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  className="w-full p-2.5 rounded-xl border text-xs font-bold bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <Check size={16} />
                  <span>حفظ التعديلات</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-3 rounded-xl font-bold text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
