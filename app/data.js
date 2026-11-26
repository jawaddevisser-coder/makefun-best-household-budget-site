/* Hearth & Ledger — the Alvarez household's own numbers.
   One household, one month at a time. All figures are this family's real
   November 2026 budget; the app adds to them in the browser only. */
'use strict';

const BUDGET_DATA = {
  household: 'The Alvarez Household',
  members: ['Maya (teacher)', 'Daniel (nurse)', 'Sofia (9)', 'Leo (6)'],
  month: 'November 2026',
  income: [
    { source: 'Maya — teaching salary', amount: 3850 },
    { source: 'Daniel — nursing salary', amount: 2720 },
    { source: 'Weekend tutoring (Maya)', amount: 280 },
  ],
  categories: [
    { name: 'Housing', planned: 1650, spent: 1650, note: 'Mortgage + insurance' },
    { name: 'Groceries', planned: 720, spent: 648, note: 'Weekly shop, incl. school lunches' },
    { name: 'Transport', planned: 340, spent: 296, note: 'Fuel, bus passes, one oil change' },
    { name: 'Utilities', planned: 310, spent: 287, note: 'Power, water, internet, phones' },
    { name: 'Dining out', planned: 180, spent: 214, note: 'Two birthdays this month' },
    { name: 'Kids & school', planned: 260, spent: 233, note: 'After-school club + supplies' },
    { name: 'Health', planned: 190, spent: 142, note: 'Pharmacy + dentist check-up' },
    { name: 'Fun & streaming', planned: 120, spent: 118, note: 'Cinema night + subscriptions' },
    { name: 'Clothing', planned: 150, spent: 96, note: 'Winter coats for Sofia & Leo' },
    { name: 'Household', planned: 140, spent: 131, note: 'Cleaning, repairs, garden' },
  ],
  savingsPlanned: 1050,
  transactions: [
    { date: '2026-11-24', desc: 'GreenMart weekly shop', cat: 'Groceries', amount: 96.40 },
    { date: '2026-11-23', desc: 'Mortgage payment', cat: 'Housing', amount: 1650.00 },
    { date: '2026-11-22', desc: 'Cinema — family night', cat: 'Fun & streaming', amount: 54.00 },
    { date: '2026-11-21', desc: 'Shell fuel', cat: 'Transport', amount: 48.20 },
    { date: '2026-11-20', desc: 'Sofia birthday dinner', cat: 'Dining out', amount: 86.50 },
    { date: '2026-11-19', desc: 'City power bill', cat: 'Utilities', amount: 132.75 },
    { date: '2026-11-18', desc: 'Pharmacy — Leo inhaler', cat: 'Health', amount: 28.90 },
    { date: '2026-11-17', desc: 'GreenMart weekly shop', cat: 'Groceries', amount: 88.15 },
    { date: '2026-11-15', desc: 'After-school club fees', cat: 'Kids & school', amount: 120.00 },
    { date: '2026-11-14', desc: 'Internet bill', cat: 'Utilities', amount: 59.00 },
    { date: '2026-11-13', desc: 'Winter coats (2)', cat: 'Clothing', amount: 96.00 },
    { date: '2026-11-11', desc: 'Bus passes — Maya & Daniel', cat: 'Transport', amount: 84.00 },
    { date: '2026-11-10', desc: 'GreenMart weekly shop', cat: 'Groceries', amount: 91.30 },
    { date: '2026-11-08', desc: 'Dentist check-up — Daniel', cat: 'Health', amount: 65.00 },
    { date: '2026-11-07', desc: 'Pizza night', cat: 'Dining out', amount: 42.00 },
    { date: '2026-11-05', desc: 'Water bill', cat: 'Utilities', amount: 46.40 },
    { date: '2026-11-03', desc: 'GreenMart weekly shop', cat: 'Groceries', amount: 94.80 },
  ],
  goals: [
    { name: 'Emergency fund', saved: 8400, target: 10000, note: 'Six months of essentials, nearly there.' },
    { name: 'Summer road trip', saved: 1250, target: 2400, note: 'Two weeks driving the coast in July.' },
    { name: 'Replace the old sedan', saved: 3100, target: 7500, note: 'The 2011 Civic is on its last legs.' },
    { name: 'Kids college starter', saved: 2000, target: 5000, note: 'A little each month, since they were born.' },
  ],
  months: [
    { month: 'Jun', income: 6720, spent: 5480 },
    { month: 'Jul', income: 6810, spent: 5910 },
    { month: 'Aug', income: 6790, spent: 6230 },
    { month: 'Sep', income: 6850, spent: 5360 },
    { month: 'Oct', income: 6850, spent: 5640 },
    { month: 'Nov', income: 6850, spent: 3815 },
  ],
  upcoming: [
    { date: 'Nov 27', desc: 'Mortgage insurance', amount: 118 },
    { date: 'Nov 28', desc: 'GreenMart weekly shop', amount: 95 },
    { date: 'Nov 30', desc: 'Streaming subscriptions', amount: 24 },
    { date: 'Dec 1', desc: 'After-school club — December', amount: 120 },
  ],
  tips: [
    'Dining out is $34 over plan — two birthdays will do that. One home-cooked celebration next month covers it.',
    'Groceries are running $72 under plan. Moving that $72 to the road-trip fund finishes it a month early.',
    'November is the cheapest month since June: $1,035 less spent than August, mostly fewer takeaways.',
  ],
};
