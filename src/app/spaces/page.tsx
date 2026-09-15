'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/hooks';
import { apiClient } from '@/lib/api';
import { Container, Card, CardHeader, CardTitle, CardContent, Section, Grid, PageHeader } from '@/components/Layout';
import { Button } from '@/components/Button';
import { Input, Select } from '@/components/Form';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default function SpacesPage() {
  const router = useRouter();
  const { isAuthenticated, userRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: spaces, isLoading: spacesLoading } = useApi(
    () =>
      apiClient.getAllSpaces({
        type: selectedType || undefined,
        search: searchQuery || undefined,
      }),
    true
  );

  const { data: types } = useApi(() => apiClient.getSpaceTypes(), true);

  const typeOptions =
    types?.map((type: any) => ({
      value: type.id,
      label: type.tipe_space,
    })) || [];

  const displaySpaces = spaces || [];

  return (
    <div className="min-h-screen py-8 md:py-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-50 to-transparent -z-10" />
      
      <Container>
        <PageHeader
          title="Jelajahi Ruangan"
          description="Temukan ruangan yang sempurna untuk kebutuhan kerja dan kolaborasi tim Anda"
        />

        {/* Filter Section - Floating Glass Panel */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-4 mb-10 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <Input
              placeholder="Cari nama ruangan..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white/80"
            />
          </div>
          <div className="flex-1 w-full">
            <Select
              options={[
                { value: '', label: 'Semua Tipe Ruangan' },
                ...typeOptions,
              ]}
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white/80"
            />
          </div>
          <div className="w-full md:w-auto">
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('');
                setCurrentPage(1);
              }}
              variant="secondary"
              className="w-full"
            >
              Reset Filter
            </Button>
          </div>
        </div>

        {/* Spaces Grid */}
        <div className="mb-12">
          {spacesLoading ? (
            <div className="text-center py-20">
              <svg className="animate-spin mx-auto h-10 w-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-slate-500 font-medium">Memuat data ruangan...</p>
            </div>
          ) : displaySpaces.length > 0 ? (
            <>
              <Grid cols={3} className="mb-10">
                {displaySpaces.map((space: any) => (
                  <Card key={space.id} className="flex flex-col p-0 overflow-hidden group">
                    {/* Image with Badges */}
                    <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden">
                      {space.foto ? (
                        <img
                          src={space.foto}
                          alt={space.nama_space}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-400 font-medium">
                          Foto Ruangan
                        </div>
                      )}
                      
                      {/* Floating Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="bg-white/90 backdrop-blur-sm text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                          {space.tipe_space}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="bg-slate-900/80 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                          {space.kapasitas} org
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-1 font-heading group-hover:text-indigo-600 transition-colors">
                          {space.nama_space}
                        </h3>
                        <p className="text-2xl font-extrabold text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
                          {formatCurrency(space.harga_per_jam)}<span className="text-sm font-medium text-slate-500 ml-1">/jam</span>
                        </p>
                      </div>

                      {/* Facilities */}
                      {space.fasilitas && (
                        <div className="mb-5">
                          <div className="flex flex-wrap gap-1.5">
                            {space.fasilitas.split(',').slice(0, 3).map((fac: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium border border-slate-200/60"
                              >
                                {fac.trim()}
                              </span>
                            ))}
                            {space.fasilitas.split(',').length > 3 && (
                              <span className="text-xs bg-slate-50 text-slate-500 px-2 py-1 rounded-md font-medium border border-slate-200/60">
                                +{space.fasilitas.split(',').length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed">
                        {space.deskripsi}
                      </p>

                      {/* Actions */}
                      <div className="flex gap-3 mt-auto">
                        <Link href={`/spaces/${space.id}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            Detail
                          </Button>
                        </Link>
                        <Link href={`/booking/${space.id}`} className="flex-1">
                          <Button className="w-full">
                            Pesan
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </Grid>

              {/* Pagination */}
              <div className="flex justify-center items-center gap-3">
                <Button
                  variant="secondary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="w-32"
                >
                  Sebelumnya
                </Button>
                <span className="text-slate-500 font-medium text-sm px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-100">
                  Hal {currentPage}
                </span>
                <Button
                  variant="secondary"
                  disabled={displaySpaces.length < 12} // Assuming 12 per page
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="w-32"
                >
                  Selanjutnya
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Tidak ada ruangan ditemukan</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">Kami tidak dapat menemukan ruangan yang sesuai dengan kriteria pencarian Anda. Silakan coba filter yang berbeda.</p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('');
                }}
                variant="outline"
              >
                Reset Pencarian
              </Button>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
