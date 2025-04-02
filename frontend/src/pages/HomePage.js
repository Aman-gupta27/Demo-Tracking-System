import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="text-center mb-5">
        <h1 className="mb-3">Demo Class Attendance Tracking</h1>
        <p className="lead">
          Streamline attendance tracking for demo classes with QR code-based enrollment and attendance marking
        </p>
      </div>

      <Row xs={1} md={2} lg={3} className="g-4">
        <Col>
          <Card className="h-100 dashboard-card">
            <Card.Body>
              <Card.Title>Batch Management</Card.Title>
              <Card.Text>
                Create and manage batches with unique identifiers and demo class schedules.
              </Card.Text>
              <Button variant="primary" onClick={() => navigate('/batches')}>
                Manage Batches
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="h-100 dashboard-card">
            <Card.Body>
              <Card.Title>Mark Attendance</Card.Title>
              <Card.Text>
                Scan student QR codes to mark attendance for demo classes.
              </Card.Text>
              <Button variant="success" onClick={() => navigate('/scan')}>
                Scan Attendance
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="h-100 dashboard-card">
            <Card.Body>
              <Card.Title>Attendance Reports</Card.Title>
              <Card.Text>
                View attendance statistics and insights for all batches.
              </Card.Text>
              <Button variant="info" onClick={() => navigate('/reports')}>
                View Reports
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HomePage;
