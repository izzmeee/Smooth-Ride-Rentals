import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getDatabase, saveDatabase } from './server/db.ts';
import type { 
  User, 
  Scooter, 
  Booking, 
  VerificationRecord, 
  CustomerEnquiry, 
  CustomerFeedback, 
  MarketingCampaign, 
  AppSettings,
  BookingStatus,
  PaymentStatus
} from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Helper to compute conflict
function hasBookingConflict(
  existingBookings: Booking[],
  scooterId: string,
  pickupDate: string,
  pickupTime: string,
  rentalHours: number,
  excludeBookingId?: string
): boolean {
  const newStart = new Date(`${pickupDate}T${pickupTime}:00`).getTime();
  const newEnd = newStart + rentalHours * 60 * 60 * 1000;

  if (isNaN(newStart)) return false;

  for (const b of existingBookings) {
    if (excludeBookingId && b.id === excludeBookingId) continue;
    if (b.scooterId !== scooterId) continue;
    if (b.status === 'cancelled' || b.status === 'rejected' || b.status === 'completed') continue;

    const existStart = new Date(`${b.pickupDate}T${b.pickupTime}:00`).getTime();
    const existEnd = existStart + b.rentalHours * 60 * 60 * 1000;

    // Standard interval overlap condition
    if (newStart < existEnd && newEnd > existStart) {
      return true;
    }
  }
  return false;
}

// Helper to compute return datetime string
function calculateReturn(pickupDate: string, pickupTime: string, hours: number) {
  const start = new Date(`${pickupDate}T${pickupTime}:00`);
  const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
  const returnDate = end.toISOString().split('T')[0];
  const returnHours = end.getHours().toString().padStart(2, '0');
  const returnMinutes = end.getMinutes().toString().padStart(2, '0');
  return { returnDate, returnTime: `${returnHours}:${returnMinutes}` };
}

// ----------------- AUTH ROUTES -----------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { emailOrPhone, password, role } = req.body;
  const db = getDatabase();

  const user = db.users.find(u => 
    (u.email.toLowerCase() === (emailOrPhone || '').toLowerCase() || u.phone === emailOrPhone)
  );

  if (!user) {
    return res.status(401).json({ error: 'User not found. Please register first.' });
  }

  // If role check is specified
  if (role && user.role !== role) {
    return res.status(403).json({ error: `Account does not have ${role} privileges.` });
  }

  res.json({ user, message: 'Logged in successfully' });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, phone, collegeOrHostel, dlNumber, password } = req.body;
  if (!name || !phone || !email) {
    return res.status(400).json({ error: 'Name, phone, and email are required.' });
  }

  const db = getDatabase();
  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() || u.phone === phone);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email or phone already exists.' });
  }

  const newUser: User & { passwordHash?: string } = {
    id: `usr_${Date.now()}`,
    name,
    email,
    phone,
    role: 'customer',
    collegeOrHostel: collegeOrHostel || '',
    dlNumber: dlNumber || '',
    dlVerificationStatus: dlNumber ? 'pending' : 'not_submitted',
    idVerificationStatus: 'pending',
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDatabase(db);

  res.status(201).json({ user: newUser, message: 'Account created successfully' });
});

app.post('/api/auth/google', (req: Request, res: Response) => {
  const { uid, name, email, photoUrl } = req.body;
  if (!uid || !email) {
    return res.status(400).json({ error: 'Google account UID and email are required.' });
  }

  const db = getDatabase();
  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (existing) {
    existing.name = name ? String(name).trim().slice(0, 120) : existing.name;
    existing.photoUrl = photoUrl ? String(photoUrl).trim().slice(0, 1000) : existing.photoUrl;
    existing.authProvider = 'google';
    saveDatabase(db);
    return res.json({ user: existing, message: 'Signed in with Google successfully' });
  }

  const adminEmails = ['isha.0251mba104@dgu.ac.in', 'isha9896761229@gmail.com'];
  const isFounderAdmin = adminEmails.includes(normalizedEmail);

  const newUser: User = {
    id: `usr_g_${String(uid).slice(0, 24)}`,
    name: name ? String(name).trim().slice(0, 120) : normalizedEmail.split('@')[0],
    email: String(email).trim().slice(0, 254),
    phone: '',
    role: isFounderAdmin ? 'admin' : 'customer',
    collegeOrHostel: 'Selaqui / Dehradun Campus',
    dlNumber: '',
    dlVerificationStatus: isFounderAdmin ? 'verified' : 'not_submitted',
    idVerificationStatus: isFounderAdmin ? 'verified' : 'pending',
    photoUrl: photoUrl ? String(photoUrl).trim().slice(0, 1000) : undefined,
    authProvider: 'google',
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDatabase(db);

  res.status(201).json({ user: newUser, message: 'Google account linked successfully' });
});

// ----------------- SCOOTERS ROUTES -----------------
app.get('/api/scooters', (req: Request, res: Response) => {
  const db = getDatabase();
  const { role, date, time, hours } = req.query;

  // Mask registration plate for non-admins if desired, or show masked format
  let scooters = db.scooters.map(s => {
    if (role !== 'admin') {
      const parts = s.registrationPlate.split(' ');
      const maskedPlate = parts.length >= 4 
        ? `${parts[0]} ${parts[1]} ** ${parts[3] ? parts[3].slice(-2).padStart(parts[3].length, '*') : '****'}`
        : s.registrationPlate.replace(/\d(?=\d{2})/g, '*');
      return {
        ...s,
        registrationPlate: maskedPlate
      };
    }
    return s;
  });

  // If date & time query provided, mark dynamic availability based on existing bookings
  if (date && time && hours) {
    const rentalHours = parseFloat(hours as string);
    scooters = scooters.map(scooter => {
      const isBooked = hasBookingConflict(db.bookings, scooter.id, date as string, time as string, rentalHours);
      if (isBooked && scooter.status === 'available') {
        return { ...scooter, status: 'booked' };
      }
      return scooter;
    });
  }

  res.json({ scooters });
});

app.post('/api/scooters', (req: Request, res: Response) => {
  const db = getDatabase();
  const {
    name, model, brand, year, fleetId, registrationPlate,
    hourlyRate, status, color, fuelType, mileage, engineCc,
    odoReading, helmetsIncluded, pickupLocation, conditionNotes, features
  } = req.body;

  if (!name || !model || !fleetId || !registrationPlate) {
    return res.status(400).json({ error: 'Scooter name, model, fleet ID, and registration are required.' });
  }

  const newScooter: Scooter = {
    id: `sct_${Date.now()}`,
    name,
    model,
    brand: brand || 'Hero',
    year: Number(year) || 2024,
    fleetId,
    registrationPlate,
    hourlyRate: Number(hourlyRate) || db.settings.baseHourlyRate || 60,
    status: status || 'available',
    color: color || 'Matte Grey',
    fuelType: fuelType || 'Petrol',
    mileage: mileage || '50 km/l',
    engineCc: Number(engineCc) || 125,
    odoReading: Number(odoReading) || 1000,
    helmetsIncluded: Number(helmetsIncluded) || 1,
    pickupLocation: pickupLocation || db.settings.hubs[0],
    conditionNotes: conditionNotes || 'Recently inspected',
    features: Array.isArray(features) ? features : ['Electric Start', 'Spacious Boot']
  };

  db.scooters.push(newScooter);
  saveDatabase(db);
  res.status(201).json({ scooter: newScooter });
});

app.put('/api/scooters/:id', (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  const index = db.scooters.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Scooter not found' });
  }

  db.scooters[index] = { ...db.scooters[index], ...req.body, id };
  saveDatabase(db);
  res.json({ scooter: db.scooters[index] });
});

app.delete('/api/scooters/:id', (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  const index = db.scooters.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Scooter not found' });
  }

  // Soft deactivate rather than hard delete to preserve historical integrity
  db.scooters[index].status = 'inactive';
  saveDatabase(db);
  res.json({ message: 'Scooter deactivated successfully', scooter: db.scooters[index] });
});

// Check availability for a specific scooter and timeframe
app.post('/api/scooters/:id/check-availability', (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  const { pickupDate, pickupTime, rentalHours, excludeBookingId } = req.body;

  const scooter = db.scooters.find(s => s.id === id);
  if (!scooter) {
    return res.status(404).json({ error: 'Scooter not found' });
  }

  if (scooter.status === 'maintenance' || scooter.status === 'inactive') {
    return res.json({ 
      available: false, 
      reason: `This scooter is currently ${scooter.status === 'maintenance' ? 'under routine maintenance' : 'inactive'}.` 
    });
  }

  const conflict = hasBookingConflict(db.bookings, id, pickupDate, pickupTime, Number(rentalHours), excludeBookingId);
  res.json({
    available: !conflict,
    scooterName: scooter.name,
    reason: conflict ? 'Scooter is already booked during this time window. Please pick another time or scooter.' : 'Available for your requested duration.'
  });
});

// ----------------- BOOKINGS ROUTES -----------------
app.get('/api/bookings', (req: Request, res: Response) => {
  const db = getDatabase();
  const { customerId, status } = req.query;

  let bookings = [...db.bookings];
  if (customerId) {
    bookings = bookings.filter(b => b.customerId === customerId);
  }
  if (status) {
    bookings = bookings.filter(b => b.status === status);
  }

  // Sort newest first
  bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ bookings });
});

app.get('/api/bookings/:id', (req: Request, res: Response) => {
  const db = getDatabase();
  const booking = db.bookings.find(b => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  res.json({ booking });
});

app.post('/api/bookings', (req: Request, res: Response) => {
  const db = getDatabase();
  const {
    customerId,
    customerName,
    customerPhone,
    customerEmail,
    customerCollege,
    scooterId,
    pickupDate,
    pickupTime,
    rentalHours,
    pickupLocation
  } = req.body;

  if (!customerId || !scooterId || !pickupDate || !pickupTime || !rentalHours) {
    return res.status(400).json({ error: 'Missing required booking parameters.' });
  }

  const scooter = db.scooters.find(s => s.id === scooterId);
  if (!scooter) {
    return res.status(404).json({ error: 'Selected scooter does not exist.' });
  }

  if (scooter.status === 'maintenance' || scooter.status === 'inactive') {
    return res.status(400).json({ error: 'Selected scooter is currently unavailable.' });
  }

  const hours = parseFloat(rentalHours);
  if (hours <= 0 || hours > 72) {
    return res.status(400).json({ error: 'Rental duration must be between 1 and 72 hours.' });
  }

  // Double booking validation
  const conflict = hasBookingConflict(db.bookings, scooterId, pickupDate, pickupTime, hours);
  if (conflict) {
    return res.status(409).json({ 
      error: 'This scooter is already booked for the selected date and time window. Please select another slot or scooter.' 
    });
  }

  const { returnDate, returnTime } = calculateReturn(pickupDate, pickupTime, hours);
  const ratePerHour = scooter.hourlyRate || db.settings.baseHourlyRate || 60;
  const rentalAmount = hours * ratePerHour;
  const depositAmount = db.settings.securityDeposit || 0;
  const totalAmount = rentalAmount + depositAmount;

  // Generate unique booking code
  const bookingRef = `SRR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newBooking: Booking = {
    id: bookingRef,
    customerId,
    customerName: customerName || 'Student Renter',
    customerPhone: customerPhone || '',
    customerEmail: customerEmail || '',
    customerCollege: customerCollege || '',
    scooterId,
    scooterName: scooter.name,
    scooterFleetId: scooter.fleetId,
    pickupDate,
    pickupTime,
    rentalHours: hours,
    returnDate,
    returnTime,
    pickupLocation: pickupLocation || scooter.pickupLocation,
    ratePerHour,
    rentalAmount,
    depositAmount,
    additionalCharges: 0,
    totalAmount,
    status: 'pending', // Requires admin approval initially
    paymentStatus: 'pending',
    paymentMethod: 'Cash at Pickup',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.bookings.push(newBooking);
  saveDatabase(db);

  res.status(201).json({
    booking: newBooking,
    message: 'Booking request submitted successfully! Pending operator review.'
  });
});

// Update booking status (confirm, reject, cancel)
app.put('/api/bookings/:id/status', (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  const { status, reason } = req.body;

  const bookingIndex = db.bookings.findIndex(b => b.id === id);
  if (bookingIndex === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const booking = db.bookings[bookingIndex];

  // If confirming, ensure no conflict has developed
  if (status === 'confirmed') {
    const conflict = hasBookingConflict(
      db.bookings,
      booking.scooterId,
      booking.pickupDate,
      booking.pickupTime,
      booking.rentalHours,
      booking.id
    );
    if (conflict) {
      return res.status(409).json({ error: 'Cannot confirm: Another booking conflicts with this time window.' });
    }
  }

  db.bookings[bookingIndex] = {
    ...booking,
    status: status as BookingStatus,
    cancellationReason: reason || booking.cancellationReason,
    updatedAt: new Date().toISOString()
  };

  saveDatabase(db);
  res.json({ booking: db.bookings[bookingIndex] });
});

// Record Handover (admin)
app.post('/api/bookings/:id/handover', (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  const { odo, fuel, helmets, notes } = req.body;

  const bookingIndex = db.bookings.findIndex(b => b.id === id);
  if (bookingIndex === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const booking = db.bookings[bookingIndex];
  db.bookings[bookingIndex] = {
    ...booking,
    status: 'active',
    handoverOdo: Number(odo) || 0,
    handoverFuel: fuel || 'Full',
    handoverHelmetCount: Number(helmets) || 1,
    handoverNotes: notes || '',
    handoverAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Update scooter odo and status
  const scooterIndex = db.scooters.findIndex(s => s.id === booking.scooterId);
  if (scooterIndex !== -1) {
    db.scooters[scooterIndex].status = 'booked';
    if (odo) db.scooters[scooterIndex].odoReading = Number(odo);
  }

  saveDatabase(db);
  res.json({ booking: db.bookings[bookingIndex], message: 'Vehicle handover recorded successfully' });
});

// Record Return (admin)
app.post('/api/bookings/:id/return', (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  const { odo, fuel, notes, additionalCharges, depositRefunded } = req.body;

  const bookingIndex = db.bookings.findIndex(b => b.id === id);
  if (bookingIndex === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const booking = db.bookings[bookingIndex];
  const extras = Number(additionalCharges) || 0;

  db.bookings[bookingIndex] = {
    ...booking,
    status: 'completed',
    returnOdo: Number(odo) || 0,
    returnFuel: fuel || 'Full',
    returnNotes: notes || '',
    returnedAt: new Date().toISOString(),
    additionalCharges: extras,
    totalAmount: booking.rentalAmount + booking.depositAmount + extras,
    paymentStatus: booking.paymentStatus === 'pending' ? 'completed' : booking.paymentStatus,
    updatedAt: new Date().toISOString()
  };

  // Release scooter back to available
  const scooterIndex = db.scooters.findIndex(s => s.id === booking.scooterId);
  if (scooterIndex !== -1) {
    db.scooters[scooterIndex].status = 'available';
    if (odo) db.scooters[scooterIndex].odoReading = Number(odo);
  }

  saveDatabase(db);
  res.json({ booking: db.bookings[bookingIndex], message: 'Vehicle return recorded successfully' });
});

// Record Payment Status
app.post('/api/bookings/:id/payment', (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  const { paymentStatus, paymentMethod, paymentRef } = req.body;

  const bookingIndex = db.bookings.findIndex(b => b.id === id);
  if (bookingIndex === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  db.bookings[bookingIndex] = {
    ...db.bookings[bookingIndex],
    paymentStatus: paymentStatus as PaymentStatus,
    paymentMethod: paymentMethod || db.bookings[bookingIndex].paymentMethod,
    paymentRef: paymentRef || db.bookings[bookingIndex].paymentRef,
    updatedAt: new Date().toISOString()
  };

  saveDatabase(db);
  res.json({ booking: db.bookings[bookingIndex], message: 'Payment status updated' });
});

// ----------------- VERIFICATIONS ROUTES -----------------
app.get('/api/verifications', (req: Request, res: Response) => {
  const db = getDatabase();
  res.json({ verifications: db.verifications, users: db.users });
});

app.post('/api/verifications', (req: Request, res: Response) => {
  const db = getDatabase();
  const { userId, dlNumber, collegeIdNumber, ageConfirmed } = req.body;

  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const newRecord: VerificationRecord = {
    id: `ver_${Date.now()}`,
    userId,
    userName: user.name,
    userPhone: user.phone,
    dlNumber,
    collegeIdNumber,
    ageEligibilityConfirmed: Boolean(ageConfirmed),
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  db.verifications.push(newRecord);
  user.dlNumber = dlNumber;
  user.dlVerificationStatus = 'pending';
  saveDatabase(db);

  res.status(201).json({ verification: newRecord, message: 'Documents submitted for admin verification' });
});

app.put('/api/verifications/:id', (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  const { status, notes, reviewedBy } = req.body;

  const index = db.verifications.findIndex(v => v.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Verification record not found' });
  }

  db.verifications[index] = {
    ...db.verifications[index],
    status,
    notes,
    reviewedBy: reviewedBy || 'Admin Operator',
    reviewedAt: new Date().toISOString()
  };

  // Update user record status
  const user = db.users.find(u => u.id === db.verifications[index].userId);
  if (user) {
    user.dlVerificationStatus = status;
    user.verificationNotes = notes;
  }

  saveDatabase(db);
  res.json({ verification: db.verifications[index] });
});

// ----------------- MARKETING & ENQUIRIES -----------------
app.get('/api/campaigns', (_req: Request, res: Response) => {
  const db = getDatabase();
  res.json({ campaigns: db.campaigns });
});

app.put('/api/campaigns/:id', (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  const index = db.campaigns.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Campaign not found' });
  }

  db.campaigns[index] = { ...db.campaigns[index], ...req.body };
  saveDatabase(db);
  res.json({ campaign: db.campaigns[index] });
});

app.get('/api/enquiries', (_req: Request, res: Response) => {
  const db = getDatabase();
  res.json({ enquiries: db.enquiries });
});

app.post('/api/enquiries', (req: Request, res: Response) => {
  const db = getDatabase();
  const { name, phone, email, college, message, source } = req.body;

  const newEnquiry: CustomerEnquiry = {
    id: `enq_${Date.now()}`,
    name: name || 'Student Visitor',
    phone: phone || '',
    email,
    college,
    message: message || 'Interested in renting a scooter at ₹60/hr.',
    source: source || 'website_form',
    status: 'new',
    createdAt: new Date().toISOString()
  };

  db.enquiries.push(newEnquiry);
  saveDatabase(db);
  res.status(201).json({ enquiry: newEnquiry, message: 'Enquiry received. Our team will contact you shortly!' });
});

// ----------------- FEEDBACK -----------------
app.get('/api/feedback', (_req: Request, res: Response) => {
  const db = getDatabase();
  res.json({ feedback: db.feedback });
});

app.post('/api/feedback', (req: Request, res: Response) => {
  const db = getDatabase();
  const { bookingId, customerId, customerName, rating, satisfactionLevel, reviewText, wouldRecommend } = req.body;

  const newFb: CustomerFeedback = {
    id: `fb_${Date.now()}`,
    bookingId: bookingId || 'N/A',
    customerId: customerId || 'guest',
    customerName: customerName || 'Student',
    rating: Number(rating) || 5,
    satisfactionLevel: satisfactionLevel || 'Very High',
    reviewText: reviewText || '',
    wouldRecommend: Boolean(wouldRecommend),
    createdAt: new Date().toISOString()
  };

  db.feedback.push(newFb);
  saveDatabase(db);
  res.status(201).json({ feedback: newFb, message: 'Thank you for your valuable feedback!' });
});

// ----------------- SETTINGS & ANALYTICS -----------------
app.get('/api/settings', (_req: Request, res: Response) => {
  const db = getDatabase();
  res.json({ settings: db.settings });
});

app.put('/api/settings', (req: Request, res: Response) => {
  const db = getDatabase();
  db.settings = { ...db.settings, ...req.body };
  saveDatabase(db);
  res.json({ settings: db.settings, message: 'Settings saved successfully' });
});

app.get('/api/analytics', (_req: Request, res: Response) => {
  const db = getDatabase();

  const totalBookings = db.bookings.length;
  const completedBookings = db.bookings.filter(b => b.status === 'completed');
  const paidBookings = db.bookings.filter(b => b.paymentStatus === 'completed');
  const pendingRequests = db.bookings.filter(b => b.status === 'pending');
  const confirmedBookings = db.bookings.filter(b => b.status === 'confirmed');

  const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.rentalAmount || 0), 0);

  // Month revenue (current month)
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthRevenue = paidBookings
    .filter(b => b.createdAt.startsWith(currentMonth))
    .reduce((sum, b) => sum + (b.rentalAmount || 0), 0);

  // Calculate repeat booking rate
  const customerBookingCounts: Record<string, number> = {};
  db.bookings.forEach(b => {
    customerBookingCounts[b.customerId] = (customerBookingCounts[b.customerId] || 0) + 1;
  });

  const uniqueCustomers = Object.keys(customerBookingCounts).length;
  const repeatCustomers = Object.values(customerBookingCounts).filter(count => count > 1).length;
  const repeatBookingRate = uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0;

  // Average duration
  const totalHours = db.bookings.reduce((sum, b) => sum + (b.rentalHours || 0), 0);
  const avgDuration = totalBookings > 0 ? (totalHours / totalBookings) : 0;

  // Fleet stats
  const totalScooters = db.scooters.length;
  const availableScooters = db.scooters.filter(s => s.status === 'available').length;
  const maintenanceScooters = db.scooters.filter(s => s.status === 'maintenance').length;
  const bookedScooters = db.scooters.filter(s => s.status === 'booked').length;

  res.json({
    metrics: {
      totalRegisteredCustomers: db.users.filter(u => u.role === 'customer').length,
      totalScooters,
      availableScooters,
      maintenanceScooters,
      bookedScooters,
      totalBookings,
      pendingRequests: pendingRequests.length,
      confirmedBookings: confirmedBookings.length,
      completedBookings: completedBookings.length,
      paidBookingsCount: paidBookings.length,
      totalRevenue,
      monthRevenue,
      avgDuration: Number(avgDuration.toFixed(1)),
      repeatBookingRate: Number(repeatBookingRate.toFixed(1)),
      uniqueCustomers
    },
    venturePlanTargets: {
      target30DayPaidBookings: db.settings.thirtyDayTargetPaidBookings || 30,
      actualPaidBookings: paidBookings.length,
      paidBookingsProgressPct: Math.min(100, Math.round((paidBookings.length / (db.settings.thirtyDayTargetPaidBookings || 30)) * 100)),
      targetRepeatCustomerRate: db.settings.thirtyDayTargetRepeatRate || 20,
      actualRepeatRate: Number(repeatBookingRate.toFixed(1))
    }
  });
});

// Vite middleware integration
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smooth Ride Rentals server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
