import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { dbCloud } from '../../db/firebase';
import { History, Printer, Trash2, Edit2, Search } from 'lucide-react';

export function RecentInvoicesView() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(dbCloud, "invoices"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const invs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setInvoices(invs);
    });
    return () => unsub();
  }, []);

  const handleDeleteInvoice = async (id: string) => {
    if (confirm("هل أنت متأكد من إلغاء وحذف هذه الفاتورة من السجلات؟")) {
      await deleteDoc(doc(dbCloud, "invoices", id));
    }
  };

  const printInvoiceWindow = (inv: any) => {
    const printWindow = window.open('', '_blank', 'width=380,height=600');
    if (printWindow) {
      const logoUrl = window.location.origin + '/logo.png';
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8" />
          <title>فاتورة ${inv.orderType}</title>
          <style>
            @media print { @page { margin: 0; size: auto; } body { margin: 0; padding: 4px; } }
            * { box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; width: 270px; margin: 0 auto; padding: 8px; color: #000; background: #fff; direction: rtl; text-align: right; font-size: 11px; line-height: 1.3; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 8px; }
            .logo { width: 70px; height: 70px; margin: 0 auto 4px auto; display: block; filter: grayscale(100%) contrast(300%); }
            .brand-title { font-size: 17px; font-weight: 900; margin: 0; text-transform: uppercase; }
            .brand-sub { font-size: 9px; font-weight: 800; color: #222; margin-top: 1px; }
            .badge-wrap { margin-top: 6px; }
            .badge { display: inline-block; background-color: #000; color: #fff; font-size: 13px; font-weight: 900; padding: 3px 14px; border-radius: 20px; }
            .details-box { background: #f8f8f8; border-radius: 6px; padding: 6px 8px; margin-bottom: 8px; font-size: 10px; font-weight: 700; }
            .details-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
            .table th { border-bottom: 2px solid #000; font-size: 10px; font-weight: 900; padding: 4px 2px; text-align: right; }
            .table td { padding: 5px 2px; border-bottom: 1px #eee solid; font-size: 11px; font-weight: 700; }
            .total-box { border: 2px solid #000; border-radius: 6px; padding: 6px; text-align: center; margin-top: 6px; }
            .total-val { font-size: 18px; font-weight: 900; }
            .footer { text-align: center; font-size: 9px; font-weight: 800; margin-top: 10px; border-top: 1px dashed #000; padding-top: 6px; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${logoUrl}" class="logo" alt="DC Logo" />
            <h1 class="brand-title">DREAM CORNER</h1>
            <div class="brand-sub">مطعم دريم كورنر - بيتزا كريب برجر</div>
            <div class="badge-wrap"><span class="badge">${inv.orderType}</span></div>
          </div>
          <div class="details-box">
            <div class="details-row"><span>التاريخ: ${new Date(inv.createdAt || Date.now()).toLocaleDateString('ar-EG')}</span><span>الوقت: ${new Date(inv.createdAt || Date.now()).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span></div>
            ${inv.driverName ? `<div class="details-row"><span>🛵 الطيار:</span><span><b>${inv.driverName}</b></span></div>` : ''}
            ${inv.customerName ? `<div class="details-row"><span>👤 العميل:</span><span>${inv.customerName}</span></div>` : ''}
            ${inv.customerPhone ? `<div class="details-row"><span>📞 الهاتف:</span><span>${inv.customerPhone}</span></div>` : ''}
          </div>
          <table class="table">
            <thead>
              <tr><th style="width: 58%;">الصنف</th><th style="width: 14%; text-align: center;">العدد</th><th style="width: 28%; text-align: left;">المبلغ</th></tr>
            </thead>
            <tbody>
              ${(inv.items || []).map((i: any) => `
                <tr><td>${i.name}</td><td style="text-align: center;">${i.quantity}</td><td style="text-align: left; font-weight:900;">${i.price * i.quantity} ج.م</td></tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total-box"><div class="total-val">${inv.total} ج.م</div></div>
          <div class="footer">طعم يفرق .. جودة تليق بيك ❤️<br/>شكراً لتسوقكم من DREAM CORNER</div>
        </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const term = search.toLowerCase();
    const type = (inv.orderType || '').toLowerCase();
    const customer = (inv.customerName || '').toLowerCase();
    const driver = (inv.driverName || '').toLowerCase();
    const phone = (inv.customerPhone || '').toLowerCase();
    return type.includes(term) || customer.includes(term) || driver.includes(term) || phone.includes(term);
  });

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto bg-slate-100 dir-rtl font-sans">
      
      {/* الهيدر */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
            <History className="text-indigo-600" size={28} />
            <span>سجل آخر الفواتير</span>
          </h1>
          <p className="text-xs text-slate-500 font-bold mt-1">مراجعة وإعادة طباعة أو إلغاء الفواتير المسجلة</p>
        </div>

        {/* بحث */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="بحث باسم العميل، الهاتف، أو الطيار..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-3 pr-9 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-indigo-600 shadow-sm"
          />
          <Search size={16} className="absolute right-3 top-3 text-slate-400" />
        </div>
      </div>

      {/* قائمة الفواتير */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-bold text-xs">
            لا توجد فواتير مسجلة حالياً
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b text-slate-400 font-bold bg-slate-50">
                  <th className="p-3.5">الوقت والتاريخ</th>
                  <th className="p-3.5">نوع الطلب</th>
                  <th className="p-3.5">العميل / الطيار</th>
                  <th className="p-3.5">الأصناف</th>
                  <th className="p-3.5">الإجمالي</th>
                  <th className="p-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 font-bold text-slate-800 transition-all">
                    <td className="p-3.5 text-slate-500 text-[11px]">
                      <div>{new Date(inv.createdAt || Date.now()).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="text-[10px] text-slate-400">{new Date(inv.createdAt || Date.now()).toLocaleDateString('ar-EG')}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black ${
                        inv.orderType === 'دليفري' ? 'bg-indigo-50 text-indigo-700' :
                        inv.orderType === 'صالة' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {inv.orderType}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {inv.driverName ? (
                        <span className="text-indigo-900">🛵 {inv.driverName}</span>
                      ) : inv.customerName ? (
                        <span>👤 {inv.customerName} {inv.customerPhone && `(${inv.customerPhone})`}</span>
                      ) : (
                        <span className="text-slate-400">عميل مباشر</span>
                      )}
                    </td>
                    <td className="p-3.5 text-[11px] text-slate-600 max-w-xs truncate">
                      {(inv.items || []).map((i: any) => `${i.name} (x${i.quantity})`).join(', ')}
                    </td>
                    <td className="p-3.5 font-black text-indigo-600 text-sm">
                      {inv.total} ج.م
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => printInvoiceWindow(inv)}
                          title="إعادة طباعة الفاتورة"
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        >
                          <Printer size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(inv.id)}
                          title="حذف الفاتورة"
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
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

    </div>
  );
}
