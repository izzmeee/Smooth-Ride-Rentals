import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { X, MessageSquare, Phone, Send, CheckCircle2, Loader2 } from 'lucide-react';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [college, setCollege] = useState<string>('');
  const [message, setMessage] = useState<string>('Hi, I need a scooter this weekend for 4 hours in Selaqui.');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSent, setIsSent] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSendForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.submitEnquiry({
        name,
        phone,
        college,
        message,
        source: 'website_form'
      });
      setIsSent(true);
      setTimeout(() => {
        setIsSent(false);
        onClose();
      }, 1800);
    } catch (err: any) {
      alert(err.message || 'Failed to submit enquiry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent(`Hi Smooth Ride Rentals! I am interested in renting a scooter at ₹60/hr in Dehradun/Selaqui.`);
    window.open(`https://wa.me/919896761229?text=${text}`, '_blank');
    api.submitEnquiry({
      name: 'WhatsApp Visitor',
      phone: '+91 98967 61229',
      message: 'Clicked direct WhatsApp enquiry button',
      source: 'whatsapp'
    }).catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-5 space-y-4">
        
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Contact Smooth Ride Rentals</h3>
            <p className="text-[11px] text-slate-500">Selaqui & Dehradun Student Support Desk</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WhatsApp Fast Button */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
          <div className="text-xs text-emerald-950 font-medium">
            Need an instant response? Chat directly with our fleet manager on WhatsApp:
          </div>
          <button
            type="button"
            onClick={openWhatsApp}
            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Open WhatsApp Chat (+91 98967 61229)</span>
          </button>
        </div>

        {isSent ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">Enquiry Received!</h4>
            <p className="text-xs text-slate-500">We will call/message you shortly with vehicle details.</p>
          </div>
        ) : (
          <form onSubmit={handleSendForm} className="space-y-3 text-xs pt-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase">
              Or Leave a Message with the Desk:
            </div>

            <div>
              <label className="block font-medium mb-1">Your Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-medium mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">College / Campus</label>
                <input
                  type="text"
                  placeholder="e.g. DGU / UPES / Graphic Era"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">Questions / Rental Requirement *</label>
              <textarea
                required
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name || !phone}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Submit Enquiry</span>}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
