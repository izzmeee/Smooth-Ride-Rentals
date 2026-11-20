import React, { useState, useEffect } from 'react';
import type { 
  User, Scooter, Booking, VerificationRecord, 
  CustomerEnquiry, CustomerFeedback, MarketingCampaign, AppSettings 
} from '../types/index.ts';
import { api } from '../services/api.ts';
import { getScooterImage } from '../utils/scooterImages.ts';
import { 
  BarChart3, Bike, Calendar, ShieldCheck, CreditCard, 
  Megaphone, Settings, Plus, CheckCircle2, XCircle, 
  Clock, AlertTriangle, RefreshCw, Eye, Edit, Trash2, 
  Key, ArrowRight, UserCheck, Phone, Check, MapPin, Gauge
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  onRefreshData?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onRefreshData
}) => {
  // Navigation sub-tabs
  type AdminTab = 'overview' | 'fleet' | 'bookings' | 'verifications' | 'payments' | 'marketing' | 'settings';
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Live state from backend
  const [analytics, setAnalytics] = useState<any>(null);
  const [scooters, setScooters] = useState<Scooter[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);
  const [feedback, setFeedback] = useState<CustomerFeedback[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals & Action States
  const [isAddScooterOpen, setIsAddScooterOpen] = useState<boolean>(false);
  const [editingScooter, setEditingScooter] = useState<Scooter | null>(null);
  
  // Handover modal
  const [handoverBooking, setHandoverBooking] = useState<Booking | null>(null);
  const [handoverOdo, setHandoverOdo] = useState<number>(0);
  const [handoverFuel, setHandoverFuel] = useState<string>('Full');
  const [handoverHelmetCount, setHandoverHelmetCount] = useState<number>(1);
  const [handoverNotes, setHandoverNotes] = useState<string>('');

  // Return modal
  const [returnBooking, setReturnBooking] = useState<Booking | null>(null);
  const [returnOdo, setReturnOdo] = useState<number>(0);
  const [returnFuel, setReturnFuel] = useState<string>('Full');
  const [returnNotes, setReturnNotes] = useState<string>('');
  const [additionalCharges, setAdditionalCharges] = useState<number>(0);

  // Payment update modal
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);
  const [newPaymentStatus, setNewPaymentStatus] = useState<string>('completed');
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [paymentRef, setPaymentRef] = useState<string>('');

  // Filter for bookings
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');

  // Load all operational data
  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [
        analyticsRes, scootersRes, bookingsRes, 
        verifRes, campRes, enqRes, fbRes, settRes
      ] = await Promise.all([
        api.getAnalytics(),
        api.getScooters({ role: 'admin' }),
        api.getBookings(),
        api.getVerifications(),
        api.getCampaigns(),
        api.getEnquiries(),
        api.getFeedback(),
        api.getSettings()
      ]);

      setAnalytics(analyticsRes);
      setScooters(scootersRes.scooters);
      setBookings(bookingsRes.bookings);
      setVerifications(verifRes.verifications);
      setCampaigns(campRes.campaigns);
      setEnquiries(enqRes.enquiries);
      setFeedback(fbRes.feedback);
      setSettings(settRes.settings);
    } catch (err) {
      console.error('Error loading admin portal data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Handler: Confirm or Reject booking
  const handleUpdateBookingStatus = async (bookingId: string, status: string, reason?: string) => {
    try {
      await api.updateBookingStatus(bookingId, status, reason);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update booking status');
    }
  };

  // Handler: Submit Handover
  const handleSubmitHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverBooking) return;
    try {
      await api.recordHandover(handoverBooking.id, {
        odo: handoverOdo,
        fuel: handoverFuel,
        helmets: handoverHelmetCount,
        notes: handoverNotes
      });
      setHandoverBooking(null);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to record handover');
    }
  };

  // Handler: Submit Return
  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnBooking) return;
    try {
      await api.recordReturn(returnBooking.id, {
        odo: returnOdo,
        fuel: returnFuel,
        notes: returnNotes,
        additionalCharges
      });
      setReturnBooking(null);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to record return');
    }
  };

  // Handler: Submit Payment
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentBooking) return;
    try {
      await api.recordPayment(paymentBooking.id, {
        paymentStatus: newPaymentStatus,
        paymentMethod,
        paymentRef
      });
      setPaymentBooking(null);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update payment');
    }
  };

  // Handler: Review Verification
  const handleReviewVerification = async (id: string, status: 'verified' | 'rejected') => {
    const notes = prompt(`Enter review notes for ${status === 'verified' ? 'approval' : 'rejection'}:`, status === 'verified' ? 'Original DL physically verified at desk.' : 'Invalid DL number format.');
    if (notes === null) return;
    try {
      await api.reviewVerification(id, { status, notes, reviewedBy: currentUser.name });
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update verification');
    }
  };

  // Handler: Add or Update Scooter
  const handleSaveScooter = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const scooterPayload: Partial<Scooter> = {
      name: formData.get('name') as string,
      model: formData.get('model') as string,
      brand: formData.get('brand') as string,
      fleetId: formData.get('fleetId') as string,
      registrationPlate: formData.get('registrationPlate') as string,
      hourlyRate: Number(formData.get('hourlyRate')) || 60,
      status: formData.get('status') as any || 'available',
      color: formData.get('color') as string,
      mileage: formData.get('mileage') as string,
      engineCc: Number(formData.get('engineCc')) || 125,
      odoReading: Number(formData.get('odoReading')) || 1000,
      helmetsIncluded: Number(formData.get('helmetsIncluded')) || 1,
      pickupLocation: formData.get('pickupLocation') as string,
      conditionNotes: formData.get('conditionNotes') as string,
      features: (formData.get('features') as string).split(',').map(s => s.trim())
    };

    try {
      if (editingScooter) {
        await api.updateScooter(editingScooter.id, scooterPayload);
      } else {
        await api.createScooter(scooterPayload);
      }
      setIsAddScooterOpen(false);
      setEditingScooter(null);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to save scooter');
    }
  };

  // Handler: Save Settings
  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updatedSettings: Partial<AppSettings> = {
      baseHourlyRate: Number(formData.get('baseHourlyRate')),
      securityDeposit: Number(formData.get('securityDeposit')),
      operatingHours: formData.get('operatingHours') as string,
      contactPhone: formData.get('contactPhone') as string,
      contactEmail: formData.get('contactEmail') as string,
      whatsappNumber: formData.get('whatsappNumber') as string,
      thirtyDayTargetPaidBookings: Number(formData.get('thirtyDayTargetPaidBookings')),
      thirtyDayTargetRepeatRate: Number(formData.get('thirtyDayTargetRepeatRate')),
      termsAndConditions: formData.get('termsAndConditions') as string
    };

    try {
      await api.updateSettings(updatedSettings);
      alert('Business settings updated successfully!');
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (bookingStatusFilter === 'all') return true;
    return b.status === bookingStatusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#0B0C10] text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/10 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#FFCA20]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#FFCA20]">
              DGU Venture Operations Portal
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1.5">
            Smooth Ride Command Center
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Selaqui & Dehradun Campus Scooter Fleet Operations · Protected Administrator Access
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={loadAdminData}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/15"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Live Data</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs (Single-line interactive controls) */}
      <div className="flex items-center gap-1 p-1.5 bg-white border border-neutral-200/80 rounded-2xl overflow-x-auto shadow-2xs">
        {[
          { id: 'overview', label: 'Overview & Validation', icon: BarChart3 },
          { id: 'fleet', label: 'Fleet Inventory', icon: Bike, count: scooters.length },
          { id: 'bookings', label: 'Bookings & Handovers', icon: Calendar, count: bookings.filter(b => b.status === 'pending').length },
          { id: 'verifications', label: 'Driver Verification', icon: ShieldCheck, count: verifications.filter(v => v.status === 'pending').length },
          { id: 'payments', label: 'Payments & Deposits', icon: CreditCard },
          { id: 'marketing', label: 'Marketing & Venture Plan', icon: Megaphone },
          { id: 'settings', label: 'Business Settings', icon: Settings },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#0B0C10] text-white shadow-xs'
                  : 'text-neutral-600 hover:text-[#0B0C10] hover:bg-neutral-100/70'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FFCA20]' : 'text-neutral-400'}`} />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                  isActive ? 'bg-[#FFCA20] text-[#0B0C10]' : 'bg-neutral-100 text-neutral-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ---------------- TAB 1: OVERVIEW & VENTURE VALIDATION ---------------- */}
      {activeTab === 'overview' && analytics && (
        <div className="space-y-6">
          
          {/* Key Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
              <span className="text-[11px] text-neutral-500 font-semibold uppercase tracking-wider block">Total Revenue</span>
              <span className="font-display text-2xl font-extrabold text-[#0B0C10] tabular-nums mt-1 block">
                ₹{analytics.metrics.totalRevenue}
              </span>
              <span className="text-[11px] text-neutral-400 block mt-1">
                This month: ₹{analytics.metrics.monthRevenue}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
              <span className="text-[11px] text-neutral-500 font-semibold uppercase tracking-wider block">Total Bookings</span>
              <span className="font-display text-2xl font-extrabold text-[#0B0C10] tabular-nums mt-1 block">
                {analytics.metrics.totalBookings}
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
                {analytics.metrics.completedBookings} Completed
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
              <span className="text-[11px] text-neutral-500 font-semibold uppercase tracking-wider block">Pending</span>
              <span className="font-display text-2xl font-extrabold text-amber-600 tabular-nums mt-1 block">
                {analytics.metrics.pendingRequests}
              </span>
              <span className="text-[11px] text-neutral-400 block mt-1">
                Awaiting review
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
              <span className="text-[11px] text-neutral-500 font-semibold uppercase tracking-wider block">Fleet Ready</span>
              <span className="font-display text-2xl font-extrabold text-[#0B0C10] tabular-nums mt-1 block">
                {analytics.metrics.availableScooters} / {analytics.metrics.totalScooters}
              </span>
              <span className="text-[11px] text-neutral-400 block mt-1">
                {analytics.metrics.maintenanceScooters} maintenance
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
              <span className="text-[11px] text-neutral-500 font-semibold uppercase tracking-wider block">Avg Trip</span>
              <span className="font-display text-2xl font-extrabold text-[#0B0C10] tabular-nums mt-1 block">
                {analytics.metrics.avgDuration} hrs
              </span>
              <span className="text-[11px] text-neutral-400 block mt-1">
                Per student ride
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
              <span className="text-[11px] text-neutral-500 font-semibold uppercase tracking-wider block">Repeat Rate</span>
              <span className="font-display text-2xl font-extrabold text-emerald-700 tabular-nums mt-1 block">
                {analytics.metrics.repeatBookingRate}%
              </span>
              <span className="text-[11px] text-neutral-400 block mt-1">
                Target: {analytics.venturePlanTargets.targetRepeatCustomerRate}%
              </span>
            </div>
          </div>

          {/* Section 13: Venture Plan Business Validation Targets Card */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-7 shadow-2xs space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-display text-lg font-bold text-[#0B0C10]">
                  DGU Venture Plan: 30-Day Milestone Tracker
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Validating student demand in Selaqui & Dehradun at ₹60/hour.
                </p>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-[#FFCA20]/20 text-[#0B0C10] border border-[#FFCA20]/50 px-3 py-1 rounded-lg">
                Business Pilot Mode
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Target 1: 30 Paid Bookings */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Target 1: Paid Bookings in First 30 Days</span>
                  <span className="font-mono text-slate-600">
                    {analytics.venturePlanTargets.actualPaidBookings} / {analytics.venturePlanTargets.target30DayPaidBookings} Paid
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-slate-900 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${analytics.venturePlanTargets.paidBookingsProgressPct}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Progress: {analytics.venturePlanTargets.paidBookingsProgressPct}%</span>
                  <span>Minimum Viable Target: 30</span>
                </div>
              </div>

              {/* Target 2: 20% Repeat Customers */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Target 2: Repeat Customer Retention</span>
                  <span className="font-mono text-slate-600">
                    {analytics.venturePlanTargets.actualRepeatRate}% / {analytics.venturePlanTargets.targetRepeatCustomerRate}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (analytics.venturePlanTargets.actualRepeatRate / analytics.venturePlanTargets.targetRepeatCustomerRate) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Current: {analytics.venturePlanTargets.actualRepeatRate}%</span>
                  <span>Target Benchmark: 20%</span>
                </div>
              </div>

            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Founder Note (Isha / DGU Venture Quest):</strong> All statistics reflect authentic records in the persistent database. Demonstration records are clearly labelled as demonstration data in the system.
              </div>
            </div>
          </div>

          {/* Customer Feedback Spotlight */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Student Rider Feedback & Ratings ({feedback.length})
            </h3>
            {feedback.length === 0 ? (
              <p className="text-xs text-slate-500">No feedback entries recorded yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {feedback.map(fb => (
                  <div key={fb.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{fb.customerName}</span>
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: fb.rating }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 italic">"{fb.reviewText}"</p>
                    <div className="text-[10px] text-slate-500 flex justify-between pt-1 border-t border-slate-200">
                      <span>Booking: {fb.bookingId}</span>
                      <span>Would recommend: {fb.wouldRecommend ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ---------------- TAB 2: FLEET INVENTORY MANAGEMENT ---------------- */}
      {activeTab === 'fleet' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Scooter Fleet Roster</h2>
              <p className="text-xs text-slate-500">Manage scooter records, maintenance state, and odometer readings</p>
            </div>
            <button
              onClick={() => {
                setEditingScooter(null);
                setIsAddScooterOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Scooter</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scooters.map(s => (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
                <div className="h-36 w-full rounded-xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center p-2">
                  <img
                    src={getScooterImage(`${s.name} ${s.model}`, s.imageUrl)}
                    alt={`${s.name} ${s.model}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                      {s.fleetId}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{s.name}</h3>
                    <p className="text-xs text-slate-500">{s.model} · {s.color}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    s.status === 'available'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : s.status === 'maintenance'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : s.status === 'booked'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {s.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-500 block">Registration (Full):</span>
                    <span className="font-mono font-bold text-slate-800">{s.registrationPlate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Current Hourly Rate:</span>
                    <span className="font-bold text-slate-900 tabular-nums">₹{s.hourlyRate}/hr</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Odometer:</span>
                    <span className="font-bold text-slate-800 tabular-nums">{s.odoReading} km</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Helmets in Boot:</span>
                    <span className="font-bold text-slate-800">{s.helmetsIncluded} ISI</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="truncate">{s.pickupLocation}</span>
                </div>

                {/* Status Toggle & Action Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={async () => {
                        const newStatus = s.status === 'available' ? 'maintenance' : 'available';
                        await api.updateScooter(s.id, { status: newStatus });
                        loadAdminData();
                      }}
                      className="px-2 py-1 text-[11px] font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Toggle {s.status === 'available' ? 'Maintenance' : 'Available'}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingScooter(s);
                        setIsAddScooterOpen(true);
                      }}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                      title="Edit Scooter"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Deactivate ${s.fleetId} (${s.name})?`)) {
                          await api.deleteScooter(s.id);
                          loadAdminData();
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Deactivate Scooter"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- TAB 3: BOOKINGS & HANDOVERS ---------------- */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Rental Bookings & Handover Management</h2>
              <p className="text-xs text-slate-500">Review, confirm, record handovers, and close returns</p>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              {['all', 'pending', 'confirmed', 'active', 'completed', 'cancelled'].map(st => (
                <button
                  key={st}
                  onClick={() => setBookingStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                    bookingStatusFilter === st ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredBookings.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                No bookings found for the selected filter.
              </div>
            ) : (
              filteredBookings.map(b => (
                <div key={b.id} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
                  
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                        {b.id}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{b.customerName}</span>
                      <span className="text-xs text-slate-500">· {b.customerPhone}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize border ${
                        b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        b.status === 'active' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                        b.status === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        b.status === 'completed' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {b.status}
                      </span>

                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded capitalize ${
                        b.paymentStatus === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        Payment: {b.paymentStatus.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Trip Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Scooter</span>
                      <span className="font-bold text-slate-900">{b.scooterName} ({b.scooterFleetId})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Schedule</span>
                      <span className="font-semibold text-slate-800">
                        {b.pickupDate} at {b.pickupTime} ({b.rentalHours === 24 ? '1 Day' : b.rentalHours === 48 ? '2 Days' : b.rentalHours === 72 ? '3 Days' : `${b.rentalHours}h`})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Rental Amount</span>
                      <span className="font-bold text-slate-900 tabular-nums">₹{b.rentalAmount} (@ ₹{b.ratePerHour}/hr)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Pickup Hub</span>
                      <span className="font-medium text-slate-700 truncate block">{b.pickupLocation}</span>
                    </div>
                  </div>

                  {/* Operational Action Controls */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* PENDING -> CONFIRM or REJECT */}
                      {b.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirm Booking</span>
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Reason for rejection:');
                              if (reason) handleUpdateBookingStatus(b.id, 'rejected', reason);
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                          >
                            Reject Request
                          </button>
                        </>
                      )}

                      {/* CONFIRMED -> RECORD HANDOVER */}
                      {b.status === 'confirmed' && (
                        <button
                          onClick={() => {
                            setHandoverBooking(b);
                            const scooter = scooters.find(s => s.id === b.scooterId);
                            setHandoverOdo(scooter?.odoReading || 4820);
                            setHandoverFuel('Full');
                            setHandoverHelmetCount(1);
                            setHandoverNotes('');
                          }}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <Key className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Record Vehicle Handover</span>
                        </button>
                      )}

                      {/* ACTIVE -> RECORD RETURN */}
                      {b.status === 'active' && (
                        <button
                          onClick={() => {
                            setReturnBooking(b);
                            setReturnOdo((b.handoverOdo || 4820) + 15);
                            setReturnFuel('Full');
                            setReturnNotes('Inspected without scratches');
                            setAdditionalCharges(0);
                          }}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Record Vehicle Return & Complete</span>
                        </button>
                      )}

                      {/* CANCEL */}
                      {(b.status === 'pending' || b.status === 'confirmed') && (
                        <button
                          onClick={() => {
                            const reason = prompt('Reason for cancellation:');
                            if (reason) handleUpdateBookingStatus(b.id, 'cancelled', reason);
                          }}
                          className="text-xs text-slate-500 hover:text-rose-600 px-2 py-1"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>

                    {/* Payment Status Action */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setPaymentBooking(b);
                          setNewPaymentStatus(b.paymentStatus);
                          setPaymentMethod(b.paymentMethod || 'UPI');
                          setPaymentRef(b.paymentRef || '');
                        }}
                        className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                        <span>Update Payment</span>
                      </button>

                      <a
                        href={`tel:${b.customerPhone}`}
                        className="p-1.5 text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg"
                        title="Call Customer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>

                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ---------------- TAB 4: DRIVER VERIFICATION QUEUE ---------------- */}
      {activeTab === 'verifications' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Driving Licence & Identity Verification Desk</h2>
            <p className="text-xs text-slate-500">
              Uttarakhand motor legal compliance: Verify that student renters possess authentic DLs and are 18+ years of age.
            </p>
          </div>

          <div className="space-y-3">
            {verifications.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                No customer verification requests in queue.
              </div>
            ) : (
              verifications.map(v => (
                <div key={v.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{v.userName}</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize border ${
                        v.status === 'verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        v.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {v.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 mt-1 space-x-2">
                      <span>Phone: <strong>{v.userPhone}</strong></span>
                      <span>·</span>
                      <span>DL Number: <strong className="font-mono text-slate-900">{v.dlNumber}</strong></span>
                      {v.collegeIdNumber && (
                        <>
                          <span>·</span>
                          <span>College ID: <strong>{v.collegeIdNumber}</strong></span>
                        </>
                      )}
                    </div>

                    {v.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-1">Review note: {v.notes}</p>
                    )}
                  </div>

                  {v.status === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleReviewVerification(v.id, 'verified')}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Verify DL</span>
                      </button>
                      <button
                        onClick={() => handleReviewVerification(v.id, 'rejected')}
                        className="px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ---------------- TAB 5: PAYMENTS & DEPOSITS ---------------- */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Payment Reconciliation & Security Deposits</h2>
            <p className="text-xs text-slate-500">Record cash/UPI collections, verify deposits, and track refunds</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Booking ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Rental Fee</th>
                    <th className="p-3">Deposit</th>
                    <th className="p-3">Total Payable</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Payment Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono font-bold text-slate-900">{b.id}</td>
                      <td className="p-3 text-slate-800">{b.customerName}</td>
                      <td className="p-3 tabular-nums font-bold">₹{b.rentalAmount}</td>
                      <td className="p-3 tabular-nums text-slate-500">₹{b.depositAmount}</td>
                      <td className="p-3 tabular-nums font-extrabold text-slate-900">₹{b.totalAmount}</td>
                      <td className="p-3 text-slate-600">{b.paymentMethod || 'UPI'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                          b.paymentStatus === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                          b.paymentStatus === 'refunded' ? 'bg-blue-50 text-blue-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {b.paymentStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setPaymentBooking(b);
                            setNewPaymentStatus(b.paymentStatus);
                            setPaymentMethod(b.paymentMethod || 'UPI');
                            setPaymentRef(b.paymentRef || '');
                          }}
                          className="text-xs font-semibold text-slate-700 hover:text-slate-900 underline"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- TAB 6: MARKETING & GTM ANALYTICS ---------------- */}
      {activeTab === 'marketing' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Venture Go-To-Market Plan & Campaign Budget Tracker</h2>
            <p className="text-xs text-slate-500">
              Allocated budgets from Venture Plan (Mission 9): ₹3,000 Instagram, ₹2,000 Campus, ₹1,000 Referrals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {campaigns.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">{c.channelName}</h3>
                  <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                    {c.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Planned Budget:</span>
                    <span className="font-bold tabular-nums">₹{c.plannedBudget}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Spent Budget:</span>
                    <span className="font-mono tabular-nums">₹{c.spentBudget}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Expected Leads:</span>
                    <span className="tabular-nums">{c.expectedLeads}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Actual Leads Recorded:</span>
                    <span className="font-bold tabular-nums text-slate-900">{c.actualLeads}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Acquired Customers:</span>
                    <span className="font-bold tabular-nums text-emerald-600">{c.actualCustomers} / {c.expectedCustomers}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  {c.notes}
                </p>
              </div>
            ))}
          </div>

          {/* Student Enquiries */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Student Enquiries & Leads ({enquiries.length})
            </h3>
            {enquiries.length === 0 ? (
              <p className="text-xs text-slate-500">No leads received yet.</p>
            ) : (
              <div className="space-y-2">
                {enquiries.map(e => (
                  <div key={e.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900">{e.name} ({e.phone})</div>
                      <p className="text-slate-600 mt-0.5">"{e.message}"</p>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Source: {e.source} · {new Date(e.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    <a
                      href={`https://wa.me/${e.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(e.name)},%20thank%20you%20for%20reaching%20out%20to%20Smooth%20Ride%20Rentals!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs self-start sm:self-auto flex items-center gap-1"
                    >
                      <span>Reply on WhatsApp</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- TAB 7: SETTINGS ---------------- */}
      {activeTab === 'settings' && settings && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs max-w-2xl space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Operational Settings & Pricing Engine</h2>
            <p className="text-xs text-slate-500">Configure base hourly rental rates, deposits, and operating policies</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Base Hourly Rate (₹) *
                </label>
                <input
                  type="number"
                  name="baseHourlyRate"
                  defaultValue={settings.baseHourlyRate}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Refundable Security Deposit (₹)
                </label>
                <input
                  type="number"
                  name="securityDeposit"
                  defaultValue={settings.securityDeposit}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  30-Day Paid Bookings Target
                </label>
                <input
                  type="number"
                  name="thirtyDayTargetPaidBookings"
                  defaultValue={settings.thirtyDayTargetPaidBookings}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Repeat Customer Target Rate (%)
                </label>
                <input
                  type="number"
                  name="thirtyDayTargetRepeatRate"
                  defaultValue={settings.thirtyDayTargetRepeatRate}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Helpline Mobile Number
                </label>
                <input
                  type="text"
                  name="contactPhone"
                  defaultValue={settings.contactPhone}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  WhatsApp Contact Number
                </label>
                <input
                  type="text"
                  name="whatsappNumber"
                  defaultValue={settings.whatsappNumber}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Operating Hours
              </label>
              <input
                type="text"
                name="operatingHours"
                defaultValue={settings.operatingHours}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Support Email
              </label>
              <input
                type="email"
                name="contactEmail"
                defaultValue={settings.contactEmail}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Rental Terms & Operating Conditions
              </label>
              <textarea
                name="termsAndConditions"
                rows={3}
                defaultValue={settings.termsAndConditions}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors shadow-xs"
            >
              Save Configuration
            </button>
          </form>
        </div>
      )}

      {/* ---------------- MODAL: ADD / EDIT SCOOTER ---------------- */}
      {isAddScooterOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingScooter ? 'Edit Scooter Details' : 'Add New Scooter to Fleet'}
              </h3>
              <button onClick={() => setIsAddScooterOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSaveScooter} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Scooter Name *</label>
                  <input name="name" required defaultValue={editingScooter?.name || 'Honda Activa 6G'} className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block font-medium mb-1">Model Variant *</label>
                  <input name="model" required defaultValue={editingScooter?.model || 'Activa 6G Standard'} className="w-full p-2 border rounded-lg" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium mb-1">Fleet ID *</label>
                  <input name="fleetId" required defaultValue={editingScooter?.fleetId || `SRR-0${scooters.length + 1}`} className="w-full p-2 border rounded-lg font-mono uppercase" />
                </div>
                <div>
                  <label className="block font-medium mb-1">Reg Plate *</label>
                  <input name="registrationPlate" required defaultValue={editingScooter?.registrationPlate || 'UK 07 BR 1234'} className="w-full p-2 border rounded-lg font-mono uppercase" />
                </div>
                <div>
                  <label className="block font-medium mb-1">Hourly Rate (₹)</label>
                  <input name="hourlyRate" type="number" defaultValue={editingScooter?.hourlyRate || 60} className="w-full p-2 border rounded-lg tabular-nums" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium mb-1">Brand</label>
                  <input name="brand" defaultValue={editingScooter?.brand || 'Honda'} className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block font-medium mb-1">Color</label>
                  <input name="color" defaultValue={editingScooter?.color || 'Pearl White'} className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block font-medium mb-1">Engine CC</label>
                  <input name="engineCc" type="number" defaultValue={editingScooter?.engineCc || 110} className="w-full p-2 border rounded-lg" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium mb-1">Mileage</label>
                  <input name="mileage" defaultValue={editingScooter?.mileage || '50 km/l'} className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block font-medium mb-1">Odometer (km)</label>
                  <input name="odoReading" type="number" defaultValue={editingScooter?.odoReading || 2500} className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block font-medium mb-1">Helmets</label>
                  <input name="helmetsIncluded" type="number" defaultValue={editingScooter?.helmetsIncluded || 1} className="w-full p-2 border rounded-lg" />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Status</label>
                <select name="status" defaultValue={editingScooter?.status || 'available'} className="w-full p-2 border rounded-lg bg-white">
                  <option value="available">Available</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="booked">Booked</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Pickup Location Hub</label>
                <input name="pickupLocation" defaultValue={editingScooter?.pickupLocation || 'Selaqui Hub (Chakrata Rd, Near DGU & University Gate)'} className="w-full p-2 border rounded-lg" />
              </div>

              <div>
                <label className="block font-medium mb-1">Condition Notes</label>
                <textarea name="conditionNotes" rows={2} defaultValue={editingScooter?.conditionNotes || 'Serviced and sanitized.'} className="w-full p-2 border rounded-lg" />
              </div>

              <div>
                <label className="block font-medium mb-1">Features (comma separated)</label>
                <input name="features" defaultValue={editingScooter?.features.join(', ') || 'Electric Start, Combi-Brake System, Helmet Included'} className="w-full p-2 border rounded-lg" />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setIsAddScooterOpen(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg">Save Scooter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: HANDOVER RECORDER ---------------- */}
      {handoverBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">
                Record Scooter Handover: {handoverBooking.id}
              </h3>
              <button onClick={() => setHandoverBooking(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg space-y-1">
              <div><strong>Renter:</strong> {handoverBooking.customerName} ({handoverBooking.customerPhone})</div>
              <div><strong>Scooter:</strong> {handoverBooking.scooterName} ({handoverBooking.scooterFleetId})</div>
              <div><strong>Duration:</strong> {handoverBooking.rentalHours} Hours</div>
            </div>

            <form onSubmit={handleSubmitHandover} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Pickup Odometer Reading (km) *</label>
                <input
                  type="number"
                  required
                  value={handoverOdo}
                  onChange={(e) => setHandoverOdo(Number(e.target.value))}
                  className="w-full p-2 border rounded-lg font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Fuel Level</label>
                  <select
                    value={handoverFuel}
                    onChange={(e) => setHandoverFuel(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="Full">Full Tank</option>
                    <option value="3/4">3/4 Tank</option>
                    <option value="1/2">Half Tank</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Helmets Handed Over</label>
                  <input
                    type="number"
                    min="1"
                    max="2"
                    value={handoverHelmetCount}
                    onChange={(e) => setHandoverHelmetCount(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Condition Inspection Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Clean body, no scratches, tyres checked"
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setHandoverBooking(null)} className="px-3 py-1.5 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg">Confirm & Release Keys</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: RETURN RECORDER ---------------- */}
      {returnBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">
                Record Scooter Return: {returnBooking.id}
              </h3>
              <button onClick={() => setReturnBooking(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg space-y-1">
              <div><strong>Renter:</strong> {returnBooking.customerName}</div>
              <div><strong>Scooter:</strong> {returnBooking.scooterName} ({returnBooking.scooterFleetId})</div>
              <div><strong>Handover Odometer:</strong> {returnBooking.handoverOdo || 'N/A'} km</div>
            </div>

            <form onSubmit={handleSubmitReturn} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Return Odometer Reading (km) *</label>
                <input
                  type="number"
                  required
                  value={returnOdo}
                  onChange={(e) => setReturnOdo(Number(e.target.value))}
                  className="w-full p-2 border rounded-lg font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Return Fuel Level</label>
                  <select
                    value={returnFuel}
                    onChange={(e) => setReturnFuel(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="Full">Full Tank (Match)</option>
                    <option value="3/4">3/4 Tank</option>
                    <option value="1/2">Half Tank</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Additional Charges (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={additionalCharges}
                    onChange={(e) => setAdditionalCharges(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Return Inspection Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Returned on time, no damages, helmet returned"
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setReturnBooking(null)} className="px-3 py-1.5 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg">Mark Return Complete</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: UPDATE PAYMENT STATUS ---------------- */}
      {paymentBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">
                Record Payment Status: {paymentBooking.id}
              </h3>
              <button onClick={() => setPaymentBooking(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="text-xs text-slate-600">
              Total Amount: <strong className="text-slate-900">₹{paymentBooking.totalAmount}</strong>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Payment Status</label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white"
                >
                  <option value="pending">Payment Pending</option>
                  <option value="completed">Payment Completed</option>
                  <option value="failed">Payment Failed</option>
                  <option value="refund_pending">Refund Pending</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white"
                >
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="Cash at Pickup">Cash at Pickup Desk</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Transaction Ref / Note</label>
                <input
                  type="text"
                  placeholder="e.g. UPI-998822 or Cash received by Isha"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setPaymentBooking(null)} className="px-3 py-1.5 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg">Save Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
