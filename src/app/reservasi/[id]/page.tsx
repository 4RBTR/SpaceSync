'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/hooks';
import { apiClient } from '@/lib/api';
import { Container, Card, CardHeader, CardTitle, CardContent, Section } from '@/components/Layout';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Alert';
import Link from 'next/link';
import { formatDate, formatCurrency, getStatusColor, formatStatusLabel, getDayName, getReservationPrice, getReservationSpace } from '@/lib/utils';

export default function ReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reservationId = params.id as string;
  const { isAuthenticated } = useAuth();

  const { data: reservation, isLoading } = useApi(
    () => apiClient.getReservationDetail(reservationId),
    isAuthenticated
  );

  const handleCancel = async () => {
    if (confirm('Apakah Anda yakin ingin membatalkan reservasi ini?')) {
      try {
        const res = await apiClient.cancelReservation(reservationId);
        if (res.status) {
          alert('Reservasi berhasil dibatalkan');
          router.push('/reservasi');
        } else {
          alert(res.message || 'Gagal membatalkan reservasi');
        }
      } catch (err: any) {
        console.error('Gagal membatalkan reservasi:', err);
        alert(err.response?.data?.message || 'Gagal membatalkan reservasi');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <Container>
          <div className="text-center py-12">
            <p className="text-gray-600">Memuat data reservasi...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen py-8">
        <Container>
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Reservasi #{reservationId} tidak ditemukan</p>
              <Link href="/reservasi">
                <Button>Kembali ke Reservasi</Button>
              </Link>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  const spaceObj = getReservationSpace(reservation);
  const totalHarga = getReservationPrice(reservation);
  const statusLabel = formatStatusLabel(reservation.status);
  const jamMulai = reservation.jam_mulai || '10:00';
  const durasiJam = Number(reservation.durasi_jam) || 1;
  const startHour = parseInt(jamMulai.split(':')[0]) || 10;
  const startMinute = jamMulai.split(':')[1] || '00';
  const endHour = (startHour + durasiJam) % 24;
  const jamSelesai = `${String(endHour).padStart(2, '0')}:${startMinute}`;

  return (
    <div className="min-h-screen py-8">
      <Container className="max-w-3xl">
        <Section title="Detail Reservasi">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Header */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">
                        {spaceObj?.nama_space || reservation.nama_space || 'Ruangan Coworking'}
                      </CardTitle>
                      <p className="text-gray-600 mt-2 capitalize">
                        {spaceObj?.tipe_space || spaceObj?.tipe || 'Coworking Space'}
                      </p>
                    </div>
                    <Badge className={getStatusColor(reservation.status)}>
                      {statusLabel}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              {/* Reservation Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Pemesanan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Tanggal</p>
                      <p className="font-semibold text-lg">
                        {formatDate(reservation.tanggal_reservasi)}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {getDayName(reservation.tanggal_reservasi)}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 text-sm mb-1">Waktu Mulai</p>
                      <p className="font-semibold text-lg">
                        {jamMulai} WIB
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 text-sm mb-1">Durasi</p>
                      <p className="font-semibold text-lg">
                        {durasiJam} jam
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 text-sm mb-1">Waktu Selesai</p>
                      <p className="font-semibold text-lg">
                        {jamSelesai} WIB
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Rincian Biaya</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Harga per jam</span>
                      <span className="font-semibold">
                        {formatCurrency(spaceObj?.harga_per_jam || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Durasi ({durasiJam} jam)</span>
                      <span className="font-semibold">
                        {formatCurrency((spaceObj?.harga_per_jam || 0) * durasiJam)}
                      </span>
                    </div>

                    {reservation.diskon && (
                      <div className="flex justify-between text-sm text-green-600 py-3 border-t border-gray-200">
                        <span>Diskon ({reservation.diskon.persentase_diskon}%)</span>
                        <span className="font-semibold">
                          -{formatCurrency(
                            ((spaceObj?.harga_per_jam || 0) *
                              durasiJam *
                              reservation.diskon.persentase_diskon) /
                              100
                          )}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-lg font-bold bg-indigo-50 p-4 rounded-xl mt-4">
                      <span>Total Biaya</span>
                      <span className="text-indigo-600 font-sans">
                        {formatCurrency(totalHarga)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Space Facilities */}
              {spaceObj?.fasilitas && (
                <Card>
                  <CardHeader>
                    <CardTitle>Fasilitas Ruangan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {spaceObj.fasilitas.split(',').map((fac: string, idx: number) => (
                        <li key={idx} className="flex items-center text-gray-700">
                          <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
                          {fac.trim()}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Aksi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href={`/reservasi/${reservationId}/e-ticket`} className="block">
                    <Button className="w-full">
                      Lihat E-Ticket
                    </Button>
                  </Link>

                  {(reservation.status === 'belum_dikonfirm' ||
                    statusLabel === 'Belum Dikonfirmasi') && (
                    <Button
                      variant="danger"
                      className="w-full"
                      onClick={handleCancel}
                    >
                      Batalkan Reservasi
                    </Button>
                  )}

                  <Link href="/reservasi" className="block">
                    <Button variant="outline" className="w-full">
                      Kembali ke List
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Coworking Space Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Lokasi Space</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Pengelola</p>
                      <p className="font-semibold">
                        {reservation.owner?.nama_coworking || spaceObj?.coworking_space?.nama_coworking || 'SpaceSync Partner'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Telepon</p>
                      <p className="font-semibold">
                        {reservation.owner?.telp || spaceObj?.coworking_space?.no_telepon || '-'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reservation Code */}
              <Card>
                <CardContent className="text-center py-6">
                  <p className="text-gray-600 text-sm mb-2">Kode Reservasi</p>
                  <p className="font-mono font-bold text-lg text-indigo-600 break-all">
                    #RES-{reservation.id}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </Section>
      </Container>
    </div>
  );
}
