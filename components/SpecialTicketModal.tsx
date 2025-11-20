/**
 * Special Ticket Generation Modal
 * Generates QR codes for special tickets without email sending
 */

import { useState } from 'react';

interface SpecialTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (count: number, ticketType: string) => Promise<void>;
}

export default function SpecialTicketModal({
  isOpen,
  onClose,
  onGenerate
}: SpecialTicketModalProps) {
  const [ticketCount, setTicketCount] = useState<number>(1);
  const [ticketType, setTicketType] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const ticketTypes = [
    'Day 1 Single',
    'Day 2 Single',
    '2 Day Pass',
    'VIP Pass',
    'Media Pass',
    'Artist Pass',
    'Staff Pass',
    'Complimentary Pass',
    'Day 1 – Single Pass Complimentary',
    'Day 2 – Single Pass Complimentary',
    'Day 1 – VIP Pass Complimentary',
    'Day 2 – VIP Pass Complimentary'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!ticketType) {
      setError('Please select a ticket type');
      return;
    }

    if (ticketCount < 1 || ticketCount > 100) {
      setError('Please enter a valid number between 1 and 100');
      return;
    }

    setIsGenerating(true);
    try {
      await onGenerate(ticketCount, ticketType);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to generate tickets');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      setTicketCount(1);
      setTicketType('');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            🎟️ Generate Special Tickets
          </h2>
          <button
            onClick={handleClose}
            disabled={isGenerating}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Ticket Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ticket Type *
              </label>
              <select
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
                disabled={isGenerating}
              >
                <option value="">Select a ticket type...</option>
                {ticketTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Ticket Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Number of Tickets *
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={ticketCount}
                onChange={(e) => setTicketCount(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
                disabled={isGenerating}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Maximum 100 tickets per batch
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                ℹ️ Special Ticket Details
              </h3>
              <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                <li>• Unique payment IDs generated automatically</li>
                <li>• Name, email, phone set to "***"</li>
                <li>• QR codes saved to folder: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">qr-codes/{'{ticket-type}'}</code></li>
                <li>• No emails will be sent</li>
                <li>• QR codes can be downloaded as ZIP</li>
              </ul>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isGenerating}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating || !ticketType || ticketCount < 1}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {isGenerating ? '⏳ Generating...' : `🎫 Generate ${ticketCount} Ticket${ticketCount > 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

