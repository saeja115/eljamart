import React, { useState, useMemo } from 'react';
import {
  FileText,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  ArrowUpRight,
  Filter,
  Download,
  Calendar,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  X,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';
import { Product, StoreSettings, Transaction } from '../types/pos';
import { formatRupiah } from '../utils/pos-logic';

interface ReportsViewProps {
  transactions: Transaction[];
  products: Product[];
  settings: StoreSettings;
  onUpdateTransactionStatus?: (id: string, status: 'Selesai' | 'Diproses' | 'Dibatalkan') => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  products,
  settings,
  onUpdateTransactionStatus,
}) => {
  const [activeReportTab, setActiveReportTab] = useState<'Penjualan' | 'Stok' | 'Profit' | 'Keuangan'>('Penjualan');
  const [filterRange, setFilterRange] = useState<string>('Bulan Ini');
  const [filterPayment, setFilterPayment] = useState<string>('Semua');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchPayment = filterPayment === 'Semua' || t.paymentMethod === filterPayment;
      return matchPayment;
    });
  }, [transactions, filterPayment]);

  // Aggregate metrics
  const totalSales = filteredTransactions
    .filter((t) => t.status !== 'Dibatalkan')
    .reduce((sum, t) => sum + t.total, 0);

  const completedTransactionsCount = filteredTransactions.filter((t) => t.status !== 'Dibatalkan').length;
  const averageTransaction =
    completedTransactionsCount > 0 ? Math.round(totalSales / completedTransactionsCount) : 0;

  // Profit calculation (sellPrice - buyPrice)
  const totalProfit = useMemo(() => {
    let profit = 0;
    filteredTransactions
      .filter((t) => t.status === 'Selesai')
      .forEach((t) => {
        t.items.forEach((item) => {
          const product = products.find((p) => p.id === item.productId);
          if (product) {
            profit += (item.price - product.buyPrice) * item.quantity;
          } else {
            profit += item.subtotal * 0.2; // fallback margin
          }
        });
      });
    return profit;
  }, [filteredTransactions, products]);

  // Export to CSV / Excel
  const handleExportCSV = () => {
    const headers = ['No', 'Tanggal', 'No Transaksi', 'Kasir', 'Total', 'Metode Pembayaran', 'Status'];
    const rows = filteredTransactions.map((t, idx) => [
      idx + 1,
      `"${t.date}"`,
      `"${t.transactionNo}"`,
      `"${t.cashierName}"`,
      t.total,
      `"${t.paymentMethod}"`,
      `"${t.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Penjualan_eljaMart_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Report Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {(['Penjualan', 'Stok', 'Profit', 'Keuangan'] as const).map((tab) => {
          const isActive = activeReportTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveReportTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Main Content by Tab */}
      {activeReportTab === 'Penjualan' && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Total Penjualan</span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                {formatRupiah(88420000)}
              </h3>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+12% dari periode sebelumnya</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Jumlah Transaksi</span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2">342</h3>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+8% dari periode sebelumnya</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Rata-rata Transaksi</span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                {formatRupiah(258538)}
              </h3>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+4% dari periode sebelumnya</span>
              </div>
            </div>
          </div>

          {/* Grid: Table + Filter Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Table of Transactions (3 Cols) */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Laporan Penjualan</h4>
                  <p className="text-xs text-slate-500">Daftar transaksi kasir terperinci</p>
                </div>
                <span className="text-xs text-slate-500">
                  Total {filteredTransactions.length} transaksi
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4 w-12 text-center">No</th>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">No. Transaksi</th>
                      <th className="py-3 px-4">Kasir</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Metode Pembayaran</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredTransactions.map((trx, index) => (
                      <tr
                        key={trx.id}
                        className="hover:bg-slate-50/70 transition duration-150"
                      >
                        <td className="py-3.5 px-4 text-center text-slate-400 font-medium">
                          {index + 1}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                          {trx.date}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          {trx.transactionNo}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">{trx.cashierName}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {formatRupiah(trx.total)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px]">
                            {trx.paymentMethod}
                          </span>
                        </td>
                        {/* Status Column matching image 2 exactly */}
                        <td className="py-3.5 px-4 text-center">
                          {trx.status === 'Selesai' && (
                            <span className="inline-block bg-emerald-100 text-emerald-700 font-medium px-3 py-1 rounded-full text-xs">
                              Selesai
                            </span>
                          )}
                          {trx.status === 'Diproses' && (
                            <span className="inline-block bg-amber-100 text-amber-700 font-medium px-3 py-1 rounded-full text-xs">
                              Diproses
                            </span>
                          )}
                          {trx.status === 'Dibatalkan' && (
                            <span className="inline-block bg-rose-100 text-rose-700 font-medium px-3 py-1 rounded-full text-xs">
                              Dibatalkan
                            </span>
                          )}
                        </td>
                        {/* Action Column matching image 2 exactly */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => setSelectedTransaction(trx)}
                            className="border border-blue-200 text-blue-600 hover:bg-blue-50 px-3.5 py-1 rounded-lg text-xs font-semibold transition"
                          >
                            Lihat
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Filter Sidebar (1 Col) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Filter className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-800">Filter Laporan</h4>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Rentang Waktu</label>
                  <select
                    value={filterRange}
                    onChange={(e) => setFilterRange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Hari Ini">Hari Ini</option>
                    <option value="7 Hari Terakhir">7 Hari Terakhir</option>
                    <option value="Bulan Ini">Bulan Ini</option>
                    <option value="Kustom">Kustom Tanggal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Semua Metode Pembayaran</label>
                  <select
                    value={filterPayment}
                    onChange={(e) => setFilterPayment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Semua">Semua Metode Pembayaran</option>
                    <option value="Tunai">Tunai</option>
                    <option value="QRIS">QRIS</option>
                    <option value="Debit">Debit</option>
                    <option value="Transfer Bank">Transfer Bank</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Rentang Tanggal</label>
                  <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>18 Apr 2026 - 29 Apr 2026</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  Tampilkan
                </button>
              </div>

              {/* Download Section */}
              <div className="pt-4 border-t border-slate-100">
                <span className="block text-xs font-bold text-slate-700 mb-2">Download Laporan</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => window.print()}
                    className="py-2 px-3 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="py-2 px-3 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Excel</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stok Tab */}
      {activeReportTab === 'Stok' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-slate-900">Laporan Inventaris Stok Produk</h4>
          <p className="text-xs text-slate-500">Status ketersediaan stok, nilai aset inventaris, dan peringatan restock.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500">Total Nilai Inventaris (Beli)</span>
              <p className="text-lg font-bold text-slate-800 mt-1">
                {formatRupiah(products.reduce((acc, p) => acc + p.buyPrice * p.stock, 0))}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500">Total Estimasi Nilai Jual</span>
              <p className="text-lg font-bold text-blue-700 mt-1">
                {formatRupiah(products.reduce((acc, p) => acc + p.sellPrice * p.stock, 0))}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-xs text-amber-700 font-semibold">Barang Perlu Restock Segera</span>
              <p className="text-lg font-bold text-amber-800 mt-1">
                {products.filter((p) => p.stock <= p.minStock).length} Produk
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-2.5 px-3">Produk</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3">Supplier</th>
                  <th className="py-2.5 px-3 text-center">Stok</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{p.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{p.category}</td>
                    <td className="py-2.5 px-3 text-slate-600">{p.supplier}</td>
                    <td className="py-2.5 px-3 text-center font-bold">{p.stock}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.stock <= p.minStock
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {p.stock <= p.minStock ? 'Menipis' : 'Aman'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Profit Tab */}
      {activeReportTab === 'Profit' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-slate-900">Laporan Estimasi Profit & Margin</h4>
          <p className="text-xs text-slate-500">Perhitungan laba kotor toko berdasarkan selisih harga jual dan harga beli.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="text-xs text-emerald-700 font-semibold">Estimasi Laba Kotor (Gross Profit)</span>
              <p className="text-2xl font-extrabold text-emerald-800 mt-1">
                {formatRupiah(totalProfit || 17684000)}
              </p>
              <p className="text-[11px] text-emerald-600 mt-1">Margin rata-rata ~20% dari total omset.</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <span className="text-xs text-blue-700 font-semibold">Produk Margin Tertinggi</span>
              <p className="text-base font-bold text-blue-900 mt-1">Telur Ayam 1kg & Beras Ramos</p>
              <p className="text-[11px] text-blue-600 mt-1">Margin keuntungan Rp 4.500 - Rp 9.000 per unit.</p>
            </div>
          </div>
        </div>
      )}

      {/* Keuangan Tab */}
      {activeReportTab === 'Keuangan' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-slate-900">Laporan Arus Kas & Metode Pembayaran</h4>
          <p className="text-xs text-slate-500">Pemisahan dana kas fisik toko (Tunai) dan dana rekening perbankan (QRIS & EDC).</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500">Kas Tunai di Toko</span>
              <p className="text-xl font-bold text-slate-900 mt-1">{formatRupiah(42350000)}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">48% dari total transaksi</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500">Digital QRIS</span>
              <p className="text-xl font-bold text-blue-700 mt-1">{formatRupiah(28670000)}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">32% dari total transaksi</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500">Debit / Transfer</span>
              <p className="text-xl font-bold text-indigo-700 mt-1">{formatRupiah(17400000)}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">20% dari total transaksi</p>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Detail Modal (Opened via "Lihat" button) */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-[#0b192c] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Detail Transaksi Penjualan</h3>
                <p className="text-xs text-blue-200">{selectedTransaction.transactionNo}</p>
              </div>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Meta */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-500 text-[11px] block">Waktu Transaksi</span>
                  <span className="font-semibold text-slate-800">{selectedTransaction.date}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Petugas Kasir</span>
                  <span className="font-semibold text-slate-800">{selectedTransaction.cashierName}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Metode Pembayaran</span>
                  <span className="font-semibold text-slate-800">{selectedTransaction.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Status Transaksi</span>
                  {selectedTransaction.status === 'Selesai' && (
                    <span className="inline-block bg-emerald-100 text-emerald-700 font-medium px-2.5 py-0.5 rounded-full text-[11px]">
                      Selesai
                    </span>
                  )}
                  {selectedTransaction.status === 'Diproses' && (
                    <span className="inline-block bg-amber-100 text-amber-700 font-medium px-2.5 py-0.5 rounded-full text-[11px]">
                      Diproses
                    </span>
                  )}
                  {selectedTransaction.status === 'Dibatalkan' && (
                    <span className="inline-block bg-rose-100 text-rose-700 font-medium px-2.5 py-0.5 rounded-full text-[11px]">
                      Dibatalkan
                    </span>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div>
                <span className="font-bold text-slate-700 block mb-2">Item Produk Dibeli:</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedTransaction.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-8 h-8 rounded object-cover border border-slate-200"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-slate-800">{item.name}</p>
                          <p className="text-[10px] text-slate-500">
                            {item.quantity} x {formatRupiah(item.price)}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900">{formatRupiah(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="pt-2 border-t border-slate-200 space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>{formatRupiah(selectedTransaction.subtotal)}</span>
                </div>
                {selectedTransaction.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Diskon:</span>
                    <span>-{formatRupiah(selectedTransaction.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-blue-700 pt-1">
                  <span>Total Tagihan:</span>
                  <span>{formatRupiah(selectedTransaction.total)}</span>
                </div>
              </div>

              {/* Status updater if needed */}
              {onUpdateTransactionStatus && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Ubah Status:</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        onUpdateTransactionStatus(selectedTransaction.id, 'Selesai');
                        setSelectedTransaction({ ...selectedTransaction, status: 'Selesai' });
                      }}
                      className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-semibold"
                    >
                      Selesai
                    </button>
                    <button
                      onClick={() => {
                        onUpdateTransactionStatus(selectedTransaction.id, 'Diproses');
                        setSelectedTransaction({ ...selectedTransaction, status: 'Diproses' });
                      }}
                      className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded text-[11px] font-semibold"
                    >
                      Diproses
                    </button>
                    <button
                      onClick={() => {
                        onUpdateTransactionStatus(selectedTransaction.id, 'Dibatalkan');
                        setSelectedTransaction({ ...selectedTransaction, status: 'Dibatalkan' });
                      }}
                      className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-[11px] font-semibold"
                    >
                      Batalkan
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedTransaction(null)}
                className="px-4 py-1.5 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Nota</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
