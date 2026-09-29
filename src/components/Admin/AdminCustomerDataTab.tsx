import { useState, useMemo } from 'react';
import {
  Users,
  Mail,
  MessageSquare,
  Phone,
  Search,
  Trash2,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  ExternalLink,
  Plus,
  MapPin,
  ShoppingBag
} from 'lucide-react';
import { ContactSubmission, EmailSubscriber, Order } from '../../types';

interface AdminCustomerDataTabProps {
  contactSubmissions: ContactSubmission[];
  emailSubscribers: EmailSubscriber[];
  orders: Order[];
  onUpdateContactStatus: (id: string, status: ContactSubmission['status']) => Promise<void>;
  onDeleteContact: (id: string) => Promise<void>;
  onAddEmailSubscriber: (email: string, source?: string) => Promise<unknown>;
  onDeleteEmailSubscriber: (id: string) => Promise<void>;
}

export default function AdminCustomerDataTab({
  contactSubmissions,
  emailSubscribers,
  orders,
  onUpdateContactStatus,
  onDeleteContact,
  onAddEmailSubscriber,
  onDeleteEmailSubscriber
}: AdminCustomerDataTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'contact' | 'emails' | 'customers'>('contact');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedAll, setCopiedAll] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState('');
  const [addingEmail, setAddingEmail] = useState(false);

  // Combine all unique emails from subscribers, contact submissions, and orders
  const allCombinedEmails = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        email: string;
        name?: string;
        phone?: string;
        source: string;
        createdAt: string;
        isSubscriberDoc: boolean;
      }
    >();

    // 1. From Orders
    orders.forEach((o) => {
      if (o.email && o.email.trim()) {
        const key = o.email.trim().toLowerCase();
        map.set(key, {
          id: `order_${o.id}`,
          email: o.email.trim(),
          name: o.customerName,
          phone: o.phone,
          source: 'Order Checkout',
          createdAt: o.createdAt,
          isSubscriberDoc: false
        });
      }
    });

    // 2. From Contact Submissions
    contactSubmissions.forEach((c) => {
      if (c.email && c.email.trim()) {
        const key = c.email.trim().toLowerCase();
        const existing = map.get(key);
        map.set(key, {
          id: existing?.isSubscriberDoc ? existing.id : `contact_${c.id}`,
          email: c.email.trim(),
          name: c.name || existing?.name,
          phone: c.phone || existing?.phone,
          source: 'Contact Us Form',
          createdAt: c.createdAt,
          isSubscriberDoc: existing?.isSubscriberDoc || false
        });
      }
    });

    // 3. From Email Subscribers (Footer / Policy Pages)
    emailSubscribers.forEach((s) => {
      if (s.email && s.email.trim()) {
        const key = s.email.trim().toLowerCase();
        const existing = map.get(key);
        const sourceLabel =
          s.source === 'footer'
            ? 'Footer Gmail Box'
            : s.source === 'policy_page'
            ? 'Policy Page Subscribe'
            : s.source === 'contact_form'
            ? 'Contact Us Form'
            : s.source === 'admin_manual'
            ? 'Admin Added'
            : s.source || 'Newsletter';

        map.set(key, {
          id: s.id,
          email: s.email.trim(),
          name: existing?.name,
          phone: existing?.phone,
          source: sourceLabel,
          createdAt: s.createdAt,
          isSubscriberDoc: true
        });
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [emailSubscribers, contactSubmissions, orders]);

  // Unified customer directory (by phone or email)
  const unifiedCustomers = useMemo(() => {
    const custMap = new Map<
      string,
      {
        key: string;
        name: string;
        email: string;
        phone: string;
        address: string;
        region: string;
        ordersCount: number;
        totalSpent: number;
        inquiriesCount: number;
        lastActive: string;
      }
    >();

    orders.forEach((o) => {
      const key = (o.phone || o.email || o.id).trim().toLowerCase();
      const prev = custMap.get(key);
      custMap.set(key, {
        key,
        name: o.customerName || prev?.name || 'Customer',
        email: o.email || prev?.email || '',
        phone: o.phone || prev?.phone || '',
        address: o.address || prev?.address || '',
        region: o.region || prev?.region || '',
        ordersCount: (prev?.ordersCount || 0) + 1,
        totalSpent: (prev?.totalSpent || 0) + (o.totalAmount || 0),
        inquiriesCount: prev?.inquiriesCount || 0,
        lastActive: o.createdAt
      });
    });

    contactSubmissions.forEach((c) => {
      const key = (c.phone || c.email || c.id).trim().toLowerCase();
      const prev = custMap.get(key);
      custMap.set(key, {
        key,
        name: c.name || prev?.name || 'Customer',
        email: c.email || prev?.email || '',
        phone: c.phone || prev?.phone || '',
        address: prev?.address || '',
        region: prev?.region || '',
        ordersCount: prev?.ordersCount || 0,
        totalSpent: prev?.totalSpent || 0,
        inquiriesCount: (prev?.inquiriesCount || 0) + 1,
        lastActive: c.createdAt
      });
    });

    emailSubscribers.forEach((s) => {
      const key = s.email.trim().toLowerCase();
      if (!custMap.has(key)) {
        custMap.set(key, {
          key,
          name: 'Email Subscriber',
          email: s.email,
          phone: '',
          address: '',
          region: '',
          ordersCount: 0,
          totalSpent: 0,
          inquiriesCount: 0,
          lastActive: s.createdAt
        });
      }
    });

    return Array.from(custMap.values()).sort(
      (a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
    );
  }, [orders, contactSubmissions, emailSubscribers]);

  const filteredContacts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return contactSubmissions;
    return contactSubmissions.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q) ||
        (c.comment || '').toLowerCase().includes(q)
    );
  }, [contactSubmissions, searchQuery]);

  const filteredEmails = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allCombinedEmails;
    return allCombinedEmails.filter(
      (e) =>
        e.email.toLowerCase().includes(q) ||
        (e.name || '').toLowerCase().includes(q) ||
        (e.phone || '').toLowerCase().includes(q) ||
        e.source.toLowerCase().includes(q)
    );
  }, [allCombinedEmails, searchQuery]);

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return unifiedCustomers;
    return unifiedCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
    );
  }, [unifiedCustomers, searchQuery]);

  const newInquiriesCount = contactSubmissions.filter((c) => c.status === 'new').length;

  const handleCopyAllEmails = () => {
    const list = allCombinedEmails.map((e) => e.email).join(', ');
    if (!list) return;
    navigator.clipboard.writeText(list);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleManualAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmailInput.trim() || addingEmail) return;
    setAddingEmail(true);
    try {
      await onAddEmailSubscriber(newEmailInput.trim(), 'admin_manual');
      setNewEmailInput('');
    } finally {
      setAddingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-neutral-900" />
            <h1 className="text-lg sm:text-xl font-black text-neutral-950 tracking-tight">
              Customer Data, Emails &amp; Contact Us
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            All customer Contact Us messages, subscribed Gmails/emails from footer &amp; pages, and buyer profiles.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, email, phone..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
          />
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveSubTab('contact')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeSubTab === 'contact'
              ? 'bg-neutral-950 text-white border-neutral-950 shadow-sm'
              : 'bg-white text-neutral-900 border-neutral-200 hover:border-neutral-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-75">
              Contact Us Inquiries
            </span>
            <MessageSquare className="w-4 h-4 text-[#FFCD00]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black">{contactSubmissions.length}</span>
            {newInquiriesCount > 0 && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500 text-white">
                {newInquiriesCount} NEW
              </span>
            )}
          </div>
        </div>

        <div
          onClick={() => setActiveSubTab('emails')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeSubTab === 'emails'
              ? 'bg-neutral-950 text-white border-neutral-950 shadow-sm'
              : 'bg-white text-neutral-900 border-neutral-200 hover:border-neutral-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-75">
              All Customer Emails / Gmails
            </span>
            <Mail className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black">{allCombinedEmails.length}</span>
            <span className="text-[11px] opacity-70">Subscribed &amp; Collected</span>
          </div>
        </div>

        <div
          onClick={() => setActiveSubTab('customers')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeSubTab === 'customers'
              ? 'bg-neutral-950 text-white border-neutral-950 shadow-sm'
              : 'bg-white text-neutral-900 border-neutral-200 hover:border-neutral-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-75">
              All Customer Profiles
            </span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black">{unifiedCustomers.length}</span>
            <span className="text-[11px] opacity-70">Orders + Leads</span>
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('contact')}
          className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-colors cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'contact'
              ? 'bg-[#0c1a3b] text-white'
              : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Contact Us Messages ({contactSubmissions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('emails')}
          className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-colors cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'emails'
              ? 'bg-[#0c1a3b] text-white'
              : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Subscribed Emails / Gmails ({allCombinedEmails.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('customers')}
          className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-colors cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'customers'
              ? 'bg-[#0c1a3b] text-white'
              : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Customer Directory ({unifiedCustomers.length})</span>
        </button>
      </div>

      {/* 1. CONTACT US INQUIRIES VIEW */}
      {activeSubTab === 'contact' && (
        <div className="space-y-4">
          {filteredContacts.length === 0 ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-10 text-center">
              <MessageSquare className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-neutral-800">No Contact Us submissions yet</p>
              <p className="text-xs text-neutral-500 mt-1">
                When customers submit the &ldquo;Get in Touch. We&apos;re Here to Help!&rdquo; form on the homepage or Contact page, their details will appear here immediately.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredContacts.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl border p-5 transition-all ${
                    item.status === 'new'
                      ? 'border-blue-500/60 shadow-xs'
                      : 'border-neutral-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black text-neutral-950">
                          {item.name || 'Anonymous Customer'}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            item.status === 'new'
                              ? 'bg-blue-100 text-blue-800'
                              : item.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {item.status}
                        </span>
                        <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-700 pt-1">
                        {item.email && (
                          <a
                            href={`mailto:${item.email}`}
                            className="flex items-center gap-1.5 font-semibold text-blue-700 hover:underline"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>{item.email}</span>
                          </a>
                        )}
                        {item.phone && (
                          <a
                            href={`tel:${item.phone}`}
                            className="flex items-center gap-1.5 font-semibold text-neutral-800 hover:underline"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{item.phone}</span>
                          </a>
                        )}
                        {item.phone && (
                          <a
                            href={`https://wa.me/977${item.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 font-bold text-emerald-700 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>

                      {item.comment && (
                        <div className="mt-3 p-3.5 bg-neutral-50 rounded-lg border border-neutral-200/80 text-xs sm:text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed">
                          {item.comment}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                      {item.status !== 'resolved' ? (
                        <button
                          type="button"
                          onClick={() => onUpdateContactStatus(item.id, 'resolved')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Resolved</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onUpdateContactStatus(item.id, 'read')}
                          className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                        >
                          Reopen
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onDeleteContact(item.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete inquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. ALL SUBSCRIBED EMAILS / GMAILS VIEW */}
      {activeSubTab === 'emails' && (
        <div className="space-y-4">
          {/* Top Bar: Add Email & Copy All */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <form onSubmit={handleManualAddEmail} className="flex items-center gap-2 flex-1 max-w-md">
              <input
                type="email"
                value={newEmailInput}
                onChange={(e) => setNewEmailInput(e.target.value)}
                placeholder="Add client Gmail / email manually..."
                required
                className="flex-1 px-3.5 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
              />
              <button
                type="submit"
                disabled={addingEmail}
                className="px-3.5 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Email</span>
              </button>
            </form>

            <button
              type="button"
              onClick={handleCopyAllEmails}
              disabled={allCombinedEmails.length === 0}
              className="px-4 py-2 bg-[#0c1a3b] hover:bg-[#162957] disabled:opacity-40 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied All Emails!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy All Emails ({allCombinedEmails.length})</span>
                </>
              )}
            </button>
          </div>

          {filteredEmails.length === 0 ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-10 text-center">
              <Mail className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-neutral-800">No subscribed emails yet</p>
              <p className="text-xs text-neutral-500 mt-1">
                Emails entered under &ldquo;We only send real updates, never spam.&rdquo; in the footer or on policy pages will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">
                      <th className="py-3 px-4">Client Email / Gmail</th>
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Source</th>
                      <th className="py-3 px-4">Date Added</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-xs">
                    {filteredEmails.map((entry) => (
                      <tr key={entry.id} className="hover:bg-neutral-50/80">
                        <td className="py-3.5 px-4 font-bold text-neutral-950">
                          <a
                            href={`mailto:${entry.email}`}
                            className="hover:text-blue-600 hover:underline flex items-center gap-2"
                          >
                            <Mail className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{entry.email}</span>
                          </a>
                        </td>
                        <td className="py-3.5 px-4 text-neutral-700 font-medium">
                          {entry.name || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-neutral-700">
                          {entry.phone || '—'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-100 text-neutral-700">
                            {entry.source}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-neutral-500">
                          {new Date(entry.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {entry.isSubscriberDoc && (
                            <button
                              type="button"
                              onClick={() => onDeleteEmailSubscriber(entry.id)}
                              className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Remove subscriber"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. UNIFIED CUSTOMER DIRECTORY VIEW */}
      {activeSubTab === 'customers' && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          {filteredCustomers.length === 0 ? (
            <div className="p-10 text-center">
              <Users className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-neutral-800">No customer records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Email / Gmail</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Address / Region</th>
                    <th className="py-3 px-4">Orders</th>
                    <th className="py-3 px-4">Total Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs">
                  {filteredCustomers.map((cust) => (
                    <tr key={cust.key} className="hover:bg-neutral-50/80">
                      <td className="py-3.5 px-4 font-bold text-neutral-950">
                        {cust.name}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-700">
                        {cust.email ? (
                          <a
                            href={`mailto:${cust.email}`}
                            className="text-blue-700 hover:underline font-medium"
                          >
                            {cust.email}
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-700 font-medium">
                        {cust.phone ? (
                          <a href={`tel:${cust.phone}`} className="hover:underline">
                            {cust.phone}
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-600">
                        {cust.address ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                            <span>
                              {cust.address} {cust.region ? `(${cust.region})` : ''}
                            </span>
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-neutral-800">
                          <ShoppingBag className="w-3 h-3 text-neutral-400" />
                          {cust.ordersCount}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-neutral-950">
                        Rs {cust.totalSpent.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
