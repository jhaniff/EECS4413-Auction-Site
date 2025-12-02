-- Sample data load for the auction platform schema.
BEGIN;

TRUNCATE TABLE
  payments,
  bids,
  auctions,
  item_keywords,
  keywords,
  items,
  tokens,
  auth_password_resets,
  user_addresses,
  users
RESTART IDENTITY CASCADE;

INSERT INTO users (email, password_hash, first_name, last_name, is_active)
VALUES
  ('alice.seller@example.com',   '$2a$10$Qpsj6F1LjYQmP8o5hJatz.7Z5dPz0zKV0GylOeA4VxQXo4B5cQp2a', 'Alice',   'Anderson', TRUE),
  ('bob.bidder@example.com',     '$2a$10$Jcsx8QhYhWOf1ztgXQ8n0e.6td7m4dqcFvS7i9r5i5n9xJ1cAzvP6', 'Bob',     'Barton',   TRUE),
  ('charlie.collector@example.com', '$2a$10$yqA7mXZDkX68GxKQ7k6t1e2N5Z0m/7KJgE6r0cM6FlQ0N8r7uB4La', 'Charlie', 'Chen',     TRUE),
  ('dana.dealer@example.com',    '$2a$10$af8.ByjG9gR98w0g7nVJ1uW8yWwJ7k4ZL8n5m6p9fS1yMz/4wVq2K', 'Dana',    'Diaz',     TRUE),
  ('TESTGP@example.com', '{bcrypt}$2a$10$Nxi5roeMvsWFb1V6/LfMXOmYdjrwR5C3vcSd8vafjevitxklBaqQO', 'TESTGP', 'testlast', TRUE);

INSERT INTO user_addresses (user_id, street_name, street_number, city, country, postal_code)
VALUES
  ((SELECT user_id FROM users WHERE email = 'alice.seller@example.com'),    'Maple Ave',    '101', 'Toronto',  'Canada', 'M5H1T1'),
  ((SELECT user_id FROM users WHERE email = 'bob.bidder@example.com'),      'King St W',    '250', 'Toronto',  'Canada', 'M5V1J2'),
  ((SELECT user_id FROM users WHERE email = 'charlie.collector@example.com'),'Bank St',     '88',  'Ottawa',   'Canada', 'K1P5N5'),
  ((SELECT user_id FROM users WHERE email = 'dana.dealer@example.com'),     'Saint Paul',   '432', 'Montreal', 'Canada', 'H3C1M8'),
  ((SELECT user_id FROM users WHERE email = 'TESTGP@example.com'),     'Saint Paul',   '436', 'Montreal', 'Canada', 'H3C1M8');;

INSERT INTO items (seller_id, name, description, type, shipping_days, base_ship_cost, expedited_cost, is_sold)
VALUES
  ((SELECT user_id FROM users WHERE email = 'alice.seller@example.com'),
    'Vintage Camera',
    '1950s rangefinder camera in working condition with leather case.',
    'Forward',
    5,
    12.50,
    25.00,
    FALSE),
  ((SELECT user_id FROM users WHERE email = 'dana.dealer@example.com'),
    'Retro Console',
    'Restored 16-bit game console with two controllers and HDMI adapter.',
    'Forward',
    7,
    18.50,
    32.00,
    FALSE),
  ((SELECT user_id FROM users WHERE email = 'alice.seller@example.com'),
    'Designer Handbag',
    'Limited edition leather handbag with authenticity card.',
    'Forward',
    3,
    15.00,
    28.00,
    FALSE);

INSERT INTO keywords (term)
VALUES
  ('vintage'),
  ('camera'),
  ('electronics'),
  ('gaming'),
  ('fashion'),
  ('luxury')
ON CONFLICT (term) DO NOTHING;

INSERT INTO item_keywords (item_id, keyword_id)
SELECT i.item_id, k.keyword_id
FROM items i
JOIN keywords k ON TRUE
WHERE i.name = 'Vintage Camera' AND k.term IN ('vintage','camera','electronics');

INSERT INTO item_keywords (item_id, keyword_id)
SELECT i.item_id, k.keyword_id
FROM items i
JOIN keywords k ON TRUE
WHERE i.name = 'Retro Console' AND k.term IN ('vintage','electronics','gaming');

INSERT INTO item_keywords (item_id, keyword_id)
SELECT i.item_id, k.keyword_id
FROM items i
JOIN keywords k ON TRUE
WHERE i.name = 'Designer Handbag' AND k.term IN ('fashion','luxury');

INSERT INTO auctions (item_id, start_price, current_price, highest_bidder, starts_at, ends_at, status)
VALUES
  ((SELECT item_id FROM items WHERE name = 'Vintage Camera'),
    100,
    100,
    NULL,
    now() - INTERVAL '7 hours',
    now() + INTERVAL '17 hours',
    'ONGOING'),
  ((SELECT item_id FROM items WHERE name = 'Retro Console'),
    250,
    250,
    NULL,
    now() - INTERVAL '3 days',
    now() + INTERVAL '2 hours',
    'ONGOING'),
  ((SELECT item_id FROM items WHERE name = 'Designer Handbag'),
    400,
    400,
    NULL,
    now() - INTERVAL '2 days',
    now() + INTERVAL '5 hours',
    'ONGOING');

-- Bids for Vintage Camera
INSERT INTO bids (auction_id, bidder_id, amount, placed_at)
VALUES
  ((SELECT auction_id FROM auctions WHERE item_id = (SELECT item_id FROM items WHERE name = 'Vintage Camera')),
   (SELECT user_id FROM users WHERE email = 'bob.bidder@example.com'),
   120,
   now() - INTERVAL '6 hours'),
  ((SELECT auction_id FROM auctions WHERE item_id = (SELECT item_id FROM items WHERE name = 'Vintage Camera')),
   (SELECT user_id FROM users WHERE email = 'charlie.collector@example.com'),
   150,
   now() - INTERVAL '5 hours');

-- Bids for Retro Console
INSERT INTO bids (auction_id, bidder_id, amount, placed_at)
VALUES
  ((SELECT auction_id FROM auctions WHERE item_id = (SELECT item_id FROM items WHERE name = 'Retro Console')),
   (SELECT user_id FROM users WHERE email = 'bob.bidder@example.com'),
   280,
   now() - INTERVAL '2 days 3 hours'),
  ((SELECT auction_id FROM auctions WHERE item_id = (SELECT item_id FROM items WHERE name = 'Retro Console')),
   (SELECT user_id FROM users WHERE email = 'charlie.collector@example.com'),
   320,
   now() - INTERVAL '2 days 2 hours'),
  ((SELECT auction_id FROM auctions WHERE item_id = (SELECT item_id FROM items WHERE name = 'Retro Console')),
   (SELECT user_id FROM users WHERE email = 'bob.bidder@example.com'),
   360,
   now() - INTERVAL '2 days'),
  ((SELECT auction_id FROM auctions WHERE item_id = (SELECT item_id FROM items WHERE name = 'Retro Console')),
   (SELECT user_id FROM users WHERE email = 'TESTGP@example.com'),
   420,
   now() - INTERVAL '1 day 20 hours');

-- Bids for Designer Handbag prior to cancellation
INSERT INTO bids (auction_id, bidder_id, amount, placed_at)
VALUES
  ((SELECT auction_id FROM auctions WHERE item_id = (SELECT item_id FROM items WHERE name = 'Designer Handbag')),
   (SELECT user_id FROM users WHERE email = 'charlie.collector@example.com'),
   420,
   now() - INTERVAL '1 day 8 hours'),
  ((SELECT auction_id FROM auctions WHERE item_id = (SELECT item_id FROM items WHERE name = 'Designer Handbag')),
   (SELECT user_id FROM users WHERE email = 'bob.bidder@example.com'),
   450,
   now() - INTERVAL '1 day 6 hours');

-- Close auctions as needed after bid inserts.
UPDATE auctions
SET status = 'ENDED', ends_at = now() - INTERVAL '8 hours'
WHERE item_id = (SELECT item_id FROM items WHERE name = 'Retro Console');

UPDATE auctions
SET status = 'CANCELLED', ends_at = now() - INTERVAL '4 hours'
WHERE item_id = (SELECT item_id FROM items WHERE name = 'Designer Handbag');

--UPDATE items
--SET is_sold = TRUE
--WHERE name = 'Retro Console';

--INSERT INTO payments (
--  auction_id,
--  payee_id,
--  payment_date,
--  expected_delivery_date,
--  is_expedited)
--SELECT
--  a.auction_id,
--  a.highest_bidder,
--  now() - INTERVAL '6 hours',
--  now() + INTERVAL '5 days',
--  TRUE
--FROM auctions a
--WHERE a.item_id = (SELECT item_id FROM items WHERE name = 'Retro Console');

COMMIT;
