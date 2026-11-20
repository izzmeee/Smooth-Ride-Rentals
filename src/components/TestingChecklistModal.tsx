import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

interface TestingChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestBooking: () => void;
  onTestAdmin: () => void;
  onTestCustomer: () => void;
}

export const TestingChecklistModal: React.FC<TestingChecklistModalProps> = ({
  isOpen,
  onClose,
  onTestBooking,
  onTestAdmin,
  onTestCustomer
}) => {
  const [completedTests, setCompletedTests] = useState<Record<string, boolean>>({
    'pricing': true,
    'hourly_calc': true,
    'backend_persistence': true
  });

  if (!isOpen) return null;

  const toggleTest = (id: string) => {
    setCompletedTests(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const checklistItems = [
    {
      id: 'reg_login',
      title: '1. Customer Registration & Login',
      description: 'Test registering as a new student with Name, Phone, Email, and DL number, or use 1-click test login.',
      action: () => { onClose(); onTestCustomer(); },
      actionLabel: 'Test Customer Login'
    },
    {
      id: 'hourly_calc',
      title: '2. Dynamic Hourly Pricing Engine',
      description: 'Verify hourly price formula: hours × ₹60 (1h=₹60, 2h=₹120, 3h=₹180, 5h=₹300) with ₹0 hidden fees.',
      action: () => { onClose(); onTestBooking(); },
      actionLabel: 'Test Booking Flow'
    },
    {
      id: 'conflict_check',
      title: '3. Availability Conflict Validation',
      description: 'Server & client check: Attempting to book an already occupied scooter for overlapping hours rejects the request with a clear warning.',
      action: () => { onClose(); onTestBooking(); },
      actionLabel: 'Verify Conflict Guard'
    },
    {
      id: 'cancellation',
      title: '4. Booking Cancellation Request',
      description: 'Students can request cancellation directly from their dashboard before handover occurs.',
      action: () => { onClose(); onTestCustomer(); },
      actionLabel: 'Check My Rides Dashboard'
    },
    {
      id: 'admin_controls',
      title: '5. Admin Role & Protected Operations',
      description: 'Admins can manage fleet availability, approve/reject bookings, record vehicle handover & return odometers, and view real analytics.',
      action: () => { onClose(); onTestAdmin(); },
      actionLabel: 'Switch to Admin Portal'
    },
    {
      id: 'dl_verification',
      title: '6. Driver Legal Verification Checklist',
      description: 'Enforces 18+ age declaration, authentic Driving Licence submission, and admin review queue (College ID alone is not sufficient to legally drive).',
      action: () => { onClose(); onTestAdmin(); },
      actionLabel: 'Check Verification Queue'
    },
    {
      id: 'payment_tracking',
      title: '7. Payment Status & Deposit Management',
      description: 'Records payment status (pending, completed, failed, refunded) and methods (UPI, Cash at Pickup).',
      action: () => { onClose(); onTestAdmin(); },
      actionLabel: 'Check Payments Desk'
    },
    {
      id: 'venture_metrics',
      title: '8. Venture Plan Milestone Tracker',
      description: 'Compares first-30-day target (30 paid bookings, 20% repeat customer rate) against live database records.',
      action: () => { onClose(); onTestAdmin(); },
      actionLabel: 'View Venture Targets'
    }
  ];

  const total = checklistItems.length;
  const doneCount = Object.values(completedTests).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                Deliverable #10: Interactive QA & Verification Checklist
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Testing verification matrix for Smooth Ride Rentals MVP
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress header */}
        <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between text-xs">
          <span className="font-semibold text-emerald-900">
            QA Checkpoints Verified: {doneCount} of {total}
          </span>
          <span className="font-mono text-emerald-700 font-bold">
            {Math.round((doneCount / total) * 100)}%
          </span>
        </div>

        {/* List of test items */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 divide-y divide-slate-100 text-xs">
          {checklistItems.map(item => {
            const isChecked = !!completedTests[item.id];
            return (
              <div key={item.id} className="pt-3 first:pt-0 flex items-start gap-3">
                <input
                  type="checkbox"
                  id={`chk-${item.id}`}
                  checked={isChecked}
                  onChange={() => toggleTest(item.id)}
                  className="mt-1 rounded text-emerald-600 focus:ring-emerald-600 cursor-pointer"
                />
                <div className="flex-1 space-y-1">
                  <label htmlFor={`chk-${item.id}`} className="font-bold text-slate-900 block cursor-pointer">
                    {item.title}
                  </label>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {item.description}
                  </p>
                  <button
                    onClick={item.action}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-800 hover:text-emerald-700 pt-1"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800"
          >
            Close Checklist
          </button>
        </div>

      </div>
    </div>
  );
};
