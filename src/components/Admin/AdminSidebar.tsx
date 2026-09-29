import {
  LayoutDashboard,
  ShoppingBag,
  History,
  Package,
  Layers,
  Star,
  CreditCard,
  Image as ImageIcon,
  Activity,
  LogOut,
  Sliders,
  ExternalLink,
  ChevronRight,
  Flame,
  Radio,
  Users
} from 'lucide-react';
import { StoreSettings } from '../../types';

export type AdminTab =
  | 'dashboard'
  | 'live_orders'
  | 'orders'
  | 'customer_data'
  | 'products'
  | 'stock'
  | 'reviews'
  | 'payments'
  | 'banners'
  | 'activity';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  pendingOrdersCount: number;
  pendingReviewsCount: number;
  newContactsCount?: number;
  storeSettings?: StoreSettings;
  onToggleStoreStatus?: () => void;
  onBackToStore: () => void;
  onSignOut: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function AdminSidebar({
  currentTab,
  onSelectTab,
  pendingOrdersCount,
  pendingReviewsCount,
  newContactsCount = 0,
  storeSettings,
  onToggleStoreStatus,
  onBackToStore,
  onSignOut,
  isMobileOpen = false,
  onCloseMobile
}: AdminSidebarProps) {
  const navItems = [
    {
      id: 'dashboard' as AdminTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'live_orders' as AdminTab,
      label: 'Live Orders',
      icon: Radio,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
      badgeColor: 'bg-red-500 text-white'
    },
    {
      id: 'orders' as AdminTab,
      label: 'Order History',
      icon: History,
      badge: null
    },
    {
      id: 'customer_data' as AdminTab,
      label: 'Customer Data',
      icon: Users,
      badge: newContactsCount > 0 ? newContactsCount : null,
      badgeColor: 'bg-blue-600 text-white'
    },
    {
      id: 'products' as AdminTab,
      label: 'Products',
      icon: Package,
      badge: null
    },
    {
      id: 'stock' as AdminTab,
      label: 'Stock / Inventory',
      icon: Layers,
      badge: null
    },
    {
      id: 'reviews' as AdminTab,
      label: 'Reviews',
      icon: Star,
      badge: pendingReviewsCount > 0 ? pendingReviewsCount : null,
      badgeColor: 'bg-amber-500 text-black'
    },
    {
      id: 'payments' as AdminTab,
      label: 'Payment & QRs',
      icon: CreditCard,
      badge: null
    },
    {
      id: 'banners' as AdminTab,
      label: 'Banners & Videos',
      icon: ImageIcon,
      badge: null
    },
    {
      id: 'activity' as AdminTab,
      label: 'Activity Log',
      icon: Activity,
      badge: null
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-neutral-950/60 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-neutral-200 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-neutral-950 text-red-600 flex items-center justify-center font-black text-sm tracking-tighter">
                FY
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm text-neutral-950 tracking-tight leading-none">
                  FITYATRA
                </span>
                <span className="text-[9px] font-mono tracking-widest text-neutral-400 uppercase mt-0.5">
                  ADMIN CONSOLE
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onBackToStore}
              className="text-neutral-400 hover:text-neutral-900 transition-colors p-1"
              title="View Live Store"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile?.();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold transition-all rounded-lg cursor-pointer ${
                    isActive
                      ? 'bg-neutral-950 text-white shadow-xs font-black'
                      : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-[#FFCD00]' : 'text-neutral-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== null && (
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Store Status & Sign Out */}
        <div className="p-3 border-t border-neutral-100 space-y-2 bg-neutral-50/50">
          {/* Open For Order / Busy Mode Switch matching screenshot */}
          <div className="flex items-center justify-between p-2.5 bg-white border border-neutral-200 rounded-lg">
            <div className="flex flex-col">
              <span className="text-[11px] font-extrabold text-neutral-900">
                {storeSettings?.openForOrders ? 'Open For Orders' : 'Store Offline'}
              </span>
              <span className="text-[9px] text-neutral-500">
                {storeSettings?.openForOrders ? 'Accepting COD & eSewa' : 'Orders paused'}
              </span>
            </div>

            <button
              type="button"
              onClick={onToggleStoreStatus}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                storeSettings?.openForOrders ? 'bg-emerald-500' : 'bg-neutral-300'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  storeSettings?.openForOrders ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sign Out / Exit to Store */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={onBackToStore}
              className="text-[11px] font-bold text-neutral-600 hover:text-black flex items-center gap-1.5 px-2 py-1 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Customer Store</span>
            </button>

            <button
              type="button"
              onClick={onSignOut}
              className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 px-2 py-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
