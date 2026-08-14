CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  profile_image VARCHAR(1000) DEFAULT '',
  followers JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role_active (role, is_active),
  INDEX idx_users_created_at (created_at DESC)
) ENGINE=InnoDB;

ALTER TABLE users ADD COLUMN IF NOT EXISTS followers JSON NULL;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  family_id VARCHAR(100) NOT NULL,
  token_hash VARCHAR(512) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
  revoked_at TIMESTAMP NULL DEFAULT NULL,
  revoke_reason VARCHAR(100) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_refresh_tokens_user (user_id),
  INDEX idx_refresh_tokens_family (family_id),
  INDEX idx_refresh_tokens_revoked (is_revoked, expires_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(100) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  refresh_token_hash VARCHAR(512) NOT NULL,
  family_id VARCHAR(100) NOT NULL,
  user_agent TEXT NULL,
  ip_address VARCHAR(255) NULL,
  expires_at TIMESTAMP NOT NULL,
  is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
  revoked_at TIMESTAMP NULL DEFAULT NULL,
  revoke_reason VARCHAR(100) NULL,
  last_used_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_sessions_user (user_id),
  INDEX idx_sessions_family (family_id),
  INDEX idx_sessions_revoked (is_revoked, expires_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NULL,
  message TEXT NULL,
  meta JSON NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_notifications_user_read (user_id, is_read, created_at DESC)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS announcements (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  meta JSON NULL,
  created_by CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_announcements_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_announcements_created_at (created_at DESC)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS locations (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NULL,
  latitude DECIMAL(10,8) NULL,
  longitude DECIMAL(11,8) NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'Other',
  country VARCHAR(100) NULL,
  state VARCHAR(100) NULL,
  district VARCHAR(100) NULL,
  city VARCHAR(100) NULL,
  sub_city VARCHAR(100) NULL,
  address TEXT NULL,
  postal_code VARCHAR(20) NULL,
  timezone VARCHAR(50) NULL,
  avg_rating DECIMAL(2,1) NOT NULL DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,
  post_count INT NOT NULL DEFAULT 0,
  visitor_count INT NOT NULL DEFAULT 0,
  images JSON NULL,
  tags JSON NULL,
  is_popular BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (avg_rating >= 0 AND avg_rating <= 5),
  INDEX idx_locations_category (category),
  INDEX idx_locations_rating (avg_rating DESC, review_count DESC)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS location_reviews (
  id CHAR(36) PRIMARY KEY,
  location_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  user_name VARCHAR(255) NULL,
  profile_image VARCHAR(1000) NULL,
  rating INT NOT NULL,
  review_text VARCHAR(1000) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_location_reviews_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_location_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_logs (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NULL,
  user_name VARCHAR(255) NULL,
  user_email VARCHAR(255) NULL,
  user_role VARCHAR(50) NULL,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255) NULL,
  method VARCHAR(20) NULL,
  endpoint VARCHAR(1000) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
  status_code INT NULL,
  error_message TEXT NULL,
  ip_address VARCHAR(255) NULL,
  user_agent TEXT NULL,
  metadata JSON NULL,
  duration INT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_audit_logs_action_time (action, created_at DESC),
  INDEX idx_audit_logs_admin_time (is_admin, created_at DESC)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS flights (
  id CHAR(36) PRIMARY KEY,
  flight_number VARCHAR(100) NOT NULL,
  airline VARCHAR(255) NOT NULL,
  aircraft VARCHAR(255) DEFAULT '',
  from_city VARCHAR(255) NOT NULL,
  source_airport VARCHAR(255) DEFAULT '',
  to_city VARCHAR(255) NOT NULL,
  destination_airport VARCHAR(255) DEFAULT '',
  departure_time VARCHAR(100) NOT NULL,
  arrival_time VARCHAR(100) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  stops INT NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'Scheduled',
  days JSON NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  base_price DECIMAL(10,2) NULL,
  total_seats INT NOT NULL,
  available_seats INT NOT NULL,
  seats JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_flights_route (from_city, to_city),
  INDEX idx_flights_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS flight_bookings (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  flight_id CHAR(36) NOT NULL,
  journey_date TIMESTAMP NOT NULL,
  booking_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  from_city VARCHAR(255) NOT NULL,
  to_city VARCHAR(255) NOT NULL,
  fare_per_seat DECIMAL(10,2) NOT NULL,
  total_fare DECIMAL(10,2) NOT NULL,
  payment JSON NOT NULL,
  passengers JSON NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'booked',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_flight_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_flight_bookings_user (user_id),
  INDEX idx_flight_bookings_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS trains (
  id CHAR(36) PRIMARY KEY,
  train_number VARCHAR(100) NOT NULL UNIQUE,
  train_name VARCHAR(255) NULL,
  train_type VARCHAR(100) NULL,
  journey_time VARCHAR(100) NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Active',
  route JSON NOT NULL,
  station_distances JSON NOT NULL,
  departure JSON NULL,
  arrival JSON NULL,
  days JSON NOT NULL,
  coaches JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_trains_type_status (train_type, status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS train_bookings (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  train_number VARCHAR(100) NOT NULL,
  train_name VARCHAR(255) NOT NULL,
  coach_type VARCHAR(100) NOT NULL,
  seat_numbers JSON NOT NULL,
  passenger_names JSON NOT NULL,
  from_city VARCHAR(255) NOT NULL,
  to_city VARCHAR(255) NOT NULL,
  journey_date TIMESTAMP NOT NULL,
  fare DECIMAL(10,2) NOT NULL,
  payment JSON NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  booked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) NOT NULL DEFAULT 'booked',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_train_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_train_bookings_user (user_id),
  INDEX idx_train_bookings_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS buses (
  id CHAR(36) PRIMARY KEY,
  bus_number VARCHAR(100) NOT NULL UNIQUE,
  company VARCHAR(255) NOT NULL,
  operator VARCHAR(255) DEFAULT '',
  route JSON NOT NULL,
  station_map JSON NOT NULL,
  base_fare_per_km DECIMAL(10,2) NOT NULL,
  departure_time VARCHAR(100) NOT NULL,
  arrival_time VARCHAR(100) NOT NULL,
  duration VARCHAR(100) NULL,
  days JSON NOT NULL,
  type VARCHAR(100) NULL,
  driver_location JSON NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Active',
  total_seats INT NULL,
  available_seats INT NULL,
  seats JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_buses_company_status (company, status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bus_bookings (
  id CHAR(36) PRIMARY KEY,
  bus_id CHAR(36) NOT NULL,
  journey_date TIMESTAMP NOT NULL,
  user_id CHAR(36) NOT NULL,
  source VARCHAR(255) NULL,
  destination VARCHAR(255) NULL,
  distance DECIMAL(10,2) NULL,
  fare_per_seat DECIMAL(10,2) NULL,
  total_fare DECIMAL(10,2) NULL,
  payment JSON NOT NULL,
  passengers JSON NOT NULL,
  booking_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) NOT NULL DEFAULT 'booked',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bus_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_bus_bookings_user (user_id),
  INDEX idx_bus_bookings_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS hotels (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  city VARCHAR(255) NOT NULL,
  address VARCHAR(1000) NULL,
  description TEXT NULL,
  star_rating INT NOT NULL DEFAULT 3,
  price_per_night DECIMAL(10,2) NOT NULL DEFAULT 0,
  available_rooms INT NOT NULL DEFAULT 1,
  amenities JSON NOT NULL,
  images JSON NOT NULL,
  room_types JSON NOT NULL,
  reviews JSON NOT NULL,
  average_rating DECIMAL(3,2) NOT NULL DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_hotels_city (city),
  INDEX idx_hotels_active (is_active)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS hotel_bookings (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  hotel_id CHAR(36) NOT NULL,
  hotel_name VARCHAR(255) NOT NULL,
  room_type VARCHAR(100) NULL,
  check_in TIMESTAMP NOT NULL,
  check_out TIMESTAMP NOT NULL,
  rooms INT NOT NULL DEFAULT 1,
  guests INT NOT NULL DEFAULT 1,
  total_fare DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  booking_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  payment JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_hotel_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_hotel_bookings_user (user_id),
  INDEX idx_hotel_bookings_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS itineraries (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  start_date VARCHAR(100) NOT NULL,
  end_date VARCHAR(100) NOT NULL,
  interests JSON NOT NULL,
  trip_type VARCHAR(100) NOT NULL,
  start_time VARCHAR(100) NOT NULL,
  end_time VARCHAR(100) NOT NULL,
  transport_mode VARCHAR(100) NOT NULL,
  budget VARCHAR(100) NOT NULL,
  plan JSON NOT NULL,
  meta JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_itineraries_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_itineraries_user (user_id),
  INDEX idx_itineraries_destination (destination)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS booking_lifecycles (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  booking_type VARCHAR(50) NOT NULL,
  resource_id CHAR(36) NOT NULL,
  route JSON NOT NULL,
  passengers JSON NOT NULL,
  seat_numbers JSON NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment JSON NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP NULL,
  payment_reference VARCHAR(255) NULL,
  cancellation_reason VARCHAR(1000) NULL,
  refund JSON NOT NULL,
  ticket_number VARCHAR(255) NULL,
  qr_code_payload TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_booking_lifecycles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_booking_lifecycles_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS seat_locks (
  id CHAR(36) PRIMARY KEY,
  resource_id CHAR(36) NOT NULL,
  booking_type VARCHAR(50) NOT NULL,
  seat_number VARCHAR(100) NOT NULL,
  booking_id CHAR(36) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_seat_locks_resource_seat (resource_id, seat_number)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS posts (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  travel_date TIMESTAMP NULL,
  images JSON NOT NULL,
  tags JSON NOT NULL,
  visibility VARCHAR(50) NOT NULL DEFAULT 'public',
  author JSON NOT NULL,
  likes JSON NOT NULL,
  bookmarks JSON NOT NULL,
  mentions JSON NOT NULL,
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  location_rating DECIMAL(3,2) NOT NULL DEFAULT 0,
  location_reviews JSON NOT NULL,
  comments JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_posts_visibility (visibility),
  INDEX idx_posts_created (created_at DESC)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS location_ratings (
  id CHAR(36) PRIMARY KEY,
  location_id VARCHAR(100) NOT NULL,
  location_name VARCHAR(255) NOT NULL,
  ratings JSON NOT NULL,
  average_rating DECIMAL(3,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_location_ratings_location (location_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS backups (
  id CHAR(36) PRIMARY KEY,
  backup_name VARCHAR(255) NOT NULL UNIQUE,
  backup_type VARCHAR(50) NOT NULL DEFAULT 'MANUAL',
  size BIGINT NOT NULL DEFAULT 0,
  collections JSON NOT NULL,
  created_by JSON NOT NULL,
  description TEXT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
  backup_path VARCHAR(1000) NULL,
  duration INT NOT NULL DEFAULT 0,
  error_message TEXT NULL,
  is_restored BOOLEAN NOT NULL DEFAULT FALSE,
  restored_at TIMESTAMP NULL,
  restored_by JSON NULL,
  retention TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_backups_status (status),
  INDEX idx_backups_created (created_at DESC)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS system_metrics (
  id CHAR(36) PRIMARY KEY,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  server JSON NOT NULL,
  `database` JSON NOT NULL,
  api JSON NOT NULL,
  errors JSON NOT NULL,
  storage JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_system_metrics_time (timestamp DESC)
) ENGINE=InnoDB;
