import React, { useState, useEffect } from 'react';
import type { Scooter, User, Booking } from '../types/index.ts';
import type { QuickBookingSelection } from './HomeView.tsx';
import { getScooterImage } from '../utils/scooterImages.ts';
import { api } from '../services/api.ts';
import {
  X, Calendar, Clock, MapPin, ShieldCheck, CheckCircle2,
  AlertCircle, ArrowRight, ArrowLeft, Loader2, Info
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedScooter: Scooter | null;
  prefill?: QuickBookingSelection | null;
  scooters: Scooter[];
  currentUser: User | null;
  onBookingSuccess: (booking: Booking) => void;
  onOpenAuth: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  selectedScooter,
  prefill,
  scooters,
  currentUser,
  onBookingSuccess,
  onOpenAuth
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [activeScooterId, setActiveScooterId] = useState<string>('');
  const [pickupDate, setPickupDate] = useState<string>('');
  const [pickupTime, setPickupTime] = useState<string>('10:00');
  const [rentalHours, setRentalHours] = useState<number>(3);
  const [pickupLocation, setPickupLocation] = useState<string>('');

  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerCollege, setCustomerCollege] = useState<string>('');
  const [dlNumber, setDlNumber] = useState<string>('');

  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [dlConfirmed, setDlConfirmed] = useState<boolean>(false);

  const [isCheckingConflict, setIsCheckingConflict] = useState<boolean>(false);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [settingsDeposit, setSettingsDeposit] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setConflictError(null);
      setCreatedBooking(null);

      const today = new Date().toISOString().split('T')[0];
      setPickupDate(prefill?.pickupDate || today);
      setPickupTime(prefill?.pickupTime || '10:00');
      setRentalHours(prefill?.rentalHours || 3);

      const targetScooter = prefill?.scooter || selectedScooter;
      if (targetScooter) {
        setActiveScooterId(targetScooter.id);
        setPickupLocation(prefill?.pickupLocation || targetScooter.pickupLocation);
      } else if (scooters.length > 0) {
        const availableOne = scooters.find(s => s.status === 'available') || scooters[0];
        setActiveScooterId(availableOne.id);
        setPickupLocation(prefill?.pickupLocation || availableOne.pickupLocation);
      }

      if (currentUser) {
        setCustomerName(currentUser.name);
        setCustomerPhone(currentUser.phone);
        setCustomerEmail(currentUser.email);
        setCustomerCollege(currentUser.collegeOrHostel || '');
        setDlNumber(currentUser.dlNumber || '');
        if (currentUser.dlVerificationStatus === 'verified') {
          setDlConfirmed(true);
        }
      }

      api.getSettings().then(res => {
        setSettingsDeposit(res.settings.securityDeposit || 0);
      }).catch(() => {});
    }
  }, [isOpen, selectedScooter, prefill, currentUser, scooters]);

  if (!isOpen) return null;

  const currentScooter = scooters.find(s => s.id === activeScooterId) || selectedScooter;
  const hourlyRate = currentScooter?.hourlyRate || 60;
  const rentalAmount = rentalHours * hourlyRate;
  const totalAmount = rentalAmount + settingsDeposit;

  const formatDuration = (hours: number) => {
    if (hours === 24) return '1 Day (24 Hours)';
    if (hours === 48) return '2 Days (48 Hours)';
    if (hours === 72) return '3 Days (72 Hours)';
    return `${hours} ${hours === 1 ? 'Hour' : 'Hours'}`;
  };

  const validateAvailability = async () => {
    if (!currentScooter) return false;
    setIsCheckingConflict(true);
    setConflictError(null);
    try {
      const res = await api.checkAvailability(currentScooter.id, pickupDate, pickupTime, rentalHours);
      if (!res.available) {
        setConflictError(res.reason);
        return false;
      }
      return true;
    } catch {
      setConflictError('Could not verify scooter schedule. Please retry.');
      return false;
    } finally {
      setIsCheckingConflict(false);
    }
  };

  const handleProceedToStep2 = async () => {
    if (!pickupDate || !pickupTime || rentalHours <= 0) {
      setConflictError('Please select a valid date, pickup time, and rental hours.');
      return;
    }
    const isAvail = await validateAvailability();
    if (isAvail) {
      setStep(2);
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerEmail) {
      setConflictError('Please provide your full name, phone number, and email.');
      return;
    }
    if (!termsAccepted || !dlConfirmed) {
      setConflictError('Please confirm driving licence eligibility and accept the rental terms.');
      return;
    }

    setIsSubmitting(true);
    setConflictError(null);

    try {
      let customerId = currentUser?.id;
      if (!customerId) {
        try {
          const authRes = await api.register({
            name: customerName,
            phone: customerPhone,
            email: customerEmail,
            collegeOrHostel: customerCollege,
            dlNumber
          });
          customerId = authRes.user.id;
        } catch {
          const loginRes = await api.login(customerEmail);
          customerId = loginRes.user.id;
        }
      }

      const res = await api.createBooking({
        customerId,
        customerName,
        customerPhone,
        customerEmail,
        customerCollege,
        scooterId: currentScooter!.id,
        pickupDate,
        pickupTime,
        rentalHours,
        pickupLocation
      });

      setCreatedBooking(res.booking);
      setStep(3);
      onBookingSuccess(res.booking);
    } catch (err: any) {
      setConflictError(err.message || 'Booking submission failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0B0C10]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-neutral-200/80 overflow-hidden flex flex-col max-h-[94vh]">

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-100 flex items-center justify-between bg-[#F5F6F8]">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500">
              Step {step} of 3 · Smooth Ride Rentals
            </div>
            <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#0B0C10] mt-0.5">
              {step === 1 && 'Choose Scooter & Rental Hours'}
              {step === 2 && 'Confirm Details & Driving Licence'}
              {step === 3 && 'Booking Request Submitted'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-500 hover:text-[#0B0C10] hover:bg-neutral-200/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-5">

              {/* Visual Scooter Selector with Real Accurate Photos */}
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-2">
                  1. Select Scooter Model
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {scooters.filter(s => s.status !== 'inactive').map((s) => {
                    const isSelected = activeScooterId === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setActiveScooterId(s.id);
                          setPickupLocation(s.pickupLocation);
                          setConflictError(null);
                        }}
                        className={`text-left p-2.5 rounded-xl border transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'border-[#111111] bg-[#FFCA20]/15 ring-1 ring-[#111111]'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <img
                          src={getScooterImage(`${s.name} ${s.model}`, s.imageUrl)}
                          alt={s.name}
                          referrerPolicy="no-referrer"
                          className="w-16 h-12 object-contain rounded-lg bg-white border border-neutral-100 shrink-0 p-0.5"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-extrabold text-xs text-[#111111] truncate">{s.name}</div>
                          <div className="text-[11px] text-neutral-500 truncate">{s.fleetId} · {s.color}</div>
                          <div className="text-xs font-extrabold text-[#111111] tabular-nums mt-0.5">
                            ₹{s.hourlyRate}/hr
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1.5">
                    Pickup Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="date"
                      value={pickupDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        setPickupDate(e.target.value);
                        setConflictError(null);
                      }}
                      className="w-full pl-9 pr-3 py-2 text-xs font-semibold border border-neutral-200 rounded-xl bg-[#F7F8FA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111111]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1.5">
                    Pickup Time (07:00 – 21:00)
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                    <select
                      value={pickupTime}
                      onChange={(e) => {
                        setPickupTime(e.target.value);
                        setConflictError(null);
                      }}
                      className="w-full pl-9 pr-3 py-2 text-xs font-semibold border border-neutral-200 rounded-xl bg-[#F7F8FA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111111]"
                    >
                      {[
                        '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
                        '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
                        '19:00', '20:00', '21:00'
                      ].map(t => (
                        <option key={t} value={t}>
                          {t} ({parseInt(t.split(':')[0]) >= 12 ? 'PM' : 'AM'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Rental Duration (Hourly + Multi-Day) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-600">
                    Rental Duration (Hourly or Multi-Day)
                  </label>
                  <span className="text-xs font-extrabold text-[#0B0C10] tabular-nums">
                    {formatDuration(rentalHours)}
                  </span>
                </div>

                {/* Hourly Quick Options */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {[1, 2, 3, 5, 8, 12].map(h => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => {
                        setRentalHours(h);
                        setConflictError(null);
                      }}
                      className={`py-2 px-1.5 text-xs font-bold rounded-xl transition-colors border tabular-nums ${
                        rentalHours === h
                          ? 'bg-[#FFCA20] text-[#0B0C10] border-[#0B0C10]'
                          : 'bg-[#F5F6F8] text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      {h}h · ₹{h * hourlyRate}
                    </button>
                  ))}
                </div>

                {/* Multi-Day Quick Options (1 Day, 2 Days, 3 Days) */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { hrs: 24, label: '1 Day' },
                    { hrs: 48, label: '2 Days' },
                    { hrs: 72, label: '3 Days' }
                  ].map(d => (
                    <button
                      key={d.hrs}
                      type="button"
                      onClick={() => {
                        setRentalHours(d.hrs);
                        setConflictError(null);
                      }}
                      className={`py-2.5 px-2 text-xs font-bold rounded-xl transition-colors border tabular-nums flex flex-col items-center justify-center ${
                        rentalHours === d.hrs
                          ? 'bg-[#0B0C10] text-[#FFCA20] border-[#0B0C10]'
                          : 'bg-[#F5F6F8] text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      <span>{d.label} ({d.hrs}h)</span>
                      <span className={`text-[11px] font-semibold mt-0.5 ${rentalHours === d.hrs ? 'text-white' : 'text-neutral-500'}`}>
                        ₹{(d.hrs * hourlyRate).toLocaleString('en-IN')}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Fine-grained Hourly Slider (1–12 hrs) */}
                <div className="pt-1">
                  <input
                    type="range"
                    min="1"
                    max="12"
                    step="1"
                    value={Math.min(rentalHours, 12)}
                    onChange={(e) => {
                      setRentalHours(parseInt(e.target.value));
                      setConflictError(null);
                    }}
                    className="w-full accent-[#0B0C10] cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-neutral-500 px-1 mt-0.5">
                    <span>1 hr</span>
                    <span>4 hrs</span>
                    <span>8 hrs</span>
                    <span>12 hrs (or pick 1–3 Days above)</span>
                  </div>
                </div>
              </div>

              {/* Pickup Hub */}
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1.5">
                  Pickup & Return Hub
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold border border-neutral-200 rounded-xl bg-[#F7F8FA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111111]"
                  />
                </div>
              </div>

              {/* Fare Summary Box */}
              <div className="bg-[#0B0C10] text-white rounded-2xl p-5">
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                  <span>Estimated Ride Fare</span>
                  <span className="font-mono text-[#FFCA20] font-semibold">₹{hourlyRate} × {rentalHours}h</span>
                </div>
                <div className="flex items-baseline justify-between mb-3.5">
                  <div>
                    <span className="font-display text-3xl font-extrabold tabular-nums">₹{rentalAmount.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-neutral-300 ml-1.5">total rental charge</span>
                  </div>
                  <div className="text-xs text-[#FFCA20] font-semibold">
                    Pay at pickup
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800 text-[11px] text-neutral-300 space-y-1">
                  <div className="flex justify-between">
                    <span>Rental Duration ({formatDuration(rentalHours)} @ ₹{hourlyRate}/hr)</span>
                    <span className="font-bold tabular-nums">₹{rentalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Refundable Security Deposit</span>
                    <span className="font-bold tabular-nums">₹{settingsDeposit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sanitized ISI Helmet</span>
                    <span className="text-[#FFCA20] font-bold">Included</span>
                  </div>
                </div>
              </div>

              {conflictError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{conflictError}</div>
                </div>
              )}

            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmitBooking} className="space-y-4">

              {!currentUser && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                  <div className="text-xs text-amber-900">
                    <span className="font-bold">Already registered?</span> Log in to auto-fill details.
                  </div>
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="text-xs font-extrabold text-[#111111] underline"
                  >
                    Log In
                  </button>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-neutral-600">
                  2. Rider Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Mobile Number (WhatsApp) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@student.dgu.ac.in"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">College / Hostel</label>
                    <input
                      type="text"
                      placeholder="e.g. DGU Boys Hostel, Selaqui"
                      value={customerCollege}
                      onChange={(e) => setCustomerCollege(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Driving Licence Number (Mandatory) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UK07-20230045129"
                    value={dlNumber}
                    onChange={(e) => setDlNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] uppercase"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Original Driving Licence must be shown at pickup. College ID alone is not legally sufficient.
                  </p>
                </div>
              </div>

              {/* Terms */}
              <div className="p-3.5 bg-[#F7F8FA] border border-neutral-200 rounded-xl space-y-2.5">
                <h4 className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Rental Terms & Eligibility</span>
                </h4>

                <label className="flex items-start gap-2 text-xs text-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={dlConfirmed}
                    onChange={(e) => setDlConfirmed(e.target.checked)}
                    className="mt-0.5 rounded accent-[#111111]"
                  />
                  <span>
                    I confirm I am <strong>18+ years old</strong> and hold a valid Indian two-wheeler Driving Licence.
                  </span>
                </label>

                <label className="flex items-start gap-2 text-xs text-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 rounded accent-[#111111]"
                  />
                  <span>
                    I agree to wear the provided ISI helmet, follow city speed limits, return with matching fuel, and pay ₹{rentalAmount} at pickup.
                  </span>
                </label>
              </div>

              {conflictError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{conflictError}</div>
                </div>
              )}

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-2.5 px-4 text-xs font-bold text-[#111111] bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !termsAccepted || !dlConfirmed}
                  className="flex-1 py-3 px-4 text-xs font-extrabold text-[#111111] bg-[#FFCA20] hover:bg-[#f2bc12] disabled:bg-neutral-200 disabled:text-neutral-400 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm Booking Request (₹{totalAmount})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

          {/* STEP 3 */}
          {step === 3 && createdBooking && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-[#FFCA20]/20 text-[#111111] rounded-full flex items-center justify-center mx-auto border border-[#FFCA20]">
                <CheckCircle2 className="w-8 h-8 text-emerald-700" />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-[#111111]">
                  Booking Request Received!
                </h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  Saved in database. Operator approval is pending to confirm your pickup slot.
                </p>
              </div>

              <div className="bg-[#F7F8FA] border border-neutral-200 rounded-xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                  <span className="text-neutral-500 font-medium">Booking Reference</span>
                  <span className="font-mono font-extrabold text-[#111111] text-sm">
                    {createdBooking.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-neutral-500 block">Scooter</span>
                    <span className="font-bold text-[#111111]">{createdBooking.scooterName} ({createdBooking.scooterFleetId})</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Duration</span>
                    <span className="font-bold text-[#0B0C10]">{formatDuration(createdBooking.rentalHours)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Pickup Schedule</span>
                    <span className="font-bold text-[#0B0C10]">{createdBooking.pickupDate} at {createdBooking.pickupTime}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Payable at Pickup</span>
                    <span className="font-extrabold text-emerald-700 tabular-nums">₹{createdBooking.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-200 text-[11px] text-neutral-600 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
                  <span><strong>Hub:</strong> {createdBooking.pickupLocation}</span>
                </div>
              </div>

              <div className="p-3 bg-neutral-100 border border-neutral-200 rounded-xl text-left text-xs text-neutral-800 flex items-start gap-2">
                <Info className="w-4 h-4 text-[#111111] shrink-0 mt-0.5" />
                <div>
                  <strong>Next Step:</strong> Carry your original Driving Licence and College ID to the pickup hub for quick handover.
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="py-3 px-6 text-xs font-extrabold text-[#111111] bg-[#FFCA20] hover:bg-[#f2bc12] rounded-xl transition-colors"
              >
                Done & Track My Ride
              </button>
            </div>
          )}

        </div>

        {/* Footer for Step 1 */}
        {step === 1 && (
          <div className="p-4 border-t border-neutral-200 bg-[#F7F8FA] flex items-center justify-between">
            <div className="text-xs text-neutral-600">
              <strong className="text-[#111111]">{currentScooter?.name}</strong> · <strong className="text-[#111111] tabular-nums">₹{rentalAmount}</strong>
            </div>

            <button
              type="button"
              onClick={handleProceedToStep2}
              disabled={isCheckingConflict}
              className="py-2.5 px-5 text-xs font-extrabold text-[#111111] bg-[#FFCA20] hover:bg-[#f2bc12] disabled:bg-neutral-200 disabled:text-neutral-400 rounded-xl transition-colors flex items-center gap-2"
            >
              {isCheckingConflict ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <span>Next: Rider Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
