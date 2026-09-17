'use client';

import { useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/hooks';
import { apiClient } from '@/lib/api';
import { Container, Card } from '@/components/Layout';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { formatDate, formatCurrency, getDayName, formatStatusLabel, getReservationPrice, getReservationSpace } from '@/lib/utils';

export default function ETicketPage() {
  const params = useParams();
  const reservationId = params.id as string;
  const { isAuthenticated } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);

  const { data: reservation, isLoading } = useApi(
    () => apiClient.getReservationDetail(reservationId),
    isAuthenticated
  );

  // Invoke getETicket backend API endpoint
  useApi(
    () => apiClient.getETicket(reservationId),
    isAuthenticated && !!reservationId
  );

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const svgElement = document.querySelector('svg');
    if (svgElement) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const svg = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `e-ticket-${reservationId}.png`;
        link.click();
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <Container>
          <div className="text-center py-12">
            <p className="text-gray-600">Memuat e-ticket...</p>
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
              <p className="text-gray-600 mb-4">E-ticket tidak ditemukan</p>
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
  const totalBiaya = getReservationPrice(reservation);
  const statusLabel = formatStatusLabel(reservation.status);

  return (
    <div className="min-h-screen py-8 bg-slate-50 dark:bg-slate-900">
      <Container className="max-w-2xl">
        {/* Controls (Hidden on Print) */}
        <div className="no-print flex gap-3 mb-6 flex-wrap">
          <Button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Cetak / Download PDF
          </Button>
          <Button variant="secondary" onClick={handleDownload}>
            Download QR Code
          </Button>
          <Link href={`/reservasi/${reservationId}`} className="ml-auto">
            <Button variant="outline">Kembali</Button>
          </Link>
        </div>

        {/* E-Ticket Card Container */}
        <div ref={printRef} className="print-area bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200/80">
          {/* Header */}
          <div className="text-center mb-6 pb-5 border-b-2 border-indigo-600 flex items-center justify-between">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">
                S
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-indigo-600 tracking-tight leading-none">SPACESYNC</h1>
                <p className="text-slate-500 text-[11px] font-medium mt-0.5">Smart Coworking Space System</p>
              </div>
            </div>
            <div className="text-right">
              <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-bold text-xs tracking-wider uppercase inline-block">
                E-TICKET RESMI
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Left - Detail Info */}
            <div className="space-y-3.5">
              <div>
                <p className="text-slate-400 text-[10px] font-bold tracking-wider uppercase mb-0.5">KODE RESERVASI</p>
                <p className="font-mono text-lg font-bold text-indigo-600 break-all">
                  #RES-{reservation.id}
                </p>
              </div>

              <div>
                <p className="text-slate-400 text-[10px] font-bold tracking-wider uppercase mb-0.5">RUANGAN</p>
                <p className="text-base font-bold text-slate-900 leading-snug">
                  {spaceObj?.nama_space || reservation.nama_space || 'Ruangan Coworking'}
                </p>
                <p className="text-xs text-indigo-600 font-semibold capitalize">{spaceObj?.tipe_space || spaceObj?.tipe || 'Coworking Space'}</p>
              </div>

              <div>
                <p className="text-slate-400 text-[10px] font-bold tracking-wider uppercase mb-0.5">PEMESAN / PELANGGAN</p>
                <p className="text-base font-bold text-slate-900">
                  {reservation.member?.nama_member || 'Member SpaceSync'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <div>
                  <p className="text-slate-400 text-[10px] font-bold tracking-wider uppercase mb-0.5">TANGGAL</p>
                  <p className="font-bold text-slate-900 text-xs">
                    {formatDate(reservation.tanggal_reservasi)}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {getDayName(reservation.tanggal_reservasi)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold tracking-wider uppercase mb-0.5">JAM MULAI</p>
                  <p className="font-bold text-slate-900 text-xs">{reservation.jam_mulai || '10:00'} WIB</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-slate-400 text-[10px] font-bold tracking-wider uppercase mb-0.5">DURASI</p>
                  <p className="font-bold text-slate-900 text-xs">{reservation.durasi_jam || 1} jam</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold tracking-wider uppercase mb-0.5">TOTAL BIAYA</p>
                  <p className="font-extrabold text-emerald-600 text-xs font-sans">
                    {formatCurrency(totalBiaya)}
                  </p>
                </div>
              </div>
            </div>

            {/* Right - QR Code */}
            <div className="flex flex-col items-center justify-center bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                <QRCodeSVG
                  value={JSON.stringify({
                    id: reservation.id,
                    space: spaceObj?.nama_space || reservation.nama_space,
                    date: reservation.tanggal_reservasi,
                    time: reservation.jam_mulai,
                    member: reservation.member?.nama_member,
                  })}
                  size={150}
                  level="H"
                  includeMargin
                />
              </div>
              <p className="text-center text-[11px] font-semibold text-slate-600 mt-3">
                Scan QR code untuk check-in di lokasi
              </p>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="pt-4 border-t border-slate-200">
            <div className="grid grid-cols-3 gap-3 text-xs text-slate-600 mb-4">
              <div>
                <p className="font-bold text-slate-900 text-[11px] mb-0.5">LOKASI COWORKING</p>
                <p className="font-semibold text-slate-800 text-xs">{reservation.owner?.nama_coworking || spaceObj?.coworking_space?.nama_coworking || 'SpaceSync Partner'}</p>
                <p className="text-[10px] text-slate-500 line-clamp-2">
                  {reservation.owner?.alamat || spaceObj?.coworking_space?.alamat || 'Lokasi Coworking'}
                </p>
              </div>
              <div>
                <p className="font-bold text-slate-900 text-[11px] mb-0.5">KONTAK VENDOR</p>
                <p className="font-semibold text-slate-800 text-xs">{reservation.owner?.telp || spaceObj?.coworking_space?.no_telepon || '-'}</p>
              </div>
              <div>
                <p className="font-bold text-slate-900 text-[11px] mb-0.5">STATUS RESERVASI</p>
                <p className="font-extrabold text-indigo-600 text-xs">{statusLabel}</p>
              </div>
            </div>

            <div className="bg-indigo-50/70 p-3 rounded-xl text-[11px] text-slate-700 border border-indigo-100">
              <p className="font-bold text-indigo-900 mb-1">Catatan Check-In:</p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                <li>Harap datang 15 menit sebelum jadwal reservasi dimulai.</li>
                <li>Tunjukkan QR Code E-Ticket ini kepada petugas admin di lokasi.</li>
              </ul>
            </div>

            <p className="text-center text-[10px] text-slate-400 mt-4 font-mono">
              Generated by SpaceSync Ecosystem • {new Date().toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        {/* Non-Print Actions Footer (Hidden on Print) */}
        <div className="no-print flex gap-3 mt-6 flex-wrap">
          <Button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Cetak / Download PDF
          </Button>
          <Button variant="secondary" onClick={handleDownload}>
            Download QR Code
          </Button>
          <Link href={`/reservasi/${reservationId}`} className="ml-auto">
            <Button variant="outline">Kembali</Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
