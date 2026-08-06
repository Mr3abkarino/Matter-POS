import Dexie, { Table } from 'dexie';
import { Product, Category, Invoice, Customer, Supplier, Shift } from '../types';

export class POSDatabase extends Dexie {
  products!: Table<Product, number>;
  categories!: Table<Category, string>;
  invoices!: Table<Invoice, number>;
  customers!: Table<Customer, number>;
  suppliers!: Table<Supplier, number>;
  shifts!: Table<Shift, number>;

  constructor() {
    super('DreamCornerPOS_DB');
    
    // تعريف الفهارس والجداول (IndexedDB Schema)
    this.version(1).stores({
      products: '++id, catId, name, barcode, price, stock, createdAt',
      categories: 'id, label',
      invoices: '++id, shiftId, ticketNo, orderType, paymentStatus, status, customerPhone, createdAt',
      customers: '++id, name, &phone, debt',
      suppliers: '++id, name, phone',
      shifts: '++id, cashierName, startTime, status'
    });
  }
}

export const db = new POSDatabase();

// 📌 إدراج البيانات الافتراضية إذا كانت قاعدة البيانات فارغة (Seeding)
export async function seedInitialData() {
  const categoriesCount = await db.categories.count();
  if (categoriesCount === 0) {
    await db.categories.bulkAdd([
      { id: "البيتزا", label: "البيتزا", emoji: "🍕" },
      { id: "السندوتشات", label: "السندوتشات", emoji: "🥪" },
      { id: "الأصناف الجانبية", label: "الأصناف الجانبية", emoji: "🍟" },
      { id: "المشروبات", label: "المشروبات", emoji: "🥤" },
    ]);
  }

  const productsCount = await db.products.count();
  if (productsCount === 0) {
    await db.products.bulkAdd([
      { catId: "البيتزا", name: "بيتزا مارجريتا", price: 45, emoji: "🍕", stock: 50, sizes: [{ id: "sm", name: "صغير", price: 45 }, { id: "md", name: "وسط", price: 70 }, { id: "lg", name: "كبير", price: 90 }], createdAt: Date.now() },
      { catId: "البيتزا", name: "بيتزا ميكس جبنة ⭐", price: 60, emoji: "🧀", stock: 50, sizes: [{ id: "sm", name: "صغير", price: 60 }, { id: "md", name: "وسط", price: 90 }, { id: "lg", name: "كبير", price: 120 }], createdAt: Date.now() },
      { catId: "السندوتشات", name: "كفتة مشوية", price: 65, emoji: "🥙", stock: 50, sizes: [{ id: "md", name: "وسط", price: 65 }, { id: "lg", name: "كبير", price: 75 }], createdAt: Date.now() },
      { catId: "الأصناف الجانبية", name: "بطاطس مقلية ذهبية", price: 35, emoji: "🍟", stock: 100, createdAt: Date.now() },
      { catId: "المشروبات", name: "بيبسي كانز", price: 15, emoji: "🥤", stock: 100, createdAt: Date.now() }
    ]);
  }
}
