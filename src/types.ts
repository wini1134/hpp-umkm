export type HppItemCategory = 'bahan_pokok' | 'bahan_baku' | 'bumbu_pelengkap' | 'kemasan' | 'lainnya';

export interface HppDetailItem {
  id: string;
  name: string;
  category: HppItemCategory;
  purchasePrice: number; // Harga Beli Total/Batch (Rp)
  purchaseQty: number; // Jumlah Pembelian (misal 1000)
  unit: string; // Satuan (gram, kg, ml, pcs, sheet, roll, pack)
  usagePerUnit: number; // Pemakaian per 1 produk (misal 70 gram atau 1 pcs)
  yieldUnits?: number; // Alternatif: Berapa porsi/unit dari total pembelian ini (misal 15 porsi)
  costPerUnit: number; // Biaya HPP per 1 porsi/produk (Rp)
}

export interface HppRecipePreset {
  id: string;
  name: string;
  categoryName: string;
  items: Omit<HppDetailItem, 'id'>[];
}

export type CalculatorTab = 'profit' | 'reverse' | 'bep' | 'compare' | 'saved';

export type PlatformType = 'shopee' | 'tokopedia' | 'tiktok' | 'lazada' | 'blibli' | 'food' | 'custom';

export interface PlatformTier {
  id: string;
  platform: PlatformType;
  name: string;
  adminFeePercent: number; // % biaya admin dasar
  serviceFeePercent: number; // % biaya layanan (misal gratis ongkir xtra)
  paymentFeePercent: number; // % biaya transaksi / COD / gateway
  description: string;
  badgeColor?: string;
}

export interface ProfitInput {
  productName: string;
  hppCost: number; // Harga Pokok Penjualan (beli/produksi)
  packagingCost: number; // Biaya kemasan & stiker
  shippingCostAllocation: number; // Subsidil/Ongkir modal
  operationalCostPerUnit: number; // Biaya operasional per unit (packing, gaji)
  
  sellingPrice: number; // Harga Jual Di Marketplace
  discountPercent: number; // Diskon produk / voucher toko
  
  platformTierId: string; // Tier platform terpilih
  customAdminFeePercent: number;
  customServiceFeePercent: number;
  customPaymentFeePercent: number;
  
  marketingFeePercent: number; // Allocasi iklan / ROAS per produk
  otherFeeRp: number; // Biaya lain-lain Rp per unit
}

export interface ProfitResult {
  discountAmount: number;
  effectiveSellingPrice: number; // Harga setelah diskon toko
  
  totalHpp: number; // Total Modal (HPP + packaging + shipping + operasional)
  
  adminFeeAmount: number;
  serviceFeeAmount: number;
  paymentFeeAmount: number;
  totalMarketplaceFeeAmount: number;
  totalMarketplaceFeePercent: number; // Terhadap harga efektif
  
  marketingFeeAmount: number;
  totalOtherCost: number;
  
  totalAllCost: number; // Total HPP + Marketplace Fee + Marketing + Other
  
  netProfitRp: number;
  netMarginPercent: number; // Profit / Effective Price * 100
  grossProfitRp: number; // Effective Price - Total HPP
  grossMarginPercent: number; // Gross Profit / Effective Price * 100
  
  roiPercent: number; // Net Profit / Total HPP * 100
  markupPercent: number; // (Effective Price - Total HPP) / Total HPP * 100
  
  healthStatus: 'danger' | 'warning' | 'good' | 'excellent';
  healthLabel: string;
  healthSuggestion: string;
}

export interface ReverseInput {
  productName: string;
  totalHpp: number; // Total Modal per unit
  desiredMarginType: 'percent' | 'nominal';
  targetValue: number; // % Net Margin atau Rp Profit yang diinginkan
  platformTierId: string;
  customAdminFeePercent: number;
  customServiceFeePercent: number;
  customPaymentFeePercent: number;
  marketingFeePercent: number;
  discountBufferPercent: number; // Diskon yang ingin ditayangkan di toko (e.g. 10% diskon coret)
}

export interface ReverseResult {
  recommendedNetPrice: number; // Harga jual minimal di marketplace setelah diskon
  recommendedListingPrice: number; // Harga sebelum diskon (Harga Coret)
  estimatedMarketplaceFee: number;
  estimatedMarketingFee: number;
  estimatedNetProfit: number;
  achievedMarginPercent: number;
}

export interface BEPInput {
  monthlyFixedCosts: number; // Sewa tempat, gaji tetap, listrik, internet
  netProfitPerUnit: number; // Profit bersih per unit
  sellingPricePerUnit: number; // Harga jual rata-rata per unit
}

export interface BEPResult {
  bepUnitsMonthly: number;
  bepUnitsDaily: number;
  bepRevenueMonthly: number;
  bepRevenueDaily: number;
}

export interface SavedProduct {
  id: string;
  name: string;
  date: string;
  hpp: number;
  sellingPrice: number;
  platformName: string;
  netProfit: number;
  netMargin: number;
  roi: number;
  monthlySalesVolumeEstimate: number;
}
