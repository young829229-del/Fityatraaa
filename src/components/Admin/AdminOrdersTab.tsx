import { useState } from 'react';
import {
  Search,
  MoreVertical,
  Calendar,
  CheckCircle2,
  Truck,
  XCircle,
  Eye,
  Phone,
  MapPin,
  X,
  ShieldCheck,
  Save,
  Check
} from 'lucide-react';
import { Order } from '../../types';

interface AdminOrdersTabProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: Order['status'], adminNotes?: string) => Promise<void>;
  onUpdatePaymentStatus: (
    orderId: string,
    paymentStatus: Order['paymentStatus'],
    adminNotes?: string
  ) => Promise<void>;
  selectedOrderForModal?: Order | null;
  onClearSelectedOrder?: () => void;
  isLiveOnly?: boolean;
}

export default function AdminOrdersTab({
  orders = [],
  onUpdateStatus,
  onUpdatePaymentStatus,
  selectedOrderForModal,
  onClearSelectedOrder,
  isLiveOnly = false
}: AdminOrdersTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<string>(isLiveOnly ? 'live' : 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalOrder, setActiveModalOrder] = useState<Order | null>(selectedOrderForModal || null);
  const [actionMenuOrderId, setActionMenuOrderId] = useState<string | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [screenshotModalUrl, setScreenshotModalUrl] = useState<string | null>(null);

  if (selectedOrderForModal && (!activeModalOrder || activeModalOrder.id !== selectedOrderForModal.id)) {
    setActiveModalOrder(selectedOrderForModal);
    setAdminNoteInput(selectedOrderForModal.adminNotes || '');
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery) ||
      (order.paymentMethod || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeSubTab === 'live' || isLiveOnly) {
      return order.status === 'pending' || order.status === 'confirmed';
    }
    if (activeSubTab === 'completed') {
      return order.status === 'delivered';
    }
    if (activeSubTab === 'cancelled') {
      return order.status === 'cancelled';
    }
    if (activeSubTab === 'pending') {
      return order.status === 'pending';
    }
    if (activeSubTab === 'processing') {
      return order.status === 'confirmed' || order.status === 'processing' || order.status === 'shipped';
    }
    return true;
  });

  const handleOpenDetails = (order: Order) => {
    setActiveModalOrder(order);
    setAdminNoteInput(order.adminNotes || '');
    setActionMenuOrderId(null);
  };

  const handleCloseModal = () => {
    setActiveModalOrder(null);
    onClearSelectedOrder?.();
  };

  const handleStatusChange = async (status: Order['status']) => {
    if (!activeModalOrder) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(activeModalOrder.id, status, adminNoteInput);
      setActiveModalOrder({ ...activeModalOrder, status, adminNotes: adminNoteInput });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePaymentStatusChange = async (paymentStatus: Order['paymentStatus']) => {
    if (!activeModalOrder) return;
    setIsUpdating(true);
    try {
      await onUpdatePaymentStatus(activeModalOrder.id, paymentStatus, adminNoteInput);
      const nextStatus =
        paymentStatus === 'verified' && activeModalOrder.status === 'pending'
          ? 'confirmed'
          : activeModalOrder.status;
      setActiveModalOrder({
        ...activeModalOrder,
        paymentStatus,
        status: nextStatus,
        adminNotes: adminNoteInput
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotesOnly = async () => {
    if (!activeModalOrder) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(activeModalOrder.id, activeModalOrder.status, adminNoteInput);
      setActiveModalOrder({ ...activeModalOrder, adminNotes: adminNoteInput });
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatOrderTime = (isoString?: string) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const formatOrderDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  };

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="space-y-5">
      {/* Top Header & Navigation Tabs matching reference screenshot */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            {isLiveOnly ? 'Live Orders' : 'Order History'}
          </h2>

          <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl p-1.5 text-xs font-mono text-neutral-600">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <span>11 - 11 - 2021</span>
            <span className="text-neutral-400">To</span>
            <span>11 - 03 - 2022</span>
          </div>
        </div>

        {/* Sub-Navigation Tabs matching screenshot: All Order, Summary, Pending, Processing, Completed, Cancelled */}
        <div className="flex items-center gap-1 sm:gap-2 border-b border-neutral-100 pb-2 overflow-x-auto text-xs font-bold no-scrollbar">
          {[
            { id: 'all', label: `All Order (${orders.length})` },
            { id: 'summary', label: 'Summary' },
            {
              id: 'pending',
              label: `Pending (${orders.filter((o) => o.status === 'pending').length})`
            },
            {
              id: 'processing',
              label: `Confirmed / Shipped (${
                orders.filter(
                  (o) =>
                    o.status === 'confirmed' ||
                    o.status === 'processing' ||
                    o.status === 'shipped'
                ).length
              })`
            },
            {
              id: 'completed',
              label: `Completed (${orders.filter((o) => o.status === 'delivered').length})`
            },
            {
              id: 'cancelled',
              label: `Cancelled (${orders.filter((o) => o.status === 'cancelled').length})`
            }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-neutral-900 text-white font-black'
                  : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-3 relative max-w-sm">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by Order ID, phone, customer..."
            className="w-full bg-neutral-50 border border-neutral-200 rounded-lg py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:border-neutral-900"
          />
        </div>
      </div>

      {/* Summary View when "Summary" sub-tab is active */}
      {activeSubTab === 'summary' ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-2">
            <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold">
              ACTIVE ORDER REVENUE
            </span>
            <p className="text-2xl font-black text-neutral-950">
              Rs {totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-neutral-500">
              Across {orders.filter((o) => o.status !== 'cancelled').length} valid orders
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-2">
            <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold">
              VERIFIED PAYMENTS
            </span>
            <p className="text-2xl font-black text-emerald-600">
              {orders.filter((o) => o.paymentStatus === 'verified').length} Verified
            </p>
            <p className="text-xs text-neutral-500">
              {orders.filter((o) => o.paymentStatus === 'submitted').length} Screenshots awaiting verification
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-2">
            <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold">
              DELIVERY COMPLETION
            </span>
            <p className="text-2xl font-black text-blue-600">
              {orders.filter((o) => o.status === 'delivered').length} Delivered
            </p>
            <p className="text-xs text-neutral-500">
              {orders.filter((o) => o.status === 'shipped').length} Currently in transit
            </p>
          </div>
        </div>
      ) : (
        /* Orders Table matching screenshot layout */
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-neutral-400 text-xs">
              No orders found in this view. As customers complete checkout, their orders appear here in real time.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50/80 text-neutral-400 uppercase font-mono text-[10px] tracking-wider border-b border-neutral-100">
                  <tr>
                    <th className="py-3 px-4">Id</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Ordered Products</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium">
                  {filteredOrders.map((order) => {
                    const statusDots: Record<string, { dot: string; text: string }> = {
                      pending: { dot: 'bg-amber-400', text: 'text-amber-700' },
                      confirmed: { dot: 'bg-blue-500', text: 'text-blue-700' },
                      processing: { dot: 'bg-indigo-500', text: 'text-indigo-700' },
                      shipped: { dot: 'bg-purple-500', text: 'text-purple-700' },
                      delivered: { dot: 'bg-emerald-500', text: 'text-emerald-700' },
                      cancelled: { dot: 'bg-neutral-400', text: 'text-neutral-500' }
                    };

                    const isMenuOpen = actionMenuOrderId === order.id;
                    const firstItem = order.items?.[0];
                    const extraCount = (order.items?.length || 0) - 1;

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-neutral-50/80 transition-colors group cursor-pointer"
                        onClick={() => handleOpenDetails(order)}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-neutral-900 whitespace-nowrap">
                          #{order.id}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                              {order.customerName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <span className="font-extrabold text-neutral-900 block truncate max-w-[140px]">
                                {order.customerName}
                              </span>
                              <span className="text-[10px] text-neutral-400 font-mono">
                                {order.phone}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Ordered Products */}
                        <td className="py-3 px-4 max-w-[190px]">
                          {firstItem ? (
                            <div>
                              <span className="font-bold text-neutral-900 truncate block">
                                {firstItem.productName} (x{firstItem.quantity})
                              </span>
                              <span className="text-[10px] text-neutral-500 block truncate">
                                {firstItem.selectedBundle ? `${firstItem.selectedBundle} • ` : ''}
                                {firstItem.selectedFlavors?.length
                                  ? firstItem.selectedFlavors.join(', ')
                                  : firstItem.selectedVariant || ''}
                                {extraCount > 0 ? ` +${extraCount} more` : ''}
                              </span>
                            </div>
                          ) : (
                            <span className="text-neutral-400">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span className="capitalize font-bold text-neutral-800 block">
                            {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                          </span>
                          <span
                            className={`text-[9px] uppercase font-mono font-bold px-1.5 py-0.2 rounded inline-block ${
                              order.paymentStatus === 'verified'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.paymentStatus === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono text-neutral-500 whitespace-nowrap">
                          <div>{formatOrderTime(order.createdAt)}</div>
                          <div className="text-[9px] text-neutral-400">
                            {formatOrderDate(order.createdAt)}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-neutral-600">
                          <span className="font-semibold text-neutral-800 block">
                            {order.region === 'KTM_VALLEY' ? 'Kathmandu Valley' : order.region}
                          </span>
                          <span className="text-[10px] text-neutral-400 truncate max-w-[120px] block">
                            {order.address}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                statusDots[order.status]?.dot || 'bg-neutral-400'
                              }`}
                            />
                            <span
                              className={`capitalize font-bold ${
                                statusDots[order.status]?.text || 'text-neutral-700'
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-black text-neutral-950 text-sm whitespace-nowrap">
                          Rs {order.totalAmount.toLocaleString()}
                        </td>

                        <td className="py-3 px-4 text-right relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActionMenuOrderId(isMenuOpen ? null : order.id);
                            }}
                            className="p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                            aria-label="Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-4 top-10 w-44 bg-white border border-neutral-200 rounded-xl shadow-xl p-1.5 z-40 text-left text-xs font-semibold"
                            >
                              <button
                                type="button"
                                onClick={() => handleOpenDetails(order)}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-neutral-100 rounded-lg text-neutral-800 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View Order Details</span>
                              </button>

                              <button
                                type="button"
                                onClick={async () => {
                                  setActionMenuOrderId(null);
                                  await onUpdatePaymentStatus(order.id, 'verified');
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-emerald-50 text-emerald-700 rounded-lg cursor-pointer"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Verify Payment</span>
                              </button>

                              <button
                                type="button"
                                onClick={async () => {
                                  setActionMenuOrderId(null);
                                  await onUpdateStatus(order.id, 'shipped');
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-purple-50 text-purple-700 rounded-lg cursor-pointer"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Mark Shipped</span>
                              </button>

                              <button
                                type="button"
                                onClick={async () => {
                                  setActionMenuOrderId(null);
                                  await onUpdateStatus(order.id, 'delivered');
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-emerald-50 text-emerald-700 rounded-lg cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Mark Delivered</span>
                              </button>

                              <button
                                type="button"
                                onClick={async () => {
                                  setActionMenuOrderId(null);
                                  await onUpdateStatus(order.id, 'cancelled');
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-red-50 text-red-600 rounded-lg cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Cancel Order</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* FULL ORDER DETAILS MODAL */}
      {activeModalOrder && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="bg-neutral-950 text-white p-4 sm:p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#FFCD00] uppercase tracking-widest block">
                  ORDER SPECIFICATION • {formatOrderDate(activeModalOrder.createdAt)}{' '}
                  {formatOrderTime(activeModalOrder.createdAt)}
                </span>
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  #{activeModalOrder.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Order Status & Verification Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                <div>
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                    ORDER STATUS
                  </span>
                  <span className="text-sm font-black uppercase text-neutral-900">
                    {activeModalOrder.status}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                    PAYMENT ({activeModalOrder.paymentMethod.toUpperCase()})
                  </span>
                  <span
                    className={`text-xs font-black uppercase px-2 py-0.5 rounded inline-block mt-0.5 ${
                      activeModalOrder.paymentStatus === 'verified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : activeModalOrder.paymentStatus === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {activeModalOrder.paymentStatus}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                    DISCOUNT
                  </span>
                  <span className="text-xs font-bold text-emerald-700">
                    Rs {(activeModalOrder.discountAmount || 0).toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                    TOTAL AMOUNT
                  </span>
                  <span className="text-base font-black text-neutral-950">
                    Rs {activeModalOrder.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Customer Contact & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                    Customer Information
                  </span>
                  <p className="text-xs font-bold text-neutral-900">
                    {activeModalOrder.customerName}
                  </p>
                  <p className="text-xs text-neutral-600 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-neutral-400" />
                    <span>{activeModalOrder.phone}</span>
                  </p>
                  {activeModalOrder.email && (
                    <p className="text-xs text-neutral-500">{activeModalOrder.email}</p>
                  )}
                </div>

                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                    Shipping Destination
                  </span>
                  <p className="text-xs font-bold text-neutral-900">
                    {activeModalOrder.region}
                  </p>
                  <p className="text-xs text-neutral-600 flex items-start gap-1.5">
                    <MapPin className="w-3 h-3 text-neutral-400 shrink-0 mt-0.5" />
                    <span>{activeModalOrder.address}</span>
                  </p>
                  {activeModalOrder.landmark && (
                    <p className="text-[11px] text-neutral-500 italic">
                      Landmark: {activeModalOrder.landmark}
                    </p>
                  )}
                </div>
              </div>

              {/* Items Ordered Breakdown */}
              <div className="border border-neutral-200 rounded-xl p-4 space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-neutral-900 block">
                  Ordered Products, Variants & Bundles
                </span>

                <div className="divide-y divide-neutral-100">
                  {activeModalOrder.items.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-neutral-900 truncate">
                          {item.productName}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-neutral-500 mt-0.5">
                          {item.selectedBundle && (
                            <span className="bg-neutral-100 text-neutral-800 px-1.5 py-0.5 rounded font-bold">
                              Bundle: {item.selectedBundle}
                            </span>
                          )}
                          {item.selectedFlavors && item.selectedFlavors.length > 0 ? (
                            <span>Flavors: {item.selectedFlavors.join(', ')}</span>
                          ) : item.selectedVariant ? (
                            <span>Flavor: {item.selectedVariant}</span>
                          ) : null}
                          <span className="font-bold text-neutral-700">Qty: {item.quantity}</span>
                        </div>
                      </div>

                      <span className="text-xs font-black text-neutral-950 shrink-0">
                        Rs {item.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Screenshot (if uploaded) */}
              {activeModalOrder.paymentScreenshotUrl && (
                <div className="border border-neutral-200 rounded-xl p-4 space-y-2 bg-neutral-50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-neutral-900">
                      Payment Proof Screenshot
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setScreenshotModalUrl(activeModalOrder.paymentScreenshotUrl || null)
                      }
                      className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Full Size</span>
                    </button>
                  </div>
                  <div className="w-36 h-36 border border-neutral-300 rounded-lg overflow-hidden bg-white">
                    <img
                      src={activeModalOrder.paymentScreenshotUrl}
                      alt="Payment Screenshot"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain cursor-pointer"
                      onClick={() =>
                        setScreenshotModalUrl(activeModalOrder.paymentScreenshotUrl || null)
                      }
                    />
                  </div>
                </div>
              )}

              {/* Admin Internal Notes */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Internal Admin Notes
                  </label>
                  <button
                    type="button"
                    onClick={handleSaveNotesOnly}
                    disabled={isUpdating}
                    className="text-[11px] font-bold text-neutral-900 hover:text-black flex items-center gap-1 bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1 rounded-lg cursor-pointer"
                  >
                    {noteSaved ? <Check className="w-3 h-3 text-emerald-600" /> : <Save className="w-3 h-3" />}
                    <span>{noteSaved ? 'Notes Saved' : 'Save Note'}</span>
                  </button>
                </div>
                <textarea
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  placeholder="e.g. Verified transaction on eSewa app. Dispatching with KTM Express."
                  rows={2}
                  className="w-full text-xs p-3 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900"
                />
              </div>

              {/* Action Buttons: Status and Payment verification */}
              <div className="space-y-3 pt-2 border-t border-neutral-200">
                <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
                  UPDATE PAYMENT & ORDER STATUS
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePaymentStatusChange('verified')}
                    disabled={isUpdating}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verify Payment</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePaymentStatusChange('rejected')}
                    disabled={isUpdating}
                    className="px-3 py-2 bg-neutral-200 hover:bg-red-600 hover:text-white text-neutral-700 text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
                  >
                    Reject Payment
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange('confirmed')}
                    disabled={isUpdating}
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold uppercase rounded-lg border border-blue-200 transition-colors cursor-pointer"
                  >
                    Confirmed
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange('processing')}
                    disabled={isUpdating}
                    className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold uppercase rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                  >
                    Processing
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange('shipped')}
                    disabled={isUpdating}
                    className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold uppercase rounded-lg border border-purple-200 transition-colors cursor-pointer"
                  >
                    Shipped
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange('delivered')}
                    disabled={isUpdating}
                    className="px-3.5 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-black uppercase rounded-lg transition-colors cursor-pointer"
                  >
                    Mark Delivered
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange('cancelled')}
                    disabled={isUpdating}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL-SIZE SCREENSHOT PREVIEW MODAL */}
      {screenshotModalUrl && (
        <div
          onClick={() => setScreenshotModalUrl(null)}
          className="fixed inset-0 z-60 bg-neutral-950/90 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out"
        >
          <div className="max-w-3xl max-h-[90vh] bg-white p-2 rounded-xl overflow-hidden shadow-2xl relative">
            <button
              type="button"
              onClick={() => setScreenshotModalUrl(null)}
              className="absolute top-4 right-4 bg-neutral-950 text-white p-2 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={screenshotModalUrl}
              alt="Proof Full Size"
              referrerPolicy="no-referrer"
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
