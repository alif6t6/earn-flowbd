const fs = require('fs');
let code = fs.readFileSync('src/db/schema.ts', 'utf8');

code = code.replace(
  "phoneNumber: text('phone_number'),\n  isAdmin",
  "phoneNumber: text('phone_number'),\n  country: text('country').default('Bangladesh'),\n  isAdmin"
);

code = code.replace(
  "export const promoCodes = pgTable('promo_codes', {\n  id: serial('id').primaryKey(),\n  code: text('code').notNull().unique(),\n  description: text('description'),\n  rewardAmount: numeric('reward_amount', { precision: 10, scale: 2 }).notNull(),\n  maxUses: integer('max_uses').default(0), // 0 means unlimited\n  currentUses: integer('current_uses').default(0),\n  status: text('status').default('active').notNull(),\n  createdAt: timestamp('created_at').defaultNow().notNull(),\n  startDate: timestamp('start_date').defaultNow(),\n  expiresAt: timestamp('expires_at'),\n});",
  `export const promoCodes = pgTable('promo_codes', {
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
});`
);

fs.writeFileSync('src/db/schema.ts', code);
