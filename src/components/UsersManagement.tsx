import React, { useState } from 'react';
import { Users, Shield, Plus, Key, Check, Eye, EyeOff, Trash2 } from 'lucide-react';
import { UserAccount, UserRole } from '../types/pos';

interface UsersManagementProps {
  users: UserAccount[];
  onAddUser: (user: UserAccount) => void;
  onUpdateUserPassword: (userId: string, newPass: string) => void;
}

export const UsersManagement: React.FC<UsersManagementProps> = ({
  users,
  onAddUser,
  onUpdateUserPassword,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    password: '',
    role: 'kasir' as UserRole,
    roleLabel: 'Kasir',
    email: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  });

  const toggleShowPassword = (id: string) => {
    setShowPasswordMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) return;

    const roleLabelMap: Record<UserRole, string> = {
      admin: 'Super Admin',
      kasir: 'Kasir Toko',
      gudang: 'Staff Gudang',
    };

    onAddUser({
      id: `usr-${Date.now()}`,
      ...newUser,
      roleLabel: roleLabelMap[newUser.role],
      lastLogin: 'Baru ditambahkan',
    });

    setShowAddModal(false);
    setNewUser({
      name: '',
      username: '',
      password: '',
      role: 'kasir',
      roleLabel: 'Kasir',
      email: '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    });
  };

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Manajemen Hak Akses & Pengguna</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola kata sandi, username, dan otoritas role Admin, Kasir, dan Gudang
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengguna Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {users.map((u) => {
          const isPassVisible = !!showPasswordMap[u.id];
          return (
            <div
              key={u.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      u.role === 'admin'
                        ? 'bg-blue-100 text-blue-700'
                        : u.role === 'kasir'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {u.roleLabel}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {u.username}</span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-2xs"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{u.name}</h4>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                </div>

                {/* Password field */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-medium text-[11px]">Kata Sandi Login:</span>
                    <button
                      type="button"
                      onClick={() => toggleShowPassword(u.id)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="font-mono font-bold text-slate-800 text-sm">
                    {isPassVisible ? u.password : '••••••••'}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Login: {u.lastLogin || 'Aktif'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Tambah Akun Pengguna</h3>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rian Hidayat"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Username Login</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: kasir2"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value.toLowerCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Kata Sandi (Password)</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan kata sandi..."
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Hak Akses (Role)</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="kasir">Kasir (Transaksi & POS)</option>
                  <option value="gudang">Gudang (Stok & Barang)</option>
                  <option value="admin">Admin (Semua Akses & Laporan)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
