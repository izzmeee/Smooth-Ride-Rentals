import React, { useState, useEffect } from 'react';
import type { Scooter } from '../types/index.ts';
import { ScooterCard } from './ScooterCard.tsx';
import { HERO_RIDER_IMAGE, getScooterImage } from '../utils/scooterImages.ts';
import {
  ArrowRight, ShieldCheck, Phone, MessageSquare, ChevronDown,
  FileDown, Calendar, Clock, MapPin, Bike
} from 'lucide-react';

export interface QuickBookingSelection {
  scooter?: Scooter;
  pickupLocation?: string;
  pickupDate?: string;
  pickupTime?: string;
  rentalHours?: number;
}

interface HomeViewProps {
  scooters: Scooter[];
  onOpenBooking: (scooter?: Scooter, prefill?: QuickBookingSelection) => void;
  onViewScooterDetails: (scooter: Scooter) => void;
  onExploreFleet: () => void;
  onOpenEnquiry: () => void;
  onOpenPdfModal: () => void;
}

const HUBS = [
  'Selaqui Hub (Chakrata Rd, Near DGU & University Gate)',
  'Dehradun City Hub (Rajpur Road, Near Clock Tower)',
  'Bidholi Hub (Near UPES Campus Gate 1)'
];

export const HomeView: React.FC<HomeViewProps> = ({
  scooters,
  onOpenBooking,
  onViewScooterDetails,
  onExploreFleet,
  onOpenEnquiry,
  onOpenPdfModal
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [fleetBrandFilter, setFleetBrandFilter] = useState<string>('All');

  // Rapido-Style Instant Booking Console State
  const [selectedHub, setSelectedHub] = useState<string>(HUBS[0]);
  const [selectedScooterId, setSelectedScooterId] = useState<string>('');
  const [pickupDate, setPickupDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [pickupTime, setPickupTime] = useState<string>('10:00');
  const [rentalHours, setRentalHours] = useState<number>(3);

  const availableScooters = scooters.filter(s => s.status === 'available');

  useEffect(() => {
    if (!selectedScooterId && availableScooters.length > 0) {
      setSelectedScooterId(availableScooters[0].id);
      setSelectedHub(availableScooters[0].pickupLocation);
    }
  }, [scooters, selectedScooterId]);

  const activeScooter =
    scooters.find(s => s.id === selectedScooterId) || availableScooters[0] || scooters[0];
  const hourlyRate = activeScooter?.hourlyRate || 60;
  const estimatedFare = rentalHours * hourlyRate;

  const brands = ['All', ...Array.from(new Set(scooters.map(s => s.brand)))];
  const visibleFleet = scooters.filter(s =>
    fleetBrandFilter === 'All' ? true : s.brand === fleetBrandFilter
  );

  const handleWidgetBook = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenBooking(activeScooter, {
      scooter: activeScooter,
      pickupLocation: selectedHub,
      pickupDate,
      pickupTime,
      rentalHours
    });
  };

  const formatDurationLabel = (hours: number) => {
    if (hours === 24) return '1 Day (24 hrs)';
    if (hours === 48) return '2 Days (48 hrs)';
    if (hours === 72) return '3 Days (72 hrs)';
    return `${hours} ${hours === 1 ? 'hr' : 'hrs'}`;
  };

  const faqs = [
    {
      q: 'How does the ₹60 per hour rental pricing work?',
      a: 'Pricing is completely transparent: you pay ₹60 for each hour you book — from short hourly rides (1–12 hours) up to 1 day (24 hrs = ₹1,440), 2 days (48 hrs = ₹2,880), or 3 days (72 hrs = ₹4,320). No surge fees or hidden extras.'
    },
    {
      q: 'What documents are required to rent a scooter in Dehradun?',
      a: 'You must be at least 18 years old and present a valid original Indian Driving Licence for two-wheelers at pickup, along with your College Student ID or Govt ID. A college ID alone is not legally sufficient to drive.'
    },
    {
      q: 'Where are the pickup and drop-off hubs located?',
      a: 'Our campus hubs operate at Selaqui Hub (Chakrata Road, near DGU), Bidholi Hub (near UPES Gate 1), and Rajpur Road in Dehradun.'
    },
    {
      q: 'Are helmets and fuel included with the scooter?',
      a: 'Every rental includes complimentary sanitized ISI-certified helmet(s). Odometer and fuel level are recorded at handover; return with the same fuel level.'
    },
    {
      q: 'Can I cancel my booking request if my plan changes?',
      a: 'Yes. You can submit a cancellation request directly from My Rides before vehicle handover takes place.'
    }
  ];

  return (
    <div className="space-y-20 sm:space-y-28 pb-20">

      {/* =========================================================
          FLAGSHIP OBSIDIAN HERO + ELEVATED RAPIDO BOOKING CONSOLE
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#0B0C10] text-white pt-10 sm:pt-14 pb-14 sm:pb-20">
        {/* Razor-subtle architectural Dehradun street grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-100"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)',
            backgroundSize: '56px 56px'
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-0 w-[520px] h-[520px] rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #FFCA20 0%, transparent 70%)' }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">

            {/* Left Column: Editorial Headline + Elevated White Rapido Console */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-7">
              <div className="space-y-3.5">
                <div className="flex items-center gap-2.5 text-xs font-medium text-neutral-400 tracking-wide">
                  <span className="text-[#FFCA20] font-semibold">Selaqui & Dehradun</span>
                  <span aria-hidden="true">·</span>
                  <span>Hourly Student Scooters</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">Flat ₹60/hr</span>
                </div>

                <h1
                  className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-[-0.03em] leading-[1.08]"
                  style={{ textWrap: 'balance' }}
                >
                  Explore Dehradun on Your Own Terms.
                </h1>

                <p className="text-sm sm:text-base text-neutral-300 max-w-xl leading-relaxed tracking-[0.005em]">
                  Affordable hourly scooter rentals built for college students. Book a serviced scooter in seconds and pay only for the hours you ride.
                </p>
              </div>

              {/* ELEVATED RAPIDO-STYLE INSTANT BOOKING CONSOLE */}
              <form
                onSubmit={handleWidgetBook}
                className="bg-white text-[#0B0C10] rounded-3xl p-5 sm:p-6 shadow-[0_28px_64px_-20px_rgba(0,0,0,0.65)] ring-1 ring-white/10 space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <span className="font-display text-sm font-bold text-[#0B0C10]">
                    Instant Ride Booking
                  </span>
                  <span className="text-xs font-medium text-neutral-500 tabular-nums">
                    ₹{hourlyRate}/hr · Zero hidden fees
                  </span>
                </div>

                {/* Connected Route Fields */}
                <div className="relative space-y-2.5">
                  <div
                    aria-hidden="true"
                    className="absolute left-[19px] top-8 bottom-8 w-px border-l-2 border-dashed border-neutral-300"
                  />

                  {/* Pickup Hub */}
                  <div className="relative flex items-center bg-[#F5F6F8] border border-neutral-200/80 rounded-2xl px-4 py-2.5 focus-within:border-[#0B0C10] focus-within:bg-white transition-colors">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0 mr-3.5" />
                    <div className="flex-1 min-w-0">
                      <label htmlFor="hero-hub" className="block text-[11px] font-medium text-neutral-500 leading-none mb-1">
                        Pickup Hub
                      </label>
                      <select
                        id="hero-hub"
                        value={selectedHub}
                        onChange={(e) => setSelectedHub(e.target.value)}
                        className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#0B0C10] focus:outline-none truncate cursor-pointer"
                      >
                        {HUBS.map(hub => (
                          <option key={hub} value={hub}>{hub}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Scooter Selector with Live Showroom Thumbnail */}
                  <div className="relative flex items-center bg-[#F5F6F8] border border-neutral-200/80 rounded-2xl px-4 py-2.5 focus-within:border-[#0B0C10] focus-within:bg-white transition-colors gap-3">
                    <span className="w-2.5 h-2.5 bg-[#0B0C10] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <label htmlFor="hero-scooter" className="block text-[11px] font-medium text-neutral-500 leading-none mb-1">
                        Scooter Model
                      </label>
                      <select
                        id="hero-scooter"
                        value={selectedScooterId}
                        onChange={(e) => {
                          setSelectedScooterId(e.target.value);
                          const found = scooters.find(s => s.id === e.target.value);
                          if (found) setSelectedHub(found.pickupLocation);
                        }}
                        className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#0B0C10] focus:outline-none truncate cursor-pointer"
                      >
                        {scooters.filter(s => s.status !== 'inactive').map(s => (
                          <option key={s.id} value={s.id} disabled={s.status !== 'available'}>
                            {s.name} ({s.fleetId}) — ₹{s.hourlyRate}/hr {s.status !== 'available' ? `[${s.status}]` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    {activeScooter && (
                      <img
                        src={getScooterImage(`${activeScooter.name} ${activeScooter.model}`, activeScooter.imageUrl)}
                        alt={activeScooter.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-10 object-contain rounded-lg bg-white border border-neutral-200/80 p-0.5 shrink-0 hidden sm:block"
                      />
                    )}
                  </div>
                </div>

                {/* Date & Time Row */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-[#F5F6F8] border border-neutral-200/80 rounded-xl px-3.5 py-2">
                    <label htmlFor="hero-date" className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500 mb-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>Pickup Date</span>
                    </label>
                    <input
                      id="hero-date"
                      type="date"
                      value={pickupDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full bg-transparent text-xs font-semibold text-[#0B0C10] focus:outline-none"
                    />
                  </div>

                  <div className="bg-[#F5F6F8] border border-neutral-200/80 rounded-xl px-3.5 py-2">
                    <label htmlFor="hero-time" className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500 mb-0.5">
                      <Clock className="w-3 h-3" />
                      <span>Pickup Time</span>
                    </label>
                    <select
                      id="hero-time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full bg-transparent text-xs font-semibold text-[#0B0C10] focus:outline-none cursor-pointer"
                    >
                      {['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '16:00', '18:00', '20:00'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Interactive Segmented Duration Selector (Hourly + 1–3 Days) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-medium text-neutral-500">
                    <span>Duration (Hourly or Multi-Day)</span>
                    <span className="font-mono text-neutral-700 tabular-nums">
                      {formatDurationLabel(rentalHours)} × ₹{hourlyRate}
                    </span>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5 p-1 bg-[#F5F6F8] rounded-xl border border-neutral-200/70">
                    {[1, 2, 3, 5, 8, 12].map(h => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setRentalHours(h)}
                        className={`py-2 text-xs font-bold rounded-lg transition-all duration-150 tabular-nums ${
                          rentalHours === h
                            ? 'bg-[#0B0C10] text-white shadow-xs'
                            : 'text-neutral-600 hover:text-[#0B0C10] hover:bg-white/70'
                        }`}
                      >
                        {h}h
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F5F6F8] rounded-xl border border-neutral-200/70">
                    {[
                      { hrs: 24, label: '1 Day' },
                      { hrs: 48, label: '2 Days' },
                      { hrs: 72, label: '3 Days' }
                    ].map(d => (
                      <button
                        key={d.hrs}
                        type="button"
                        onClick={() => setRentalHours(d.hrs)}
                        className={`py-2 text-xs font-bold rounded-lg transition-all duration-150 tabular-nums ${
                          rentalHours === d.hrs
                            ? 'bg-[#0B0C10] text-[#FFCA20] shadow-xs'
                            : 'text-neutral-600 hover:text-[#0B0C10] hover:bg-white/70'
                        }`}
                      >
                        {d.label} <span className="text-[10px] font-medium opacity-75">({d.hrs}h)</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Tactile Rapido Yellow CTA */}
                <button
                  type="submit"
                  className="group w-full py-3.5 px-5 text-sm font-bold text-[#0B0C10] bg-[#FFCA20] hover:bg-[#f2bc12] active:scale-[0.99] rounded-2xl transition-all duration-150 shadow-[0_6px_20px_-6px_rgba(255,202,32,0.65)] flex items-center justify-between"
                >
                  <span>Book Scooter Now</span>
                  <span className="inline-flex items-center gap-2 font-mono font-bold tabular-nums">
                    <span>₹{estimatedFare.toLocaleString('en-IN')}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-neutral-500 pt-0.5">
                  <span>ISI Helmet Included · Valid DL Required</span>
                  <button
                    type="button"
                    onClick={onOpenPdfModal}
                    className="font-semibold text-[#0B0C10] hover:underline inline-flex items-center gap-1 whitespace-nowrap"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Report PDF</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Full-Bleed Dehradun Rider Editorial Showcase */}
            <div className="lg:col-span-6 flex">
              <div className="relative w-full min-h-[340px] lg:min-h-full rounded-3xl overflow-hidden ring-1 ring-white/15 bg-neutral-900 shadow-[0_28px_64px_-20px_rgba(0,0,0,0.65)]">
                <img
                  src={HERO_RIDER_IMAGE}
                  alt="College student riding a rental scooter in Dehradun with Himalayan hills in the background"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10]/90 via-[#0B0C10]/25 to-transparent" />

                <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 space-y-3">
                  <div className="w-12 h-1 bg-[#FFCA20] rounded-full" />
                  <p className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                    Your Ride. Your Time. Your Freedom.
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-neutral-300 pt-1">
                    <span className="font-semibold text-[#FFCA20] tabular-nums">₹60 / hour</span>
                    <span aria-hidden="true" className="text-neutral-600">·</span>
                    <span className="tabular-nums">{availableScooters.length} of {scooters.length} Scooters Ready</span>
                    <span aria-hidden="true" className="text-neutral-600">·</span>
                    <span>Selaqui & Dehradun</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          SHOWROOM FLEET COLLECTION WITH INTERACTIVE BRAND FILTER
      ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="space-y-2.5">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0B0C10] tracking-[-0.025em]">
              Our Scooter Fleet
            </h2>
            <div className="w-14 h-1 bg-[#FFCA20] rounded-full" />
            <p className="text-sm text-neutral-600 max-w-xl">
              Accurate models stationed across our Selaqui, Bidholi, and Dehradun hubs — freshly serviced and ready at ₹60/hour.
            </p>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4 flex-wrap">
            {/* Clean Interactive Brand Filter Tabs */}
            <div className="inline-flex items-center gap-1 p-1 bg-white rounded-xl border border-neutral-200/80">
              {brands.map(brand => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => setFleetBrandFilter(brand)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    fleetBrandFilter === brand
                      ? 'bg-[#0B0C10] text-white'
                      : 'text-neutral-600 hover:text-[#0B0C10]'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>

            <button
              onClick={onExploreFleet}
              className="text-xs sm:text-sm font-bold text-[#0B0C10] hover:text-neutral-600 inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
            >
              <span>Full Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleFleet.slice(0, 4).map(scooter => (
            <ScooterCard
              key={scooter.id}
              scooter={scooter}
              onBookNow={(s) => onOpenBooking(s)}
              onViewDetails={(s) => onViewScooterDetails(s)}
            />
          ))}
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS & INTERACTIVE HOURLY FARE TIERS
      ========================================================= */}
      <section id="how-it-works" className="bg-white border-y border-neutral-200/80 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 space-y-4">
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0B0C10] tracking-[-0.025em] leading-[1.12]">
                Quick Rides, Honest Student Fares.
              </h2>
              <div className="w-14 h-1 bg-[#FFCA20] rounded-full" />
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                Built around university timetables and hostel budgets in Dehradun. Skip auto bargaining and full-day minimums — rent strictly for the hours you need.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onOpenBooking()}
                  className="px-6 py-3 text-sm font-bold text-[#0B0C10] bg-[#FFCA20] hover:bg-[#f2bc12] active:scale-[0.98] rounded-xl transition-all inline-flex items-center gap-2 shadow-[0_4px_16px_-4px_rgba(255,202,32,0.6)]"
                >
                  <span>Reserve a Scooter</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Clean Architectural Hairline Step Columns */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-neutral-200 border border-neutral-200/80 rounded-3xl bg-[#FAFBFD] overflow-hidden">
              <div className="p-6 space-y-3">
                <span className="font-mono text-sm font-semibold text-neutral-400 block">01</span>
                <h3 className="font-display text-base font-bold text-[#0B0C10]">Choose a Scooter</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Select an available Honda Activa 6G, TVS Jupiter 125, Suzuki Access 125, or Hero Destini 125 near your campus.
                </p>
              </div>

              <div className="p-6 space-y-3">
                <span className="font-mono text-sm font-semibold text-neutral-400 block">02</span>
                <h3 className="font-display text-base font-bold text-[#0B0C10]">Select Your Hours</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Pick your exact pickup time and hours. Your fare calculates upfront at ₹60 per hour with zero surprises.
                </p>
              </div>

              <div className="p-6 space-y-3">
                <span className="font-mono text-sm font-semibold text-neutral-400 block">03</span>
                <h3 className="font-display text-base font-bold text-[#0B0C10]">Verify DL & Ride</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Show your valid Driving Licence at the pickup desk, collect keys and sanitized ISI helmet, and ride away.
                </p>
              </div>
            </div>
          </div>

          {/* Clickable Quick-Book Hourly & Multi-Day Fare Strip */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500">
                Transparent Hourly & Multi-Day Pricing · Click any duration to start booking
              </span>
              <span className="text-xs font-mono text-neutral-500">₹60 × hours</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { hrs: 1, label: '1 Hour', price: '₹60', note: 'Quick market or campus run' },
                { hrs: 2, label: '2 Hours', price: '₹120', note: 'Cafe & shopping trips' },
                { hrs: 3, label: '3 Hours', price: '₹180', note: 'City errands & classes' },
                { hrs: 8, label: '8 Hours', price: '₹480', note: 'Full campus & city day' }
              ].map((tier) => (
                <button
                  key={tier.hrs}
                  type="button"
                  onClick={() =>
                    onOpenBooking(activeScooter, {
                      scooter: activeScooter,
                      pickupLocation: selectedHub,
                      pickupDate,
                      pickupTime,
                      rentalHours: tier.hrs
                    })
                  }
                  className="group text-left p-5 rounded-2xl bg-[#FAFBFD] hover:bg-[#0B0C10] border border-neutral-200/80 hover:border-[#0B0C10] transition-all duration-200 ease-premium"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-500 group-hover:text-neutral-400">
                      {tier.label}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#FFCA20] transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <div className="font-display text-3xl font-extrabold text-[#0B0C10] group-hover:text-white tabular-nums mt-1.5">
                    {tier.price}
                  </div>
                  <div className="text-xs text-neutral-500 group-hover:text-neutral-300 mt-1">
                    {tier.note}
                  </div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { hrs: 24, label: '1 Day (24 Hours)', price: '₹1,440', note: 'Full 24-hour Dehradun & hills trip' },
                { hrs: 48, label: '2 Days (48 Hours)', price: '₹2,880', note: 'Weekend Mussoorie & campus getaway' },
                { hrs: 72, label: '3 Days (72 Hours)', price: '₹4,320', note: 'Extended multi-day freedom pass' }
              ].map((tier) => (
                <button
                  key={tier.hrs}
                  type="button"
                  onClick={() =>
                    onOpenBooking(activeScooter, {
                      scooter: activeScooter,
                      pickupLocation: selectedHub,
                      pickupDate,
                      pickupTime,
                      rentalHours: tier.hrs
                    })
                  }
                  className="group text-left p-5 rounded-2xl bg-[#FAFBFD] hover:bg-[#0B0C10] border border-neutral-200/80 hover:border-[#0B0C10] transition-all duration-200 ease-premium"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-500 group-hover:text-[#FFCA20]">
                      {tier.label}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#FFCA20] transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <div className="font-display text-3xl font-extrabold text-[#0B0C10] group-hover:text-white tabular-nums mt-1.5">
                    {tier.price}
                  </div>
                  <div className="text-xs text-neutral-500 group-hover:text-neutral-300 mt-1">
                    {tier.note}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================
          SAFETY & STANDARDS — HAIRLINE OBSIDIAN GRID (NO NESTED BOXES)
      ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0B0C10] text-white rounded-3xl overflow-hidden shadow-[0_24px_54px_-24px_rgba(11,12,16,0.5)]">
          <div className="p-7 sm:p-10 border-b border-white/10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-xl space-y-2.5">
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-[-0.025em]">
                Safety & Compliance Built In
              </h2>
              <div className="w-14 h-1 bg-[#FFCA20] rounded-full" />
              <p className="text-sm text-neutral-400 leading-relaxed pt-1">
                Every handover follows strict Uttarakhand two-wheeler compliance so every campus ride stays safe, legal, and transparent.
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-400 shrink-0">
              18+ Valid Driving Licence Required
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            <div className="p-6 sm:p-7 space-y-2.5">
              <ShieldCheck className="w-5 h-5 text-[#FFCA20]" />
              <h3 className="font-display text-base font-bold text-white">Verified Driving Licence</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Mandatory 18+ eligibility and original Driving Licence verification before keys are handed over.
              </p>
            </div>

            <div className="p-6 sm:p-7 space-y-2.5">
              <Bike className="w-5 h-5 text-[#FFCA20]" />
              <h3 className="font-display text-base font-bold text-white">Sanitized ISI Helmets</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Complimentary ISI-certified helmets cleaned and inspected before every single trip.
              </p>
            </div>

            <div className="p-6 sm:p-7 space-y-2.5">
              <MapPin className="w-5 h-5 text-[#FFCA20]" />
              <h3 className="font-display text-base font-bold text-white">Authorized Servicing</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Routine brake, tyre, headlamp, and fluid inspections logged across all Dehradun hubs.
              </p>
            </div>

            <div className="p-6 sm:p-7 space-y-2.5">
              <Clock className="w-5 h-5 text-[#FFCA20]" />
              <h3 className="font-display text-base font-bold text-white">Transparent Billing</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Odometer and fuel level logged on handover and return — zero silent extra fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FREQUENTLY ASKED QUESTIONS
      ========================================================= */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="space-y-2.5">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0B0C10] tracking-[-0.025em]">
            Frequently Asked Questions
          </h2>
          <div className="w-12 h-1 bg-[#FFCA20] rounded-full" />
        </div>

        <div className="bg-white rounded-3xl border border-neutral-200/80 divide-y divide-neutral-200/80 overflow-hidden">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 hover:bg-neutral-50/80 transition-colors"
                >
                  <span className="text-sm font-bold text-[#0B0C10]">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-[#0B0C10]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================
          REFINED CONCIERGE SUPPORT STRIP (BALANCED 60-30-10)
      ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-7 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="font-display text-xl sm:text-2xl font-extrabold text-[#0B0C10] tracking-tight">
              Need a scooter right now in Selaqui or Dehradun?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600">
              Reach our campus desk on WhatsApp or phone daily between 7:00 AM and 10:00 PM.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <button
              onClick={onOpenEnquiry}
              className="px-5 py-3 text-xs sm:text-sm font-bold text-[#0B0C10] bg-[#FFCA20] hover:bg-[#f2bc12] rounded-xl transition-colors inline-flex items-center gap-2 whitespace-nowrap shadow-[0_4px_14px_-4px_rgba(255,202,32,0.65)]"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Desk</span>
            </button>

            <a
              href="tel:+919896761229"
              className="px-5 py-3 text-xs sm:text-sm font-bold text-[#0B0C10] bg-neutral-100 hover:bg-neutral-200/80 rounded-xl transition-colors inline-flex items-center gap-2 whitespace-nowrap"
            >
              <Phone className="w-4 h-4" />
              <span>Call Helpline</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};
