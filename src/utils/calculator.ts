import { ProfitInput, ProfitResult, ReverseInput, ReverseResult, BEPInput, BEPResult } from '../types';
import { PLATFORM_TIERS } from '../data/platformPresets';

/**
 * Formats a number to Indonesian Rupiah currency string (e.g. Rp 150.000)
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return 'Rp 0';
  
  const rounded = Math.round(amount + Number.EPSILON);
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(rounded);

  // Replace IDR with Rp
  return formatted.replace('IDR', 'Rp').trim();
}

/**
 * Formats percentage
 */
export function formatPercent(value: number, decimals: number = 2): string {
  if (isNaN(value) || !isFinite(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Safely parses input string or number to clean positive float
 */
export function parseCleanNumber(val: string | number): number {
  if (typeof val === 'number') return Math.max(0, val);
  const cleaned = val.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Main Profit Calculation Logic
 */
export function calculateProfit(input: ProfitInput): ProfitResult {
  const sellingPrice = parseCleanNumber(input.sellingPrice);
  const discountPercent = parseCleanNumber(input.discountPercent);
  
  // Effective Selling Price (after seller shop discount)
  const discountAmount = sellingPrice * (discountPercent / 100);
  const effectiveSellingPrice = Math.max(0, sellingPrice - discountAmount);

  // Total HPP / Modal Dasar
  const hppCost = parseCleanNumber(input.hppCost);
  const packagingCost = parseCleanNumber(input.packagingCost);
  const shippingCostAllocation = parseCleanNumber(input.shippingCostAllocation);
  const operationalCostPerUnit = parseCleanNumber(input.operationalCostPerUnit);
  
  const totalHpp = hppCost + packagingCost + shippingCostAllocation + operationalCostPerUnit;

  // Platform Tier Fees
  let adminPercent = 0;
  let servicePercent = 0;
  let paymentPercent = 0;

  const tier = PLATFORM_TIERS.find(t => t.id === input.platformTierId);
  if (tier && tier.id !== 'custom-tier') {
    adminPercent = tier.adminFeePercent;
    servicePercent = tier.serviceFeePercent;
    paymentPercent = tier.paymentFeePercent;
  } else {
    adminPercent = parseCleanNumber(input.customAdminFeePercent);
    servicePercent = parseCleanNumber(input.customServiceFeePercent);
    paymentPercent = parseCleanNumber(input.customPaymentFeePercent);
  }

  // Marketplace Fees (calculated on Effective Selling Price)
  const adminFeeAmount = effectiveSellingPrice * (adminPercent / 100);
  const serviceFeeAmount = effectiveSellingPrice * (servicePercent / 100);
  const paymentFeeAmount = effectiveSellingPrice * (paymentPercent / 100);
  
  const totalMarketplaceFeeAmount = adminFeeAmount + serviceFeeAmount + paymentFeeAmount;
  const totalMarketplaceFeePercent = adminPercent + servicePercent + paymentPercent;

  // Marketing & Other Fees
  const marketingFeePercent = parseCleanNumber(input.marketingFeePercent);
  const marketingFeeAmount = effectiveSellingPrice * (marketingFeePercent / 100);
  const otherFeeRp = parseCleanNumber(input.otherFeeRp);
  const totalOtherCost = marketingFeeAmount + otherFeeRp;

  // Total All Costs
  const totalAllCost = totalHpp + totalMarketplaceFeeAmount + totalOtherCost;

  // Net Profit & Margins
  const netProfitRp = effectiveSellingPrice - totalAllCost;
  const netMarginPercent = effectiveSellingPrice > 0 ? (netProfitRp / effectiveSellingPrice) * 100 : 0;
  
  const grossProfitRp = effectiveSellingPrice - totalHpp;
  const grossMarginPercent = effectiveSellingPrice > 0 ? (grossProfitRp / effectiveSellingPrice) * 100 : 0;

  // ROI & Markup
  const roiPercent = totalHpp > 0 ? (netProfitRp / totalHpp) * 100 : 0;
  const markupPercent = totalHpp > 0 ? ((effectiveSellingPrice - totalHpp) / totalHpp) * 100 : 0;

  // Health Status Evaluation
  let healthStatus: 'danger' | 'warning' | 'good' | 'excellent' = 'good';
  let healthLabel = 'Cukup Sehat (Margin 15% - 25%)';
  let healthSuggestion = 'Keuntungan produk cukup stabil. Pertimbangkan optimasi biaya iklan untuk meningkatkan ROI.';

  if (netProfitRp <= 0) {
    healthStatus = 'danger';
    healthLabel = 'SANGAT BAHAYA / RUGI';
    healthSuggestion = 'Harga jual terlalu rendah atau potongan marketplace terlalu tinggi. Segera naikkan harga jual atau kurangi HPP agar tidak menanggung kerugian!';
  } else if (netMarginPercent < 10) {
    healthStatus = 'warning';
    healthLabel = 'Margin Sangat Tipis (< 10%)';
    healthSuggestion = 'Rentan rugi jika ada retur barang, garansi, atau komplain pembeli. Disarankan menaikkan harga jual minimal 5-10%.';
  } else if (netMarginPercent >= 10 && netMarginPercent < 20) {
    healthStatus = 'good';
    healthLabel = 'Margin Aman (10% - 20%)';
    healthSuggestion = 'Margin cukup baik untuk produk cepat laku (Fast-Moving Consumer Goods / FMCG).';
  } else if (netMarginPercent >= 20 && netMarginPercent < 35) {
    healthStatus = 'good';
    healthLabel = 'Margin Sehat & Ideal (20% - 35%)';
    healthSuggestion = 'Profit ideal untuk e-commerce! Memberikan ruang fleksibel untuk promosi, diskon flash sale, dan biaya ads.';
  } else {
    healthStatus = 'excellent';
    healthLabel = 'Margin Sangat Tinggi (> 35%)';
    healthSuggestion = 'Profitabilitas luar biasa! Sangat kuat untuk menopang budget iklan skala besar (ads scaling).';
  }

  return {
    discountAmount,
    effectiveSellingPrice,
    totalHpp,
    adminFeeAmount,
    serviceFeeAmount,
    paymentFeeAmount,
    totalMarketplaceFeeAmount,
    totalMarketplaceFeePercent,
    marketingFeeAmount,
    totalOtherCost,
    totalAllCost,
    netProfitRp,
    netMarginPercent,
    grossProfitRp,
    grossMarginPercent,
    roiPercent,
    markupPercent,
    healthStatus,
    healthLabel,
    healthSuggestion,
  };
}

/**
 * Reverse Pricing Calculation Logic
 * Given HPP & Desired Margin %, finds required selling price considering marketplace fees
 */
export function calculateReversePrice(input: ReverseInput): ReverseResult {
  const totalHpp = parseCleanNumber(input.totalHpp);
  
  // Platform fees total percent
  let totalFeePercent = 0;
  const tier = PLATFORM_TIERS.find(t => t.id === input.platformTierId);
  if (tier && tier.id !== 'custom-tier') {
    totalFeePercent = tier.adminFeePercent + tier.serviceFeePercent + tier.paymentFeePercent;
  } else {
    totalFeePercent = parseCleanNumber(input.customAdminFeePercent) + 
                      parseCleanNumber(input.customServiceFeePercent) + 
                      parseCleanNumber(input.customPaymentFeePercent);
  }

  const marketingFeePercent = parseCleanNumber(input.marketingFeePercent);
  const totalDeductionPercent = totalFeePercent + marketingFeePercent;

  let recommendedNetPrice = 0;

  if (input.desiredMarginType === 'percent') {
    const desiredMarginPercent = parseCleanNumber(input.targetValue); // e.g. 20%
    // Formula: NetPrice - TotalHPP - (Deduction% * NetPrice) = Margin% * NetPrice
    // NetPrice * (1 - Deduction% - Margin%) = TotalHPP
    // NetPrice = TotalHPP / (1 - Deduction%/100 - Margin%/100)
    const factor = 1 - (totalDeductionPercent / 100) - (desiredMarginPercent / 100);
    
    if (factor > 0) {
      recommendedNetPrice = totalHpp / factor;
    } else {
      // Unrealistic margin + fee > 100%
      recommendedNetPrice = totalHpp * 2;
    }
  } else {
    // Nominal profit target in Rp
    const desiredProfitRp = parseCleanNumber(input.targetValue);
    // NetPrice * (1 - Deduction%/100) = TotalHPP + DesiredProfit
    const factor = 1 - (totalDeductionPercent / 100);
    if (factor > 0) {
      recommendedNetPrice = (totalHpp + desiredProfitRp) / factor;
    } else {
      recommendedNetPrice = totalHpp + desiredProfitRp;
    }
  }

  // Calculate strike-through / discount listing price
  const discountBufferPercent = parseCleanNumber(input.discountBufferPercent);
  let recommendedListingPrice = recommendedNetPrice;
  if (discountBufferPercent > 0 && discountBufferPercent < 100) {
    recommendedListingPrice = recommendedNetPrice / (1 - discountBufferPercent / 100);
  }

  const estimatedMarketplaceFee = recommendedNetPrice * (totalFeePercent / 100);
  const estimatedMarketingFee = recommendedNetPrice * (marketingFeePercent / 100);
  const estimatedNetProfit = recommendedNetPrice - totalHpp - estimatedMarketplaceFee - estimatedMarketingFee;
  const achievedMarginPercent = recommendedNetPrice > 0 ? (estimatedNetProfit / recommendedNetPrice) * 100 : 0;

  return {
    recommendedNetPrice: Math.round(recommendedNetPrice),
    recommendedListingPrice: Math.round(recommendedListingPrice),
    estimatedMarketplaceFee: Math.round(estimatedMarketplaceFee),
    estimatedMarketingFee: Math.round(estimatedMarketingFee),
    estimatedNetProfit: Math.round(estimatedNetProfit),
    achievedMarginPercent,
  };
}

/**
 * Break Even Point Calculation Logic
 */
export function calculateBEP(input: BEPInput): BEPResult {
  const fixedCosts = parseCleanNumber(input.monthlyFixedCosts);
  const profitPerUnit = parseCleanNumber(input.netProfitPerUnit);
  const sellingPricePerUnit = parseCleanNumber(input.sellingPricePerUnit);

  let bepUnitsMonthly = 0;
  if (profitPerUnit > 0) {
    bepUnitsMonthly = Math.ceil(fixedCosts / profitPerUnit);
  }

  const bepUnitsDaily = Math.ceil(bepUnitsMonthly / 30);
  const bepRevenueMonthly = bepUnitsMonthly * sellingPricePerUnit;
  const bepRevenueDaily = bepUnitsDaily * sellingPricePerUnit;

  return {
    bepUnitsMonthly,
    bepUnitsDaily,
    bepRevenueMonthly,
    bepRevenueDaily,
  };
}
