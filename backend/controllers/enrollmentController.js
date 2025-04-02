const crypto = require('crypto');
const Student = require('../models/Student');
const Batch = require('../models/Batch');
const DemoEnrollment = require('../models/DemoEnrollment');

// Enroll a student in a batch
exports.enrollStudent = async (req, res) => {
  try {
    console.log('Enrollment request body:', req.body); // Debug log
    const { batchId, name, mobileNumber, email, isWalkIn } = req.body;

    // Validation
    if (!batchId || !name || !mobileNumber) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: batchId, name, or mobileNumber'
      });
    }

    // Find batch
    const batch = await Batch.findOne({ batchId: batchId });
    if (!batch) {
      console.log('Batch not found:', batchId);
      return res.status(404).json({
        success: false,
        message: `Batch ${batchId} not found`
      });
    }

    // Create or find student
    let student = await Student.findOne({ mobileNumber });
    if (!student) {
      student = new Student({ name, mobileNumber, email });
      await student.save();
      console.log('New student created:', student);
    }

    // Check for existing enrollment
    const existingEnrollment = await DemoEnrollment.findOne({
      batch: batch._id,
      student: student._id
    });

    if (existingEnrollment) {
      console.log('Student already enrolled');
      return res.status(400).json({
        success: false,
        message: 'Student is already enrolled in this batch'
      });
    }

    // Create new enrollment
    const qrCodeData = crypto.randomBytes(16).toString('hex');
    const enrollment = new DemoEnrollment({
      batch: batch._id,
      student: student._id,
      qrCodeData,
      isWalkIn: Boolean(isWalkIn)
    });

    await enrollment.save();
    console.log('New enrollment created:', enrollment);

    const populatedEnrollment = await DemoEnrollment.findById(enrollment._id)
      .populate('batch')
      .populate('student');

    return res.status(201).json({
      success: true,
      data: populatedEnrollment,
      message: 'Enrollment successful'
    });

  } catch (error) {
    console.error('Enrollment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to enroll student',
      error: error.message
    });
  }
};

// Get enrollment by QR code
exports.getEnrollmentByQrCode = async (req, res) => {
  try {
    const { qrCodeData } = req.params;
    
    const enrollment = await DemoEnrollment.findOne({ qrCodeData })
      .populate('batch')
      .populate('student');
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    console.error('Get enrollment by QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get enrollment by ID
exports.getEnrollmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = await DemoEnrollment.findById(id)
      .populate('batch')
      .populate('student');
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    console.error('Get enrollment by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
