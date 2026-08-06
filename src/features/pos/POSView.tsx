const handleCheckout = async () => {
    if (cart.length === 0) return;

    const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalAmount = subTotal + deliveryFee;

    if (orderType === 'دليفري' && customerPhone) {
      const existingCust = await db.customers.where('phone').equals(customerPhone).first();
      if (!existingCust) {
        await db.customers.add({ name: customerName, phone: customerPhone, address: customerAddress });
      }
    }

    const invoiceData = {
      shiftId: 1,
      items: cart,
      subTotal: subTotal,
      deliveryFee: deliveryFee,
      total: totalAmount,
      orderType: orderType,
      zoneName: selectedZone ? selectedZone.name : '',
      customerName: orderType === 'دليفري' ? customerName : '',
      customerPhone: orderType === 'دليفري' ? customerPhone : '',
      customerAddress: orderType === 'دليفري' ? customerAddress : '',
      createdAt: Date.now()
    };

    const newInvoiceId = await db.invoices.add(invoiceData);

    // قراءة مقاس ورقة الطابعة الحرارية المخزنة من الإعدادات
    const printerSetting = await db.settings.get('printer');
    const paperWidth = printerSetting?.paperWidth === '58mm' ? '200px' : '280px';

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>فاتورة رقم #${newInvoiceId}</title>
            <style>
              @page { margin: 0; }
              body { 
                font-family: 'Tahoma', 'Segoe UI', Arial, sans-serif; 
                width: ${paperWidth}; 
                margin: auto; 
                padding: 10px 4px; 
                color: #000; 
                font-weight: 800; /* خط سميك وواضح جداً للطباعة الحرارية */
                -webkit-print-color-adjust: exact;
              }
              .text-center { text-align: center; }
              .logo { font-size: 18px; font-weight: 900; letter-spacing: 0.5px; margin-bottom: 2px; }
              .sub-title { font-size: 11px; font-weight: 800; margin-bottom: 2px; }
              .address { font-size: 9px; font-weight: 700; margin-bottom: 4px; }
              .divider { border-top: 2px dashed #000; margin: 6px 0; }
              .solid-divider { border-top: 2px solid #000; margin: 6px 0; }
              .info-row { display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; margin-bottom: 3px; }
              .item-header { display: flex; justify-content: space-between; font-size: 11px; font-weight: 900; border-bottom: 1.5px solid #000; padding-bottom: 3px; margin-bottom: 4px; }
              .item-row { display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; margin-bottom: 4px; }
              .delivery-box { border: 2px solid #000; padding: 6px; border-radius: 6px; margin: 6px 0; font-size: 11px; font-weight: 800; background: #fff; }
              .total-box { border: 2.5px solid #000; padding: 6px; font-size: 14px; font-weight: 900; display: flex; justify-content: space-between; margin-top: 6px; }
              .footer { text-align: center; font-size: 10px; font-weight: 800; margin-top: 8px; }
            </style>
          </head>
          <body>
            <div class="text-center">
              <div class="logo">DREAM CORNER</div>
              <div class="sub-title">دريم كورنر - بيتزا وسندوتشات</div>
              <div class="sub-title">طعم يفرق .. جودة تليق بك</div>
              <div class="address">البرامون - بجوار عيادة د. إلهام العشري</div>
              <div class="sub-title" style="font-size: 12px; margin-top: 3px;">📞 01006113627</div>
            </div>

            <div class="divider"></div>

            <div class="info-row"><span>رقم الفاتورة:</span> <span>#${newInvoiceId}</span></div>
            <div class="info-row"><span>نوع الطلب:</span> <span>${orderType}</span></div>
            <div class="info-row"><span>التاريخ:</span> <span>${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span></div>

            ${orderType === 'دليفري' ? `
              <div class="delivery-box">
                <div><b>العميل:</b> ${customerName || 'غير محدد'}</div>
                <div><b>الهاتف:</b> ${customerPhone || '-'}</div>
                <div><b>المنطقة:</b> ${selectedZone ? selectedZone.name : '-'}</div>
                <div><b>العنوان:</b> ${customerAddress || '-'}</div>
              </div>
            ` : ''}

            <div class="divider"></div>

            <div class="item-header">
              <span>الصنف</span>
              <span>الإجمالي</span>
            </div>

            <div>
              ${cart.map(item => `
                <div class="item-row">
                  <span>${item.name} <br/> <small>(${item.quantity} × ${item.price})</small></span>
                  <span>${item.price * item.quantity} ج.م</span>
                </div>
              `).join('')}
            </div>

            ${orderType === 'دليفري' ? `
              <div class="divider"></div>
              <div class="info-row">
                <span>المجموع:</span>
                <span>${subTotal} ج.م</span>
              </div>
              <div class="info-row">
                <span>خدمة التوصيل (${selectedZone?.name || ''}):</span>
                <span>${deliveryFee} ج.م</span>
              </div>
            ` : ''}

            <div class="total-box">
              <span>الصافي المطلوب:</span>
              <span>${totalAmount} ج.م</span>
            </div>

            <div class="solid-divider"></div>

            <div class="footer">
              شكراً لزيارتكم دريم كورنر! ❤️<br/>
              خدمة سريعة - جودة عالية
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 350);
    }

    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setSelectedZoneId('');
  };
