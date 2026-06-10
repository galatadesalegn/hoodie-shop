import mongoose from 'mongoose';
import crypto from 'crypto';

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    customer: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, required: true },
      email: { type: String },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      telegramUsername: { type: String },
    },
    items: [
      {
        hoodie: { type: mongoose.Schema.Types.ObjectId, ref: 'Hoodie', required: true },
        hoodieName: { type: String, required: true },
        hoodieImage: { type: String },
        size: { type: String, required: true },
        color: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        subtotal: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'delivered', 'cancelled'],
      default: 'pending',
    },
    statusHistory: [
      {
        status: { type: String },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: { type: String },
      },
    ],
    deliveryAddress: {
      street: String,
      city: String,
      region: String,
      country: { type: String, default: 'Ethiopia' },
    },
    notes: { type: String },
    paymentScreenshot: {
      url: String,
      publicId: String
    },
    source: { type: String, enum: ['telegram', 'website'], default: 'telegram' },
  },
  { timestamps: true }
);

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    this.orderNumber = 
      "AXIS-" + 
      Date.now() + 
      "-" + 
      crypto.randomBytes(4).toString("hex").toUpperCase();
  }
  next();
});

orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
