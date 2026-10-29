import React, { useState, useEffect } from 'react';
import {
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
  INITIAL_TRANSACTIONS,
  INITIAL_USERS,
} from './data/initial-data';
import { Product, StoreSettings, Transaction, UserAccount, UserRole } from './types/pos';
import { ActiveNavTab, Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginModal } from './components/LoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { PosCashier } from './components/PosCashier';
import { WarehouseStock } from './components/WarehouseStock';
import { ReportsView } from './components/ReportsView';
import { UsersManagement } from './components/UsersManagement';
import { SettingsView } from './components/SettingsView';

export default function App() {
  // Persistent or initial state
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('eljamart_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('eljamart_current_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[0]; // Admin by default for seamless start
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('eljamart_products');
    if (!saved) return INITIAL_PRODUCTS;
    try {
      const parsed: Product[] = JSON.parse(saved);
      // Ensure image URLs are valid
      return parsed.map((p) => {
        if (p.id === 'prod-02') {
          return { ...p, image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=400&q=80' };
        }
        if (p.id === 'prod-11') {
          return { ...p, image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=400&q=80' };
        }
        return p;
      });
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('eljamart_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('eljamart_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('eljamart_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('eljamart_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('eljamart_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('eljamart_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('eljamart_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('eljamart_settings', JSON.stringify(settings));
  }, [settings]);

  // Adjust active tab when user role changes
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setIsLoginModalOpen(false);
    setIsSwitchingRole(false);

    // Route default view according to role
    if (user.role === 'kasir') {
      setActiveTab('kasir');
    } else if (user.role === 'gudang') {
      setActiveTab('stok');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoginModalOpen(true);
    setIsSwitchingRole(false);
  };

  const handleOpenSwitchRole = () => {
    setIsSwitchingRole(true);
    setIsLoginModalOpen(true);
  };

  // Product mutations
  const handleAddProduct = (newProdData: Omit<Product, 'id' | 'soldCount'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: `prod-${Date.now()}`,
      soldCount: 0,
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleRestock = (productId: string, amount: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: p.stock + amount } : p))
    );
  };

  // Complete POS sale
  const handleCompleteSale = (newTx: Transaction) => {
    // 1. Add to transactions list
    setTransactions((prev) => [newTx, ...prev]);

    // 2. Reduce stock for bought items & increment soldCount
    setProducts((prev) =>
      prev.map((prod) => {
        const soldItem = newTx.items.find((item) => item.productId === prod.id);
        if (soldItem) {
          const nextStock = Math.max(0, prod.stock - soldItem.quantity);
          const nextSoldCount = prod.soldCount + soldItem.quantity;
          return {
            ...prod,
            stock: nextStock,
            soldCount: nextSoldCount,
          };
        }
        return prod;
      })
    );
  };

  // Update transaction status
  const handleUpdateTransactionStatus = (
    txId: string,
    newStatus: 'Selesai' | 'Diproses' | 'Dibatalkan'
  ) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: newStatus } : t))
    );
  };

  // Add User
  const handleAddUser = (user: UserAccount) => {
    setUsers((prev) => [...prev, user]);
  };

  const handleUpdateUserPassword = (userId: string, newPass: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, password: newPass } : u))
    );
  };

  // If no user is logged in, show login modal as blocking view
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoginModal
          users={users}
          onLoginSuccess={handleLoginSuccess}
          currentUser={null}
          isSwitchingRole={false}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-hidden">
      {/* Dark Navy Sidebar */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSwitchRole={handleOpenSwitchRole}
        onLogout={handleLogout}
      />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          currentUser={currentUser}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenSwitchRole={handleOpenSwitchRole}
          onLogout={handleLogout}
          placeholder={
            activeTab === 'kasir'
              ? 'Scan barcode atau cari produk kasir...'
              : activeTab === 'stok'
              ? 'Cari data inventaris produk...'
              : 'Cari produk, transaksi, atau menu...'
          }
        />

        {/* View Content Body */}
        <main className="flex-1 p-5 lg:p-6 overflow-y-auto">
          {/* Admin Dashboard */}
          {activeTab === 'dashboard' && (
            <AdminDashboard
              products={products}
              transactions={transactions}
              onNavigateTab={setActiveTab}
              onOpenAddProductModal={() => setActiveTab('stok')}
            />
          )}

          {/* POS Cashier Module */}
          {activeTab === 'kasir' && (
            <PosCashier
              products={products}
              currentUser={currentUser}
              settings={settings}
              onCompleteSale={handleCompleteSale}
              onOpenAddProductModal={
                currentUser.role === 'admin' ? () => setActiveTab('stok') : undefined
              }
            />
          )}

          {/* Warehouse Stock Module */}
          {(activeTab === 'stok' ||
            activeTab === 'produk' ||
            activeTab === 'barang-masuk' ||
            activeTab === 'barang-keluar' ||
            activeTab === 'penyesuaian') && (
            <WarehouseStock
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onRestock={handleRestock}
            />
          )}

          {/* Reports Module */}
          {(activeTab === 'laporan' || activeTab === 'riwayat') && (
            <ReportsView
              transactions={transactions}
              products={products}
              settings={settings}
              onUpdateTransactionStatus={
                currentUser.role === 'admin' ? handleUpdateTransactionStatus : undefined
              }
            />
          )}

          {/* Users Management */}
          {activeTab === 'pengguna' && (
            <UsersManagement
              users={users}
              onAddUser={handleAddUser}
              onUpdateUserPassword={handleUpdateUserPassword}
            />
          )}

          {/* Store Settings */}
          {activeTab === 'pengaturan' && (
            <SettingsView settings={settings} onSaveSettings={setSettings} />
          )}
        </main>
      </div>

      {/* Password verification & Switch Role Modal */}
      {isLoginModalOpen && (
        <LoginModal
          users={users}
          onLoginSuccess={handleLoginSuccess}
          currentUser={currentUser}
          onClose={() => setIsLoginModalOpen(false)}
          isSwitchingRole={isSwitchingRole}
        />
      )}
    </div>
  );
}
