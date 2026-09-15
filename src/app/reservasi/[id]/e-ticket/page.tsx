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
import { formatDate, formatCurrency, getDayName } from '@/lib/utils';

export default function ETicketPage() {
  const params = useParams();
  const reservationId = params.id as string;
  const { isAuthenticated } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);

  const { data: reservation, isLoading } = useApi(
    () => apiClient.getReservationDetail(reservationId),
    isAuthenticated
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
          <div className="text-center">
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

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-blue-50 to-blue-100">
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
        <div ref={printRef} className="bg-white p-8 rounded-xl shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8 pb-6 border-b-2 border-blue-600">
            <div className="inline-block w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <h1 className="text-3xl font-bold text-blue-600 mb-2">SPACESYNC</h1>
            <p className="text-gray-600">Smart Coworking Space Reservation</p>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <div className="inline-block bg-blue-100 text-blue-800 px-6 py-2 rounded-full font-bold mb-4">
              E-TICKET / BUKTI RESERVASI
            </div>
            <p className="text-gray-600 text-sm mt-4">
              Tunjukkan bukti reservasi ini saat check-in di lokasi
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Left - Info */}
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 text-xs font-semibold mb-1">KODE RESERVASI</p>
                <p className="font-mono text-lg font-bold text-blue-600 break-all">
                  {reservation.id}
                </p>
              </div>

              <div>
                <p className="text-gray-600 text-xs font-semibold mb-1">RUANGAN</p>
                <p className="text-lg font-bold text-gray-900">
                  {reservation.space?.nama_space}
                </p>
                <p className="text-sm text-gray-600">{reservation.space?.tipe_space}</p>
              </div>

              <div>
                <p className="text-gray-600 text-xs font-semibold mb-1">ATAS NAMA</p>
                <p className="text-lg font-bold text-gray-900">
                  {reservation.member?.nama_member}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-gray-600 text-xs font-semibold mb-1">TANGGAL</p>
                  <p className="font-bold text-gray-900">
                    {formatDate(reservation.tanggal_reservasi)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {getDayName(reservation.tanggal_reservasi)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs font-semibold mb-1">JAM MULAI</p>
                  <p className="font-bold text-gray-900">{reservation.jam_mulai}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-xs font-semibold mb-1">DURASI</p>
                  <p className="font-bold text-gray-900">{reservation.durasi_jam} jam</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs font-semibold mb-1">TOTAL HARGA</p>
                  <p className="font-bold text-green-600">
                    {formatCurrency(reservation.total_harga)}
                  </p>
                </div>
              </div>
            </div>

            {/* Right - QR Code */}
            <div className="flex flex-col items-center justify-center bg-gray-50 p-6 rounded-lg">
              <QRCodeSVG
                value={JSON.stringify({
                  id: reservation.id,
                  space: reservation.space?.nama_space,
                  date: reservation.tanggal_reservasi,
                  time: reservation.jam_mulai,
                  member: reservation.member?.nama_member,
                })}
                size={200}
                level="H"
                includeMargin
              />
              <p className="text-center text-xs text-gray-600 mt-4">
                Scan QR code untuk check-in
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-gray-200">
            <div className="grid md:grid-cols-3 gap-4 text-xs text-gray-600 mb-6">
              <div>
                <p className="font-semibold text-gray-900">LOKASI</p>
                <p>{reservation.space?.coworking_space?.nama_coworking}</p>
                <p className="text-xs">
                  {reservation.space?.coworking_space?.alamat}
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">TELEPON</p>
                <p>{reservation.space?.coworking_space?.no_telepon}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">STATUS</p>
                <p className="font-bold text-blue-600">{reservation.status}</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg text-xs text-gray-700">
              <p className="font-semibold mb-2">Catatan Penting:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Harap datang 15 menit sebelum jam yang dijadwalkan</li>
                <li>Tunjukkan e-ticket ini saat check-in</li>
                <li>Jika ada perubahan, hubungi admin space</li>
                <li>Pembatalan hanya dapat dilakukan sebelum waktu reservasi</li>
              </ul>
            </div>

            <p className="text-center text-xs text-gray-500 mt-6">
              Generated by SpaceSync • {new Date().toLocaleString('id-ID')}
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
