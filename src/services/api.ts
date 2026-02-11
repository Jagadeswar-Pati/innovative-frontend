// API Service for connecting to external backend
const RAW_API_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:5000');
const API_URL = RAW_API_URL.endsWith('/') ? RAW_API_URL.slice(0, -1) : RAW_API_URL;

interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
}

// Helper to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Helper to set auth token
export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

// Helper to remove auth token
export const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

// Base fetch wrapper with auth
const fetchWithAuth = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
};

// ============ AUTH API ============
export const authApi = {
  register: async (data: { name: string; email: string; password: string; mobile?: string }) => {
    return fetchWithAuth<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (data: { email: string; password: string }) => {
    return fetchWithAuth<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  googleLogin: async (data: { tokenId: string }) => {
    return fetchWithAuth<{ token: string; user: User }>('/api/auth/google-login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMe: async () => {
    return fetchWithAuth<User>('/api/auth/me');
  },

  forgotPassword: async (data: { email: string }) => {
    return fetchWithAuth('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  resetPassword: async (data: { token: string; password: string }) => {
    return fetchWithAuth('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

const stripHtml = (value: string) =>
  value
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<\/(li|p|div|h\d)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const extractQuickNotes = (longDescription: string, shortDescription: string) => {
  const text = stripHtml(longDescription || '');
  const chunks = text
    .split(/[.\n]/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 6);
  const notes = Array.from(new Set(chunks)).slice(0, 6);
  if (notes.length > 0) return notes;
  const fallback = shortDescription?.trim();
  return fallback ? [fallback] : [];
};

// Transform backend product to frontend Product shape
const toFrontendProduct = (p: Record<string, unknown>): Product => {
  if (!p || typeof p !== 'object') {
    return {
      _id: '',
      name: '',
      shortDescription: '',
      longDescription: '',
      price: 0,
      mrp: 0,
    gstMode: 'including',
    gstPercentage: 0,
      category: '',
      subcategory: '',
      images: [],
      cloudinaryUrl: '',
      stock: 0,
      sku: '',
      features: [],
      specifications: {},
      createdAt: '',
      updatedAt: '',
    };
  }
  const images = Array.isArray(p.images)
    ? (p.images as Array<{ url?: string } | string>)
        .map((i) => (typeof i === 'string' ? i : i?.url || ''))
        .filter(Boolean)
    : [];
  return {
    _id: (p._id || p.id || p.sku)?.toString() || '',
    name: (p.name as string) || '',
    shortDescription: (p.shortDescription as string) || '',
    longDescription: (p.longDescription as string) || '',
    price: Number(p.sellingPrice ?? p.price) || 0,
    mrp: Number(p.mrp) || 0,
    gstMode: (p.gstMode as 'including' | 'excluding') || 'including',
    gstPercentage: Number(p.gstPercentage) || 0,
    category:
      Array.isArray(p.categories) && (p.categories as string[]).length
        ? (p.categories as string[])[0]
        : (p.category as string) || '',
    subcategory: (p.subcategory as string) || '',
    images,
    cloudinaryUrl: images[0] || '',
    stock: Number(p.stockQuantity ?? p.stock) || 0,
    sku: (p.sku as string) || '',
    features: Array.isArray(p.features) && (p.features as string[]).length
      ? (p.features as string[])
      : extractQuickNotes((p.longDescription as string) || '', (p.shortDescription as string) || ''),
    specifications: (p.specifications as Record<string, string>) || {},
    datasheet: (p.datasheet as string) || undefined,
    createdAt: (p.createdAt as string) || '',
    updatedAt: (p.updatedAt as string) || '',
  };
};

// ============ PRODUCTS API ============
export const productsApi = {
  getAll: async (params?: { category?: string; search?: string }) => {
    const queryString = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : '';
    const res = await fetchWithAuth<unknown[]>(`/api/products${queryString}`);
    const arr = (res as ApiResponse<unknown>).data ?? res;
    const list = Array.isArray(arr) ? arr : [];
    return { success: true, data: list.map((p) => toFrontendProduct(p as Record<string, unknown>)), message: '' } as ApiResponse<Product[]>;
  },

  getById: async (id: string) => {
    const res = await fetchWithAuth<unknown>(`/api/products/${id}`);
    const raw = (res as ApiResponse<unknown>).data ?? res;
    if (raw) {
      return { success: true, data: toFrontendProduct(raw as Record<string, unknown>), message: '' } as ApiResponse<Product>;
    }
    return { success: false, data: undefined as unknown as Product, message: 'Product not found' };
  },
};

// ============ CATEGORIES API ============
export const categoriesApi = {
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    const res = await fetchWithAuth<unknown[]>('/api/categories');
    const arr = (res as ApiResponse<unknown>).data ?? res;
    const list = Array.isArray(arr)
      ? arr.map((c: Record<string, unknown>) => ({
          _id: (c._id || c.id || c.slug)?.toString() || '',
          name: (c.name as string) || '',
          slug: (c.slug as string) || '',
          icon: '',
          image: '',
        }))
      : [];
    return { success: true, data: list, message: '' } as ApiResponse<Category[]>;
  },
};

// ============ WISHLIST API ============
export const wishlistApi = {
  get: async () => {
    const res = await fetchWithAuth<unknown[]>('/api/wishlist');
    const arr = (res as ApiResponse<unknown>).data ?? res;
    const list = Array.isArray(arr) ? arr.map((p) => toFrontendProduct(p as Record<string, unknown>)) : [];
    return { success: true, data: list, message: '' } as ApiResponse<Product[]>;
  },

  add: async (productId: string) => {
    return fetchWithAuth('/api/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  remove: async (productId: string) => {
    return fetchWithAuth(`/api/wishlist/remove/${productId}`, {
      method: 'DELETE',
    });
  },
};

// ============ CART API ============
export const cartApi = {
  get: async () => {
    const res = await fetchWithAuth<Record<string, unknown>>('/api/cart');
    const raw = (res as ApiResponse<Record<string, unknown>>).data ?? res;
    const products = (raw as { products?: Array<Record<string, unknown>> }).products || [];
    const items = Array.isArray(products)
      ? products
          .map((item) => {
            const product = item.product as Record<string, unknown> | undefined;
            if (!product) return null;
            return {
              product: toFrontendProduct(product),
              quantity: Number(item.quantity) || 1,
            };
          })
          .filter(Boolean)
      : [];
    return { success: true, data: items as Array<{ product: Product; quantity: number }>, message: '' };
  },

  add: async (productId: string, quantity: number = 1) => {
    const res = await fetchWithAuth<Record<string, unknown>>('/api/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
    const raw = (res as ApiResponse<Record<string, unknown>>).data ?? res;
    const products = (raw as { products?: Array<Record<string, unknown>> }).products || [];
    const items = Array.isArray(products)
      ? products
          .map((item) => {
            const product = item.product as Record<string, unknown> | undefined;
            if (!product) return null;
            return {
              product: toFrontendProduct(product),
              quantity: Number(item.quantity) || 1,
            };
          })
          .filter(Boolean)
      : [];
    return { success: true, data: items as Array<{ product: Product; quantity: number }>, message: '' };
  },

  remove: async (productId: string) => {
    const res = await fetchWithAuth<Record<string, unknown>>('/api/cart/remove', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
    const raw = (res as ApiResponse<Record<string, unknown>>).data ?? res;
    const products = (raw as { products?: Array<Record<string, unknown>> }).products || [];
    const items = Array.isArray(products)
      ? products
          .map((item) => {
            const product = item.product as Record<string, unknown> | undefined;
            if (!product) return null;
            return {
              product: toFrontendProduct(product),
              quantity: Number(item.quantity) || 1,
            };
          })
          .filter(Boolean)
      : [];
    return { success: true, data: items as Array<{ product: Product; quantity: number }>, message: '' };
  },

  clear: async () => {
    const res = await fetchWithAuth<Record<string, unknown>>('/api/cart/clear', {
      method: 'POST',
    });
    const raw = (res as ApiResponse<Record<string, unknown>>).data ?? res;
    const products = (raw as { products?: Array<Record<string, unknown>> }).products || [];
    const items = Array.isArray(products)
      ? products
          .map((item) => {
            const product = item.product as Record<string, unknown> | undefined;
            if (!product) return null;
            return {
              product: toFrontendProduct(product),
              quantity: Number(item.quantity) || 1,
            };
          })
          .filter(Boolean)
      : [];
    return { success: true, data: items as Array<{ product: Product; quantity: number }>, message: '' };
  },
};

// Map backend order status to frontend
const orderStatusMap: Record<string, Order['orderStatus']> = {
  pending: 'Placed',
  confirmed: 'Packed',
  processing: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};
const paymentStatusMap: Record<string, Order['paymentStatus']> = {
  paid: 'Paid',
  unpaid: 'Pending',
  failed: 'Failed',
};

const resolveProductId = (value: unknown) => {
  if (value && typeof value === 'object' && '_id' in value) {
    return (value as { _id?: unknown })._id;
  }
  return value;
};

const toFrontendOrder = (o: Record<string, unknown>): Order => ({
  _id: (o._id || o.id)?.toString() || '',
  userId: (o.customerId || o.userId)?.toString() || '',
  products: Array.isArray(o.items)
    ? (o.items as Array<{ productId: unknown; quantity: number; price: number; name?: string; image?: string }>).map((i) => ({
        productId: resolveProductId(i.productId)?.toString() || '',
        qty: i.quantity,
        price: i.price,
        name: (i.name as string) || '',
        image: (i.image as string) || '',
      }))
    : [],
  address: (() => {
    const a = (o.addressSnapshot || o.address) as Record<string, unknown> | undefined;
    if (!a) return { fullName: '', mobile: '', addressLine1: '', city: '', state: '', pincode: '' };
    return {
      _id: (a._id as string) || undefined,
      fullName: (a.fullName as string) || '',
      mobile: (a.mobile || a.phone) as string || '',
      addressLine1: (a.addressLine1 || a.street) as string || '',
      addressLine2: (a.addressLine2 as string) || undefined,
      city: (a.city as string) || '',
      state: (a.state as string) || '',
      pincode: (a.pincode || a.postalCode) as string || '',
      isDefault: (a.isDefault as boolean) || false,
    };
  })(),
  totalAmount: Number(o.totalAmount ?? (o.pricing as { totalAmount?: number })?.totalAmount) || 0,
  deliveryCharge: Number(o.delivery_charge ?? (o.pricing as { deliveryCharge?: number })?.deliveryCharge) ?? 0,
  paymentStatus: paymentStatusMap[(o.paymentStatus as string) || ''] || 'Pending',
  orderStatus: orderStatusMap[(o.orderStatus as string) || ''] || 'Placed',
  paymentMethod: (o.paymentMethod as string) || '',
  trackingLink: (o.trackingLink || (o.delivery as { trackingLink?: string })?.trackingLink) as string | undefined,
  trackingMessage: (o.trackingMessage || (o.delivery as { trackingMessage?: string })?.trackingMessage) as string | undefined,
  invoiceUrl: ((o.invoice as { invoiceUrl?: string })?.invoiceUrl as string) || undefined,
  invoiceNumber: ((o.invoice as { invoiceNumber?: string })?.invoiceNumber as string) || undefined,
  createdAt: (o.createdAt as string) || '',
});

// ============ ORDERS API ============
export const ordersApi = {
  create: async (data: {
    products: Array<{ productId: string; qty: number; price: number }>;
    address: Address;
    totalAmount: number;
  }) => {
    return fetchWithAuth<Order>('/api/orders/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMyOrders: async () => {
    const res = await fetchWithAuth<unknown[]>('/api/orders/my-orders');
    const arr = (res as ApiResponse<unknown>).data ?? res;
    const list = Array.isArray(arr) ? arr : [];
    return { success: true, data: list.map((o) => toFrontendOrder(o as Record<string, unknown>)), message: '' } as ApiResponse<Order[]>;
  },

  getById: async (orderId: string) => {
    const res = await fetchWithAuth<unknown>(`/api/orders/${orderId}`);
    const raw = (res as ApiResponse<unknown>).data ?? res;
    return { success: true, data: toFrontendOrder(raw as Record<string, unknown>), message: '' } as ApiResponse<Order>;
  },

  /** Generate PDF invoice for confirmed/paid order (if not already generated). */
  generateInvoice: async (orderId: string) => {
    const res = await fetchWithAuth<{ invoiceNumber: string; invoiceUrl: string }>(`/api/orders/${orderId}/generate-invoice`, {
      method: 'POST',
    });
    return res;
  },

  /** Fetch invoice PDF as blob (served with correct Content-Type so browser can display it). */
  getInvoiceBlob: async (orderId: string): Promise<Blob> => {
    const token = localStorage.getItem('authToken');
    const url = `${API_URL}/api/orders/${orderId}/invoice`;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const contentType = res.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      const body = isJson ? await res.json().catch(() => ({})) : {};
      const message = (body as { message?: string }).message || res.statusText || 'Failed to load invoice';
      throw new Error(message);
    }
    return res.blob();
  },
};

// ============ REVIEWS & COMMENTS API ============
export interface Review {
  _id: string;
  productId: string;
  userId: string | { _id?: string; name?: string; profileImage?: string };
  userName?: string;
  userProfileImage?: string;
  rating: number;
  valueForMoney?: number;
  durability?: number;
  deliverySpeed?: number;
  comment?: string;
  pros?: string;
  cons?: string;
  createdAt?: string;
}

export interface Comment {
  _id: string;
  productId: string;
  userId: string;
  userName?: string;
  comment: string;
  createdAt?: string;
}

export const reviewsApi = {
  getByProduct: async (productId: string) => {
    const query = new URLSearchParams({ productId }).toString();
    return fetchWithAuth<Review[]>(`/api/reviews/public?${query}`);
  },
  getMode: async () => {
    return fetchWithAuth<{ mode: 'any-user' | 'delivered-only' }>('/api/reviews/mode');
  },
  create: async (data: {
    productId: string;
    orderId?: string;
    rating: number;
    valueForMoney?: number;
    durability?: number;
    deliverySpeed?: number;
    comment?: string;
    pros?: string;
    cons?: string;
  }) => {
    return fetchWithAuth<Review>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export const commentsApi = {
  getByProduct: async (productId: string) => {
    const query = new URLSearchParams({ productId }).toString();
    return fetchWithAuth<Comment[]>(`/api/comments?${query}`);
  },
};

// ============ DELIVERY API (for checkout) ============
export const deliveryApi = {
  getStateCharges: async (state: string) => {
    const res = await fetch(`${API_URL}/api/delivery/state-charges?state=${encodeURIComponent(state || '')}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to fetch delivery charges' }));
      throw new Error(err.message || 'Failed to fetch delivery charges');
    }
    const json = await res.json();
    return json.data as { state: string; defaultShippingCharge: number; manualBaseCharge: number };
  },
};

// ============ PAYMENTS API ============
export const paymentsApi = {
  createRazorpayOrder: async (data: {
    products: Array<{ productId: string; qty: number }>;
    address: Address;
    deliveryMethod: 'default' | 'manual';
    deliveryAgreement?: boolean;
    deliveryMobileNumber?: string;
  }) => {
    return fetchWithAuth<{ orderId: string; amount: number; currency: string; keyId: string; deliveryCharge?: number; totalAmount?: number }>(
      '/api/payments/razorpay/order',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },
  verifyRazorpayPayment: async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    products: Array<{ productId: string; qty: number }>;
    address: Address;
    deliveryMethod: 'default' | 'manual';
    deliveryAgreement?: boolean;
    deliveryMobileNumber?: string;
  }) => {
    return fetchWithAuth<{ orderId: string }>(
      '/api/payments/razorpay/verify',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },
  reportFailure: async (data: { reason?: string }) => {
    return fetchWithAuth('/api/payments/razorpay/failure', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============ USER API ============
export const userApi = {
  updateProfile: async (data: { name?: string; mobile?: string }) => {
    return fetchWithAuth('/api/user', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    return fetchWithAuth<{ message: string }>('/api/user/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Address management
  addAddress: async (address: Omit<Address, '_id'>) => {
    return fetchWithAuth<User>('/api/user/addresses', {
      method: 'POST',
      body: JSON.stringify(address),
    });
  },

  updateAddress: async (addressId: string, address: Partial<Address>) => {
    return fetchWithAuth<User>(`/api/user/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(address),
    });
  },

  deleteAddress: async (addressId: string) => {
    return fetchWithAuth<User>(`/api/user/addresses/${addressId}`, {
      method: 'DELETE',
    });
  },

  setDefaultAddress: async (addressId: string) => {
    return fetchWithAuth<User>(`/api/user/addresses/${addressId}/default`, {
      method: 'PUT',
    });
  },
};

// ============ TYPES ============
export interface User {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  addresses: Address[];
  createdAt: string;
}

export interface Address {
  _id?: string;
  fullName: string;
  mobile: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface Product {
  _id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  price: number;
  mrp: number;
  gstMode?: 'including' | 'excluding';
  gstPercentage?: number;
  category: string;
  subcategory: string;
  images: string[];
  cloudinaryUrl: string;
  stock: number;
  sku: string;
  features: string[];
  specifications: Record<string, string>;
  datasheet?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  image: string;
}

export interface Order {
  _id: string;
  userId: string;
  products: Array<{
    productId: string;
    qty: number;
    price: number;
    name?: string;
    image?: string;
  }>;
  address: Address;
  totalAmount: number;
  deliveryCharge?: number;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  orderStatus: 'Placed' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod?: string;
  trackingLink?: string;
  trackingMessage?: string;
  estimatedDelivery?: string;
  invoiceUrl?: string;
  invoiceNumber?: string;
  createdAt: string;
}
