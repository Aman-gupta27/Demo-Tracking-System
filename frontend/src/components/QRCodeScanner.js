import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';

const QRCodeScanner = ({ onScan, onError }) => {
  const [facingMode, setFacingMode] = useState('environment');

  const handleScan = (result) => {
    if (result) {
      onScan(result.text);
    }
  };

  const toggleCamera = () => {
    setFacingMode(facingMode === 'environment' ? 'user' : 'environment');
  };

  return (
    <div className="qr-scanner-container">
      <QrReader
        constraints={{ facingMode }}
        scanDelay={500}
        onResult={handleScan}
        onError={onError}
        style={{ width: '100%' }}
      />
      <button 
        className="camera-toggle-btn" 
        onClick={toggleCamera}
      >
        Switch Camera
      </button>
    </div>
  );
};

export default QRCodeScanner;
