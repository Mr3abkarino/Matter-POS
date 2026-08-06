import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/dexie';
import { Truck, Plus, Trash2 } from 'lucide-react';

export function DeliveryZonesView() {
  const zones = useLiveQuery(() => db.deliveryZones.toArray()) || [];
  const [name, setName] = useState('');
  const [fee, setFee] = useState('');

  const handleAddZone = async () => {
    if (!name || !fee) return;
    await db.deliveryZones.add({
      name: name.trim(),
      fee: parseFloat(fee)
    });
    setName('');
    setFee('');
  };

  const handleDeleteZone = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذه المنطقة؟')) {
      await db.deliveryZones.delete(id);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto bg-slate-100 dir-rtl font-sans">
      <h1 className="text-xl md:text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
        <Truck className="text-indigo-600" size={28} />
        <span>إدارة مناطق وسعر الدليفري</span>
      </h1>

      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4 max-w-lg mb-6">
        <h3 className="font-bold text-slate-800 text-sm border-b pb-2 flex items-center gap-2">
          <Plus size={18} className="text-indigo-600" />
          <span>إضافة منطقة توصيل جديدة</span>
        </h3>
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            placeholder="اسم المنطقة (مثل: بدواي)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none"
          />
          <input
            type="number"
            placeholder="سعر التوصيل (ج.م)"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            className="w-full md:w-32 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none"
          />
        </div>
        <button
          onClick={handleAddZone}
          className="bg-indigo-600 text-white py-2.5 rounded-xl font-bold text-xs shadow-md shadow-indigo-200"
        >
          إضافة المنطقة
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
        <h3 className="font-bold text-slate-800 text-sm mb-4">المناطق المتاحة وأسعارها</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {zones.map(z => (
            <div key={z.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-xs text-slate-900">{z.name}</span>
                <p className="text-indigo-600 font-bold text-xs mt-0.5">{z.fee} ج.م</p>
              </div>
              <button
                onClick={() => handleDeleteZone(z.id)}
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
