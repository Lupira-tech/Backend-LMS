import Contact from '../model/contact_Model.js';
import Deal from '../model/deal_Model.js';

// @desc    Create a new deal
// @route   POST /api/deals
// @access  Public
export const createDeal = async (req, res) => {
  try {
    const {
      title,
      amount,
      stage,
      priority,
      executive,
      manager,
      contactId,
      closeDate,
      status,
      probability,
      description,
      notes
    } = req.body;

    // Verify contact exists
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Create new deal
    const deal = new Deal({
      title,
      amount,
      stage,
      priority,
      executive,
      manager,
      contactId,
      closeDate,
      status,
      probability,
      description,
      notes
    });

    // Save to database
    const savedDeal = await deal.save();
    
    // Populate contact details
    await savedDeal.populate('contactId', 'name email company');

    res.status(201).json({
      success: true,
      message: 'Deal created successfully',
      data: savedDeal
    });

  } catch (error) {
    console.error('Error creating deal:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all deals
// @route   GET /api/deals
// @access  Public
export const getDeals = async (req, res) => {
  try {
    const deals = await Deal.find()
      .populate('contactId', 'name email company')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: deals.length,
      data: deals
    });

  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single deal
// @route   GET /api/deals/:id
// @access  Public
export const getDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('contactId', 'name email phone company role');

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    res.status(200).json({
      success: true,
      data: deal
    });

  } catch (error) {
    console.error('Error fetching deal:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid deal ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Filter deals by criteria
// @route   GET /api/deals/filter
// @access  Public
export const filterDeals = async (req, res) => {
  try {
    const { stage, priority, status, executive, manager } = req.query;
    
    // Build filter object
    let filterQuery = {};
    
    if (stage) filterQuery.stage = stage;
    if (priority) filterQuery.priority = priority;
    if (status) filterQuery.status = status;
    if (executive) filterQuery.executive = { $regex: executive, $options: 'i' };
    if (manager) filterQuery.manager = { $regex: manager, $options: 'i' };

    const deals = await Deal.find(filterQuery)
      .populate('contactId', 'name email company')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: deals.length,
      filters: req.query,
      data: deals
    });

  } catch (error) {
    console.error('Error filtering deals:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get pipeline analytics
// @route   GET /api/deals/analytics
// @access  Public
export const getDealAnalytics = async (req, res) => {
  try {
    // Get deals by stage
    const dealsByStage = await Deal.aggregate([
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgProbability: { $avg: '$probability' }
        }
      }
    ]);

    // Get deals by priority
    const dealsByPriority = await Deal.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Get deals by status
    const dealsByStatus = await Deal.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Get total statistics
    const totalStats = await Deal.aggregate([
      {
        $group: {
          _id: null,
          totalDeals: { $sum: 1 },
          totalValue: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' },
          avgProbability: { $avg: '$probability' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        pipeline: {
          byStage: dealsByStage,
          byPriority: dealsByPriority,
          byStatus: dealsByStatus
        },
        summary: totalStats[0] || {
          totalDeals: 0,
          totalValue: 0,
          avgAmount: 0,
          avgProbability: 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Move deal between stages
// @route   POST /api/deals/:id/move
// @access  Public
export const moveDeal = async (req, res) => {
  try {
    const { stage, probability } = req.body;

    const deal = await Deal.findByIdAndUpdate(
      req.params.id,
      { 
        stage,
        probability: probability || deal.probability,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).populate('contactId', 'name email company');

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Deal moved successfully',
      data: deal
    });

  } catch (error) {
    console.error('Error moving deal:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update entire deal
// @route   PUT /api/deals/:id
// @access  Public
export const updateDeal = async (req, res) => {
  try {
    const {
      title,
      amount,
      stage,
      priority,
      executive,
      manager,
      contactId,
      closeDate,
      status,
      probability,
      description,
      notes
    } = req.body;

    // Verify contact exists if contactId is being updated
    if (contactId) {
      const contact = await Contact.findById(contactId);
      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        });
      }
    }

    const deal = await Deal.findByIdAndUpdate(
      req.params.id,
      {
        title,
        amount,
        stage,
        priority,
        executive,
        manager,
        contactId,
        closeDate,
        status,
        probability,
        description,
        notes
      },
      { new: true, runValidators: true }
    ).populate('contactId', 'name email company');

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Deal updated successfully',
      data: deal
    });

  } catch (error) {
    console.error('Error updating deal:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid deal ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Change deal stage
// @route   PATCH /api/deals/:id/stage
// @access  Public
export const updateDealStage = async (req, res) => {
  try {
    const { stage } = req.body;

    const deal = await Deal.findByIdAndUpdate(
      req.params.id,
      { stage, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('contactId', 'name email company');

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Deal stage updated successfully',
      data: deal
    });

  } catch (error) {
    console.error('Error updating deal stage:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update deal priority
// @route   PATCH /api/deals/:id/priority
// @access  Public
export const updateDealPriority = async (req, res) => {
  try {
    const { priority } = req.body;

    const deal = await Deal.findByIdAndUpdate(
      req.params.id,
      { priority, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('contactId', 'name email company');

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Deal priority updated successfully',
      data: deal
    });

  } catch (error) {
    console.error('Error updating deal priority:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Assign executive/manager
// @route   PATCH /api/deals/:id/assign
// @access  Public
export const assignDeal = async (req, res) => {
  try {
    const { executive, manager } = req.body;

    const updateData = {};
    if (executive) updateData.executive = executive;
    if (manager) updateData.manager = manager;
    updateData.updatedAt = Date.now();

    const deal = await Deal.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('contactId', 'name email company');

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Deal assignment updated successfully',
      data: deal
    });

  } catch (error) {
    console.error('Error assigning deal:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete deal
// @route   DELETE /api/deals/:id
// @access  Public
export const deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Deal deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting deal:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid deal ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete multiple deals
// @route   DELETE /api/deals/bulk
// @access  Public
export const bulkDeleteDeals = async (req, res) => {
  try {
    const { dealIds } = req.body;

    if (!dealIds || !Array.isArray(dealIds) || dealIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of deal IDs'
      });
    }

    const result = await Deal.deleteMany({
      _id: { $in: dealIds }
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} deals deleted successfully`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error bulk deleting deals:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};