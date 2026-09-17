'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/hooks';
import { apiClient } from '@/lib/api';
import { Container, Card, CardHeader, CardTitle, CardContent, Section, Grid } from '@/components/Layout';
import { Input, Select } from '@/components/Form';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Alert';
import { formatCurrency, formatDate, getMonthName, getReservationPrice, getReservationSpace } from '@/lib/utils';

export default function AdminReportsPage() {
  const { isAuthenticated, userRole } = useAuth();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: reservations, isLoading: reservationsLoading, execute: refetchReservations } = useApi(
    () => apiClient.getAdminReservations({ limit: 500 }),
    isAuthenticated && userRole === 'admin_space'
  );

  const { data: generalReport } = useApi(
    () => apiClient.getAdminReports(),
    isAuthenticated && userRole === 'admin_space'
  );

  const { data: monthlyReport, isLoading: monthlyLoading, execute: refetchMonthly } = useApi(
    () => apiClient.getMonthlyReports(month, year),
    isAuthenticated && userRole === 'admin_space'
  );

  const { data: incomeReport, isLoading: incomeLoading, execute: refetchIncome } = useApi(
    () => apiClient.getIncomeReports(month, year),
    isAuthenticated && userRole === 'admin_space'
  );

  const handleRefresh = () => {
    refetchReservations();
    refetchMonthly();
    refetchIncome();
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: getMonthName(i + 1),
  }));

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: (new Date().getFullYear() - i).toString(),
    label: (new Date().getFullYear() - i).toString(),
  }));

  const isLoading = monthlyLoading && incomeLoading && reservationsLoading;

  // Filter reservations by selected month & year
  const filteredReservations = (reservations || []).filter((r: any) => {
    if (!r.tanggal_reservasi) return false;
    const d = new Date(r.tanggal_reservasi);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });

  // Extract report object from backend responses
  const reportObj = monthlyReport?.ringkasan ? monthlyReport : (monthlyReport?.data || incomeReport?.data || incomeReport);

  // Calculate real metrics directly from database records or API report summary
  const realTotalReservasi = filteredReservations.length > 0 
    ? filteredReservations.length 
    : Number(reportObj?.ringkasan?.total_reservasi || 0);

  const realReservasiSelesai = filteredReservations.length > 0
    ? filteredReservations.filter((r: any) => {
        const s = String(r.status).toLowerCase();
        return s === 'selesai' || s === 'aktif' || s.includes('selesai') || s.includes('aktif') || s.includes('guna');
      }).length
    : Number(reportObj?.ringkasan?.status_reservasi?.selesai || 0) + Number(reportObj?.ringkasan?.status_reservasi?.aktif || 0);

  const realPendapatanTerukur = filteredReservations.length > 0
    ? filteredReservations
        .filter((r: any) => {
          const s = String(r.status).toLowerCase();
          return s === 'selesai' || s === 'aktif' || s === 'disetujui' || s.includes('selesai') || s.includes('aktif') || s.includes('setuju');
        })
        .reduce((sum: number, r: any) => sum + getReservationPrice(r), 0)
    : Number(reportObj?.ringkasan?.realisasi_pendapatan || reportObj?.ringkasan?.estimasi_pendapatan_total || 0);

  const realEstimasiPendapatan = filteredReservations.length > 0
    ? filteredReservations
        .filter((r: any) => String(r.status).toLowerCase() !== 'dibatalkan')
        .reduce((sum: number, r: any) => sum + getReservationPrice(r), 0)
    : Number(reportObj?.ringkasan?.estimasi_pendapatan_total || 0);

  // Space Type Income Breakdown
  let spaceTypeItems: Array<{ tipe_space: string; total_reservasi: number; total_pendapatan: number }> = [];

  if (filteredReservations.length > 0) {
    const spaceTypeMap: Record<string, { count: number; total_income: number }> = {};
    filteredReservations.forEach((r: any) => {
      if (String(r.status).toLowerCase() === 'dibatalkan') return;
      const spaceObj = getReservationSpace(r);
      const rawType = spaceObj?.tipe_space || spaceObj?.tipe || r.nama_space || 'Coworking Space';
      
      let typeName = rawType;
      if (rawType === 'desk') typeName = 'Personal Desk';
      else if (rawType === 'meeting_room') typeName = 'Meeting Room';
      else if (rawType === 'private_office') typeName = 'Private Office';

      if (!spaceTypeMap[typeName]) {
        spaceTypeMap[typeName] = { count: 0, total_income: 0 };
      }
      spaceTypeMap[typeName].count += 1;
      spaceTypeMap[typeName].total_income += getReservationPrice(r);
    });

    spaceTypeItems = Object.entries(spaceTypeMap).map(([type, data]) => ({
      tipe_space: type,
      total_reservasi: data.count,
      total_pendapatan: data.total_income,
    }));
  } else if (reportObj?.pendapatan_per_tipe_space) {
    const rawMap = reportObj.pendapatan_per_tipe_space;
    const labelMap: Record<string, string> = {
      desk: 'Personal Desk',
      meeting_room: 'Meeting Room',
      private_office: 'Private Office'
    };
    spaceTypeItems = Object.entries(rawMap)
      .filter(([_, val]: any) => val?.count > 0 || val?.total_income > 0)
      .map(([key, val]: any) => ({
        tipe_space: labelMap[key] || key,
        total_reservasi: val.count || 0,
        total_pendapatan: val.total_income || 0,
      }));
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const occupancyRate = realTotalReservasi > 0 ? ((realReservasiSelesai / realTotalReservasi) * 100).toFixed(1) : '0';
  const avgTransaction = realTotalReservasi > 0 ? Math.round(realEstimasiPendapatan / realTotalReservasi) : 0;

  return (
    <div className="min-h-screen py-8">
      <Container>
        <Section title="Laporan Pendapatan" description="Rekapitulasi dan analisis real pendapatan lokasi coworking space">
          {/* Date Filter */}
          <Card className="mb-6">
            <div className="grid md:grid-cols-3 gap-4 items-end">
              <Select
                label="Bulan"
                options={months}
                value={month.toString()}
                onChange={(e) => setMonth(parseInt(e.target.value))}
              />
              <Select
                label="Tahun"
                options={years}
                value={year.toString()}
                onChange={(e) => setYear(parseInt(e.target.value))}
              />
              <div className="mb-4">
                <Button onClick={handleRefresh} variant="outline" className="w-full">
                  Refresh Data
                </Button>
              </div>
            </div>
          </Card>

          {/* Monthly Summary */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Memuat laporan pendapatan...</p>
            </div>
          ) : (
            <>
              <Grid cols={4} className="mb-8">
                <Card>
                  <div className="text-center">
                    <p className="text-gray-600 text-sm mb-2 font-medium">Total Reservasi</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {realTotalReservasi}
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="text-center">
                    <p className="text-gray-600 text-sm mb-2 font-medium">Reservasi Selesai / Aktif</p>
                    <p className="text-3xl font-bold text-emerald-600">
                      {realReservasiSelesai}
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="text-center">
                    <p className="text-gray-600 text-sm mb-2 font-medium">Pendapatan Terukur</p>
                    <p className="text-2xl font-bold text-indigo-600 font-sans">
                      {formatCurrency(realPendapatanTerukur)}
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="text-center">
                    <p className="text-gray-600 text-sm mb-2 font-medium">Estimasi Pendapatan</p>
                    <p className="text-2xl font-bold text-purple-600 font-sans">
                      {formatCurrency(realEstimasiPendapatan)}
                    </p>
                  </div>
                </Card>
              </Grid>

              {/* Income by Space Type */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Distribusi Pendapatan per Tipe Space</CardTitle>
                </CardHeader>
                <CardContent>
                  {spaceTypeItems.length > 0 ? (
                    <div className="space-y-4">
                      {spaceTypeItems.map((income: any, idx: number) => {
                        const percent = realEstimasiPendapatan > 0
                          ? ((income.total_pendapatan / realEstimasiPendapatan) * 100).toFixed(1)
                          : '0';

                        return (
                          <div
                            key={idx}
                            className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 bg-white dark:bg-slate-800 shadow-sm"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                                  {income.tipe_space}
                                </h4>
                              </div>
                              <Badge variant="primary">
                                {income.total_reservasi} Reservasi
                              </Badge>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-slate-500 text-xs font-medium">Pendapatan</p>
                                <p className="font-bold text-emerald-600 font-sans text-base">
                                  {formatCurrency(income.total_pendapatan)}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-500 text-xs font-medium">Avg/Hari</p>
                                <p className="font-semibold text-slate-900 font-sans">
                                  {formatCurrency(income.total_pendapatan / daysInMonth)}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-500 text-xs font-medium">% Total</p>
                                <p className="font-bold text-indigo-600">
                                  {percent}%
                                </p>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-3 bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                              <div
                                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-6">
                      Tidak ada data transaksi pendapatan untuk bulan ini
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Rincian Periode Laporan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-600">Bulan & Tahun:</span>
                      <span className="font-semibold text-slate-900">
                        {getMonthName(month)} {year}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-600">Total Hari dalam Bulan:</span>
                      <span className="font-semibold text-slate-900">
                        {daysInMonth} hari
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Waktu Sinkronisasi:</span>
                      <span className="font-semibold text-slate-900">
                        {new Date().toLocaleString('id-ID')}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Ringkasan Kinerja</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-600">Tingkat Occupancy:</span>
                      <span className="font-bold text-indigo-600">
                        {occupancyRate}%
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-600">Rata-rata Transaksi:</span>
                      <span className="font-bold text-slate-900 font-sans">
                        {formatCurrency(avgTransaction)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Status Data:</span>
                      <Badge variant="success">Real-Time Sync</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </Section>
      </Container>
    </div>
  );
}
