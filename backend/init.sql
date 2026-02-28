-- Schema database Alfa Security

CREATE TABLE IF NOT EXISTS operators (
  operator_id   VARCHAR(100) PRIMARY KEY,
  operator_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS venues (
  venue_id       VARCHAR(100) PRIMARY KEY,
  venue_name     VARCHAR(255) NOT NULL,
  venue_location VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS batches (
  batch_id   VARCHAR(100) PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL,
  services   JSONB NOT NULL DEFAULT '[]'
);
