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

Optional client environment file for local or hosted frontend builds:
```bash
cp client/.env.example client/.env
```

Client env values:

- `REACT_APP_API_URL` = API base URL
- `REACT_APP_CLOUDINARY_CLOUD_NAME` = your Cloudinary cloud name
- `REACT_APP_CLOUDINARY_UPLOAD_PRESET` = unsigned upload preset name

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

## Cloudinary Image Uploads (Free Tier)

The admin dashboard supports direct image uploads to Cloudinary (free tier) for project and template images.

1. Create a free Cloudinary account
2. In Cloudinary settings, create an **unsigned upload preset**
3. Set client environment variables:

```bash
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

Then use the file inputs in the Admin dashboard under Projects and Templates; uploaded URLs are auto-filled.

## Deployment

### Render Deployment (Recommended)

Deploy everything as one Render Web Service from the repository root.

### 1. Render Web Service Settings

- **Root Directory**: leave empty (repository root)
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check Path**: `/api/health`

This project root build installs server dependencies, builds the React client, and serves the built frontend from Express.

### 2. Environment Variables

Set these in Render:

- `MONGO_URI` = your MongoDB Atlas connection string
- `JWT_SECRET` = a long random secret
- `STRIPE_SECRET_KEY` = your Stripe secret key (required for checkout)
- `CLIENT_URL` = your Render app URL (example: `https://spheredigital.onrender.com`)
- `REACT_APP_CLOUDINARY_CLOUD_NAME` = your Cloudinary cloud name
- `REACT_APP_CLOUDINARY_UPLOAD_PRESET` = your unsigned upload preset
- `PORT` is automatically provided by Render

### 3. MongoDB

Use [MongoDB Atlas](https://www.mongodb.com/atlas) for production.

### 4. Post-Deploy Setup

Create your first admin account once:

- `POST https://<your-backend-domain>/api/auth/register`


Then login from:

- `https://<your-frontend-domain>/admin`

---

© Sphere Digital. Built with precision.
# spheredigital
