import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { getEnrollmentById, getBatchById } from '../services/api';
import QRCodeGenerator from '../components/QRCodeGenerator';

const DemoPass = () => {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();
  
  const [enrollment, setEnrollment] = useState(null);
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (enrollmentId) {
      fetchEnrollmentData();
    }
  }, [enrollmentId]);

  const fetchEnrollmentData = async () => {
    try {
      setLoading(true);
      const enrollmentResponse = await getEnrollmentById(enrollmentId);
      
      // Check if we have a successful response and handle the data structure correctly
      if (enrollmentResponse.data && enrollmentResponse.data.success) {
        const enrollmentData = enrollmentResponse.data.data;
        setEnrollment(enrollmentData);
        
        // If the enrollment response includes a populated batch field, use it directly
        if (enrollmentData.batch && typeof enrollmentData.batch !== 'string') {
          setBatch(enrollmentData.batch);
        } else {
          // Otherwise fetch the batch details separately
          const batchResponse = await getBatchById(enrollmentData.batch);
          setBatch(batchResponse.data.data);
        }
        
        setError(null);
      } else {
        throw new Error('Invalid enrollment data received');
      }
    } catch (err) {
      setError('Failed to load demo pass. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
        <p>Loading demo pass...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!enrollment || !batch) {
    return <Alert variant="warning">Demo pass information not found.</Alert>;
  }

  // QR code data - can be scanned for attendance
  const qrData = JSON.stringify({
    enrollmentId: enrollment._id,
    batchId: batch._id,
    studentName: enrollment.student.name
  });

  return (
    <div className="text-center">
      <h2 className="mb-4">Demo Class Pass</h2>
      
      <div className="demo-pass">
        <h3>{batch.batchId}</h3>
        <p className="lead">{batch.description}</p>
        
        <div className="mt-3 mb-3">
          <strong>Student: </strong> {enrollment.student.name}
        </div>
        
        <QRCodeGenerator value={qrData} size={250} />
        
        <div className="mt-3">
          <p><small className="text-muted">Present this QR code to mark your attendance</small></p>
        </div>
        
        <div className="mt-4">
          <p><strong>Demo Class Dates:</strong></p>
          {batch.demoDates.map((date, index) => (
            <Badge bg="info" key={index} className="m-1 p-2">
              {formatDate(date)}
            </Badge>
          ))}
        </div>
        
        <div className="mt-4">
          <Button variant="secondary" onClick={() => window.print()}>
            Print Pass
          </Button>
          <Button 
            variant="primary" 
            className="ms-2"
            onClick={() => navigate('/')}
          >
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DemoPass;
