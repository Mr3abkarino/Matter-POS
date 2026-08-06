// 📌 1. بيانات المنتج والأحجام
export interface ProductSize {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id?: number;
  catId: string;
  name: string;
  barcode?: string;
  price: number;
  stock: number;
  emoji?: string;
  imageUrl?: string;
  sizes?: ProductSize[];
  hasStuffedCrustOption?: boolean; // خيار حشو الأطراف للبيتزا
  createdAt: number;
}

export interface Category {
  id: string;
  label: string;
  emoji?: string;
}

// 📌 2. السلة والطلب
export interface CartItem {
  itemKey: string;
  productId: number;
  name: string;
  unitPrice: number;
  qty: number;
  sizeName?: string;
  isStuffedCrust?: boolean;
  emoji?: string;
  imageUrl?: string;
}

export type OrderType = "takeaway" | "delivery" | "dinein";
export type PaymentStatus = "pending" | "paid" | "partially_paid";
export type OrderStatus = "completed" | "cancelled" | "refunded";

export interface Invoice {
  id?: number;
  shiftId: number;
  ticketNo: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  orderType: OrderType;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  deliveryZoneName?: string;
  driverName?: string;
  cashierName: string;
  items: CartItem[];
  createdAt: number;
  dateStr: string;
  timeStr: string;
}

// 📌 3. العملاء والموردين
export interface Customer {
  id?: number;
  name: string;
  phone: string;
  address?: string;
  points: number;
  debt: number;
  createdAt: number;
}

export interface Supplier {
  id?: number;
  name: string;
  companyName?: string;
  phone: string;
  balance: number; // المبلغ المستحق له أو عليه
}

// 📌 4. الورديات والجرد
export interface Shift {
  id?: number;
  cashierName: string;
  openingBalance: number;
  closingBalance?: number;
  expectedBalance?: number;
  totalSales: number;
  ordersCount: number;
  startTime: number;
  endTime?: number;
  status: "open" | "closed";
}

// 📌 5. إعدادات المطعم والطابعة
export interface RestaurantSettings {
  name: string;
  logoUrl?: string;
  address: string;
  phone: string;
  printerName: string;
  paperWidth: "80mm" | "58mm";
  receiptFooter: string;
  autoPrint: boolean;
  language: "ar" | "en";
  theme: "light" | "dark";
}
