import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getBatchByBatchId, enrollStudent } from '../services/api';
import { toast } from 'react-toastify';

const SelfEnrollment = () => {
  const [searchParams] = useSearchParams();
  const batchIdParam = searchParams.get('batchId');
  const isWalkIn = searchParams.get('isWalkIn') === 'true';

  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    email: '',
    batchId: batchIdParam || '',
    isWalkIn: isWalkIn
  });

  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (batchIdParam) {
      fetchBatchDetails();
    } else {
      setLoading(false);
    }
  }, [batchIdParam]);

  const fetchBatchDetails = async () => {
    try {
      setLoading(true);
      const response = await getBatchByBatchId(batchIdParam);
      setBatch(response.data.data);
    } catch (err) {
      setError('Failed to fetch batch details. Please try again or contact the administrator.');
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
      console.log('Submitting form data:', formData); // Debug log

      const response = await enrollStudent({
        batchId: formData.batchId,
        name: formData.name.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        email: formData.email.trim(),
        isWalkIn: formData.isWalkIn
      });

      console.log('Enrollment response:', response); // Debug log

      if (response.data?.success) {
        setSuccess(true);
        setEnrollmentId(response.data.data._id);
        toast.success('Registration successful!');
      } else {
        throw new Error(response.data?.message || 'Failed to complete registration');
      }
    } catch (err) {
      console.error('Enrollment error:', err);
      setError(err.response?.data?.message || 'Failed to complete registration. Please try again.');
      toast.error(err.response?.data?.message || 'Registration failed');
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
        <p>Loading batch information...</p>
      </div>
    );
  }

  if (!batchIdParam) {
    return (
      <Alert variant="warning">
        No batch ID provided. Please scan a valid batch QR code.
      </Alert>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-center">Student Self-Registration</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {success ? (
        <Card className="p-4 text-center">
          <Card.Body>
            <Alert variant="success">
              <Alert.Heading>Registration Successful!</Alert.Heading>
              <p>You have been successfully registered for the demo class.</p>
            </Alert>
            <Button 
              variant="primary" 
              onClick={handleViewPass} 
              size="lg" 
              className="mt-3"
            >
              View Your Demo Pass
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Card className="p-4">
          <Card.Body>
            {batch && (
              <Alert variant="info">
                <strong>Registering for: {batch.batchId}</strong>
                <p className="mb-0">{batch.description}</p>
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Your Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mobile Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="Enter your mobile number"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email (Optional)</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
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
                      Registering...
                    </>
                  ) : (
                    'Register for Demo Class'
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

export default SelfEnrollment;
