import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  AlertTriangle,
  Star,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Radio,
  ShieldCheck
} from 'lucide-react';
import { Order, Product, ReviewRecord, AdminActivity } from '../../types';

interface AdminDashboardTabProps {
  orders: Order[];
  products: Product[];
  reviews: ReviewRecord[];
  activities: AdminActivity[];
  onViewOrder: (order: Order) => void;
  onNavigateToTab: (tab: any) => void;
}

export default function AdminDashboardTab({
  orders = [],
  products = [],
  reviews = [],
  activities = [],
  onViewOrder,
  onNavigateToTab
}: AdminDashboardTabProps) {
  // Real live statistics derived from Firebase collections
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const verifiedOrders = orders.filter(
    (o) => o.paymentStatus === 'verified' || o.status === 'confirmed' || o.status === 'processing' || o.status === 'shipped'
  );
  const completedOrders = orders.filter((o) => o.status === 'delivered');
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled');

  const outOfStockProducts = products.filter(
    (p) => p.isSoldOut || (typeof p.stock === 'number' && p.stock <= 0)
  );
  const pendingReviews = reviews.filter((r) => r.status === 'pending');
  const featuredReviews = reviews.filter((r) => r.isFeatured);

  const recentOrders = orders.slice(0, 8);
  const recentReviews = reviews.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Primary KPI Stat Cards (Row 1) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Gross Revenue & Total Orders */}
        <div
          onClick={() => onNavigateToTab('orders')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col justify-between hover:border-neutral-900 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders & Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-neutral-950">
            {orders.length} Orders
          </div>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Rs {totalRevenue.toLocaleString()} Revenue
          </span>
        </div>

        {/* 2. Pending Orders */}
        <div
          onClick={() => onNavigateToTab('live_orders')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col justify-between hover:border-neutral-900 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Orders</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-neutral-950">
            {pendingOrders.length}
          </div>
          <span className="text-[11px] text-amber-700 font-semibold mt-1">
            {verifiedOrders.length} Verified / Confirmed
          </span>
        </div>

        {/* 3. Total Products & Out-of-Stock */}
        <div
          onClick={() => onNavigateToTab('stock')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col justify-between hover:border-neutral-900 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Products</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-neutral-950">
            {products.length} Products
          </div>
          <span className="text-[11px] font-semibold mt-1 text-neutral-500">
            {outOfStockProducts.length > 0 ? (
              <span className="text-red-600 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {outOfStockProducts.length} Out of stock
              </span>
            ) : (
              <span className="text-emerald-600 font-bold">0 Out of stock</span>
            )}
          </span>
        </div>

        {/* 4. Total Reviews & Pending Reviews */}
        <div
          onClick={() => onNavigateToTab('reviews')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col justify-between hover:border-neutral-900 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Reviews</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <Star className="w-4 h-4 fill-orange-400" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-neutral-950">
            {reviews.length} Reviews
          </div>
          <span className="text-[11px] font-semibold mt-1">
            {pendingReviews.length > 0 ? (
              <span className="text-amber-600 font-bold">{pendingReviews.length} Pending Moderation</span>
            ) : (
              <span className="text-neutral-500">
                0 Pending • {featuredReviews.length} Featured
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Order Status Breakdown Strip (Verified, Completed, Cancelled, Out-of-Stock) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white px-4 py-3 rounded-xl border border-neutral-200/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-neutral-400 block">
              Verified / Confirmed
            </span>
            <span className="text-base font-black text-blue-700">{verifiedOrders.length}</span>
          </div>
          <ShieldCheck className="w-4 h-4 text-blue-600" />
        </div>

        <div className="bg-white px-4 py-3 rounded-xl border border-neutral-200/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-neutral-400 block">
              Completed Orders
            </span>
            <span className="text-base font-black text-emerald-700">{completedOrders.length}</span>
          </div>
          <CheckCircle className="w-4 h-4 text-emerald-600" />
        </div>

        <div className="bg-white px-4 py-3 rounded-xl border border-neutral-200/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-neutral-400 block">
              Cancelled Orders
            </span>
            <span className="text-base font-black text-neutral-600">{cancelledOrders.length}</span>
          </div>
          <XCircle className="w-4 h-4 text-neutral-400" />
        </div>

        <div className="bg-white px-4 py-3 rounded-xl border border-neutral-200/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-neutral-400 block">
              Out-of-Stock Items
            </span>
            <span className="text-base font-black text-red-600">{outOfStockProducts.length}</span>
          </div>
          <AlertTriangle className="w-4 h-4 text-red-500" />
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-base font-black text-neutral-900 tracking-tight">
            Recent Orders
          </h3>

          <button
            type="button"
            onClick={() => onNavigateToTab('orders')}
            className="text-xs font-bold text-neutral-900 hover:text-black flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>View All ({orders.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-neutral-400 text-xs font-medium">
            No orders placed yet. Orders from the live customer checkout will appear here automatically.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 uppercase font-mono text-[10px] tracking-wider border-b border-neutral-100">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Products</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4">Order Status</th>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {recentOrders.map((order) => {
                  const statusColors: Record<string, string> = {
                    pending: 'bg-amber-50 text-amber-800 border-amber-200',
                    confirmed: 'bg-blue-50 text-blue-800 border-blue-200',
                    processing: 'bg-indigo-50 text-indigo-800 border-indigo-200',
                    shipped: 'bg-purple-50 text-purple-800 border-purple-200',
                    delivered: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    cancelled: 'bg-neutral-100 text-neutral-600 border-neutral-300'
                  };

                  const productsSummary =
                    (order.items || [])
                      .map((it) => `${it.productName} (x${it.quantity})`)
                      .join(', ') || 'Supplement Order';

                  const dateObj = order.createdAt ? new Date(order.createdAt) : null;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-neutral-50/70 transition-colors cursor-pointer"
                      onClick={() => onViewOrder(order)}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-neutral-900 whitespace-nowrap">
                        #{order.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                            {order.customerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-neutral-900 block truncate max-w-[130px]">
                              {order.customerName}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {order.phone}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-[180px]">
                        <span className="text-neutral-800 font-semibold truncate block">
                          {productsSummary}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-black text-neutral-950 text-sm whitespace-nowrap">
                        Rs {order.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize font-bold text-neutral-800 block text-[11px]">
                          {order.paymentMethod}
                        </span>
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded inline-block ${
                            order.paymentStatus === 'verified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.paymentStatus === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 text-[10px] font-black uppercase rounded-full border ${
                            statusColors[order.status] || 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                        {dateObj ? (
                          <>
                            <div>
                              {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="text-[9px] text-neutral-400">
                              {dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </div>
                          </>
                        ) : (
                          'Just now'
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewOrder(order);
                          }}
                          className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-900 hover:text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom Grid: Recent Reviews & Recent Admin Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Reviews Card */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <h3 className="text-sm font-black text-neutral-900 uppercase tracking-tight">
                Recent Customer Reviews
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('reviews')}
              className="text-[11px] font-bold text-neutral-700 hover:text-black underline cursor-pointer"
            >
              Moderate All
            </button>
          </div>

          {recentReviews.length === 0 ? (
            <p className="text-xs text-neutral-400">No customer reviews yet.</p>
          ) : (
            <div className="space-y-2.5">
              {recentReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900">{rev.name}</span>
                      <span className="text-amber-500 font-bold">{'★'.repeat(rev.rating)}</span>
                      {rev.isFeatured && (
                        <span className="text-[9px] font-black uppercase bg-[#FFCD00] text-black px-1.5 py-0.2 rounded">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-neutral-600 line-clamp-1 mt-0.5">{rev.comment}</p>
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                      rev.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rev.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {rev.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Admin Audit Log Section */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-neutral-700" />
              <h3 className="text-sm font-black text-neutral-900 uppercase tracking-tight">
                Recent Admin Activity
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('activity')}
              className="text-[11px] font-bold text-neutral-700 hover:text-black underline cursor-pointer"
            >
              Full Audit Log
            </button>
          </div>

          {activities.length === 0 ? (
            <p className="text-xs text-neutral-400">No activity recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {activities.slice(0, 5).map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-lg text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 shrink-0" />
                    <span className="font-bold text-neutral-900 shrink-0">{act.action}:</span>
                    <span className="text-neutral-600 truncate">{act.details}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono shrink-0 ml-2">
                    {new Date(act.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
