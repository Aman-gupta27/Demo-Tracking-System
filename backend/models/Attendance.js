const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DemoEnrollment',
    required: true
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  attendanceDate: {
    type: Date,
    required: true
  },
  scanTime: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index to prevent duplicate attendance for the same day
AttendanceSchema.index({ enrollment: 1, attendanceDate: 1 }, { 
  unique: true,
  // Convert date to YYYY-MM-DD format to prevent duplicate attendance on the same day
  partialFilterExpression: {
    attendanceDate: { $type: "date" }
  }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
