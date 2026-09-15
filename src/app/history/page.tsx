'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/hooks';
import { apiClient } from '@/lib/api';
import { Container, Card, CardHeader, CardTitle, CardContent, Section } from '@/components/Layout';
import { Badge } from '@/components/Alert';
import { Button } from '@/components/Button';
import { Select } from '@/components/Form';
import Link from 'next/link';
import { formatDate, formatCurrency, getStatusColor, getMonthName } from '@/lib/utils';

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated, userRole } = useAuth();
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'member') {
      router.push('/login');
    }
  }, [isAuthenticated, userRole, router]);

  const { data: history, isLoading, execute } = useApi(
    () => apiClient.getMyReservationHistory(month, year),
    isAuthenticated
  );

  const handleFilter = () => {
    execute();
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: getMonthName(i + 1),
  }));

  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: String(currentDate.getFullYear() - i),
    label: String(currentDate.getFullYear() - i),
  }));

  return (
    <div className="min-h-screen py-8">
      <Container>
        <Section title="Riwayat Reservasi" description="Lihat riwayat reservasi Anda berdasarkan bulan">
          <Card className="mb-6">
            <CardContent>
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[140px]">
                  <Select
                    label="Bulan"
                    value={String(month)}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    options={monthOptions}
                  />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <Select
                    label="Tahun"
                    value={String(year)}
                    onChange={(e) => setYear(Number(e.target.value))}
                    options={yearOptions}
                  />
                </div>
                <div className="mb-4">
                  <Button onClick={handleFilter} isLoading={isLoading}>
                    Filter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Memuat riwayat...</p>
            </div>
          ) : history && Array.isArray(history) && history.length > 0 ? (
            <div className="space-y-4">
              {history.map((reservation: any) => (
                <Card key={reservation.id || reservation.id_reservasi}>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 text-lg">
                          {reservation.space?.nama_space || reservation.nama_space || 'Ruangan'}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {formatDate(reservation.tanggal_reservasi)} • {reservation.jam_mulai} - {reservation.durasi_jam} jam
                        </p>
                        <p className="text-sm font-medium text-slate-800 mt-2">
                          {formatCurrency(reservation.total_harga || reservation.total_bayar || 0)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                          {reservation.status}
                        </span>
                        <Link href={`/reservasi/${reservation.id || reservation.id_reservasi}`}>
                          <Button size="sm" variant="outline">
                            Detail
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-slate-600 mb-2">Belum ada riwayat reservasi</p>
                <p className="text-sm text-slate-500">
                  untuk {getMonthName(month)} {year}
                </p>
              </div>
            </Card>
          )}
        </Section>
      </Container>
    </div>
  );
}
