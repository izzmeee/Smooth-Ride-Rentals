import React, { useState, useEffect } from 'react';
import type { Booking, User, BookingStatus } from '../types/index.ts';
import { api } from '../services/api.ts';
import { 
  Clock, CheckCircle2, AlertCircle, XCircle, Calendar, 
  MapPin, ShieldCheck, FileText, Star, MessageSquare, 
  AlertTriangle, Phone, ArrowUpRight, Loader2, RefreshCw
} from 'lucide-react';

interface CustomerDashboardProps {
  currentUser: User;
  onOpenBooking: () => void;
  onOpenFeedback: (booking: Booking) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  currentUser,
  onOpenBooking,
  onOpenFeedback
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState<boolean>(false);

  // Verification form state
  const [dlNumberInput, setDlNumberInput] = useState<string>(currentUser.dlNumber || '');
  const [collegeIdInput, setCollegeIdInput] = useState<string>('');
  const [isSubmittingDoc, setIsSubmittingDoc] = useState<boolean>(false);
  const [docMessage, setDocMessage] = useState<string | null>(null);

  const fetchRides = async () => {
    setIsLoading(true);
    try {
      const res = await api.getBookings({ customerId: currentUser.id });
      setBookings(res.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [currentUser]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!cancelReason.trim()) {
      alert('Please provide a brief reason for cancellation.');
      return;
    }
    setIsSubmittingCancel(true);
    try {
      await api.updateBookingStatus(bookingId, 'cancelled', cancelReason);
      setCancellingId(null);
      setCancelReason('');
      fetchRides();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dlNumberInput.trim()) return;
    setIsSubmittingDoc(true);
    setDocMessage(null);
    try {
      await api.submitVerification({
        userId: currentUser.id,
        dlNumber: dlNumberInput.toUpperCase(),
        collegeIdNumber: collegeIdInput,
        ageConfirmed: true
      });
      currentUser.dlNumber = dlNumberInput.toUpperCase();
      currentUser.dlVerificationStatus = 'pending';
      setDocMessage('Driving Licence submitted! An admin will review it before your pickup.');
    } catch (err: any) {
      setDocMessage('Submission failed. Please retry.');
    } finally {
      setIsSubmittingDoc(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (statusFilter === 'all') return true;
    return b.status === statusFilter;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Confirmed
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-blue-600 animate-spin" /> In Progress
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-amber-600" /> Pending Review
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-slate-600" /> Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            <XCircle className="w-3 h-3 text-rose-500" /> Cancelled
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            <AlertCircle className="w-3 h-3 text-rose-500" /> Request Declined
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* Top Welcome Card */}
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
              Student Rider Account
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1.5">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            {currentUser.collegeOrHostel || 'Selaqui / Dehradun Campus'} · {currentUser.phone}
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchRides}
            className="p-2.5 text-neutral-300 hover:text-white hover:bg-white/10 rounded-xl border border-white/15 transition-colors"
            title="Refresh bookings"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={onOpenBooking}
            className="py-2.5 px-5 text-xs font-extrabold text-[#0B0C10] bg-[#FFCA20] hover:bg-[#f4be10] rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            + Book Scooter (₹60/hr)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Bookings List */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Filter Bar (Functional Buttons) */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-neutral-200/80 shadow-2xs">
              {[
                { id: 'all', label: 'All Rides' },
                { id: 'pending', label: 'Pending' },
                { id: 'confirmed', label: 'Confirmed' },
                { id: 'active', label: 'In Progress' },
                { id: 'completed', label: 'Completed' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                    statusFilter === tab.id
                      ? 'bg-[#0B0C10] text-white shadow-xs'
                      : 'text-neutral-600 hover:text-[#0B0C10]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-neutral-500 shrink-0 font-semibold tabular-nums">
              {filteredBookings.length} {filteredBookings.length === 1 ? 'ride' : 'rides'}
            </div>
          </div>

          {/* Bookings cards */}
          {isLoading ? (
            <div className="py-12 text-center text-neutral-400 bg-white rounded-3xl border border-neutral-200/80">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-xs">Loading your rental records...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-3xl border border-neutral-200/80 p-6 space-y-3">
              <Calendar className="w-8 h-8 text-neutral-300 mx-auto" />
              <h3 className="font-display text-base font-bold text-[#0B0C10]">No rides found in this category</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Ready to head out for college, shopping, or cafe hopping? Rent a scooter at just ₹60/hour.
              </p>
              <button
                onClick={onOpenBooking}
                className="mt-2 inline-flex items-center gap-1.5 py-2.5 px-5 text-xs font-extrabold text-[#0B0C10] bg-[#FFCA20] hover:bg-[#f4be10] rounded-xl transition-colors"
              >
                Book a Scooter Now
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-3xl border border-neutral-200/80 p-5 sm:p-6 shadow-2xs space-y-3.5 transition-all hover:border-neutral-300 hover:shadow-sm"
                >
                  {/* Top Row: Ref & Status */}
                  <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold bg-[#0B0C10] text-white px-2.5 py-0.5 rounded-lg">
                        {b.id}
                      </span>
                      <span className="font-display text-sm font-bold text-[#0B0C10]">
                        {b.scooterName} <span className="text-neutral-500 font-normal">({b.scooterFleetId})</span>
                      </span>
                    </div>
                    <div>
                      {getStatusBadge(b.status)}
                    </div>
                  </div>

                  {/* Mid Row: Date, Duration, Hub & Price */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Pickup Date</span>
                      <span className="font-semibold text-slate-800">{b.pickupDate} at {b.pickupTime}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Duration</span>
                      <span className="font-semibold text-slate-800">
                        {b.rentalHours === 24
                          ? '1 Day (24 hrs)'
                          : b.rentalHours === 48
                          ? '2 Days (48 hrs)'
                          : b.rentalHours === 72
                          ? '3 Days (72 hrs)'
                          : `${b.rentalHours} ${b.rentalHours === 1 ? 'Hour' : 'Hours'}`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Rental Amount</span>
                      <span className="font-bold text-slate-900 tabular-nums">
                        ₹{b.rentalAmount}
                        <span className="text-[10px] text-slate-600 font-normal"> (@ ₹{b.ratePerHour}/hr)</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Payment Status</span>
                      <span className={`font-semibold capitalize text-xs ${
                        b.paymentStatus === 'completed' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {b.paymentStatus.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Pickup Hub Details */}
                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span><strong>Pickup Location:</strong> {b.pickupLocation}</span>
                  </div>

                  {/* Handover & Return Details if active or completed */}
                  {(b.handoverOdo || b.returnOdo) && (
                    <div className="text-[11px] text-slate-500 grid grid-cols-2 gap-2 bg-slate-50/70 p-2 rounded-lg border border-slate-100">
                      {b.handoverOdo && (
                        <div>
                          <strong>Pickup Odometer:</strong> {b.handoverOdo} km (Fuel: {b.handoverFuel})
                        </div>
                      )}
                      {b.returnOdo && (
                        <div>
                          <strong>Return Odometer:</strong> {b.returnOdo} km (Distance: {b.returnOdo - (b.handoverOdo || 0)} km)
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                    <div className="text-[11px] text-slate-600">
                      Booked on {new Date(b.createdAt).toLocaleDateString('en-IN')}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Customer can cancel if pending or confirmed */}
                      {(b.status === 'pending' || b.status === 'confirmed') && (
                        <>
                          {cancellingId === b.id ? (
                            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                              <input
                                type="text"
                                placeholder="Reason for cancellation..."
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="px-2 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none"
                              />
                              <button
                                onClick={() => handleCancelBooking(b.id)}
                                disabled={isSubmittingCancel}
                                className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700"
                              >
                                Confirm Cancel
                              </button>
                              <button
                                onClick={() => setCancellingId(null)}
                                className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800"
                              >
                                Back
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setCancellingId(b.id);
                                setCancelReason('');
                              }}
                              className="text-xs text-slate-500 hover:text-rose-600 font-medium px-2 py-1 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              Request Cancellation
                            </button>
                          )}
                        </>
                      )}

                      {/* Feedback button if completed */}
                      {b.status === 'completed' && (
                        <button
                          onClick={() => onOpenFeedback(b)}
                          className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Star className="w-3.5 h-3.5 fill-emerald-600" />
                          <span>Leave Ride Feedback</span>
                        </button>
                      )}

                      <a
                        href="tel:+919896761229"
                        className="text-xs text-slate-600 hover:text-slate-900 border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Support</span>
                      </a>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right 1 Col: Driving Licence & Verification Desk + Instructions */}
        <div className="space-y-4">
          
          {/* Identity & DL Verification Card */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="font-display text-base font-bold text-[#0B0C10]">
                Driver Verification Checklist
              </h2>
            </div>

            <p className="text-xs text-neutral-500 leading-relaxed">
              In accordance with Uttarakhand vehicle rental regulations, all renters must be 18+ and possess a valid Driving Licence.
            </p>

            {/* Current Status Row */}
            <div className="p-3.5 rounded-2xl bg-[#F5F6F8] border border-neutral-200/80 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Driving Licence:</span>
                {currentUser.dlVerificationStatus === 'verified' ? (
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified by Admin
                  </span>
                ) : currentUser.dlVerificationStatus === 'pending' ? (
                  <span className="font-bold text-amber-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Under Verification
                  </span>
                ) : (
                  <span className="font-bold text-neutral-700">Action Required</span>
                )}
              </div>
              <div className="font-mono text-[#0B0C10] font-semibold text-xs">
                {currentUser.dlNumber || 'Not submitted yet'}
              </div>
              {currentUser.verificationNotes && (
                <div className="text-[11px] text-neutral-500 italic pt-1.5 border-t border-neutral-200">
                  Note: {currentUser.verificationNotes}
                </div>
              )}
            </div>

            {/* Update / Submit form */}
            {currentUser.dlVerificationStatus !== 'verified' && (
              <form onSubmit={handleSubmitVerification} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                    Driving Licence Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UK07-20230045129"
                    value={dlNumberInput}
                    onChange={(e) => setDlNumberInput(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-mono uppercase border border-neutral-200 rounded-xl bg-[#F5F6F8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B0C10]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                    College / Student ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DGU/2024/BBA/104"
                    value={collegeIdInput}
                    onChange={(e) => setCollegeIdInput(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl bg-[#F5F6F8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B0C10]"
                  />
                </div>

                {docMessage && (
                  <div className="text-xs p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl">
                    {docMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingDoc || !dlNumberInput}
                  className="w-full py-2.5 px-4 text-xs font-extrabold text-white bg-[#0B0C10] hover:bg-neutral-800 disabled:bg-neutral-300 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  {isSubmittingDoc ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Submit for Admin Review</span>
                  )}
                </button>
              </form>
            )}

          </div>

          {/* Pickup Guidelines Card */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-2xs space-y-3.5 text-xs">
            <h3 className="font-display text-base font-bold text-[#0B0C10] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0B0C10]" />
              <span>Pickup & Handover Rules</span>
            </h3>

            <ul className="space-y-2.5 text-neutral-600">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFCA20] mt-1.5 shrink-0"></span>
                <span><strong className="text-[#0B0C10]">Physical DL Mandatory:</strong> Carry your original driving licence during pickup.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFCA20] mt-1.5 shrink-0"></span>
                <span><strong className="text-[#0B0C10]">Complimentary Helmet:</strong> ISI certified helmet provided. Wearing helmet is mandatory by law.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFCA20] mt-1.5 shrink-0"></span>
                <span><strong className="text-[#0B0C10]">Fuel Policy:</strong> Odometer and fuel level recorded on handover. Return with same fuel level.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFCA20] mt-1.5 shrink-0"></span>
                <span><strong className="text-[#0B0C10]">City Speed:</strong> Keep speed under 50 km/h in Selaqui & Dehradun.</span>
              </li>
            </ul>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-neutral-500 text-[11px]">
              <span>Helpline Desk</span>
              <span className="font-bold text-[#0B0C10] tabular-nums">+91 98967 61229</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
