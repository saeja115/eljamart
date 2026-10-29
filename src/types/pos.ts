export type UserRole = 'admin' | 'kasir' | 'gudang';

export interface UserAccount {
  id: string;
  username: string;
  password: string; // kata sandi
  name: string;
  role: UserRole;
  roleLabel: string;
  avatar: string;
  email: string;
  lastLogin?: string;
}

export type ProductCategory = 
  | 'Semua'
  | 'Makanan'
  | 'Minuman'
  | 'Snack'
  | 'Kebutuhan Pokok'
  | 'Personal Care';

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  supplier: string;
  stock: number;
  minStock: number;
  buyPrice: number;
  sellPrice: number;
  image: string;
  status: 'Aktif' | 'Nonaktif';
  soldCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type TransactionStatus = 'Selesai' | 'Diproses' | 'Dibatalkan';
export type PaymentMethod = 'Tunai' | 'QRIS' | 'Debit' | 'Transfer Bank';

export interface TransactionItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  image: string;
}

export interface Transaction {
  id: string;
  transactionNo: string;
  date: string; // ISO string or formatted date
  cashierName: string;
  cashierUsername: string;
  items: TransactionItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  change?: number;
  status: TransactionStatus;
  notes?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  receiptFooter: string;
  taxRatePercent: number; // e.g. 0 or 11
  currency: string;
}
