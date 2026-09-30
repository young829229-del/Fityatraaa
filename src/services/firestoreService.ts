import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth, isAuthorizedAdminUser } from '../firebase';
import {
  Product,
  Order,
  PaymentMethodSetting,
  StoreBanner,
  ReviewRecord,
  StoreSettings,
  AdminActivity,
  ContactSubmission,
  EmailSubscriber
} from '../types';
import { PRODUCTS as INITIAL_PRODUCTS, enrichProductWithDefaults } from '../data/products';

const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';
const REVIEWS_COLLECTION = 'reviews';
const PAYMENT_SETTINGS_COLLECTION = 'payment_settings';
const BANNERS_COLLECTION = 'banners';
const STORE_SETTINGS_COLLECTION = 'store_settings';
const ADMIN_ACTIVITY_COLLECTION = 'admin_activity';
const CONTACT_SUBMISSIONS_COLLECTION = 'contact_submissions';
const EMAIL_SUBSCRIBERS_COLLECTION = 'email_subscribers';

let hasSeededProducts = false;
let hasSeededReviews = false;
let hasSeededBanners = false;

/**
 * Recursively removes `undefined` fields and replaces `NaN` numbers with `0`
 * so Firebase Firestore `setDoc` / `updateDoc` never fails with "Unsupported field value: undefined".
 */
function stripUndefinedDeep<T>(value: T): T {
  if (value === undefined) {
    return null as unknown as T;
  }
  if (typeof value === 'number' && Number.isNaN(value)) {
    return 0 as unknown as T;
  }
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => stripUndefinedDeep(item)) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [k, v] of Object.entries(value as Record<string, any>)) {
      if (v !== undefined) {
        cleaned[k] = stripUndefinedDeep(v);
      }
    }
    return cleaned as T;
  }
  return value;
}

const DEFAULT_REDEFINE_VIDEO_URL =
  'https://res.cloudinary.com/drefcs4o2/video/upload/v1772786558/AQN7bb300k16e4a823562133089a70f6f743831e4d4d139d09c4409986d60900c7026444233380473110008057761_1_fd9n1h.mp4';
const DEFAULT_REDEFINE_POSTER_URL =
  'https://i.ibb.co/SwK21D9p/Screenshot-2026-03-06-14-31-10-49-40deb401b9ffe8e1df2f1cc5ba480b12.jpg';

// -------------------------------------------------------------
// 1. PRODUCTS MANAGEMENT
// -------------------------------------------------------------

export function subscribeToProducts(callback: (products: Product[]) => void): () => void {
  try {
    const q = query(collection(db, PRODUCTS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty && !hasSeededProducts) {
          hasSeededProducts = true;
          if (isAuthorizedAdminUser(auth.currentUser)) {
            seedInitialProductsIfEmpty().then(callback);
          } else {
            callback(INITIAL_PRODUCTS.map((p) => enrichProductWithDefaults(p)));
          }
        } else {
          const products = snapshot.docs.map((docSnap) => {
            const raw = docSnap.data() as Product;
            return enrichProductWithDefaults({
              ...raw,
              id: docSnap.id
            });
          });
          callback(products);
        }
      },
      (error) => {
        console.warn('Real-time products subscription error:', error);
      }
    );
  } catch (err) {
    console.warn('subscribeToProducts caught error:', err);
    return () => {};
  }
}

export async function getProductsFromFirestore(): Promise<Product[]> {
  try {
    const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    if (snap.empty) {
      return await seedInitialProductsIfEmpty();
    }
    return snap.docs.map((docSnap) => {
      const raw = docSnap.data() as Product;
      return enrichProductWithDefaults({
        ...raw,
        id: docSnap.id
      });
    });
  } catch (error) {
    console.warn('Fetching products from Firestore notice:', error);
    return INITIAL_PRODUCTS;
  }
}

export async function seedInitialProductsIfEmpty(): Promise<Product[]> {
  try {
    const existing = await getDocs(collection(db, PRODUCTS_COLLECTION));
    if (existing.empty && INITIAL_PRODUCTS.length > 0) {
      const seeded: Product[] = [];
      for (const prod of INITIAL_PRODUCTS) {
        const enriched: Product = {
          ...prod,
          stock: prod.isSoldOut ? 0 : 50,
          soldCount: 0,
          sku: `FY-${prod.id.toUpperCase().slice(0, 8)}`,
          isActive: true,
          isFeatured: true,
          isBestSeller: prod.id === 'wellcore-creatine' || prod.id === 'mb-biozyme-whey'
        };
        await setDoc(doc(db, PRODUCTS_COLLECTION, prod.id), {
          ...enriched,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        seeded.push(enriched);
      }
      return seeded;
    }
    return existing.docs.map((d) => d.data() as Product);
  } catch (err) {
    console.warn('Seed initial products notice:', err);
    return INITIAL_PRODUCTS;
  }
}

export async function saveProductToFirestore(product: Product): Promise<void> {
  const docId = (product.id || '').trim();
  const path = `${PRODUCTS_COLLECTION}/${docId}`;
  if (!docId) {
    throw new Error('Cannot save product: missing product ID.');
  }
  try {
    const cleanPrice = Math.max(0, Number(product.price) || 0);
    const cleanOrigPrice = Math.max(0, Number(product.originalPrice ?? cleanPrice) || cleanPrice);
    const rawStock = typeof product.stock === 'number' && !Number.isNaN(product.stock) ? product.stock : 50;
    const isSoldOutVal = Boolean(product.isSoldOut) || rawStock <= 0;
    const stockVal = isSoldOutVal ? 0 : Math.max(1, rawStock);
    const discountPct =
      cleanOrigPrice > cleanPrice
        ? Math.round(((cleanOrigPrice - cleanPrice) / cleanOrigPrice) * 100)
        : 0;

    const payload = stripUndefinedDeep({
      ...product,
      id: docId,
      name: (product.name || 'Supplement').trim(),
      brand: (product.brand || 'FitYatra').trim(),
      category: (product.category || 'Supplements').trim(),
      price: cleanPrice,
      originalPrice: cleanOrigPrice,
      stock: stockVal,
      isSoldOut: isSoldOutVal,
      badgeType: isSoldOutVal ? 'soldout' : 'sale',
      discountPercentage: discountPct,
      updatedAt: new Date().toISOString()
    });

    await setDoc(doc(db, PRODUCTS_COLLECTION, docId), payload, { merge: true });
    await logAdminActivity(
      'Product Saved',
      `Updated ${payload.name} — Price: Rs ${cleanPrice}, Stock: ${stockVal}`
    );
  } catch (error) {
    console.error('saveProductToFirestore failed:', error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProductFromFirestore(productId: string): Promise<void> {
  const path = `${PRODUCTS_COLLECTION}/${productId}`;
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
    await logAdminActivity('Product Deleted', `Removed product ID: ${productId}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// 2. ORDERS MANAGEMENT & AUTOMATIC STOCK DEDUCTION
// -------------------------------------------------------------

export function subscribeToOrders(callback: (orders: Order[]) => void): () => void {
  try {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const orders = snapshot.docs.map((d) => ({
          ...(d.data() as Order),
          id: d.id
        }));
        callback(orders);
      },
      (error) => {
        console.warn('Real-time orders subscription error:', error);
      }
    );
  } catch (err) {
    console.warn('subscribeToOrders caught error:', err);
    return () => {};
  }
}

export async function saveOrderToFirestore(orderData: Partial<Order> & { id: string }): Promise<string> {
  const path = `${ORDERS_COLLECTION}/${orderData.id}`;
  try {
    const fullOrder: Order = {
      id: orderData.id,
      customerName: orderData.customerName || 'Customer',
      phone: orderData.phone || '',
      email: orderData.email || '',
      address: orderData.address || '',
      region: orderData.region || 'KTM_VALLEY',
      landmark: orderData.landmark || '',
      items: orderData.items || [],
      totalAmount: orderData.totalAmount || 0,
      discountAmount: orderData.discountAmount || 0,
      paymentMethod: orderData.paymentMethod || 'cod',
      paymentScreenshotUrl: orderData.paymentScreenshotUrl || '',
      paymentStatus: orderData.paymentStatus || 'pending',
      status: orderData.status || 'pending',
      stockDeducted: false,
      notes: orderData.notes || '',
      adminNotes: orderData.adminNotes || '',
      createdAt: orderData.createdAt || new Date().toISOString(),
      userId: auth.currentUser?.uid || null,
      userEmail: auth.currentUser?.email || null
    };

    await setDoc(doc(db, ORDERS_COLLECTION, orderData.id), fullOrder);
    await logAdminActivity(
      'New Order Received',
      `Order #${fullOrder.id} by ${fullOrder.customerName} (Rs ${fullOrder.totalAmount})`
    );
    return orderData.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return orderData.id;
  }
}

async function adjustStockForOrder(order: Order, deduct: boolean): Promise<void> {
  for (const item of order.items || []) {
    if (!item.productId) continue;
    try {
      const prodRef = doc(db, PRODUCTS_COLLECTION, item.productId);
      const prodSnap = await getDoc(prodRef);
      if (prodSnap.exists()) {
        const prodData = prodSnap.data() as Product;
        const currentStock = typeof prodData.stock === 'number' ? prodData.stock : 50;
        const currentSold = typeof prodData.soldCount === 'number' ? prodData.soldCount : 0;
        const qty = item.quantity || 1;

        const newStock = deduct ? Math.max(0, currentStock - qty) : currentStock + qty;
        const newSold = deduct ? currentSold + qty : Math.max(0, currentSold - qty);
        const isNowSoldOut = newStock <= 0;

        await updateDoc(prodRef, {
          stock: newStock,
          soldCount: newSold,
          isSoldOut: isNowSoldOut,
          badgeType: isNowSoldOut ? 'soldout' : 'sale',
          updatedAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn(`Stock adjustment notice for product ${item.productId}:`, e);
    }
  }
}

export async function updateOrderStatusInFirestore(
  orderId: string,
  status: Order['status'],
  adminNotes?: string
): Promise<void> {
  const path = `${ORDERS_COLLECTION}/${orderId}`;
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const orderSnap = await getDoc(orderRef);
    const existingOrder = orderSnap.exists() ? (orderSnap.data() as Order) : null;

    const updates: Record<string, any> = {
      status,
      updatedAt: new Date().toISOString()
    };
    if (adminNotes !== undefined) {
      updates.adminNotes = adminNotes;
    }

    // Deduct stock when order is confirmed, processing, shipped, or delivered (if not yet deducted)
    if (
      existingOrder &&
      !existingOrder.stockDeducted &&
      ['confirmed', 'processing', 'shipped', 'delivered'].includes(status)
    ) {
      await adjustStockForOrder(existingOrder, true);
      updates.stockDeducted = true;
    }

    // Restore stock if a previously deducted order is cancelled
    if (existingOrder && existingOrder.stockDeducted && status === 'cancelled') {
      await adjustStockForOrder(existingOrder, false);
      updates.stockDeducted = false;
    }

    await updateDoc(orderRef, updates);
    await logAdminActivity('Order Status Changed', `Order #${orderId} set to ${status.toUpperCase()}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateOrderPaymentStatusInFirestore(
  orderId: string,
  paymentStatus: Order['paymentStatus'],
  adminNotes?: string
): Promise<void> {
  const path = `${ORDERS_COLLECTION}/${orderId}`;
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const orderSnap = await getDoc(orderRef);
    const existingOrder = orderSnap.exists() ? (orderSnap.data() as Order) : null;

    const updates: Record<string, any> = {
      paymentStatus,
      updatedAt: new Date().toISOString()
    };
    if (paymentStatus === 'verified') {
      updates.verifiedAt = new Date().toISOString();
      updates.verifiedBy = auth.currentUser?.email || 'admin@fityatra.com';
      if (!existingOrder || existingOrder.status === 'pending') {
        updates.status = 'confirmed';
      }
      if (existingOrder && !existingOrder.stockDeducted) {
        await adjustStockForOrder(existingOrder, true);
        updates.stockDeducted = true;
      }
    }
    if (adminNotes !== undefined) {
      updates.adminNotes = adminNotes;
    }
    await updateDoc(orderRef, updates);
    await logAdminActivity(
      'Payment Status Changed',
      `Order #${orderId} payment marked as ${paymentStatus.toUpperCase()}`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// -------------------------------------------------------------
// 3. REVIEWS MANAGEMENT
// -------------------------------------------------------------

export function subscribeToReviews(callback: (reviews: ReviewRecord[]) => void): () => void {
  try {
    const q = query(collection(db, REVIEWS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty && !hasSeededReviews) {
          hasSeededReviews = true;
          seedBaselineReviews().then(callback);
        } else {
          const reviews = snapshot.docs.map((d) => ({
            ...(d.data() as ReviewRecord),
            id: d.id
          }));
          reviews.sort((a, b) => {
            const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : 9999;
            const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : 9999;
            if (orderA !== orderB) return orderA - orderB;
            return (b.createdAt || '').localeCompare(a.createdAt || '');
          });
          callback(reviews);
        }
      },
      (error) => {
        console.warn('Real-time reviews subscription notice:', error);
      }
    );
  } catch (err) {
    console.warn('subscribeToReviews caught error:', err);
    return () => {};
  }
}

export async function seedBaselineReviews(): Promise<ReviewRecord[]> {
  const defaults: ReviewRecord[] = [
    {
      id: 'rev-1',
      productId: 'wellcore-creatine',
      productName: 'Wellcore Micronised Creatine Monohydrate',
      name: 'Rupesh T.',
      location: 'Kathmandu',
      rating: 5,
      comment:
        'Mixes effortlessly with water and zero bloating. Quick delivery inside Kathmandu valley with authentic lab seal!',
      imageUrl: 'https://i.ibb.co/DFnZ5Fy/Phone-Version-4-1-1-1.jpg',
      status: 'approved',
      isFeatured: true,
      isAttention: false,
      verified: true,
      displayOrder: 1,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'rev-2',
      productId: 'wellcore-creatine',
      productName: 'Wellcore Micronised Creatine Monohydrate',
      name: 'Prashant M.',
      location: 'Kathmandu',
      rating: 5,
      comment:
        'I am using this product since week ago and I have noticed good changes in my strength and muscle recovery.',
      imageUrl: 'https://i.ibb.co/KcBDpGYD/MV2-1-1-1.jpg',
      status: 'approved',
      isFeatured: true,
      isAttention: false,
      verified: true,
      displayOrder: 2,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
      id: 'rev-3',
      productId: 'mb-vite-multivitamin',
      productName: 'MuscleBlaze MB-Vite Daily Multivitamin',
      name: 'Aayush Adhikari',
      location: 'Lalitpur',
      rating: 5,
      comment:
        'Fast dispatch, arrived next day at Kupondole with Cash on Delivery. Authentic batch code and great energy levels.',
      imageUrl: 'https://i.ibb.co/dJBH98db/MV2-1-1-1-1.jpg',
      status: 'approved',
      isFeatured: true,
      isAttention: false,
      verified: true,
      displayOrder: 3,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'rev-4',
      productId: 'mb-biozyme-whey',
      productName: 'MuscleBlaze Biozyme Performance Whey',
      name: 'Suman Karki',
      location: 'Bhaktapur',
      rating: 5,
      comment:
        'Verified original MuscleBlaze & Wellcore products. Great packaging and super responsive support team on WhatsApp.',
      imageUrl: 'https://i.ibb.co/LD6MVb4K/MV2-1.jpg',
      status: 'approved',
      isFeatured: true,
      isAttention: false,
      verified: true,
      displayOrder: 4,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'rev-5',
      productId: 'wellcore-creatine',
      productName: 'Wellcore Micronised Creatine Monohydrate',
      name: 'Bikash Shrestha',
      location: 'Pokhara',
      rating: 5,
      comment:
        '100% genuine seal checked with barcode QR. Noticeable strength improvement on bench within 2 weeks. Best supplement store in Nepal.',
      imageUrl: 'https://i.ibb.co/r26k95J5/MV2-1-1.jpg',
      status: 'approved',
      isFeatured: true,
      isAttention: false,
      verified: true,
      displayOrder: 5,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  if (!isAuthorizedAdminUser(auth.currentUser)) {
    return defaults;
  }
  try {
    for (const rev of defaults) {
      await setDoc(doc(db, REVIEWS_COLLECTION, rev.id), rev);
    }
    return defaults;
  } catch (e) {
    console.warn('Seed baseline reviews notice:', e);
    return defaults;
  }
}

export async function saveReviewToFirestore(review: ReviewRecord): Promise<void> {
  const docId = (review.id || '').trim();
  const path = `${REVIEWS_COLLECTION}/${docId}`;
  try {
    const payload = stripUndefinedDeep({
      ...review,
      id: docId,
      name: (review.name || 'Verified Customer').trim(),
      rating: Math.max(1, Math.min(5, Number(review.rating) || 5)),
      comment: (review.comment || '').trim()
    });
    await setDoc(doc(db, REVIEWS_COLLECTION, docId), payload, { merge: true });
    await logAdminActivity(
      'Review Updated',
      `Review by ${payload.name} (${payload.rating}★) — Status: ${payload.status}, Featured: ${Boolean(payload.isFeatured)}`
    );
  } catch (error) {
    console.error('saveReviewToFirestore failed:', error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteReviewFromFirestore(reviewId: string): Promise<void> {
  const path = `${REVIEWS_COLLECTION}/${reviewId}`;
  try {
    await deleteDoc(doc(db, REVIEWS_COLLECTION, reviewId));
    await logAdminActivity('Review Deleted', `Deleted review ID ${reviewId}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// 4. PAYMENT SETTINGS & QR MANAGEMENT
// -------------------------------------------------------------

export function subscribeToPaymentSettings(callback: (methods: PaymentMethodSetting[]) => void): () => void {
  try {
    const q = query(collection(db, PAYMENT_SETTINGS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          seedBaselinePaymentSettings().then(callback);
        } else {
          const list = snapshot.docs.map((d) => ({
            ...(d.data() as PaymentMethodSetting),
            id: d.id
          }));
          list.sort((a, b) => a.displayOrder - b.displayOrder);
          callback(list);
        }
      },
      (error) => {
        console.warn('Real-time payment settings notice:', error);
      }
    );
  } catch (err) {
    console.warn('subscribeToPaymentSettings caught error:', err);
    return () => {};
  }
}

export async function seedBaselinePaymentSettings(): Promise<PaymentMethodSetting[]> {
  const defaults: PaymentMethodSetting[] = [
    {
      id: 'cod',
      code: 'cod',
      name: 'Cash on Delivery (COD)',
      enabled: true,
      instructions: 'Pay securely in cash or via mobile scanner upon parcel delivery anywhere in Nepal.',
      displayOrder: 1,
      requiresScreenshot: false
    },
    {
      id: 'esewa',
      code: 'esewa',
      name: 'eSewa Mobile Wallet',
      enabled: true,
      accountName: 'FitYatra Nutrition Nepal',
      accountNumber: '9705283444',
      qrImageUrl: '',
      instructions:
        'Scan the eSewa QR code or transfer directly to the eSewa mobile number. Upload the transaction screenshot below.',
      displayOrder: 2,
      requiresScreenshot: true
    },
    {
      id: 'bank',
      code: 'bank',
      name: 'Bank Direct Transfer (Fonepay / IPS)',
      enabled: true,
      accountName: 'FitYatra Supplement Pvt. Ltd.',
      accountNumber: '0120100012345601 (Nabil Bank)',
      qrImageUrl: '',
      instructions: 'Transfer the exact order amount and upload the payment receipt/screenshot.',
      displayOrder: 3,
      requiresScreenshot: true
    }
  ];

  if (!isAuthorizedAdminUser(auth.currentUser)) {
    return defaults;
  }
  try {
    for (const item of defaults) {
      await setDoc(doc(db, PAYMENT_SETTINGS_COLLECTION, item.id), item);
    }
    return defaults;
  } catch (e) {
    console.warn('Seeding payment settings notice:', e);
    return defaults;
  }
}

export async function savePaymentSettingToFirestore(setting: PaymentMethodSetting): Promise<void> {
  const docId = (setting.id || '').trim();
  const path = `${PAYMENT_SETTINGS_COLLECTION}/${docId}`;
  try {
    const payload = stripUndefinedDeep({
      ...setting,
      id: docId
    });
    await setDoc(doc(db, PAYMENT_SETTINGS_COLLECTION, docId), payload, { merge: true });
    await logAdminActivity('Payment Method Updated', `Updated payment method ${setting.name}`);
  } catch (error) {
    console.error('savePaymentSettingToFirestore failed:', error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deletePaymentSettingFromFirestore(id: string): Promise<void> {
  const path = `${PAYMENT_SETTINGS_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, PAYMENT_SETTINGS_COLLECTION, id));
    await logAdminActivity('Payment Method Removed', `Deleted payment method ID ${id}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// 5. PROMOTIONAL BANNERS MANAGEMENT
// -------------------------------------------------------------

export function subscribeToBanners(callback: (banners: StoreBanner[]) => void): () => void {
  try {
    const q = query(collection(db, BANNERS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty && !hasSeededBanners) {
          hasSeededBanners = true;
          const defaultHero: StoreBanner = {
            id: 'banner-hero-main',
            title: 'REDEFINE YOURSELF.',
            subtitle: '100% Authentic Lab-Tested Supplements Delivered Across Nepal',
            imageUrl: 'https://i.ibb.co/DFnZ5Fy/Phone-Version-4-1-1-1.jpg',
            videoUrl: '',
            buttonText: 'Buy Now',
            buttonLink: '#catalog',
            enabled: true,
            displayOrder: 1,
            displayLocation: 'hero',
            createdAt: new Date().toISOString()
          };
          if (isAuthorizedAdminUser(auth.currentUser)) {
            setDoc(doc(db, BANNERS_COLLECTION, defaultHero.id), defaultHero)
              .then(() => callback([defaultHero]))
              .catch(() => callback([defaultHero]));
          } else {
            callback([defaultHero]);
          }
        } else {
          const banners = snapshot.docs.map((d) => ({
            ...(d.data() as StoreBanner),
            id: d.id
          }));
          banners.sort((a, b) => (a.displayOrder || 1) - (b.displayOrder || 1));
          callback(banners);
        }
      },
      (error) => {
        console.warn('Real-time banners notice:', error);
      }
    );
  } catch (err) {
    console.warn('subscribeToBanners caught error:', err);
    return () => {};
  }
}

export async function saveBannerToFirestore(banner: StoreBanner): Promise<void> {
  const docId = (banner.id || '').trim();
  const path = `${BANNERS_COLLECTION}/${docId}`;
  try {
    const payload = stripUndefinedDeep({
      ...banner,
      id: docId
    });
    await setDoc(doc(db, BANNERS_COLLECTION, docId), payload, { merge: true });
    await logAdminActivity('Banner Updated', `Saved banner ${banner.title}`);
  } catch (error) {
    console.error('saveBannerToFirestore failed:', error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteBannerFromFirestore(bannerId: string): Promise<void> {
  const path = `${BANNERS_COLLECTION}/${bannerId}`;
  try {
    await deleteDoc(doc(db, BANNERS_COLLECTION, bannerId));
    await logAdminActivity('Banner Deleted', `Deleted banner ID ${bannerId}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// 6. STORE SETTINGS (OPEN FOR ORDER, STORE INFO, REDEFINE VIDEO)
// -------------------------------------------------------------

export function subscribeToStoreSettings(callback: (settings: StoreSettings) => void): () => void {
  try {
    const docRef = doc(db, STORE_SETTINGS_COLLECTION, 'general');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as StoreSettings;
          // Ensure redefineVideoUrl is seeded in DB if never initialized before
          if (data.redefineVideoUrl === undefined) {
            const patched: StoreSettings = {
              ...data,
              redefineVideoUrl: DEFAULT_REDEFINE_VIDEO_URL,
              redefineVideoPosterUrl: data.redefineVideoPosterUrl ?? DEFAULT_REDEFINE_POSTER_URL,
              redefineVideoHeading: data.redefineVideoHeading || 'Redefine Yourself',
              redefineVideoEnabled: data.redefineVideoEnabled ?? true
            };
            if (isAuthorizedAdminUser(auth.currentUser)) {
              setDoc(docRef, patched, { merge: true }).catch(console.warn);
            }
            callback(patched);
          } else {
            callback(data);
          }
        } else {
          const defaultSettings: StoreSettings = {
            id: 'general',
            openForOrders: true,
            announcementText: 'Make Health Better Again',
            storeName: 'FitYatra Supplement Nepal',
            supportPhone: '970-5283444',
            supportEmail: 'support@fityatra.store',
            currency: 'NPR',
            redefineVideoUrl: DEFAULT_REDEFINE_VIDEO_URL,
            redefineVideoPosterUrl: DEFAULT_REDEFINE_POSTER_URL,
            redefineVideoHeading: 'Redefine Yourself',
            redefineVideoEnabled: true
          };
          if (isAuthorizedAdminUser(auth.currentUser)) {
            setDoc(docRef, defaultSettings).catch(console.warn);
          }
          callback(defaultSettings);
        }
      },
      (error) => {
        console.warn('Real-time store settings notice:', error);
      }
    );
  } catch (err) {
    console.warn('subscribeToStoreSettings caught error:', err);
    return () => {};
  }
}

export async function updateStoreSettingsInFirestore(updates: Partial<StoreSettings>): Promise<void> {
  const path = `${STORE_SETTINGS_COLLECTION}/general`;
  try {
    const payload = stripUndefinedDeep({
      ...updates,
      id: 'general'
    });
    await setDoc(doc(db, STORE_SETTINGS_COLLECTION, 'general'), payload, { merge: true });
    await logAdminActivity('Store Settings Updated', `Updated store operational configuration`);
  } catch (error) {
    console.error('updateStoreSettingsInFirestore failed:', error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// -------------------------------------------------------------
// 7. ADMIN ACTIVITY AUDIT LOG
// -------------------------------------------------------------

export async function logAdminActivity(action: string, details?: string): Promise<void> {
  if (!isAuthorizedAdminUser(auth.currentUser)) return;
  try {
    const id = `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const record: AdminActivity = {
      id,
      action,
      details: details || '',
      adminEmail: auth.currentUser?.email || 'young829229@gmail.com',
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, ADMIN_ACTIVITY_COLLECTION, id), record);
  } catch (e) {
    console.warn('Admin activity logging notice:', e);
  }
}

export function subscribeToAdminActivity(callback: (activities: AdminActivity[]) => void): () => void {
  try {
    const q = query(collection(db, ADMIN_ACTIVITY_COLLECTION), orderBy('createdAt', 'desc'), limit(50));
    return onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => d.data() as AdminActivity);
        callback(list);
      },
      (error) => {
        console.warn('Real-time admin activity notice:', error);
      }
    );
  } catch (err) {
    console.warn('subscribeToAdminActivity caught error:', err);
    return () => {};
  }
}

// -------------------------------------------------------------
// 8. CUSTOMER DATA: CONTACT US SUBMISSIONS & EMAIL SUBSCRIBERS
// -------------------------------------------------------------

export async function submitContactMessageToFirestore(data: {
  name: string;
  email: string;
  phone?: string;
  comment?: string;
  source?: string;
}): Promise<ContactSubmission> {
  const id = `contact_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const path = `${CONTACT_SUBMISSIONS_COLLECTION}/${id}`;
  const submission: ContactSubmission = {
    id,
    name: (data.name || 'Customer').trim().slice(0, 128),
    email: data.email.trim().slice(0, 160),
    phone: (data.phone || '').trim().slice(0, 40),
    comment: (data.comment || '').trim().slice(0, 4096),
    source: (data.source || 'contact_form').slice(0, 64),
    status: 'new',
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, CONTACT_SUBMISSIONS_COLLECTION, id), submission);
    // Also record email in email_subscribers if valid
    if (submission.email) {
      await saveEmailSubscriberToFirestore(submission.email, 'contact_form').catch(() => {});
    }
    return submission;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export function subscribeToContactSubmissions(
  callback: (submissions: ContactSubmission[]) => void
): () => void {
  try {
    const q = query(collection(db, CONTACT_SUBMISSIONS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          ...(d.data() as ContactSubmission),
          id: d.id
        }));
        list.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        callback(list);
      },
      (error) => {
        console.warn('Real-time contact submissions notice:', error);
      }
    );
  } catch (err) {
    console.warn('subscribeToContactSubmissions caught error:', err);
    return () => {};
  }
}

export async function updateContactSubmissionStatusInFirestore(
  id: string,
  status: ContactSubmission['status']
): Promise<void> {
  const path = `${CONTACT_SUBMISSIONS_COLLECTION}/${id}`;
  try {
    await updateDoc(doc(db, CONTACT_SUBMISSIONS_COLLECTION, id), { status });
    await logAdminActivity('Contact Inquiry Updated', `Marked inquiry ${id} as ${status}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteContactSubmissionFromFirestore(id: string): Promise<void> {
  const path = `${CONTACT_SUBMISSIONS_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, CONTACT_SUBMISSIONS_COLLECTION, id));
    await logAdminActivity('Contact Inquiry Deleted', `Deleted contact inquiry ${id}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveEmailSubscriberToFirestore(
  email: string,
  source = 'footer'
): Promise<EmailSubscriber> {
  const cleanEmail = email.trim().toLowerCase().slice(0, 160);
  // Deterministic safe ID based on email so duplicate emails update cleanly
  const safeId =
    'sub_' +
    cleanEmail.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 90) +
    '_' +
    Math.random().toString(36).substring(2, 5);
  const path = `${EMAIL_SUBSCRIBERS_COLLECTION}/${safeId}`;
  const subscriber: EmailSubscriber = {
    id: safeId,
    email: cleanEmail,
    source: source.slice(0, 64),
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, EMAIL_SUBSCRIBERS_COLLECTION, safeId), subscriber);
    return subscriber;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export function subscribeToEmailSubscribers(
  callback: (subscribers: EmailSubscriber[]) => void
): () => void {
  try {
    const q = query(collection(db, EMAIL_SUBSCRIBERS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          ...(d.data() as EmailSubscriber),
          id: d.id
        }));
        list.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        callback(list);
      },
      (error) => {
        console.warn('Real-time email subscribers notice:', error);
      }
    );
  } catch (err) {
    console.warn('subscribeToEmailSubscribers caught error:', err);
    return () => {};
  }
}

export async function deleteEmailSubscriberFromFirestore(id: string): Promise<void> {
  const path = `${EMAIL_SUBSCRIBERS_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, EMAIL_SUBSCRIBERS_COLLECTION, id));
    await logAdminActivity('Subscriber Removed', `Deleted email subscriber ${id}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
