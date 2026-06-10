export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'customer' | 'admin' | 'superadmin';
  avatar: { url: string; publicId: string };
  isEmailVerified: boolean;
  lastLogin?: string;
  isActive: boolean;
  createdAt: string;
}

export interface HoodieSize {
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  stock: number;
}

export interface HoodieColor {
  name: string;
  hex: string;
}

export interface HoodieImage {
  url: string;
  publicId: string;
  alt: string;
}

export type HoodieCategory = 'oversized' | 'streetwear' | 'graphic' | 'zip-up' | 'winter';

export interface Hoodie {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  price: number;
  discountPrice?: number;
  discountPercentage?: number;
  images: HoodieImage[];
  category: HoodieCategory;
  sizes: HoodieSize[];
  colors: HoodieColor[];
  totalStock: number;
  featured: boolean;
  newArrival: boolean;
  viewCount: number;
  soldCount: number;
  isActive: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  hoodie: Hoodie;
  size: string;
  color: string;
  colorHex: string;
  quantity: number;
}

export interface OrderItem {
  hoodieId: string;
  hoodieName: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    telegramUsername?: string;
    userId?: string;
  };
  items: {
    hoodie: Hoodie | string;
    hoodieName: string;
    hoodieImage: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'delivered' | 'cancelled';
  statusHistory: { status: string; changedAt: string; note?: string }[];
  notes?: string;
  paymentScreenshot?: {
    url: string;
    publicId: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SecurityLog {
  _id: string;
  event: string;
  userId?: { name: string; email: string };
  targetId?: { name: string; email: string };
  ip: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    [key: string]: T[] | number;
  };
  total?: number;
  page?: number;
  pages?: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  mostViewed: Hoodie[];
  recentOrders: Order[];
  categoryStats: { _id: string; count: number }[];
  ordersByStatus: { _id: string; count: number }[];
  revenueData: { _id: string; revenue: number; orders: number }[];
}
