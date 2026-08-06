import { create } from 'zustand';
import { Shift } from '../types';
import { db } from '../db/dexie';

interface ShiftState {
  activeShift: Shift | null;
  isLoading: boolean;
  
  // Actions
  loadActiveShift: () => Promise<void>;
  openShift: (cashierName: string, openingBalance: number) => Promise<Shift>;
  closeShift: (actualCashEntered: number) => Promise<void>;
}

export const useShiftStore = create<ShiftState>((set, get) => ({
  activeShift: null,
  isLoading: true,

  loadActiveShift: async () => {
    set({ isLoading: true });
    // البحث عن وردية مفتوحة في Dexie DB
    const openShift = await db.shifts.where('status').equals('open').first();
    set({ activeShift: openShift || null, isLoading: false });
  },

  openShift: async (cashierName, openingBalance) => {
    const newShift: Shift = {
      cashierName,
      openingBalance,
      totalSales: 0,
      ordersCount: 0,
      startTime: Date.now(),
      status: 'open',
    };

    const id = await db.shifts.add(newShift);
    const createdShift = { ...newShift, id };
    set({ activeShift: createdShift });
    return createdShift;
  },

  closeShift: async (actualCashEntered) => {
    const currentShift = get().activeShift;
    if (!currentShift || !currentShift.id) return;

    // حساب إجمالي مبيعات الفواتير لهذه الوردية
    const shiftInvoices = await db.invoices
      .where('shiftId')
      .equals(currentShift.id)
      .filter((inv) => inv.status !== 'cancelled')
      .toArray();

    const totalSales = shiftInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const expectedBalance = currentShift.openingBalance + totalSales;

    await db.shifts.update(currentShift.id, {
      closingBalance: actualCashEntered,
      expectedBalance,
      totalSales,
      ordersCount: shiftInvoices.length,
      endTime: Date.now(),
      status: 'closed',
    });

    set({ activeShift: null });
  },
}));
