import React, { useState, useEffect } from 'react';
import type { Scooter, User, Booking } from './types/index.ts';
import { api } from './services/api.ts';
import { Navbar } from './components/Navbar.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { HomeView, type QuickBookingSelection } from './components/HomeView.tsx';
import { FleetView } from './components/FleetView.tsx';
import { CustomerDashboard } from './components/CustomerDashboard.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { BookingModal } from './components/BookingModal.tsx';
import { ScooterDetailsModal } from './components/ScooterDetailsModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { FeedbackModal } from './components/FeedbackModal.tsx';
import { EnquiryModal } from './components/EnquiryModal.tsx';
import { TestingChecklistModal } from './components/TestingChecklistModal.tsx';
import { Logo } from './components/Logo.tsx';
import { auth, onAuthStateChanged, signOutFirebase } from './firebase.ts';
import { Phone, Mail, MapPin, MessageSquare } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [scooters, setScooters] = useState<Scooter[]>([]);

  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [bookingScooter, setBookingScooter] = useState<Scooter | null>(null);
  const [bookingPrefill, setBookingPrefill] = useState<QuickBookingSelection | null>(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [detailsScooter, setDetailsScooter] = useState<Scooter | null>(null);

  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState<boolean>(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState<boolean>(false);

  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const [feedbackBooking, setFeedbackBooking] = useState<Booking | null>(null);

  const loadAppData = async () => {
    try {
      const scootersRes = await api.getScooters({ role: currentUser?.role });
      setScooters(scootersRes.scooters);
    } catch (err) {
      console.error('Failed to load application data', err);
    }
  };

  useEffect(() => {
    loadAppData();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        try {
          const res = await api.googleAuth({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            email: firebaseUser.email,
            photoUrl: firebaseUser.photoURL || undefined
          });
          setCurrentUser(res.user);
        } catch {
          // Keep current state if sync fails
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    loadAppData();
  }, [currentUser?.role]);

  const handleOpenBooking = (scooter?: Scooter, prefill?: QuickBookingSelection) => {
    setBookingScooter(scooter || null);
    setBookingPrefill(prefill || null);
    setIsBookingOpen(true);
  };

  const handleOpenDetails = (scooter: Scooter) => {
    setDetailsScooter(scooter);
    setIsDetailsOpen(true);
  };

  const handleOpenFeedback = (booking: Booking) => {
    setFeedbackBooking(booking);
    setIsFeedbackOpen(true);
  };

  const handleLogout = async () => {
    await signOutFirebase();
    setCurrentUser(null);
    setCurrentTab('home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F6F8] text-[#0B0C10] pb-20 md:pb-0 font-sans">

      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenBooking={() => handleOpenBooking()}
        onOpenTestingChecklist={() => setIsChecklistOpen(true)}
      />

      <main className="flex-1">
        {currentTab === 'home' && (
          <HomeView
            scooters={scooters}
            onOpenBooking={handleOpenBooking}
            onViewScooterDetails={handleOpenDetails}
            onExploreFleet={() => setCurrentTab('fleet')}
            onOpenEnquiry={() => setIsEnquiryOpen(true)}
          />
        )}

        {currentTab === 'fleet' && (
          <FleetView
            scooters={scooters}
            onBookNow={(s) => handleOpenBooking(s)}
            onViewDetails={handleOpenDetails}
            onRefresh={loadAppData}
          />
        )}

        {currentTab === 'customer_dashboard' && currentUser && (
          <CustomerDashboard
            currentUser={currentUser}
            onOpenBooking={() => handleOpenBooking()}
            onOpenFeedback={handleOpenFeedback}
          />
        )}

        {currentTab === 'admin_dashboard' && (
          <AdminDashboard
            currentUser={currentUser || {
              id: 'usr_admin',
              name: 'Isha (Admin)',
              email: 'isha.0251mba104@dgu.ac.in',
              phone: '+91 98967 61229',
              role: 'admin',
              dlVerificationStatus: 'verified',
              idVerificationStatus: 'verified',
              createdAt: new Date().toISOString()
            }}
            onRefreshData={loadAppData}
          />
        )}
      </main>

      {/* Flagship Obsidian Footer */}
      <footer className="bg-[#0B0C10] text-white border-t border-white/10 pt-14 pb-10 mt-auto print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

            <div className="space-y-3">
              <Logo inverted />
              <p className="text-xs text-neutral-300 font-semibold">
                Your Ride. Your Time. Your Freedom.
              </p>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Affordable hourly scooter rentals for university students in Selaqui and Dehradun, Uttarakhand at ₹60/hour.
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <h4 className="font-bold text-white">Pickup Hubs</h4>
              <ul className="space-y-2 text-neutral-400">
                <li className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#FFCA20] shrink-0 mt-0.5" />
                  <span>Selaqui Hub (Chakrata Rd, Near DGU Gate)</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#FFCA20] shrink-0 mt-0.5" />
                  <span>Dehradun Hub (Rajpur Rd, Clock Tower)</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#FFCA20] shrink-0 mt-0.5" />
                  <span>Bidholi Hub (UPES Campus Gate 1)</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5 text-xs">
              <h4 className="font-bold text-white">Rental Guidelines</h4>
              <ul className="space-y-1.5 text-neutral-400">
                <li>18+ age & valid Driving Licence required</li>
                <li>Complimentary sanitized ISI helmet</li>
                <li>Flat ₹60/hr billing with zero surge</li>
                <li>Masked registration plates on public view</li>
                <li>Return with matching fuel level</li>
              </ul>
            </div>

            <div className="space-y-2.5 text-xs">
              <h4 className="font-bold text-white">Student Support</h4>
              <div className="space-y-1.5 text-neutral-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#FFCA20]" />
                  <span>+91 98967 61229</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#FFCA20]" />
                  <span>support@smoothriderentals.in</span>
                </div>
                <div className="text-[11px] text-neutral-500 pt-1">
                  07:00 AM – 10:00 PM · Monday – Sunday
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => setIsEnquiryOpen(true)}
                  className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#FFCA20]" />
                  <span>WhatsApp Desk</span>
                </button>
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-2">
            <div>
              © 2026 Smooth Ride Rentals · DBS Global University · isha.0251mba104@dgu.ac.in
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setIsChecklistOpen(true)} className="hover:text-white transition-colors">
                QA Checklist
              </button>
              <span aria-hidden="true">·</span>
              <button onClick={() => setCurrentTab('fleet')} className="hover:text-white transition-colors">
                Scooters
              </button>
              <span aria-hidden="true">·</span>
              <button
                onClick={() => {
                  if (currentUser?.role === 'admin') setCurrentTab('admin_dashboard');
                  else setIsAuthOpen(true);
                }}
                className="hover:text-white transition-colors"
              >
                Admin
              </button>
            </div>
          </div>

        </div>
      </footer>

      <BottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onOpenBooking={() => handleOpenBooking()}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        selectedScooter={bookingScooter}
        prefill={bookingPrefill}
        scooters={scooters}
        currentUser={currentUser}
        onBookingSuccess={() => {
          loadAppData();
        }}
        onOpenAuth={() => {
          setIsBookingOpen(false);
          setIsAuthOpen(true);
        }}
      />

      <ScooterDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        scooter={detailsScooter}
        onBookNow={(s) => handleOpenBooking(s)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'admin') {
            setCurrentTab('admin_dashboard');
          } else {
            setCurrentTab('customer_dashboard');
          }
        }}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        booking={feedbackBooking}
        onSubmitted={() => {}}
      />

      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
      />

      <TestingChecklistModal
        isOpen={isChecklistOpen}
        onClose={() => setIsChecklistOpen(false)}
        onTestBooking={() => handleOpenBooking()}
        onTestAdmin={() => {
          api.login('isha.0251mba104@dgu.ac.in', 'admin').then(res => {
            setCurrentUser(res.user);
            setCurrentTab('admin_dashboard');
          });
        }}
        onTestCustomer={() => {
          api.login('rahul.s@student.dgu.ac.in').then(res => {
            setCurrentUser(res.user);
            setCurrentTab('customer_dashboard');
          });
        }}
      />

    </div>
  );
}
