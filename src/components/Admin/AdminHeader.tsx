import { Search, Bell, Menu, Shield, CheckCircle, ChevronDown, LogOut } from 'lucide-react';
import { useState } from 'react';
import { StoreSettings } from '../../types';

interface AdminHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  pendingOrdersCount: number;
  storeSettings?: StoreSettings;
  onToggleStoreStatus?: () => void;
  adminEmail?: string | null;
  onSignOut: () => void;
  onOpenMobileMenu: () => void;
}

export default function AdminHeader({
  searchQuery,
  onSearchChange,
  pendingOrdersCount,
  storeSettings,
  onToggleStoreStatus,
  adminEmail = 'young829229@gmail.com',
  onSignOut,
  onOpenMobileMenu
}: AdminHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      {/* Mobile Hamburger + Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded-lg cursor-pointer"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search orders, customers, products..."
            className="w-full bg-neutral-100/80 hover:bg-neutral-100 focus:bg-white border border-transparent focus:border-neutral-900 rounded-full py-2 pl-9 pr-4 text-xs font-medium placeholder-neutral-400 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Right Header Controls matching screenshot */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* "Open For Order" Indicator Pill */}
        <div
          onClick={onToggleStoreStatus}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-full cursor-pointer transition-colors"
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                storeSettings?.openForOrders ? 'bg-emerald-400' : 'bg-red-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                storeSettings?.openForOrders ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
          </span>
          <span className="text-[11px] font-bold text-neutral-800 select-none">
            {storeSettings?.openForOrders ? 'Open For Order' : 'Store Paused'}
          </span>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            type="button"
            className="p-2 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-full transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {pendingOrdersCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white" />
            )}
          </button>
        </div>

        {/* Admin Profile matching screenshot (photo / avatar, name, dropdown) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1 pl-2 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer select-none"
          >
            <div className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs ring-1 ring-neutral-300">
              {adminEmail ? adminEmail.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-neutral-900 leading-tight truncate max-w-[130px]">
                {adminEmail ? adminEmail.split('@')[0] : 'Administrator'}
              </span>
              <span className="text-[9px] font-mono text-emerald-600 flex items-center gap-0.5">
                <CheckCircle className="w-2.5 h-2.5" />
                Verified Admin
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-xl shadow-lg p-2 z-50 text-xs">
              <div className="p-2 border-b border-neutral-100">
                <p className="font-bold text-neutral-900 truncate">{adminEmail || 'admin@fityatra.com'}</p>
                <p className="text-[10px] text-neutral-400 font-mono">Master Administrator</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  onSignOut();
                }}
                className="w-full flex items-center gap-2 px-2 py-2 mt-1 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
