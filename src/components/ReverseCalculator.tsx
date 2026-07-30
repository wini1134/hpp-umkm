import React, { useState, useMemo } from 'react';
import { ReverseInput, SavedProduct, HppDetailItem } from '../types';
import { PLATFORM_TIERS } from '../data/platformPresets';
import { calculateReversePrice, formatCurrency, formatPercent } from '../utils/calculator';
import { Target, Sparkles, HelpCircle, Copy, Check, ArrowRight, BookmarkPlus, Tag, ChefHat } from 'lucide-react';
import { HppDetailBuilder } from './HppDetailBuilder';

interface ReverseCalculatorProps {
  onSaveProduct: (product: SavedProduct) => void;
}

export const ReverseCalculator: React.FC<ReverseCalculatorProps> = ({ onSaveProduct }) => {
  const [input, setInput] = useState<ReverseInput>({
    productName: 'Dimsum Ayam Spesial (1 Porsi)',
    totalHpp: 3600,
    desiredMarginType: 'percent',
    targetValue: 30, // Target 30% Net Margin
    platformTierId: 'shopee-star',
    customAdminFeePercent: 6.5,
    customServiceFeePercent: 4.0,
    customPaymentFeePercent: 1.0,
    marketingFeePercent: 5.0,
    discountBufferPercent: 15, // Diskon coret 15%
  });

  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isHppBuilderOpen, setIsHppBuilderOpen] = useState(false);
  const [detailedHppItems, setDetailedHppItems] = useState<HppDetailItem[]>([]);

  const selectedTier = useMemo(() => {
    return PLATFORM_TIERS.find((t) => t.id === input.platformTierId) || PLATFORM_TIERS[0];
  }, [input.platformTierId]);

  const result = useMemo(() => {
    return calculateReversePrice(input);
  }, [input]);

  const handleCopyPrice = () => {
    navigator.clipboard.writeText(result.recommendedNetPrice.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    const newProduct: SavedProduct = {
      id: Date.now().toString(),
      name: input.productName || 'Produk Rekomendasi Harga',
      date: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      hpp: input.totalHpp,
      sellingPrice: result.recommendedNetPrice,
      platformName: selectedTier.name,
      netProfit: result.estimatedNetProfit,
      netMargin: result.achievedMarginPercent,
      roi: input.totalHpp > 0 ? (result.estimatedNetProfit / input.totalHpp) * 100 : 0,
      monthlySalesVolumeEstimate: 50,
    };

    onSaveProduct(newProduct);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-cyan-900 text-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center space-x-2 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-1">
          <Target className="w-4 h-4" />
          <span>Reverse Pricing Calculator</span>
        </div>
        <h2 className="text-xl font-bold">Kalkulator Target Harga Jual</h2>
        <p className="text-xs text-cyan-100/80 mt-1 max-w-2xl">
          Berapa harga yang harus Anda pasang di Shopee/Tokopedia agar untung bersih yang Anda impikan tidak terpotong oleh komisi admin marketplace?
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Form (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm pb-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center space-x-2">
            <Tag className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Target Profit & Modal Produk</span>
          </h3>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Nama Produk
            </label>
            <input
              type="text"
              value={input.productName}
              onChange={(e) => setInput({ ...input, productName: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Total Modal Produk / HPP per Unit (Rp)
              </label>
              <button
                type="button"
                onClick={() => setIsHppBuilderOpen(true)}
                className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center space-x-1"
              >
                <ChefHat className="w-3.5 h-3.5" />
                <span>{detailedHppItems.length > 0 ? `Resep (${detailedHppItems.length} Item)` : 'Rincikan Bahan & Kemasan'}</span>
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-zinc-500 font-medium">Rp</span>
              <input
                type="number"
                value={input.totalHpp || ''}
                onChange={(e) => setInput({ ...input, totalHpp: Number(e.target.value) })}
                className="w-full pl-9 pr-3 py-2 text-sm font-semibold bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Mode Margin selection */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Tentukan Target Keuntungan
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setInput({ ...input, desiredMarginType: 'percent' })}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                  input.desiredMarginType === 'percent'
                    ? 'bg-cyan-600 text-white border-cyan-600'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                Target Net Margin (%)
              </button>
              <button
                type="button"
                onClick={() => setInput({ ...input, desiredMarginType: 'nominal' })}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                  input.desiredMarginType === 'nominal'
                    ? 'bg-cyan-600 text-white border-cyan-600'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                Target Nominal Profit (Rp)
              </button>
            </div>

            <div className="relative">
              {input.desiredMarginType === 'nominal' && (
                <span className="absolute left-3 top-2.5 text-xs text-zinc-500 font-medium">
                  Rp
                </span>
              )}
              <input
                type="number"
                value={input.targetValue}
                onChange={(e) => setInput({ ...input, targetValue: Number(e.target.value) })}
                className={`w-full py-2 text-sm font-bold bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-zinc-900 dark:text-zinc-100 ${
                  input.desiredMarginType === 'nominal' ? 'pl-9 pr-3' : 'px-3 pr-8'
                }`}
              />
              {input.desiredMarginType === 'percent' && (
                <span className="absolute right-3 top-2.5 text-xs text-zinc-500 font-bold">
                  %
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Pilih Platform Marketplace Target
            </label>
            <select
              value={input.platformTierId}
              onChange={(e) => setInput({ ...input, platformTierId: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-zinc-900 dark:text-zinc-100 font-medium"
            >
              {PLATFORM_TIERS.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.name} (Total Fee ~
                  {tier.adminFeePercent + tier.serviceFeePercent + tier.paymentFeePercent}%)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Alokasi Iklan / Ads (%)
              </label>
              <input
                type="number"
                value={input.marketingFeePercent}
                onChange={(e) =>
                  setInput({ ...input, marketingFeePercent: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Fitur Harga Coret / Diskon Toko (%)
              </label>
              <input
                type="number"
                value={input.discountBufferPercent}
                onChange={(e) =>
                  setInput({ ...input, discountBufferPercent: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>
        </div>

        {/* Right Output Highlight (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Recommended Price Card */}
          <div className="bg-gradient-to-br from-cyan-900 to-teal-900 text-white rounded-2xl p-6 shadow-md border border-cyan-700/50 space-y-4">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
              Rekomendasi Harga Jual di Marketplace
            </span>

            <div>
              <span className="text-xs text-cyan-200">Harga Pasang Pas (Nett):</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-3xl font-black text-white">
                  {formatCurrency(result.recommendedNetPrice)}
                </span>
                <button
                  onClick={handleCopyPrice}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
                  title="Salin Angka"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {input.discountBufferPercent > 0 && (
              <div className="pt-3 border-t border-cyan-800/80">
                <span className="text-xs text-cyan-200">Harga Sebelum Diskon (Harga Coret):</span>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xl font-bold line-through text-cyan-300/80">
                    {formatCurrency(result.recommendedListingPrice)}
                  </span>
                  <span className="text-xs bg-rose-500 text-white font-bold px-2 py-0.5 rounded-md">
                    Diskon {input.discountBufferPercent}%
                  </span>
                </div>
                <p className="text-[11px] text-cyan-200/70 mt-1">
                  Pasang harga ini di katalog agar saat dikasih diskon {input.discountBufferPercent}%, harganya tepat menjadi {formatCurrency(result.recommendedNetPrice)}.
                </p>
              </div>
            )}
          </div>

          {/* Breakdown summary */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              Proyeksi Hasil Penjualan Per Unit
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Harga Jual Pembeli</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(result.recommendedNetPrice)}
                </span>
              </div>

              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Modal HPP</span>
                <span className="text-rose-600 dark:text-rose-400 font-medium">
                  - {formatCurrency(input.totalHpp)}
                </span>
              </div>

              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Potongan Admin Marketplace</span>
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  - {formatCurrency(result.estimatedMarketplaceFee)}
                </span>
              </div>

              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Potongan Budget Iklan</span>
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  - {formatCurrency(result.estimatedMarketingFee)}
                </span>
              </div>

              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between font-bold text-sm">
                <span className="text-zinc-900 dark:text-zinc-100">Target Net Profit Tercapai:</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(result.estimatedNetProfit)} ({formatPercent(result.achievedMarginPercent, 1)})
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 px-4 bg-cyan-700 hover:bg-cyan-800 text-white font-medium rounded-xl text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center space-x-2"
          >
            <BookmarkPlus className="w-4 h-4" />
            <span>Simpan Rekomendasi Ini Ke Daftar</span>
          </button>

          {savedSuccess && (
            <p className="text-xs text-center text-cyan-600 dark:text-cyan-400 font-semibold animate-pulse">
              ✓ Berhasil disimpan ke tab "Daftar Produk"!
            </p>
          )}
        </div>
      </div>

      {/* HPP Recipe / Detail Builder Modal */}
      {isHppBuilderOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto my-auto rounded-2xl">
            <HppDetailBuilder
              productName={input.productName || 'Produk Anda'}
              initialItems={detailedHppItems}
              onApplyHpp={(totalBahan, totalKemasan, items) => {
                setInput((prev) => ({
                  ...prev,
                  totalHpp: totalBahan + totalKemasan,
                }));
                setDetailedHppItems(items);
                setIsHppBuilderOpen(false);
              }}
              onClose={() => setIsHppBuilderOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
