import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema({
  // Basic Deal Information
  title: {
    type: String,
    required: [true, 'Deal title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  amount: {
    type: Number,
    required: [true, 'Deal amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  
  stage: {
    type: String,
    required: [true, 'Deal stage is required'],
    enum: [
      'Lead',
      'Prospect',
      'Proposal',
      'Negotiation',
      'Closed Won',
      'Closed Lost',
      'On Hold'
    ],
    default: 'Lead'
  },
  
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  
  // Team Assignment
  executive: {
    type: String,
    required: [true, 'Executive is required'],
    trim: true,
    maxlength: [100, 'Executive name cannot exceed 100 characters']
  },
  
  manager: {
    type: String,
    required: [true, 'Manager is required'],
    trim: true,
    maxlength: [100, 'Manager name cannot exceed 100 characters']
  },
  
  // Company Association
  associatedCompany: {
    type: String,
    required: [true, 'Associated company is required'],
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters']
  },

  // Contact References (Multiple contacts can be associated)
  associatedContacts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  }],

  // Primary Contact (Backward compatibility)
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: [true, 'Primary contact ID is required']
  },
  
  // Deal Timeline
  closeDate: {
    type: Date,
    required: [true, 'Expected close date is required']
  },
  
  status: {
    type: String,
    enum: ['Active', 'Won', 'Lost', 'Pending', 'Cancelled'],
    default: 'Active'
  },
  
  probability: {
    type: Number,
    min: [0, 'Probability cannot be less than 0'],
    max: [100, 'Probability cannot exceed 100'],
    default: 50
  },
  
  // Additional Information
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    trim: true
  },
  
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    trim: true
  },
  
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
dealSchema.index({ stage: 1 });
dealSchema.index({ status: 1 });
dealSchema.index({ priority: 1 });
dealSchema.index({ contactId: 1 });
dealSchema.index({ associatedCompany: 1 });
dealSchema.index({ associatedContacts: 1 });
dealSchema.index({ executive: 1 });
dealSchema.index({ manager: 1 });
dealSchema.index({ closeDate: 1 });
dealSchema.index({ amount: -1 });
dealSchema.index({ createdAt: -1 });

// Pre-save middleware to update updatedAt
dealSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Deal = mongoose.model('Deal', dealSchema);

export default Deal;
