import React, { useState } from 'react';
import { 
  Plus, Trash2, Edit2, Copy, Check, Sparkles, ChefHat, Package, 
  Layers, ChevronDown, ChevronUp, AlertCircle, RotateCcw, PieChart,
  HelpCircle, Info
} from 'lucide-react';
import { HppDetailItem, HppItemCategory } from '../types';
import { HPP_RECIPE_PRESETS } from '../data/hppPresets';

interface HppDetailBuilderProps {
  initialItems?: HppDetailItem[];
  productName?: string;
  onApplyHpp: (totalHppBahan: number, totalHppKemasan: number, items: HppDetailItem[]) => void;
  onClose?: () => void;
  isEmbedded?: boolean;
}

export const HppDetailBuilder: React.FC<HppDetailBuilderProps> = ({
  initialItems = [],
  productName = 'Produk Anda',
  onApplyHpp,
  onClose,
  isEmbedded = false,
}) => {
  const [items, setItems] = useState<HppDetailItem[]>(() => {
    if (initialItems && initialItems.length > 0) return initialItems;
    // Default fallback to Bakso preset items with unique IDs
    return HPP_RECIPE_PRESETS[0].items.map((item, idx) => ({
      ...item,
      id: `item-init-${idx}-${Date.now()}`,
    }));
  });

  const [copied, setCopied] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'bahan' | 'kemasan'>('all');
  
  // New Item Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<HppItemCategory>('bahan_pokok');
  const [calcMode, setCalcMode] = useState<'usage' | 'yield' | 'direct'>('usage');
  const [formPurchasePrice, setFormPurchasePrice] = useState<number | ''>(100000);
  const [formPurchaseQty, setFormPurchaseQty] = useState<number | ''>(1000);
  const [formUnit, setFormUnit] = useState('gram');
  const [formUsagePerUnit, setFormUsagePerUnit] = useState<number | ''>(50);
  const [formYieldUnits, setFormYieldUnits] = useState<number | ''>(20);
  const [formDirectPrice, setFormDirectPrice] = useState<number | ''>(5000);

  // Calculate cost per unit based on form fields
  const calculateFormCostPerUnit = (): number => {
    if (calcMode === 'direct') {
      return typeof formDirectPrice === 'number' ? formDirectPrice : 0;
    }
    if (calcMode === 'yield') {
      const price = typeof formPurchasePrice === 'number' ? formPurchasePrice : 0;
      const yields = typeof formYieldUnits === 'number' && formYieldUnits > 0 ? formYieldUnits : 1;
      return Math.round(price / yields);
    }
    // calcMode === 'usage'
    const price = typeof formPurchasePrice === 'number' ? formPurchasePrice : 0;
    const qty = typeof formPurchaseQty === 'number' && formPurchaseQty > 0 ? formPurchaseQty : 1;
    const usage = typeof formUsagePerUnit === 'number' ? formUsagePerUnit : 0;
    return Math.round((price / qty) * usage);
  };

  // Summaries
  const ingredientsItems = items.filter(i => i.category === 'bahan_pokok' || i.category === 'bahan_baku' || i.category === 'bumbu_pelengkap');
  const packagingItems = items.filter(i => i.category === 'kemasan');
  const otherItems = items.filter(i => i.category === 'lainnya');

  const totalIngredientsCost = ingredientsItems.reduce((acc, curr) => acc + curr.costPerUnit, 0);
  const totalPackagingCost = packagingItems.reduce((acc, curr) => acc + curr.costPerUnit, 0);
  const totalOtherCost = otherItems.reduce((acc, curr) => acc + curr.costPerUnit, 0);
  
  const grandTotalHpp = totalIngredientsCost + totalPackagingCost + totalOtherCost;

  const ingredientPercent = grandTotalHpp > 0 ? Math.round((totalIngredientsCost / grandTotalHpp) * 100) : 0;
  const packagingPercent = grandTotalHpp > 0 ? Math.round((totalPackagingCost / grandTotalHpp) * 100) : 0;
  const otherPercent = grandTotalHpp > 0 ? (100 - ingredientPercent - packagingPercent) : 0;

  const handleResetForm = () => {
    setFormName('');
    setFormCategory('bahan_pokok');
    setCalcMode('usage');
    setFormPurchasePrice(50000);
    setFormPurchaseQty(1000);
    setFormUnit('gram');
    setFormUsagePerUnit(50);
    setFormYieldUnits(20);
    setFormDirectPrice(2500);
    setEditingItemId(null);
  };

  const handleOpenAddForm = (defaultCategory: HppItemCategory = 'bahan_pokok') => {
    handleResetForm();
    setFormCategory(defaultCategory);
    if (defaultCategory === 'kemasan') {
      setCalcMode('direct');
      setFormUnit('pcs');
      setFormDirectPrice(1000);
    }
    setShowAddForm(true);
  };

  const handleEditItem = (item: HppDetailItem) => {
    setEditingItemId(item.id);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormUnit(item.unit || 'gram');

    if (item.yieldUnits && item.yieldUnits > 0) {
      setCalcMode('yield');
      setFormPurchasePrice(item.purchasePrice);
      setFormYieldUnits(item.yieldUnits);
    } else if (item.purchaseQty && item.purchaseQty > 0 && item.usagePerUnit > 0) {
      setCalcMode('usage');
      setFormPurchasePrice(item.purchasePrice);
      setFormPurchaseQty(item.purchaseQty);
      setFormUsagePerUnit(item.usagePerUnit);
    } else {
      setCalcMode('direct');
      setFormDirectPrice(item.costPerUnit);
    }

    setShowAddForm(true);
  };

  const handleSaveItem = () => {
    if (!formName.trim()) {
      alert('Silakan masukkan nama bahan atau kemasan.');
      return;
    }

    const calculatedCost = calculateFormCostPerUnit();

    const newItemData: HppDetailItem = {
      id: editingItemId || `hpp-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: formName.trim(),
      category: formCategory,
      purchasePrice: typeof formPurchasePrice === 'number' ? formPurchasePrice : 0,
      purchaseQty: typeof formPurchaseQty === 'number' ? formPurchaseQty : 1,
      unit: formUnit || 'unit',
      usagePerUnit: typeof formUsagePerUnit === 'number' ? formUsagePerUnit : 1,
      yieldUnits: calcMode === 'yield' && typeof formYieldUnits === 'number' ? formYieldUnits : undefined,
      costPerUnit: calculatedCost,
    };

    if (editingItemId) {
      setItems(prev => prev.map(i => (i.id === editingItemId ? newItemData : i)));
    } else {
      setItems(prev => [...prev, newItemData]);
    }

    setShowAddForm(false);
    handleResetForm();
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = HPP_RECIPE_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    const newItems: HppDetailItem[] = preset.items.map((item, idx) => ({
      ...item,
      id: `preset-${presetId}-${idx}-${Date.now()}`,
    }));

    setItems(newItems);
  };

  const handleCopyBreakdown = () => {
    const textLines = [
      `📋 RINCIAN HPP DETAIL: ${productName.toUpperCase()}`,
      `==========================================`,
      `🥣 BAHAN BAKU & BAHAN POKOK:`,
      ...ingredientsItems.map(
        i => `- ${i.name}: Rp ${i.costPerUnit.toLocaleString('id-ID')} / unit`
      ),
      ` Total Biaya Bahan: Rp ${totalIngredientsCost.toLocaleString('id-ID')}`,
      ``,
      `📦 KEMASAN & PACKAGING:`,
      ...packagingItems.map(
        i => `- ${i.name}: Rp ${i.costPerUnit.toLocaleString('id-ID')} / unit`
      ),
      ` Total Biaya Kemasan: Rp ${totalPackagingCost.toLocaleString('id-ID')}`,
      ...(otherItems.length > 0 ? [
        ``,
        `⚙️ BIAYA LAIN-LAIN:`,
        ...otherItems.map(i => `- ${i.name}: Rp ${i.costPerUnit.toLocaleString('id-ID')} / unit`),
      ] : []),
      `==========================================`,
      `💰 TOTAL HPP KESELURUHAN: Rp ${grandTotalHpp.toLocaleString('id-ID')} / unit`,
    ].join('\n');

    navigator.clipboard.writeText(textLines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyToMainCalculator = () => {
    // Total Bahan = ingredients + other
    const finalBahanCost = totalIngredientsCost + totalOtherCost;
    const finalKemasanCost = totalPackagingCost;

    onApplyHpp(finalBahanCost, finalKemasanCost, items);
    if (onClose) onClose();
  };

  const categoryLabels: Record<HppItemCategory, { label: string; bg: string; text: string }> = {
    bahan_pokok: { label: 'Bahan Pokok', bg: 'bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400' },
    bahan_baku: { label: 'Bahan Baku', bg: 'bg-teal-500/10', text: 'text-teal-700 dark:text-teal-400' },
    bumbu_pelengkap: { label: 'Bumbu / Pelengkap', bg: 'bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400' },
    kemasan: { label: 'Kemasan / Pack', bg: 'bg-indigo-500/10', text: 'text-indigo-700 dark:text-indigo-400' },
    lainnya: { label: 'Lain-lain', bg: 'bg-zinc-500/10', text: 'text-zinc-700 dark:text-zinc-400' },
  };

  const filteredItems = items.filter(i => {
    if (activeCategoryFilter === 'bahan') {
      return i.category === 'bahan_pokok' || i.category === 'bahan_baku' || i.category === 'bumbu_pelengkap';
    }
    if (activeCategoryFilter === 'kemasan') {
      return i.category === 'kemasan';
    }
    return true;
  });

  return (
    <div className={`space-y-6 ${isEmbedded ? '' : 'bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-xl border border-zinc-200 dark:border-zinc-800'}`}>
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                Kalkulator HPP Detail & Resep
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Bahan & Kemasan
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Rincikan item bahan pokok, bumbu, & wadah kemasan untuk mendapatkan HPP yang 100% presisi.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyBreakdown}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center space-x-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin!' : 'Salin Rincian'}</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            >
              Tutup
            </button>
          )}
        </div>
      </div>

      {/* Preset Schnell Selection */}
      <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Muat Preset Resep UMKM Popular:
          </span>
          <span className="text-[11px] text-zinc-500">Pilih 1-klik untuk mencoba</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {HPP_RECIPE_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => handleLoadPreset(preset.id)}
              className="px-2.5 py-1 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg shadow-sm transition-all text-left font-medium"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Big Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Bahan Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 dark:border-emerald-500/30">
          <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-medium mb-1">
            <span className="flex items-center gap-1">
              <ChefHat className="w-4 h-4 text-emerald-600" />
              Bahan Baku & Pokok
            </span>
            <span className="font-bold">{ingredientPercent}%</span>
          </div>
          <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200">
            Rp {totalIngredientsCost.toLocaleString('id-ID')}
            <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400 ml-1">/ porsi</span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
            {ingredientsItems.length} item bahan baku terdaftar
          </p>
        </div>

        {/* Total Kemasan Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/20 dark:border-indigo-500/30">
          <div className="flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-400 font-medium mb-1">
            <span className="flex items-center gap-1">
              <Package className="w-4 h-4 text-indigo-600" />
              Kemasan & Packaging
            </span>
            <span className="font-bold">{packagingPercent}%</span>
          </div>
          <div className="text-2xl font-black text-indigo-900 dark:text-indigo-200">
            Rp {totalPackagingCost.toLocaleString('id-ID')}
            <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400 ml-1">/ porsi</span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
            {packagingItems.length} item wadah/stiker terdaftar
          </p>
        </div>

        {/* Grand Total HPP Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 dark:border-amber-500/40">
          <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 font-bold mb-1">
            <span className="flex items-center gap-1">
              <Layers className="w-4 h-4 text-amber-600" />
              TOTAL HPP PER UNIT
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-900 dark:text-amber-200 font-semibold text-[10px]">
              Modal Pokok
            </span>
          </div>
          <div className="text-2xl font-black text-amber-900 dark:text-amber-100">
            Rp {grandTotalHpp.toLocaleString('id-ID')}
            <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400 ml-1">/ porsi</span>
          </div>
          
          {/* Visual Ratio Bar */}
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden flex mt-2">
            <div 
              style={{ width: `${ingredientPercent}%` }} 
              className="bg-emerald-500 h-full" 
              title={`Bahan Baku: ${ingredientPercent}%`}
            />
            <div 
              style={{ width: `${packagingPercent}%` }} 
              className="bg-indigo-500 h-full" 
              title={`Kemasan: ${packagingPercent}%`}
            />
            <div 
              style={{ width: `${otherPercent}%` }} 
              className="bg-amber-500 h-full" 
              title={`Lainnya: ${otherPercent}%`}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Add Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
          <button
            onClick={() => setActiveCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeCategoryFilter === 'all'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            Semua Item ({items.length})
          </button>
          <button
            onClick={() => setActiveCategoryFilter('bahan')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeCategoryFilter === 'bahan'
                ? 'bg-white dark:bg-zinc-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            🥣 Bahan Baku ({ingredientsItems.length})
          </button>
          <button
            onClick={() => setActiveCategoryFilter('kemasan')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeCategoryFilter === 'kemasan'
                ? 'bg-white dark:bg-zinc-700 text-indigo-700 dark:text-indigo-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            📦 Kemasan ({packagingItems.length})
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenAddForm('bahan_pokok')}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-xl transition-all shadow-sm flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Bahan</span>
          </button>
          <button
            onClick={() => handleOpenAddForm('kemasan')}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-xl transition-all shadow-sm flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Kemasan</span>
          </button>
        </div>
      </div>

      {/* Form Add / Edit Item Modal Panel */}
      {showAddForm && (
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border-2 border-emerald-500/40 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-700">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              {editingItemId ? '✏️ Edit Komponen HPP' : '➕ Tambah Komponen HPP Baru'}
            </h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                handleResetForm();
              }}
              className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium"
            >
              Batal
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {/* Nama Item */}
            <div>
              <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                Nama Bahan / Kemasan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="misal: Daging Sapi / Thinwall Bowl"
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                Kategori Item
              </label>
              <select
                value={formCategory}
                onChange={e => setFormCategory(e.target.value as HppItemCategory)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="bahan_pokok">🥣 Bahan Pokok (Daging, Kain, Kopi, Singkong)</option>
                <option value="bahan_baku">🧪 Bahan Baku (Tepung, Susu, Busa)</option>
                <option value="bumbu_pelengkap">🌿 Bumbu / Pelengkap (Garam, Kecap, Es)</option>
                <option value="kemasan">📦 Kemasan / Wadah (Thinwall, Stiker, Box, Sendok)</option>
                <option value="lainnya">⚙️ Biaya Lain-Lain (Gas, Listrik racik)</option>
              </select>
            </div>

            {/* Mode Penghitungan */}
            <div>
              <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                Metode Hitung Biaya
              </label>
              <select
                value={calcMode}
                onChange={e => setCalcMode(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="usage">1. Hitung Dari Pemakaian Gram/ml (Standard)</option>
                <option value="yield">2. Hitung Dari Hasil Porsi / Batch (Yield)</option>
                <option value="direct">3. Input Biaya Langsung Per Unit (Pcs/Stiker)</option>
              </select>
            </div>
          </div>

          {/* Conditional Inputs Based on Mode */}
          {calcMode === 'usage' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <div>
                <label className="block text-[11px] text-zinc-600 dark:text-zinc-400 mb-1 font-medium">
                  Harga Beli Per Pembelian (Rp)
                </label>
                <input
                  type="number"
                  value={formPurchasePrice}
                  onChange={e => setFormPurchasePrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="120000"
                  className="w-full px-2.5 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-600 dark:text-zinc-400 mb-1 font-medium">
                  Jumlah Pembelian Total
                </label>
                <input
                  type="number"
                  value={formPurchaseQty}
                  onChange={e => setFormPurchaseQty(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="1000"
                  className="w-full px-2.5 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-600 dark:text-zinc-400 mb-1 font-medium">
                  Satuan Pembelian
                </label>
                <input
                  type="text"
                  value={formUnit}
                  onChange={e => setFormUnit(e.target.value)}
                  placeholder="gram / ml / pcs"
                  className="w-full px-2.5 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-600 dark:text-zinc-400 mb-1 font-medium">
                  Pemakaian per 1 Produk
                </label>
                <input
                  type="number"
                  value={formUsagePerUnit}
                  onChange={e => setFormUsagePerUnit(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="60"
                  className="w-full px-2.5 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {calcMode === 'yield' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <div>
                <label className="block text-[11px] text-zinc-600 dark:text-zinc-400 mb-1 font-medium">
                  Harga Beli Batch Total (Rp)
                </label>
                <input
                  type="number"
                  value={formPurchasePrice}
                  onChange={e => setFormPurchasePrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="120000"
                  className="w-full px-2.5 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-600 dark:text-zinc-400 mb-1 font-medium">
                  Total Porsi/Unit Yang Dihasilkan (Yield)
                </label>
                <input
                  type="number"
                  value={formYieldUnits}
                  onChange={e => setFormYieldUnits(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="15"
                  className="w-full px-2.5 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-600 dark:text-zinc-400 mb-1 font-medium">
                  Satuan Porsi
                </label>
                <input
                  type="text"
                  value={formUnit}
                  onChange={e => setFormUnit(e.target.value)}
                  placeholder="porsi / pcs"
                  className="w-full px-2.5 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {calcMode === 'direct' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <div>
                <label className="block text-[11px] text-zinc-600 dark:text-zinc-400 mb-1 font-medium">
                  Biaya Langsung Per 1 Unit (Rp)
                </label>
                <input
                  type="number"
                  value={formDirectPrice}
                  onChange={e => setFormDirectPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="1000"
                  className="w-full px-2.5 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-600 dark:text-zinc-400 mb-1 font-medium">
                  Satuan
                </label>
                <input
                  type="text"
                  value={formUnit}
                  onChange={e => setFormUnit(e.target.value)}
                  placeholder="pcs / stiker / sendok"
                  className="w-full px-2.5 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Form Result Live Preview */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-700">
            <div className="text-xs">
              <span className="text-zinc-500">Estimasi Biaya per Unit: </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                Rp {calculateFormCostPerUnit().toLocaleString('id-ID')}
              </span>
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  handleResetForm();
                }}
                className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveItem}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                {editingItemId ? 'Simpan Perubahan' : 'Tambahkan Ke Tabel HPP'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Table List */}
      <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="py-3 px-4">Nama Item / Komponen</th>
              <th className="py-3 px-4">Kategori</th>
              <th className="py-3 px-4">Penghitungan Pembelian</th>
              <th className="py-3 px-4 text-right">Biaya / Unit (Rp)</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-400 dark:text-zinc-500">
                  Belum ada item terdaftar. Klik "Tambah Bahan" atau "Tambah Kemasan" di atas.
                </td>
              </tr>
            ) : (
              filteredItems.map(item => {
                const catStyle = categoryLabels[item.category] || categoryLabels.lainnya;
                return (
                  <tr key={item.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-zinc-900 dark:text-white">
                      {item.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${catStyle.bg} ${catStyle.text}`}>
                        {catStyle.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 text-[11px]">
                      {item.yieldUnits ? (
                        <span>Rp {item.purchasePrice.toLocaleString('id-ID')} / {item.yieldUnits} {item.unit}</span>
                      ) : item.purchaseQty && item.usagePerUnit ? (
                        <span>Rp {item.purchasePrice.toLocaleString('id-ID')} ({item.usagePerUnit} {item.unit} dari {item.purchaseQty} {item.unit})</span>
                      ) : (
                        <span>Langsung per {item.unit}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-zinc-900 dark:text-white">
                      Rp {item.costPerUnit.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="p-1 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"
                          title="Edit Item"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                          title="Hapus Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot className="bg-zinc-50 dark:bg-zinc-800/80 font-bold border-t border-zinc-200 dark:border-zinc-800">
            <tr>
              <td colSpan={3} className="py-3 px-4 text-zinc-800 dark:text-zinc-200">
                TOTAL KESELURUHAN HPP MODAL
              </td>
              <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 text-sm">
                Rp {grandTotalHpp.toLocaleString('id-ID')}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-emerald-500" />
          <span>HPP ini akan dimasukkan otomatis sebagai Biaya Bahan (Rp {totalIngredientsCost + totalOtherCost}) & Kemasan (Rp {totalPackagingCost}) di Kalkulator Profit.</span>
        </div>

        <button
          onClick={handleApplyToMainCalculator}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center justify-center space-x-2"
        >
          <Check className="w-4 h-4" />
          <span>Terapkan HPP Ini Ke Kalkulator Utama</span>
        </button>
      </div>

    </div>
  );
};
