import mongoose from 'mongoose';

const hoodieSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hoodie name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
      default: null,
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        alt: { type: String, default: '' },
      },
    ],
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['oversized', 'streetwear', 'graphic', 'zip-up', 'winter'],
    },
    sizes: {
      type: [
        {
          size: { type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
          stock: { type: Number, default: 0, min: 0 },
        },
      ],
      validate: [(arr) => arr.length > 0, 'At least one size required'],
    },
    colors: [
      {
        name: { type: String, required: true },
        hex: { type: String, required: true },
      },
    ],
    totalStock: { type: Number, default: 0, min: 0 },
    featured: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    tags: [String],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Indexes
hoodieSchema.index({ name: 'text', description: 'text', brand: 'text' });
hoodieSchema.index({ category: 1 });
hoodieSchema.index({ featured: 1 });
hoodieSchema.index({ newArrival: 1 });
hoodieSchema.index({ price: 1 });
hoodieSchema.index({ viewCount: -1 });

// Auto-generate slug
hoodieSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();
  }
  // Calculate total stock
  this.totalStock = this.sizes.reduce((sum, s) => sum + s.stock, 0);
  next();
});

// Virtual for discount percentage
hoodieSchema.virtual('discountPercentage').get(function () {
  if (this.discountPrice && this.discountPrice < this.price) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

hoodieSchema.set('toJSON', { virtuals: true });

const Hoodie = mongoose.model('Hoodie', hoodieSchema);
export default Hoodie;
