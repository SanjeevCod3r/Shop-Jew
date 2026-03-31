import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';
import Blog from '@/models/Blog';
import Cart from '@/models/Cart';
import Order from '@/models/Order';
import Coupon from '@/models/Coupon';
import { hashPassword, comparePassword, generateToken, getUserFromRequest } from '@/lib/auth';
import crypto from 'crypto';
import Razorpay from 'razorpay';

// Initialize database and create admin user
let seeded = false;
async function initializeApp() {
  try {
    await connectDB();
    
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin' });
    if (!adminExists) {
      const hashedPassword = await hashPassword(process.env.ADMIN_PASSWORD || 'admin123');
      await User.create({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('Admin user created');
    }

    // Only seed if NOT already seeded during this runtime AND no products exist
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

function authenticate(handler) {
  return async (request, context) => {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return handler(request, { ...context, user });
  };
}

function authenticateAdmin(handler) {
  return async (request, context) => {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    return handler(request, { ...context, user });
  };
}

export async function GET(request, { params }) {
  await initializeApp();
  const path = params?.path ? params.path.join('/') : '';
  const { searchParams } = new URL(request.url);

  try {
    if (!path) return NextResponse.json({ message: 'E-commerce API is running!' });

    if (path === 'auth/me') {
      return authenticate(async (req, ctx) => {
        const user = await User.findById(ctx.user.userId).select('-password');
        return NextResponse.json({ user });
      })(request, { params });
    }

    if (path === 'products') {
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '12');
      const search = searchParams.get('search') || '';
      const category = searchParams.get('category') || '';
      const minPrice = parseFloat(searchParams.get('minPrice') || '0');
      const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999');

      let query = { price: { $gte: minPrice, $lte: maxPrice } };
      if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
      if (category) query.category = category;

      const total = await Product.countDocuments(query);
      const products = await Product.find(query).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 });

      return NextResponse.json({ products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    }

    if (path.startsWith('products/')) {
      const productId = path.split('/')[1];
      const product = await Product.findById(productId);
      return product ? NextResponse.json({ product }) : NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (path === 'categories') {
      const categories = await Product.distinct('category');
      return NextResponse.json({ categories });
    }

    if (path === 'blogs') {
      const limit = parseInt(searchParams.get('limit') || '3');
      const blogs = await Blog.find().sort({ createdAt: -1 }).limit(limit);
      return NextResponse.json({ blogs });
    }

    if (path.startsWith('blogs/')) {
      const blogId = path.split('/')[1];
      const blog = await Blog.findById(blogId);
      return blog ? NextResponse.json({ blog }) : NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    if (path === 'cart') {
      const user = getUserFromRequest(request);
      if (user) {
        let cart = await Cart.findOne({ userId: user.userId }).populate('items.productId');
        if (!cart) cart = await Cart.create({ userId: user.userId, items: [] });
        return NextResponse.json({ cart });
      }
      return NextResponse.json({ cart: { items: [] } });
    }

    if (path === 'orders') {
      return authenticate(async (req, ctx) => {
        const orders = await Order.find({ userId: ctx.user.userId }).sort({ createdAt: -1 }).populate('items.productId');
        return NextResponse.json({ orders });
      })(request, { params });
    }

    if (path.startsWith('orders/')) {
      const orderId = path.split('/')[1];
      return authenticate(async (req, ctx) => {
        const order = await Order.findOne({ _id: orderId, userId: ctx.user.userId }).populate('items.productId');
        return order ? NextResponse.json({ order }) : NextResponse.json({ error: 'Order not found' }, { status: 404 });
      })(request, { params });
    }

    if (path === 'user/profile') {
      return authenticate(async (req, ctx) => {
        const user = await User.findById(ctx.user.userId).select('-password');
        return NextResponse.json({ user });
      })(request, { params });
    }

    if (path === 'admin/products') {
      return authenticateAdmin(async (req, ctx) => {
        const products = await Product.find().sort({ createdAt: -1 });
        return NextResponse.json({ products });
      })(request, { params });
    }

    if (path === 'admin/orders') {
      return authenticateAdmin(async (req, ctx) => {
        const orders = await Order.find().sort({ createdAt: -1 }).populate('userId', 'name email').populate('items.productId');
        return NextResponse.json({ orders });
      })(request, { params });
    }

    if (path === 'admin/users') {
      return authenticateAdmin(async (req, ctx) => {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        return NextResponse.json({ users });
      })(request, { params });
    }

    if (path === 'admin/stats') {
      return authenticateAdmin(async (req, ctx) => {
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalProducts = await Product.countDocuments();
        const revenue = await Order.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]);
        const totalRevenue = revenue[0]?.total || 0;
        const ordersByStatus = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
        const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'name email');
        return NextResponse.json({ stats: { totalOrders, totalUsers, totalProducts, totalRevenue }, ordersByStatus, recentOrders });
      })(request, { params });
    }

    if (path === 'admin/blogs') {
      return authenticateAdmin(async (req, ctx) => {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        return NextResponse.json({ blogs });
      })(request, { params });
    }

    if (path === 'admin/coupons') {
      return authenticateAdmin(async (req, ctx) => {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        return NextResponse.json({ coupons });
      })(request, { params });
    }

    if (path.startsWith('coupons/validate/')) {
      const couponCode = path.split('/')[2];
      const url = new URL(request.url);
      const cartTotal = parseFloat(url.searchParams.get('cartTotal') || '0');
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });

      if (!coupon) return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
      if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 });
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 });
      if (cartTotal < coupon.minPurchaseAmount) return NextResponse.json({ error: `Minimum purchase of ₹${coupon.minPurchaseAmount} required` }, { status: 400 });

      let discount = coupon.discountType === 'percentage' ? (cartTotal * coupon.discountValue) / 100 : coupon.discountValue;
      if (coupon.discountType === 'percentage' && coupon.maxDiscountAmount) discount = Math.min(discount, coupon.maxDiscountAmount);
      discount = Math.min(discount, cartTotal);

      return NextResponse.json({ valid: true, coupon: { code: coupon.code, description: coupon.description, discountType: coupon.discountType, discountValue: coupon.discountValue }, discount: Math.round(discount), finalAmount: Math.round(cartTotal - discount) });
    }

    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  await initializeApp();
  const path = params?.path ? params.path.join('/') : '';
  try {
    const body = await request.json();

    if (path === 'auth/signup') {
      const { name, email, password } = body;
      if (!name || !email || !password) return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
      const existingUser = await User.findOne({ email });
      if (existingUser) return NextResponse.json({ error: 'User already exists' }, { status: 400 });
      const hashedPassword = await hashPassword(password);
      const user = await User.create({ name, email, password: hashedPassword, role: 'user' });
      const token = generateToken(user._id, user.email, user.role);
      return NextResponse.json({ message: 'User created successfully', token, user: { id: user._id, name: user.name, email: user.email, role: user.role } }, { status: 201 });
    }

    if (path === 'auth/login') {
      const { email, password } = body;
      if (!email || !password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
      const user = await User.findOne({ email });
      if (!user || !(await comparePassword(password, user.password))) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      const token = generateToken(user._id, user.email, user.role);
      return NextResponse.json({ message: 'Login successful', token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    }

    if (path === 'cart') {
      const user = getUserFromRequest(request);
      const { productId, quantity, size } = body;
      const product = await Product.findById(productId);
      if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      if (product.stock < quantity) return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });

      if (user) {
        let cart = await Cart.findOne({ userId: user.userId });
        if (!cart) cart = await Cart.create({ userId: user.userId, items: [] });

        const normalizedSize = size || null;
        const existingItemIndex = cart.items.findIndex(item => {
          const sameProduct = item.productId.toString() === productId;
          // treat null, undefined, empty string all as "no size"
          const itemSize = item.size || null;
          const sameSize = itemSize === normalizedSize;
          return sameProduct && sameSize;
        });

        if (existingItemIndex > -1) {
          cart.items[existingItemIndex].quantity += quantity;
        } else {
          cart.items.push({ productId, quantity, price: product.price, size: normalizedSize });
        }
        await cart.save();
        await cart.populate('items.productId');
        return NextResponse.json({ message: 'Item added to cart', cart });
      }
      return NextResponse.json({ message: 'Item added to guest cart' });
    }

    if (path === 'payment/create-order') {
      const { amount } = body;
      const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
      const razorpayOrder = await razorpay.orders.create({ amount: amount * 100, currency: 'INR', receipt: `receipt_${Date.now()}` });
      return NextResponse.json({ orderId: razorpayOrder.id, amount, currency: 'INR', key: process.env.RAZORPAY_KEY_ID });
    }

    if (path === 'payment/verify') {
      const user = getUserFromRequest(request);
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDetails } = body;
      const text = `${razorpay_order_id}|${razorpay_payment_id}`;
      const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(text).digest('hex');
      if (generated_signature !== razorpay_signature) return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
      
      const orderData = {
        userId: user ? user.userId : null,
        items: orderDetails.items,
        totalAmount: orderDetails.totalAmount,
        discount: orderDetails.discount || 0,
        couponCode: orderDetails.couponCode || null,
        finalAmount: orderDetails.finalAmount || orderDetails.totalAmount,
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        address: orderDetails.address,
        status: 'Confirmed'
      };

      const order = await Order.create(orderData);
      if (orderDetails.couponCode) await Coupon.findOneAndUpdate({ code: orderDetails.couponCode.toUpperCase() }, { $inc: { usedCount: 1 }, $push: { usedBy: { userId: user ? user.userId : null, usedAt: new Date() } } });
      if (user) await Cart.findOneAndUpdate({ userId: user.userId }, { items: [] });
      
      for (const item of orderDetails.items) await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
      return NextResponse.json({ message: 'Payment verified and order created', orderId: order._id });
    }

    if (path === 'admin/products') {
      return authenticateAdmin(async (req, ctx) => {
        const product = await Product.create(body);
        return NextResponse.json({ message: 'Product created', product }, { status: 201 });
      })(request, { params });
    }

    if (path === 'admin/coupons') {
      return authenticateAdmin(async (req, ctx) => {
        const { code } = body;
        if (await Coupon.findOne({ code: code.toUpperCase() })) return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
        const coupon = await Coupon.create({ ...body, code: code.toUpperCase() });
        return NextResponse.json({ message: 'Coupon created', coupon }, { status: 201 });
      })(request, { params });
    }

    if (path === 'admin/blogs') {
      return authenticateAdmin(async (req, ctx) => {
        const { title, description, category } = body;
        if (!title || !description || !category) return NextResponse.json({ error: 'Title, description, and category are required' }, { status: 400 });
        const blog = await Blog.create(body);
        return NextResponse.json({ message: 'Blog created', blog }, { status: 201 });
      })(request, { params });
    }

    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  await initializeApp();
  const path = params?.path ? params.path.join('/') : '';
  try {
    const body = await request.json();

    if (path === 'cart') {
      return authenticate(async (req, ctx) => {
        const { productId, quantity } = body;
        const cart = await Cart.findOne({ userId: ctx.user.userId });
        if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex === -1) return NextResponse.json({ error: 'Item not in cart' }, { status: 404 });
        if (quantity <= 0) cart.items.splice(itemIndex, 1);
        else cart.items[itemIndex].quantity = quantity;
        await cart.save();
        await cart.populate('items.productId');
        return NextResponse.json({ message: 'Cart updated', cart });
      })(request, { params });
    }

    if (path === 'user/profile') {
      return authenticate(async (req, ctx) => {
        const user = await User.findByIdAndUpdate(ctx.user.userId, body, { new: true }).select('-password');
        return NextResponse.json({ message: 'Profile updated', user });
      })(request, { params });
    }

    if (path.startsWith('admin/products/')) {
      const productId = path.split('/')[2];
      return authenticateAdmin(async (req, ctx) => {
        const product = await Product.findByIdAndUpdate(productId, { ...body, updatedAt: Date.now() }, { new: true });
        return product ? NextResponse.json({ message: 'Product updated', product }) : NextResponse.json({ error: 'Product not found' }, { status: 404 });
      })(request, { params });
    }

    if (path.startsWith('admin/orders/')) {
      const orderId = path.split('/')[2];
      return authenticateAdmin(async (req, ctx) => {
        const order = await Order.findByIdAndUpdate(orderId, { ...body, updatedAt: Date.now() }, { new: true });
        return order ? NextResponse.json({ message: 'Order status updated', order }) : NextResponse.json({ error: 'Order not found' }, { status: 404 });
      })(request, { params });
    }

    if (path.startsWith('admin/coupons/')) {
      const couponId = path.split('/')[2];
      return authenticateAdmin(async (req, ctx) => {
        const updateData = { ...body, updatedAt: Date.now() };
        if (updateData.code) updateData.code = updateData.code.toUpperCase();
        const coupon = await Coupon.findByIdAndUpdate(couponId, updateData, { new: true });
        return coupon ? NextResponse.json({ message: 'Coupon updated', coupon }) : NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
      })(request, { params });
    }

    if (path.startsWith('admin/blogs/')) {
      const blogId = path.split('/')[2];
      return authenticateAdmin(async (req, ctx) => {
        const blog = await Blog.findByIdAndUpdate(blogId, { ...body, updatedAt: Date.now() }, { new: true });
        return blog ? NextResponse.json({ message: 'Blog updated', blog }) : NextResponse.json({ error: 'Blog not found' }, { status: 404 });
      })(request, { params });
    }

    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  await initializeApp();
  const path = params?.path ? params.path.join('/') : '';
  try {
    if (path.startsWith('cart/')) {
      const productId = path.split('/')[1];
      return authenticate(async (req, ctx) => {
        const cart = await Cart.findOne({ userId: ctx.user.userId });
        if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
        cart.items = cart.items.filter(item => item.productId.toString() !== productId);
        await cart.save();
        await cart.populate('items.productId');
        return NextResponse.json({ message: 'Item removed from cart', cart });
      })(request, { params });
    }

    if (path.startsWith('admin/products/')) {
      const productId = path.split('/')[2];
      console.log('Attempting to delete product:', productId);
      return authenticateAdmin(async (req, ctx) => {
        const product = await Product.findByIdAndDelete(productId);
        console.log('Delete result:', product ? 'Success' : 'Not found');
        return product ? NextResponse.json({ message: 'Product deleted' }) : NextResponse.json({ error: 'Product not found' }, { status: 404 });
      })(request, { params });
    }

    if (path.startsWith('admin/coupons/')) {
      const couponId = path.split('/')[2];
      return authenticateAdmin(async (req, ctx) => {
        const coupon = await Coupon.findByIdAndDelete(couponId);
        return coupon ? NextResponse.json({ message: 'Coupon deleted' }) : NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
      })(request, { params });
    }

    if (path.startsWith('admin/blogs/')) {
      const blogId = path.split('/')[2];
      return authenticateAdmin(async (req, ctx) => {
        const blog = await Blog.findByIdAndDelete(blogId);
        return blog ? NextResponse.json({ message: 'Blog deleted' }) : NextResponse.json({ error: 'Blog not found' }, { status: 404 });
      })(request, { params });
    }

    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
