import React from 'react';
import {
  ShoppingCart,
  LayoutDashboard,
  Package,
  Boxes,
  FileText,
  Users,
  Settings,
  Receipt,
  ArrowDownToLine,
  ArrowUpFromLine,
  Sliders,
  LogOut,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { UserAccount } from '../types/pos';

export type ActiveNavTab = 
  | 'dashboard'
  | 'kasir'
  | 'riwayat'
  | 'produk'
  | 'stok'
  | 'barang-masuk'
  | 'barang-keluar'
  | 'penyesuaian'
  | 'laporan'
  | 'pengguna'
  | 'pengaturan';

interface SidebarProps {
  currentUser: UserAccount;
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  onOpenSwitchRole: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  onOpenSwitchRole,
  onLogout,
}) => {
  // Navigation items customized by Role
  const getNavItems = () => {
    if (currentUser.role === 'admin') {
      return [
        { id: 'dashboard' as ActiveNavTab, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'produk' as ActiveNavTab, label: 'Produk', icon: Package },
        { id: 'stok' as ActiveNavTab, label: 'Stok', icon: Boxes },
        { id: 'kasir' as ActiveNavTab, label: 'Transaksi POS', icon: ShoppingCart },
        { id: 'laporan' as ActiveNavTab, label: 'Laporan', icon: FileText },
        { id: 'pengguna' as ActiveNavTab, label: 'Pengguna', icon: Users },
        { id: 'pengaturan' as ActiveNavTab, label: 'Pengaturan', icon: Settings },
      ];
    } else if (currentUser.role === 'kasir') {
      return [
        { id: 'kasir' as ActiveNavTab, label: 'Kasir', icon: ShoppingCart },
        { id: 'riwayat' as ActiveNavTab, label: 'Riwayat Transaksi', icon: Receipt },
        { id: 'produk' as ActiveNavTab, label: 'Produk', icon: Package },
        { id: 'stok' as ActiveNavTab, label: 'Stok', icon: Boxes },
        { id: 'laporan' as ActiveNavTab, label: 'Laporan', icon: FileText },
      ];
    } else {
      // gudang
      return [
        { id: 'dashboard' as ActiveNavTab, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'produk' as ActiveNavTab, label: 'Produk', icon: Package },
        { id: 'stok' as ActiveNavTab, label: 'Stok', icon: Boxes },
        { id: 'barang-masuk' as ActiveNavTab, label: 'Barang Masuk', icon: ArrowDownToLine },
        { id: 'barang-keluar' as ActiveNavTab, label: 'Barang Keluar', icon: ArrowUpFromLine },
        { id: 'penyesuaian' as ActiveNavTab, label: 'Penyesuaian Stok', icon: Sliders },
        { id: 'laporan' as ActiveNavTab, label: 'Laporan', icon: FileText },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-[#0b192c] text-white flex flex-col shrink-0 select-none border-r border-slate-800/80 transition-all duration-200">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-amber-300 shadow-md shrink-0">
          <ShoppingCart className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div className="overflow-hidden">
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-bold tracking-tight text-white leading-tight">eljaMart</h1>
          </div>
          <p className="text-[11px] text-slate-400 truncate font-normal">Belanja Mudah, Hidup Lebih Indah</p>
        </div>
      </div>

      {/* Role Pill Indicator */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
          <span className="flex items-center gap-1.5 font-medium">
            <span
              className={`w-2 h-2 rounded-full ${
                currentUser.role === 'admin'
                  ? 'bg-blue-400'
                  : currentUser.role === 'kasir'
                  ? 'bg-emerald-400'
                  : 'bg-indigo-400'
              }`}
            />
            {currentUser.roleLabel}
          </span>
          <button
            onClick={onOpenSwitchRole}
            className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
            title="Ganti akun / sandi"
          >
            <KeyRound className="w-3 h-3" />
            <span>Ganti</span>
          </button>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom User Profile Section */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 transition group">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
            />
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate leading-tight">
                {currentUser.name}
              </p>
              <p className="text-[11px] text-slate-400 truncate">{currentUser.roleLabel}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Keluar / Kunci Layar"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
