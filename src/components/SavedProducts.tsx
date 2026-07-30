import React, { useState, useMemo } from 'react';
import { SavedProduct } from '../types';
import { formatCurrency, formatPercent } from '../utils/calculator';
import {
  BookmarkCheck,
  Trash2,
  Download,
  Printer,
  Search,
  PlusCircle,
  Package,
  TrendingUp,
  DollarSign,
  Info
} from 'lucide-react';

interface SavedProductsProps {
  products: SavedProduct[];
  onDeleteProduct: (id: string) => void;
  onClearAll: () => void;
  onNavigateToCalculator: () => void;
  onUpdateVolume: (id: string, volume: number) => void;
}

export const SavedProducts: React.FC<SavedProductsProps> = ({
  products,
  onDeleteProduct,
  onClearAll,
  onNavigateToCalculator,
  onUpdateVolume,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.platformName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // Total Portfolio Metrics
  const summary = useMemo(() => {
    let totalMonthlyRevenue = 0;
    let totalMonthlyProfit = 0;
    let totalHppCost = 0;

    products.forEach((p) => {
      const vol = p.monthlySalesVolumeEstimate || 1;
      totalMonthlyRevenue += p.sellingPrice * vol;
      totalMonthlyProfit += p.netProfit * vol;
      totalHppCost += p.hpp * vol;
    });

    const averageNetMargin =
      totalMonthlyRevenue > 0 ? (totalMonthlyProfit / totalMonthlyRevenue) * 100 : 0;

    return {
      totalProducts: products.length,
      totalMonthlyRevenue,
      totalMonthlyProfit,
      averageNetMargin,
    };
  }, [products]);

  // Export to CSV
  const handleExportCSV = () => {
    if (products.length === 0) return;

    const headers = [
      'Nama Produk',
      'Tanggal Simpan',
      'Platform',
      'Total HPP (Rp)',
      'Harga Jual (Rp)',
      'Profit Bersih (Rp)',
      'Net Margin (%)',
      'ROI (%)',
      'Est. Penjualan/Bln (Unit)',
      'Est. Profit Bulanan (Rp)',
    ];

    const rows = products.map((p) => [
      `"${p.name.replace(/"/g, '""')}"`,
      p.date,
      `"${p.platformName}"`,
      p.hpp,
      p.sellingPrice,
      p.netProfit,
      p.netMargin.toFixed(2),
      p.roi.toFixed(2),
      p.monthlySalesVolumeEstimate,
      p.netProfit * p.monthlySalesVolumeEstimate,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Profit_Produk_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <BookmarkCheck className="w-4 h-4" />
            <span>Katalog Simulasi Produk</span>
          </div>
          <h2 className="text-xl font-bold">Daftar Profitabilitas Produk Saya</h2>
          <p className="text-xs text-zinc-300 mt-1 max-w-xl">
            Kumpulan simulasi harga & margin produk yang telah Anda simpan. Ubah estimasi unit terjual per bulan untuk memproyeksikan total omset & laba usaha Anda.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {products.length > 0 && (
            <>
              <button
                onClick={handleExportCSV}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-xl transition-colors flex items-center space-x-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh CSV</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-medium rounded-xl transition-colors flex items-center space-x-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / PDF</span>
              </button>
            </>
          )}

          <button
            onClick={onNavigateToCalculator}
            className="px-3.5 py-2 bg-white text-zinc-900 hover:bg-zinc-100 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5 shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>Hitung Baru</span>
          </button>
        </div>
      </div>

      {/* Summary Portfolio Card */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Total Jenis Produk
            </span>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
              {summary.totalProducts} <span className="text-xs font-normal">item</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Proyeksi Omset Bulanan
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCurrency(summary.totalMonthlyRevenue)}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Proyeksi Net Profit Bulanan
            </span>
            <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
              {formatCurrency(summary.totalMonthlyProfit)}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Rata-rata Margin Bersih
            </span>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {formatPercent(summary.averageNetMargin)}
            </div>
          </div>
        </div>
      )}

      {/* Search & Action Bar */}
      {products.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama produk atau platform..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <button
            onClick={onClearAll}
            className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-medium flex items-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Semua Daftar</span>
          </button>
        </div>
      )}

      {/* Products Table */}
      {filteredProducts.length > 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
              <thead className="bg-zinc-50 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 uppercase font-bold text-[10px] tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Nama Produk & Platform</th>
                  <th className="py-3 px-4">HPP Modal</th>
                  <th className="py-3 px-4">Harga Jual</th>
                  <th className="py-3 px-4">Profit Bersih/Unit</th>
                  <th className="py-3 px-4">Margin %</th>
                  <th className="py-3 px-4">Est. Terjual/Bln</th>
                  <th className="py-3 px-4">Total Profit/Bln</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredProducts.map((p) => {
                  const monthlyNetProfit = p.netProfit * (p.monthlySalesVolumeEstimate || 1);

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">{p.name}</div>
                        <div className="flex items-center space-x-2 text-[11px] text-zinc-500 mt-0.5">
                          <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded">
                            {p.platformName}
                          </span>
                          <span>• {p.date}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium">{formatCurrency(p.hpp)}</td>

                      <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(p.sellingPrice)}
                      </td>

                      <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(p.netProfit)}
                      </td>

                      <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                        {formatPercent(p.netMargin)}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="number"
                            min="1"
                            value={p.monthlySalesVolumeEstimate || 1}
                            onChange={(e) => onUpdateVolume(p.id, Number(e.target.value))}
                            className="w-16 px-2 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-center font-bold text-xs"
                          />
                          <span className="text-[11px] text-zinc-500">unit</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-black text-teal-600 dark:text-teal-400">
                        {formatCurrency(monthlyNetProfit)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onDeleteProduct(p.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Hapus Produk"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Belum Ada Produk Tersimpan
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              Simpan hasil perhitungan profit dari tab "Hitung Profit" atau "Target Harga Jual" untuk membangun portofolio produk Anda.
            </p>
          </div>
          <button
            onClick={onNavigateToCalculator}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors"
          >
            Mulai Hitung Profit Sekarang
          </button>
        </div>
      )}
    </div>
  );
};
