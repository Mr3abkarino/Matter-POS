import React, { useState, useEffect } from 'react';
import { db } from '../../db/dexie';
import { Settings, Printer, Store, CheckCircle2 } from 'lucide-react';

export function SettingsView() {
  const [paperWidth, setPaperWidth] = useState<'80mm' | '58mm'>('80mm');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    db.settings.get('printer').then(res => {
      if (res) setPaperWidth(res.paperWidth);
    });
  }, []);

  const handleSavePrinter = async (width: '80mm' | '58mm') => {
    setPaperWidth(width);
    await db.settings.put({ id: 'printer', paperWidth: width });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // دالة اختبار الطباعة بالشكل الاحترافي
  const handleTestPrint = () => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;

    const widthPx = paperWidth === '80mm' ? '290px' : '200px';

    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>اختبار الطباعة - دريم كورنر</title>
          <style>
            @page { margin: 0; }
            body { 
              font-family: 'Courier New', Courier, monospace, 'Cairo', sans-serif; 
              width: ${widthPx}; 
              margin: auto; 
              padding: 8px; 
              color: #000; 
              font-size: ${paperWidth === '80mm' ? '12px' : '10px'}; 
            }
            .text-center { text-align: center; }
            .text-left { text-align: left; }
            .font-bold { font-weight: bold; }
            .border-b { border-bottom: 1px dashed #000; padding-bottom: 5px; margin-bottom: 5px; }
            .flex-between { display: flex; justify-content: space-between; margin: 3px 0; }
            .logo { font-size: ${paperWidth === '80mm' ? '18px' : '14px'}; font-weight: 900; letter-spacing: 1px; }
            .tagline { font-size: 9px; margin-top: 2px; }
            .total-box { border: 1.5px solid #000; padding: 4px; font-weight: bold; margin-top: 6px; }
          </style>
        </head>
        <body>
          <div class="text-center border-b">
            <div class="logo">DREAM CORNER</div>
            <div>دريم كورنر - بيزا وسندوتشات</div>
            <div class="tagline">طعم يفرق .. جودة تليق بك</div>
            <div style="font-size: 8px; margin-top: 3px;">البرامون - بجوار عيادة د. إلهام العشري</div>
            <div style="font-size: 9px; font-weight: bold; margin-top: 2px;">01006113627</div>
          </div>

          <div class="border-b">
            <div class="flex-between"><span>رقم الفاتورة:</span> <span>#1001 (تجريبي)</span></div>
            <div class="flex-between"><span>النوع:</span> <span>تيك أواي</span></div>
            <div class="flex-between"><span>التاريخ:</span> <span>${new Date().toLocaleTimeString('ar-EG')}</span></div>
          </div>

          <div class="border-b">
            <div class="flex-between font-bold"><span>الصنف</span><span>الإجمالي</span></div>
            <div class="flex-between"><span>بيتزا مشكل لحوم (كبير) x1</span><span>120 ج.م</span></div>
            <div class="flex-between"><span>كفتة مشوية (وسط) x2</span><span>150 ج.م</span></div>
          </div>

          <div class="total-box">
            <div class="flex-between" style="font-size: 14px;">
              <span>الصافي المطلوب:</span>
              <span>270 ج.م</span>
            </div>
          </div>

          <div class="text-center" style="margin-top: 10px; font-size: 9px;">
            <div>شكراً لزيارتكم دريم كورنر! ❤️</div>
            <div>اختبار طباعة ناجح (${paperWidth})</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto bg-slate-100 dir-rtl font-sans">
      <h1 className="text-xl md:text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
        <Settings className="text-indigo-600" size={28} />
        <span>إعدادات النظام والطابعة</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* إعدادات الطابعة */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <Printer className="text-indigo-600" size={20} />
            <span>نوع ومقاس طابعة الفواتير (Thermal Printer)</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSavePrinter('80mm')}
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all font-bold ${
                paperWidth === '80mm'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 shadow-sm'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="text-lg">📄 80mm</span>
              <span className="text-xs font-semibold">طابعة كاشير عريضة</span>
            </button>

            <button
              onClick={() => handleSavePrinter('58mm')}
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all font-bold ${
                paperWidth === '58mm'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 shadow-sm'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="text-lg">🧾 58mm</span>
              <span className="text-xs font-semibold">طابعة حرارية صغيرة</span>
            </button>
          </div>

          {saved && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold justify-center bg-emerald-50 p-2 rounded-xl">
              <CheckCircle2 size={16} />
              <span>تم حفظ مقاس الطابعة بنجاح!</span>
            </div>
          )}

          <button
            onClick={handleTestPrint}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm mt-2"
          >
            <Printer size={16} />
            <span>اختبار طباعة الفاتورة الآن</span>
          </button>
        </div>

        {/* بيانات المحل */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <Store className="text-indigo-600" size={20} />
            <span>معلومات الفاتورة المطبوعة</span>
          </h3>

          <div className="flex flex-col gap-2 text-xs text-slate-700 font-semibold">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400">اسم المطعم:</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">دريم كورنر (Dream Corner)</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400">العنوان:</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">البرامون - بجوار عيادة د. إلهام العشري</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400">رقم الدعم والتوصيل:</span>
              <p className="font-bold text-indigo-600 text-sm mt-0.5">01006113627</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
