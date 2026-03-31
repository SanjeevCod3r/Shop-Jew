import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  excerpt: {
    type: String,
    default: '',
  },
  images: {
    type: [String],
    default: [],
  },
  category: {
    type: String,
    required: true,
    default: 'News',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
