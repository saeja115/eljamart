import React, { useState, useEffect } from 'react';
import { Search, Calendar, Bell, Shield, ChevronDown, Lock, LogOut, CheckCircle2 } from 'lucide-react';
import { UserAccount } from '../types/pos';

interface HeaderProps {
  currentUser: UserAccount;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenSwitchRole: () => void;
  onLogout: () => void;
  placeholder?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  searchQuery,
  onSearchChange,
  onOpenSwitchRole,
  onLogout,
  placeholder = 'Cari produk, transaksi, atau menu...',
}) => {
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      // ID formatting
      const formatted = now.toLocaleDateString('id-ID', options);
      setCurrentDateStr(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-xs">
      {/* Search Bar */}
      <div className="flex-1 max-w-md relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Indonesian Date Time */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-medium">{currentDateStr || 'Selasa, 29 April 2026 10:24'}</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotification(!showNotification)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition relative"
            title="Pemberitahuan"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
          </button>

          {showNotification && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-30 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">Notifikasi Sistem</span>
                <span className="text-[10px] text-blue-600 font-semibold">Tandai Dibaca</span>
              </div>
              <div className="mt-2 space-y-2 text-xs">
                <div className="p-2 bg-amber-50 border border-amber-100 rounded-lg text-amber-800">
                  <p className="font-semibold text-[11px]">Peringatan Stok Menipis</p>
                  <p className="text-[10px] text-amber-700">Telur Ayam 1kg tersisa 20 pack (di bawah batas minimal 25).</p>
                </div>
                <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg text-blue-800">
                  <p className="font-semibold text-[11px]">Sistem Kasir Siap</p>
                  <p className="text-[10px] text-blue-700">Shift kasir Siti Nurhaliza aktif hari ini.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 capitalize">{currentUser.roleLabel}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in duration-150">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 font-semibold text-[10px] rounded-full border border-blue-100">
                  {currentUser.roleLabel}
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenSwitchRole();
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Ganti Akun / Sandi Role</span>
                </button>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Keluar Sistem</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
