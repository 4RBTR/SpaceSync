'use client';

import Link from 'next/link';
import { Button } from '@/components/Button';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center py-12 px-4 relative overflow-hidden">
      
      {/* Background Mesh Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-indigo-500/10 via-violet-500/10 to-emerald-400/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-4xl space-y-10 text-center">
        
        {/* Header Title */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold shadow-sm">
            ✨ SpaceSync Ecosystem
          </div>
          <h1 className="text-4xl sm:text-5xl font-black font-heading tracking-tight text-slate-900">
            Pilih Tipe Akses Akun Anda
          </h1>
          <p className="text-slate-500 text-base max-w-lg mx-auto leading-relaxed">
            Tentukan peran Anda untuk menyesuaikan pengalaman reservasi dan fitur dashboard.
          </p>
        </div>

        {/* 2-Role Cards */}
        <div className="grid md:grid-cols-2 gap-8 text-left">
          
          {/* Member Card */}
          <Link href="/register/member" className="group">
            <div className="h-full p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 hover:border-indigo-400 transition-all duration-300 hover:-translate-y-1 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-indigo-700 text-white flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Akses Member</span>
                <h3 className="text-2xl font-bold font-heading text-slate-900 mt-1 mb-3 group-hover:text-indigo-600 transition-colors">
                  Member / Pengunjung
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">
                  Cari dan sewa meja kerja personal, private office, atau meeting room eksklusif secara instan dengan bukti e-ticket.
                </p>
              </div>

              <Button size="lg" className="w-full py-3.5 font-bold shadow-lg shadow-indigo-500/20">
                Daftar sebagai Member →
              </Button>
            </div>
          </Link>

          {/* Admin Space Card */}
          <Link href="/register/admin" className="group">
            <div className="h-full p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 hover:border-emerald-400 transition-all duration-300 hover:-translate-y-1 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] hover:shadow-xl hover:shadow-emerald-500/10 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5.581m0 0H9m5.581 0a2 2 0 100-4 2 2 0 000 4m0 0a2 2 0 100 4 2 2 0 000-4" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Akses Pengelola</span>
                <h3 className="text-2xl font-bold font-heading text-slate-900 mt-1 mb-3 group-hover:text-emerald-600 transition-colors">
                  Pengelola Space
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">
                  Daftarkan lokasi coworking space Anda, kelola ketersediaan ruangan, buat voucher promo, & atur laporan keuangan.
                </p>
              </div>

              <Button variant="success" size="lg" className="w-full py-3.5 font-bold shadow-lg shadow-emerald-500/20">
                Daftar sebagai Admin Space →
              </Button>
            </div>
          </Link>

        </div>

        {/* Footer Login Link */}
        <p className="text-slate-500 text-sm pt-4">
          Sudah memiliki akun?{' '}
          <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-bold underline">
            Masuk di sini
          </Link>
        </p>

      </div>
    </div>
  );
}


