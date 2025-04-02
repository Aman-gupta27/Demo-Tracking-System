import React from 'react';
import { Card } from 'react-bootstrap';
import QRScanner from '../components/QRScanner';
import { markAttendance } from '../services/api';

const AttendanceScanner = () => {
  const handleScan = async (data) => {
    try {
      const qrData = JSON.parse(data);
      const response = await markAttendance(qrData);
      return response;
    } catch (error) {
      console.error('Scan error:', error);
      throw error;
    }
  };

  return (
    <div>
      <h2 className="text-center mb-4">Mark Attendance</h2>
      <Card className="p-3">
        <QRScanner onScan={handleScan} title="Scan Student's QR Code" />
      </Card>
    </div>
  );
};

export default AttendanceScanner;
