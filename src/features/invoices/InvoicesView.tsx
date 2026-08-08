import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { dbCloud } from '../../db/firebase';
import { FileText, Printer, Trash2, Search, Calendar, DollarSign, Truck, User } from 'lucide-react';

export function InvoicesView() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('الكل');

  // 🔄 المزامنة اللحظية مع Firebase لسجل الفواتير
  useEffect(() => {
    const q = query(collection(dbCloud, "invoices"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setInvoices(docs);
    });

    return () => unsubscribe();
  }, []);

  // حذف أو إلغاء فاتورة من السحابة
  const handleDeleteInvoice = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الفاتورة نهائياً؟')) {
      await deleteDoc(doc(dbCloud, "invoices", id));
    }
  };

  // 🖨️ إعادة طباعة الفاتورة الحرارية المباشرة والمعالجة
  const handleReprint = (inv: any) => {
    const printWindow = window.open('', '_blank', 'width=380,height=600');
    if (!printWindow) return;

    const logoUrl = window.location.origin + '/logo.png';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8" />
        <title>فاتورة #${inv.id.slice(-6)}</title>
        <style>
          @media print {
            @page { margin: 0; size: auto; }
            body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          * { box-sizing: border-box; }
          body {
            font-family: 'Tahoma', 'Arial', sans-serif;
            width: 270px;
            margin: 0 auto;
            padding: 4px;
            color: #000;
            background: #fff;
            direction: rtl;
            text-align: right;
            font-size: 12px;
            line-height: 1.3;
            font-weight: 900;
            -webkit-font-smoothing: antialiased;
            text-shadow: 0.2px 0 0 #000, -0.2px 0 0 #000, 0 0.2px 0 #000, 0 -0.2px 0 #000;
          }
          .header { text-align: center; border-bottom: 3px solid #000; padding-bottom: 6px; margin-bottom: 6px; }
          .logo { 
            width: 75px; 
            height: 75px; 
            margin: 0 auto 4px auto; 
            display: block; 
            object-fit: contain;
            filter: grayscale(100%) contrast(500%);
            -webkit-filter: grayscale(100%) contrast(500%);
          }
          .brand-box {
            border: 3px solid #000;
            padding: 5px 2px;
            margin: 4px 0;
            border-radius: 6px;
            background-color: #fff;
          }
          .brand-title { 
            font-size: 21px; 
            font-weight: 900; 
            margin: 0; 
            text-transform: uppercase; 
            color: #000;
            text-shadow: 0.5px 0 0 #000, -0.5px 0 0 #000;
          }
          .brand-sub { font-size: 10px; font-weight: 900; color: #000; margin-top: 2px; }
          .badge-wrap { margin-top: 4px; }
          .badge { 
            display: inline-block; 
            border: 3px solid #000; 
            color: #000; 
            font-size: 16px; 
            font-weight: 900; 
            padding: 2px 16px; 
            border-radius: 6px; 
          }
          .details-box { border: 2px solid #000; border-radius: 6px; padding: 6px; margin-bottom: 6px; font-size: 11px; font-weight: 900; }
          .details-row { display: flex; justify-between: space-between; margin-bottom: 2px; }
          .address-row { border-top: 2px dashed #000; margin-top: 4px; padding-top: 4px; font-size: 12px; font-weight: 900; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
          .table th { border-bottom: 3px solid #000; font-size: 12px; font-weight: 900; padding: 4px 2px; text-align: right; }
          .table td { padding: 6px 2px; border-bottom: 1.5px dashed #000; font-size: 12px; font-weight: 900; }
          .total-box { border: 3px solid #000; border-radius: 6px; padding: 6px; text-align: center; margin-top: 6px; }
          .total-label { font-size: 12px; font-weight: 900; margin-bottom: 1px; }
          .total-val { font-size: 22px; font-weight: 900; }
          .summary-line { display: flex; justify-content: space-between; font-size: 12px; font-weight: 900; margin-bottom: 2px; }
          .footer { text-align: center; font-size: 10px; font-weight: 900; margin-top: 8px; border-top: 2px dashed #000; padding-top: 6px; }
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
              <th style="width: 58%;">الصنف</th>
              <th style="width: 14%; text-align: center;">العدد</th>
              <th style="width: 28%; text-align: left;">المبلغ</th>
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
          <div class="summary-line"><span>خدمة التوصيل (${inv.zoneName || ''}):</span><span>${inv.deliveryFee} ج.م</span></div>
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
  };

  // تصفية الفواتير للبحث
  const filteredInvoices = invoices.filter(inv => {
    const matchType = selectedType === 'الكل' || inv.orderType === selectedType;
    const matchSearch = (inv.id && inv.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (inv.customerPhone && inv.customerPhone.includes(searchQuery)) ||
                        (inv.customerName && inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchType && matchSearch;
  });

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto bg-slate-100 dir-rtl font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
          <FileText className="text-indigo-600" size={28} />
          <span>سجل الفواتير السحابي</span>
        </h1>

        {/* فلاتر البحث ونوع الطلب */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute right-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="بحث برقم الفاتورة أو التليفون..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white pr-9 pl-4 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none"
            />
          </div>

          <div className="flex bg-slate-200 p-1 rounded-xl">
            {['الكل', 'تيك أواي', 'دليفري', 'صالة'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  selectedType === type ? 'bg-indigo-600 text-white' : 'text-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* جدول الفواتير اللحظي */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-bold">
            لا توجد فواتير مطابقة للبحث حالياً
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredInvoices.map((inv) => (
              <div key={inv.id} className="p-4 hover:bg-slate-50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs ${
                    inv.orderType === 'دليفري' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    {inv.orderType === 'دليفري' ? <Truck size={20} /> : <FileText size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-sm">فاتورة #${inv.id.slice(-6)}</span>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-600">
                        {inv.orderType}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                      {new Date(inv.createdAt).toLocaleString('ar-EG')}
                    </p>
                    {inv.orderType === 'دليفري' && (
                      <div className="text-[11px] text-slate-600 font-bold mt-1">
                        👤 {inv.customerName || 'عميل'} | 📞 {inv.customerPhone} | 📍 {inv.zoneName}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 block font-semibold">المبلغ الصافي</span>
                    <span className="font-black text-indigo-600 text-base">{inv.total} ج.م</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReprint(inv)}
                      className="p-2.5 bg-slate-100 hover:bg-indigo-600 hover:text-white rounded-xl text-slate-600 transition-all"
                      title="إعادة طباعة"
                    >
                      <Printer size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteInvoice(inv.id)}
                      className="p-2.5 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl text-rose-600 transition-all"
                      title="حذف الفاتورة"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
