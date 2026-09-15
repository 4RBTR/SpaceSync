'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/hooks';
import { apiClient } from '@/lib/api';
import { Container, Card, CardHeader, CardTitle, CardContent, Section, Grid } from '@/components/Layout';
import { Input, Select } from '@/components/Form';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Alert';
import { formatCurrency, formatDate, getMonthName } from '@/lib/utils';

export default function AdminReportsPage() {
  const { isAuthenticated, userRole } = useAuth();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: monthlyReport, isLoading: monthlyLoading } = useApi(
    () => apiClient.getMonthlyReports(month, year),
    isAuthenticated && userRole === 'admin_space'
  );

  const { data: incomeReport, isLoading: incomeLoading } = useApi(
    () => apiClient.getIncomeReports(month, year),
    isAuthenticated && userRole === 'admin_space'
  );

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: getMonthName(i + 1),
  }));

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: (new Date().getFullYear() - i).toString(),
    label: (new Date().getFullYear() - i).toString(),
  }));

  const isLoading = monthlyLoading || incomeLoading;

  return (
    <div className="min-h-screen py-8">
      <Container>
        <Section title="Laporan Pendapatan" description="Rekapitulasi dan analisis pendapatan">
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
              <Button variant="outline" className="w-full">
                Refresh
              </Button>
            </div>
          </Card>

          {/* Monthly Summary */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Memuat laporan...</p>
            </div>
          ) : (
            <>
              <Grid cols={4} className="mb-8">
                <Card>
                  <div className="text-center">
                    <p className="text-gray-600 text-sm mb-2">Total Reservasi</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {monthlyReport?.total_reservasi || 0}
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="text-center">
                    <p className="text-gray-600 text-sm mb-2">Reservasi Selesai</p>
                    <p className="text-3xl font-bold text-green-600">
                      {monthlyReport?.reservasi_selesai || 0}
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="text-center">
                    <p className="text-gray-600 text-sm mb-2">Pendapatan Terukur</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(monthlyReport?.pendapatan_terukur || 0)}
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="text-center">
                    <p className="text-gray-600 text-sm mb-2">Estimasi Pendapatan</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(monthlyReport?.estimasi_pendapatan || 0)}
                    </p>
                  </div>
                </Card>
              </Grid>

              {/* Income by Space Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribusi Pendapatan per Tipe Space</CardTitle>
                </CardHeader>
                <CardContent>
                  {incomeReport && incomeReport.length > 0 ? (
                    <div className="space-y-4">
                      {incomeReport.map((income: any, idx: number) => (
                        <div
                          key={idx}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {income.tipe_space}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {income.jumlah_space} Ruangan
                              </p>
                            </div>
                            <Badge variant="primary">
                              {income.total_reservasi} Reservasi
                            </Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Pendapatan</p>
                              <p className="font-bold text-green-600">
                                {formatCurrency(income.total_pendapatan)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Avg/Hari</p>
                              <p className="font-bold">
                                {formatCurrency(
                                  income.total_pendapatan /
                                    new Date(year, month, 0).getDate()
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">% Total</p>
                              <p className="font-bold text-blue-600">
                                {(
                                  (income.total_pendapatan /
                                    (monthlyReport?.estimasi_pendapatan || 1)) *
                                  100
                                ).toFixed(1)}
                                %
                              </p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-3 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all"
                              style={{
                                width: `${(income.total_pendapatan / (monthlyReport?.estimasi_pendapatan || 1)) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-4">
                      Tidak ada data laporan untuk periode ini
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Details */}
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Rincian Periode</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bulan:</span>
                      <span className="font-semibold">
                        {getMonthName(month)} {year}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Hari:</span>
                      <span className="font-semibold">
                        {new Date(year, month, 0).getDate()} hari
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pencatatan:</span>
                      <span className="font-semibold">
                        {new Date().toLocaleString('id-ID')}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tingkat Occupancy:</span>
                      <span className="font-semibold">
                        {monthlyReport?.reservasi_selesai
                          ? (
                              (monthlyReport.reservasi_selesai /
                                monthlyReport.total_reservasi) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rata-rata Transaksi:</span>
                      <span className="font-semibold">
                        {formatCurrency(
                          (monthlyReport?.estimasi_pendapatan || 0) /
                            (monthlyReport?.total_reservasi || 1)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant="success">Tersedia</Badge>
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
