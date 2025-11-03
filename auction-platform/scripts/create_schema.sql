-- Schema creation script for the auction platform domain.
-- Enable required extensions.
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

BEGIN;

-- Drop tables in dependency order for idempotent reruns.
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS auctions CASCADE;
DROP TABLE IF EXISTS item_keywords CASCADE;
DROP TABLE IF EXISTS keywords CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS auth_password_resets CASCADE;
DROP TABLE IF EXISTS tokens CASCADE;
DROP TABLE IF EXISTS user_addresses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- === USERS & AUTH ===
CREATE TABLE users (
  user_id          BIGSERIAL PRIMARY KEY,
  email            CITEXT UNIQUE NOT NULL,
  password_hash    TEXT        NOT NULL,
  first_name       TEXT        NOT NULL,
  last_name        TEXT        NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE
);
CREATE TABLE tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    expired BOOLEAN NOT NULL DEFAULT FALSE,
    user_id BIGINT NOT NULL REFERENCES users(user_id)
);

CREATE TABLE user_addresses (
  user_id       BIGINT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  street_name   TEXT NOT NULL,
  street_number TEXT NOT NULL,
  city          TEXT NOT NULL,
  country       TEXT NOT NULL,
  postal_code   TEXT NOT NULL
);

create table auth_password_resets (
  id               uuid primary key default gen_random_uuid(),
  user_id          bigint not null references users(user_id) on delete cascade,
  code_hash        text not null,
  expires_at       timestamptz not null,
  used_at          timestamptz,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  status           text not null default 'ACTIVE',
  attempts         smallint not null default 0,
  max_attempts     smallint not null default 5
);

-- === ITEM CATALOGUE ===
CREATE TABLE items (
  item_id          BIGSERIAL PRIMARY KEY,
  seller_id        BIGINT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  name             TEXT   NOT NULL,
  description      TEXT   NOT NULL,
  type             TEXT   NOT NULL DEFAULT 'Forward',
  shipping_days    INTEGER NOT NULL CHECK (shipping_days >= 0),
  base_ship_cost   NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  expedited_cost   NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_sold          BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE keywords (
  keyword_id   BIGSERIAL PRIMARY KEY,
  term         CITEXT UNIQUE NOT NULL
);

CREATE TABLE item_keywords (
  item_id      BIGINT NOT NULL REFERENCES items(item_id) ON DELETE CASCADE,
  keyword_id   BIGINT NOT NULL REFERENCES keywords(keyword_id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, keyword_id)
);

CREATE INDEX idx_items_fts ON items USING GIN (to_tsvector('english', name || ' ' || description));

-- === AUCTIONS ===
CREATE TABLE auctions (
  auction_id       BIGSERIAL PRIMARY KEY,
  item_id          BIGINT UNIQUE NOT NULL REFERENCES items(item_id) ON DELETE RESTRICT,
  start_price      INTEGER NOT NULL CHECK (start_price >= 0),
  current_price    INTEGER NOT NULL CHECK (current_price >= 0),
  highest_bidder   BIGINT REFERENCES users(user_id),
  starts_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at          TIMESTAMPTZ NOT NULL,
  status           TEXT NOT NULL CHECK (status IN ('ONGOING','ENDED','CANCELLED')) DEFAULT 'ONGOING'
);

CREATE INDEX idx_auctions_active ON auctions (status, ends_at);
CREATE INDEX idx_auctions_item ON auctions (item_id);

CREATE TABLE bids (
  bid_id        BIGSERIAL PRIMARY KEY,
  auction_id    BIGINT NOT NULL REFERENCES auctions(auction_id) ON DELETE CASCADE,
  bidder_id     BIGINT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  amount        INTEGER NOT NULL CHECK (amount >= 0),
  placed_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bids_auction_time ON bids (auction_id, placed_at DESC);

-- === PAYMENTS ===
CREATE TABLE payments (
  paymentid               BIGSERIAL PRIMARY KEY,
  auction_id              BIGINT NOT NULL REFERENCES auctions(auction_id) ON DELETE RESTRICT,
  payee_id                BIGINT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  payment_date            TIMESTAMPTZ NOT NULL DEFAULT now(),
  expected_delivery_date  TIMESTAMPTZ NOT NULL,
  is_expedited            BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_payments_auction ON payments (auction_id);
CREATE INDEX idx_payments_payee ON payments (payee_id);

-- Trigger to enforce strictly increasing bids.
DROP TRIGGER IF EXISTS trg_increasing_bid ON bids;
DROP FUNCTION IF EXISTS enforce_increasing_bid();

CREATE OR REPLACE FUNCTION enforce_increasing_bid() RETURNS trigger AS $$
DECLARE
  a auctions;
BEGIN
  SELECT * INTO a FROM auctions WHERE auction_id = NEW.auction_id FOR UPDATE;
  IF a.status <> 'ONGOING' OR now() >= a.ends_at THEN
    RAISE EXCEPTION 'Auction ended or not active';
  END IF;
  IF NEW.amount <= GREATEST(a.current_price, a.start_price) THEN
    RAISE EXCEPTION 'Bid must be strictly greater than current price';
  END IF;

  UPDATE auctions
     SET current_price = NEW.amount,
         highest_bidder = NEW.bidder_id
   WHERE auction_id = NEW.auction_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_increasing_bid
BEFORE INSERT ON bids
FOR EACH ROW EXECUTE FUNCTION enforce_increasing_bid();

COMMIT;
