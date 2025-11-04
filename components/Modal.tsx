/**
 * Modal Component
 * Reusable modal/popup for alerts and confirmations
 */

import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'error' | 'success' | 'warning' | 'info' | 'confirm';
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel'
}: ModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'error':
        return '❌';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'confirm':
        return '❓';
      default:
        return 'ℹ️';
    }
  };

  const getColors = () => {
    switch (type) {
      case 'error':
        return 'bg-red-100 border-red-500 text-red-900 dark:bg-red-900 dark:text-red-100';
      case 'success':
        return 'bg-green-100 border-green-500 text-green-900 dark:bg-green-900 dark:text-green-100';
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100';
      case 'confirm':
        return 'bg-blue-100 border-blue-500 text-blue-900 dark:bg-blue-900 dark:text-blue-100';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-900 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`relative w-full max-w-md transform overflow-hidden rounded-lg border-4 p-6 shadow-xl transition-all ${getColors()}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon and Title */}
          <div className="text-center mb-4">
            <div className="text-5xl mb-3">{getIcon()}</div>
            <h3 className="text-2xl font-bold">{title}</h3>
          </div>

          {/* Message */}
          <div className="text-center mb-6">
            <p className="text-lg">{message}</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {type === 'confirm' && onConfirm ? (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  {confirmText}
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="w-full bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                {confirmText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

