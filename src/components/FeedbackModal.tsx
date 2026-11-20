import React, { useState } from 'react';
import type { Booking } from '../types/index.ts';
import { api } from '../services/api.ts';
import { X, Star, ThumbsUp, CheckCircle2, Loader2 } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onSubmitted: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSubmitted
}) => {
  const [rating, setRating] = useState<number>(5);
  const [satisfaction, setSatisfaction] = useState<'Very High' | 'High' | 'Average' | 'Low'>('Very High');
  const [reviewText, setReviewText] = useState<string>('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.submitFeedback({
        bookingId: booking.id,
        customerId: booking.customerId,
        customerName: booking.customerName,
        rating,
        satisfactionLevel: satisfaction,
        reviewText,
        wouldRecommend
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onSubmitted();
        onClose();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Feedback submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-5 space-y-4">
        
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Rate Your Scooter Ride</h3>
            <p className="text-[11px] text-slate-500">Trip Ref: {booking.id} · {booking.scooterName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">Thank You for Your Feedback!</h4>
            <p className="text-xs text-slate-500">Your review helps improve our student fleet service.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Star Rating */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 text-center">
                Overall Experience Rating
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setRating(star);
                      if (star >= 5) setSatisfaction('Very High');
                      else if (star === 4) setSatisfaction('High');
                      else if (star === 3) setSatisfaction('Average');
                      else setSatisfaction('Low');
                    }}
                    className="p-1 hover:scale-110 transition-transform focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-100 text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tell us about your ride experience
              </label>
              <textarea
                required
                rows={3}
                placeholder="How was the scooter pickup, condition, and ride around Dehradun?"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={wouldRecommend}
                  onChange={(e) => setWouldRecommend(e.target.checked)}
                  className="rounded text-slate-900 focus:ring-slate-900"
                />
                <span>Would you recommend Smooth Ride Rentals to other students?</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !reviewText.trim()}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Submit Feedback</span>}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
