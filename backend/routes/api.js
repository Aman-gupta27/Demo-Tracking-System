const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');
const enrollmentController = require('../controllers/enrollmentController');
const attendanceController = require('../controllers/attendanceController');
const reportController = require('../controllers/reportController');

// Batch routes
router.post('/batches', batchController.createBatch);
router.get('/batches', batchController.getBatches);
router.get('/batches/code/:batchId', batchController.getBatchByBatchId);  // Specific route first
router.delete('/batches/:id', batchController.deleteBatch);               // Then parameter routes
router.put('/batches/:id', batchController.updateBatch);
router.get('/batches/:id', batchController.getBatch);

// Enrollment routes
router.post('/enrollments', enrollmentController.enrollStudent);
router.get('/enrollments/:id', enrollmentController.getEnrollmentById);
router.get('/enrollments/qr/:qrCodeData', enrollmentController.getEnrollmentByQrCode);

// Attendance routes
router.post('/attendance/mark', attendanceController.markAttendance);
router.get('/attendance/stats/:batchId', attendanceController.getAttendanceStats);
router.get('/attendance/report/:batchId', attendanceController.getStudentAttendanceReport);
router.get('/attendance/batch/:batchId', attendanceController.getAttendanceByBatch);

// Report routes
router.get('/reports/batch/:batchId', reportController.getBatchAttendanceStats);
router.get('/reports/student/:enrollmentId', reportController.getStudentAttendanceDetails);
router.get('/reports/batches', reportController.getAllBatchesStats);

module.exports = router;
