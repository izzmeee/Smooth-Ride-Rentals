import type { 
  User, 
  Scooter, 
  Booking, 
  VerificationRecord, 
  CustomerEnquiry, 
  CustomerFeedback, 
  MarketingCampaign, 
  AppSettings 
} from '../types/index.ts';

const API_BASE = '/api';

export const api = {
  // Auth
  async login(emailOrPhone: string, role?: string): Promise<{ user: User; message: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrPhone, role })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async register(data: { name: string; email: string; phone: string; collegeOrHostel?: string; dlNumber?: string }): Promise<{ user: User; message: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async googleAuth(data: { uid: string; name: string; email: string; photoUrl?: string }): Promise<{ user: User; message: string }> {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Google sign-in sync failed');
    }
    return res.json();
  },

  // Scooters
  async getScooters(params?: { date?: string; time?: string; hours?: number; role?: string }): Promise<{ scooters: Scooter[] }> {
    const query = new URLSearchParams();
    if (params?.date) query.set('date', params.date);
    if (params?.time) query.set('time', params.time);
    if (params?.hours) query.set('hours', params.hours.toString());
    if (params?.role) query.set('role', params.role);
    
    const url = `${API_BASE}/scooters${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch scooters');
    return res.json();
  },

  async checkAvailability(id: string, pickupDate: string, pickupTime: string, rentalHours: number): Promise<{ available: boolean; scooterName: string; reason: string }> {
    const res = await fetch(`${API_BASE}/scooters/${id}/check-availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pickupDate, pickupTime, rentalHours })
    });
    if (!res.ok) throw new Error('Failed to check availability');
    return res.json();
  },

  async createScooter(data: Partial<Scooter>): Promise<{ scooter: Scooter }> {
    const res = await fetch(`${API_BASE}/scooters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to add scooter');
    }
    return res.json();
  },

  async updateScooter(id: string, data: Partial<Scooter>): Promise<{ scooter: Scooter }> {
    const res = await fetch(`${API_BASE}/scooters/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update scooter');
    }
    return res.json();
  },

  async deleteScooter(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/scooters/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to deactivate scooter');
    return res.json();
  },

  // Bookings
  async getBookings(params?: { customerId?: string; status?: string }): Promise<{ bookings: Booking[] }> {
    const query = new URLSearchParams();
    if (params?.customerId) query.set('customerId', params.customerId);
    if (params?.status) query.set('status', params.status);

    const url = `${API_BASE}/bookings${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return res.json();
  },

  async createBooking(bookingData: {
    customerId: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    customerCollege?: string;
    scooterId: string;
    pickupDate: string;
    pickupTime: string;
    rentalHours: number;
    pickupLocation?: string;
  }): Promise<{ booking: Booking; message: string }> {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit booking');
    }
    return res.json();
  },

  async updateBookingStatus(id: string, status: string, reason?: string): Promise<{ booking: Booking }> {
    const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reason })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update booking status');
    }
    return res.json();
  },

  async recordHandover(id: string, data: { odo: number; fuel: string; helmets: number; notes?: string }): Promise<{ booking: Booking; message: string }> {
    const res = await fetch(`${API_BASE}/bookings/${id}/handover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to record vehicle handover');
    return res.json();
  },

  async recordReturn(id: string, data: { odo: number; fuel: string; notes?: string; additionalCharges?: number }): Promise<{ booking: Booking; message: string }> {
    const res = await fetch(`${API_BASE}/bookings/${id}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to record vehicle return');
    return res.json();
  },

  async recordPayment(id: string, data: { paymentStatus: string; paymentMethod?: string; paymentRef?: string }): Promise<{ booking: Booking; message: string }> {
    const res = await fetch(`${API_BASE}/bookings/${id}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update payment status');
    return res.json();
  },

  // Verifications
  async getVerifications(): Promise<{ verifications: VerificationRecord[]; users: User[] }> {
    const res = await fetch(`${API_BASE}/verifications`);
    if (!res.ok) throw new Error('Failed to fetch verification records');
    return res.json();
  },

  async submitVerification(data: { userId: string; dlNumber: string; collegeIdNumber?: string; ageConfirmed: boolean }): Promise<{ verification: VerificationRecord; message: string }> {
    const res = await fetch(`${API_BASE}/verifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to submit verification');
    return res.json();
  },

  async reviewVerification(id: string, data: { status: string; notes?: string; reviewedBy?: string }): Promise<{ verification: VerificationRecord }> {
    const res = await fetch(`${API_BASE}/verifications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update verification');
    return res.json();
  },

  // Campaigns & Enquiries
  async getCampaigns(): Promise<{ campaigns: MarketingCampaign[] }> {
    const res = await fetch(`${API_BASE}/campaigns`);
    if (!res.ok) throw new Error('Failed to fetch campaigns');
    return res.json();
  },

  async updateCampaign(id: string, data: Partial<MarketingCampaign>): Promise<{ campaign: MarketingCampaign }> {
    const res = await fetch(`${API_BASE}/campaigns/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update campaign');
    return res.json();
  },

  async getEnquiries(): Promise<{ enquiries: CustomerEnquiry[] }> {
    const res = await fetch(`${API_BASE}/enquiries`);
    if (!res.ok) throw new Error('Failed to fetch enquiries');
    return res.json();
  },

  async submitEnquiry(data: Partial<CustomerEnquiry>): Promise<{ enquiry: CustomerEnquiry; message: string }> {
    const res = await fetch(`${API_BASE}/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to submit enquiry');
    return res.json();
  },

  // Feedback
  async getFeedback(): Promise<{ feedback: CustomerFeedback[] }> {
    const res = await fetch(`${API_BASE}/feedback`);
    if (!res.ok) throw new Error('Failed to fetch feedback');
    return res.json();
  },

  async submitFeedback(data: Partial<CustomerFeedback>): Promise<{ feedback: CustomerFeedback; message: string }> {
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to submit feedback');
    return res.json();
  },

  // Settings & Analytics
  async getSettings(): Promise<{ settings: AppSettings }> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(data: Partial<AppSettings>): Promise<{ settings: AppSettings; message: string }> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  async getAnalytics(): Promise<{
    metrics: {
      totalRegisteredCustomers: number;
      totalScooters: number;
      availableScooters: number;
      maintenanceScooters: number;
      bookedScooters: number;
      totalBookings: number;
      pendingRequests: number;
      confirmedBookings: number;
      completedBookings: number;
      paidBookingsCount: number;
      totalRevenue: number;
      monthRevenue: number;
      avgDuration: number;
      repeatBookingRate: number;
      uniqueCustomers: number;
    };
    venturePlanTargets: {
      target30DayPaidBookings: number;
      actualPaidBookings: number;
      paidBookingsProgressPct: number;
      targetRepeatCustomerRate: number;
      actualRepeatRate: number;
    };
  }> {
    const res = await fetch(`${API_BASE}/analytics`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  }
};
