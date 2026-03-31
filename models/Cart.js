import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  size: {
    type: String,
    default: null,
  },
});

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  items: [CartItemSchema],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Cart || mongoose.model('Cart', CartSchema);
