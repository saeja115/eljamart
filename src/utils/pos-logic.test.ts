import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCartTotals,
  calculateChange,
  getStockStatus,
  authenticateUser,
  formatRupiah,
} from './pos-logic';
import { CartItem, Product, UserAccount } from '../types/pos';

test('formatRupiah formats number to IDR string', () => {
  const result = formatRupiah(42500);
  assert.match(result, /Rp\s*42\.500/);
});

test('calculateCartTotals calculates subtotal, discount, and total correctly', () => {
  const sampleProduct1: Product = {
    id: 'p1',
    barcode: '8991234567',
    name: 'Indomie Goreng',
    category: 'Makanan',
    supplier: 'PT Indofood',
    stock: 100,
    minStock: 20,
    buyPrice: 2800,
    sellPrice: 3500,
    image: '',
    status: 'Aktif',
    soldCount: 10,
  };

  const sampleProduct2: Product = {
    id: 'p2',
    barcode: '8999876543',
    name: 'Aqua 600ml',
    category: 'Minuman',
    supplier: 'PT Danone',
    stock: 50,
    minStock: 15,
    buyPrice: 3000,
    sellPrice: 4000,
    image: '',
    status: 'Aktif',
    soldCount: 5,
  };

  const items: CartItem[] = [
    { product: sampleProduct1, quantity: 2 }, // 7000
    { product: sampleProduct2, quantity: 1 }, // 4000
  ];

  // Subtotal = 11000
  const noDiscount = calculateCartTotals(items, 0, 0);
  assert.equal(noDiscount.subtotal, 11000);
  assert.equal(noDiscount.discount, 0);
  assert.equal(noDiscount.total, 11000);
  assert.equal(noDiscount.totalItemCount, 3);

  // With discount Rp 1.000
  const withDiscount = calculateCartTotals(items, 1000, 0);
  assert.equal(withDiscount.subtotal, 11000);
  assert.equal(withDiscount.discount, 1000);
  assert.equal(withDiscount.total, 10000);

  // Discount capped at subtotal
  const overDiscount = calculateCartTotals(items, 20000, 0);
  assert.equal(overDiscount.discount, 11000);
  assert.equal(overDiscount.total, 0);
});

test('calculateChange handles correct cash change', () => {
  assert.equal(calculateChange(42500, 50000), 7500);
  assert.equal(calculateChange(42500, 42500), 0);
  assert.equal(calculateChange(42500, 30000), 0); // insufficient cash
});

test('getStockStatus identifies Aman, Menipis, and Habis states', () => {
  assert.equal(getStockStatus(50, 20).label, 'Aman');
  assert.equal(getStockStatus(20, 20).label, 'Menipis');
  assert.equal(getStockStatus(5, 20).label, 'Menipis');
  assert.equal(getStockStatus(0, 20).label, 'Habis');
  assert.equal(getStockStatus(-1, 20).label, 'Habis');
});

test('authenticateUser authenticates with username and password', () => {
  const users: UserAccount[] = [
    {
      id: 'u1',
      username: 'admin',
      password: 'admin123',
      name: 'Admin Toko',
      role: 'admin',
      roleLabel: 'Super Admin',
      avatar: '',
      email: 'admin@eljamart.com',
    },
    {
      id: 'u2',
      username: 'kasir',
      password: 'kasir123',
      name: 'Siti Nurhaliza',
      role: 'kasir',
      roleLabel: 'Kasir',
      avatar: '',
      email: 'kasir@eljamart.com',
    },
  ];

  // Success admin
  const res1 = authenticateUser('admin', 'admin123', users);
  assert.equal(res1.success, true);
  assert.equal(res1.user?.role, 'admin');

  // Success kasir (case-insensitive username)
  const res2 = authenticateUser('KASIR', 'kasir123', users);
  assert.equal(res2.success, true);
  assert.equal(res2.user?.role, 'kasir');

  // Wrong password
  const res3 = authenticateUser('admin', 'wrongpass', users);
  assert.equal(res3.success, false);
  assert.equal(res3.error, 'Nama pengguna atau kata sandi salah.');

  // Empty fields
  const res4 = authenticateUser('', '', users);
  assert.equal(res4.success, false);
});
