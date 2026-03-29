-- Adds persistent confirmation codes for bookings.
-- Safe to run multiple times.

ALTER TABLE booking
ADD COLUMN IF NOT EXISTS confirmation_code VARCHAR(32);

CREATE UNIQUE INDEX IF NOT EXISTS uq_booking_confirmation_code
ON booking (confirmation_code)
WHERE confirmation_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_booking_confirmation_code
ON booking (confirmation_code);
