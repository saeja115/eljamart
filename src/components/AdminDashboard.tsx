import React, { useState } from 'react';
import {
  TrendingUp,
  CreditCard,
  ShoppingBag,
  PackageCheck,
  AlertTriangle,
  ArrowUpRight,
  ShoppingCart,
  PlusCircle,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { Product, Transaction } from '../types/pos';
import { formatRupiah } from '../utils/pos-logic';

interface AdminDashboardProps {
  products: Product[];
  transactions: Transaction[];
  onNavigateTab: (tab: any) => void;
  onOpenAddProductModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  transactions,
  onNavigateTab,
  onOpenAddProductModal,
}) => {
  const [chartRange, setChartRange] = useState<'7' | '30'>('7');

  // Chart data points
  const chartPoints = [
    { day: '18 Apr', value: 2100000, label: 'Rp 2,1 Jt' },
    { day: '19 Apr', value: 2450000, label: 'Rp 2,45 Jt' },
    { day: '20 Apr', value: 3100000, label: 'Rp 3,1 Jt' },
    { day: '21 Apr', value: 2300000, label: 'Rp 2,3 Jt' },
    { day: '22 Apr', value: 2900000, label: 'Rp 2,9 Jt' },
    { day: '23 Apr', value: 3450000, label: 'Rp 3,45 Jt' },
    { day: '24 Apr', value: 3950000, label: 'Rp 3,95 Jt' },
  ];

  const maxValue = 4500000;
  const svgWidth = 600;
  const svgHeight = 200;
  const paddingX = 40;
  const paddingY = 30;

  // Generate SVG path points
  const points = chartPoints.map((pt, idx) => {
    const x = paddingX + (idx / (chartPoints.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - (pt.value / maxValue) * (svgHeight - paddingY * 2);
    return { x, y, ...pt };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  // Top selling products sorted
  const topProducts = [...products]
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 5);

  const maxSold = topProducts[0]?.soldCount || 100;

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-md p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold mb-3">
            <span>✨ eljaMart Store Management System</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Selamat Datang, Admin
          </h2>
          <p className="text-sm text-blue-100/90 leading-relaxed">
            Kelola operasional toko Anda dengan mudah dan efisien. Pantau tren pendapatan, pantau pergerakan stok, dan layani pelanggan dengan cepat.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateTab('kasir')}
              className="px-4 py-2 bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4 text-blue-600" />
              <span>Buka Kasir POS</span>
            </button>
            <button
              onClick={onOpenAddProductModal}
              className="px-4 py-2 bg-blue-700/80 hover:bg-blue-700 text-white font-medium text-xs rounded-xl border border-blue-500/40 transition flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Produk Baru</span>
            </button>
          </div>
        </div>

        {/* Banner Graphic Thumbnail */}
        <div className="relative w-full md:w-64 h-36 rounded-xl overflow-hidden border border-blue-400/30 shadow-lg shrink-0 hidden sm:block">
          <img
            src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80"
            alt="Supermarket eljaMart"
            className="w-full h-full object-cover brightness-95 transform hover:scale-105 transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-transparent to-transparent flex items-end p-3">
            <span className="text-[11px] font-bold text-white tracking-wide">Cabang Pusat #01</span>
          </div>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Penjualan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Penjualan Hari Ini</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold text-slate-900">Rp 2.845.000</h3>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+12% dari kemarin</span>
            </div>
          </div>
        </div>

        {/* Card 2: Jumlah Transaksi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Jumlah Transaksi</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold text-slate-900">48</h3>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+8% dari kemarin</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Produk */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Produk</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold text-slate-900">1.248</h3>
            <div className="mt-1 text-xs text-slate-500 flex items-center gap-1.5">
              <span className="text-emerald-600 font-semibold">Aktif: 1.236</span>
              <span>•</span>
              <span className="text-slate-400">Nonaktif: 12</span>
            </div>
          </div>
        </div>

        {/* Card 4: Stok Menipis */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Stok Menipis</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold text-slate-900">12</h3>
            <div className="mt-1 text-xs text-amber-600 font-semibold flex items-center gap-1">
              <span>Perlu perhatian inventaris</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Sales Chart (Left) + Top Selling Products (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Grafik Penjualan (7 Hari Terakhir)</h4>
              <p className="text-xs text-slate-500">Pergerakan omset kasir mingguan</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setChartRange('7')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  chartRange === '7' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7 Hari
              </button>
              <button
                onClick={() => setChartRange('30')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  chartRange === '30' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bulan Ini
              </button>
            </div>
          </div>

          {/* SVG Area Chart */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-48 select-none"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="#e2e8f0" strokeWidth="1" />
              <line x1={paddingX} y1={svgHeight / 2} x2={svgWidth - paddingX} y2={svgHeight / 2} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />

              {/* Area */}
              <path d={areaD} fill="url(#salesGrad)" />

              {/* Line */}
              <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

              {/* Data points */}
              {points.map((pt, i) => (
                <g key={i} className="group cursor-pointer">
                  <circle cx={pt.x} cy={pt.y} r="5" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
                  <circle cx={pt.x} cy={pt.y} r="8" fill="#2563eb" opacity="0" className="group-hover:opacity-20 transition" />
                  <text
                    x={pt.x}
                    y={svgHeight - 10}
                    textAnchor="middle"
                    className="text-[11px] fill-slate-500 font-sans font-medium"
                  >
                    {pt.day}
                  </text>
                  <text
                    x={pt.x}
                    y={pt.y - 10}
                    textAnchor="middle"
                    className="text-[10px] fill-blue-700 font-sans font-bold opacity-0 group-hover:opacity-100 transition"
                  >
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Penjualan Terlaris</h4>
              <p className="text-xs text-slate-500">Item paling laku minggu ini</p>
            </div>
            <button
              onClick={() => onNavigateTab('laporan')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5"
            >
              <span>Detail</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5 flex-1 overflow-y-auto">
            {topProducts.map((prod, index) => {
              const percentage = Math.round((prod.soldCount / maxSold) * 100);
              return (
                <div key={prod.id} className="flex items-center gap-3">
                  <span className="w-5 text-center text-xs font-bold text-slate-400">
                    {index + 1}
                  </span>
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-slate-800 truncate">{prod.name}</p>
                      <span className="text-xs font-bold text-slate-900 ml-2">
                        {prod.soldCount} pcs
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Rata-rata 114 pcs/item</span>
            <span className="text-emerald-600 font-semibold">+18% pertumbuhan</span>
          </div>
        </div>
      </div>
    </div>
  );
};
