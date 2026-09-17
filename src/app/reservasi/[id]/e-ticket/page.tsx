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
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printRef.current && printWindow) {
      const printContent = printRef.current.innerHTML;
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
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
    <div className="min-h-screen py-8 bg-gradient-to-br from-indigo-50 to-blue-100">
      <Container className="max-w-2xl">
        {/* Controls */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <Button onClick={handlePrint}>Print E-Ticket</Button>
          <Button variant="secondary" onClick={handleDownload}>
            Download QR Code
          </Button>
          <Link href={`/reservasi/${reservationId}`} className="ml-auto">
            <Button variant="outline">Kembali</Button>
          </Link>
        </div>

        {/* E-Ticket */}
        <div ref={printRef} className="bg-white p-8 rounded-2xl shadow-2xl border border-indigo-100">
          {/* Header */}
          <div className="text-center mb-8 pb-6 border-b-2 border-indigo-600">
            <div className="inline-block w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-3 text-white font-black text-2xl shadow-md">
              S
            </div>
            <h1 className="text-3xl font-extrabold text-indigo-600 tracking-tight">SPACESYNC</h1>
            <p className="text-slate-500 text-sm font-medium">Smart Coworking Space Reservation System</p>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <div className="inline-block bg-indigo-100 text-indigo-800 px-6 py-2 rounded-full font-bold text-sm tracking-wide">
              E-TICKET / BUKTI RESERVASI
            </div>
            <p className="text-slate-600 text-xs mt-3">
              Tunjukkan bukti reservasi ini saat check-in di lokasi coworking space
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Left - Info */}
            <div className="space-y-4">
              <div>
                <p className="text-slate-500 text-xs font-semibold mb-1">KODE RESERVASI</p>
                <p className="font-mono text-xl font-bold text-indigo-600 break-all">
                  #RES-{reservation.id}
                </p>
              </div>

              <div>
                <p className="text-slate-500 text-xs font-semibold mb-1">RUANGAN</p>
                <p className="text-lg font-bold text-slate-900">
                  {spaceObj?.nama_space || reservation.nama_space || 'Ruangan Coworking'}
                </p>
                <p className="text-xs text-slate-500 capitalize">{spaceObj?.tipe_space || spaceObj?.tipe || 'Coworking Space'}</p>
              </div>

              <div>
                <p className="text-slate-500 text-xs font-semibold mb-1">ATAS NAMA</p>
                <p className="text-lg font-bold text-slate-900">
                  {reservation.member?.nama_member || 'Member SpaceSync'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <p className="text-slate-500 text-xs font-semibold mb-1">TANGGAL</p>
                  <p className="font-bold text-slate-900 text-sm">
                    {formatDate(reservation.tanggal_reservasi)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {getDayName(reservation.tanggal_reservasi)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-semibold mb-1">JAM MULAI</p>
                  <p className="font-bold text-slate-900 text-sm">{reservation.jam_mulai || '10:00'} WIB</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500 text-xs font-semibold mb-1">DURASI</p>
                  <p className="font-bold text-slate-900 text-sm">{reservation.durasi_jam || 1} jam</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-semibold mb-1">TOTAL BIAYA</p>
                  <p className="font-bold text-emerald-600 text-sm font-sans">
                    {formatCurrency(totalBiaya)}
                  </p>
                </div>
              </div>
            </div>

            {/* Right - QR Code */}
            <div className="flex flex-col items-center justify-center bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <QRCodeSVG
                  value={JSON.stringify({
                    id: reservation.id,
                    space: spaceObj?.nama_space || reservation.nama_space,
                    date: reservation.tanggal_reservasi,
                    time: reservation.jam_mulai,
                    member: reservation.member?.nama_member,
                  })}
                  size={180}
                  level="H"
                  includeMargin
                />
              </div>
              <p className="text-center text-xs font-semibold text-slate-600 mt-4">
                Scan QR code untuk check-in di lokasi
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-slate-200">
            <div className="grid md:grid-cols-3 gap-4 text-xs text-slate-600 mb-6">
              <div>
                <p className="font-bold text-slate-900 mb-1">LOKASI</p>
                <p className="font-medium text-slate-800">{reservation.owner?.nama_coworking || spaceObj?.coworking_space?.nama_coworking || 'SpaceSync Partner'}</p>
                <p className="text-[11px] text-slate-500">
                  {reservation.owner?.alamat || spaceObj?.coworking_space?.alamat || 'Lokasi Coworking'}
                </p>
              </div>
              <div>
                <p className="font-bold text-slate-900 mb-1">TELEPON</p>
                <p className="font-medium text-slate-800">{reservation.owner?.telp || spaceObj?.coworking_space?.no_telepon || '-'}</p>
              </div>
              <div>
                <p className="font-bold text-slate-900 mb-1">STATUS</p>
                <p className="font-bold text-indigo-600">{statusLabel}</p>
              </div>
            </div>

            <div className="bg-indigo-50/70 p-4 rounded-xl text-xs text-slate-700 border border-indigo-100">
              <p className="font-bold text-indigo-900 mb-1.5">Catatan Penting:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>Harap datang 15 menit sebelum jam yang dijadwalkan</li>
                <li>Tunjukkan e-ticket QR ini kepada admin saat check-in</li>
                <li>Pembatalan hanya dapat dilakukan jika belum dikonfirmasi admin</li>
              </ul>
            </div>

            <p className="text-center text-[11px] text-slate-400 mt-6">
              Generated by SpaceSync System • {new Date().toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        {/* Non-Print Actions */}
        <div className="flex gap-3 mt-6 flex-wrap">
          <Button onClick={handlePrint}>Print E-Ticket</Button>
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
