import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { dbCloud } from '../../db/firebase';
import { Settings, Printer, Store, Save, CheckCircle2, RefreshCw } from 'lucide-react';

export function SettingsView() {
  const [storeName, setStoreName] = useState('DREAM CORNER');
  const [storePhone, setStorePhone] = useState('01006113627');
  const [storeAddress, setStoreAddress] = useState('البرامون - بجوار عيادة الدكتور الهام العشري');
  const [receiptFooter, setReceiptFooter] = useState('طعم يفرق .. جودة تليق بيك ❤️');
  const [paperWidth, setPaperWidth] = useState<'80mm' | '58mm'>('80mm');
  const [autoPrint, setAutoPrint] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // 🔄 تحميل الإعدادات الحالية من Firebase / LocalStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const docRef = doc(dbCloud, "settings", "general");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setStoreName(data.storeName || 'DREAM CORNER');
          setStorePhone(data.storePhone || '01006113627');
          setStoreAddress(data.storeAddress || 'البرامون');
          setReceiptFooter(data.receiptFooter || 'طعم يفرق .. جودة تليق بيك ❤️');
          setPaperWidth(data.paperWidth || '80mm');
          setAutoPrint(data.autoPrint ?? true);
        }
      } catch (e) {
        console.error("Error loading settings:", e);
      }
    };
    loadSettings();
  }, []);

  // 💾 حفظ الإعدادات
  const handleSave = async () => {
    setLoading(true);
    const settingsData = {
      storeName,
      storePhone,
      storeAddress,
      receiptFooter,
      paperWidth,
      autoPrint,
      updatedAt: Date.now()
    };

    try {
      await setDoc(doc(dbCloud, "settings", "general"), settingsData);
      localStorage.setItem('dc_settings', JSON.stringify(settingsData));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      alert("حدث خطأ أثناء حفظ الإعدادات: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // 🖨️ تجربة طباعة فاتورة تجريبية
  const handleTestPrint = () => {
    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (printWindow) {
      const widthPx = paperWidth === '80mm' ? '280px' : '200px';
      printWindow.document.write(`
        <html dir="rtl"><head>
        <style>
          body { font-family: Tahoma, sans-serif; width: ${widthPx}; margin: auto; font-weight: bold; font-size: 11px; text-align: center; }
          .header { border-bottom: 2px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
          .item { display: flex; justify-content: space-between; margin-bottom: 4px; }
          .divider { border-top: 1px dashed #000; margin: 6px 0; }
          .footer { margin-top: 10px; font-size: 10px; }
        </style></head>
        <body>
          <div class="header">
            <h2 style="margin:0">${storeName}</h2>
            <p style="margin:2px 0">${storeAddress}</p>
            <p style="margin:2px 0">تليفون: ${storePhone}</p>
            <p style="margin:2px 0; font-size:10px;">--- فاتورة تجريبية ---</p>
          </div>
          <div class="item"><span>بيتزا مارجريتا (كبير) × 1</span><span>90 ج.م</span></div>
          <div class="item"><span>كانز بيبسي × 1</span><span>15 ج.م</span></div>
          <div class="divider"></div>
          <div style="font-size:13px; font-weight:black; border:1px solid #000; padding:4px;">الإجمالي: 105 ج.م</div>
          <div class="footer">${receiptFooter}</div>
        </body></html>
      `);
      printWindow.document.close();
      setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto bg-slate-100 dir-rtl font-sans">
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Settings className="text-indigo-600" size={28} />
            <span>إعدادات النظام والطابعة</span>
          </h1>
          <p className="text-xs text-slate-500 font-bold mt-1">تعديل بيانات المطعم وتكوين طابعة الفواتير الحرارية</p>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg transition-all active:scale-95"
        >
          {saved ? <CheckCircle2 size={18} className="text-emerald-400" /> : <Save size={18} />}
          <span>{saved ? 'تم الحفظ بنجاح!' : loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 🏪 بيانات المطعم */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-slate-900 text-sm border-b pb-3 flex items-center gap-2">
            <Store className="text-indigo-600" size={20} />
            <span>بيانات المحل (تظهر برأس الفاتورة)</span>
          </h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600">اسم المطعم / المحل</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="p-3 rounded-2xl border text-xs font-bold bg-slate-50 focus:outline-none focus:bg-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600">رقم الهاتف للطلبات</label>
            <input
              type="text"
              value={storePhone}
              onChange={(e) => setStorePhone(e.target.value)}
              className="p-3 rounded-2xl border text-xs font-bold bg-slate-50 focus:outline-none focus:bg-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600">العنوان التفصيلي</label>
            <input
              type="text"
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              className="p-3 rounded-2xl border text-xs font-bold bg-slate-50 focus:outline-none focus:bg-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600">جملة الترحيب بأسفل الفاتورة (Footer)</label>
            <input
              type="text"
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
              className="p-3 rounded-2xl border text-xs font-bold bg-slate-50 focus:outline-none focus:bg-white"
            />
          </div>
        </div>

        {/* 🖨️ إعدادات طابعة الفواتير */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-slate-900 text-sm border-b pb-3 flex items-center gap-2">
            <Printer className="text-indigo-600" size={20} />
            <span>إعدادات طابعة الفواتير الحرارية (Receipt Printer)</span>
          </h3>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-600">عرض ورق الطابعة الحرارية</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaperWidth('80mm')}
                className={`p-3 rounded-2xl font-black text-xs border transition-all ${
                  paperWidth === '80mm' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-700'
                }`}
              >
                80mm (ورق عريض قياسي)
              </button>
              <button
                type="button"
                onClick={() => setPaperWidth('58mm')}
                className={`p-3 rounded-2xl font-black text-xs border transition-all ${
                  paperWidth === '58mm' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-700'
                }`}
              >
                58mm (ورق صغير)
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border">
            <div>
              <p className="font-bold text-xs text-slate-800">فتح نافذة الطباعة تلقائياً</p>
              <p className="text-[10px] text-slate-400 font-bold">إظهار أمرين الطباعة فور الضغط على حفظ الفاتورة</p>
            </div>
            <input
              type="checkbox"
              checked={autoPrint}
              onChange={(e) => setAutoPrint(e.target.checked)}
              className="w-5 h-5 accent-indigo-600 cursor-pointer"
            />
          </div>

          <div className="mt-auto pt-4 border-t flex justify-end">
            <button
              onClick={handleTestPrint}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-2xl font-black text-xs flex items-center gap-2 transition-all active:scale-95"
            >
              <Printer size={16} />
              <span>تجربة طباعة فاتورة اختبارية 🖨️</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
