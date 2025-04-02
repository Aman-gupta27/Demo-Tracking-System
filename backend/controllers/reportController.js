const Batch = require('../models/Batch');
const Student = require('../models/Student');
const DemoEnrollment = require('../models/DemoEnrollment');
const Attendance = require('../models/Attendance');
const mongoose = require('mongoose');

// Get attendance statistics for a specific batch
exports.getBatchAttendanceStats = async (req, res) => {
  try {
    const { batchId } = req.params;
    
    // Find the batch
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    // Get enrollments for this batch
    const enrollments = await DemoEnrollment.find({ batch: batchId });
    const totalStudents = enrollments.length;
    
    // Get attendance records for this batch
    const attendanceRecords = await Attendance.find({ batch: batchId })
      .sort({ attendanceDate: 1 });
    
    // Format demo dates and count attendance for each date
    const demoDateLabels = batch.demoDates.map(date => 
      new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );
    
    // Count attendance for each demo date
    const attendanceCounts = [];
    const attendanceMap = new Map();
    
    // Group attendance by date
    attendanceRecords.forEach(record => {
      const dateStr = new Date(record.attendanceDate).toISOString().split('T')[0];
      if (!attendanceMap.has(dateStr)) {
        attendanceMap.set(dateStr, 0);
      }
      attendanceMap.set(dateStr, attendanceMap.get(dateStr) + 1);
    });
    
    // Map counts to demo dates
    batch.demoDates.forEach(demoDate => {
      const dateStr = new Date(demoDate).toISOString().split('T')[0];
      attendanceCounts.push(attendanceMap.get(dateStr) || 0);
    });
    
    // Calculate average attendance percentage
    const totalAttendance = attendanceRecords.length;
    const possibleAttendance = totalStudents * batch.demoDates.length;
    const averageAttendance = possibleAttendance > 0
      ? Math.round((totalAttendance / possibleAttendance) * 100)
      : 0;
    
    res.status(200).json({
      success: true,
      totalStudents,
      demoDateLabels,
      attendanceCounts,
      averageAttendance
    });
  } catch (error) {
    console.error('Batch stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get attendance details for a specific student enrollment
exports.getStudentAttendanceDetails = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    
    // Find the enrollment
    const enrollment = await DemoEnrollment.findById(enrollmentId)
      .populate('student')
      .populate('batch');
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    
    // Get attendance records for this enrollment
    const attendanceRecords = await Attendance.find({ enrollment: enrollmentId })
      .sort({ attendanceDate: 1 });
    
    // Create attendance report
    const attendanceDates = attendanceRecords.map(record => 
      new Date(record.attendanceDate).toISOString().split('T')[0]
    );
    
    // Calculate attendance percentage
    const totalPossibleDates = enrollment.batch.demoDates.length;
    const percentAttended = totalPossibleDates > 0
      ? Math.round((attendanceRecords.length / totalPossibleDates) * 100)
      : 0;
    
    res.status(200).json({
      success: true,
      data: {
        student: {
          id: enrollment.student._id,
          name: enrollment.student.name,
          mobileNumber: enrollment.student.mobileNumber,
          email: enrollment.student.email
        },
        batch: {
          id: enrollment.batch._id,
          batchId: enrollment.batch.batchId,
          description: enrollment.batch.description,
          demoDates: enrollment.batch.demoDates
        },
        attendanceDates,
        percentAttended,
        totalAttended: attendanceRecords.length,
        totalPossibleDates
      }
    });
  } catch (error) {
    console.error('Student attendance details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get statistics for all batches
exports.getAllBatchesStats = async (req, res) => {
  try {
    // Get all batches
    const batches = await Batch.find().sort({ createdAt: -1 });
    
    // Calculate statistics for each batch
    const batchStats = await Promise.all(batches.map(async (batch) => {
      // Get enrollments for this batch
      const enrollments = await DemoEnrollment.find({ batch: batch._id });
      const totalStudents = enrollments.length;
      
      // Get attendance records for this batch
      const attendanceRecords = await Attendance.find({ batch: batch._id });
      
      // Calculate attendance percentage
      const totalAttendance = attendanceRecords.length;
      const possibleAttendance = totalStudents * batch.demoDates.length;
      const attendancePercentage = possibleAttendance > 0
        ? Math.round((totalAttendance / possibleAttendance) * 100)
        : 0;
      
      return {
        batchId: batch.batchId,
        description: batch.description,
        totalStudents,
        totalAttendance,
        possibleAttendance,
        attendancePercentage
      };
    }));
    
    // Prepare data for chart
    const batchIds = batchStats.map(stat => stat.batchId);
    const averageAttendancePercentages = batchStats.map(stat => stat.attendancePercentage);
    
    res.status(200).json({
      success: true,
      batchIds,
      averageAttendancePercentages,
      detailedStats: batchStats
    });
  } catch (error) {
    console.error('All batches stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
