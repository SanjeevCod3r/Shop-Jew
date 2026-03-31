import mongoose from 'mongoose';

const InquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  subject: {
    type: String,
    default: 'General Consultation',
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Unread', 'Read', 'Replied'],
    default: 'Unread',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);
