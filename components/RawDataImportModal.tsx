/**
 * Raw Data Import Modal Component
 * For pasting raw payment data and transforming it to ticket format
 */

import { useState } from 'react';

interface RawDataRow {
  payment_page_id: string;
  payment_page_title: string;
  payment_date: string;
  order_id: string;
  item_name: string;
  item_amount: string;
  item_quantity: string;
  item_payment_amount: string;
  total_payment_amount: string;
  currency: string;
  payment_status: string;
  payment_id: string;
  name: string;
  email: string;
  phone: string;
}

interface ProcessedTicket {
  ticket_id: string;
  payment_id: string;
  name: string;
  email: string;
  phone: string;
  ticket_type: string;
  price: number;
  raw_data: RawDataRow;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tickets: ProcessedTicket[]) => void;
}

export default function RawDataImportModal({ isOpen, onClose, onConfirm }: Props) {
  const [rawInput, setRawInput] = useState('');
  const [processedTickets, setProcessedTickets] = useState<ProcessedTicket[]>([]);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  if (!isOpen) return null;

  const parseRawData = () => {
    try {
      setError('');
      const lines = rawInput.trim().split('\n');
      
      if (lines.length === 0) {
        setError('No data provided');
        return;
      }

      const tickets: ProcessedTicket[] = [];
      const processedOrderIds = new Set<string>(); // Track unique order_ids only
      let headerSkipped = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Split by tab or multiple spaces
        const columns = line.split(/\t+|\s{2,}/).map(col => col.trim());

        // Skip header row (more precise detection - check if it's actually a header)
        if (!headerSkipped && i === 0) {
          // Only skip first row if it contains multiple header-like keywords
          const col3Lower = columns[3]?.toLowerCase() || '';
          const col11Lower = columns[11]?.toLowerCase() || '';
          const col12Lower = columns[12]?.toLowerCase() || '';
          const col13Lower = columns[13]?.toLowerCase() || '';
          
          // Check if it looks like a header (contains exact header terms)
          const isLikelyHeader = (
            (col3Lower === 'order_id' || col3Lower === 'order id' || col3Lower === 'orderid') &&
            (col11Lower === 'payment_id' || col11Lower === 'payment id' || col11Lower === 'paymentid') &&
            (col12Lower === 'name' || col12Lower === 'customer name') &&
            (col13Lower === 'email' || col13Lower === 'email id' || col13Lower === 'emailid')
          );
          
          if (isLikelyHeader) {
            headerSkipped = true;
            console.log('Header row detected and skipped');
            continue;
          }
        }

        // Ensure we have enough columns (15 fields)
        if (columns.length < 15) {
          console.warn(`Row ${i + 1} has only ${columns.length} columns, skipping:`, line);
          continue;
        }

        const rawRow: RawDataRow = {
          payment_page_id: columns[0] || '',
          payment_page_title: columns[1] || '',
          payment_date: columns[2] || '',
          order_id: columns[3] || '',
          item_name: columns[4] || '',
          item_amount: columns[5] || '',
          item_quantity: columns[6] || '',
          item_payment_amount: columns[7] || '',
          total_payment_amount: columns[8] || '',
          currency: columns[9] || '',
          payment_status: columns[10] || '',
          payment_id: columns[11] || '',
          name: columns[12] || '',
          email: columns[13] || '',
          phone: columns[14] || '',
        };

        // Skip if essential fields are missing
        if (!rawRow.order_id || !rawRow.payment_id || !rawRow.email) {
          console.warn(`Row ${i + 1} missing essential fields, skipping`);
          continue;
        }

        // Check for duplicate order_id ONLY (other fields can be duplicate)
        if (processedOrderIds.has(rawRow.order_id)) {
          console.warn(`Row ${i + 1} has duplicate order_id (${rawRow.order_id}), skipping`);
          continue;
        }

        // Mark this order_id as processed
        processedOrderIds.add(rawRow.order_id);

        // Transform to ticket format
        const ticket: ProcessedTicket = {
          ticket_id: rawRow.order_id,
          payment_id: rawRow.payment_id,
          name: rawRow.name || 'Unknown',
          email: rawRow.email,
          phone: rawRow.phone || '',
          ticket_type: `${rawRow.item_name} - ${rawRow.item_quantity} unit${parseInt(rawRow.item_quantity) > 1 ? 's' : ''}`,
          price: parseFloat(rawRow.total_payment_amount) || 0,
          raw_data: rawRow,
        };

        tickets.push(ticket);
      }

      if (tickets.length === 0) {
        setError('No valid ticket data found. Please check the format.');
        return;
      }

      setProcessedTickets(tickets);
      setShowPreview(true);
    } catch (err: any) {
      setError(`Error parsing data: ${err.message}`);
    }
  };

  const handleConfirm = () => {
    onConfirm(processedTickets);
    handleClose();
  };

  const handleClose = () => {
    setRawInput('');
    setProcessedTickets([]);
    setError('');
    setShowPreview(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {showPreview ? 'Preview Processed Data' : 'Paste Raw Payment Data'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {!showPreview ? (
            <>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Paste payment data with the following fields (tab or space-separated):
                </p>
                <div className="bg-gray-50 p-3 rounded text-xs font-mono text-gray-700 mb-4">
                  payment page id | payment page title | payment date | order_id | item name | item amount | 
                  item quantity | item payment amount | total payment amount | currency | payment status | 
                  payment id | name | email | phone
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  💡 Tip: Copy directly from Excel/Sheets (data rows only). If you include a header row, make sure it has exact column names like "order_id", "payment_id", "name", "email" - otherwise paste data rows only.
                </p>
              </div>

              <textarea
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder="Paste your payment data here (one row per line)..."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              />

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold">
                  ✅ Successfully processed {processedTickets.length} ticket{processedTickets.length > 1 ? 's' : ''}
                </p>
                <p className="text-green-700 text-sm mt-1">
                  Review the data below and click "Confirm & Upload" to proceed.
                </p>
                <p className="text-green-600 text-xs mt-2">
                  💡 Note: Only Order ID (Ticket ID) must be unique. Same person can have multiple tickets with different Order IDs.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Ticket ID</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Payment ID</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Phone</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Ticket Type</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {processedTickets.map((ticket, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap font-mono text-xs text-gray-900">{ticket.ticket_id}</td>
                        <td className="px-3 py-2 whitespace-nowrap font-mono text-xs text-gray-900">{ticket.payment_id}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-900">{ticket.name}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">{ticket.email}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">{ticket.phone}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-900">{ticket.ticket_type}</td>
                        <td className="px-3 py-2 whitespace-nowrap font-semibold text-green-700">
                          {ticket.raw_data.currency} {ticket.price.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
                <strong>Next Steps:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Data will be inserted into the database</li>
                  <li>QR codes will be generated for each ticket</li>
                  <li>Emails will be sent to each recipient</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          {!showPreview ? (
            <button
              onClick={parseRawData}
              disabled={!rawInput.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Process Data
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Confirm & Upload ({processedTickets.length} tickets)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

