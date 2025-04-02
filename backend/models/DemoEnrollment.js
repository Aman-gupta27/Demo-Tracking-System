const mongoose = require('mongoose');

const DemoEnrollmentSchema = new mongoose.Schema({
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
  qrCodeData: {
    type: String,
    required: true,
    unique: true
  },
  isWalkIn: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index to ensure a student is only enrolled once per batch
DemoEnrollmentSchema.index({ batch: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('DemoEnrollment', DemoEnrollmentSchema);
