/**
 * Main Scanner Page
 */

import { useState } from 'react';
import Head from 'next/head';
import QRScanner from '@/components/QRScanner';
import TicketDisplay from '@/components/TicketDisplay';
import Modal from '@/components/Modal';
import { TicketRecord, VerifyResponse } from '@/lib/types';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [ticket, setTicket] = useState<TicketRecord | null>(null);
  const [status, setStatus] = useState<'valid' | 'used' | 'invalid' | null>(null);
  const [isMarking, setIsMarking] = useState(false);
  
  // Modal states
  const [showInvalidModal, setShowInvalidModal] = useState(false);
  const [invalidMessage, setInvalidMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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
        if (data.status === 'valid' || data.status === 'used') {
          setStatus(data.status);
        } else if (data.status === 'invalid') {
          // Show invalid tickets as popup, not as card
          setInvalidMessage(data.message || 'Invalid ticket');
          setShowInvalidModal(true);
          // Don't set ticket/status so scanner stays visible
        }
      } else {
        // Generic error - also show as popup
        setInvalidMessage(data.message);
        setShowInvalidModal(true);
      }
    } catch (err: any) {
      console.error('Error verifying QR code:', err);
      setError('Failed to verify QR code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkEntryRequest = () => {
    // Show confirmation dialog before marking
    setShowConfirmModal(true);
  };

  const handleMarkEntryConfirmed = async () => {
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
      } else {
        setError(data.message);
        setInvalidMessage(data.message);
        setShowInvalidModal(true);
      }
    } catch (err: any) {
      console.error('Error marking entry:', err);
      setError('Failed to mark entry. Please try again.');
      setInvalidMessage('Failed to mark entry. Please try again.');
      setShowInvalidModal(true);
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

  const handleCloseInvalidModal = () => {
    setShowInvalidModal(false);
    setInvalidMessage('');
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

          {/* Invalid QR Modal */}
          <Modal
            isOpen={showInvalidModal}
            onClose={handleCloseInvalidModal}
            title="Invalid Ticket"
            message={invalidMessage}
            type="error"
            confirmText="Close"
          />

          {/* Confirmation Modal */}
          <Modal
            isOpen={showConfirmModal}
            onClose={() => setShowConfirmModal(false)}
            title="Confirm Entry"
            message={`Mark entry for ${ticket?.name}?`}
            type="confirm"
            onConfirm={handleMarkEntryConfirmed}
            confirmText="Yes, Mark Entry"
            cancelText="Cancel"
          />

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
                onMarkEntry={status === 'valid' ? handleMarkEntryRequest : undefined}
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

