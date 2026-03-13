# Sphere Digital — Full Stack Website

A professional agency website built with the MERN stack (MongoDB, Express, React, Node.js).

## Tech Stack

- **Frontend**: React 18, React Router, Framer Motion, custom CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB + Mongoose
- **Auth**: JWT

## Project Structure

```
sphere-digital/
├── client/          # React frontend
│   └── src/
│       ├── components/   # Cursor, Navbar, ContactForm
│       ├── context/      # AuthContext
│       ├── pages/        # Home, Login, Admin
│       └── services/     # API calls
├── server/          # Node.js backend
│   ├── models/      # Contact, Project, User
│   ├── routes/      # contact, projects, auth
│   ├── middleware/  # JWT auth
│   └── index.js    # Server entry
└── package.json     # Root monorepo config
```

## Getting Started

### 1. Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Configure Environment
```bash
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI, JWT secret, etc.
```

### 4. Run in Development
```bash
npm run dev
# Starts both server (port 5000) and client (port 3000)
```

### 5. Create Admin Account
POST to `http://localhost:5000/api/auth/register` with:
```json
{ "email": "admin@youremail.com", "password": "yourpassword" }
```
(Only works once — admin creation is locked after first user)

### 6. Access Admin Panel
Visit `http://localhost:3000/admin` and sign in.

## Features

- **Homepage**: Animated hero, services grid, project showcase, contact form
- **Template Marketplace**: Dedicated templates page with cart and Stripe checkout
- **Contact Form**: Submissions saved to MongoDB, viewable in admin
- **Admin Dashboard**: View contacts, manage projects, manage purchasable templates, JWT-protected
- **Custom Cursor**: Premium feel with gold accent cursor
- **Scroll Animations**: Intersection observer fade-ups throughout

## Stripe Setup

Add this to your server environment:

```bash
STRIPE_SECRET_KEY=sk_test_xxx
```

Templates checkout endpoint:

- `POST /api/templates/checkout`

Admin template management endpoints:

- `GET /api/templates/admin`
- `POST /api/templates`
- `PUT /api/templates/:id`
- `DELETE /api/templates/:id`

## Deployment

### Frontend (Vercel/Netlify)
```bash
cd client && npm run build
```
Deploy the `build/` folder.

### Backend (Railway/Render/Heroku)
Deploy the `server/` folder. Set environment variables in your host dashboard.

### MongoDB
Use [MongoDB Atlas](https://www.mongodb.com/atlas) for production — free tier available.

---

© Sphere Digital. Built with precision.
# spheredigital
