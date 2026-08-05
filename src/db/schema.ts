import { pgTable, serial, text, timestamp, integer, boolean, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  phoneNumber: text('phone_number'),
  country: text('country').default('Bangladesh'),
  isAdmin: boolean('is_admin').default(false).notNull(),
  balance: numeric('balance', { precision: 10, scale: 2 }).default('0.00').notNull(),
  todaysEarnings: numeric('todays_earnings', { precision: 10, scale: 2 }).default('0.00').notNull(),
  totalEarnings: numeric('total_earnings', { precision: 10, scale: 2 }).default('0.00').notNull(),
  referralEarnings: numeric('referral_earnings', { precision: 10, scale: 2 }).default('0.00').notNull(),
  pendingWithdraw: numeric('pending_withdraw', { precision: 10, scale: 2 }).default('0.00').notNull(),
  totalWithdraw: numeric('total_withdraw', { precision: 10, scale: 2 }).default('0.00').notNull(),
  completedTasks: integer('completed_tasks').default(0).notNull(),
  referralCode: text('referral_code').notNull().unique(),
  referredBy: integer('referred_by'),
  isPremium: boolean('is_premium').default(false).notNull(),
  premiumUntil: timestamp('premium_until'),
  status: text('status').default('active').notNull(), // active, suspended, banned
  lastDailyClaim: timestamp('last_daily_claim'),
  dailyStreak: integer('daily_streak').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  taskUrl: text('task_url'),
  image: text('image'),
  buttonText: text('button_text'), // Optional custom text for the start button
  reward: numeric('reward', { precision: 10, scale: 2 }).notNull(),
  countdownTimer: integer('countdown_timer').notNull(), // Post-click timer
  adTimer: integer('ad_timer').default(10).notNull(), // Pre-click timer
  instructions: text('instructions').notNull(),
  dailyLimit: integer('daily_limit').notNull(),
  type: text('type').notNull(), // Daily Task, Website Visit, etc.
  status: text('status').default('active').notNull(), // active, paused
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userTasks = pgTable('user_tasks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  taskId: integer('task_id').references(() => tasks.id).notNull(),
  completedAt: timestamp('completed_at').defaultNow().notNull(),
});

export const withdrawals = pgTable('withdrawals', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  method: text('method').notNull(),
  accountDetails: text('account_details').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').default('pending').notNull(), // pending, approved, rejected
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const premiumRequests = pgTable('premium_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  method: text('method').notNull(),
  senderNumber: text('sender_number').notNull(),
  transactionId: text('transaction_id').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  screenshotUrl: text('screenshot_url'),
  status: text('status').default('pending').notNull(), // pending, approved, rejected
  adminNotes: text('admin_notes'),
  planId: integer('plan_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const advertisements = pgTable('advertisements', {
  id: serial('id').primaryKey(),
  name: text('name'),
  type: text('type').notNull(),
  content: text('content').notNull(), // HTML, JS, or Link
  imageUrl: text('image_url'),
  title: text('title'),
  description: text('description'),
  destinationUrl: text('destination_url'),
  buttonText: text('button_text'),
  sponsoredText: text('sponsored_text'),
  status: text('status').default('active').notNull(),
  location: text('location').notNull(),
  priority: integer('priority').default(1),
  adRatio: text('ad_ratio').default('horizontal'),
});

export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
});

export const videos = pgTable('videos', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  videoUrl: text('video_url').notNull(),
  reward: numeric('reward', { precision: 10, scale: 2 }).notNull(),
  duration: integer('duration').notNull(), // in seconds
  status: text('status').default('active').notNull(), // active, disabled
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'), // null for global broadcast
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').default('info').notNull(), // info, gift, system, warning
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: text('type').notNull(), // task_reward, video_reward, referral_bonus, withdrawal, premium_purchase, gift, admin_add, admin_subtract
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});


export const premiumPlans = pgTable('premium_plans', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  benefits: text('benefits').notNull(), // JSON string array
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  durationDays: integer('duration_days').notNull(),
  rewardMultiplier: numeric('reward_multiplier', { precision: 4, scale: 2 }).default('1.00').notNull(),
  badgeText: text('badge_text').notNull(),
  color: text('color').default('amber').notNull(),
  status: text('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const promoCodes = pgTable('promo_codes', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  description: text('description'),
  rewardAmount: numeric('reward_amount', { precision: 10, scale: 2 }).notNull(),
  maxUses: integer('max_uses').default(0), // 0 means unlimited
  currentUses: integer('current_uses').default(0),
  status: text('status').default('active').notNull(),
  promotionTag: text('promotion_tag'),
  countryRestriction: text('country_restriction').default('both'), // 'bangladesh', 'india', 'both'
  newUsersOnly: boolean('new_users_only').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  startDate: timestamp('start_date').defaultNow(),
  expiresAt: timestamp('expires_at'),
});

export const userPromoCodes = pgTable('user_promo_codes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  promoCodeId: integer('promo_code_id').references(() => promoCodes.id).notNull(),
  claimedAt: timestamp('claimed_at').defaultNow().notNull(),
});
export const userVideos = pgTable('user_videos', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  videoId: integer('video_id').references(() => videos.id).notNull(),
  completedAt: timestamp('completed_at').defaultNow().notNull(),
});
