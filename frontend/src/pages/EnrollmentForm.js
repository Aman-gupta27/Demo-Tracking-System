import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getBatches, enrollStudent } from '../services/api';

const EnrollmentForm = () => {
  const [searchParams] = useSearchParams();
  const batchIdParam = searchParams.get('batchId');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    batchId: batchIdParam || '',
  });
  
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await getBatches();
      setBatches(response.data.data);
    } catch (err) {
      setError('Failed to fetch batches. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    
    try {
      const response = await enrollStudent(formData);
      setSuccess(true);
      setEnrollmentId(response.data.data._id);
    } catch (err) {
      setError('Failed to enroll student. Please check the information and try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewPass = () => {
    navigate(`/pass/${enrollmentId}`);
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
        <p>Loading batches...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">Student Enrollment</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {success ? (
        <Card className="p-4 text-center">
          <Card.Body>
            <Alert variant="success">
              <Alert.Heading>Enrollment Successful!</Alert.Heading>
              <p>The student has been successfully enrolled in the batch.</p>
            </Alert>
            <Button 
              variant="primary" 
              onClick={handleViewPass} 
              size="lg" 
              className="mt-3"
            >
              View Demo Pass
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Card className="p-4">
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Select Batch</Form.Label>
                <Form.Select 
                  name="batchId" 
                  value={formData.batchId} 
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select a Batch --</option>
                  {batches.map((batch) => (
                    <option key={batch.batchId} value={batch.batchId}>
                      {batch.batchId} - {batch.description}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Student Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />
              </Form.Group>

              <div className="d-grid">
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Enrolling...
                    </>
                  ) : (
                    'Enroll Student'
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default EnrollmentForm;
