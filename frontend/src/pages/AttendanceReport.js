import React, { useState, useEffect } from 'react';
import { Form, Card, Table, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { getBatches, getAttendanceByBatch, getBatchAttendanceStats, getAllBatchesStats } from '../services/api';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement
);

const AttendanceReport = () => {
  const [searchParams] = useSearchParams();
  const batchIdParam = searchParams.get('batchId');
  
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(batchIdParam || '');
  const [attendanceData, setAttendanceData] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [allBatchesStats, setAllBatchesStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBatches();
    fetchAllBatchesStats();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchAttendanceData(selectedBatch);
      fetchBatchStats(selectedBatch);
    }
  }, [selectedBatch]);

  const fetchBatches = async () => {
    try {
      const response = await getBatches();
      setBatches(response.data.data);
      
      // If no batch is selected but we have batches, select the first one
      if (!selectedBatch && response.data.length > 0 && !batchIdParam) {
        setSelectedBatch(response.data[0]._id);
      }
    } catch (err) {
      setError('Failed to fetch batches');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async (batchId) => {
    try {
      setLoading(true);
      const response = await getAttendanceByBatch(batchId);
      setAttendanceData(response.data);
    } catch (err) {
      setError('Failed to fetch attendance data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchStats = async (batchId) => {
    try {
      const response = await getBatchAttendanceStats(batchId);
      // console.log('Batch Stats:', response.data);
      setStatsData(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllBatchesStats = async () => {
    try {
      const response = await getAllBatchesStats();
      setAllBatchesStats(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBatchChange = (e) => {
    setSelectedBatch(e.target.value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Chart data for selected batch
  const batchChartData = statsData ? {
    labels: statsData.demoDateLabels,
    datasets: [
      {
        label: 'Attendance Count',
        data: statsData.attendanceCounts,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  } : null;

  // Chart data for all batches
  const allBatchesChartData = allBatchesStats ? {
    labels: allBatchesStats.batchIds,
    datasets: [
      {
        label: 'Average Attendance',
        data: allBatchesStats.averageAttendancePercentages,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  return (
    <div>
      <h2 className="mb-4">Attendance Reports</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row className="mb-4">
        <Col md={12} lg={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Overall Batch Performance</Card.Title>
              {allBatchesStats ? (
                <Pie 
                  data={allBatchesChartData} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                      title: {
                        display: true,
                        text: 'Average Attendance Per Batch (%)'
                      },
                    },
                  }}
                  height={200}
                />
              ) : (
                <div className="text-center p-3">
                  <Spinner animation="border" size="sm" />
                  <span className="ms-2">Loading stats...</span>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={12} lg={6}>
          <Card>
            <Card.Body>
              <Card.Title>Batch Details</Card.Title>
              <Form.Group className="mb-3">
                <Form.Label>Select Batch</Form.Label>
                <Form.Select 
                  value={selectedBatch} 
                  onChange={handleBatchChange}
                >
                  <option value="">-- Select a Batch --</option>
                  {batches.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.batchId} - {batch.description}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              
              {selectedBatch && statsData && (
                <div className="mt-3">
                  <h5>Summary</h5>
                  <p><strong>Total Students:</strong> {statsData.totalStudents}</p>
                  <p><strong>Average Attendance:</strong> {statsData.averageAttendance}%</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {selectedBatch && (
        <Row>
          <Col md={12}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Attendance by Demo Date</Card.Title>
                {batchChartData ? (
                  <Bar 
                    data={batchChartData} 
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        title: {
                          display: true,
                          text: 'Attendance Count by Demo Date'
                        },
                      },
                    }}
                    height={100}
                  />
                ) : (
                  <div className="text-center p-3">
                    <Spinner animation="border" size="sm" />
                    <span className="ms-2">Loading chart...</span>
                  </div>
                )}
              </Card.Body>
            </Card>
            
            <Card>
              <Card.Body>
                <Card.Title>Detailed Attendance Records</Card.Title>
                {loading ? (
                  <div className="text-center p-3">
                    <Spinner animation="border" />
                    <p>Loading attendance data...</p>
                  </div>
                ) : attendanceData.length === 0 ? (
                  <Alert variant="info">No attendance records found for this batch.</Alert>
                ) : (
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Demo Date</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceData.map((record) => (
                        <tr key={record._id}>
                          <td>{record.studentName}</td>
                          <td>{formatDate(record.timestamp)}</td>
                          <td>{new Date(record.timestamp).toLocaleTimeString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default AttendanceReport;
