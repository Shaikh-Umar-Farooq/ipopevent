/**
 * Promotional Email Modal
 * Send promotional emails with embedded image to multiple recipients
 */

import { useState } from 'react';

interface PromoEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PromoEmailModal({ isOpen, onClose }: PromoEmailModalProps) {
  const [emailInput, setEmailInput] = useState<string>('');
  const [emails, setEmails] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [progress, setProgress] = useState({ sent: 0, total: 0 });

  const handleAddEmails = () => {
    setError('');
    
    // Split by comma, newline, or semicolon
    const newEmails = emailInput
      .split(/[,;\n]/)
      .map(e => e.trim())
      .filter(e => e.length > 0);

    // Validate emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = newEmails.filter(e => emailRegex.test(e));
    const invalidEmails = newEmails.filter(e => !emailRegex.test(e));

    if (invalidEmails.length > 0) {
      setError(`Invalid emails: ${invalidEmails.join(', ')}`);
      return;
    }

    // Add unique emails
    const combinedEmails = emails.concat(validEmails);
    const uniqueEmails = Array.from(new Set(combinedEmails));
    setEmails(uniqueEmails);
    setEmailInput('');
    setSuccess(`Added ${validEmails.length} email(s)`);
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleRemoveEmail = (index: number) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (emails.length === 0) {
      setError('Please add at least one email address');
      return;
    }

    if (!confirm(`Send promotional email to ${emails.length} recipient(s)?`)) {
      return;
    }

    setIsSending(true);
    setError('');
    setSuccess('');
    setProgress({ sent: 0, total: emails.length });

    try {
      const response = await fetch('/api/send-promo-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`✅ Successfully sent to ${result.sent} out of ${result.total} recipients!`);
        setEmails([]);
        setProgress({ sent: result.sent, total: result.total });
        
        setTimeout(() => {
          handleClose();
        }, 3000);
      } else {
        setError(result.message || 'Failed to send emails');
      }
    } catch (err: any) {
      console.error('Error sending promo emails:', err);
      setError('Failed to send emails. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    if (!isSending) {
      setEmailInput('');
      setEmails([]);
      setError('');
      setSuccess('');
      setProgress({ sent: 0, total: 0 });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            📧 Send Promotional Email
          </h2>
          <button
            onClick={handleClose}
            disabled={isSending}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter Email Addresses
            </label>
            <textarea
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter emails separated by comma, semicolon, or new line&#10;example@email.com, another@email.com"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              rows={4}
              disabled={isSending}
            />
            <button
              onClick={handleAddEmails}
              disabled={!emailInput.trim() || isSending}
              className="mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              ➕ Add Emails
            </button>
          </div>

          {/* Email List */}
          {emails.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recipients ({emails.length})
              </h3>
              <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                {emails.map((email, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded mb-1"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">{email}</span>
                    <button
                      onClick={() => handleRemoveEmail(index)}
                      disabled={isSending}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress */}
          {isSending && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Sending... {progress.sent} / {progress.total}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round((progress.sent / progress.total) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.sent / progress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
              ℹ️ Email Preview
            </h3>
            <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
              <li>• Subject: i-Popstar Live - Special Announcement</li>
              <li>• Content: Promotional image (embedded)</li>
              <li>• Sent from: ticketing@ruskmedia.com</li>
              <li>• Compatible with Gmail, Outlook, and all major email clients</li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isSending}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={isSending || emails.length === 0}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {isSending ? '⏳ Sending...' : `📧 Send to ${emails.length} Recipient${emails.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

