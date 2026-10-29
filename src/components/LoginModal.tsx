import React, { useState } from 'react';
import { ShoppingCart, Lock, User, Key, ShieldCheck, Store, Warehouse, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { UserAccount, UserRole } from '../types/pos';
import { authenticateUser } from '../utils/pos-logic';

interface LoginModalProps {
  users: UserAccount[];
  onLoginSuccess: (user: UserAccount) => void;
  currentUser?: UserAccount | null;
  onClose?: () => void;
  isSwitchingRole?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  users,
  onLoginSuccess,
  currentUser,
  onClose,
  isSwitchingRole = false,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedRolePreset, setSelectedRolePreset] = useState<UserRole>('admin');

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const result = authenticateUser(username, password, users);
    if (result.success && result.user) {
      onLoginSuccess(result.user);
    } else {
      setErrorMessage(result.error || 'Autentikasi gagal.');
    }
  };

  const handleSelectRolePreset = (role: UserRole) => {
    setSelectedRolePreset(role);
    setErrorMessage('');
    const targetUser = users.find((u) => u.role === role);
    if (targetUser) {
      setUsername(targetUser.username);
      setPassword(targetUser.password);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all my-8">
        {/* Header with Dark Navy Theme */}
        <div className="bg-[#0b192c] text-white p-6 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-amber-300 shadow-md">
              <ShoppingCart className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">eljaMart</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/20">
                  POS v2.4
                </span>
              </div>
              <p className="text-xs text-blue-200/80 font-normal">Belanja Mudah, Hidup Lebih Indah</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">
              {isSwitchingRole ? 'Ganti Akun / Hak Akses' : 'Autentikasi Pengguna & Kata Sandi'}
            </span>
            {currentUser && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Batal
              </button>
            )}
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {/* Quick Role Selection Presets */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Pilih Role Pengguna (Demo Cepat):
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectRolePreset('admin')}
                className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition-all ${
                  selectedRolePreset === 'admin'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-700 shadow-sm ring-1 ring-blue-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <ShieldCheck className="w-5 h-5 mb-1 text-blue-600" />
                <span className="text-xs font-bold">Admin</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Semua Akses</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRolePreset('kasir')}
                className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition-all ${
                  selectedRolePreset === 'kasir'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-700 shadow-sm ring-1 ring-blue-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <Store className="w-5 h-5 mb-1 text-emerald-600" />
                <span className="text-xs font-bold">Kasir</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Transaksi POS</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRolePreset('gudang')}
                className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition-all ${
                  selectedRolePreset === 'gudang'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-700 shadow-sm ring-1 ring-blue-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <Warehouse className="w-5 h-5 mb-1 text-indigo-600" />
                <span className="text-xs font-bold">Gudang</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Stok Produk</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nama Pengguna (Username)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username (cth: admin, kasir, gudang)"
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  required
                  className="w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Credential Helper Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-600">
              <span className="font-semibold text-slate-700 block mb-1">Kredensial Bawaan Sistem:</span>
              <div className="grid grid-cols-3 gap-1 font-mono text-[10px]">
                <div className="bg-white p-1 rounded border border-slate-100">
                  <span className="font-bold text-blue-600">admin</span>
                  <br />admin123
                </div>
                <div className="bg-white p-1 rounded border border-slate-100">
                  <span className="font-bold text-emerald-600">kasir</span>
                  <br />kasir123
                </div>
                <div className="bg-white p-1 rounded border border-slate-100">
                  <span className="font-bold text-indigo-600">gudang</span>
                  <br />gudang123
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm rounded-lg shadow-sm hover:shadow transition flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Masuk ke Sistem</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
