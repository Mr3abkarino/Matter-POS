import Dexie, { Table } from 'dexie';

export class POSDatabase extends Dexie {
  categories!: Table<any>;
  products!: Table<any>;
  invoices!: Table<any>;
  customers!: Table<any>;
  shifts!: Table<any>;
  settings!: Table<any>;
  users!: Table<any>;
  deliveryZones!: Table<any>;

  constructor() {
    super('DreamCornerDB');
    
    // رفع إصدار قاعدة البيانات لإضافة جدول مناطق الدليفري والمستخدمين
    this.version(12).stores({
      categories: 'id, label',
      products: '++id, catId, name',
      invoices: '++id, shiftId, createdAt, orderType',
      customers: '++id, phone',
      shifts: '++id, startTime, endTime, status',
      settings: 'id',
      users: '++id, username, role',
      deliveryZones: '++id, name, fee'
    });
  }
}

export const db = new POSDatabase();

// إدخال البيانات الافتراضية عند إنشاء قاعدة البيانات لأول مرة
db.on('populate', async () => {
  // 1. أقسام المنيو
  await db.categories.bulkAdd([
    { id: 'البيتزا', label: 'البيتزا', emoji: '🍕' },
    { id: 'السندوتشات', label: 'السندوتشات', emoji: '🥪' },
    { id: 'البرجر', label: 'البرجر', emoji: '🍔' },
    { id: 'التوست', label: 'التوست', emoji: '🍞' },
    { id: 'الأصناف الجانبية', label: 'الأصناف الجانبية', emoji: '🍟' },
    { id: 'المشروبات', label: 'المشروبات', emoji: '🥤' }
  ]);

  // 2. الأصناف كاملة بجميع أحجامها وأسعارها
  await db.products.bulkAdd([
    // --- البيتزا ---
    {
      catId: 'البيتزا',
      name: 'بيتزا مارجريتا',
      price: 45,
      stock: 50,
      emoji: '🍕',
      sizes: [{ id: 'sm', name: 'صغير', price: 45 }, { id: 'md', name: 'وسط', price: 70 }, { id: 'lg', name: 'كبير', price: 90 }],
      createdAt: Date.now()
    },
    {
      catId: 'البيتزا',
      name: 'بيتزا ميكس جبنة',
      price: 75,
      stock: 50,
      emoji: '🧀',
      sizes: [{ id: 'sm', name: 'صغير', price: 75 }, { id: 'md', name: 'وسط', price: 105 }, { id: 'lg', name: 'كبير', price: 135 }],
      createdAt: Date.now()
    },
    {
      catId: 'البيتزا',
      name: 'بيتزا خضروات',
      price: 60,
      stock: 45,
      emoji: '🍅',
      sizes: [{ id: 'sm', name: 'صغير', price: 60 }, { id: 'md', name: 'وسط', price: 90 }, { id: 'lg', name: 'كبير', price: 120 }],
      createdAt: Date.now()
    },
    {
      catId: 'البيتزا',
      name: 'بيتزا هوت دوج',
      price: 70,
      stock: 40,
      emoji: '🌭',
      sizes: [{ id: 'sm', name: 'صغير', price: 70 }, { id: 'md', name: 'وسط', price: 100 }, { id: 'lg', name: 'كبير', price: 135 }],
      createdAt: Date.now()
    },
    {
      catId: 'البيتزا',
      name: 'بيتزا سجق',
      price: 70,
      stock: 40,
      emoji: '🥩',
      sizes: [{ id: 'sm', name: 'صغير', price: 70 }, { id: 'md', name: 'وسط', price: 100 }, { id: 'lg', name: 'كبير', price: 135 }],
      createdAt: Date.now()
    },
    {
      catId: 'البيتزا',
      name: 'بيتزا لحم مفروم',
      price: 80,
      stock: 35,
      emoji: '🥩',
      sizes: [{ id: 'sm', name: 'صغير', price: 80 }, { id: 'md', name: 'وسط', price: 120 }, { id: 'lg', name: 'كبير', price: 150 }],
      createdAt: Date.now()
    },
    {
      catId: 'البيتزا',
      name: 'بيتزا بيبروني',
      price: 70,
      stock: 35,
      emoji: '🍕',
      sizes: [{ id: 'sm', name: 'صغير', price: 70 }, { id: 'md', name: 'وسط', price: 90 }, { id: 'lg', name: 'كبير', price: 110 }],
      createdAt: Date.now()
    },
    {
      catId: 'البيتزا',
      name: 'بيتزا سلامي',
      price: 80,
      stock: 30,
      emoji: '🍕',
      sizes: [{ id: 'sm', name: 'صغير', price: 80 }, { id: 'md', name: 'وسط', price: 120 }, { id: 'lg', name: 'كبير', price: 135 }],
      createdAt: Date.now()
    },
    {
      catId: 'البيتزا',
      name: 'بيتزا شاورما دجاج',
      price: 80,
      stock: 40,
      emoji: '🍗',
      sizes: [{ id: 'sm', name: 'صغير', price: 80 }, { id: 'md', name: 'وسط', price: 120 }, { id: 'lg', name: 'كبير', price: 155 }],
      createdAt: Date.now()
    },
    {
      catId: 'البيتزا',
      name: 'بيتزا دجاج رانش',
      price: 80,
      stock: 40,
      emoji: '🍗',
      sizes: [{ id: 'sm', name: 'صغير', price: 80 }, { id: 'md', name: 'وسط', price: 120 }, { id: 'lg', name: 'كبير', price: 155 }],
      createdAt: Date.now()
    },
    {
      catId: 'البيتزا',
      name: 'بيتزا دريم كورنر (سبشيال)',
      price: 110,
      stock: 25,
      emoji: '🌟',
      sizes: [{ id: 'sm', name: 'صغير', price: 110 }, { id: 'md', name: 'وسط', price: 135 }, { id: 'lg', name: 'كبير', price: 180 }],
      createdAt: Date.now()
    },
    {
      catId: 'البيتزا',
      name: 'بيتزا كرانشي (حار أو بارد)',
      price: 90,
      stock: 35,
      emoji: '🔥',
      sizes: [{ id: 'sm', name: 'صغير', price: 90 }, { id: 'md', name: 'وسط', price: 120 }, { id: 'lg', name: 'كبير', price: 150 }],
      createdAt: Date.now()
    },
    {
      catId: 'البيتزا',
      name: 'بيتزا ميكس دجاج',
      price: 90,
      stock: 35,
      emoji: '🍗',
      sizes: [{ id: 'sm', name: 'صغير', price: 90 }, { id: 'md', name: 'وسط', price: 120 }, { id: 'lg', name: 'كبير', price: 150 }],
      createdAt: Date.now()
    },
    {
      catId: 'البيتزا',
      name: 'بيتزا ميكس لحوم',
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
    { catId: 'الأصناف الجانبية', name: 'بطاطس مقلية', price: 35, stock: 80, emoji: '🍟', sizes: [{ id: 'lg', name: 'عادي', price: 35 }], createdAt: Date.now() },
    { catId: 'الأصناف الجانبية', name: 'بطاطس بالجبنة الشيدر', price: 45, stock: 60, emoji: '🧀', sizes: [{ id: 'lg', name: 'عادي', price: 45 }], createdAt: Date.now() },
    { catId: 'الأصناف الجانبية', name: 'صوص رانش', price: 15, stock: 100, emoji: '🥣', createdAt: Date.now() },
    { catId: 'الأصناف الجانبية', name: 'صوص باربيكيو', price: 15, stock: 100, emoji: '🥣', createdAt: Date.now() },

    // --- المشروبات ---
    { catId: 'المشروبات', name: 'بيبسي', price: 15, stock: 100, emoji: '🥤', createdAt: Date.now() },
    { catId: 'المشروبات', name: 'سفن أب', price: 15, stock: 100, emoji: '🥤', createdAt: Date.now() },
    { catId: 'المشروبات', name: 'ميرندا', price: 15, stock: 100, emoji: '🥤', createdAt: Date.now() },
    { catId: 'المشروبات', name: 'مياه معدنية', price: 6, stock: 150, emoji: '💧', createdAt: Date.now() }
  ]);

  // 3. حسابات التسجيل الافتراضية
  await db.users.bulkAdd([
    { id: 1, username: 'admin', password: '123', name: 'المدير المسؤول', role: 'admin' },
    { id: 2, username: 'casher', password: '123', name: 'كاشير الورديات', role: 'casher' }
  ]);

  // 4. مناطق الدليفري الافتراضية بأسعارها
  await db.deliveryZones.bulkAdd([
    { name: 'البرامون (داخل البلد)', fee: 10 },
    { name: 'البرامون (بر الترعة)', fee: 20 },
    { name: 'سرسو البرامون', fee: 30 },
    { name: 'كفر بدواي', fee: 50 },
    { name: 'الخيارية', fee: 50 },
    { name: 'كفر البرامون', fee: 40 },
    { name: 'البدالة', fee: 40 }
  ]);
});
