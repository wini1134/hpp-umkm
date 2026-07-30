import React, { useState, useMemo } from 'react';
import { PLATFORM_TIERS } from '../data/platformPresets';
import { calculateProfit, formatCurrency, formatPercent } from '../utils/calculator';
import { Scale, CheckCircle, Trophy, ShoppingCart, Info, Store } from 'lucide-react';

export const PlatformComparison: React.FC = () => {
  const [productName, setProductName] = useState('Dimsum Ayam (1 Porsi)');
  const [hppCost, setHppCost] = useState(2800);
  const [packagingCost, setPackagingCost] = useState(800);
  const [baseSellingPrice, setBaseSellingPrice] = useState(12000);
  const [discountPercent, setDiscountPercent] = useState(0); // diskon toko
  const [marketingPercent, setMarketingPercent] = useState(0);

  // Platforms to compare
  const platformIdsToCompare = [
    'shopee-star',
    'tokopedia-pm-pro',
    'tiktok-standard',
    'offline-direct',
  ];

  const comparisonResults = useMemo(() => {
    return platformIdsToCompare.map((tierId) => {
      const tier = PLATFORM_TIERS.find((t) => t.id === tierId) || PLATFORM_TIERS[0];
      const result = calculateProfit({
        productName,
        hppCost,
        packagingCost,
        shippingCostAllocation: 0,
        operationalCostPerUnit: 2000,
        sellingPrice: baseSellingPrice,
        discountPercent,
        platformTierId: tier.id,
        customAdminFeePercent: tier.adminFeePercent,
        customServiceFeePercent: tier.serviceFeePercent,
        customPaymentFeePercent: tier.paymentFeePercent,
        marketingFeePercent: marketingPercent,
        otherFeeRp: 0,
      });

      return {
        tier,
        result,
      };
    });
  }, [productName, hppCost, packagingCost, baseSellingPrice, discountPercent, marketingPercent]);

  // Find highest profit platform
  const maxProfit = Math.max(...comparisonResults.map((c) => c.result.netProfitRp));

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-violet-900 to-purple-900 text-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center space-x-2 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-1">
          <Scale className="w-4 h-4" />
          <span>Platform Comparison Matrix</span>
        </div>
        <h2 className="text-xl font-bold">Komparasi Keuntungan Antar Marketplace</h2>
        <p className="text-xs text-purple-100/80 mt-1 max-w-2xl">
          Bandingkan hasil keuntungan bersih untuk produk yang sama jika dijual di Shopee, Tokopedia, TikTok Shop, atau Toko Fisik secara berdampingan.
        </p>
      </div>

      {/* Shared Inputs */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm pb-2 border-b border-zinc-100 dark:border-zinc-800">
          Parameter Produk Yang Dibandingkan
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Nama Produk
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Total HPP (Modal Beli + Kemasan Rp)
            </label>
            <input
              type="number"
              value={hppCost}
              onChange={(e) => setHppCost(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-semibold bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Harga Jual Standar (Rp)
            </label>
            <input
              type="number"
              value={baseSellingPrice}
              onChange={(e) => setBaseSellingPrice(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-semibold bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Diskon Toko (%)
            </label>
            <input
              type="number"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {comparisonResults.map(({ tier, result }) => {
          const isWinner = result.netProfitRp === maxProfit && result.netProfitRp > 0;

          return (
            <div
              key={tier.id}
              className={`bg-white dark:bg-zinc-900 rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                isWinner
                  ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20 dark:ring-emerald-500/10'
                  : 'border-zinc-200 dark:border-zinc-800 shadow-xs'
              }`}
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-bold ${
                      tier.badgeColor || 'bg-zinc-100 text-zinc-800'
                    }`}
                  >
                    {tier.platform.toUpperCase()}
                  </span>

                  {isWinner && (
                    <span className="flex items-center space-x-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                      <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tertinggi</span>
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                  {tier.name}
                </h4>

                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                  Total Komisi: {tier.adminFeePercent + tier.serviceFeePercent + tier.paymentFeePercent}%
                </p>

                {/* Net Profit Display */}
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                    Keuntungan Bersih (Per Unit):
                  </span>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {formatCurrency(result.netProfitRp)}
                  </div>
                  <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">
                    Margin: {formatPercent(result.netMarginPercent)}
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="mt-4 space-y-2 text-xs border-t border-zinc-100 dark:border-zinc-800 pt-3 text-zinc-600 dark:text-zinc-400">
                  <div className="flex justify-between">
                    <span>Harga Efektif:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(result.effectiveSellingPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Admin Platform:</span>
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      - {formatCurrency(result.totalMarketplaceFeeAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>ROI Modal:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatPercent(result.roiPercent)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Suggestion */}
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
                {tier.platform === 'custom' ? (
                  <span>Tanpa komisi marketplace. Untung utuh!</span>
                ) : (
                  <span>Biaya admin terpotong otomatis saat pencairan saldo seller.</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
