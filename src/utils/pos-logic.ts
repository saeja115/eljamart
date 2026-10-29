import { CartItem, Product, Transaction, UserAccount } from '../types/pos';

export function formatRupiah(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export function calculateCartTotals(
  items: CartItem[],
  discountNominal: number = 0,
  taxPercent: number = 0
): { subtotal: number; discount: number; tax: number; total: number; totalItemCount: number } {
  const subtotal = items.reduce((sum, item) => sum + item.product.sellPrice * item.quantity, 0);
  const discount = Math.max(0, Math.min(discountNominal, subtotal));
  const afterDiscount = subtotal - discount;
  const tax = Math.round((afterDiscount * taxPercent) / 100);
  const total = Math.max(0, afterDiscount + tax);
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { subtotal, discount, tax, total, totalItemCount };
}

export function calculateChange(total: number, cashReceived: number): number {
  if (cashReceived < total) return 0;
  return cashReceived - total;
}

export function getStockStatus(stock: number, minStock: number = 20): {
  label: 'Aman' | 'Menipis' | 'Habis';
  badgeClass: string;
} {
  if (stock <= 0) {
    return {
      label: 'Habis',
      badgeClass: 'bg-rose-100 text-rose-700 border border-rose-200',
    };
  }
  if (stock <= minStock) {
    return {
      label: 'Menipis',
      badgeClass: 'bg-amber-100 text-amber-700 border border-amber-200',
    };
  }
  return {
    label: 'Aman',
    badgeClass: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  };
}

export function authenticateUser(
  usernameInput: string,
  passwordInput: string,
  users: UserAccount[]
): { success: boolean; user?: UserAccount; error?: string } {
  const cleanUsername = usernameInput.trim().toLowerCase();
  const cleanPassword = passwordInput.trim();

  if (!cleanUsername || !cleanPassword) {
    return { success: false, error: 'Nama pengguna dan kata sandi wajib diisi.' };
  }

  const user = users.find(
    (u) => u.username.toLowerCase() === cleanUsername && u.password === cleanPassword
  );

  if (!user) {
    return { success: false, error: 'Nama pengguna atau kata sandi salah.' };
  }

  return { success: true, user };
}

export function calculateDashboardStats(transactions: Transaction[], products: Product[]) {
  // Today's date check: format YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  const todayTransactions = transactions.filter((t) => {
    return t.date.startsWith(todayStr) && t.status !== 'Dibatalkan';
  });

  const totalPenjualanHariIni = todayTransactions.reduce((sum, t) => sum + t.total, 0);
  const jumlahTransaksiHariIni = todayTransactions.length;

  const totalProduk = products.length;
  const produkAktif = products.filter((p) => p.status === 'Aktif').length;
  const produkNonaktif = totalProduk - produkAktif;

  const stokMenipisList = products.filter((p) => p.stock <= p.minStock);
  const totalStokMenipis = stokMenipisList.length;

  return {
    totalPenjualanHariIni,
    jumlahTransaksiHariIni,
    totalProduk,
    produkAktif,
    produkNonaktif,
    totalStokMenipis,
    stokMenipisList,
  };
}

export function filterTransactionsByDate(
  transactions: Transaction[],
  range: 'hari-ini' | '7-hari' | 'bulan-ini' | 'semua',
  paymentMethod: string = 'Semua'
): Transaction[] {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const sevenDaysAgo = startOfDay - 7 * 24 * 60 * 60 * 1000;
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  return transactions.filter((t) => {
    const tTime = new Date(t.date).getTime();

    // Payment method filter
    if (paymentMethod !== 'Semua' && t.paymentMethod !== paymentMethod) {
      return false;
    }

    if (range === 'hari-ini') {
      return tTime >= startOfDay;
    } else if (range === '7-hari') {
      return tTime >= sevenDaysAgo;
    } else if (range === 'bulan-ini') {
      return tTime >= startOfMonth;
    }
    return true;
  });
}
