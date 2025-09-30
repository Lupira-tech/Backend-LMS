import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [
      /^[\+]?[1-9][\d]{0,15}$/,
      'Please enter a valid phone number'
    ]
  },
  
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  
  role: {
    type: String,
    trim: true,
    maxlength: [50, 'Role cannot exceed 50 characters']
  },

  // Assignment Management
  assignEmployee: {
    type: String,
    trim: true,
    maxlength: [100, 'Employee name cannot exceed 100 characters']
  },

  assignManager: {
    type: String,
    trim: true,
    maxlength: [100, 'Manager name cannot exceed 100 characters']
  },
  
  // Lead Management
  leadSource: {
    type: String,
    enum: [
      'Website',
      'Social Media',
      'Email Campaign',
      'Campaign',
      'Cold Call',
      'Referral',
      'Event',
      'Advertisement',
      'Direct Mail',
      'LinkedIn',
      'Google Ads',
      'Facebook Ads',
      'Trade Show',
      'Webinar',
      'Other'
    ],
    default: 'Other'
  },
  
  status: {
    type: String,
    enum: [
      'New',
      'Contacted',
      'Qualified',
      'Proposal',
      'Negotiation',
      'Closed Won',
      'Lost',
      'On Hold'
    ],
    default: 'New'
  },
  
  lastActivity: {
    type: Date,
    default: Date.now
  },
  
  // Additional Information
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Each tag cannot exceed 30 characters']
  }],
  
  // File Management
  attachments: [{
    fileName: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number
    },
    fileType: {
      type: String
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

// Indexes for better query performance
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ leadSource: 1 });
contactSchema.index({ company: 1 });
contactSchema.index({ tags: 1 });
contactSchema.index({ assignEmployee: 1 });
contactSchema.index({ assignManager: 1 });
contactSchema.index({ createdAt: -1 });

// Pre-save middleware to update lastActivity and updatedAt
contactSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.isModified() && !this.isNew) {
    this.lastActivity = Date.now();
  }
  next();
});

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
