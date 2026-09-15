'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Container } from '@/components/Layout';
import { Button } from '@/components/Button';

export default function Home() {
  const { isAuthenticated, userRole, user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
      
      {/* Dynamic Hero Background Mesh */}
      <div className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-tr from-indigo-500/20 via-violet-500/15 to-emerald-400/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <Container>
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              
              {/* Live Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md mb-8">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold tracking-wide text-slate-700 dark:text-slate-300">
                  Platform Coworking Space #1 di Indonesia
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight leading-[1.1] text-slate-900 dark:text-white mb-6">
                Ruang Kerja Masa Depan{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-500">
                  Tanpa Batas.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 font-normal leading-relaxed mb-10 max-w-2xl">
                Reservasi meja kerja personal, private office, hingga meeting room eksklusif secara fleksibel real-time dengan instant e-ticket QR Code.
              </p>

              {/* Action Callouts */}
              <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                {isAuthenticated ? (
                  <Link href={userRole === 'admin_space' ? '/admin/dashboard' : '/spaces'}>
                    <Button size="lg" className="w-full sm:w-auto px-8 py-4 text-base shadow-xl shadow-indigo-500/25">
                      {userRole === 'admin_space' ? 'Buka Dashboard Admin' : 'Jelajahi Ruangan Now'}
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/spaces">
                      <Button size="lg" className="w-full sm:w-auto px-8 py-4 text-base shadow-xl shadow-indigo-500/25">
                        Cari Ruangan
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-4 text-base">
                        Daftar Akun Baru
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Social Proof / Stats Pill */}
              <div className="mt-12 pt-8 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-3 gap-6 w-full max-w-md">
                <div>
                  <h4 className="text-2xl font-black font-heading text-slate-900 dark:text-white">50+</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">Lokasi Ruangan</p>
                </div>
                <div>
                  <h4 className="text-2xl font-black font-heading text-slate-900 dark:text-white">99.9%</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">Uptime System</p>
                </div>
                <div>
                  <h4 className="text-2xl font-black font-heading text-slate-900 dark:text-white">4.9/5</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">Rating User</p>
                </div>
              </div>

            </div>

            {/* Hero Right Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Visual Glass Card Preview */}
                <div className="relative rounded-3xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-2xl shadow-indigo-500/20 border border-slate-800 overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-rose-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-xs font-mono text-indigo-300 bg-indigo-950/80 px-2.5 py-1 rounded-full border border-indigo-800/50">
                      LIVE SYSTEM
                    </span>
                  </div>

                  {/* Card Content Sample */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 backdrop-blur-md">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-white text-base">Executive Meeting Suite</h4>
                          <p className="text-xs text-slate-400">Jakarta Selatan • High-Speed WiFi</p>
                        </div>
                        <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30">
                          Tersedia
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-slate-700/50 text-xs">
                        <span className="text-slate-400">Harga Per Jam:</span>
                        <span className="font-black text-indigo-400 text-sm">Rp 150.000 / jam</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-indigo-900/30 border border-indigo-700/50 backdrop-blur-md">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white">
                          QR
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-white">Instant E-Ticket Generator</h5>
                          <p className="text-[11px] text-indigo-200">Auto check-in & verification</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Floating Decorative Badges */}
                <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 hidden sm:flex items-center gap-3 animate-bounce-slow">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Reservasi Terverifikasi</p>
                    <p className="text-[10px] text-slate-500">Konfirmasi otomatis 1 detik</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </Container>
      </div>

      {/* Features Grid Showcase */}
      <section className="py-20 bg-white dark:bg-slate-900/50 border-t border-slate-200/60 dark:border-slate-800">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-slate-900 dark:text-white mb-4">
              Semua Fitur Pilihan dalam Satu Sistem
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg">
              Dirancang khusus untuk memenuhi standar UKK Coworking Space modern dengan performa tinggi.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Reservasi Instan',
                desc: 'Pilih ruangan, tentukan tanggal dan jam sewa secara fleksibel tanpa prosedur rumit.',
                icon: '⚡',
                color: 'from-amber-500 to-orange-500',
              },
              {
                title: 'Variasi Ruangan Lengkap',
                desc: 'Tersedia pilihan Personal Desk, Private Office, hingga Large Meeting Room.',
                icon: '🏢',
                color: 'from-indigo-500 to-violet-500',
              },
              {
                title: 'Diskon & Kode Promo',
                desc: 'Gunakan voucher diskon spesial untuk menghemat biaya pemesanan ruangan Anda.',
                icon: '🎁',
                color: 'from-emerald-500 to-teal-500',
              },
              {
                title: 'E-Ticket & QR Check-in',
                desc: 'Dapatkan tiket digital resmi lengkap dengan QR Code unik untuk validasi lokasi.',
                icon: '🎟️',
                color: 'from-rose-500 to-pink-500',
              },
              {
                title: 'Laporan Pendapatan',
                desc: 'Laporan keuangan bulanan dan analisis pendapatan khusus untuk Admin Space Owner.',
                icon: '📊',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                title: 'Sistem Keamanan JWT',
                desc: 'Enkripsi data dan multi-tenant Maker Key menjamin keamanan penuh akun Anda.',
                icon: '🔒',
                color: 'from-purple-500 to-indigo-500',
              },
            ].map((feat, i) => (
              <div
                key={i}
                className="group relative p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feat.color} text-2xl flex items-center justify-center mb-6 shadow-md shadow-indigo-500/10 group-hover:scale-110 transition-transform`}>
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white mb-3">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Banner Section */}
      <section className="py-20 relative overflow-hidden">
        <Container>
          <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-10 md:p-16 overflow-hidden shadow-2xl border border-indigo-700/50">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative max-w-2xl text-left">
              <h2 className="text-3xl sm:text-4xl font-black font-heading tracking-tight mb-4">
                Siap Memulai Pengalaman Coworking Terbaik?
              </h2>
              <p className="text-indigo-200 text-base sm:text-lg mb-8">
                Bergabunglah bersama ribuan profesional lainnya. Reservasi ruangan Anda sekarang atau daftarkan space Anda sebagai pengelola.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/register/member">
                  <Button size="lg" className="bg-white text-indigo-900 hover:bg-slate-100 shadow-none border-none font-extrabold px-8">
                    Daftar Sebagai Member
                  </Button>
                </Link>
                <Link href="/register/admin">
                  <Button variant="outline" size="lg" className="border-indigo-400/40 text-white hover:bg-white/10 px-8">
                    Daftar Pengelola Space
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

    </div>
  );
}

