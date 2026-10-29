import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  PackagePlus,
  AlertTriangle,
  CheckCircle,
  X,
  ArrowUpDown,
  Boxes,
} from 'lucide-react';
import { Product } from '../types/pos';
import { formatRupiah, getStockStatus } from '../utils/pos-logic';

interface WarehouseStockProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id' | 'soldCount'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onRestock: (productId: string, amount: number) => void;
}

export const WarehouseStock: React.FC<WarehouseStockProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onRestock,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [selectedSupplier, setSelectedSupplier] = useState('Semua Supplier');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(10);

  // Form states for new/edit product
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    category: 'Makanan',
    supplier: 'PT Indofood',
    stock: 50,
    minStock: 20,
    buyPrice: 3000,
    sellPrice: 4000,
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=400&q=80',
    status: 'Aktif' as 'Aktif' | 'Nonaktif',
  });

  // Extract unique categories and suppliers
  const categoriesList = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ['Semua Kategori', ...Array.from(set)];
  }, [products]);

  const suppliersList = useMemo(() => {
    const set = new Set(products.map((p) => p.supplier));
    return ['Semua Supplier', ...Array.from(set)];
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        selectedCategory === 'Semua Kategori' || p.category === selectedCategory;
      const matchSup =
        selectedSupplier === 'Semua Supplier' || p.supplier === selectedSupplier;
      const q = searchQuery.toLowerCase().trim();
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q) ||
        p.supplier.toLowerCase().includes(q);

      return matchCat && matchSup && matchQ;
    });
  }, [products, selectedCategory, selectedSupplier, searchQuery]);

  // Open Edit
  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      barcode: prod.barcode,
      category: prod.category,
      supplier: prod.supplier,
      stock: prod.stock,
      minStock: prod.minStock,
      buyPrice: prod.buyPrice,
      sellPrice: prod.sellPrice,
      image: prod.image,
      status: prod.status,
    });
    setIsAddModalOpen(true);
  };

  // Open Add
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      barcode: `899${Math.floor(100000000 + Math.random() * 900000000)}`,
      category: 'Makanan',
      supplier: 'PT Indofood',
      stock: 50,
      minStock: 20,
      buyPrice: 3000,
      sellPrice: 4000,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
      status: 'Aktif',
    });
    setIsAddModalOpen(true);
  };

  // Save product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        ...formData,
      });
    } else {
      onAddProduct(formData);
    }

    setIsAddModalOpen(false);
  };

  // Restock action
  const handleConfirmRestock = () => {
    if (restockProduct && restockAmount > 0) {
      onRestock(restockProduct.id, restockAmount);
      setRestockProduct(null);
      setRestockAmount(10);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Title & Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Data Stok Produk</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manajemen inventaris barang masuk, keluar, dan pemantauan level stok gudang
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-700 font-medium"
            >
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Supplier Dropdown */}
          <div>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-700 font-medium"
            >
              {suppliersList.map((sup) => (
                <option key={sup} value={sup}>
                  {sup}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="sm:col-span-1 lg:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk (nama, barcode, atau supplier)..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4 w-16 text-center">Gambar</th>
                <th className="py-3 px-4">Nama Produk</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4 text-center">Stok</th>
                <th className="py-3 px-4">Harga Beli</th>
                <th className="py-3 px-4">Harga Jual</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Boxes className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Tidak ada produk yang cocok</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod, index) => {
                  const statusInfo = getStockStatus(prod.stock, prod.minStock);
                  return (
                    <tr
                      key={prod.id}
                      className="hover:bg-slate-50/70 transition duration-150"
                    >
                      <td className="py-3 px-4 text-center text-slate-400 font-medium">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 mx-auto shadow-2xs"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 block">{prod.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {prod.barcode}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        <span className="px-2.5 py-1 bg-slate-100 rounded-md text-[11px] text-slate-700">
                          {prod.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{prod.supplier}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-extrabold text-sm ${
                            prod.stock <= prod.minStock ? 'text-amber-600' : 'text-slate-800'
                          }`}
                        >
                          {prod.stock}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {formatRupiah(prod.buyPrice)}
                      </td>
                      <td className="py-3 px-4 text-blue-700 font-bold">
                        {formatRupiah(prod.sellPrice)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold ${statusInfo.badgeClass}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setRestockProduct(prod)}
                            title="Tambah Stok / Barang Masuk"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <PackagePlus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            title="Edit Produk"
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus produk "${prod.name}"?`)) {
                                onDeleteProduct(prod.id);
                              }
                            }}
                            title="Hapus Produk"
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info & pagination */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>Menampilkan 1 - {filteredProducts.length} dari {products.length} total produk</span>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 bg-blue-600 text-white font-bold rounded-lg text-xs">
              1
            </button>
            <button className="px-3 py-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs">
              2
            </button>
            <button className="px-3 py-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs">
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0b192c] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {editingProduct ? 'Edit Data Produk' : 'Tambah Produk Baru ke Inventaris'}
                </h3>
                <p className="text-xs text-blue-200">Gudang & Manajemen Stok</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Produk *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Indomie Ayam Bawang"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Barcode / SKU</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Makanan">Makanan</option>
                    <option value="Minuman">Minuman</option>
                    <option value="Snack">Snack</option>
                    <option value="Sembako">Sembako / Pokok</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Roti & Bakery">Roti & Bakery</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Supplier</label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="Contoh: PT Indofood"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stok Awal</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Harga Beli (Rp)</label>
                  <input
                    type="number"
                    value={formData.buyPrice}
                    onChange={(e) => setFormData({ ...formData, buyPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    value={formData.sellPrice}
                    onChange={(e) => setFormData({ ...formData, sellPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-blue-700 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL Gambar Produk</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-100 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Restock Barang Masuk</h3>
              <button
                onClick={() => setRestockProduct(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-2">
              <p className="font-semibold text-slate-800">{restockProduct.name}</p>
              <p className="text-slate-500">Stok Saat Ini: <strong>{restockProduct.stock} pcs</strong></p>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Jumlah Tambahan Masuk:</label>
                <input
                  type="number"
                  min="1"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-base font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-blue-600 font-medium">
                Stok setelah restock: {restockProduct.stock + restockAmount} pcs
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRestockProduct(null)}
                className="px-3 py-1.5 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmRestock}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs"
              >
                Konfirmasi Masuk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
