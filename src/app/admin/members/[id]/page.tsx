'use client';

import { useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/hooks';
import { apiClient } from '@/lib/api';
import { Container, Card, Section } from '@/components/Layout';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Alert';
import Link from 'next/link';
import { formatCurrency, formatDate, getImageUrl, getInitials, getReservationPrice, getReservationSpace } from '@/lib/utils';

function extractArray(raw: any): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.data)) return raw.data;
  if (Array.isArray(raw.data?.data)) return raw.data.data;
  return [];
}

export default function AdminMemberDetailPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params.id as string;
  const { isAuthenticated, userRole } = useAuth();

  const handleUpdateNote = async (newInstansi: string) => {
    try {
      await apiClient.updateAdminMember(memberId, { instansi: newInstansi });
    } catch (e) {
      console.warn('updateAdminMember warning:', e);
    }
  };

  const handleDeleteMember = async () => {
    if (confirm('Apakah Anda yakin ingin menghapus data member ini dari sistem?')) {
      try {
        await apiClient.deleteAdminMember(memberId);
        router.push('/admin/members');
      } catch (e) {
        console.error('Gagal menghapus member:', e);
      }
    }
  };

  // Fetch Member Detail
  const { data: memberDetail, isLoading: memberLoading } = useApi(
    () => apiClient.getAdminMemberDetail(memberId),
    isAuthenticated && userRole === 'admin_space' && !!memberId
  );

  // Fetch Admin Reservations
  const { data: reservationsRes, isLoading: resLoading } = useApi(
    () => apiClient.getAdminReservations(),
    isAuthenticated && userRole === 'admin_space'
  );

  const reservationsList = useMemo(() => extractArray(reservationsRes), [reservationsRes]);

  // Filter transactions belonging to this member
  const memberReservations = useMemo(() => {
    if (!memberDetail) return [];

    const targetId = String(memberDetail.id);
    const targetUsername = String(memberDetail.username || memberDetail.nama_member || '').toLowerCase();

    return reservationsList.filter((r: any) => {
      const resUserId = String(r.id_user || r.user?.id || r.member?.id || '');
      const resUsername = String(r.user?.username || r.member?.username || r.nama_member || '').toLowerCase();

      return (resUserId && resUserId === targetId) || (resUsername && resUsername === targetUsername);
    });
  }, [memberDetail, reservationsList]);

  const isLoading = memberLoading || resLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <svg className="animate-spin mx-auto h-10 w-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-500 font-medium">Memuat detail member & riwayat transaksi...</p>
        </div>
      </div>
    );
  }

  if (!memberDetail) {
    return (
      <div className="min-h-screen py-16 bg-slate-50 dark:bg-slate-950">
        <Container className="max-w-xl text-center">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Member Tidak Ditemukan</h2>
            <p className="text-slate-500 mb-6">Data member ini tidak tersedia atau telah dihapus.</p>
            <Link href="/admin/members">
              <Button>← Kembali ke Daftar Member</Button>
            </Link>
          </Card>
        </Container>
      </div>
    );
  }

  const memberPhoto = getImageUrl(memberDetail.foto_url || memberDetail.foto, 'avatar');

  return (
    <div className="min-h-screen py-8 md:py-12 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Container className="max-w-5xl">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link href="/admin/members">
            <Button variant="outline" className="text-xs">
              ← Kembali ke Daftar Members
            </Button>
          </Link>
        </div>

        {/* Member Profile Overview Card */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/10 border border-white/20 overflow-hidden shrink-0 shadow-lg relative flex items-center justify-center text-3xl font-black text-white">
              {memberDetail.foto_url || memberDetail.foto ? (
                <img
                  src={memberPhoto}
                  alt={memberDetail.nama_member}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                getInitials(memberDetail.nama_member || 'Member')
              )}
            </div>

            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 mb-2">
                <span>👤 Profil Member Platform</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight break-words">
                {memberDetail.nama_member}
              </h1>
              <p className="text-sm text-slate-300 mt-1">
                Username: <strong className="text-white">@{memberDetail.username || '-'}</strong>
              </p>

              <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                <div>
                  <span className="block text-slate-400 font-medium">📞 No. Telepon:</span>
                  <strong className="text-white">{memberDetail.telp || memberDetail.no_telepon || '-'}</strong>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">🏢 Instansi / Organisasi:</span>
                  <strong className="text-white">{memberDetail.instansi || '-'}</strong>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">📍 Alamat:</span>
                  <strong className="text-white">{memberDetail.alamat || '-'}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Member Transactions at This Space */}
        <Section title="Riwayat Transaksi Penyewaan" description={`Daftar reservasi yang pernah dilakukan oleh ${memberDetail.nama_member} di Coworking Space Anda`}>
          <Card className="p-0 overflow-hidden border-slate-200 dark:border-slate-800">
            {memberReservations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider">
                      <th className="px-6 py-4">Kode Booking</th>
                      <th className="px-6 py-4">Nama Ruangan</th>
                      <th className="px-6 py-4">Tanggal & Jam</th>
                      <th className="px-6 py-4">Durasi</th>
                      <th className="px-6 py-4">Total Biaya</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {memberReservations.map((res: any) => {
                      const spaceObj = getReservationSpace(res);
                      const price = getReservationPrice(res);

                      return (
                        <tr key={res.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            #{res.id}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                            {spaceObj?.nama_space || 'Ruangan Coworking'}
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-xs">
                            <div>{formatDate(res.tanggal)}</div>
                            <div className="text-slate-400 font-mono">{res.jam_mulai || '-'} WIB</div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                            {res.durasi_jam || 1} Jam
                          </td>
                          <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(price)}
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant={
                                res.status === 'selesai' || res.status === 'disetujui' || res.status === 'aktif'
                                  ? 'success'
                                  : res.status === 'dibatalkan'
                                  ? 'danger'
                                  : 'warning'
                              }
                            >
                              {res.status || 'Belum Dikonfirmasi'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Link href={`/admin/reservasi/${res.id}`}>
                              <Button variant="outline" className="text-xs px-2.5 py-1">
                                Kelola Reservasi →
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-slate-500 font-medium text-sm">
                  Member ini belum pernah melakukan penyewaan/transaksi di Coworking Space Anda.
                </p>
              </div>
            )}
          </Card>
        </Section>
      </Container>
    </div>
  );
}
