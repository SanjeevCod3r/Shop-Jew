import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  sku: {
    type: String,
    default: '',
  },
  ringSizes: {
    type: [Number],
    default: [],
  },
  stone: {
    type: String,
    default: '',
  },
  material: {
    type: String,
    default: '',
  },
  design: {
    type: String,
    default: '',
  },
  set: {
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
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  trending: {
    type: Boolean,
    default: false,
  },
  trendingOrder: {
    type: Number,
    default: 0,
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

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
