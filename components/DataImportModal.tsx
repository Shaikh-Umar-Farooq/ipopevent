/**
 * Data Import Modal Component
 * Allows pasting Excel/SharePoint data and uploading to MongoDB
 */

import { useState } from 'react';

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
}

interface ParsedRow {
  payment_id: string;
  name: string;
  email: string;
  type: string;
  amount: number;
}

export default function DataImportModal({ isOpen, onClose, onUploadComplete }: DataImportModalProps) {
  const [pastedData, setPastedData] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData('text');
    setPastedData(text);
    parseData(text);
  };

  const parseData = (text: string) => {
    setError('');
    setParsedRows([]);

    if (!text.trim()) {
      return;
    }

    try {
      const lines = text.trim().split('\n');
      const rows: ParsedRow[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Split by tab (Excel copy) or comma (CSV)
        const cells = line.includes('\t') 
          ? line.split('\t') 
          : line.split(',');

        // Skip header row if it contains "payment" or "name"
        if (i === 0 && (
          cells[0].toLowerCase().includes('payment') ||
          cells[1].toLowerCase().includes('name')
        )) {
          continue;
        }

        if (cells.length >= 5) {
          const amount = parseFloat(cells[4].trim()) || 0;
          rows.push({
            payment_id: cells[0].trim(),
            name: cells[1].trim(),
            email: cells[2].trim(),
            type: cells[3].trim(),
            amount: amount
          });
        }
      }

      if (rows.length === 0) {
        setError('No valid data found. Please paste data with 5 columns: payment_id, name, email, type, amount');
        return;
      }

      setParsedRows(rows);
    } catch (err: any) {
      setError('Failed to parse data: ' + err.message);
    }
  };

  const handleUpload = async () => {
    if (parsedRows.length === 0) {
      setError('No data to upload');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/upload-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tickets: parsedRows }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`✅ Successfully uploaded ${parsedRows.length} tickets! (${result.inserted} new, ${result.updated} updated)`);
        setTimeout(() => {
          onUploadComplete();
          handleClose();
        }, 2000);
      } else {
        setError(result.message || 'Upload failed');
      }
    } catch (err: any) {
      setError('Failed to upload: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setPastedData('');
    setParsedRows([]);
    setError('');
    setSuccess('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative w-full max-w-4xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4">
            <h3 className="text-2xl font-bold text-white">📋 Import Ticket Data</h3>
            <p className="text-blue-100 text-sm mt-1">Copy and paste data from SharePoint Excel</p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <p className="font-semibold text-blue-900 dark:text-blue-100">📝 Instructions:</p>
              <ol className="list-decimal list-inside text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1">
                <li>Open your SharePoint Excel sheet</li>
                <li>Select the data (payment_id, name, email, type, amount columns)</li>
                <li>Copy (Ctrl+C or Cmd+C)</li>
                <li>Paste below (Ctrl+V or Cmd+V)</li>
                <li>Review the preview and click Upload</li>
              </ol>
            </div>

            {/* Paste Area */}
            {parsedRows.length === 0 ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Paste Data Here:
                </label>
                <textarea
                  value={pastedData}
                  onChange={(e) => {
                    setPastedData(e.target.value);
                    parseData(e.target.value);
                  }}
                  onPaste={handlePaste}
                  placeholder="Paste your Excel data here...&#10;&#10;Example:&#10;PAY-001    John Doe    john@example.com    VIP    150&#10;PAY-002    Jane Smith    jane@example.com    General    75"
                  className="w-full h-64 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white font-mono text-sm"
                />
              </div>
            ) : (
              /* Preview Table */
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Preview ({parsedRows.length} rows)
                  </label>
                  <button
                    onClick={() => {
                      setPastedData('');
                      setParsedRows([]);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    ← Paste Different Data
                  </button>
                </div>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">#</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Payment ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {parsedRows.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-2 text-sm text-gray-500">{index + 1}</td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{row.payment_id}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{row.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{row.email}</td>
                          <td className="px-4 py-2 text-sm">
                            <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                              {row.type}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm font-semibold text-green-600 dark:text-green-400">
                            ₹{row.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <p className="font-semibold">❌ Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                <p className="font-semibold">✅ Success</p>
                <p className="text-sm">{success}</p>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={parsedRows.length === 0 || isUploading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
            >
              {isUploading ? '⏳ Uploading...' : `📤 Upload ${parsedRows.length} Tickets`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

