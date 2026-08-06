import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/dexie';
import { Customer, Supplier } from '../../types';
import { Users, UserPlus, Truck, DollarSign, Search, X } from 'lucide-react';

export const CRMView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers'>('customers');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [settleDebtCustomer, setSettleDebtCustomer] = useState<Customer | null>(null);
  const [settleAmount, setSettleAmount] = useState('');

  // فورم العميل الجديد
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');

  // فورم المورد الجديد
  const [suppName, setSuppName] = useState('');
  const [suppCompany, setSuppCompany] = useState('');
  const [suppPhone, setSuppPhone] = useState('');

  // جلب البيانات من IndexedDB
  const customers = useLiveQuery(() => db.customers.toArray(), []) || [];
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), []) || [];

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone) return;

    await db.customers.add({
      name: custName,
      phone: custPhone,
      address: custAddress,
      points: 10,
      debt: 0,
      createdAt: Date.now(),
    });

    setCustName(''); setCustPhone(''); setCustAddress('');
    setShowAddCustomerModal(false);
    alert('✅ تم إضافة العميل بنجاح!');
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suppName || !suppPhone) return;

    await db.suppliers.add({
      name: suppName,
      companyName: suppCompany,
      phone: suppPhone,
      balance: 0,
    });

    setSuppName(''); setSuppCompany(''); setSuppPhone('');
    setShowAddSupplierModal(false);
    alert('✅ تم إضافة المورد بنجاح!');
  };

  const handleSettleDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleDebtCustomer || !settleDebtCustomer.id || !settleAmount) return;

    const paid = Number(settleAmount);
    const newDebt = Math.max(0, settleDebtCustomer.debt - paid);

    await db.customers.update(settleDebtCustomer.id, { debt: newDebt });
    setSettleDebtCustomer(null);
    setSettleAmount('');
    alert('✅ تم تسجيل سداد الدين بنجاح!');
  };

  const filteredCustomers = customers.filter(
    (c) => c.name.includes(searchQuery) || c.phone.includes(searchQuery)
  );

  const filteredSuppliers = suppliers.filter(
    (s) => s.name.includes(searchQuery) || s.phone.includes(searchQuery)
  );

  return (
    <div className="flex-1 bg-slate-50 p-4 sm:p-6 overflow-y-auto space-y-6 dir-rtl">
      
      {/* الهيدر وأزرار التبويب */}
      <div className="flex flex-wrap justify-between items-center gap-4 border-b pb-4">
        <div className="flex bg-white p-1 rounded-xl border text-xs font-bold">
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'customers' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'}`}
          >
            <Users size={15} /> العملاء والدين ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'suppliers' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'}`}
          >
            <Truck size={15} /> الموردون ({suppliers.length})
          </button>
        </div>

        <button
          onClick={() => activeTab === 'customers' ? setShowAddCustomerModal(true) : setShowAddSupplierModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
        >
          <UserPlus size={15} /> {activeTab === 'customers' ? 'إضافة عميل جديد' : 'إضافة مورد جديد'}
        </button>
      </div>

      {/* شريط البحث */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute right-3 top-2.5 text-slate-400" size={16} />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={activeTab === 'customers' ? 'بحث بالاسم أو رقم الهاتف...' : 'بحث عن مورد...'}
          className="w-full h-10 bg-white border border-slate-200 rounded-xl pr-9 pl-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* عرض بيانات العملاء أو الموردين */}
      {activeTab === 'customers' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((c) => (
            <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-black text-sm text-slate-900">{c.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{c.address || 'بدون عنوان'}</p>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">{c.phone}</span>
              </div>

              <div className="flex justify-between items-center text-xs font-bold pt-3 border-t">
                <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">نقاط الولاء: {c.points} ⭐</span>
                <span className="text-rose-600 font-black">الديون: {c.debt} ج.م</span>
              </div>

              {c.debt > 0 && (
                <button
                  onClick={() => setSettleDebtCustomer(c)}
                  className="w-full h-8 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                >
                  <DollarSign size={13} /> سداد دين العميل
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((s) => (
            <div key={s.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-black text-sm text-slate-900">{s.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{s.companyName || 'شركة توريدات'}</p>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">{s.phone}</span>
              </div>
              <div className="text-xs font-bold pt-3 border-t flex justify-between">
                <span>المبلغ المستحق:</span>
                <span className="font-black text-indigo-600">{s.balance} ج.م</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal إضافة عميل */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddCustomer} className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 font-black text-slate-900">
              <span>إضافة عميل جديد</span>
              <button type="button" onClick={() => setShowAddCustomerModal(false)}><X size={18} /></button>
            </div>
            <div className="space-y-3 text-xs">
              <input type="text" required value={custName} onChange={(e) => setCustName(e.target.value)} placeholder="اسم العميل..." className="w-full h-9 border rounded-xl px-3 font-bold outline-none" />
              <input type="text" required value={custPhone} onChange={(e) => setCustPhone(e.target.value)} placeholder="رقم الهاتف..." className="w-full h-9 border rounded-xl px-3 font-bold outline-none" />
              <input type="text" value={custAddress} onChange={(e) => setCustAddress(e.target.value)} placeholder="العنوان..." className="w-full h-9 border rounded-xl px-3 font-bold outline-none" />
            </div>
            <button type="submit" className="w-full h-10 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-md">حفظ العميل</button>
          </form>
        </div>
      )}

      {/* Modal إضافة مورد */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddSupplier} className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 font-black text-slate-900">
              <span>إضافة مورد جديد</span>
              <button type="button" onClick={() => setShowAddSupplierModal(false)}><X size={18} /></button>
            </div>
            <div className="space-y-3 text-xs">
              <input type="text" required value={suppName} onChange={(e) => setSuppName(e.target.value)} placeholder="اسم المندوب / المورد..." className="w-full h-9 border rounded-xl px-3 font-bold outline-none" />
              <input type="text" value={suppCompany} onChange={(e) => setSuppCompany(e.target.value)} placeholder="اسم الشركة أو المصنع..." className="w-full h-9 border rounded-xl px-3 font-bold outline-none" />
              <input type="text" required value={suppPhone} onChange={(e) => setSuppPhone(e.target.value)} placeholder="رقم الهاتف..." className="w-full h-9 border rounded-xl px-3 font-bold outline-none" />
            </div>
            <button type="submit" className="w-full h-10 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-md">حفظ المورد</button>
          </form>
        </div>
      )}

      {/* Modal سداد دين العميل */}
      {settleDebtCustomer && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSettleDebt} className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 font-black text-slate-900">
              <span>سداد دين: {settleDebtCustomer.name}</span>
              <button type="button" onClick={() => setSettleDebtCustomer(null)}><X size={18} /></button>
            </div>
            <div className="space-y-2 text-xs">
              <p className="text-rose-600 font-bold">الدين الحالي: {settleDebtCustomer.debt} ج.م</p>
              <input
                type="number"
                required
                value={settleAmount}
                onChange={(e) => setSettleAmount(e.target.value)}
                placeholder="المبلغ المحصل الآن..."
                className="w-full h-10 border rounded-xl px-3 font-black text-indigo-600 text-sm outline-none"
              />
            </div>
            <button type="submit" className="w-full h-10 bg-emerald-600 text-white font-black text-xs rounded-xl shadow-md">
              تأكيد السداد والخصم
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
