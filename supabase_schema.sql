-- =========================================================
-- EarnFlow - Complete Supabase PostgreSQL Database Schema
-- Run this in your Supabase Project -> SQL Editor
-- =========================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone_number TEXT,
  country TEXT DEFAULT 'Bangladesh',
  is_admin BOOLEAN DEFAULT FALSE NOT NULL,
  balance NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
  todays_earnings NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
  total_earnings NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
  referral_earnings NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
  pending_withdraw NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
  total_withdraw NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
  completed_tasks INT DEFAULT 0 NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by INT REFERENCES public.users(id) ON DELETE SET NULL,
  is_premium BOOLEAN DEFAULT FALSE NOT NULL,
  premium_until TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' NOT NULL,
  last_daily_claim TIMESTAMP WITH TIME ZONE,
  daily_streak INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  task_url TEXT,
  image TEXT,
  button_text TEXT,
  reward NUMERIC(10, 2) NOT NULL,
  countdown_timer INT NOT NULL DEFAULT 10,
  ad_timer INT DEFAULT 10 NOT NULL,
  instructions TEXT NOT NULL,
  daily_limit INT NOT NULL DEFAULT 1,
  type TEXT NOT NULL DEFAULT 'video',
  status TEXT DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. USER TASKS TABLE
CREATE TABLE IF NOT EXISTS public.user_tasks (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  task_id INT REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. WITHDRAWALS TABLE
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  method TEXT NOT NULL,
  account_details TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. PREMIUM REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.premium_requests (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  method TEXT NOT NULL,
  sender_number TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  screenshot_url TEXT,
  status TEXT DEFAULT 'pending' NOT NULL,
  admin_notes TEXT,
  plan_id INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 6. ADVERTISEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.advertisements (
  id SERIAL PRIMARY KEY,
  name TEXT,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  title TEXT,
  description TEXT,
  destination_url TEXT,
  button_text TEXT,
  sponsored_text TEXT,
  status TEXT DEFAULT 'active' NOT NULL,
  location TEXT NOT NULL,
  priority INT DEFAULT 1,
  ad_ratio TEXT DEFAULT 'horizontal'
);

-- 7. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL
);

-- 8. VIDEOS TABLE
CREATE TABLE IF NOT EXISTS public.videos (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  reward NUMERIC(10, 2) NOT NULL,
  duration INT NOT NULL,
  status TEXT DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' NOT NULL,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 10. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 11. PREMIUM PLANS TABLE
CREATE TABLE IF NOT EXISTS public.premium_plans (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  benefits TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  duration_days INT NOT NULL,
  reward_multiplier NUMERIC(4, 2) DEFAULT 1.00 NOT NULL,
  badge_text TEXT NOT NULL,
  color TEXT DEFAULT 'amber' NOT NULL,
  status TEXT DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 12. PROMO CODES TABLE
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  reward_amount NUMERIC(10, 2) NOT NULL,
  max_uses INT DEFAULT 0,
  current_uses INT DEFAULT 0,
  status TEXT DEFAULT 'active' NOT NULL,
  promotion_tag TEXT,
  country_restriction TEXT DEFAULT 'both',
  new_users_only BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- 13. USER PROMO CODES TABLE
CREATE TABLE IF NOT EXISTS public.user_promo_codes (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  promo_code_id INT REFERENCES public.promo_codes(id) ON DELETE CASCADE NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 14. USER VIDEOS TABLE
CREATE TABLE IF NOT EXISTS public.user_videos (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  video_id INT REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =========================================================
-- INITIAL DEFAULT DATA SEEDING
-- =========================================================

-- Insert Super Admin User (alif6t6 / @Alif632868 - bcrypt hashed password)
INSERT INTO public.users (username, password_hash, phone_number, country, is_admin, balance, total_earnings, referral_code, status)
VALUES ('alif6t6', '$2a$10$wL4G2CgXg4.v/3uH34.Bq.I36.5Zp1c5a.1B0cR.G.632868', '01800000000', 'Bangladesh', TRUE, 5000.00, 5000.00, 'ALIF6T6', 'active')
ON CONFLICT (username) DO NOTHING;

-- Insert System Settings
INSERT INTO public.settings (key, value) VALUES
  ('minWithdrawal', '100'),
  ('dollarRate', '120'),
  ('perReferralBonus', '10'),
  ('noticeText', 'Welcome to EarnFlow! Complete tasks daily to earn real cash rewards.'),
  ('telegramLink', 'https://t.me/earnflow_official'),
  ('dailyCheckInBonus', '5.00'),
  ('renewTime', '06:00 AM'),
  ('campaignEnabled', 'true'),
  ('campaignName', 'Welcome Bonus Campaign'),
  ('campaignBonusAmount', '20.00'),
  ('bkashNumber', '01800000000'),
  ('nagadNumber', '01800000000'),
  ('rocketNumber', '01800000000')
ON CONFLICT (key) DO NOTHING;

-- Insert Starter Tasks
INSERT INTO public.tasks (title, description, task_url, reward, countdown_timer, ad_timer, instructions, daily_limit, type) VALUES
  ('Watch Sponsor Video', 'Watch the full video to earn cash reward', 'https://youtube.com', 5.00, 30, 10, 'Watch video for 30 seconds', 5, 'video'),
  ('Visit Partner Website', 'Browse partner site for 15 seconds', 'https://google.com', 3.00, 15, 5, 'Stay on page until countdown finishes', 10, 'link'),
  ('Join Official Telegram Channel', 'Join our official channel for latest updates', 'https://t.me/earnflow_official', 10.00, 5, 0, 'Join Telegram channel and stay member', 1, 'telegram')
ON CONFLICT DO NOTHING;

-- Disable RLS for easy API client access if using standard connection string
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_promo_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_videos DISABLE ROW LEVEL SECURITY;
