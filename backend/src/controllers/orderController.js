import Order from '../models/Order.js';
import Hoodie from '../models/Hoodie.js';
import { sendOrderConfirmationEmail } from '../utils/email.js';
import { logSecurityEvent, getClientInfo } from '../utils/securityLog.js';
import { AppError } from '../utils/response.js';

// Create order (customer)
export const createOrder = async (req, res, next) => {
  try {
    console.log('Order Body:', req.body);
    console.log('Order File:', req.file);
    
    let { items, customer, notes } = req.body;

    // Parse JSON strings if they come from FormData
    if (typeof items === 'string') items = JSON.parse(items);
    if (typeof customer === 'string') customer = JSON.parse(customer);

    // Manual Validation
    if (!customer?.name || !customer?.phone || !customer?.address) {
      return next(new AppError('Customer name, phone, and address are required.', 400));
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return next(new AppError('At least one item is required.', 400));
    }

    // Validate and enrich items
    const enrichedItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const hoodie = await Hoodie.findById(item.hoodieId);
      if (!hoodie || !hoodie.isActive) return next(new AppError(`Hoodie not found: ${item.hoodieId}`, 404));

      const sizeObj = hoodie.sizes.find((s) => s.size === item.size);
      if (!sizeObj || sizeObj.stock < item.quantity) {
        return next(new AppError(`Insufficient stock for ${hoodie.name} in size ${item.size}`, 400));
      }

      const price = hoodie.discountPrice || hoodie.price;
      const subtotal = price * item.quantity;
      totalAmount += subtotal;

      // Decrement stock and increment sold count
      sizeObj.stock -= item.quantity;
      hoodie.soldCount += item.quantity;
      await hoodie.save();

      enrichedItems.push({
        hoodie: hoodie._id,
        hoodieName: hoodie.name,
        hoodieImage: hoodie.images[0]?.url || '',
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price,
        subtotal,
      });
    }

    const orderData = {
      customer: { ...customer, userId: req.user?._id },
      items: enrichedItems,
      totalAmount,
      notes,
      source: 'website',
    };

    // Add screenshot if uploaded
    if (req.file) {
      orderData.paymentScreenshot = {
        url: req.file.path,
        publicId: req.file.filename
      };
    }

    const order = await Order.create(orderData);

    // Send confirmation email if email provided
    if (customer.email) {
      try {
        await sendOrderConfirmationEmail(customer.email, customer.name, order);
      } catch (_) {}
    }

    res.status(201).json({ success: true, message: 'Order placed successfully!', data: { order } });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all orders
export const getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter).sort('-createdAt').skip(skip).limit(Number(limit));

    res.json({ success: true, data: { orders, total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

// Admin: Get single order
export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.hoodie', 'name images');
    if (!order) return next(new AppError('Order not found.', 404));
    res.json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
};

// Admin: Update order status
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return next(new AppError('Order not found.', 404));

    order.statusHistory.push({ status: order.status, changedAt: Date.now(), changedBy: req.user._id, note });
    order.status = status;
    await order.save({ validateBeforeSave: false });

    await logSecurityEvent({ event: 'order_status_changed', userId: req.user._id, ...getClientInfo(req), details: { orderId: order._id, from: order.statusHistory.at(-1)?.status, to: status } });

    res.json({ success: true, message: 'Order status updated.', data: { order } });
  } catch (error) {
    next(error);
  }
};

// Get current user's orders
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ 'customer.userId': req.user._id }).sort('-createdAt');
    res.json({ success: true, data: { orders } });
  } catch (error) {
    next(error);
  }
};
