# BELL FIX & SOLUTIONS – Premium Home Services Platform

A high-performance, editorial-grade home services and appliance repair website built with Next.js App Router, TypeScript, Tailwind CSS, Supabase, Cloudinary, and Lucide React. Designed strictly following the visual hierarchy and layout of the brand reference image.

---

## 🎨 Design System & Visual Palette

- **Primary Black**: `#101820`
- **Deep Navy**: `#102A43`
- **Electric Cyan**: `#00C8E8`
- **White**: `#FFFFFF`
- **Light Background**: `#F5F8FA`
- **Text Secondary**: `#667085`

> **Design Restrictions Followed:**
> - Zero borders around cards, sections, or containers (`border: none`).
> - No unnecessary outlines, dividers, or excessive rounded corners.
> - Compact, readable typography (15px base size).
> - Flat, clean surfaces with high-contrast photographic imagery.

---

## 🚀 Key Features

### 1. Public Experience
- **Sticky Navigation**: Brand logo, quick phone link, navigation links, and "Book Service" CTA.
- **Hero Slider**: Dynamic database-managed hero banners with autoplay, slide transitions, previous/next controls, dot indicators, and dark gradient overlays.
- **Trust Highlights Bar**: 4 core trust pillars directly below the hero (Expert Technicians, Quick Service, Quality Assurance, At Your Doorstep).
- **Our Services Grid**: Displays the exact 8 services:
  1. Air Conditioner
  2. Washing Machine
  3. Refrigerator
  4. Freezer
  5. CCTV
  6. Deep Cleaning
  7. Interlock Cleaning
  8. Water Tank Cleaning
- **Dedicated Dynamic Detail Pages (`/services/[slug]`)**: Main photography, full service overview, key benefits checklist, gallery in action, direct Call Now CTA, WhatsApp Booking CTA, and an embedded appointment form.
- **About Bell Fix & Solutions Section**: Editorial layout with certified technician photography, company mission, and core values.
- **Why Choose Us**: 4-column feature section on Deep Navy (`#102A43`).
- **How It Works**: 4-step process (Book a Service → We Confirm → Get It Done → You're All Set).
- **Customer Testimonials**: 5-star review cards (automatically hidden if no active reviews exist).
- **Final CTA Banner**: High-contrast contact banner with direct telephone dialing and prefilled WhatsApp chat buttons.
- **Persistent Floating WhatsApp Button**: Bottom-right floating button available on every page.
- **Comprehensive Footer**: Full navigation, active services, contact numbers, email, physical address, and copyright.

### 2. Booking & WhatsApp Redirection Flow
1. Customer enters Name, Phone, Service, Location, Preferred Date, and Message.
2. Form validates all fields client-side and server-side.
3. Record is saved to the database (`/api/bookings`) with initial status `new`.
4. Form automatically generates a formatted WhatsApp enquiry:
   ```text
   Hello Bell Fix & Solutions,

   I would like to book your service.

   Name: [Customer Name]
   Phone: [Phone Number]
   Service: [Service Name]
   Location: [Location]
   Preferred Date: [Date]
   Message: [\n\n Kindly review my booking request and let me know the availability and confirmation.\n\n Thank you!]

   
   ```
5. Customer is seamlessly redirected to WhatsApp to send the message.

### 3. CMS Admin Dashboard (`/admin`)
- **Protected Routes**: Server-side authentication check on all `/admin/*` routes.
- **Login Portal (`/admin/login`)**: Secure authentication via Supabase Auth or master credentials (`admin@bellfix.com` / `admin123`).
- **Real-Time Analytics Overview**:
  - Total Bookings
  - New Bookings
  - Confirmed Bookings
  - Completed Bookings
  - Active Services
  - Recent Bookings Table
- **Reusable Popup Modals**: All create, edit, and delete operations use clean modal components rather than separate pages.
- **Delete Confirmation Modal**: Every deletion requires two-step confirmation with item identification and safety warning.
- **Cloudinary Image Uploader**: Real-time upload preview, progress indicator, file type and size validation.

---

## 🗄️ Database Setup (Supabase)

The complete SQL schema with Row Level Security (RLS), indexes, and seed records is located at:
`supabase/schema.sql`

To deploy to your Supabase project:
1. Open your [Supabase Dashboard](https://app.supabase.com).
2. Go to the **SQL Editor**.
3. Copy and run the entire contents of `supabase/schema.sql`.

---

## 🛠️ Development & Production

```bash
# Start development server
pnpm run dev

# Run production build check
pnpm run build

# Start production server
pnpm run start
```
