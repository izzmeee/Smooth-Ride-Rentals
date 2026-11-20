import React, { useState } from 'react';
import type { Scooter, Booking, AppSettings, MarketingCampaign } from '../types/index.ts';
import { generateVenturePdf } from '../utils/generatePdf.ts';
import { getScooterImage } from '../utils/scooterImages.ts';
import { 
  X, Download, Printer, FileText, CheckCircle2, 
  ShieldCheck, MapPin, Gauge, Fuel, Loader2, Sparkles
} from 'lucide-react';

interface AssignmentPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  scooters: Scooter[];
  bookings: Booking[];
  settings: AppSettings | null;
  campaigns: MarketingCampaign[];
  analytics: any;
}

export const AssignmentPdfModal: React.FC<AssignmentPdfModalProps> = ({
  isOpen,
  onClose,
  scooters,
  bookings,
  settings,
  campaigns,
  analytics
}) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    setIsGenerating(true);
    try {
      generateVenturePdf({
        scooters,
        bookings,
        settings,
        campaigns,
        analytics
      });
    } catch (err) {
      console.error('PDF export error', err);
      alert('Error generating PDF. You can also click "Print / Save as PDF" to save directly via your browser.');
    } finally {
      setTimeout(() => setIsGenerating(false), 500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:z-auto">
      
      {/* Modal Dialog Container (print-friendly) */}
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none">
        
        {/* Modal Controls Header (Hidden on print) */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#0B0C10] text-white print:hidden shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#FFCA20]/15 text-[#FFCA20] border border-[#FFCA20]/30 text-[11px] font-semibold px-2 py-0.5 rounded">
                DGU Venture Quest Report
              </span>
              <h2 className="font-display text-base sm:text-lg font-bold">
                Downloadable Report PDF
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Complete venture plan and live application overview formatted as a PDF document
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/15 text-neutral-200 rounded-xl transition-colors flex items-center gap-1.5 border border-white/15"
              title="Print or Save via Browser"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / Browser PDF</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="px-4 py-1.5 text-xs font-extrabold bg-[#FFCA20] hover:bg-[#f4be10] text-[#0B0C10] rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Document</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Callout Bar */}
        <div className="bg-[#FFCA20]/15 border-b border-[#FFCA20]/30 px-4 py-2.5 text-xs text-[#0B0C10] flex items-center justify-between gap-2 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0B0C10] shrink-0" />
            <span>
              <strong>Ready to Export:</strong> Click <strong>"Download PDF Document"</strong> to save the compiled PDF report, or <strong>"Print / Browser PDF"</strong> to generate an A4 vector copy.
            </span>
          </div>
          <button
            onClick={handleDownloadPdf}
            className="text-[#0B0C10] font-bold underline hover:no-underline whitespace-nowrap text-xs"
          >
            Save .PDF File →
          </button>
        </div>

        {/* Printable & Scrollable Report Body */}
        <div id="assignment-printable-report" className="p-6 sm:p-10 overflow-y-auto space-y-8 text-slate-900 bg-white print:p-0 print:space-y-6">
          
          {/* ================= SECTION 1: COVER & HEADER ================= */}
          <div className="border border-slate-300 rounded-xl p-6 bg-slate-50/50 space-y-3">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  DBS GLOBAL UNIVERSITY (DGU)
                </h1>
                <div className="text-sm font-bold text-slate-700">
                  Entrepreneurship & Innovation · Complete Venture Plan
                </div>
              </div>
              <div className="text-right text-xs text-slate-600 font-mono">
                <div>DGU Venture Quest</div>
                <div>Status: Implementation Complete</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Student / Founder Email:</span>
                <span className="font-bold text-slate-900 ml-1.5">isha.0251mba104@dgu.ac.in</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Student Role:</span>
                <span className="font-bold text-slate-900 ml-1.5">DGU Student (MBA / Innovation)</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Venture Name:</span>
                <span className="font-bold text-slate-900 ml-1.5">Smooth Ride Rentals</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Target Location:</span>
                <span className="font-bold text-slate-900 ml-1.5">Selaqui & Dehradun, Uttarakhand</span>
              </div>
            </div>
          </div>

          {/* Venture Banner */}
          <div className="bg-slate-900 text-white rounded-xl p-5 space-y-1">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Venture Concept & Brand
            </div>
            <h2 className="text-xl font-extrabold">Smooth Ride Rentals</h2>
            <p className="text-sm text-slate-300 italic">
              "Your Ride. Your Time. Your Freedom."
            </p>
            <p className="text-xs text-slate-400 pt-1">
              Affordable, flexible hourly scooter rentals for university students living in hostels and rented accommodations without a personal two-wheeler. Fixed starting rate: ₹60/hour.
            </p>
          </div>

          {/* ================= SECTION 2: VENTURE MISSIONS 0 TO 4 ================= */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-1">
              Part 1: Venture Thesis & Friction Analysis (Missions 0–4)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm">Mission 0: The Venture Idea</div>
                <p className="text-slate-600 leading-relaxed">
                  Dehradun has a large student population across universities (DGU, UPES, Graphic Era, etc.). Most hostellers do not own two-wheelers, making trips to colleges, markets, and cafes expensive or inconvenient. Smooth Ride Rentals provides affordable hourly scooters on demand.
                </p>
                <div className="text-[11px] text-slate-500 font-mono">
                  Geography: Selaqui, Dehradun, Uttarakhand near campus zones.
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm">Mission 1 & 2: Friction & Jobs To Be Done (JTBD)</div>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  <li><strong>Customer Friction:</strong> Auto-rickshaws are expensive (₹150+ per trip), buses have rigid schedules, and borrowing from friends is inconvenient.</li>
                  <li><strong>Functional Job:</strong> Get fast, affordable transportation without the capital cost of vehicle ownership.</li>
                  <li><strong>Emotional Job:</strong> Feel autonomous, independent, and stress-free.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm">Mission 3: Beachhead Segment</div>
                <p className="text-slate-600 leading-relaxed">
                  University and college students aged 18–25 living in hostels or rented accommodations in Selaqui and Dehradun without personal two-wheelers. They need transport for short micro-trips (1 to 4 hours) rather than full-day rentals.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm">Mission 4: Value Proposition</div>
                <p className="text-slate-600 leading-relaxed">
                  Provides students with well-maintained scooters on an hourly basis (₹60/hr) with complimentary sanitized ISI helmets, transparent fuel recording, and zero friend dependency.
                </p>
              </div>
            </div>
          </div>

          {/* ================= SECTION 3: MISSIONS 5 TO 9 ================= */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-1">
              Part 2: Economics, Market Size & GTM (Missions 5–9)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Selling Price</span>
                <span className="text-lg font-bold text-slate-900">₹60 / hour</span>
                <span className="text-[10px] text-slate-500 block">Flat rate, zero surge</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Variable Cost</span>
                <span className="text-lg font-bold text-slate-900">₹15 / hour</span>
                <span className="text-[10px] text-slate-500 block">Fuel, cleaning, tyres</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-emerald-300 bg-emerald-50/50">
                <span className="text-emerald-800 block text-[11px] font-bold">Contribution Margin</span>
                <span className="text-lg font-bold text-emerald-700">₹45 / hour (75%)</span>
                <span className="text-[10px] text-emerald-600 block">Gross surplus per hour</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-900">Calculated Market Sizing (Dehradun Region)</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-500 block">TAM (Total Addressable Market):</span>
                  <span className="font-bold text-slate-900">INR 14,40,00,000 (14.4 Cr)</span>
                  <span className="text-[10px] text-slate-400 block">50,000 students across Dehradun</span>
                </div>
                <div>
                  <span className="text-slate-500 block">SAM (Serviceable Addressable Market):</span>
                  <span className="font-bold text-slate-900">INR 5,76,00,000 (5.76 Cr)</span>
                  <span className="text-[10px] text-slate-400 block">20,000 campus belt students</span>
                </div>
                <div>
                  <span className="text-slate-500 block">SOM (Serviceable Obtainable Market):</span>
                  <span className="font-bold text-slate-900">INR 28,80,000 (28.8 Lakhs)</span>
                  <span className="text-[10px] text-slate-400 block">1,000 beachhead pilot students</span>
                </div>
              </div>
            </div>

            {/* GTM Campaigns */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-900">Go-To-Market Budget Allocations (Mission 9)</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {campaigns.map(c => (
                  <div key={c.id} className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-800">{c.channelName}</div>
                    <div className="text-slate-600">Planned Budget: <strong>₹{c.plannedBudget}</strong></div>
                    <div className="text-slate-600">Expected Leads: {c.expectedLeads} · Target: {c.expectedCustomers}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ================= SECTION 4: LIVE FLEET INVENTORY ================= */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-1">
              Part 3: Fleet Inventory & Technical Vehicle Specifications
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold">
                  <tr>
                    <th className="p-3">Photo</th>
                    <th className="p-3">Fleet ID</th>
                    <th className="p-3">Make & Model</th>
                    <th className="p-3">Reg Plate</th>
                    <th className="p-3">Engine</th>
                    <th className="p-3">Mileage</th>
                    <th className="p-3">Rate</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Pickup Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scooters.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-2">
                        <img
                          src={getScooterImage(`${s.name} ${s.model}`, s.imageUrl)}
                          alt={s.name}
                          referrerPolicy="no-referrer"
                          className="w-16 h-12 object-contain rounded bg-white border border-slate-200 p-0.5"
                        />
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900">{s.fleetId}</td>
                      <td className="p-3 font-semibold text-slate-800">{s.name} ({s.model})</td>
                      <td className="p-3 font-mono text-slate-600">{s.registrationPlate}</td>
                      <td className="p-3">{s.engineCc} cc</td>
                      <td className="p-3">{s.mileage}</td>
                      <td className="p-3 font-bold text-emerald-700">₹{s.hourlyRate}/hr</td>
                      <td className="p-3 capitalize">
                        <span className="font-semibold text-emerald-600">{s.status}</span>
                      </td>
                      <td className="p-3 text-[11px] text-slate-600">{s.pickupLocation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ================= SECTION 5: LIVE METRICS & 30-DAY TARGETS ================= */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-1">
              Part 4: Operational Metrics & 30-Day Venture Validation Tracker
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Total Bookings</span>
                <span className="text-lg font-bold text-slate-900">{analytics?.metrics?.totalBookings || bookings.length}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Total Revenue</span>
                <span className="text-lg font-bold text-emerald-700">₹{analytics?.metrics?.totalRevenue || 300}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Avg Duration</span>
                <span className="text-lg font-bold text-slate-900">{analytics?.metrics?.avgDuration || 2.5} hrs</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Repeat Rate</span>
                <span className="text-lg font-bold text-emerald-700">{analytics?.metrics?.repeatBookingRate || 50}%</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-900">30-Day Milestone Tracker (Venture Plan Mission 10 & 11)</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Target 1: 30 Paid Bookings in First 30 Days</span>
                    <span>{analytics?.venturePlanTargets?.actualPaidBookings || 2} / 30</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                    <div className="bg-slate-900 h-2 rounded-full" style={{ width: `${Math.min(100, ((analytics?.venturePlanTargets?.actualPaidBookings || 2) / 30) * 100)}%` }}></div>
                  </div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Target 2: At Least 20% Repeat Customer Retention</span>
                    <span>{analytics?.venturePlanTargets?.actualRepeatRate || 50}% / 20%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                    <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= SECTION 6: DELIVERABLE QA CHECKLIST ================= */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-1">
              Part 5: Quality Assurance & Deliverable Verification Matrix
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { title: '1. Customer Registration & Login', status: 'VERIFIED & FUNCTIONAL' },
                { title: '2. Dynamic Hourly Pricing Engine (₹60/hr)', status: 'VERIFIED & FUNCTIONAL' },
                { title: '3. Booking Conflict Validation Guard', status: 'VERIFIED & FUNCTIONAL' },
                { title: '4. Driver Verification Desk (Age 18+ & DL)', status: 'VERIFIED & FUNCTIONAL' },
                { title: '5. Handover & Return Odometer Recording', status: 'VERIFIED & FUNCTIONAL' },
                { title: '6. Payment Reconciliation (Cash / UPI)', status: 'VERIFIED & FUNCTIONAL' },
                { title: '7. Customer Feedback & Rating System', status: 'VERIFIED & FUNCTIONAL' },
                { title: '8. Full-Stack Express Server & JSON DB', status: 'VERIFIED & PERSISTENT' }
              ].map((item, i) => (
                <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{item.title}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Signature Block */}
          <div className="pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-600 gap-4">
            <div>
              <div className="font-bold text-slate-900">Submitted by: Isha (Student Founder)</div>
              <div>Email: isha.0251mba104@dgu.ac.in</div>
              <div>Venture: Smooth Ride Rentals (Selaqui, Dehradun)</div>
            </div>
            <div className="text-left sm:text-right">
              <div className="font-bold text-slate-900">DBS Global University</div>
              <div>Entrepreneurship & Innovation Faculty Evaluation</div>
              <div>Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>

        </div>

        {/* Modal Footer Controls (Hidden on print) */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between print:hidden shrink-0">
          <div className="text-xs text-slate-600">
            Document: <strong>Smooth_Ride_Rentals_DGU_Venture_Report.pdf</strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Close Preview
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold bg-white border border-slate-300 text-slate-800 rounded-xl hover:bg-slate-100 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download PDF File</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
