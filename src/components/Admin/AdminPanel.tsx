import { useState, useEffect } from 'react';
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
} from '../../types';
import AdminSidebar, { AdminTab } from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminDashboardTab from './AdminDashboardTab';
import AdminOrdersTab from './AdminOrdersTab';
import AdminCustomerDataTab from './AdminCustomerDataTab';
import AdminProductsTab from './AdminProductsTab';
import AdminStockTab from './AdminStockTab';
import AdminReviewsTab from './AdminReviewsTab';
import AdminPaymentsTab from './AdminPaymentsTab';
import AdminBannersTab from './AdminBannersTab';
import AdminActivityTab from './AdminActivityTab';
import {
  subscribeToOrders,
  subscribeToProducts,
  subscribeToReviews,
  subscribeToPaymentSettings,
  subscribeToBanners,
  subscribeToStoreSettings,
  subscribeToAdminActivity,
  subscribeToContactSubmissions,
  subscribeToEmailSubscribers,
  saveProductToFirestore,
  deleteProductFromFirestore,
  updateOrderStatusInFirestore,
  updateOrderPaymentStatusInFirestore,
  saveReviewToFirestore,
  deleteReviewFromFirestore,
  savePaymentSettingToFirestore,
  deletePaymentSettingFromFirestore,
  saveBannerToFirestore,
  deleteBannerFromFirestore,
  updateStoreSettingsInFirestore,
  updateContactSubmissionStatusInFirestore,
  deleteContactSubmissionFromFirestore,
  saveEmailSubscriberToFirestore,
  deleteEmailSubscriberFromFirestore
} from '../../services/firestoreService';
import { auth } from '../../firebase';

interface AdminPanelProps {
  onBackToStore: () => void;
  onOpenPageBuilder?: (product: Product) => void;
}

export default function AdminPanel({ onBackToStore, onOpenPageBuilder }: AdminPanelProps) {
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);

  // Real live database state from Firebase
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentMethodSetting[]>([]);
  const [banners, setBanners] = useState<StoreBanner[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [emailSubscribers, setEmailSubscribers] = useState<EmailSubscriber[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    id: 'general',
    openForOrders: true,
    announcementText: 'FLAT RS 200 DELIVERY ACROSS NEPAL • CASH ON DELIVERY & ESEWA AVAILABLE',
    storeName: 'FitYatra Supplement Nepal',
    supportPhone: '+977 980-0000000',
    supportEmail: 'support@fityatra.com',
    currency: 'NPR'
  });
  const [activities, setActivities] = useState<AdminActivity[]>([]);

  // Realtime Firebase Subscriptions
  useEffect(() => {
    const unsubOrders = subscribeToOrders((liveOrders) => setOrders(liveOrders));
    const unsubProducts = subscribeToProducts((liveProds) => setProducts(liveProds));
    const unsubReviews = subscribeToReviews((liveReviews) => setReviews(liveReviews));
    const unsubPayments = subscribeToPaymentSettings((livePayments) => setPaymentSettings(livePayments));
    const unsubBanners = subscribeToBanners((liveBanners) => setBanners(liveBanners));
    const unsubSettings = subscribeToStoreSettings((liveSettings) => setStoreSettings(liveSettings));
    const unsubActivity = subscribeToAdminActivity((liveAct) => setActivities(liveAct));
    const unsubContacts = subscribeToContactSubmissions((liveContacts) =>
      setContactSubmissions(liveContacts)
    );
    const unsubSubscribers = subscribeToEmailSubscribers((liveSubs) =>
      setEmailSubscribers(liveSubs)
    );

    return () => {
      unsubOrders();
      unsubProducts();
      unsubReviews();
      unsubPayments();
      unsubBanners();
      unsubSettings();
      unsubActivity();
      unsubContacts();
      unsubSubscribers();
    };
  }, []);

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const pendingReviewsCount = reviews.filter((r) => r.status === 'pending').length;
  const newContactsCount = contactSubmissions.filter((c) => c.status === 'new').length;

  const handleToggleStoreStatus = async () => {
    const nextStatus = !storeSettings.openForOrders;
    setStoreSettings((prev) => ({ ...prev, openForOrders: nextStatus }));
    await updateStoreSettingsInFirestore({ openForOrders: nextStatus });
  };

  const handleSignOut = () => {
    try {
      sessionStorage.removeItem('fityatra_admin_verified_email');
    } catch {}
    auth.signOut().catch(console.warn);
    onBackToStore();
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrderForModal(order);
    setCurrentTab('orders');
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-neutral-900 font-sans flex flex-col antialiased">
      {/* Sidebar Navigation inspired by reference screenshot */}
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setSelectedOrderForModal(null);
        }}
        pendingOrdersCount={pendingOrdersCount}
        pendingReviewsCount={pendingReviewsCount}
        newContactsCount={newContactsCount}
        storeSettings={storeSettings}
        onToggleStoreStatus={handleToggleStoreStatus}
        onBackToStore={onBackToStore}
        onSignOut={handleSignOut}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Layout with 64px offset on desktop for sidebar */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Top Header matching reference screenshot */}
        <AdminHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          pendingOrdersCount={pendingOrdersCount}
          storeSettings={storeSettings}
          onToggleStoreStatus={handleToggleStoreStatus}
          adminEmail={auth.currentUser?.email || 'young829229@gmail.com'}
          onSignOut={handleSignOut}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Dynamic Tab Body */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <AdminDashboardTab
              orders={orders}
              products={products}
              reviews={reviews}
              activities={activities}
              onViewOrder={handleViewOrder}
              onNavigateToTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'live_orders' && (
            <AdminOrdersTab
              orders={orders}
              onUpdateStatus={updateOrderStatusInFirestore}
              onUpdatePaymentStatus={updateOrderPaymentStatusInFirestore}
              selectedOrderForModal={selectedOrderForModal}
              onClearSelectedOrder={() => setSelectedOrderForModal(null)}
              isLiveOnly={true}
            />
          )}

          {currentTab === 'orders' && (
            <AdminOrdersTab
              orders={orders}
              onUpdateStatus={updateOrderStatusInFirestore}
              onUpdatePaymentStatus={updateOrderPaymentStatusInFirestore}
              selectedOrderForModal={selectedOrderForModal}
              onClearSelectedOrder={() => setSelectedOrderForModal(null)}
              isLiveOnly={false}
            />
          )}

          {currentTab === 'customer_data' && (
            <AdminCustomerDataTab
              contactSubmissions={contactSubmissions}
              emailSubscribers={emailSubscribers}
              orders={orders}
              onUpdateContactStatus={updateContactSubmissionStatusInFirestore}
              onDeleteContact={deleteContactSubmissionFromFirestore}
              onAddEmailSubscriber={saveEmailSubscriberToFirestore}
              onDeleteEmailSubscriber={deleteEmailSubscriberFromFirestore}
            />
          )}

          {currentTab === 'products' && (
            <AdminProductsTab
              products={products}
              onSaveProduct={saveProductToFirestore}
              onDeleteProduct={deleteProductFromFirestore}
              onOpenPageBuilder={onOpenPageBuilder}
            />
          )}

          {currentTab === 'stock' && (
            <AdminStockTab
              products={products}
              onSaveProduct={saveProductToFirestore}
            />
          )}

          {currentTab === 'reviews' && (
            <AdminReviewsTab
              reviews={reviews}
              products={products}
              onSaveReview={saveReviewToFirestore}
              onDeleteReview={deleteReviewFromFirestore}
            />
          )}

          {currentTab === 'payments' && (
            <AdminPaymentsTab
              paymentSettings={paymentSettings}
              onSaveSetting={savePaymentSettingToFirestore}
              onDeleteSetting={deletePaymentSettingFromFirestore}
            />
          )}

          {currentTab === 'banners' && (
            <AdminBannersTab
              banners={banners}
              storeSettings={storeSettings}
              onUpdateStoreSettings={updateStoreSettingsInFirestore}
              onSaveBanner={saveBannerToFirestore}
              onDeleteBanner={deleteBannerFromFirestore}
            />
          )}

          {currentTab === 'activity' && (
            <AdminActivityTab activities={activities} />
          )}
        </main>
      </div>
    </div>
  );
}
