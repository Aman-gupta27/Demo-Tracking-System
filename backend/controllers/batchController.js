const Batch = require('../models/Batch');

// Create a new batch
exports.createBatch = async (req, res) => {
  try {
    const { batchId, description, demoDates } = req.body;
    
    // Convert string dates to Date objects if needed
    const parsedDates = demoDates.map(date => 
      typeof date === 'string' ? new Date(date) : date
    );
    
    const batch = new Batch({
      batchId,
      description,
      demoDates: parsedDates
    });
    
    await batch.save();
    
    res.status(201).json({
      success: true,
      data: batch
    });
  } catch (error) {
    console.error('Create batch error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A batch with this ID already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all batches
exports.getBatches = async (req, res) => {
  try {
    const batches = await Batch.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: batches.length,
      data: batches
    });
  } catch (error) {
    console.error('Get batches error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get a single batch
exports.getBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: batch
    });
  } catch (error) {
    console.error('Get batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get batch by batchId
exports.getBatchByBatchId = async (req, res) => {
  try {
    const batch = await Batch.findOne({ batchId: req.params.batchId });
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: batch
    });
  } catch (error) {
    console.error('Get batch by batchId error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete a batch
exports.deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndDelete(req.params.id);
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Batch deleted successfully',
      data: batch
    });
  } catch (error) {
    console.error('Delete batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting batch',
      error: error.message
    });
  }
};

// Update a batch
exports.updateBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    res.status(200).json({
      success: true,
      data: batch
    });
  } catch (error) {
    console.error('Update batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating batch',
      error: error.message
    });
  }
};
