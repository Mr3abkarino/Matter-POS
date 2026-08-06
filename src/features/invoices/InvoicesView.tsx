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

  // إعادة طباعة الفاتورة الحرارية
  const handleReprint = (inv: any) => {
    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>فاتورة رقم #${inv.id.slice(-6)}</title>
          <style>
            @page { margin: 0; }
            body { 
              font-family: 'Tahoma', 'Segoe UI', Arial, sans-serif; 
              width: 280px; 
              margin: auto; 
              padding: 10px 4px; 
              color: #000; 
              font-weight: 800;
              -webkit-print-color-adjust: exact;
            }
            .text-center { text-align: center; }
            .logo { font-size: 18px; font-weight: 900; }
            .sub-title { font-size: 11px; font-weight: 800; }
            .divider { border-top: 2px dashed #000; margin: 6px 0; }
            .solid-divider { border-top: 2px solid #000; margin: 6px 0; }
            .info-row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px; }
            .item-header { display: flex; justify-content: space-between; font-size: 11px; font-weight: 900; border-bottom: 1.5px solid #000; padding-bottom: 3px; margin-bottom: 4px; }
            .item-row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px; }
            .delivery-box { border: 2px solid #000; padding: 6px; border-radius: 6px; margin: 6px 0; font-size: 11px; }
            .total-box { border: 2.5px solid #000; padding: 6px; font-size: 14px; font-weight: 900; display: flex; justify-content: space-between; margin-top: 6px; }
            .footer { text-align: center; font-size: 10px; margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="text-center">
            <div class="logo">DREAM CORNER</div>
            <div class="sub-title">دريم كورنر - بيتزا وسندوتشات</div>
            <div class="sub-title">(إعادة طباعة)</div>
          </div>
          <div class="divider"></div>
          <div class="info-row"><span>رقم الفاتورة:</span> <span>#${inv.id.slice(-6)}</span></div>
          <div class="info-row"><span>نوع الطلب:</span> <span>${inv.orderType}</span></div>
          <div class="info-row"><span>التاريخ:</span> <span>${new Date(inv.createdAt).toLocaleString('ar-EG')}</span></div>
          
          ${inv.orderType === 'دليفري' ? `
            <div class="delivery-box">
              <div><b>العميل:</b> ${inv.customerName || 'غير محدد'}</div>
              <div><b>الهاتف:</b> ${inv.customerPhone || '-'}</div>
              <div><b>المنطقة:</b> ${inv.zoneName || '-'}</div>
              <div><b>العنوان:</b> ${inv.customerAddress || '-'}</div>
            </div>
          ` : ''}

          <div class="divider"></div>
          <div class="item-header"><span>الصنف</span><span>الإجمالي</span></div>

          ${(inv.items || []).map((i: any) => `
            <div class="item-row">
              <span>${i.name} (${i.quantity}x)</span>
              <span>${i.price * i.quantity} ج.م</span>
            </div>
          `).join('')}

          ${inv.deliveryFee ? `
            <div class="divider"></div>
            <div class="info-row"><span>المجموع:</span><span>${inv.subTotal || (inv.total - inv.deliveryFee)} ج.م</span></div>
            <div class="info-row"><span>التوصيل:</span><span>${inv.deliveryFee} ج.م</span></div>
          ` : ''}

          <div class="total-box"><span>الصافي المطلوب:</span><span>${inv.total} ج.م</span></div>
          <div class="solid-divider"></div>
          <div class="footer">شكراً لزيارتكم دريم كورنر! ❤️</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 350);
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
