# Smooth Ride Rentals 🛵

**"Your Ride. Your Time. Your Freedom."**

A modern, mobile-first scooter rental application designed for university and college students in Selaqui and Dehradun, Uttarakhand, India. Built from the venture plan (DGU Venture Quest, DBS Global University).

---

## 🌟 Key Features

1. **Brand Identity & Student Pricing Engine**:
   - Deep navy blue, white, and fresh emerald green aesthetic.
   - Proposed pricing model: **₹60 per hour** flat rate with dynamic calculation:
     - 1 hour = ₹60
     - 2 hours = ₹120
     - 3 hours = ₹180
     - 5 hours = ₹300
   - Zero hidden fees or simulated charges.

2. **Customer Experience**:
   - Multi-step hourly booking flow with live scooter availability.
   - Real-time double-booking conflict prevention across date & time windows.
   - Registration and verification checklist (Age 18+ declaration, Driving Licence number, Student ID).
   - Customer Dashboard with ride status tracking (Pending Review, Confirmed, In Progress, Completed, Cancelled).
   - Ride cancellation requests before handover.
   - Post-ride student feedback and satisfaction ratings.

3. **Admin Operations Command Center**:
   - Protected dashboard with 1-click test login for evaluator convenience.
   - **Fleet Roster**: Add, edit, and toggle maintenance status of scooters (Honda Activa 6G, TVS Jupiter 125, Suzuki Access 125, Hero Destini 125).
   - **Handover Recorder**: Log pickup odometer reading, fuel level (Full / 3/4 / Half), helmet count, and inspection notes.
   - **Return Recorder**: Log return odometer reading, fuel verification, additional charges, and close trip.
   - **Driver Verification Queue**: Review submitted Driving Licences and approve or reject with audit notes.
   - **Payment Reconciliation**: Record payment status (pending, completed, failed, refunded) and method (UPI, Cash at Pickup, Card).
   - **Marketing & GTM Campaign Tracker**: Venture plan budget tracking (Instagram: ₹3,000, Campus: ₹2,000, Referrals: ₹1,000).
   - **Milestone Validation Tracker**: Real-time progress against the 30-day target (30 paid bookings, 20% repeat customer rate).

4. **Legal Compliance & Safety**:
   - Enforces physical Driving Licence inspection at pickup (College ID alone is not legally sufficient to drive).
   - Complimentary sanitized ISI-certified helmets included with every ride.
   - Masked registration plates (e.g. `UK 07 ** ****`) on public catalog cards for privacy.

---

## 🚀 Running the Application

```bash
# Install dependencies
npm install

# Start development server (Full-stack Express + Vite on port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 🔑 Test Credentials (Included in 1-Click Demo Login)

- **Student Customer Account**:
  - Email: `rahul.s@student.dgu.ac.in`
  - Mobile: `+91 98765 43210`
  - Name: Rahul Sharma (DGU Boys Hostel, Selaqui)
- **Admin / Fleet Operations Desk**:
  - Email: `isha.0251mba104@dgu.ac.in`
  - Name: Isha (Fleet Operations Admin)
  - Privileges: Full access to Admin Command Center

---

## 📋 External Services Status

- **Database**: Fully persistent local JSON database (`data/db.json`), requiring zero external cloud database setup or billing.
- **Payment Processing**: Currently supports manual cash and UPI recording (GPay, PhonePe, Paytm). For automated online payment processing, a **Razorpay** or **Cashfree** merchant account credentials can be added to `.env`.
- **SMS / WhatsApp**: WhatsApp links use the universal `wa.me` protocol requiring no API keys.
