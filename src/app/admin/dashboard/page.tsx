'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/hooks';
import { apiClient } from '@/lib/api';
import { Container, Card, CardHeader, CardTitle, CardContent, Section, PageHeader } from '@/components/Layout';
import { Badge } from '@/components/Alert';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { formatCurrency, getInitials, getImageUrl } from '@/lib/utils';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, userRole } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'admin_space') {
      router.push('/login');
    }
  }, [isAuthenticated, userRole, router]);

  const { data: profile } = useApi(
    () => apiClient.getAdminProfile(),
    isAuthenticated
  );

  const { data: reservations } = useApi(
    () => apiClient.getAdminReservations({ limit: 10 }),
    isAuthenticated
  );

  const { data: monthlyReport } = useApi(async () => {
    const now = new Date();
    return apiClient.getMonthlyReports(now.getMonth() + 1, now.getFullYear());
  }, isAuthenticated);

  const pendingReservations =
    reservations?.filter((r: any) => r.status === 'Belum Dikonfirmasi') || [];

  const activeReservations = reservations?.filter((r: any) => r.status === 'Aktif/Digunakan') || [];

  return (
    <div className="min-h-screen py-8 md:py-12 relative">
      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-indigo-50/50 to-transparent -z-10" />
      
      <Container>
        <PageHeader
          title="Dashboard Admin Space"
          description="Ringkasan performa dan kelola reservasi coworking space Anda"
        />

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border-t-4 border-t-indigo-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 font-medium text-sm mb-2">Total Reservasi</p>
                <p className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  {reservations?.length || 0}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border-t-4 border-t-amber-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 font-medium text-sm mb-2">Menunggu Konfirmasi</p>
                <p className="text-4xl font-extrabold text-amber-500 tracking-tight">
                  {pendingReservations.length}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border-t-4 border-t-emerald-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 font-medium text-sm mb-2">Sedang Aktif</p>
                <p className="text-4xl font-extrabold text-emerald-500 tracking-tight">
                  {activeReservations.length}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border-t-4 border-t-violet-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 font-medium text-sm mb-2">Estimasi Pendapatan</p>
                <p className="text-2xl font-extrabold text-slate-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
                  {formatCurrency(
                    (reservations || [])
                      .filter((r: any) => r.status !== 'Dibatalkan')
                      .reduce((sum: number, r: any) => sum + (Number(r.total_harga) || 0), 0) ||
                    monthlyReport?.ringkasan?.estimasi_pendapatan_total ||
                    monthlyReport?.estimasi_pendapatan ||
                    0
                  )}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-violet-50 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-7 h-7 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8 mb-10">
          {/* Pending Reservations */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Reservasi Menunggu Konfirmasi</CardTitle>
                  <span className="bg-amber-100 text-amber-700 text-sm font-semibold px-3 py-1 rounded-full">
                    {pendingReservations.length} Pending
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {pendingReservations.length > 0 ? (
                  <div className="space-y-4">
                    {pendingReservations.map((reservation: any) => (
                      <div
                        key={reservation.id}
                        className="p-5 border border-amber-200 bg-amber-50/50 rounded-xl flex justify-between items-center transition-all hover:bg-amber-50 hover:shadow-sm"
                      >
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 text-lg mb-1 font-heading">
                            {reservation.member?.nama_member}
                          </h4>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 font-medium">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                              {reservation.space?.nama_space}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                              {reservation.tanggal_reservasi}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                              {reservation.jam_mulai} ({reservation.durasi_jam} jam)
                            </span>
                          </div>
                        </div>
                        <Link href={`/admin/reservasi/${reservation.id}`} className="ml-4 shrink-0">
                          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 focus:ring-amber-500 shadow-none hover:shadow-md">
                            Proses
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <p className="text-slate-500 font-medium">Bagus! Tidak ada reservasi yang menunggu konfirmasi.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Access */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Akses Cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/profile" className="block">
                <Button className="w-full justify-start text-left px-5" variant="outline">
                  <svg className="w-5 h-5 mr-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  Profil Space
                </Button>
              </Link>
              <Link href="/admin/members" className="block">
                <Button className="w-full justify-start text-left px-5" variant="outline">
                  <svg className="w-5 h-5 mr-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  Kelola Members
                </Button>
              </Link>
              <Link href="/admin/spaces" className="block">
                <Button className="w-full justify-start text-left px-5" variant="outline">
                  <svg className="w-5 h-5 mr-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                  Kelola Ruangan
                </Button>
              </Link>
              <Link href="/admin/promo" className="block">
                <Button className="w-full justify-start text-left px-5" variant="outline">
                  <svg className="w-5 h-5 mr-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                  Kelola Promo
                </Button>
              </Link>
              <Link href="/admin/reservasi" className="block">
                <Button className="w-full justify-start text-left px-5" variant="outline">
                  <svg className="w-5 h-5 mr-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                  Semua Reservasi
                </Button>
              </Link>
              <Link href="/admin/reports" className="block">
                <Button className="w-full justify-start text-left px-5" variant="outline">
                  <svg className="w-5 h-5 mr-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                  Laporan Pendapatan
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Profile Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-base overflow-hidden flex-shrink-0 shadow-md">
                {profile?.foto_url || profile?.foto ? (
                  <img
                    src={getImageUrl(profile.foto_url || profile.foto, 'avatar')}
                    alt={profile.nama_coworking || 'Space'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  getInitials(profile?.nama_coworking || 'Space')
                )}
              </div>
              <div>
                <CardTitle>{profile?.nama_coworking || 'Informasi Space'}</CardTitle>
                <p className="text-xs text-slate-500 font-medium">Profil & Penanggung Jawab Space Owner</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">Nama Space</p>
                <p className="font-bold text-slate-900 text-lg">{profile?.nama_coworking || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">Pemilik</p>
                <p className="font-bold text-slate-900 text-lg">{profile?.nama_pemilik || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">Telepon</p>
                <p className="font-bold text-slate-900 text-lg">{profile?.no_telepon || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">Alamat</p>
                <p className="font-bold text-slate-900 text-lg truncate" title={profile?.alamat}>{profile?.alamat || '-'}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Link href="/admin/profile">
                <Button>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  Edit Profil
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
