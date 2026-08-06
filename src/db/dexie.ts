import Dexie, { Table } from 'dexie';
import { Product, Category, Invoice, Shift, Customer } from '../types';

export class POSDatabase extends Dexie {
  products!: Table<Product, number>;
  categories!: Table<Category, string>;
  invoices!: Table<Invoice, number>;
  shifts!: Table<Shift, number>;
  customers!: Table<Customer, number>;

  constructor() {
    super('MatterPOSDatabase');
    this.version(4).stores({
      products: '++id, catId, name, barcode',
      categories: 'id, label',
      invoices: '++id, shiftId, createdAt, orderType',
      shifts: '++id, status, openedAt',
      customers: '++id, phone, name'
    });
  }
}

export const db = new POSDatabase();

db.on('populate', async () => {
  await db.categories.bulkAdd([
    { id: 'البيتزا', label: 'البيتزا', emoji: '🍕' },
    { id: 'السندوتشات', label: 'السندوتشات', emoji: '🥪' },
    { id: 'البرجر', label: 'البرجر', emoji: '🍔' },
    { id: 'التوست', label: 'التوست', emoji: '🍞' },
    { id: 'الأصناف الجانبية', label: 'الأصناف الجانبية', emoji: '🍟' },
    { id: 'المشروبات', label: 'المشروبات', emoji: '🥤' }
  ]);

  await db.products.bulkAdd([
    // --- البيتزا ---
    {
      catId: 'البيتزا',
      name: 'مارجريتا',
      price: 45,
      stock: 50,
      emoji: '🍕',
      sizes: [{ id: 'sm', name: 'صغير', price: 45 }, { id: 'md', name: 'وسط', price: 70 }, { id: 'lg', name: 'كبير', price: 90 }],
      createdAt: Date.now()
    },
    {
      catId: 'البيتزا',
      name: 'ميكس جبنة',
      price: 75,
      stock: 50,
      emoji: '🧀',
      sizes: [{ id: 'sm', name: 'صغير', price: 75 }, { id: 'md', name: 'وسط', price: 105 }, { id: 'lg', name: 'كبير', price: 135 }],
      createdAt: Date.now()
    },
    {
      catId: 'البيتزا',
      name: 'خضار',
      price: 60,
      stock: 45,
      emoji: '🍅',
      sizes: [{ id: 'sm', name: 'صغير', price: 60 }, { id: 'md', name: 'وسط', price: 90 }, { id: 'lg', name: 'كبير', price: 120 }],
      createdAt: Date.now()
    },
    {
      catId: 'البيتزا',
      name: 'هوت دوج',
      price: 70,
      stock: 40,
      emoji: '🌭',
      sizes: [{ id: 'sm', name: 'صغير', price: 70 }, { id: 'md', name: 'وسط', price: 100 }, { id: 'lg', name: 'كبير', price: 135 }],
      createdAt: Date.now()
    },
    {
      catId: 'البيتزا',
      name: 'سجق',
      price: 70,
      stock: 40,
      emoji: '🥩',
      sizes: [{ id: 'sm', name: 'صغير', price: 70 }, { id: 'md', name: 'وسط', price: 100 }, { id: 'lg', name: 'كبير', price: 135 }],
      createdAt: Date.now()
    },
    {
      catId: 'البيتزا',
      name: 'لحم مفروم',
      price: 80,
      stock: 35,
      emoji: '🥩',
      sizes: [{ id: 'sm', name: 'صغير', price: 80 }, { id: 'md', name: 'وسط', price: 120 }, { id: 'lg', name: 'كبير', price: 150 }],
      createdAt: Date.now()
    },
    {
      catId: 'البيتزا',
      name: 'بيبروني',
      price: 70,
      stock: 35,
      emoji: '🍕',
      sizes: [{ id: 'sm', name: 'صغير', price: 70 }, { id: 'md', name: 'وسط', price: 90 }, { id: 'lg', name: 'كبير', price: 110 }],
      createdAt: Date.now()
    },
    {
      catId: 'البيتزا',
      name: 'سلامي',
      price: 80,
      stock: 30,
      emoji: '🍕',
      sizes: [{ id: 'sm', name: 'صغير', price: 80 }, { id: 'md', name: 'وسط', price: 120 }, { id: 'lg', name: 'كبير', price: 135 }],
      createdAt: Date.now()
    },
    {
      catId: 'البيتزا',
      name: 'شاورما دجاج',
      price: 80,
      stock: 40,
      emoji: '🍗',
      sizes: [{ id: 'sm', name: 'صغير', price: 80 }, { id: 'md', name: 'وسط', price: 120 }, { id: 'lg', name: 'كبير', price: 155 }],
      createdAt: Date.now()
    },
    {
      catId: 'البيتزا',
      name: 'دجاج رانش',
      price: 80,
      stock: 40,
      emoji: '🍗',
      sizes: [{ id: 'sm', name: 'صغير', price: 80 }, { id: 'md', name: 'وسط', price: 120 }, { id: 'lg', name: 'كبير', price: 155 }],
      createdAt: Date.now()
    },
    {
      catId: 'البيتزا',
      name: 'دريم كورنر (سبشال)',
      price: 110,
      stock: 25,
      emoji: '🌟',
      sizes: [{ id: 'sm', name: 'صغير', price: 110 }, { id: 'md', name: 'وسط', price: 135 }, { id: 'lg', name: 'كبير', price: 180 }],
      createdAt: Date.now()
    },
    {
      catId: 'البيتزا',
      name: 'كرانشي (حار أو بارد)',
      price: 90,
      stock: 35,
      emoji: '🔥',
      sizes: [{ id: 'sm', name: 'صغير', price: 90 }, { id: 'md', name: 'وسط', price: 120 }, { id: 'lg', name: 'كبير', price: 150 }],
      createdAt: Date.now()
    },
    {
      catId: 'البيتزا',
      name: 'ميكس دجاج',
      price: 90,
      stock: 35,
      emoji: '🍗',
      sizes: [{ id: 'sm', name: 'صغير', price: 90 }, { id: 'md', name: 'وسط', price: 120 }, { id: 'lg', name: 'كبير', price: 150 }],
      createdAt: Date.now()
    },
    {
      catId: 'البيتزا',
      name: 'ميكس لحوم',
      price: 80,
      stock: 35,
      emoji: '🥩',
      sizes: [{ id: 'sm', name: 'صغير', price: 80 }, { id: 'md', name: 'وسط', price: 120 }, { id: 'lg', name: 'كبير', price: 150 }],
      createdAt: Date.now()
    },

    // --- السندوتشات (لحوم ودجاج) ---
    { catId: 'السندوتشات', name: 'كفتة مشوية', price: 75, stock: 30, emoji: '🥪', sizes: [{ id: 'lg', name: 'كبير', price: 75 }], createdAt: Date.now() },
    { catId: 'السندوتشات', name: 'سجق', price: 70, stock: 30, emoji: '🥪', sizes: [{ id: 'lg', name: 'كبير', price: 70 }], createdAt: Date.now() },
    { catId: 'السندوتشات', name: 'كبدة إسكندراني', price: 75, stock: 30, emoji: '🥪', sizes: [{ id: 'lg', name: 'كبير', price: 75 }], createdAt: Date.now() },
    { catId: 'السندوتشات', name: 'ميكس لحوم (كفتة + سجق)', price: 75, stock: 30, emoji: '🥪', sizes: [{ id: 'lg', name: 'كبير', price: 75 }], createdAt: Date.now() },
    { catId: 'السندوتشات', name: 'حواوشي', price: 45, stock: 40, emoji: '🫓', sizes: [{ id: 'lg', name: 'كبير', price: 45 }], createdAt: Date.now() },
    { catId: 'السندوتشات', name: 'تشيكن بانية', price: 85, stock: 35, emoji: '🍔', sizes: [{ id: 'lg', name: 'كبير', price: 85 }], createdAt: Date.now() },
    { catId: 'السندوتشات', name: 'زنجر سوريم', price: 95, stock: 35, emoji: '🍔', sizes: [{ id: 'lg', name: 'كبير', price: 95 }], createdAt: Date.now() },
    { catId: 'السندوتشات', name: 'سوبر كرانشي', price: 95, stock: 35, emoji: '🍔', sizes: [{ id: 'lg', name: 'كبير', price: 95 }], createdAt: Date.now() },
    { catId: 'السندوتشات', name: 'شيش طاووق', price: 90, stock: 30, emoji: '🥪', sizes: [{ id: 'lg', name: 'كبير', price: 90 }], createdAt: Date.now() },
    { catId: 'السندوتشات', name: 'تشيكن رانش', price: 90, stock: 30, emoji: '🥪', sizes: [{ id: 'lg', name: 'كبير', price: 90 }], createdAt: Date.now() },
    { catId: 'السندوتشات', name: 'كردون بلو', price: 95, stock: 30, emoji: '🥪', sizes: [{ id: 'lg', name: 'كبير', price: 95 }], createdAt: Date.now() },

    // --- البرجر ---
    { catId: 'البرجر', name: 'كلاسيك برجر', price: 75, stock: 40, emoji: '🍔', sizes: [{ id: 'lg', name: 'كبير', price: 75 }], createdAt: Date.now() },
    { catId: 'البرجر', name: 'تشيز برجر', price: 85, stock: 40, emoji: '🍔', sizes: [{ id: 'lg', name: 'كبير', price: 85 }], createdAt: Date.now() },
    { catId: 'البرجر', name: 'تشيكن برجر', price: 75, stock: 40, emoji: '🍔', sizes: [{ id: 'lg', name: 'كبير', price: 75 }], createdAt: Date.now() },

    // --- التوست ---
    { catId: 'التوست', name: 'ميكس توست', price: 65, stock: 30, emoji: '🍞', sizes: [{ id: 'lg', name: 'كبير', price: 65 }], createdAt: Date.now() },

    // --- الأصناف الجانبية ---
    { catId: 'الأصناف الجانبية', name: 'بطاطا مقلية', price: 35, stock: 80, emoji: '🍟', sizes: [{ id: 'lg', name: 'عادي', price: 35 }], createdAt: Date.now() },
    { catId: 'الأصناف الجانبية', name: 'بطاطا بالجبنة الشيدر', price: 45, stock: 60, emoji: '🧀', sizes: [{ id: 'lg', name: 'عادي', price: 45 }], createdAt: Date.now() },
    { catId: 'الأصناف الجانبية', name: 'صوص رانش', price: 15, stock: 100, emoji: '🥣', createdAt: Date.now() },
    { catId: 'الأصناف الجانبية', name: 'صوص باربيكيو', price: 15, stock: 100, emoji: '🥣', createdAt: Date.now() },

    // --- المشروبات ---
    { catId: 'المشروبات', name: 'بيبسي', price: 15, stock: 100, emoji: '🥤', createdAt: Date.now() },
    { catId: 'المشروبات', name: 'سفن أب', price: 15, stock: 100, emoji: '🥤', createdAt: Date.now() },
    { catId: 'المشروبات', name: 'ميرندا', price: 15, stock: 100, emoji: '🥤', createdAt: Date.now() },
    { catId: 'المشروبات', name: 'مياه معدنية', price: 6, stock: 150, emoji: '💧', createdAt: Date.now() }
  ]);
});
