import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Alert, Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const QRScanner = ({ onScan, title = "Scan QR Code" }) => {
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const [scanned, setScanned] = useState(false);
  const lastScannedData = useRef(null);
  const scannedCodesRef = useRef(new Set());

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleQRScan = async (decodedText) => {
    try {
      if (scannedCodesRef.current.has(decodedText)) {
        toast.warning("Attendance already marked!", {
          position: "top-center",
          autoClose: 1000,
          hideProgressBar: true,
          pauseOnHover: false,
          toastId: decodedText,
        });
        return;
      }

      const result = await onScan(decodedText);

      if (result.data.success) {
        scannedCodesRef.current.add(decodedText);
        toast.success("Attendance marked successfully!", {
          position: "top-center",
          autoClose: 1000,
          hideProgressBar: true,
          pauseOnHover: false,
        });
      }
    } catch (err) {
      if (err.response?.data?.message?.includes("already marked")) {
        scannedCodesRef.current.add(decodedText);
        toast.warning("Attendance already marked for today!", {
          position: "top-center",
          autoClose: 1000,
          hideProgressBar: true,
          pauseOnHover: false,
          toastId: decodedText,
        });
      } else {
        toast.error("Failed to mark attendance", {
          position: "top-center",
          autoClose: 1000,
          hideProgressBar: true,
          pauseOnHover: false,
        });
      }
    }
  };

  useEffect(() => {
    // Initialize scanner only once
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode("qr-reader", {
        experimentalFeatures: { useBarCodeDetectorIfSupported: true },
      });
      startScanner();
    }

    // Cleanup function
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current.clear();
            scannerRef.current = null;
          })
          .catch((err) => console.error("Failed to stop scanner:", err));
      }
    };
  }, []);

  const startScanner = async () => {
    if (!scannerRef.current || scannerRef.current.isScanning) return;

    setScanning(true);
    setError(null);

    const qrConfig = {
      fps: 10,
      qrbox: isMobile
        ? { width: Math.min(250, window.innerWidth - 50), height: 250 }
        : { width: 300, height: 300 },
      aspectRatio: 1.0,
    };

    try {
      await scannerRef.current.start(
        { facingMode: "environment" },
        qrConfig,
        handleQRScan,
        (errorMessage) => {
          if (!errorMessage.includes("No QR code found")) {
            if (errorMessage.includes("NotFoundException")) return;
            console.error("QR scanning error:", errorMessage);
          }
        }
      );
    } catch (err) {
      console.error("Scanner start error:", err);
      if (err.toString().includes("NotAllowedError")) {
        setError(
          "Camera access denied. Please grant camera permissions and try again."
        );
      } else if (err.toString().includes("NotFoundError")) {
        setError(
          "No camera found. Please ensure your device has a working camera."
        );
      } else {
        setError(`Camera error: ${err.toString()}`);
      }
      setScanning(false);
    }
  };

  const restartScanner = () => {
    if (scannerRef.current) {
      setScanned(false);
      setError(null);
      startScanner();
    }
  };

  return (
    <div className="scanner-container">
      <h3 className="text-center mb-3">{title}</h3>

      {error && (
        <div className="text-center">
          <Alert variant="danger">{error}</Alert>
          <Button variant="primary" onClick={restartScanner}>
            Try Again
          </Button>
        </div>
      )}

      {!error && (
        <div className="qr-scanner-box">
          <div
            id="qr-reader"
            style={{
              width: isMobile ? "100%" : "500px",
              maxWidth: "100%",
              margin: "0 auto",
              border: "1px solid #ddd",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
            }}
          ></div>
          <p className="text-center mt-3 text-muted">
            Position the QR code within the frame to scan
          </p>
        </div>
      )}

      {scanning && !error && (
        <div className="text-center mt-3">
          <Spinner animation="border" />
          <p className="mt-2">Processing...</p>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
