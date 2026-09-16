'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/hooks';
import { apiClient } from '@/lib/api';
import { Container, Card, Section } from '@/components/Layout';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Alert';
import Link from 'next/link';
import { formatCurrency, getImageUrl } from '@/lib/utils';

export default function SpaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const spaceId = params.id as string;
  const { isAuthenticated } = useAuth();

  const { data: space, isLoading, error } = useApi(
    () => apiClient.getSpaceDetail(spaceId),
    true
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="text-center">
          <svg className="animate-spin mx-auto h-10 w-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-500 font-medium">Memuat detail ruangan...</p>
        </div>
      </div>
    );
  }

  if (error || !space) {
    return (
      <div className="min-h-screen py-16">
        <Container className="max-w-xl text-center">
          <Card p-8>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Ruangan Tidak Ditemukan</h2>
            <p className="text-slate-500 mb-6">Ruangan yang Anda cari mungkin telah dihapus atau belum tersedia.</p>
            <Link href="/spaces">
              <Button>Kembali ke Katalog Ruangan</Button>
            </Link>
          </Card>
        </Container>
      </div>
    );
  }

  const facilities = space.fasilitas ? space.fasilitas.split(',') : [];
  const spacePhoto = getImageUrl(space.foto_url || space.foto, 'space');

  return (
    <div className="min-h-screen py-8 md:py-12 bg-slate-50 dark:bg-slate-950">
      <Container className="max-w-5xl">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link href="/spaces" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            ← Kembali ke Katalog Ruangan
          </Link>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Content & Photos */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Space Photo Hero */}
            <div className="relative w-full aspect-[16/10] bg-slate-200 dark:bg-slate-800 rounded-3xl overflow-hidden shadow-lg border border-slate-200/60 dark:border-slate-800">
              {spacePhoto ? (
                <img
                  src={spacePhoto}
                  alt={space.nama_space}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-slate-800 dark:to-indigo-950 text-indigo-400 font-medium">
                  <svg className="w-16 h-16 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5.581m0 0H9m5.581 0a2 2 0 100-4 2 2 0 000 4m0 0a2 2 0 100 4 2 2 0 000-4"></path></svg>
                  Foto Ruangan SpaceSync
                </div>
              )}
              
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-indigo-700 dark:text-indigo-300 text-xs font-bold px-3 py-1.5 rounded-full shadow-md border border-white/20">
                  {space.tipe_space}
                </span>
              </div>
            </div>

            {/* Description & Overview */}
            <Card className="space-y-6">
              <div>
                <h1 className="text-3xl font-black font-heading text-slate-900 dark:text-white mb-2">
                  {space.nama_space}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
                  {space.deskripsi || 'Ruangan coworking space modern dengan lingkungan kerja yang tenang dan fasilitas lengkap.'}
                </p>
              </div>

              {/* Facilities */}
              {facilities.length > 0 && (
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                    Fasilitas Ruangan
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {facilities.map((fac: string, idx: number) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50"
                      >
                        ✓ {fac.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>

          </div>

          {/* Pricing & Booking Card Sidebar */}
          <div className="lg:col-span-4 sticky top-24">
            <Card className="space-y-6 shadow-xl border-indigo-100 dark:border-slate-800">
              
              <div className="pb-6 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tarif Sewa</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-black font-heading bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
                    {formatCurrency(space.harga_per_jam)}
                  </span>
                  <span className="text-sm text-slate-500 font-medium">/ jam</span>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                  <span>Kapasitas Ruangan</span>
                  <span className="font-bold text-slate-900 dark:text-white">{space.kapasitas} Orang</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                  <span>Status Ruangan</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Siap Dipesan</span>
                </div>
              </div>

              <div className="pt-2">
                <Link href={isAuthenticated ? `/booking/${space.id}` : `/login?redirect=/booking/${space.id}`}>
                  <Button size="lg" className="w-full py-4 text-base font-bold shadow-lg shadow-indigo-500/25">
                    Pesan Ruangan Sekarang →
                  </Button>
                </Link>
              </div>

              <p className="text-[11px] text-center text-slate-400">
                ⚡ Konfirmasi reservasi otomatis dengan tiket digital QR Code.
              </p>

            </Card>
          </div>

        </div>

      </Container>
    </div>
  );
}
