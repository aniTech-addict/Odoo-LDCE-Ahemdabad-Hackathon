-- SQL schema generated from application data models in src/data/seed.js,
-- src/store/useTripStore.js, and src/App.jsx.
-- Dialect: PostgreSQL-compatible ANSI SQL.

BEGIN;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  city TEXT,
  country TEXT,
  additional_info TEXT,
  password_hash TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT NOT NULL,
  image_url TEXT,
  blurb TEXT,
  cost_index INTEGER,
  popularity INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_city_cost_index CHECK (cost_index IS NULL OR cost_index >= 0),
  CONSTRAINT chk_city_popularity CHECK (popularity IS NULL OR (popularity >= 0 AND popularity <= 100))
);

CREATE TABLE activities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  duration_label TEXT,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_activity_price CHECK (price >= 0)
);

CREATE TABLE trips (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Upcoming',
  cover_image_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_trip_dates CHECK (end_date >= start_date),
  CONSTRAINT chk_trip_status CHECK (status IN ('Ongoing', 'Upcoming', 'Completed'))
);

CREATE TABLE trip_cities (
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
  city_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (trip_id, city_id),
  CONSTRAINT chk_city_order CHECK (city_order >= 0)
);

CREATE TABLE itinerary_items (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  activity_id TEXT REFERENCES activities(id) ON DELETE SET NULL,
  day_date DATE NOT NULL,
  time_of_day TIME,
  title TEXT NOT NULL,
  category TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_itinerary_price CHECK (price >= 0)
);

CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trip_cities_city_id ON trip_cities(city_id);
CREATE INDEX idx_itinerary_trip_day ON itinerary_items(trip_id, day_date);
CREATE INDEX idx_itinerary_activity_id ON itinerary_items(activity_id);

COMMIT;
