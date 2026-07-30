import React, { useState, useEffect, useCallback } from 'react';
import { CalculatorTab, SavedProduct } from './types';
import { Header } from './components/Header';
import { ProfitCalculator } from './components/ProfitCalculator';
import { ReverseCalculator } from './components/ReverseCalculator';
import { BEPCalculator } from './components/BEPCalculator';
import { PlatformComparison } from './components/PlatformComparison';
import { SavedProducts } from './components/SavedProducts';
import { GlossaryModal } from './components/GlossaryModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Database, CloudCheck, RefreshCw } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'ecommerce_profit_calc_saved_v1';

function AppContent() {
  const { user, getToken } = useAuth();
  const [activeTab, setActiveTab] = useState<CalculatorTab>('profit');
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load saved products from localStorage', e);
    }
    return [
      {
        id: '1',
        name: 'Dimsum Ayam Spesial (1 Porsi isi 4 Pcs)',
        date: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        hpp: 3600,
        sellingPrice: 12000,
        platformName: 'Batch Adonan (100 Pcs)',
        netProfit: 8400,
        netMargin: 70.0,
        roi: 233.3,
        monthlySalesVolumeEstimate: 100,
      },
      {
        id: '2',
        name: 'Es Kopi Susu Gula Aren 16oz',
        date: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        hpp: 6800,
        sellingPrice: 18000,
        platformName: 'ShopeeFood / GoFood (Komisi 20%)',
        netProfit: 7600,
        netMargin: 42.2,
        roi: 111.7,
        monthlySalesVolumeEstimate: 150,
      },
    ];
  });

  // Load from Cloud SQL database if logged in
  const fetchProductsFromDatabase = useCallback(async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch('/api/products', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const dbProducts: SavedProduct[] = await res.json();
        if (Array.isArray(dbProducts)) {
          setSavedProducts(dbProducts);
        }
      }
    } catch (error) {
      console.error('Failed to load products from Cloud SQL:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [user, getToken]);

  useEffect(() => {
    if (user) {
      fetchProductsFromDatabase();
    }
  }, [user, fetchProductsFromDatabase]);

  // Sync savedProducts to localStorage as fallback
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedProducts));
    } catch (e) {
      console.error('Failed to save products to localStorage', e);
    }
  }, [savedProducts]);

  const handleSaveProduct = async (newProduct: SavedProduct) => {
    setSavedProducts((prev) => [newProduct, ...prev]);

    if (user) {
      setIsSyncing(true);
      try {
        const token = await getToken();
        if (token) {
          await fetch('/api/products', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(newProduct),
          });
        }
      } catch (error) {
        console.error('Failed to save product to Cloud SQL:', error);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setSavedProducts((prev) => prev.filter((p) => p.id !== id));

    if (user) {
      setIsSyncing(true);
      try {
        const token = await getToken();
        if (token) {
          await fetch(`/api/products/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
      } catch (error) {
        console.error('Failed to delete product from Cloud SQL:', error);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua produk tersimpan?')) {
      const idsToDelete = savedProducts.map((p) => p.id);
      setSavedProducts([]);

      if (user) {
        setIsSyncing(true);
        try {
          const token = await getToken();
          if (token) {
            for (const id of idsToDelete) {
              await fetch(`/api/products/${id}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
            }
          }
        } catch (error) {
          console.error('Failed to clear products from Cloud SQL:', error);
        } finally {
          setIsSyncing(false);
        }
      }
    }
  };

  const handleUpdateVolume = async (id: string, volume: number) => {
    const validVolume = Math.max(1, volume);
    setSavedProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, monthlySalesVolumeEstimate: validVolume } : p))
    );

    if (user) {
      try {
        const token = await getToken();
        if (token) {
          await fetch(`/api/products/${id}/volume`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ volume: validVolume }),
          });
        }
      } catch (error) {
        console.error('Failed to update volume in Cloud SQL:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedProducts.length}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
      />

      {/* Cloud SQL Sync Notification Banner */}
      {user && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800/80 py-2 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center space-x-2">
              <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                Tersambung ke <strong>Cloud SQL PostgreSQL</strong> sebagai <strong>{user.email}</strong>. Data otomatis tersimpan secara permanen.
              </span>
            </div>
            {isSyncing ? (
              <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Menyinkronkan...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <CloudCheck className="w-3.5 h-3.5" />
                <span>Tersinkronisasi</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className={activeTab === 'profit' ? 'block' : 'hidden'}>
          <ProfitCalculator onSaveProduct={handleSaveProduct} />
        </div>

        <div className={activeTab === 'reverse' ? 'block' : 'hidden'}>
          <ReverseCalculator onSaveProduct={handleSaveProduct} />
        </div>

        <div className={activeTab === 'compare' ? 'block' : 'hidden'}>
          <PlatformComparison />
        </div>

        <div className={activeTab === 'bep' ? 'block' : 'hidden'}>
          <BEPCalculator />
        </div>

        <div className={activeTab === 'saved' ? 'block' : 'hidden'}>
          <SavedProducts
            products={savedProducts}
            onDeleteProduct={handleDeleteProduct}
            onClearAll={handleClearAll}
            onNavigateToCalculator={() => setActiveTab('profit')}
            onUpdateVolume={handleUpdateVolume}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 py-6 mt-auto text-xs text-zinc-500 dark:text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              Kalkulator Profit E-Commerce & UMKM
            </span>{' '}
            • Database Cloud SQL PostgreSQL & Firebase Auth
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsGlossaryOpen(true)}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 underline transition-colors"
            >
              Kamus Istilah & Tips
            </button>
            <span>Shopee • Tokopedia • TikTok Shop • GoFood / GrabFood</span>
          </div>
        </div>
      </footer>

      {/* Glossary Modal */}
      <GlossaryModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
