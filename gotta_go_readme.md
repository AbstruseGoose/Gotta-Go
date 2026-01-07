# 🚽 GottaGo

Community-powered bathroom discovery and rating app.

---

## 🧠 Overview
**GottaGo** is a web-based, mobile-first application inspired by GasBuddy/Yelp, but focused **exclusively on bathrooms**.

Users can quickly find nearby bathrooms, view cleanliness and amenity ratings, upload photos, and leave reviews. Browsing is public, but posting requires authentication.

The goal is to ship a fast MVP, get real users posting bathrooms, and iterate live.

---

## 🎯 Core Features (MVP)

### 🚻 Bathroom Discovery
- Interactive map (Mapbox)
- Bathroom pins based on GPS coordinates
- List view synced with map
- Sorting options:
  - Closest (distance)
  - Overall rating
  - Cleanliness
  - Smell
  - Safety
  - Supplies
  - Accessibility
  - Least crowded

### 🧾 Bathroom Detail Page
Each bathroom includes:
- Name
- Description (where it is inside, notes)
- Location on map
- Photo gallery
- Reviews
- Aggregated average ratings

---

## ⭐ Expanded Rating System
Each review uses 1–5 numeric ratings for:
- Overall
- Cleanliness
- Smell
- Safety
- Supplies (TP, soap, towels)
- Accessibility
- Crowding

Bathrooms can be **sorted by any rating field**.

---

## 📍 Adding Bathrooms

### Default (All Users)
- Uses device GPS automatically
- User provides name, description, photos

### Advanced (Restricted)
Manual pin placement on the map is allowed for:
- Admins
- Moderators
- Trusted contributors (earned by activity)

---

## 👤 Authentication & Roles

### Auth
- Google login via Supabase Auth

### Roles
- `user` (default)
- `trusted` (earned via contributions)
- `mod`
- `admin`

### Role Capabilities
- Manual pin placement
- Editing bathroom locations
- Moderation tools

---

## 🛡️ Moderation & Safety
- Admin/mod panel
- Remove photos
- Remove reviews
- Edit bathroom details
- Promote/demote users

No personal data is stored beyond authentication IDs.

---

## 🗄️ Backend (Supabase)

### Database Tables
- `bathrooms`
- `reviews` (expanded ratings)
- `photos`
- `user_profiles` (roles, contribution count)

### Storage
- Supabase Storage for photo uploads

---

## 🧩 Frontend Structure

Built with **Next.js (App Router)** + **TypeScript** + **Tailwind CSS**

### Routes
- `/` → Map + list view
- `/bathroom/[id]` → Bathroom detail page
- `/add` → Add bathroom (GPS-based)
- `/admin` → Admin/mod tools

### Core Components
- `MapView`
- `BathroomCard`
- `ReviewForm`
- `SortBar`
- `PhotoUpload`

---

## ⚙️ Development Workflow

- VS Code with live preview
- Hot reload using `npm run dev`
- Edit code and see results instantly
- MVP-first, iterate fast

---

## 🚀 Deployment

- Hosted on **Vercel**
- Environment variables for Supabase + Mapbox
- Designed to scale after MVP

---

## 🧭 Guiding Principles

- Ship fast, improve live
- Mobile-first UI
- Community-driven trust
- Minimal friction to post
- Get bathrooms posted ASAP 🚽

---

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **Backend:** Supabase (Auth, Database, Storage)
- **Maps:** Mapbox
- **Hosting:** Vercel

---

## 📌 Status

🚧 MVP in active development

---

If you're contributing to this project:
- Keep things simple
- Prefer clarity over cleverness
- Optimize for real-world use

