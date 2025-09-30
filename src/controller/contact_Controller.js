import Contact from '../model/contact_Model.js';

// @desc    Create a new contact

export const createContact = async (req, res) => {
  try {
    console.log('📝 Creating contact with data:', req.body);
    
    const {
      name,
      email,
      phone,
      company,
      role,
      assignEmployee,
      assignManager,
      leadSource,
      status,
      notes,
      tags
    } = req.body;

    // Check if contact with this email already exists
    const existingContact = await Contact.findOne({ email });
    if (existingContact) {
      return res.status(400).json({
        success: false,
        message: 'Contact with this email already exists'
      });
    }

    // Create new contact
    const contact = new Contact({
      name,
      email,
      phone,
      company,
      role,
      assignEmployee,
      assignManager,
      leadSource,
      status,
      notes,
      tags
    });

    // Save to database
    const savedContact = await contact.save();

    res.status(201).json({
      success: true,
      message: 'Contact created successfully',
      data: savedContact
    });

  } catch (error) {
    console.error('Error creating contact:', error);
    console.error('Request body received:', req.body);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', errors);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors,
        details: error.errors
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Contact with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all contacts
//
export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });

  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single contact
//
export const getSingleContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });

  } catch (error) {
    console.error('Error fetching contact:', error);

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid contact ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update contact

export const updateContact = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      role,
      assignEmployee,
      assignManager,
      leadSource,
      status,
      notes,
      tags
    } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
        company,
        role,
        assignEmployee,
        assignManager,
        leadSource,
        status,
        notes,
        tags
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact updated successfully',
      data: contact
    });

  } catch (error) {
    console.error('Error updating contact:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Contact with this email already exists'
      });
    }

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid contact ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete contact

export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting contact:', error);

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid contact ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Assign employee/manager to contact
// @route   PATCH /api/contacts/:id/assign
// @access  Public
export const assignContact = async (req, res) => {
  try {
    const { assignEmployee, assignManager } = req.body;

    const updateData = {};
    if (assignEmployee !== undefined) updateData.assignEmployee = assignEmployee;
    if (assignManager !== undefined) updateData.assignManager = assignManager;
    updateData.updatedAt = Date.now();

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact assignment updated successfully',
      data: contact
    });

  } catch (error) {
    console.error('Error assigning contact:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid contact ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};