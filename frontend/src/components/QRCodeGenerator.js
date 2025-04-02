import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const QRCodeGenerator = ({ value, size = 200 }) => {
  return (
    <div className="qr-container">
      <QRCodeSVG 
        value={value}
        size={size}
        level="H"
        includeMargin={true}
      />
    </div>
  );
};

export default QRCodeGenerator;
