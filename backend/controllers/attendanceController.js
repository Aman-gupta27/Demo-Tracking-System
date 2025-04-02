const DemoEnrollment = require('../models/DemoEnrollment');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Batch = require('../models/Batch');

// Mark student attendance
exports.markAttendance = async (req, res) => {
  try {
    const { qrCodeData } = req.body;
    
    // Find enrollment based on qrCodeData type
    let enrollment;
    
    if (typeof qrCodeData === 'object' && qrCodeData.enrollmentId) {
      // If qrCodeData is an object with enrollmentId, find by ID
      enrollment = await DemoEnrollment.findById(qrCodeData.enrollmentId);
    } else {
      // Otherwise use the original string-based QR code lookup
      enrollment = await DemoEnrollment.findOne({ qrCodeData });
    }
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Invalid QR code. Enrollment not found.'
      });
    }
    
    // Get current date (YYYY-MM-DD format)
    const now = new Date();
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    
    // Check if attendance already marked for today
    const existingAttendance = await Attendance.findOne({
      enrollment: enrollment._id,
      attendanceDate: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for today'
      });
    }
    
    // Create attendance record
    const attendance = new Attendance({
      enrollment: enrollment._id,
      batch: enrollment.batch,
      student: enrollment.student,
      attendanceDate: today,
      scanTime: now
    });
    
    await attendance.save();
    
    // Return attendance with populated data
    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate({
        path: 'enrollment',
        populate: [
          { path: 'batch' },
          { path: 'student' }
        ]
      });
    
    res.status(201).json({
      success: true,
      data: populatedAttendance
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get attendance statistics
exports.getAttendanceStats = async (req, res) => {
  try {
    const { batchId } = req.params;
    
    // Aggregate attendance data
    const stats = await Attendance.aggregate([
      {
        $lookup: {
          from: 'demoenrollments',
          localField: 'enrollment',
          foreignField: '_id',
          as: 'enrollment'
        }
      },
      {
        $unwind: '$enrollment'
      },
      {
        $lookup: {
          from: 'batches',
          localField: 'enrollment.batch',
          foreignField: '_id',
          as: 'batch'
        }
      },
      {
        $unwind: '$batch'
      },
      {
        $match: {
          'batch.batchId': batchId
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$attendanceDate' } },
          },
          count: { $sum: 1 },
          students: { $push: '$student' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get student attendance report
exports.getStudentAttendanceReport = async (req, res) => {
  try {
    const { batchId } = req.params;
    
    // Get all enrollments for the batch
    const enrollments = await DemoEnrollment.find({
      batch: { $in: await Batch.find({ batchId }).select('_id') }
    })
    .populate('student')
    .populate('batch');
    
    // Get all attendance records for the enrollments
    const attendanceRecords = await Attendance.find({
      enrollment: { $in: enrollments.map(e => e._id) }
    })
    .sort({ attendanceDate: 1 });
    
    // Process data to create report
    const studentAttendance = {};
    
    enrollments.forEach(enrollment => {
      const studentId = enrollment.student._id.toString();
      
      if (!studentAttendance[studentId]) {
        studentAttendance[studentId] = {
          student: {
            id: studentId,
            name: enrollment.student.name,
            mobileNumber: enrollment.student.mobileNumber
          },
          enrollmentDate: enrollment.createdAt,
          isWalkIn: enrollment.isWalkIn,
          daysAttended: [],
          totalDaysAttended: 0
        };
      }
    });
    
    attendanceRecords.forEach(record => {
      const studentId = record.student.toString();
      const dateStr = record.attendanceDate.toISOString().split('T')[0];
      
      if (studentAttendance[studentId]) {
        if (!studentAttendance[studentId].daysAttended.includes(dateStr)) {
          studentAttendance[studentId].daysAttended.push(dateStr);
          studentAttendance[studentId].totalDaysAttended += 1;
        }
      }
    });
    
    res.status(200).json({
      success: true,
      data: Object.values(studentAttendance)
    });
  } catch (error) {
    console.error('Get student attendance report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get attendance records for a batch
exports.getAttendanceByBatch = async (req, res) => {
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
    
    // Get attendance records with student information
    const attendanceRecords = await Attendance.find({ batch: batchId })
      .populate({
        path: 'student',
        select: 'name mobileNumber email'
      })
      .sort({ timestamp: -1 });
    
    // Format the response with student names and timestamps
    const formattedRecords = await Promise.all(attendanceRecords.map(async (record) => {
      // Get student name if needed
      let studentName = '';
      if (record.student) {
        studentName = record.student.name;
      } else {
        // If student is not populated, fetch directly
        const student = await Student.findById(record.student);
        studentName = student ? student.name : 'Unknown';
      }
      
      return {
        _id: record._id,
        studentName,
        timestamp: record.attendanceDate,
        scanTime: record.scanTime
      };
    }));
    
    res.status(200).json(formattedRecords);
  } catch (error) {
    console.error('Get attendance by batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
