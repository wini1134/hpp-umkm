import React from 'react';
import { CalculatorTab } from '../types';
import { Calculator, TrendingUp, Target, Scale, BookmarkCheck, HelpCircle, LogIn, LogOut, Database, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activeTab: CalculatorTab;
  setActiveTab: (tab: CalculatorTab) => void;
  savedCount: number;
  onOpenGlossary: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  onOpenGlossary,
}) => {
  const { user, signInWithGoogle, signOut, loading } = useAuth();

  const tabs: { id: CalculatorTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'profit',
      label: 'Kalkulator HPP & Profit',
      icon: <Calculator className="w-4 h-4" />,
    },
    {
      id: 'reverse',
      label: 'Target Harga Jual',
      icon: <Target className="w-4 h-4" />,
    },
    {
      id: 'compare',
      label: 'Komparasi Platform',
      icon: <Scale className="w-4 h-4" />,
    },
    {
      id: 'bep',
      label: 'Break-Even (BEP)',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'saved',
      label: 'Daftar Produk',
      icon: <BookmarkCheck className="w-4 h-4" />,
      badge: savedCount,
    },
  ];

  return (
    <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Brand Title */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-xl text-white shadow-sm flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                  Kalkulator HPP & <span className="text-emerald-600 dark:text-emerald-400">Margin Usaha</span>
                </h1>
                <span className="hidden md:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <Database className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Cloud SQL Active</span>
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
                Hitung HPP Bahan Pokok, Pengemasan, & Keuntungan Bersih
              </p>
            </div>
          </div>

          {/* Quick Help & Auth Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenGlossary}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              title="Kamus Istilah Keuangan & Tips"
            >
              <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Kamus Istilah & Tips</span>
              <span className="sm:hidden">Tips</span>
            </button>

            {/* Auth Button */}
            {!loading && (
              user ? (
                <div className="flex items-center space-x-2 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-6 h-6 rounded-full" />
                  ) : (
                    <UserIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  )}
                  <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 hidden md:inline max-w-[120px] truncate">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="p-1 text-zinc-500 hover:text-red-600 transition-colors"
                    title="Keluar"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signInWithGoogle()}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk / Cloud Sync</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar py-2 border-t border-zinc-100 dark:border-zinc-800/60">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                      isActive
                        ? 'bg-white text-emerald-700'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
