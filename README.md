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

### Render Deployment (Recommended)

Deploy as two services:

1. **Backend API** as a Render Web Service
2. **Frontend** as a Render Static Site

### 1. Backend Service (Render Web Service)

- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

Set these environment variables in Render:

- `MONGO_URI` = your MongoDB Atlas connection string
- `JWT_SECRET` = a long random secret
- `CLIENT_URL` = your frontend Render URL (for CORS and Stripe redirects)
- `STRIPE_SECRET_KEY` = your Stripe secret key (required for checkout)
- `PORT` is automatically provided by Render

### 2. Frontend Service (Render Static Site)

- **Root Directory**: `client`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`

Set this environment variable in Render Static Site:

- `REACT_APP_API_URL` = your backend URL + `/api`

Example:

```bash
REACT_APP_API_URL=https://sphere-digital-api.onrender.com/api
```

### 3. MongoDB

Use [MongoDB Atlas](https://www.mongodb.com/atlas) for production.

### 4. Post-Deploy Setup

Create your first admin account once:

- `POST https://<your-backend-domain>/api/auth/register`

Body:

```json
{ "email": "admin@youremail.com", "password": "yourpassword" }
```

Then login from:

- `https://<your-frontend-domain>/admin`

---

© Sphere Digital. Built with precision.
# spheredigital
