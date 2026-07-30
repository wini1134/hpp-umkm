import React, { useState, useMemo } from 'react';
import { BEPInput } from '../types';
import { calculateBEP, formatCurrency } from '../utils/calculator';
import { TrendingUp, Building2, PackageCheck, DollarSign, Calendar, Sparkles } from 'lucide-react';

export const BEPCalculator: React.FC = () => {
  const [fixedCostInput, setFixedCostInput] = useState({
    rent: 2000000, // Sewa tempat / gudang
    salary: 4000000, // Gaji karyawan
    utilities: 500000, // Listrik & wifi
    subscriptions: 300000, // Tools / software
    otherFixed: 200000, // Operasional rutin
  });

  const [unitFinance, setUnitFinance] = useState({
    netProfitPerUnit: 8400,
    sellingPricePerUnit: 12000,
    targetTakeHomePay: 3000000, // Desired net income above BEP
  });

  const totalFixedCosts = useMemo(() => {
    return (
      Number(fixedCostInput.rent) +
      Number(fixedCostInput.salary) +
      Number(fixedCostInput.utilities) +
      Number(fixedCostInput.subscriptions) +
      Number(fixedCostInput.otherFixed)
    );
  }, [fixedCostInput]);

  const bepResult = useMemo(() => {
    const input: BEPInput = {
      monthlyFixedCosts: totalFixedCosts,
      netProfitPerUnit: unitFinance.netProfitPerUnit,
      sellingPricePerUnit: unitFinance.sellingPricePerUnit,
    };
    return calculateBEP(input);
  }, [totalFixedCosts, unitFinance]);

  // Target including Take Home Pay
  const targetMonthlyProfitNeeded = totalFixedCosts + Number(unitFinance.targetTakeHomePay);
  const targetUnitsMonthly =
    unitFinance.netProfitPerUnit > 0
      ? Math.ceil(targetMonthlyProfitNeeded / unitFinance.netProfitPerUnit)
      : 0;
  const targetRevenueMonthly = targetUnitsMonthly * unitFinance.sellingPricePerUnit;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
          <TrendingUp className="w-4 h-4" />
          <span>Break-Even Point (BEP) & Target Omset</span>
        </div>
        <h2 className="text-xl font-bold">Kalkulator Impas & Target Penjualan</h2>
        <p className="text-xs text-indigo-100/80 mt-1 max-w-2xl">
          Hitung berapa unit barang yang wajib Anda jual setiap hari & bulan hanya untuk menutupi biaya operasional rutin (Sewa, Gaji, Listrik) agar bisnis tidak rugi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Fixed Overhead Expenses */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm pb-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>1. Biaya Operasional Tetap Bulanan (Fixed Cost)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Sewa Gudang / Toko (Rp/Bln)
                </label>
                <input
                  type="number"
                  value={fixedCostInput.rent}
                  onChange={(e) =>
                    setFixedCostInput({ ...fixedCostInput, rent: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Gaji Karyawan Tetap (Rp/Bln)
                </label>
                <input
                  type="number"
                  value={fixedCostInput.salary}
                  onChange={(e) =>
                    setFixedCostInput({ ...fixedCostInput, salary: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Listrik, Air & WiFi (Rp/Bln)
                </label>
                <input
                  type="number"
                  value={fixedCostInput.utilities}
                  onChange={(e) =>
                    setFixedCostInput({ ...fixedCostInput, utilities: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Software / Admin Tools (Rp/Bln)
                </label>
                <input
                  type="number"
                  value={fixedCostInput.subscriptions}
                  onChange={(e) =>
                    setFixedCostInput({ ...fixedCostInput, subscriptions: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between font-bold text-sm">
              <span className="text-zinc-800 dark:text-zinc-200">Total Biaya Operasional Tetap:</span>
              <span className="text-indigo-600 dark:text-indigo-400">
                {formatCurrency(totalFixedCosts)} / bulan
              </span>
            </div>
          </div>

          {/* Unit Profitability & Goal */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm pb-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center space-x-2">
              <PackageCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>2. Keuntungan Rata-rata Per Unit & Target Profit Usaha</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Average Net Profit Per Unit (Rp)
                </label>
                <input
                  type="number"
                  value={unitFinance.netProfitPerUnit}
                  onChange={(e) =>
                    setUnitFinance({ ...unitFinance, netProfitPerUnit: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Average Selling Price Per Unit (Rp)
                </label>
                <input
                  type="number"
                  value={unitFinance.sellingPricePerUnit}
                  onChange={(e) =>
                    setUnitFinance({ ...unitFinance, sellingPricePerUnit: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Target Gaji / Profit Bersih Diinginkan Owner (Take Home Pay Rp/Bln)
              </label>
              <input
                type="number"
                value={unitFinance.targetTakeHomePay}
                onChange={(e) =>
                  setUnitFinance({ ...unitFinance, targetTakeHomePay: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>
        </div>

        {/* Right Output Highlights (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* BEP Summary Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-blue-900 text-white rounded-2xl p-5 shadow-md space-y-4">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
              Titik Impas (Break-Even Point)
            </span>

            <div className="grid grid-cols-2 gap-4 border-b border-indigo-800 pb-4">
              <div>
                <span className="text-xs text-indigo-200">Minimal Terjual / Bulan:</span>
                <span className="block text-2xl font-black text-white mt-0.5">
                  {bepResult.bepUnitsMonthly} <span className="text-xs font-medium">unit</span>
                </span>
              </div>
              <div>
                <span className="text-xs text-indigo-200">Minimal Terjual / Hari:</span>
                <span className="block text-2xl font-black text-white mt-0.5">
                  {bepResult.bepUnitsDaily} <span className="text-xs font-medium">unit/hari</span>
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs text-indigo-200">Minimum Omset Bulanan Untuk Impas:</span>
              <span className="block text-xl font-bold text-indigo-100 mt-0.5">
                {formatCurrency(bepResult.bepRevenueMonthly)}
              </span>
              <p className="text-[11px] text-indigo-200/70 mt-1">
                Di bawah omset {formatCurrency(bepResult.bepRevenueMonthly)}/bulan, usaha Anda akan mengalami kerugian operasional.
              </p>
            </div>
          </div>

          {/* Target Sales with Owner Salary */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Target Omset Termasuk Gaji Owner</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Biaya Operasional Tetap</span>
                <span>{formatCurrency(totalFixedCosts)}</span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Target Net Profit Owner</span>
                <span>{formatCurrency(unitFinance.targetTakeHomePay)}</span>
              </div>
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between font-bold text-sm text-zinc-900 dark:text-zinc-100">
                <span>Target Unit / Bulan:</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {targetUnitsMonthly} unit ({Math.ceil(targetUnitsMonthly / 30)} unit/hari)
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-zinc-900 dark:text-zinc-100">
                <span>Target Omset Bulanan:</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(targetRevenueMonthly)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
