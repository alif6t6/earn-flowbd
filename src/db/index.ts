import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.ts';

const { Pool } = pg;

let pool: pg.Pool | null = null;
let dbInstance: any = null;

// Memory storage fallback for local execution or when DATABASE_URL is unavailable
class MemoryDb {
  users: any[] = [];
  tasks: any[] = [
    {
      id: 1,
      title: 'Explore Sponsor Website',
      description: 'Visit sponsor website for 15 seconds to earn reward.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300',
      buttonText: 'Visit Link',
      reward: '15.00',
      countdownTimer: 15,
      instructions: 'Click Start Task, view advertisement for 10s, then stay on sponsor site for 15s.',
      dailyLimit: 5,
      type: 'Website Visit',
      status: 'active',
      createdAt: new Date(),
    },
    {
      id: 2,
      title: 'Daily Login Reward',
      description: 'Claim your daily active user attendance bonus.',
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=300',
      buttonText: 'Claim Reward',
      reward: '10.00',
      countdownTimer: 10,
      instructions: 'Click Start Task, view advertisement, and claim your daily reward.',
      dailyLimit: 1,
      type: 'Daily Task',
      status: 'active',
      createdAt: new Date(),
    },
    {
      id: 3,
      title: 'Subscribe Official Telegram Channel',
      description: 'Join our official channel for payment updates & promos.',
      image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300',
      buttonText: 'Join Channel',
      reward: '25.00',
      countdownTimer: 10,
      instructions: 'Join channel and submit your Telegram username.',
      dailyLimit: 1,
      type: 'Social Join',
      status: 'active',
      createdAt: new Date(),
    }
  ];
  videos: any[] = [
    {
      id: 1,
      title: 'Earn Flow Quick Start Video Guide',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      reward: '20.00',
      duration: 30,
      status: 'active',
      createdAt: new Date()
    },
    {
      id: 2,
      title: 'How to Withdraw to bKash & Binance',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      reward: '15.00',
      duration: 20,
      status: 'active',
      createdAt: new Date()
    }
  ];
  userTasks: any[] = [];
  userVideos: any[] = [];
  withdrawals: any[] = [];
  premiumRequests: any[] = [];
  advertisements: any[] = [
    {
      id: 1,
      name: 'Adsterra Main Interstitial',
      type: 'Adsterra',
      content: '', // Leaving empty since we are building a premium card
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
      title: 'Global Tech Summit 2026',
      description: 'Join the future of innovation.',
      destinationUrl: 'https://example.com',
      buttonText: 'Claim Bonus Now',
      sponsoredText: 'Sponsored',
      status: 'active',
      location: 'task_modal'
    }
  ];
  settings: any[] = [
    { id: 1, key: 'referralCommission', value: '15' },
    { id: 2, key: 'referralEnabled', value: 'true' },
    { id: 3, key: 'adCountdown', value: '10' },
    { id: 4, key: 'siteName', value: 'Earn Flow' },
    { id: 5, key: 'minWithdraw', value: '500' },
    { id: 6, key: 'heroTitle', value: 'Earn Money Online with Micro Jobs' },
    { id: 7, key: 'heroSubtitle', value: 'Complete simple online tasks, watch short video ads, and withdraw instant cash directly to your bKash, Nagad, or Binance wallet.' },
    { id: 8, key: 'buttonStartText', value: 'Start Earning Now' },
    { id: 9, key: 'footerText', value: 'Earn Flow is Bangladesh & Worldwide trusted micro job and advertisement reward platform.' },
    { id: 10, key: 'copyrightText', value: '© 2026 Earn Flow. All rights reserved.' },
    { id: 11, key: 'navDashboardName', value: 'Dashboard' },
    { id: 12, key: 'navTasksName', value: 'Tasks' },
    { id: 13, key: 'navWithdrawName', value: 'Withdraw' },
    { id: 14, key: 'navProfileName', value: 'Profile' },
    { id: 15, key: 'faqContent', value: 'Q: How do I earn money on Earn Flow?\nA: Go to Tasks, click Start Task, view the 10-second sponsor ad, complete the required instructions, and claim instant cash rewards.\n\nQ: What is the minimum withdrawal limit?\nA: The minimum withdrawal is ৳500.' },
    { id: 16, key: 'aboutContent', value: 'Earn Flow is an innovative digital rewards platform where active users connect with global sponsors. Users perform micro tasks like visiting websites, watching promotional video guides, and inviting friends while receiving verified payouts.' },
    { id: 17, key: 'contactContent', value: 'Support Email: support@earnflow.app\nTelegram Official: @EarnFlowOfficial\nWorking Hours: 24/7 Fast Payouts' },
    { id: 18, key: 'termsContent', value: 'By using Earn Flow, you agree to follow our micro-job guidelines. Cheating, using VPNs for fake completion, or creating multiple accounts on the same device will result in account suspension.' },
    { id: 19, key: 'privacyContent', value: 'Your privacy is paramount. Earn Flow collects minimal data required for account authentication and secure withdrawal processing. We never share your credentials with third parties.' },

    // Page Visibility Settings (true = visible, false = hidden)
    { id: 21, key: 'page_referral_enabled', value: 'true' },
    { id: 22, key: 'page_support_enabled', value: 'true' },
    { id: 23, key: 'page_withdraw_enabled', value: 'true' },
    { id: 24, key: 'page_announcements_enabled', value: 'true' },
    { id: 25, key: 'page_offers_enabled', value: 'true' },
    { id: 26, key: 'page_statistics_enabled', value: 'true' },

    // Payment Settings
    { id: 27, key: 'bkashNumber', value: '01712345678' },
    { id: 28, key: 'nagadNumber', value: '01812345678' },
    { id: 29, key: 'binanceWallet', value: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t' },
    { id: 30, key: 'paymentInstructions', value: '1. Send total amount using Send Money option to our official Personal bKash or Nagad number.\n2. For Binance, transfer USDT (TRC20) to the wallet address.\n3. Enter your Sender Mobile Number / Wallet and 10-character Transaction ID (TrxID) in the form below.' },
    { id: 31, key: 'paymentNotice', value: 'Please double-check all details before submitting. Processing time is usually 5-15 minutes after verification.' },
    { id: 32, key: 'paymentStatus', value: 'active' }
  ];
  premiumPlans: any[] = [
    {
      id: 1,
      title: 'Standard',
      description: '30 Days Standard VIP subscription for a boost in earnings.',
      benefits: JSON.stringify(['2x Task Rewards', 'Priority Admin Support', 'VIP Badge']),
      price: '150.00',
      durationDays: 30,
      rewardMultiplier: '2.00',
      badgeText: '30 DAYS',
      color: 'slate',
      status: 'active',
      createdAt: new Date()
    },
    {
      id: 2,
      title: 'Premium',
      description: '60 Days extended Premium access with better payouts and queueing.',
      benefits: JSON.stringify(['2.5x Task Rewards', '0% Withdrawal Fees', 'Fast Payout Queuing', 'Gold VIP Badge']),
      price: '250.00',
      durationDays: 60,
      rewardMultiplier: '2.50',
      badgeText: '60 DAYS',
      color: 'amber',
      status: 'active',
      createdAt: new Date()
    },
    {
      id: 3,
      title: 'Elite',
      description: '90 Days elite VIP package with extreme return and dedicated support.',
      benefits: JSON.stringify(['3x Task & Video Rewards', '0% Withdrawal Fees', 'Dedicated 24/7 Hotline', 'Platinum VIP Badge']),
      price: '350.00',
      durationDays: 90,
      rewardMultiplier: '3.00',
      badgeText: '90 DAYS VIP',
      color: 'indigo',
      status: 'active',
      createdAt: new Date()
    },
    {
      id: 4,
      title: 'Ultimate',
      description: '160 Days ultimate VIP package with absolute maximum profit speed.',
      benefits: JSON.stringify(['4x Task & Video Rewards', 'Instant Payouts', 'Highest Priority Support', 'Diamond VIP Badge']),
      price: '500.00',
      durationDays: 160,
      rewardMultiplier: '4.00',
      badgeText: '160 DAYS ULTIMATE',
      color: 'purple',
      status: 'active',
      createdAt: new Date()
    }
  ];
  notifications: any[] = [];
  transactions: any[] = [];
  promoCodes: any[] = [
    {
      id: 1,
      code: 'WELCOME2026',
      description: 'Special welcome bonus',
      rewardAmount: '50.00',
      maxUses: 100,
      currentUses: 0,
      status: 'active',
      createdAt: new Date(),
      expiresAt: null
    }
  ];
  userPromoCodes: any[] = [];
}

export const memoryStore = new MemoryDb();

export const getDb = () => {
  if (dbInstance) return dbInstance;
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }

  try {
    pool = new Pool({
      connectionString,
      max: 10,
      connectionTimeoutMillis: 15000,
      ssl: (connectionString.includes('localhost') || connectionString.includes('127.0.0.1')) ? false : { rejectUnauthorized: false },
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });

    // Auto-migrate missing columns and tables for PostgreSQL
    pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_daily_claim TIMESTAMP;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_streak INTEGER DEFAULT 0 NOT NULL;
      
      CREATE TABLE IF NOT EXISTS user_tasks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        task_id INTEGER NOT NULL,
        completed_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `).catch((err) => {
      console.warn('Auto-migration query warning:', err.message);
    });

    dbInstance = drizzle(pool, { schema });
    return dbInstance;
  } catch (err) {
    console.error('Failed to create Postgres pool:', err);
    return null;
  }
};

