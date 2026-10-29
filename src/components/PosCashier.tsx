import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  QrCode,
  Banknote,
  Building2,
  CheckCircle2,
  Printer,
  X,
  Sparkles,
  Barcode,
  PackagePlus,
  RefreshCw,
} from 'lucide-react';
import { CartItem, PaymentMethod, Product, StoreSettings, Transaction, UserAccount } from '../types/pos';
import { calculateCartTotals, calculateChange, formatRupiah } from '../utils/pos-logic';

interface PosCashierProps {
  products: Product[];
  currentUser: UserAccount;
  settings: StoreSettings;
  onCompleteSale: (transaction: Transaction) => void;
  onOpenAddProductModal?: () => void;
}

export const PosCashier: React.FC<PosCashierProps> = ({
  products,
  currentUser,
  settings,
  onCompleteSale,
  onOpenAddProductModal,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchBarcode, setSearchBarcode] = useState<string>('');
  const [discountInput, setDiscountInput] = useState<number>(0);
  const [discountCode, setDiscountCode] = useState<string>('');
  
  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tunai');
  const [cashAmount, setCashAmount] = useState<number>(0);
  
  // Receipt modal state
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);



  const categories = ['Semua', 'Makanan', 'Minuman', 'Snack', 'Kebutuhan Pokok', 'Personal Care'];

  // Filter products by category & search/barcode
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchCategory =
        selectedCategory === 'Semua' ||
        prod.category.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === 'Kebutuhan Pokok' && prod.category.toLowerCase() === 'sembako');
      
      const q = searchBarcode.toLowerCase().trim();
      const matchSearch =
        !q ||
        prod.name.toLowerCase().includes(q) ||
        prod.barcode.toLowerCase().includes(q);

      return matchCategory && matchSearch && prod.status === 'Aktif';
    });
  }, [products, selectedCategory, searchBarcode]);

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert('Maaf, stok produk ini telah habis!');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Maksimal stok tersedia adalah ${product.stock} pcs`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stock) {
              alert(`Maksimal stok tersedia adalah ${item.product.stock} pcs`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountInput(0);
    setDiscountCode('');
  };

  // Barcode / Enter key direct scan
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchBarcode.trim()) return;

    // Find exact barcode or first matching item
    const match = products.find(
      (p) =>
        p.barcode.toLowerCase() === searchBarcode.trim().toLowerCase() ||
        p.name.toLowerCase().includes(searchBarcode.trim().toLowerCase())
    );

    if (match) {
      addToCart(match);
      setSearchBarcode('');
    }
  };

  // Totals
  const { subtotal, discount, total, totalItemCount } = calculateCartTotals(
    cart,
    discountInput,
    settings.taxRatePercent
  );

  // F9 Keyboard shortcut listener for quick checkout
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F9') {
        e.preventDefault();
        if (cart.length > 0) {
          setCashAmount(total);
          setIsPaymentModalOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, total]);

  const handleApplyDiscountCode = () => {
    if (discountCode.trim().toUpperCase() === 'DISKON10') {
      const disc = Math.round(subtotal * 0.1);
      setDiscountInput(disc);
    } else if (discountCode.trim().toUpperCase() === 'HEMAT5K') {
      setDiscountInput(5000);
    } else if (discountCode.trim()) {
      alert('Kode promo tidak valid. Coba: DISKON10 atau HEMAT5K');
    }
  };

  // Open Checkout
  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setCashAmount(total); // default cash to exact amount
    setIsPaymentModalOpen(true);
  };

  // Finalize Transaction
  const handleProcessPayment = () => {
    if (paymentMethod === 'Tunai' && cashAmount < total) {
      alert('Uang tunai yang diterima kurang dari total tagihan.');
      return;
    }

    const change = paymentMethod === 'Tunai' ? calculateChange(total, cashAmount) : 0;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const newTransaction: Transaction = {
      id: `trx-${Date.now()}`,
      transactionNo: `TRX-${Math.floor(100000 + Math.random() * 900000)}`,
      date: formattedDate,
      cashierName: currentUser.name,
      cashierUsername: currentUser.username,
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.sellPrice,
        quantity: item.quantity,
        subtotal: item.product.sellPrice * item.quantity,
        image: item.product.image,
      })),
      subtotal,
      discount,
      tax: 0,
      total,
      paymentMethod,
      cashReceived: paymentMethod === 'Tunai' ? cashAmount : total,
      change,
      status: 'Selesai',
    };

    onCompleteSale(newTransaction);
    setCompletedTransaction(newTransaction);
    setIsPaymentModalOpen(false);
    clearCart();
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col lg:flex-row gap-5">
      {/* Left Column: Product Selection Grid */}
      <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Top Filter and Search Bar */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          {/* Barcode / Search Box */}
          <form onSubmit={handleBarcodeSubmit} className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Barcode className="w-5 h-5 text-blue-600" />
            </div>
            <input
              type="text"
              value={searchBarcode}
              onChange={(e) => setSearchBarcode(e.target.value)}
              placeholder="Scan barcode atau cari produk... [Tekan Enter]"
              className="w-full pl-11 pr-24 py-2.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            />
            <div className="absolute right-2 flex items-center gap-1.5">
              <button
                type="submit"
                className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[11px] font-semibold hover:bg-blue-700 transition"
              >
                Cari
              </button>
            </div>
          </form>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-800'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-12">
              <Search className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">Produk tidak ditemukan</p>
              <p className="text-xs text-slate-400 mt-1">Coba kata kunci lain atau pilih kategori Semua.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredProducts.map((prod) => {
                const inCartItem = cart.find((i) => i.product.id === prod.id);
                const isOutOfStock = prod.stock <= 0;

                return (
                  <div
                    key={prod.id}
                    onClick={() => !isOutOfStock && addToCart(prod)}
                    className={`group relative bg-white border rounded-2xl p-3 flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                      inCartItem
                        ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                        : 'border-slate-200/80 hover:border-blue-400 hover:shadow-md'
                    } ${isOutOfStock ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''}`}
                  >
                    {/* Badge if item is in cart */}
                    {inCartItem && (
                      <span className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                        {inCartItem.quantity}
                      </span>
                    )}

                    {/* Image */}
                    <div className="w-full h-28 rounded-xl overflow-hidden bg-slate-100 mb-2.5 relative">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider px-2 py-0.5 rounded bg-rose-600">
                            Habis
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition">
                        {prod.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Stok: {prod.stock}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs font-extrabold text-blue-700">
                          {formatRupiah(prod.sellPrice)}
                        </span>
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
          <span>Total Produk Ditampilkan: <strong>{filteredProducts.length}</strong></span>
          {onOpenAddProductModal && (
            <button
              onClick={onOpenAddProductModal}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
            >
              <PackagePlus className="w-4 h-4" />
              <span>+ Tambah Produk</span>
            </button>
          )}
        </div>
      </div>

      {/* Right Column: Shopping Cart Panel */}
      <div className="w-full lg:w-96 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col shrink-0 overflow-hidden">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Keranjang Belanja</h3>
              <p className="text-[11px] text-slate-500">{totalItemCount} item dipilih</p>
            </div>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition"
              title="Kosongkan Keranjang"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <ShoppingCart className="w-12 h-12 stroke-[1.2] text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-600">Keranjang masih kosong</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                Klik item produk di sebelah kiri atau scan barcode untuk menambahkan.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-semibold text-slate-800 truncate">
                    {item.product.name}
                  </h5>
                  <p className="text-[11px] text-blue-600 font-bold">
                    {formatRupiah(item.product.sellPrice)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                  <button
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded text-xs transition"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-slate-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, 1)}
                    className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded text-xs transition"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right min-w-[65px]">
                  <span className="text-xs font-bold text-slate-900 block">
                    {formatRupiah(item.product.sellPrice * item.quantity)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-[10px] text-rose-500 hover:underline"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Calculation & Summary */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 space-y-3">
          {/* Discount input */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Kode Promo (cth: DISKON10)"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg uppercase font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <button
                type="button"
                onClick={handleApplyDiscountCode}
                className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Gunakan
              </button>
            </div>
            {discount > 0 && (
              <p className="text-[10px] text-emerald-600 font-medium">
                Potongan promo diterapkan: {formatRupiah(discount)}
              </p>
            )}
          </div>

          {/* Subtotal & Discount lines */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold">{formatRupiah(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Diskon</span>
                <span>-{formatRupiah(discount)}</span>
              </div>
            )}
          </div>

          {/* Grand Total */}
          <div className="pt-2 border-t border-slate-200 flex items-baseline justify-between">
            <span className="text-sm font-bold text-slate-800">Total</span>
            <span className="text-2xl font-extrabold text-blue-700">
              {formatRupiah(total)}
            </span>
          </div>

          {/* Action Buttons: Bayar (F9) and Batal */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={clearCart}
              disabled={cart.length === 0}
              className="py-2.5 px-3 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-700 font-semibold text-xs rounded-xl transition disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleOpenCheckout}
              disabled={cart.length === 0}
              className="col-span-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              <span>Bayar (F9)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payment Processing Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#0b192c] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Proses Pembayaran</h3>
                <p className="text-xs text-blue-200">Kasir: {currentUser.name}</p>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Total Display */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-center">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Total Tagihan Belanja
                </span>
                <span className="text-3xl font-extrabold text-blue-700 mt-1 block">
                  {formatRupiah(total)}
                </span>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  ({totalItemCount} barang)
                </span>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Metode Pembayaran:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'Tunai' as PaymentMethod, label: 'Tunai', icon: Banknote },
                    { id: 'QRIS' as PaymentMethod, label: 'QRIS', icon: QrCode },
                    { id: 'Debit' as PaymentMethod, label: 'Debit', icon: CreditCard },
                    { id: 'Transfer Bank' as PaymentMethod, label: 'Transfer', icon: Building2 },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cash Input details if Tunai */}
              {paymentMethod === 'Tunai' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Uang Tunai Diterima:
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center font-bold text-slate-400 text-sm">
                        Rp
                      </span>
                      <input
                        type="number"
                        value={cashAmount || ''}
                        onChange={(e) => setCashAmount(Number(e.target.value))}
                        className="w-full pl-10 pr-3 py-2 text-base font-bold text-slate-800 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Cash Quick Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setCashAmount(total)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition"
                    >
                      Uang Pas
                    </button>
                    {[50000, 100000, 150000, 200000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setCashAmount(amt)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition"
                      >
                        {formatRupiah(amt)}
                      </button>
                    ))}
                  </div>

                  {/* Kembalian Calculation */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Kembalian:</span>
                    <span
                      className={`text-lg font-bold ${
                        cashAmount >= total ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {cashAmount >= total
                        ? formatRupiah(cashAmount - total)
                        : `Kurang ${formatRupiah(total - cashAmount)}`}
                    </span>
                  </div>
                </div>
              )}

              {/* QRIS Display */}
              {paymentMethod === 'QRIS' && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl border border-slate-300 shadow-xs flex items-center justify-center">
                    {/* Simulated realistic QR code pattern */}
                    <div className="w-full h-full bg-[radial-gradient(#0b192c_2px,transparent_2px)] [background-size:8px_8px] rounded flex items-center justify-center border border-slate-200">
                      <div className="bg-white p-1 rounded font-bold text-[9px] text-blue-700 shadow-xs">
                        QRIS eljaMart
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    Arahkan kamera pelanggan ke kode QR di atas (GoPay, OVO, Dana, BCA, Mandiri)
                  </p>
                </div>
              )}

              {/* Submit Payment */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleProcessPayment}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Selesaikan & Cetak Struk</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {completedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Paper Receipt Styling */}
            <div id="printable-receipt" className="p-6 text-slate-800 font-mono text-xs bg-white">
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <h2 className="text-base font-bold tracking-tight text-slate-900">
                  {settings.storeName}
                </h2>
                <p className="text-[10px] text-slate-500 font-sans">{settings.tagline}</p>
                <p className="text-[10px] text-slate-500 font-sans mt-0.5">{settings.address}</p>
                <p className="text-[10px] text-slate-500 font-sans">Telp: {settings.phone}</p>
              </div>

              <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>No: {completedTransaction.transactionNo}</span>
                  <span>{completedTransaction.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir: {completedTransaction.cashierName}</span>
                  <span>Metode: {completedTransaction.paymentMethod}</span>
                </div>
              </div>

              {/* Items */}
              <div className="py-2.5 border-b border-dashed border-slate-300 space-y-2 text-[11px]">
                {completedTransaction.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="font-semibold text-slate-900">{item.name}</div>
                    <div className="flex justify-between text-slate-600">
                      <span>
                        {item.quantity} x {formatRupiah(item.price)}
                      </span>
                      <span>{formatRupiah(item.subtotal)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatRupiah(completedTransaction.subtotal)}</span>
                </div>
                {completedTransaction.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Diskon:</span>
                    <span>-{formatRupiah(completedTransaction.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1">
                  <span>TOTAL:</span>
                  <span>{formatRupiah(completedTransaction.total)}</span>
                </div>
                {completedTransaction.cashReceived !== undefined && (
                  <>
                    <div className="flex justify-between pt-1">
                      <span>Bayar Tunai:</span>
                      <span>{formatRupiah(completedTransaction.cashReceived)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Kembalian:</span>
                      <span>{formatRupiah(completedTransaction.change || 0)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Barcode & Footer */}
              <div className="text-center pt-3 space-y-1.5 font-sans">
                <div className="w-3/4 mx-auto h-7 bg-[repeating-linear-gradient(90deg,#000,#000_2px,transparent_2px,transparent_4px)]"></div>
                <p className="text-[10px] text-slate-600 whitespace-pre-line leading-tight">
                  {settings.receiptFooter}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCompletedTransaction(null)}
                className="flex-1 py-2 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition"
              >
                Tutup Struk
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Struk</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
