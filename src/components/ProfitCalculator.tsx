import React, { useState, useMemo } from 'react';
import { SavedProduct, HppDetailItem } from '../types';
import { formatCurrency, formatPercent } from '../utils/calculator';
import { HppDetailBuilder } from './HppDetailBuilder';
import {
  ChefHat,
  Package,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  BookmarkPlus,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Layers,
  DollarSign,
  PieChart,
  BookOpen,
  Calculator,
  Utensils,
  Flame,
  Scale
} from 'lucide-react';

interface ProfitCalculatorProps {
  onSaveProduct: (product: SavedProduct) => void;
}

export const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({ onSaveProduct }) => {
  // Calculation Mode: 'batch' (Hitung per Batch Adonan / Sekali Masak) vs 'direct' (Hitung per Satuan / Porsi)
  const [calcMode, setCalcMode] = useState<'batch' | 'direct'>('batch');

  // Basic Info
  const [productName, setProductName] = useState('Dimsum Ayam Spesial');

  // --- MODE BATCH INPUTS (Sangat Mudah untuk Kuliner) ---
  const [batchYieldPcs, setBatchYieldPcs] = useState<number>(100);       // Hasil jadi 1 batch (misal 100 pcs dimsum)
  const [batchMainCost, setBatchMainCost] = useState<number>(50000);     // Total Daging / Bahan utama 1 batch (1kg Ayam + Udang)
  const [batchSeasoningCost, setBatchSeasoningCost] = useState<number>(15000); // Total Bumbu, Tepung, Tapioka, Minyak Wijen
  const [batchGasCost, setBatchGasCost] = useState<number>(5000);        // Biaya Gas LPG & Air untuk kukus 1 batch

  const [pcsPerPortion, setPcsPerPortion] = useState<number>(4);         // 1 Porsi isi berapa pcs? (misal 4 pcs)
  const [packagingPerPortion, setPackagingPerPortion] = useState<number>(800); // Mika / Thinwall + Sumpit + Plastik + Saos

  // --- MODE DIRECT INPUTS (Per Satuan/Porsi) ---
  const [directBahanPokok, setDirectBahanPokok] = useState<number>(2800); // Bahan pokok 1 porsi
  const [directBahanBaku, setDirectBahanBaku] = useState<number>(800);   // Bumbu 1 porsi
  const [directPengemasan, setDirectPengemasan] = useState<number>(800);  // Kemasan 1 porsi
  const [directOperasional, setDirectOperasional] = useState<number>(400); // Gas 1 porsi

  // Selling Price
  const [sellingPrice, setSellingPrice] = useState<number>(12000);       // Harga Jual 1 Porsi (isi 4 pcs) -> Rp 12.000 (atau Rp 3.000/pcs)
  const [discountPercent, setDiscountPercent] = useState<number>(0);     // Diskon (%)

  const [showGuide, setShowGuide] = useState(true);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState(false);
  const [isHppBuilderOpen, setIsHppBuilderOpen] = useState(false);
  const [detailedHppItems, setDetailedHppItems] = useState<HppDetailItem[]>([]);

  // Computed Values
  const batchTotalMaterialCost = useMemo(() => {
    return (
      (typeof batchMainCost === 'number' ? batchMainCost : 0) +
      (typeof batchSeasoningCost === 'number' ? batchSeasoningCost : 0) +
      (typeof batchGasCost === 'number' ? batchGasCost : 0)
    );
  }, [batchMainCost, batchSeasoningCost, batchGasCost]);

  // HPP per 1 Pcs Dimsum/Makanan dari Batch
  const hppPerPcs = useMemo(() => {
    const yieldPcs = typeof batchYieldPcs === 'number' && batchYieldPcs > 0 ? batchYieldPcs : 1;
    return batchTotalMaterialCost / yieldPcs;
  }, [batchTotalMaterialCost, batchYieldPcs]);

  // Total HPP per 1 Porsi
  const totalHpp = useMemo(() => {
    if (calcMode === 'batch') {
      const portionPcs = typeof pcsPerPortion === 'number' && pcsPerPortion > 0 ? pcsPerPortion : 1;
      const packaging = typeof packagingPerPortion === 'number' ? packagingPerPortion : 0;
      return (hppPerPcs * portionPcs) + packaging;
    } else {
      return (
        (typeof directBahanPokok === 'number' ? directBahanPokok : 0) +
        (typeof directBahanBaku === 'number' ? directBahanBaku : 0) +
        (typeof directPengemasan === 'number' ? directPengemasan : 0) +
        (typeof directOperasional === 'number' ? directOperasional : 0)
      );
    }
  }, [calcMode, hppPerPcs, pcsPerPortion, packagingPerPortion, directBahanPokok, directBahanBaku, directPengemasan, directOperasional]);

  // Effective Selling Price & Profit Calculation
  const effectiveSellingPrice = useMemo(() => {
    const price = typeof sellingPrice === 'number' ? sellingPrice : 0;
    const disc = typeof discountPercent === 'number' ? discountPercent : 0;
    return Math.round(Math.max(0, price - (price * (disc / 100))));
  }, [sellingPrice, discountPercent]);

  const netProfitRp = useMemo(() => {
    return effectiveSellingPrice - totalHpp;
  }, [effectiveSellingPrice, totalHpp]);

  const netMarginPercent = useMemo(() => {
    if (effectiveSellingPrice <= 0) return 0;
    return (netProfitRp / effectiveSellingPrice) * 100;
  }, [netProfitRp, effectiveSellingPrice]);

  const markupPercent = useMemo(() => {
    if (totalHpp <= 0) return 0;
    return (netProfitRp / totalHpp) * 100;
  }, [netProfitRp, totalHpp]);

  // Equivalent price per pcs
  const sellingPricePerPcsEquivalent = useMemo(() => {
    if (calcMode === 'batch' && pcsPerPortion > 0) {
      return effectiveSellingPrice / pcsPerPortion;
    }
    return effectiveSellingPrice;
  }, [calcMode, pcsPerPortion, effectiveSellingPrice]);

  // Preset Handlers
  const handleLoadPreset = (type: 'dimsum_porsi' | 'dimsum_satuan' | 'bakso' | 'kopi' | 'snack') => {
    if (type === 'dimsum_porsi') {
      setCalcMode('batch');
      setProductName('Dimsum Ayam (1 Porsi isi 4 Pcs)');
      setBatchYieldPcs(100);          // 1 Batch adonan = 100 pcs
      setBatchMainCost(50000);        // Daging Ayam + Udang
      setBatchSeasoningCost(15000);   // Bumbu + Tapioka + Minyak Wijen
      setBatchGasCost(5000);          // Gas kukus
      setPcsPerPortion(4);            // 1 porsi = 4 pcs
      setPackagingPerPortion(800);    // Mika + Saus + Sumpit
      setSellingPrice(12000);         // Rp 12.000 per porsi (atau Rp 3.000/pcs)
      setDiscountPercent(0);
    } else if (type === 'dimsum_satuan') {
      setCalcMode('batch');
      setProductName('Dimsum Ayam (Jual Satuan / Pcs)');
      setBatchYieldPcs(100);          // 1 Batch adonan = 100 pcs
      setBatchMainCost(50000);        // Daging Ayam
      setBatchSeasoningCost(15000);   // Bumbu
      setBatchGasCost(5000);          // Gas
      setPcsPerPortion(1);            // 1 Pcs
      setPackagingPerPortion(200);    // Plastik & Saus
      setSellingPrice(3000);          // Rp 3.000 / pcs (atau Rp 5.000/pcs)
      setDiscountPercent(0);
    } else if (type === 'bakso') {
      setCalcMode('batch');
      setProductName('Bakso Kuah Sapi (1 Porsi)');
      setBatchYieldPcs(50);           // 1 Batch adonan = 50 porsi
      setBatchMainCost(200000);       // Daging Sapi 2kg
      setBatchSeasoningCost(50000);   // Bumbu kuah & Mie
      setBatchGasCost(15000);         // Gas rebus
      setPcsPerPortion(1);            // 1 porsi
      setPackagingPerPortion(1200);   // Thinwall Bowl + Sendok
      setSellingPrice(15000);         // Rp 15.000 / porsi
      setDiscountPercent(0);
    } else if (type === 'kopi') {
      setCalcMode('direct');
      setProductName('Es Kopi Susu Gula Aren 16oz');
      setDirectBahanPokok(3200);      // Espresso shot
      setDirectBahanBaku(2300);       // Susu UHT + Gula Aren + Es
      setDirectPengemasan(1200);      // Cup + Lid + Sedotan
      setDirectOperasional(500);      // Listrik Cup Sealer
      setSellingPrice(12000);         // Rp 12.000 / cup
      setDiscountPercent(0);
    } else if (type === 'snack') {
      setCalcMode('batch');
      setProductName('Keripik Singkong Pedas 100g');
      setBatchYieldPcs(20);           // 1 Batch goreng = 20 bungkus
      setBatchMainCost(25000);        // Singkong 5kg
      setBatchSeasoningCost(20000);   // Minyak & Bumbu Tabur
      setBatchGasCost(5000);          // Gas goreng
      setPcsPerPortion(1);
      setPackagingPerPortion(1500);   // Standing Pouch + Stiker
      setSellingPrice(10000);         // Rp 10.000 / bungkus
      setDiscountPercent(0);
    }
  };

  const handleSave = () => {
    const newProduct: SavedProduct = {
      id: Date.now().toString(),
      name: productName || 'Produk Tanpa Nama',
      date: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      hpp: totalHpp,
      sellingPrice: effectiveSellingPrice,
      platformName: calcMode === 'batch' ? `Batch (${batchYieldPcs} Pcs)` : 'Per Porsi Direct',
      netProfit: netProfitRp,
      netMargin: netMarginPercent,
      roi: markupPercent,
      monthlySalesVolumeEstimate: 50,
    };

    onSaveProduct(newProduct);
    setSavedSuccessMsg(true);
    setTimeout(() => setSavedSuccessMsg(false), 3000);
  };

  // Health check for margin status
  const getMarginHealthStatus = () => {
    if (netMarginPercent < 0) {
      return {
        text: 'RUGI! (HARGA JUAL LEBIH KECIL DARI MODAL)',
        color: 'bg-red-500/10 text-red-600 border-red-500/30 dark:text-red-400',
        desc: 'Harga jual Anda terlalu murah dibanding modal HPP. Naikkan harga jual atau kurangi biaya bahan.',
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
      };
    }
    if (netMarginPercent < 15) {
      return {
        text: 'MARGIN SANGAT TIPIS (<15%)',
        color: 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400',
        desc: 'Margin terlalu berisiko jika harga bahan baku atau gas naik mendadak.',
        icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      };
    }
    if (netMarginPercent < 35) {
      return {
        text: 'MARGIN SEHAT & SEIMBANG (15% - 35%)',
        color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400',
        desc: 'Sangat ideal untuk usaha kuliner & makanan modal harian!',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      };
    }
    return {
      text: 'MARGIN SANGAT BAGUS & MENGUNTUNGKAN (>35%)',
      color: 'bg-teal-500/10 text-teal-600 border-teal-500/30 dark:text-teal-400',
      desc: 'Keuntungan tinggi! Modal cepat kembali.',
      icon: <Sparkles className="w-5 h-5 text-teal-500" />,
    };
  };

  const marginHealth = getMarginHealthStatus();

  return (
    <div className="space-y-6">

      {/* PANDUAN BACA CARA PAKAI HPP BATCH VS SATUAN */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-zinc-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-emerald-500/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-300 border border-emerald-400/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                Cara Menghitung HPP Bumbu, Gas & Bahan Tanpa Pusing
                <span className="text-[10px] bg-emerald-500 text-white font-black px-2 py-0.5 rounded-full uppercase">
                  Rahasia UMKM Kuliner
                </span>
              </h2>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Tidak perlu pusing membagi harga bumbu & tabung gas per 1 biji dimsum!
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowGuide(!showGuide)}
            className="self-start sm:self-auto px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-colors flex items-center space-x-1 border border-white/10"
          >
            <span>{showGuide ? 'Sembunyikan' : 'Buka Penjelasan'}</span>
            {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showGuide && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-200">
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-1.5">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5 text-sm">
                <Utensils className="w-4 h-4" />
                1. Hitung Per Batch (Adonan)
              </div>
              <p className="text-zinc-300 leading-relaxed text-[11px]">
                Cukup masukkan total belanja untuk <strong>1x bikin adonan</strong> (misal 1kg daging ayam + bumbu + gas LPG kukusan).
              </p>
              <p className="text-[10px] text-emerald-300 font-semibold pt-1">
                👉 Masukkan total belanja, sistem langsung membagi otomatis per biji dimsum!
              </p>
            </div>

            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-1.5">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5 text-sm">
                <Flame className="w-4 h-4" />
                2. Hitung Biaya Gas & Bumbu
              </div>
              <p className="text-zinc-300 leading-relaxed text-[11px]">
                Gas LPG 3kg seharga Rp 20.000 bisa dipake 4x masak adonan? Berarti biaya gas 1x adonan adalah <strong>Rp 5.000</strong>.
              </p>
              <p className="text-[10px] text-amber-300 font-semibold pt-1">
                👉 Tidak usah pusing hitung berapa gram gas per 1 biji dimsum.
              </p>
            </div>

            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-1.5">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5 text-sm">
                <Package className="w-4 h-4" />
                3. Tambah Kemasan per Porsi
              </div>
              <p className="text-zinc-300 leading-relaxed text-[11px]">
                Setelah ketemu modal per pcs dimsum, tentukan 1 porsi isi berapa pcs (misal 4 pcs) + wadah mika/thinwall & saos.
              </p>
              <p className="text-[10px] text-emerald-300 font-semibold pt-1">
                👉 Ketemu deh HPP 1 porsi utuh siap jual!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* QUICK PRESETS REALISTIK UMKM */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-zinc-800 dark:text-zinc-200">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Contoh Produk Kuliner UMKM:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleLoadPreset('dimsum_porsi')}
            className="px-3 py-1.5 text-xs bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-xl font-medium transition-all border border-emerald-200 dark:border-emerald-800 flex items-center gap-1"
          >
            🥟 Dimsum (1 Porsi / 4 Pcs) - Jual Rp 12rb
          </button>
          <button
            onClick={() => handleLoadPreset('dimsum_satuan')}
            className="px-3 py-1.5 text-xs bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 rounded-xl font-medium transition-all border border-teal-200 dark:border-teal-800 flex items-center gap-1"
          >
            🥟 Dimsum Satuan - Jual Rp 3rb / Pcs
          </button>
          <button
            onClick={() => handleLoadPreset('bakso')}
            className="px-3 py-1.5 text-xs bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 rounded-xl font-medium transition-all border border-amber-200 dark:border-amber-800 flex items-center gap-1"
          >
            🥣 Bakso Kuah - Jual Rp 15rb
          </button>
          <button
            onClick={() => handleLoadPreset('kopi')}
            className="px-3 py-1.5 text-xs bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-xl font-medium transition-all border border-indigo-200 dark:border-indigo-800 flex items-center gap-1"
          >
            🧋 Es Kopi Susu - Jual Rp 12rb
          </button>
          <button
            onClick={() => handleLoadPreset('snack')}
            className="px-3 py-1.5 text-xs bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 rounded-xl font-medium transition-all border border-rose-200 dark:border-rose-800 flex items-center gap-1"
          >
            🍿 Keripik Singkong - Jual Rp 10rb
          </button>
        </div>
      </div>

      {/* MODE SWITCHER TABS */}
      <div className="bg-zinc-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl flex flex-col sm:flex-row gap-2 border border-zinc-200 dark:border-zinc-700">
        <button
          onClick={() => setCalcMode('batch')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center space-x-2 ${
            calcMode === 'batch'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-md border border-emerald-500/30'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Mode 1: Hitung 1 Batch Adonan / Sekali Masak ⭐ (Paling Mudah)</span>
        </button>

        <button
          onClick={() => setCalcMode('direct')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center space-x-2 ${
            calcMode === 'direct'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-md border border-emerald-500/30'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Mode 2: Hitung Langsung Per Satuan / Porsi</span>
        </button>
      </div>

      {/* FORM & RESULT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: INPUTS */}
        <div className="lg:col-span-7 space-y-6">

          {/* SECTION A: NAMA PRODUK */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Nama Produk / Menu Makanan
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="misal: Dimsum Ayam Spesial / Bakso Sapi"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* MODE 1: BATCH CALCULATION INPUTS */}
          {calcMode === 'batch' ? (
            <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-emerald-500/30 shadow-xs space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                      1. Modal Belanja 1 Batch Adonan / Sekali Masak
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Masukkan total pengeluaran untuk 1 kali bikin adonan.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsHppBuilderOpen(true)}
                  className="px-3 py-1.5 text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-xl transition-colors border border-emerald-500/30 flex items-center space-x-1"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Rincian Resep Gramasi</span>
                </button>
              </div>

              {/* Input Hasil Pcs per Batch */}
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <label className="block text-xs font-extrabold text-emerald-900 dark:text-emerald-200">
                  A. Hasil Jadi 1 Batch Adonan (Berapa Pcs / Biji?) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    value={batchYieldPcs}
                    onChange={(e) => setBatchYieldPcs(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-zinc-900 text-emerald-950 dark:text-emerald-100 font-black text-lg focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300 whitespace-nowrap">
                    Pcs / Biji Dimsum
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  Misal: 1kg adonan daging ayam menghasilkan <strong>100 pcs dimsum</strong>.
                </p>
              </div>

              {/* Rincian Belanja 1 Batch */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Daging / Bahan Pokok */}
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    🥣 Daging / Bahan Utama
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs text-zinc-400 font-medium">Rp</span>
                    <input
                      type="number"
                      value={batchMainCost}
                      onChange={(e) => setBatchMainCost(e.target.value === '' ? 0 : Number(e.target.value))}
                      className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold text-sm"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500">1kg Daging Ayam + Udang</p>
                </div>

                {/* Bumbu & Tapioka */}
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    🧪 Bumbu, Tepung, Saos
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs text-zinc-400 font-medium">Rp</span>
                    <input
                      type="number"
                      value={batchSeasoningCost}
                      onChange={(e) => setBatchSeasoningCost(e.target.value === '' ? 0 : Number(e.target.value))}
                      className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold text-sm"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500">Bumbu halus, tapioka, saus</p>
                </div>

                {/* Gas LPG & Air Kukusan */}
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    🔥 Gas & Air 1x Kukus
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs text-zinc-400 font-medium">Rp</span>
                    <input
                      type="number"
                      value={batchGasCost}
                      onChange={(e) => setBatchGasCost(e.target.value === '' ? 0 : Number(e.target.value))}
                      className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold text-sm"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500">Est. Gas untuk kukus batch ini</p>
                </div>
              </div>

              {/* Subtotal Calculated Per Pcs */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                    Hasil Modal per 1 Pcs / Biji
                  </span>
                  <p className="text-[11px] text-zinc-500">
                    Total belanja ({formatCurrency(batchTotalMaterialCost)}) ÷ {batchYieldPcs} pcs
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(hppPerPcs)}
                  </span>
                  <span className="block text-[10px] text-zinc-500">/ pcs dimsum</span>
                </div>
              </div>

              {/* B. PORSI & KEMASAN */}
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
                <h4 className="text-xs font-extrabold uppercase text-zinc-700 dark:text-zinc-300">
                  B. Pengemasan & Isi per Porsi Siap Jual
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                      1 Porsi Isi Berapa Pcs Dimsum?
                    </label>
                    <input
                      type="number"
                      value={pcsPerPortion}
                      onChange={(e) => setPcsPerPortion(e.target.value === '' ? 1 : Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-bold text-sm"
                    />
                    <p className="text-[10px] text-zinc-500 mt-1">
                      Modal {pcsPerPortion} pcs = {formatCurrency(hppPerPcs * pcsPerPortion)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                      Biaya Wadah & Kemasan per Porsi (Rp)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-zinc-400 font-medium">Rp</span>
                      <input
                        type="number"
                        value={packagingPerPortion}
                        onChange={(e) => setPackagingPerPortion(e.target.value === '' ? 0 : Number(e.target.value))}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-bold text-sm"
                      />
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-1">
                      Mika/Thinwall + Sumpit + Plastik + Saos
                    </p>
                  </div>
                </div>

                {/* Total HPP per Porsi Summary */}
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex justify-between items-center text-xs font-extrabold text-emerald-900 dark:text-emerald-200">
                  <span>TOTAL MODAL HPP PER PORSI ({pcsPerPortion} PCS + KEMASAN):</span>
                  <span className="text-base text-emerald-600 dark:text-emerald-400 font-black">
                    {formatCurrency(totalHpp)}
                  </span>
                </div>
              </div>

            </div>
          ) : (
            /* MODE 2: DIRECT INPUTS PER PORSI */
            <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <ChefHat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    Modal HPP Per Satuan / Porsi
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Masukkan jika Anda sudah tahu biaya per porsi.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                    Bahan Utama / Pokok (Rp)
                  </label>
                  <input
                    type="number"
                    value={directBahanPokok}
                    onChange={(e) => setDirectBahanPokok(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                    Bumbu & Bahan Baku (Rp)
                  </label>
                  <input
                    type="number"
                    value={directBahanBaku}
                    onChange={(e) => setDirectBahanBaku(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                    Pengemasan & Wadah (Rp)
                  </label>
                  <input
                    type="number"
                    value={directPengemasan}
                    onChange={(e) => setDirectPengemasan(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                    Gas & Operasional (Rp)
                  </label>
                  <input
                    type="number"
                    value={directOperasional}
                    onChange={(e) => setDirectOperasional(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-bold text-sm"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex justify-between items-center text-xs font-bold text-emerald-900 dark:text-emerald-300">
                <span>TOTAL MODAL HPP PER PORSI:</span>
                <span className="text-base text-emerald-600 dark:text-emerald-400 font-black">
                  {formatCurrency(totalHpp)}
                </span>
              </div>
            </div>
          )}

          {/* SECTION C: HARGA JUAL KE PELANGGAN */}
          <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  2. Harga Jual Ke Pelanggan
                </h3>
                <p className="text-xs text-zinc-500">
                  Berapa harga 1 porsi / 1 pcs yang Anda tawarkan ke pembeli?
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                  Harga Jual per Porsi (Rp) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-zinc-400 font-medium">Rp</span>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-black text-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {calcMode === 'batch' && pcsPerPortion > 1 && (
                  <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold mt-1">
                    = Rp {Math.round(sellingPricePerPcsEquivalent).toLocaleString('id-ID')} / 1 pcs dimsum
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                  Diskon / Promo (%) <span className="text-zinc-400 font-normal">(Opsional)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value === '' ? 0 : Number(e.target.value))}
                    placeholder="0"
                    className="w-full pl-3 pr-8 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold text-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-zinc-400 font-bold">%</span>
                </div>
              </div>
            </div>

            {discountPercent > 0 && (
              <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-200 dark:border-indigo-800">
                Harga Jual Bersih Setelah Diskon: {formatCurrency(effectiveSellingPrice)}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: KEUNTUNGAN & MARGIN HASIL AKHIR */}
        <div className="lg:col-span-5 space-y-6">

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border-2 border-emerald-500/40 shadow-xl space-y-6 sticky top-20">
            
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                Hasil Keuntungan & Margin
              </h3>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white uppercase tracking-wider">
                100% Akurat
              </span>
            </div>

            {/* MARGIN HEALTH BANNER */}
            <div className={`p-3.5 rounded-xl border flex items-start space-x-2.5 ${marginHealth.color}`}>
              <div className="mt-0.5">{marginHealth.icon}</div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wide">
                  {marginHealth.text}
                </div>
                <p className="text-[11px] opacity-90 mt-0.5">
                  {marginHealth.desc}
                </p>
              </div>
            </div>

            {/* HIGHLIGHT 1: KEUNTUNGAN BERSIH (PROFIT RP) */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent border border-emerald-500/30 space-y-1">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Keuntungan Bersih (Profit) Per Porsi
              </span>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {formatCurrency(netProfitRp)}
                <span className="text-xs font-normal text-zinc-500 ml-1">/ porsi</span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Uang bersih masuk kantong dari 1 porsi ({calcMode === 'batch' ? `${pcsPerPortion} pcs` : 'makanan'}).
              </p>
            </div>

            {/* HIGHLIGHT 2: MARGIN (%) & MARKUP (%) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 space-y-1">
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                  Margin Keuntungan
                </span>
                <div className="text-2xl font-black text-zinc-900 dark:text-white">
                  {netMarginPercent.toFixed(1)}%
                </div>
                <p className="text-[10px] text-zinc-400">
                  % Untung dari harga jual.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 space-y-1">
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                  Markup dari Modal
                </span>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {markupPercent.toFixed(1)}%
                </div>
                <p className="text-[10px] text-zinc-400">
                  % Kenaikan dari HPP.
                </p>
              </div>
            </div>

            {/* BAR VISUALISASI RASIO HARGA JUAL */}
            <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                <span>Rasio Komposisi Harga Jual</span>
                <span>{formatCurrency(effectiveSellingPrice)}</span>
              </div>

              {effectiveSellingPrice > 0 && (
                <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-4 rounded-full overflow-hidden flex text-[9px] font-bold text-white">
                  <div
                    style={{ width: `${Math.min(100, Math.max(0, (totalHpp / effectiveSellingPrice) * 100))}%` }}
                    className="bg-amber-500 h-full flex items-center justify-center px-1 overflow-hidden"
                    title="Modal HPP"
                  >
                    Modal
                  </div>
                  <div
                    style={{ width: `${Math.min(100, Math.max(0, (netProfitRp / effectiveSellingPrice) * 100))}%` }}
                    className="bg-emerald-500 h-full flex items-center justify-center px-1 overflow-hidden"
                    title="Keuntungan Bersih"
                  >
                    Untung
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                  Modal HPP: {formatCurrency(totalHpp)}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  Untung: {formatCurrency(netProfitRp)}
                </span>
              </div>
            </div>

            {/* TOMBOL SIMPAN */}
            <button
              onClick={handleSave}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center justify-center space-x-2"
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>Simpan Produk Ini Ke Daftar</span>
            </button>

            {savedSuccessMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl text-center animate-fadeIn">
                ✓ Produk berhasil disimpan ke menu "Daftar Produk"!
              </div>
            )}

            {/* RINGKASAN ANGKANYA */}
            <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-2 text-[11px] text-zinc-600 dark:text-zinc-400">
              <div className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-emerald-500" />
                Ringkasan Rumus Sederhana:
              </div>
              <ul className="space-y-1 text-[11px]">
                <li>• <strong>Modal HPP:</strong> {formatCurrency(totalHpp)} per porsi</li>
                <li>• <strong>Harga Jual:</strong> {formatCurrency(effectiveSellingPrice)}</li>
                <li>• <strong>Untung Bersih:</strong> {effectiveSellingPrice} - {totalHpp} = <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(netProfitRp)}</strong></li>
                <li>• <strong>Margin %:</strong> ({netProfitRp} ÷ {effectiveSellingPrice}) × 100% = <strong className="text-emerald-600 dark:text-emerald-400">{netMarginPercent.toFixed(1)}%</strong></li>
              </ul>
            </div>

          </div>

        </div>

      </div>

      {/* HPP RECIPE / GRAMASI BUILDER MODAL */}
      {isHppBuilderOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto my-auto rounded-2xl">
            <HppDetailBuilder
              productName={productName || 'Produk Anda'}
              initialItems={detailedHppItems}
              onApplyHpp={(totalBahan, totalKemasan, items) => {
                if (calcMode === 'batch') {
                  setBatchMainCost(totalBahan);
                  setBatchSeasoningCost(0);
                  setPackagingPerPortion(totalKemasan);
                } else {
                  setDirectBahanPokok(totalBahan);
                  setDirectPengemasan(totalKemasan);
                }
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
