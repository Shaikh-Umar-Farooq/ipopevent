/**
 * Ticket Display Component
 * Shows ticket details and verification status
 */

import { TicketRecord } from '@/lib/types';

interface TicketDisplayProps {
  ticket: TicketRecord;
  status: 'valid' | 'used' | 'invalid';
  onMarkEntry?: () => void;
  isMarking?: boolean;
}

export default function TicketDisplay({
  ticket,
  status,
  onMarkEntry,
  isMarking = false
}: TicketDisplayProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 border-green-500 dark:bg-green-900 dark:border-green-400';
      case 'used':
        return 'bg-yellow-100 border-yellow-500 dark:bg-yellow-900 dark:border-yellow-400';
      case 'invalid':
        return 'bg-red-100 border-red-500 dark:bg-red-900 dark:border-red-400';
      default:
        return 'bg-gray-100 border-gray-500 dark:bg-gray-800 dark:border-gray-400';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'valid':
        return '✅ VALID TICKET';
      case 'used':
        return '⚠️ ALREADY USED';
      case 'invalid':
        return '❌ INVALID TICKET';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'valid':
        return 'text-green-800 dark:text-green-200';
      case 'used':
        return 'text-yellow-800 dark:text-yellow-200';
      case 'invalid':
        return 'text-red-800 dark:text-red-200';
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto border-4 rounded-lg p-6 ${getStatusStyles()}`}>
      {/* Status Header */}
      <div className="text-center mb-6">
        <h2 className={`text-2xl font-bold ${getStatusColor()}`}>
          {getStatusText()}
        </h2>
      </div>

      {/* Ticket Type - Most Important */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-4 text-center border-2 border-gray-300 dark:border-gray-600">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
          TICKET TYPE
        </p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white uppercase tracking-wide">
          {ticket.ticket_type || 'Standard'}
        </p>
      </div>

      {/* Essential Details */}
      <div className="space-y-4 bg-white dark:bg-gray-800 rounded-lg p-5">
        <DetailRow label="Name" value={ticket.name} />
        <DetailRow label="Email" value={ticket.email} />
        <DetailRow label="Payment ID" value={ticket.payment_id} />
      </div>

      {/* Mark Entry Button (only show for valid tickets) */}
      {status === 'valid' && onMarkEntry && (
        <button
          onClick={onMarkEntry}
          disabled={isMarking}
          className="w-full mt-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 text-xl shadow-lg"
        >
          {isMarking ? 'Marking Entry...' : '✓ MARK ENTRY'}
        </button>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col space-y-1">
      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-lg font-medium text-gray-900 dark:text-gray-100 break-all">
        {value}
      </span>
    </div>
  );
}

