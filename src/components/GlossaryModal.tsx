import React from 'react';
import { X, HelpCircle, BookOpen, Lightbulb, ShieldCheck, Percent, DollarSign } from 'lucide-react';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const terms = [
    {
      title: 'HPP (Harga Pokok Penjualan) / Modal Produk',
      description:
        'Total modal bersih yang dikeluarkan untuk memproduksi atau membeli 1 unit produk. Terdiri dari harga beli barang dari supplier, biaya kemasan (box/bubble wrap/stiker), subsidi ongkir kirim modal, dan ongkos tenaga kerja packing.',
    },
    {
      title: 'Net Profit Margin (%) vs Gross Profit Margin (%)',
      description:
        'Gross Margin hanya menghitung (Harga Jual - HPP). Sedangkan Net Margin adalah keuntungan sejati setelah SEMUA biaya terpotong (HPP + Biaya Admin Marketplace + Biaya Iklan Ads + Operasional). Usaha e-commerce sehat sebaiknya memiliki Net Margin minimal 15%-25%.',
    },
    {
      title: 'Biaya Layanan & Gratis Ongkir Xtra',
      description:
        'Potongan persentase komisi otomatis oleh platform (Shopee, Tokopedia, TikTok Shop) ketika seller mengaktifkan fitur Gratis Ongkir Xtra, Voucher Cashback Xtra, atau ikutserta dalam Campaign Flash Sale.',
    },
    {
      title: 'Markup Rate (%) vs ROI (%)',
      description:
        'Markup adalah persentase kenaikan dari HPP ke Harga Jual (contoh: HPP 50rb dijual 100rb = Markup 100%). ROI (Return on Investment) adalah persentase efisiensi modal bersih yang dihasilkan dari modal awal.',
    },
    {
      title: 'BEP (Break-Even Point)',
      description:
        'Titik impas di mana total omset penjualan Anda persis menutup total biaya operasional tetap (sewa tempat, gaji karyawan, listrik) sehingga laba = 0 (tidak rugi dan belum untung).',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-10">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
              Kamus Istilah & Tips Keuangan Seller
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Glossary Terms List */}
        <div className="space-y-4">
          {terms.map((t, idx) => (
            <div
              key={idx}
              className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-1"
            >
              <h4 className="font-bold text-sm text-emerald-700 dark:text-emerald-400">
                {t.title}
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {t.description}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
            <Lightbulb className="w-4 h-4 text-emerald-600" />
            <span>3 Tips Seller Bebas Rugi Di Marketplace:</span>
          </div>
          <ul className="list-disc list-inside text-xs text-emerald-900 dark:text-emerald-200 space-y-1 pl-1">
            <li>
              <strong>Perhitungkan Biaya Admin Dulu:</strong> Selalu gunakan "Target Harga Jual" sebelum memasang harga di katalog.
            </li>
            <li>
              <strong>Selalu Sediakan Buffer Diskon Coret (10-15%):</strong> Pembeli marketplace menyukai diskon toko.
            </li>
            <li>
              <strong>Alokasikan 5-8% Untuk Ads:</strong> Persaingan organik makin ketat, budget iklan harus masuk dalam struktur HPP/Harga Jual.
            </li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium text-xs rounded-xl hover:opacity-90 transition-opacity"
        >
          Tutup & Kembali Ke Kalkulator
        </button>
      </div>
    </div>
  );
};
