import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';
import Cart from '@/models/Cart';
import Order from '@/models/Order';
import Coupon from '@/models/Coupon';
import { hashPassword, comparePassword, generateToken, getUserFromRequest } from '@/lib/auth';
import crypto from 'crypto';
import Razorpay from 'razorpay';

// Initialize database and create admin user
async function initializeApp() {
  try {
    await connectDB();
    
    // Create admin user if doesn't exist
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

    // Seed some products if none exist
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany([
        {
          title: 'Premium Wireless Headphones',
          description: 'High-quality wireless headphones with noise cancellation and premium sound quality.',
          price: 2999,
          images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
          category: 'Electronics',
          stock: 50,
        },
        {
          title: 'Smart Watch Pro',
          description: 'Advanced smartwatch with health tracking, GPS, and water resistance.',
          price: 4999,
          images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'],
          category: 'Electronics',
          stock: 30,
        },
        {
          title: 'Designer Backpack',
          description: 'Stylish and durable backpack perfect for travel and daily use.',
          price: 1599,
          images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'],
          category: 'Fashion',
          stock: 100,
        },
        {
          title: 'Portable Bluetooth Speaker',
          description: 'Compact speaker with powerful sound and long battery life.',
          price: 1299,
          images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500'],
          category: 'Electronics',
          stock: 75,
        },
        {
          title: 'Casual Sneakers',
          description: 'Comfortable and trendy sneakers for everyday wear.',
          price: 2499,
          images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
          category: 'Fashion',
          stock: 60,
        },
        {
          title: 'Yoga Mat Premium',
          description: 'Non-slip yoga mat perfect for your fitness routine.',
          price: 899,
          images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500'],
          category: 'Sports',
          stock: 120,
        },
      ]);
      console.log('Sample products seeded');
    }
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

// Middleware to verify authentication
function authenticate(handler) {
  return async (request, context) => {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return handler(request, { ...context, user });
  };
}

// Middleware to verify admin role
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
    // Root endpoint
    if (!path) {
      return NextResponse.json({ message: 'E-commerce API is running!' });
    }

    // Auth endpoints
    if (path === 'auth/me') {
      return authenticate(async (req, ctx) => {
        const user = await User.findById(ctx.user.userId).select('-password');
        return NextResponse.json({ user });
      })(request, { params });
    }

    // Product endpoints
    if (path === 'products') {
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '12');
      const search = searchParams.get('search') || '';
      const category = searchParams.get('category') || '';
      const minPrice = parseFloat(searchParams.get('minPrice') || '0');
      const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999');

      let query = {
        price: { $gte: minPrice, $lte: maxPrice }
      };

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      if (category) {
        query.category = category;
      }

      const total = await Product.countDocuments(query);
      const products = await Product.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

      return NextResponse.json({
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }

    if (path.startsWith('products/')) {
      const productId = path.split('/')[1];
      const product = await Product.findById(productId);
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ product });
    }

    // Categories endpoint
    if (path === 'categories') {
      const categories = await Product.distinct('category');
      return NextResponse.json({ categories });
    }

    // Cart endpoints
    if (path === 'cart') {
      return authenticate(async (req, ctx) => {
        let cart = await Cart.findOne({ userId: ctx.user.userId }).populate('items.productId');
        if (!cart) {
          cart = await Cart.create({ userId: ctx.user.userId, items: [] });
        }
        return NextResponse.json({ cart });
      })(request, { params });
    }

    // Order endpoints
    if (path === 'orders') {
      return authenticate(async (req, ctx) => {
        const orders = await Order.find({ userId: ctx.user.userId })
          .sort({ createdAt: -1 })
          .populate('items.productId');
        return NextResponse.json({ orders });
      })(request, { params });
    }

    if (path.startsWith('orders/')) {
      const orderId = path.split('/')[1];
      return authenticate(async (req, ctx) => {
        const order = await Order.findOne({ _id: orderId, userId: ctx.user.userId })
          .populate('items.productId');
        if (!order) {
          return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        return NextResponse.json({ order });
      })(request, { params });
    }

    // User profile endpoint
    if (path === 'user/profile') {
      return authenticate(async (req, ctx) => {
        const user = await User.findById(ctx.user.userId).select('-password');
        return NextResponse.json({ user });
      })(request, { params });
    }

    // Admin endpoints
    if (path === 'admin/products') {
      return authenticateAdmin(async (req, ctx) => {
        const products = await Product.find().sort({ createdAt: -1 });
        return NextResponse.json({ products });
      })(request, { params });
    }

    if (path === 'admin/orders') {
      return authenticateAdmin(async (req, ctx) => {
        const orders = await Order.find()
          .sort({ createdAt: -1 })
          .populate('userId', 'name email')
          .populate('items.productId');
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
        
        const revenue = await Order.aggregate([
          { $match: { status: { $ne: 'Cancelled' } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenue[0]?.total || 0;

        // Sales by status
        const ordersByStatus = await Order.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Recent orders
        const recentOrders = await Order.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('userId', 'name email');

        return NextResponse.json({
          stats: {
            totalOrders,
            totalUsers,
            totalProducts,
            totalRevenue,
          },
          ordersByStatus,
          recentOrders,
        });
      })(request, { params });
    }

    // Coupon endpoints  
    if (path === 'admin/coupons') {
      return authenticateAdmin(async (req, ctx) => {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        return NextResponse.json({ coupons });
      })(request, { params });
    }

    // Validate coupon (for users)
    if (path.startsWith('coupons/validate/')) {
      const couponCode = path.split('/')[2];
      return authenticate(async (req, ctx) => {
        const url = new URL(request.url);
        const cartTotal = url.searchParams.get('cartTotal');
        const total = parseFloat(cartTotal) || 0;

        console.log('Coupon validation:', { couponCode, cartTotal, total });

        const coupon = await Coupon.findOne({ 
          code: couponCode.toUpperCase(),
          isActive: true
        });

        if (!coupon) {
          return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
        }

        // Check expiry
        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
          return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 });
        }

        // Check usage limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 });
        }

        // Check minimum purchase
        if (total < coupon.minPurchaseAmount) {
          return NextResponse.json({ 
            error: `Minimum purchase of ₹${coupon.minPurchaseAmount} required` 
          }, { status: 400 });
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discountType === 'percentage') {
          discount = (total * coupon.discountValue) / 100;
          if (coupon.maxDiscountAmount) {
            discount = Math.min(discount, coupon.maxDiscountAmount);
          }
        } else {
          discount = coupon.discountValue;
        }

        discount = Math.min(discount, total); // Don't exceed cart total

        console.log('Coupon applied:', { discount, finalAmount: total - discount });

        return NextResponse.json({
          valid: true,
          coupon: {
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
          },
          discount: Math.round(discount),
          finalAmount: Math.round(total - discount)
        });
      })(request, { params });
    }

    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });

  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  await initializeApp();
  
  const path = params?.path ? params.path.join('/') : '';

  try {
    const body = await request.json();

    // Auth endpoints
    if (path === 'auth/signup') {
      const { name, email, password } = body;

      if (!name || !email || !password) {
        return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json({ error: 'User already exists' }, { status: 400 });
      }

      const hashedPassword = await hashPassword(password);
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'user',
      });

      const token = generateToken(user._id, user.email, user.role);

      return NextResponse.json({
        message: 'User created successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      }, { status: 201 });
    }

    if (path === 'auth/login') {
      const { email, password } = body;

      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      const token = generateToken(user._id, user.email, user.role);

      return NextResponse.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }

    // Cart endpoints
    if (path === 'cart') {
      return authenticate(async (req, ctx) => {
        const { productId, quantity } = body;

        if (!productId || !quantity) {
          return NextResponse.json({ error: 'Product ID and quantity are required' }, { status: 400 });
        }

        const product = await Product.findById(productId);
        if (!product) {
          return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        if (product.stock < quantity) {
          return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
        }

        let cart = await Cart.findOne({ userId: ctx.user.userId });
        if (!cart) {
          cart = await Cart.create({ userId: ctx.user.userId, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(
          item => item.productId.toString() === productId
        );

        if (existingItemIndex > -1) {
          cart.items[existingItemIndex].quantity += quantity;
        } else {
          cart.items.push({
            productId,
            quantity,
            price: product.price,
          });
        }

        cart.updatedAt = Date.now();
        await cart.save();
        await cart.populate('items.productId');

        return NextResponse.json({ message: 'Item added to cart', cart });
      })(request, { params });
    }

    // Payment endpoints
    if (path === 'payment/create-order') {
      return authenticate(async (req, ctx) => {
        const { amount } = body;

        if (!amount || amount <= 0) {
          return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        try {
          // Initialize Razorpay instance
          const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
          });

          // Create Razorpay order
          const options = {
            amount: amount * 100, // Razorpay expects amount in paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
          };

          const razorpayOrder = await razorpay.orders.create(options);

          return NextResponse.json({
            orderId: razorpayOrder.id,
            amount: amount,
            currency: 'INR',
            key: process.env.RAZORPAY_KEY_ID,
          });
        } catch (error) {
          console.error('Razorpay order creation error:', error);
          return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
        }
      })(request, { params });
    }

    if (path === 'payment/verify') {
      return authenticate(async (req, ctx) => {
        const {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          orderDetails,
        } = body;

        console.log('Payment verification request:', {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature: razorpay_signature ? 'present' : 'missing',
          orderDetails: orderDetails ? 'present' : 'missing'
        });

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
          return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
        }

        try {
          // Verify payment signature
          const text = `${razorpay_order_id}|${razorpay_payment_id}`;
          const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(text)
            .digest('hex');

          console.log('Signature verification:', {
            generated: generated_signature,
            received: razorpay_signature,
            match: generated_signature === razorpay_signature
          });

          const isValid = generated_signature === razorpay_signature;

          if (!isValid) {
            console.error('Payment signature verification failed');
            return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
          }

          // Create order
          const orderData = {
            userId: ctx.user.userId,
            items: orderDetails.items,
            totalAmount: orderDetails.totalAmount,
            discount: orderDetails.discount || 0,
            couponCode: orderDetails.couponCode || null,
            finalAmount: orderDetails.finalAmount || orderDetails.totalAmount,
            paymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            address: orderDetails.address,
            status: 'Confirmed',
          };

          const order = await Order.create(orderData);

          console.log('Order created successfully:', order._id);

          // Update coupon usage if coupon was used
          if (orderDetails.couponCode) {
            await Coupon.findOneAndUpdate(
              { code: orderDetails.couponCode.toUpperCase() },
              { 
                $inc: { usedCount: 1 },
                $push: { 
                  usedBy: { 
                    userId: ctx.user.userId,
                    usedAt: new Date()
                  } 
                }
              }
            );
          }

          // Clear cart
          await Cart.findOneAndUpdate(
            { userId: ctx.user.userId },
            { items: [] }
          );

          // Update product stock
          for (const item of orderDetails.items) {
            await Product.findByIdAndUpdate(item.productId, {
              $inc: { stock: -item.quantity }
            });
          }

          return NextResponse.json({
            message: 'Payment verified and order created',
            orderId: order._id,
          });
        } catch (error) {
          console.error('Payment verification error:', error);
          return NextResponse.json({ error: error.message || 'Payment verification failed' }, { status: 500 });
        }
      })(request, { params });
    }

    // Admin endpoints
    if (path === 'admin/products') {
      return authenticateAdmin(async (req, ctx) => {
        const { title, description, price, images, category, stock } = body;

        if (!title || !description || !price || !category) {
          return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const product = await Product.create({
          title,
          description,
          price,
          images: images || [],
          category,
          stock: stock || 0,
        });

        return NextResponse.json({ message: 'Product created', product }, { status: 201 });
      })(request, { params });
    }

    // Admin coupon endpoints
    if (path === 'admin/coupons') {
      return authenticateAdmin(async (req, ctx) => {
        const { 
          code, 
          description, 
          discountType, 
          discountValue, 
          minPurchaseAmount,
          maxDiscountAmount,
          usageLimit,
          expiryDate 
        } = body;

        if (!code || !discountType || !discountValue) {
          return NextResponse.json({ error: 'Code, discount type, and value are required' }, { status: 400 });
        }

        // Check if coupon code already exists
        const existing = await Coupon.findOne({ code: code.toUpperCase() });
        if (existing) {
          return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
        }

        const coupon = await Coupon.create({
          code: code.toUpperCase(),
          description: description || '',
          discountType,
          discountValue,
          minPurchaseAmount: minPurchaseAmount || 0,
          maxDiscountAmount: maxDiscountAmount || null,
          usageLimit: usageLimit || null,
          expiryDate: expiryDate || null,
        });

        return NextResponse.json({ message: 'Coupon created', coupon }, { status: 201 });
      })(request, { params });
    }

    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });

  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  await initializeApp();
  
  const path = params?.path ? params.path.join('/') : '';

  try {
    const body = await request.json();

    // Cart update endpoint
    if (path === 'cart') {
      return authenticate(async (req, ctx) => {
        const { productId, quantity } = body;

        const cart = await Cart.findOne({ userId: ctx.user.userId });
        if (!cart) {
          return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
        }

        const itemIndex = cart.items.findIndex(
          item => item.productId.toString() === productId
        );

        if (itemIndex === -1) {
          return NextResponse.json({ error: 'Item not in cart' }, { status: 404 });
        }

        if (quantity <= 0) {
          cart.items.splice(itemIndex, 1);
        } else {
          cart.items[itemIndex].quantity = quantity;
        }

        cart.updatedAt = Date.now();
        await cart.save();
        await cart.populate('items.productId');

        return NextResponse.json({ message: 'Cart updated', cart });
      })(request, { params });
    }

    // User profile update
    if (path === 'user/profile') {
      return authenticate(async (req, ctx) => {
        const { name, phone, address } = body;

        const user = await User.findByIdAndUpdate(
          ctx.user.userId,
          { name, phone, address },
          { new: true }
        ).select('-password');

        return NextResponse.json({ message: 'Profile updated', user });
      })(request, { params });
    }

    // Admin product update
    if (path.startsWith('admin/products/')) {
      const productId = path.split('/')[2];
      return authenticateAdmin(async (req, ctx) => {
        const { title, description, price, images, category, stock } = body;

        const product = await Product.findByIdAndUpdate(
          productId,
          { title, description, price, images, category, stock, updatedAt: Date.now() },
          { new: true }
        );

        if (!product) {
          return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Product updated', product });
      })(request, { params });
    }

    // Admin order status update
    if (path.startsWith('admin/orders/')) {
      const orderId = path.split('/')[2];
      return authenticateAdmin(async (req, ctx) => {
        const { status } = body;

        const order = await Order.findByIdAndUpdate(
          orderId,
          { status, updatedAt: Date.now() },
          { new: true }
        );

        if (!order) {
          return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Order status updated', order });
      })(request, { params });
    }

    // Admin coupon update
    if (path.startsWith('admin/coupons/')) {
      const couponId = path.split('/')[2];
      return authenticateAdmin(async (req, ctx) => {
        const updates = body;
        
        if (updates.code) {
          updates.code = updates.code.toUpperCase();
        }

        const coupon = await Coupon.findByIdAndUpdate(
          couponId,
          updates,
          { new: true }
        );

        if (!coupon) {
          return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Coupon updated', coupon });
      })(request, { params });
    }

    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });

  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  await initializeApp();
  
  const path = params?.path ? params.path.join('/') : '';

  try {
    // Cart item deletion
    if (path.startsWith('cart/')) {
      const productId = path.split('/')[1];
      return authenticate(async (req, ctx) => {
        const cart = await Cart.findOne({ userId: ctx.user.userId });
        if (!cart) {
          return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
        }

        cart.items = cart.items.filter(
          item => item.productId.toString() !== productId
        );

        cart.updatedAt = Date.now();
        await cart.save();
        await cart.populate('items.productId');

        return NextResponse.json({ message: 'Item removed from cart', cart });
      })(request, { params });
    }

    // Admin product deletion
    if (path.startsWith('admin/products/')) {
      const productId = path.split('/')[2];
      return authenticateAdmin(async (req, ctx) => {
        const product = await Product.findByIdAndDelete(productId);
        if (!product) {
          return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Product deleted' });
      })(request, { params });
    }

    // Admin coupon deletion
    if (path.startsWith('admin/coupons/')) {
      const couponId = path.split('/')[2];
      return authenticateAdmin(async (req, ctx) => {
        const coupon = await Coupon.findByIdAndDelete(couponId);
        if (!coupon) {
          return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Coupon deleted' });
      })(request, { params });
    }

    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });

  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
