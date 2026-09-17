'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/hooks';
import { apiClient } from '@/lib/api';
import { Container, Card, Grid, PageHeader } from '@/components/Layout';
import { Button } from '@/components/Button';
import { Input, Select } from '@/components/Form';
import Link from 'next/link';
import { formatCurrency, getImageUrl } from '@/lib/utils';

function SpacesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialVendor = searchParams.get('vendor');

  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/spaces');
    }
  }, [authLoading, isAuthenticated, router]);

  const [activeTab, setActiveTab] = useState<'vendors' | 'all_spaces'>('vendors');
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(initialVendor);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Fetch all spaces from backend
  const { data: rawSpaces, isLoading: spacesLoading } = useApi(
    () => apiClient.getAllSpaces(),
    true
  );

  const { data: types } = useApi(() => apiClient.getSpaceTypes(), true);

  const spaces = useMemo(() => {
    if (!rawSpaces) return [];
    if (Array.isArray(rawSpaces)) return rawSpaces;
    if (Array.isArray((rawSpaces as any).data)) return (rawSpaces as any).data;
    if (Array.isArray((rawSpaces as any).data?.data)) return (rawSpaces as any).data.data;
    return [];
  }, [rawSpaces]);

  // Group spaces by vendor (owner)
  const vendorsMap = useMemo(() => {
    const map: Record<string, {
      id: string;
      nama_coworking: string;
      nama_pemilik: string;
      telp: string;
      alamat: string;
      foto: string;
      spaces: any[];
      typesSet: Set<string>;
    }> = {};

    spaces.forEach((space: any) => {
      const ownerId = String(space.id_owner || space.owner?.id || 'default');
      const ownerName = space.owner?.nama_coworking || space.owner?.nama_pemilik || `Coworking Space #${ownerId}`;
      const ownerPemilik = space.owner?.nama_pemilik || '-';
      const ownerTelp = space.owner?.telp || space.owner?.no_telepon || '-';
      const ownerAlamat = space.owner?.alamat || space.alamat || '-';
      const ownerFoto = space.owner?.foto || space.owner?.foto_url || space.foto_url || space.foto;

      if (!map[ownerId]) {
        map[ownerId] = {
          id: ownerId,
          nama_coworking: ownerName,
          nama_pemilik: ownerPemilik,
          telp: ownerTelp,
          alamat: ownerAlamat,
          foto: ownerFoto,
          spaces: [],
          typesSet: new Set<string>(),
        };
      }

      map[ownerId].spaces.push(space);
      if (space.tipe_space) {
        map[ownerId].typesSet.add(space.tipe_space);
      }
    });

    return map;
  }, [spaces]);

  const vendorsList = useMemo(() => Object.values(vendorsMap), [vendorsMap]);

  // Selected Vendor object
  const currentVendor = selectedVendorId && vendorsMap[selectedVendorId] ? vendorsMap[selectedVendorId] : null;

  // Filtered Vendors (Level 1)
  const filteredVendors = useMemo(() => {
    if (!searchQuery) return vendorsList;
    const q = searchQuery.toLowerCase();
    return vendorsList.filter((v) =>
      v.nama_coworking.toLowerCase().includes(q) ||
      v.nama_pemilik.toLowerCase().includes(q) ||
      v.alamat.toLowerCase().includes(q)
    );
  }, [vendorsList, searchQuery]);

  // Filtered Spaces for Level 2 (Selected Vendor or All Spaces)
  const filteredSpaces = useMemo(() => {
    let source = spaces;
    if (selectedVendorId && currentVendor) {
      source = currentVendor.spaces;
    }

    return source.filter((space: any) => {
      const matchSearch = searchQuery
        ? space.nama_space?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          space.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          space.owner?.nama_coworking?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchType = selectedType ? String(space.tipe_space) === String(selectedType) : true;
      return matchSearch && matchType;
    });
  }, [spaces, selectedVendorId, currentVendor, searchQuery, selectedType]);

  const typeOptions =
    types?.map((type: any) => ({
      value: type.id || type.tipe_space,
      label: type.tipe_space || type.nama_tipe,
    })) || [];

  return (
    <div className="min-h-screen py-8 md:py-12 relative overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Background Mesh */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-500/10 via-violet-500/5 to-transparent -z-10" />

      <Container>
        {/* Header Section */}
        <PageHeader
          title={
            currentVendor
              ? currentVendor.nama_coworking
              : activeTab === 'vendors'
              ? 'Pilih Coworking Space'
              : 'Jelajahi Semua Ruangan'
          }
          description={
            currentVendor
              ? `Jelajahi unit ruangan kerja yang tersedia di ${currentVendor.nama_coworking} (Pemilik: ${currentVendor.nama_pemilik})`
              : activeTab === 'vendors'
              ? 'Temukan penyedia Coworking Space terbaik di lokasi pilihan Anda'
              : 'Temukan unit kerja personal, private office, hingga meeting room eksklusif'
          }
        />

        {/* Level Toggle & Filter Panel */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-900/5 rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* View Tab Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full md:w-auto">
            <button
              onClick={() => {
                setActiveTab('vendors');
                setSelectedVendorId(null);
              }}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'vendors' && !selectedVendorId
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🏢 Pilihan Coworking Space ({vendorsList.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('all_spaces');
                setSelectedVendorId(null);
              }}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'all_spaces' && !selectedVendorId
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🚪 Semua Unit Ruangan ({spaces.length})
            </button>
          </div>

          {/* Search & Select Controls */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1 max-w-xl">
            <div className="flex-1">
              <Input
                placeholder={
                  selectedVendorId
                    ? `Cari ruangan di ${currentVendor?.nama_coworking}...`
                    : activeTab === 'vendors'
                    ? 'Cari nama coworking space / lokasi...'
                    : 'Cari nama unit ruangan...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50/80 dark:bg-slate-800/80 text-xs"
              />
            </div>

            {(selectedVendorId || activeTab === 'all_spaces') && (
              <div className="w-full sm:w-48">
                <Select
                  options={[
                    { value: '', label: 'Semua Tipe Ruangan' },
                    ...typeOptions,
                  ]}
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-slate-50/80 dark:bg-slate-800/80 text-xs"
                />
              </div>
            )}

            {(searchQuery || selectedType || selectedVendorId) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('');
                  setSelectedVendorId(null);
                }}
                className="text-xs"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Vendor Banner if Vendor is Selected (Level 2 Active) */}
        {selectedVendorId && currentVendor && (
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white mb-10 shadow-2xl relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 border border-white/20 overflow-hidden flex-shrink-0 relative shadow-lg">
                  <img
                    src={getImageUrl(currentVendor.foto, 'space')}
                    alt={currentVendor.nama_coworking}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Verified Coworking Partner
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
                    {currentVendor.nama_coworking}
                  </h2>
                  <p className="text-sm text-slate-300 mt-1 flex flex-wrap items-center gap-4">
                    <span>👤 Pemilik: <strong className="text-white">{currentVendor.nama_pemilik}</strong></span>
                    {currentVendor.telp && currentVendor.telp !== '-' && (
                      <span>📞 Telp: <strong className="text-white">{currentVendor.telp}</strong></span>
                    )}
                    <span>🚪 Total Unit: <strong className="text-indigo-300">{currentVendor.spaces.length} Ruangan</strong></span>
                  </p>
                </div>
              </div>

              <Button
                variant="secondary"
                onClick={() => setSelectedVendorId(null)}
                className="w-full md:w-auto shadow-md"
              >
                ← Pilih Coworking Space Lain
              </Button>
            </div>
          </div>
        )}

        {/* Dynamic Display Area */}
        {spacesLoading ? (
          <div className="text-center py-24">
            <svg className="animate-spin mx-auto h-12 w-12 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-slate-500 font-medium">Memuat data penyewa & ruangan...</p>
          </div>
        ) : !selectedVendorId && activeTab === 'vendors' ? (
          /* LEVEL 1: LIST OF COWORKING SPACES / VENDORS */
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>🏢 Penyedia Coworking Space</span>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-full">
                  {filteredVendors.length} Lokasi
                </span>
              </h3>
            </div>

            {filteredVendors.length > 0 ? (
              <Grid cols={3} className="gap-6">
                {filteredVendors.map((vendor) => (
                  <Card key={vendor.id} className="flex flex-col p-0 overflow-hidden group hover:shadow-2xl transition-all duration-300 border-slate-200/80 dark:border-slate-800">
                    {/* Cover Photo */}
                    <div className="relative w-full aspect-[16/10] bg-slate-900 overflow-hidden">
                      <img
                        src={getImageUrl(vendor.foto, 'space')}
                        alt={vendor.nama_coworking}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      
                      <div className="absolute top-3 left-3">
                        <span className="bg-indigo-600/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md border border-indigo-400/30">
                          {vendor.spaces.length} Unit Ruangan
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h4 className="text-lg font-extrabold font-heading drop-shadow-md">
                          {vendor.nama_coworking}
                        </h4>
                        <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                          <span>👤 {vendor.nama_pemilik}</span>
                          {vendor.telp && vendor.telp !== '-' && (
                            <span>• 📞 {vendor.telp}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1 bg-white dark:bg-slate-900">
                      {/* Space Types Badges */}
                      <div className="mb-4">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Fasilitas Unit Available:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.from(vendor.typesSet).map((t, idx) => (
                            <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Button
                          className="w-full justify-between group-hover:bg-indigo-600 group-hover:text-white transition-colors"
                          onClick={() => {
                            setSelectedVendorId(vendor.id);
                            setActiveTab('vendors');
                          }}
                        >
                          <span>Lihat Ruangan ({vendor.spaces.length})</span>
                          <span>→</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </Grid>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <p className="text-slate-500 font-medium">Tidak ada Coworking Space yang cocok dengan pencarian Anda.</p>
              </div>
            )}
          </div>
        ) : (
          /* LEVEL 2: SPACES GRID (Selected Vendor or All Spaces View) */
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>🚪 Unit Ruangan {selectedVendorId ? `di ${currentVendor?.nama_coworking}` : 'Tersedia'}</span>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-full">
                  {filteredSpaces.length} Unit
                </span>
              </h3>
            </div>

            {filteredSpaces.length > 0 ? (
              <Grid cols={3} className="gap-6">
                {filteredSpaces.map((space: any) => (
                  <Card key={space.id} className="flex flex-col p-0 overflow-hidden group hover:shadow-2xl transition-all duration-300 border-slate-200/80 dark:border-slate-800">
                    {/* Image with Badges */}
                    <div className="relative w-full aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img
                        src={getImageUrl(space.foto_url || space.foto, 'space')}
                        alt={space.nama_space}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                      
                      {/* Floating Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-indigo-600 dark:text-indigo-400 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                          {space.tipe_space}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3">
                        <span className="bg-slate-900/80 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                          {space.kapasitas} org
                        </span>
                      </div>

                      {/* Space Owner Badge if viewing all spaces */}
                      {!selectedVendorId && (space.owner?.nama_coworking || space.owner?.nama_pemilik) && (
                        <div className="absolute bottom-3 left-3 right-3">
                          <span className="bg-slate-950/80 backdrop-blur-md text-slate-200 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5 truncate">
                            <span>🏢</span>
                            <span className="truncate">{space.owner?.nama_coworking || space.owner?.nama_pemilik}</span>
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1 bg-white dark:bg-slate-900">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-1 font-heading group-hover:text-indigo-600 transition-colors">
                          {space.nama_space}
                        </h3>
                        <p className="text-2xl font-black text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
                          {formatCurrency(space.harga_per_jam)}<span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">/jam</span>
                        </p>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                        {space.deskripsi || 'Fasilitas ruang kerja nyaman dengan akses internet cepat dan lingkungan produktif.'}
                      </p>

                      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                        <Link href={`/spaces/${space.id}`} className="flex-1">
                          <Button variant="outline" className="w-full text-xs">
                            Detail
                          </Button>
                        </Link>
                        <Link href={`/booking/${space.id}`} className="flex-1">
                          <Button className="w-full text-xs shadow-md shadow-indigo-500/20">
                            Pesan Now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </Grid>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <p className="text-slate-500 font-medium">Tidak ada ruangan yang sesuai dengan filter pilihan Anda.</p>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}

export default function SpacesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center py-20">
          <div className="text-center">
            <svg className="animate-spin mx-auto h-10 w-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-slate-500 font-medium">Memuat katalog...</p>
          </div>
        </div>
      }
    >
      <SpacesContent />
    </Suspense>
  );
}
