import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import BatchManagement from './pages/BatchManagement';
import EnrollmentForm from './pages/EnrollmentForm';
import SelfEnrollment from './pages/SelfEnrollment';
import DemoPass from './pages/DemoPass';
import AttendanceScanner from './pages/AttendanceScanner';
import AttendanceReport from './pages/AttendanceReport';
import { Container } from 'react-bootstrap';

function App() {
  return (
    <Router>
      <Navigation />
      <Container className="py-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/batches" element={<BatchManagement />} />
          <Route path="/enroll" element={<EnrollmentForm />} />
          <Route path="/self-enroll" element={<SelfEnrollment />} />
          <Route path="/pass/:enrollmentId" element={<DemoPass />} />
          <Route path="/scan" element={<AttendanceScanner />} />
          <Route path="/reports" element={<AttendanceReport />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
