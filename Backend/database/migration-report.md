# TiDB Migration Report

## 1. SQL persistence inventory

### Authentication and identity

- [Backend/controllers/Authentication/UserController.js](Backend/controllers/Authentication/UserController.js): uses UserModel and SessionModel for signup, login, reset flow, admin login.
- [Backend/controllers/Authentication/AuthController.js](Backend/controllers/Authentication/AuthController.js): uses SessionModel for refresh token rotation and revocation.
- [Backend/utils/bootstrapAdmin.js](Backend/utils/bootstrapAdmin.js): creates initial admin with UserModel.

### Social and content

- [Backend/controllers/SocialFeed/SocialFeedController.js](Backend/controllers/SocialFeed/SocialFeedController.js): posts, comments, likes, bookmarks, visibility, author lookup.
- [Backend/models/SocialFeed/PostModel.js](Backend/models/SocialFeed/PostModel.js): embedded comments and arrays of likes/bookmarks.
- [Backend/controllers/Location/LocationController.js](Backend/controllers/Location/LocationController.js): location reviews and ratings.

### Booking and inventory

- [Backend/controllers/FlightController/FlightController.js](Backend/controllers/FlightController/FlightController.js): flights, seat availability, flight booking lifecycle.
- [Backend/controllers/TrainController/TrainController.js](Backend/controllers/TrainController/TrainController.js): trains, coaches, seats, train bookings.
- [Backend/controllers/BusController/BusController.js](Backend/controllers/BusController/BusController.js): buses, seat availability, bus bookings.
- [Backend/controllers/HotelController/HotelController.js](Backend/controllers/HotelController/HotelController.js): hotels, room types, hotel bookings, payment confirmation.
- [Backend/controllers/BookingController/BookingLifecycleController.js](Backend/controllers/BookingController/BookingLifecycleController.js): generic transport booking lifecycle.

### Admin and system

- [Backend/controllers/AdminController/AdminController.js](Backend/controllers/AdminController/AdminController.js): aggregates admin dashboards.
- [Backend/controllers/AdminController/AdminAuditController.js](Backend/controllers/AdminController/AdminAuditController.js): audit logs and analytics.
- [Backend/controllers/AdminController/BackupController.js](Backend/controllers/BackupController/BackupController.js): backup records.
- [Backend/controllers/AdminController/LocationManagementController.js](Backend/controllers/AdminController/LocationManagementController.js): location CRUD.

## 2. Relational targets

### Core tables

- users
- refresh_tokens
- sessions
- notifications
- announcements
- locations
- location_reviews
- audit_logs

### Existing domain tables

- posts
- comments
- likes
- bookmarks
- flights
- flight_seats
- flight_bookings
- trains
- train_coaches
- train_seats
- train_bookings
- buses
- bus_seats
- bus_bookings
- hotels
- hotel_rooms
- hotel_bookings
- payments
- itineraries
- itinerary_days
- activities
- system_backups
- images

## 3. Migration strategy

1. Add a TiDB/MySQL-compatible connection pool and SQL schema file.
2. Keep existing controllers and routes intact while swapping the persistence layer underneath them.
3. Migrate authentication and core content first because many modules depend on users and sessions.
4. Migrate transport and hotel bookings next with transaction-safe seat allocation.
5. Keep schema migrations versioned alongside the SQL schema.

## 4. Compatibility note

The backend uses TiDB/MySQL repositories while preserving the existing request and response contracts, so the frontend continues to work without modification.
