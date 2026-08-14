# TripUp - Travel Booking Application 🚀

A comprehensive, production-ready travel booking platform supporting flights, trains, buses, and AI-generated itineraries.

> **Status**: ✅ Production Ready | **Version**: 1.0.0 | **Last Updated**: 2026-07-22

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Production Features](#production-features)
- [Documentation](#documentation)
- [Deployment](#deployment)
- [Support](#support)

## 🎯 Overview

TripUp is an all-in-one travel booking application that enables users to:

- **Search & Book** flights, trains, and buses with advanced filters
- **Manage Bookings** with real-time status tracking and cancellation support
- **Get AI Recommendations** for personalized travel itineraries
- **Social Features** to share experiences and rate locations
- **Admin Panel** for managing transportation services
- **Notifications** for booking updates and special offers

**Live Demo**: https://tripup-travel-app-eight.vercel.app

## ✨ Key Features

### 🛫 Multi-Mode Booking (Flights, Trains, Buses)

- Advanced search with source, destination, and date filters
- Real-time availability and seat management
- Flexible filtering: price, duration, stops, amenities
- Booking history and management
- Cancellation support with refund tracking
- Station/Airport finder with nearby facilities

### 🎒 Smart Itinerary Planner

- AI-powered travel recommendations using Google Gemini
- Personalized itineraries based on preferences
- Day-by-day activity planning
- Budget optimization
- Offline itinerary access

### 👥 Social Travel Features

- Share travel experiences and photos
- Location-based ratings and reviews
- Follow friends and see their journeys
- Curated destination recommendations
- Travel community insights

### 👨‍💼 Admin Dashboard

- Transportation management (flights, trains, buses)
- Dynamic pricing and seat allocation
- User and booking management
- Analytics and reporting
- Revenue tracking

### 🔐 Enterprise Security

- JWT-based authentication
- Rate limiting and DDoS protection
- Input validation and sanitization
- Secure password hashing
- Audit logging for all operations
- HTTPS/TLS enforcement

### 📊 Production-Grade Infrastructure

- Centralized logging with daily rotation
- Health monitoring and status checks
- Automatic error tracking and alerts
- Database query optimization
- Real-time notifications via WebSockets
- Cloudinary image storage integration

## 💻 Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jose)
- **File Storage**: Cloudinary
- **Real-time**: Socket.IO
- **Email**: Nodemailer
- **Validation**: express-validator
- **Logging**: Winston with daily rotation
- **Security**: Helmet, rate-limiting, sanitization

### Frontend

- **Framework**: React 18+
- **Build**: Vite
- **State Management**: Redux
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Real-time**: Socket.IO Client

### DevOps & Infrastructure

- **Database**: MongoDB Atlas (cloud)
- **Image Storage**: Cloudinary
- **Backend Hosting**: Railway / Render / Heroku
- **Frontend Hosting**: Vercel
- **Monitoring**: Winston logs + health endpoints

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm 8+
- MongoDB Atlas account
- Cloudinary account
- Git

### Backend Setup

```bash
# Clone and navigate
git clone <repo-url>
cd tripup-travel-app/Backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm start

# Production
NODE_ENV=production npm start
```

**Backend runs on**: http://localhost:5000
**API Docs**: http://localhost:5000/api/docs

### Frontend Setup

```bash
cd ../Frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:5000" > .env.local

# Start development server
npm run dev

# Production build
npm run build
```

**Frontend runs on**: http://localhost:5173

### Database Setup

```bash
# MongoDB Atlas connection
# Update MONGODB_URI in .env with your connection string
# Format: mongodb+srv://username:password@cluster.mongodb.net/tripup

# Indexes are automatically created on first model initialization
```

## 🔒 Production Features Implemented

### Security ✅

- Helmet security headers (CSP, HSTS, X-Frame-Options)
- Rate limiting (5-100 req/15min by endpoint)
- Input sanitization (XSS & NoSQL injection prevention)
- CORS protection with origin whitelist
- JWT authentication with expiration
- Password hashing with bcrypt
- Audit logging for all operations

### Monitoring & Logging ✅

- Centralized Winston logging
- Daily rotating log files
- Request logging for all HTTP calls
- Error tracking and alerting
- Health check endpoints
- TTL-based data cleanup

### Performance ✅

- Strategic database indexes on all common queries
- Response compression (Gzip)
- Request validation
- Retry logic with exponential backoff
- Query optimization with projections

### Error Handling ✅

- Global error handler middleware
- React error boundaries
- 404 and 500 error pages
- Validation error responses
- Async error wrapping

### API Documentation ✅

- Auto-generated Swagger documentation at `/api/docs`
- Complete endpoint schemas
- Authentication examples
- Standard error format

## 📊 API Endpoints

### Authentication

```
POST   /api/auth/signup       - User registration
POST   /api/auth/login        - User login
POST   /api/auth/refresh      - Refresh token
POST   /api/auth/logout       - Logout
```

### Travel Booking

```
GET    /api/flights           - List flights
GET    /api/trains            - List trains
GET    /api/bus               - List buses
POST   /api/bookings          - Create booking
GET    /api/bookings          - User bookings
GET    /api/bookings/:id      - Booking details
PATCH  /api/bookings/:id      - Update booking
DELETE /api/bookings/:id      - Cancel booking
```

### User

```
GET    /api/user/profile      - Get profile
PATCH  /api/user/profile      - Update profile
GET    /api/user/bookings     - User bookings
```

### Admin (Rate Limited: 5/15min)

```
POST   /api/admin/flights     - Create flight
PATCH  /api/admin/flights/:id - Update flight
DELETE /api/admin/flights/:id - Delete flight
```

### Health & Docs

```
GET    /health                - Basic health check
GET    /api/health            - Detailed health status
GET    /api/docs              - Swagger documentation
```

## 📚 Documentation

| Document                                                                 | Purpose                                        |
| ------------------------------------------------------------------------ | ---------------------------------------------- |
| [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)                               | Complete production setup guide                |
| [PRODUCTION_DEPLOYMENT_CHECKLIST.md](PRODUCTION_DEPLOYMENT_CHECKLIST.md) | Deployment verification (100+ checklist items) |
| [PRODUCTION_READINESS_SUMMARY.md](PRODUCTION_READINESS_SUMMARY.md)       | Feature summary & achievements                 |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md)                                 | Developer quick reference                      |
| [FOLDER_ORGANIZATION.md](FOLDER_ORGANIZATION.md)                         | Project structure & naming conventions         |

## 🌍 Environment Configuration

### Backend (.env)

```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tripup

# Authentication
ACCESS_TOKEN_SECRET=strong-secret-key
REFRESH_TOKEN_SECRET=strong-secret-key

# Cloudinary
CLOUDINARY_NAME=your-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# CORS
ALLOWED_ORIGINS=https://tripup.com,https://app.tripup.com
```

See [Backend/.env.example](Backend/.env.example) for complete template.

## 🚢 Deployment

### Quick Deployment Steps

```bash
# 1. Backend (Railway/Render/Heroku)
# Set all environment variables
# Deploy from repository

# 2. Frontend (Vercel)
vercel --prod

# 3. Database
Use MongoDB Atlas

# 4. Setup Domain
Point domain to hosting providers
Enable SSL/TLS certificate
Update CORS origins
```

See [PRODUCTION_DEPLOYMENT_CHECKLIST.md](PRODUCTION_DEPLOYMENT_CHECKLIST.md) for complete deployment guide.

## 🧪 Testing

### Health Check

```bash
curl http://localhost:5000/api/health
```

### List Flights

```bash
curl http://localhost:5000/api/flights?from=DEL&to=MUM
```

### With Authentication

```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:5000/api/user/profile
```

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**

- Verify MONGODB_URI in .env
- Check IP whitelist in MongoDB Atlas
- Test connection: `mongosh "<uri>"`

**Rate Limited (429 Error)**

- Global: 100/15min, Auth: 5/15min, Booking: 20/15min
- Wait 15 minutes or use different IP
- Check logs for detailed info

**Logging Issues**

- Ensure `Backend/logs/` directory exists
- Check disk space available
- Verify write permissions

**API Documentation Not Loading**

- Ensure backend is running on correct port
- Check `/api/docs` endpoint
- Verify Express app initialized

## 🎯 Performance Targets

| Metric                  | Target  |
| ----------------------- | ------- |
| API Response Time (p95) | < 200ms |
| Error Rate              | < 0.5%  |
| Database Query Time     | < 100ms |
| Server Uptime           | 99.9%   |

## 📞 Support

- 📚 Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for common tasks
- 🔍 Review API docs at `http://localhost:5000/api/docs`
- 📋 See deployment checklist for deployment issues
- 💬 GitHub Issues for bugs and feature requests

## 📜 License

ISC License - See LICENSE file for details

## 🎉 Project Status

```
✅ Backend:   Production Ready
✅ Frontend:  Production Ready
✅ Database:  Optimized & Indexed
✅ Security:  Enterprise Grade
✅ Monitoring: Comprehensive
✅ Documentation: Complete
```

**Ready for production deployment!** 🚀

---

**Last Updated**: July 22, 2026 | **Version**: 1.0.0 | **Maintained By**: TripUp Development Team

For production deployment guidance, see [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md) and [PRODUCTION_DEPLOYMENT_CHECKLIST.md](PRODUCTION_DEPLOYMENT_CHECKLIST.md)

### 3. `flight.json`

```
{
  "flightNumber": "AI850",
  "airline": "Air India",
  "from": "Pune",
  "to": "Delhi",
  "departureTime": "08:00 AM",
  "arrivalTime": "10:10 AM",
  "duration": "2h 10m",
  "days": ["Daily"],
  "price": 4200
}
```

### 4. `bus.json`

```
{
  "busNumber": "MH14-BUS3012",
  "operator": "MSRTC",
  "from": "Pune",
  "to": "Nashik",
  "departureTime": "02:00 PM",
  "arrivalTime": "07:30 PM",
  "duration": "5h 30m",
  "type": "AC Sleeper",
  "price": 650,
  "days": ["Mon", "Wed", "Sat"]
}
```

## 👨‍💻 Developer Info

- **👨‍💻 Name:** Yogesh Pote
- **🎓 Education:** B.Sc. Computer Science (Final Year, 2026)
- **💻 Tech Stack:** MERN, Java, DSA, C++, PHP, MySQL, T-SQL, OOPs
- **📫 Email:** [yogpote035@gmail.com](mailto:yogpote035@gmail.com)
- **📱 Contact:** +91 8999390368
- **🌐 Portfolio:** [https://yogpote035.github.io/Portfolio-Website/](https://yogpote035.github.io/Portfolio-Website/)
- **📂 GitHub:** [@yogpote035](https://github.com/yogpote035)
