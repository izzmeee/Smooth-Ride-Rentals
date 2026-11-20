export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  collegeOrHostel?: string;
  dlNumber?: string;
  dlVerificationStatus: 'not_submitted' | 'pending' | 'verified' | 'rejected';
  idVerificationStatus: 'not_submitted' | 'pending' | 'verified' | 'rejected';
  verificationNotes?: string;
  createdAt: string;
}

export interface Scooter {
  id: string;
  name: string;
  model: string;
  brand: string;
  year: number;
  fleetId: string;
  registrationPlate: string; // Restricted on public cards, full on admin
  hourlyRate: number; // ₹60 standard
  status: 'available' | 'booked' | 'maintenance' | 'inactive';
  color: string;
  fuelType: string;
  mileage: string;
  engineCc: number;
  odoReading: number; // in km
  helmetsIncluded: number;
  pickupLocation: string;
  conditionNotes: string;
  features: string[];
  imageUrl?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'rejected' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refund_pending' | 'refunded';
export type PaymentMethod = 'UPI' | 'Cash at Pickup' | 'Net Banking' | 'Card';

export interface Booking {
  id: string; // e.g. SRR-2026-7842
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerCollege?: string;
  scooterId: string;
  scooterName: string;
  scooterFleetId: string;
  pickupDate: string; // YYYY-MM-DD
  pickupTime: string; // HH:mm
  rentalHours: number;
  returnDate: string;
  returnTime: string;
  pickupLocation: string;
  ratePerHour: number; // Snapshot of hourly rate when booked (₹60)
  rentalAmount: number; // rentalHours * ratePerHour
  depositAmount: number; // Configurable deposit
  additionalCharges: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentRef?: string;
  // Handover & Return Details
  handoverOdo?: number;
  handoverFuel?: string;
  handoverHelmetCount?: number;
  handoverNotes?: string;
  handoverAt?: string;
  returnOdo?: number;
  returnFuel?: string;
  returnNotes?: string;
  returnedAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationRecord {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  dlNumber: string;
  collegeIdNumber?: string;
  dlDocUrl?: string;
  collegeIdDocUrl?: string;
  ageEligibilityConfirmed: boolean; // 18+
  status: 'pending' | 'verified' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface CustomerEnquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  college?: string;
  message: string;
  source: 'website_form' | 'whatsapp' | 'instagram' | 'campus_campaign';
  status: 'new' | 'contacted' | 'converted' | 'closed';
  createdAt: string;
}

export interface CustomerFeedback {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  rating: number; // 1 to 5
  satisfactionLevel: 'Very High' | 'High' | 'Average' | 'Low';
  reviewText: string;
  wouldRecommend: boolean;
  createdAt: string;
}

export interface MarketingCampaign {
  id: string;
  channelName: string;
  plannedBudget: number; // INR
  spentBudget: number; // INR
  expectedLeads: number;
  actualLeads: number;
  expectedCustomers: number;
  actualCustomers: number;
  status: 'active' | 'planned' | 'completed';
  notes: string;
}

export interface AppSettings {
  baseHourlyRate: number; // Default 60
  securityDeposit: number; // Configurable deposit (default 0 or 200)
  businessName: string;
  tagline: string;
  contactPhone: string;
  contactEmail: string;
  whatsappNumber: string;
  operatingHours: string;
  hubs: string[];
  termsAndConditions: string;
  thirtyDayTargetPaidBookings: number; // 30
  thirtyDayTargetRepeatRate: number; // 20%
}
