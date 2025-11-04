/**
 * QR Scanner Component
 * Uses html5-qrcode library for camera scanning
 */

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

export default function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef<boolean>(false);
  const qrCodeRegionId = 'qr-reader';

  // Get available cameras on component mount
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCameras(devices);
          // Prefer back camera (environment facing)
          const backCamera = devices.find((device) =>
            device.label.toLowerCase().includes('back') ||
            device.label.toLowerCase().includes('environment')
          );
          setSelectedCamera(backCamera?.id || devices[0].id);
        }
      })
      .catch((err) => {
        console.error('Error getting cameras:', err);
        onScanError?.('Unable to access camera');
      });
  }, [onScanError]);

  const startScanning = async () => {
    if (!selectedCamera) {
      onScanError?.('No camera selected');
      return;
    }

    // Reset the processing flag when starting a new scan
    isProcessingRef.current = false;

    try {
      scannerRef.current = new Html5Qrcode(qrCodeRegionId);
      
      await scannerRef.current.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Success callback - prevent multiple rapid scans
          if (isProcessingRef.current) {
            return; // Already processing a scan, ignore this one
          }
          
          isProcessingRef.current = true;
          onScanSuccess(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          // Error callback (optional - fires frequently while scanning)
          // console.log('Scanning...', errorMessage);
        }
      );
      
      setIsScanning(true);
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      onScanError?.(err.message || 'Failed to start scanner');
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err: any) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      stopScanning();
      // Reset processing flag on unmount so it's ready for next mount
      isProcessingRef.current = false;
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Camera Selection */}
      {cameras.length > 1 && !isScanning && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Camera
          </label>
          <select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.label || `Camera ${camera.id}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* QR Scanner Region */}
      <div
        id={qrCodeRegionId}
        className="border-2 border-gray-300 rounded-lg overflow-hidden"
      ></div>

      {/* Control Buttons */}
      <div className="mt-4 flex gap-3">
        {!isScanning ? (
          <button
            onClick={startScanning}
            disabled={!selectedCamera}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Start Scanning
          </button>
        ) : (
          <button
            onClick={stopScanning}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Stop Scanning
          </button>
        )}
      </div>

      {/* Instructions */}
      {!isScanning && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
          Click "Start Scanning" and point your camera at the QR code
        </p>
      )}
    </div>
  );
}

