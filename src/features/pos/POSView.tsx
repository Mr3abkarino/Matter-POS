  const handleCheckout = async () => {
    if (cart.length === 0) return;

    // 1. حساب إجمالي الفاتورة وتجهيز البيانات
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const invoiceData = {
      shiftId: currentShift?.id || 1,
      items: cart,
      total: totalAmount,
      orderType: orderType, // تيك أواي، دليفري، صالة
      createdAt: Date.now()
    };

    // 2. حفظ الفاتورة في قاعدة البيانات المحلية (Dexie)
    const newInvoiceId = await db.invoices.add(invoiceData);

    // 3. فتح نافذة الطباعة الحرارية للفاتورة
    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>فاتورة رقم #${newInvoiceId} - دريم كورنر</title>
            <style>
              body { font-family: 'Cairo', sans-serif; padding: 10px; width: 280px; margin: auto; color: #000; }
              h2, h4 { text-align: center; margin: 4px 0; }
              hr { border: dashed 1px #000; }
              .info { font-size: 12px; margin-bottom: 5px; }
              .item-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px; }
              .total-row { font-weight: bold; font-size: 15px; margin-top: 8px; display: flex; justify-content: space-between; }
              .footer { text-align: center; font-size: 12px; margin-top: 10px; }
            </style>
          </head>
          <body>
            <h2>دريم كورنر</h2>
            <h4>بيزا وسندوتشات</h4>
            <div class="footer" style="font-size: 10px;">الإيرامون - بجوار عيادة د. إلهام العشري</div>
            <hr/>
            <div class="info">رقم الفاتورة: #${newInvoiceId}</div>
            <div class="info">النوع: ${orderType}</div>
            <div class="info">التاريخ: ${new Date().toLocaleString('ar-EG')}</div>
            <hr/>
            <div>
              ${cart.map(item => `
                <div class="item-row">
                  <span>${item.name} (${item.quantity}x)</span>
                  <span>${item.price * item.quantity} ج.م</span>
                </div>
              `).join('')}
            </div>
            <hr/>
            <div class="total-row">
              <span>الإجمالي الصافي:</span>
              <span>${totalAmount} ج.م</span>
            </div>
            <hr/>
            <div class="footer">
              شكراً لزيارتكم!<br/>
              خدمة سريعة - جودة عالية<br/>
              01006113627
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 400);
    }

    // 4. تفريغ السلة بعد إتمام الطلب بنجاح
    clearCart();
  };
