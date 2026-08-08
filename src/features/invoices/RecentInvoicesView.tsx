import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { dbCloud } from '../../db/firebase';
import { History, Printer, Trash2, Edit2, Search, Eye, X, User, Phone, MapPin, Bike } from 'lucide-react';

export function RecentInvoicesView({ onEditInvoice }: { onEditInvoice?: (inv: any) => void }) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<any | null>(null);

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
      if (selectedInvoiceForModal?.id === id) setSelectedInvoiceForModal(null);
    }
  };

  // 🖨️ دالة طباعة الفاتورة الحرارية المخصصة الموزونة 100% لطابعة Xprinter 58mm (إصدار منع القص)
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
            @media print {
              @page { margin: 0; size: auto; }
              body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            * { box-sizing: border-box; }
            body {
              font-family: 'Tahoma', 'Arial', sans-serif;
              width: 175px; /* ⚡ العرض المضبوط لمقاس 58mm لمنع قص النصوص والأرقام */
              margin: 0 auto;
              padding: 2px;
              color: #000;
              background: #fff;
              direction: rtl;
              text-align: right;
              font-size: 10px;
              line-height: 1.25;
              font-weight: 900;
              -webkit-font-smoothing: antialiased;
            }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 4px; margin-bottom: 4px; }
            .logo { 
              width: 55px; 
              height: 55px; 
              margin: 0 auto 2px auto; 
              display: block; 
              object-fit: contain;
              filter: grayscale(100%) contrast(500%);
              -webkit-filter: grayscale(100%) contrast(500%);
            }
            .brand-box {
              border: 2px solid #000;
              padding: 2px 1px;
              margin: 2px 0;
              border-radius: 4px;
              background-color: #fff;
            }
            .brand-title { 
              font-size: 14px; 
              font-weight: 900; 
              margin: 0; 
              text-transform: uppercase; 
              color: #000;
            }
            .brand-sub { font-size: 8px; font-weight: 900; color: #000; margin-top: 1px; }
            .badge-wrap { margin-top: 2px; }
            .badge { 
              display: inline-block; 
              border: 2px solid #000; 
              color: #000; 
              font-size: 11px; 
              font-weight: 900; 
              padding: 1px 8px; 
              border-radius: 4px; 
            }
            .details-box { border: 1.5px solid #000; border-radius: 4px; padding: 4px; margin-bottom: 4px; font-size: 9px; font-weight: 900; }
            .details-row { display: flex; justify-content: space-between; margin-bottom: 1.5px; word-break: break-word; }
            .address-row { border-top: 1.5px dashed #000; margin-top: 3px; padding-top: 3px; font-size: 9.5px; font-weight: 900; }
            
            .table { width: 100%; border-collapse: collapse; margin-bottom: 4px; table-layout: fixed; }
            .table th { border-bottom: 2px solid #000; font-size: 9px; font-weight: 900; padding: 3px 0; text-align: right; }
            .table td { padding: 3px 0; border-bottom: 1px dashed #000; font-size: 9.5px; font-weight: 900; word-wrap: break-word; }
            
            .total-box { border: 2px solid #000; border-radius: 4px; padding: 3px; text-align: center; margin-top: 4px; }
            .total-label { font-size: 9px; font-weight: 900; margin-bottom: 1px; }
            .total-val { font-size: 16px; font-weight: 900; }
            
            .summary-line { display: flex; justify-content: space-between; font-size: 9px; font-weight: 900; margin-bottom: 1.5px; }
            .footer { text-align: center; font-size: 8px; font-weight: 900; margin-top: 5px; border-top: 1.5px dashed #000; padding-top: 3px; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${logoUrl}" class="logo" id="invLogo" alt="DC Logo" />
            <div class="brand-box">
              <h1 class="brand-title">DREAM CORNER</h1>
              <div class="brand-sub">مطعم دريم كورنر - بيتزا و ساندوتشات</div>
            </div>
            <div class="badge-wrap"><span class="badge">${inv.orderType}</span></div>
          </div>
          <div class="details-box">
            <div class="details-row">
              <span>التاريخ: ${new Date(inv.createdAt || Date.now()).toLocaleDateString('ar-EG')}</span>
              <span>الوقت: ${new Date(inv.createdAt || Date.now()).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            ${inv.driverName ? `<div class="details-row"><span>🛵 الطيار:</span><span><b>${inv.driverName}</b></span></div>` : ''}
            ${inv.customerName ? `<div class="details-row"><span>👤 العميل:</span><span>${inv.customerName}</span></div>` : ''}
            ${inv.customerPhone ? `<div class="details-row"><span>📞 الهاتف:</span><span>${inv.customerPhone}</span></div>` : ''}
            ${inv.customerAddress ? `<div class="address-row">🏠 العنوان: ${inv.customerAddress}</div>` : ''}
          </div>
          <table class="table">
            <thead>
              <tr>
                <th style="width: 50%;">الصنف</th>
                <th style="width: 15%; text-align: center;">العدد</th>
                <th style="width: 35%; text-align: left;">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              ${(inv.items || []).map((i: any) => `
                <tr>
                  <td><b>${i.name}</b></td>
                  <td style="text-align: center;"><b>${i.quantity}</b></td>
                  <td style="text-align: left; font-weight:900;"><b>${i.price * i.quantity} ج.م</b></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ${inv.deliveryFee > 0 ? `
            <div class="summary-line"><span>إجمالي الطلبات:</span><span>${inv.subTotal || (inv.total - inv.deliveryFee)} ج.م</span></div>
            <div class="summary-line"><span>خدمة التوصيل ${inv.zoneName ? `(${inv.zoneName})` : ''}:</span><span>${inv.deliveryFee} ج.م</span></div>
          ` : ''}
          <div class="total-box">
            <div class="total-label">الإجمالي النهائي المطلوب</div>
            <div class="total-val">${inv.total} ج.م</div>
          </div>
          <div class="footer">طعم يفرق .. جودة تليق بيك ❤️<br/>شكراً لتسوقكم من DREAM CORNER</div>

          <script>
            function executeDirectPrint() {
              window.focus();
              window.print();
              setTimeout(function() { window.close(); }, 300);
            }
            var img = document.getElementById('invLogo');
            if (img && !img.complete) {
              img.onload = executeDirectPrint;
              img.onerror = executeDirectPrint;
            } else {
              executeDirectPrint();
            }
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
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
      
      {/* الهيدر والبحث */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
            <History className="text-indigo-600" size={28} />
            <span>سجل آخر الفواتير</span>
          </h1>
          <p className="text-xs text-slate-500 font-bold mt-1">عرض تفاصيل الفاتورة، إعادة الطباعة، التعديل أو الإلغاء</p>
        </div>

        <div className="relative w-full sm:w-72">
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
                        {/* 👁️ زر عرض كافة التفاصيل */}
                        <button
                          onClick={() => setSelectedInvoiceForModal(inv)}
                          title="عرض تفاصيل الفاتورة الكاملة"
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                        >
                          <Eye size={16} />
                        </button>

                        {/* ✏️ زر تعديل الفاتورة */}
                        {onEditInvoice && (
                          <button
                            onClick={() => onEditInvoice(inv)}
                            title="تعديل الفاتورة في الكاشير"
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}

                        {/* 🖨️ طباعة */}
                        <button
                          onClick={() => printInvoiceWindow(inv)}
                          title="إعادة طباعة الفاتورة"
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        >
                          <Printer size={16} />
                        </button>

                        {/* 🗑️ حذف */}
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

      {/* 🔍 Modal تفاصيل الفاتورة الكاملة */}
      {selectedInvoiceForModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md dir-rtl shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 mb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <span>تفاصيل الفاتورة</span>
                  <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-0.5 rounded-xl">
                    {selectedInvoiceForModal.orderType}
                  </span>
                </h3>
                <span className="text-[10px] text-slate-400 font-bold">
                  {new Date(selectedInvoiceForModal.createdAt || Date.now()).toLocaleString('ar-EG')}
                </span>
              </div>
              <button onClick={() => setSelectedInvoiceForModal(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {/* بيانات العميل والتوصيل */}
            {(selectedInvoiceForModal.customerName || selectedInvoiceForModal.driverName || selectedInvoiceForModal.customerPhone) && (
              <div className="bg-slate-50 p-3 rounded-2xl border text-xs font-bold space-y-1.5 mb-3 text-slate-700">
                {selectedInvoiceForModal.customerName && (
                  <div className="flex items-center gap-1.5"><User size={14} className="text-indigo-600" /><span>العميل: {selectedInvoiceForModal.customerName}</span></div>
                )}
                {selectedInvoiceForModal.customerPhone && (
                  <div className="flex items-center gap-1.5"><Phone size={14} className="text-indigo-600" /><span>الهاتف: {selectedInvoiceForModal.customerPhone}</span></div>
                )}
                {selectedInvoiceForModal.customerAddress && (
                  <div className="flex items-center gap-1.5"><MapPin size={14} className="text-indigo-600" /><span>العنوان: {selectedInvoiceForModal.customerAddress}</span></div>
                )}
                {selectedInvoiceForModal.driverName && (
                  <div className="flex items-center gap-1.5 text-indigo-900"><Bike size={14} className="text-indigo-600" /><span>الطيار المسؤول: {selectedInvoiceForModal.driverName}</span></div>
                )}
              </div>
            )}

            {/* جدول الأصناف والكميات */}
            <div className="max-h-52 overflow-y-auto border rounded-2xl p-2 mb-3 bg-slate-50/50">
              <table className="w-full text-xs font-bold text-right">
                <thead>
                  <tr className="border-b text-slate-400 pb-1">
                    <th className="py-1">الصنف</th>
                    <th className="py-1 text-center">العدد</th>
                    <th className="py-1 text-left">السعر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {(selectedInvoiceForModal.items || []).map((item: any, idx: number) => (
                    <tr key={idx} className="text-slate-800">
                      <td className="py-2">{item.name}</td>
                      <td className="py-2 text-center text-indigo-600">{item.quantity}</td>
                      <td className="py-2 text-left">{item.price * item.quantity} ج.م</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* الإجمالي */}
            <div className="flex justify-between items-center bg-indigo-50 p-3 rounded-2xl font-black text-indigo-900 text-sm mb-4">
              <span>الإجمالي الكلي:</span>
              <span className="text-base text-indigo-600">{selectedInvoiceForModal.total} ج.م</span>
            </div>

            {/* الأزرار بالأسفل */}
            <div className="flex gap-2">
              {onEditInvoice && (
                <button
                  onClick={() => {
                    const inv = selectedInvoiceForModal;
                    setSelectedInvoiceForModal(null);
                    onEditInvoice(inv);
                  }}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white p-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Edit2 size={16} />
                  <span>تعديل الفاتورة</span>
                </button>
              )}

              <button
                onClick={() => printInvoiceWindow(selectedInvoiceForModal)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Printer size={16} />
                <span>طباعة</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
