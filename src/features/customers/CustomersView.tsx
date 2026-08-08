import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, setDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { dbCloud } from '../../db/firebase';
import { Users, Search, Plus, Trash2, Edit2, Phone, MapPin, Calendar, X, Check } from 'lucide-react';

export function CustomersView() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsMobileModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // 🔄 جلب العملاء لحظياً من Firestore
  useEffect(() => {
    const q = query(collection(dbCloud, "customers"), orderBy("lastOrderAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCustomers(data);
    }, (err) => console.warn("Firestore Customers error", err));

    return () => unsub();
  }, []);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setAddress('');
    setIsMobileModalOpen(true);
  };

  const handleOpenEdit = (c: any) => {
    setEditingCustomer(c);
    setName(c.name || '');
    setPhone(c.phone || c.id || '');
    setAddress(c.address || '');
    setIsMobileModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return alert("يرجى إدخال رقم الهاتف!");

    const docId = phone.trim();
    const customerData = {
      name: name.trim(),
      phone: docId,
      address: address.trim(),
      updatedAt: Date.now(),
      lastOrderAt: editingCustomer?.lastOrderAt || Date.now()
    };

    try {
      await setDoc(doc(dbCloud, "customers", docId), customerData, { merge: true });
      setIsMobileModalOpen(false);
    } catch (err) {
      console.error("Error saving customer:", err);
      alert("حدث خطأ أثناء حفظ بيانات العميل!");
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل من قاعدة البيانات؟")) {
      await deleteDoc(doc(dbCloud, "customers", id));
    }
  };

  const filteredCustomers = customers.filter(c => {
    const term = search.toLowerCase();
    const cName = (c.name || '').toLowerCase();
    const cPhone = (c.phone || c.id || '').toLowerCase();
    const cAddr = (c.address || '').toLowerCase();
    return cName.includes(term) || cPhone.includes(term) || cAddr.includes(term);
  });

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto bg-slate-100 dir-rtl font-sans">
      
      {/* الهيدر وزر الإضافة والبحث */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="text-indigo-600" size={28} />
            <span>قاعدة بيانات العملاء</span>
          </h1>
          <p className="text-xs text-slate-500 font-bold mt-1">سجل العملاء التلقائي لسرعة تحرير فواتير الدليفري</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="بحث بالاسم، الرقم، أو العنوان..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-3 pr-9 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-indigo-600 shadow-sm"
            />
            <Search size={16} className="absolute right-3 top-3 text-slate-400" />
          </div>

          <button
            onClick={handleOpenAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0"
          >
            <Plus size={16} />
            <span>إضافة عميل</span>
          </button>
        </div>
      </div>

      {/* قائمة العملاء */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-bold text-xs">
            لا يوجد عملاء مسجلين حالياً
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b text-slate-400 font-bold bg-slate-50">
                  <th className="p-3.5">اسم العميل</th>
                  <th className="p-3.5">رقم الهاتف</th>
                  <th className="p-3.5">العنوان</th>
                  <th className="p-3.5">آخر أوردر</th>
                  <th className="p-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 font-bold text-slate-800 transition-all">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
                          {(c.name || 'ع').charAt(0)}
                        </div>
                        <span className="font-black text-slate-900 text-sm">{c.name || 'بدون اسم'}</span>
                      </div>
                    </td>
                    <td className="p-3.5 dir-ltr text-right text-indigo-600 font-black">
                      📞 {c.phone || c.id}
                    </td>
                    <td className="p-3.5 text-slate-600 max-w-xs truncate">
                      📍 {c.address || 'غير محدد'}
                    </td>
                    <td className="p-3.5 text-slate-400 text-[11px]">
                      {c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString('ar-EG') : '-'}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                          title="تعديل العميل"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(c.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="حذف العميل"
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

      {/* Modal إضافة/تعديل عميل */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md dir-rtl shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Users className="text-indigo-600" size={20} />
                <span>{editingCustomer ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</span>
              </h3>
              <button onClick={() => setIsMobileModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">رقم الهاتف (الأساسي):</label>
                <input
                  type="tel"
                  required
                  placeholder="مثال: 01000000000"
                  value={phone}
                  disabled={!!editingCustomer}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border text-xs font-bold bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">اسم العميل:</label>
                <input
                  type="text"
                  required
                  placeholder="اسم العميل الثلاثي"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border text-xs font-bold bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">العنوان التفصيلي:</label>
                <textarea
                  rows={3}
                  placeholder="الشارع، العلامة المميزة..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border text-xs font-bold bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <Check size={16} />
                  <span>حفظ البيانات</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileModalOpen(false)}
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
