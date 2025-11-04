/**
 * Main Scanner Page
 */

import { useState } from 'react';
import Head from 'next/head';
import QRScanner from '@/components/QRScanner';
import TicketDisplay from '@/components/TicketDisplay';
import { TicketRecord, VerifyResponse } from '@/lib/types';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [ticket, setTicket] = useState<TicketRecord | null>(null);
  const [status, setStatus] = useState<'valid' | 'used' | 'invalid' | null>(null);
  const [isMarking, setIsMarking] = useState(false);

  const handleScanSuccess = async (decodedText: string) => {
    setIsLoading(true);
    setError('');
    setTicket(null);
    setStatus(null);

    try {
      // Call API to verify QR code
      const response = await fetch('/api/verify-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          encryptedData: decodedText,
        }),
      });

      const data: VerifyResponse = await response.json();

      if (data.ticket) {
        setTicket(data.ticket);
        // Only set status if it's a displayable status (not 'error')
        if (data.status === 'valid' || data.status === 'used' || data.status === 'invalid') {
          setStatus(data.status);
        }
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      console.error('Error verifying QR code:', err);
      setError('Failed to verify QR code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkEntry = async () => {
    if (!ticket) return;

    setIsMarking(true);
    setError('');

    try {
      const response = await fetch('/api/mark-used', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_id: ticket.payment_id,
        }),
      });

      const data = await response.json();

      if (data.success && data.ticket) {
        setTicket(data.ticket);
        setStatus('used');
        alert('✅ Entry marked successfully!');
      } else {
        setError(data.message);
        alert('❌ ' + data.message);
      }
    } catch (err: any) {
      console.error('Error marking entry:', err);
      setError('Failed to mark entry. Please try again.');
      alert('❌ Failed to mark entry');
    } finally {
      setIsMarking(false);
    }
  };

  const handleScanError = (errorMsg: string) => {
    setError(errorMsg);
  };

  const handleReset = () => {
    setTicket(null);
    setStatus(null);
    setError('');
  };

  return (
    <>
      <Head>
        <title>QR Ticket Scanner</title>
        <meta name="description" content="Scan and verify ticket QR codes" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              🎫 QR Ticket Scanner
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Scan QR codes to verify and validate tickets
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900 dark:border-red-600 dark:text-red-200">
              <p className="font-semibold">❌ Error</p>
              <p>{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg dark:bg-blue-900 dark:border-blue-600 dark:text-blue-200 text-center">
              <p className="font-semibold">🔍 Verifying QR code...</p>
            </div>
          )}

          {/* Main Content */}
          {!ticket ? (
            <QRScanner
              onScanSuccess={handleScanSuccess}
              onScanError={handleScanError}
            />
          ) : (
            <div className="space-y-4">
              <TicketDisplay
                ticket={ticket}
                status={status || 'invalid'}
                onMarkEntry={status === 'valid' ? handleMarkEntry : undefined}
                isMarking={isMarking}
              />
              
              <button
                onClick={handleReset}
                className="w-full max-w-md mx-auto block bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Scan Another Ticket
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Secure ticket validation system with encrypted QR codes</p>
          </div>
        </div>
      </main>
    </>
  );
}

