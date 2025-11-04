/**
 * QR Generator & Email Sender Admin Page
 * Reads from SharePoint Excel and sends QR codes via email
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import DataImportModal from '@/components/DataImportModal';

interface SheetRow {
  payment_id: string;
  name: string;
  email: string;
  type: string;
  amount?: number;
  qr_generated: boolean;
  email_sent: boolean;
}

export default function QRGenerator() {
  const [data, setData] = useState<SheetRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({ total: 0, generated: 0, pending: 0 });
  const [showImportModal, setShowImportModal] = useState(false);

  // Fetch sheet data on component mount
  useEffect(() => {
    fetchSheetData();
  }, []);

  const fetchSheetData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/fetch-sheet');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        calculateStats(result.data);
      } else {
        setError(result.message || 'Failed to fetch sheet data');
      }
    } catch (err: any) {
      console.error('Error fetching sheet:', err);
      setError('Failed to fetch sheet data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (rows: SheetRow[]) => {
    const total = rows.length;
    const generated = rows.filter(r => r.qr_generated && r.email_sent).length;
    const pending = rows.filter(r => !r.qr_generated || !r.email_sent).length;
    setStats({ total, generated, pending });
  };

  const handleGenerateAndSend = async () => {
    if (!confirm(`Generate QR codes and send emails for ${stats.pending} pending entries?`)) {
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/generate-and-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`✅ Successfully processed ${result.processed} entries!`);
        // Refresh data
        await fetchSheetData();
      } else {
        setError(result.message || 'Failed to generate and send');
      }
    } catch (err: any) {
      console.error('Error generating and sending:', err);
      setError('Failed to process. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusBadge = (generated: boolean, sent: boolean) => {
    if (generated && sent) {
      return <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">✅ Sent</span>;
    } else if (generated && !sent) {
      return <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800">⚠️ Generated</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800">❌ Pending</span>;
    }
  };

  return (
    <>
      <Head>
        <title>QR Generator & Email Sender</title>
        <meta name="description" content="Generate and send QR codes to ticket holders" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen p-4 sm:p-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              🎫 QR Code Generator & Email Sender
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Generate QR codes and send them to ticket holders via email
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Entries</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Generated & Sent</div>
              <div className="text-3xl font-bold text-green-600 mt-2">{stats.generated}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</div>
              <div className="text-3xl font-bold text-red-600 mt-2">{stats.pending}</div>
            </div>
          </div>

          {/* Import Data Modal */}
          <DataImportModal
            isOpen={showImportModal}
            onClose={() => setShowImportModal(false)}
            onUploadComplete={() => {
              setSuccess('Data uploaded successfully!');
              fetchSheetData();
            }}
          />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              📋 Paste Data
            </button>
            <button
              onClick={fetchSheetData}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {isLoading ? '🔄 Loading...' : '🔄 Refresh Data'}
            </button>
            <button
              onClick={handleGenerateAndSend}
              disabled={isGenerating || stats.pending === 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {isGenerating ? '⏳ Processing...' : `✉️ Generate & Send (${stats.pending})`}
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <p className="font-semibold">❌ Error</p>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              <p className="font-semibold">✅ Success</p>
              <p>{success}</p>
            </div>
          )}

          {/* Data Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Payment ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        Loading data...
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    data.map((row: any, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {row.payment_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {row.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {row.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                            {row.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">
                          ₹{row.amount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {getStatusBadge(row.qr_generated, row.email_sent)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Data syncs from SharePoint Excel • QR codes sent via Gmail</p>
          </div>
        </div>
      </main>
    </>
  );
}

