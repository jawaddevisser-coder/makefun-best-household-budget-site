/* Hearth & Ledger — the app. Hash routes, one view per page, all figures
   live: editing a plan, adding a transaction or feeding a goal updates the
   totals at once. Changes are kept in this browser (localStorage) only. */
'use strict';

const STORE_KEY = 'hearth-ledger-v1';

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* private mode or no storage: start fresh */ }
  return { addedTx: [], removed: [], goalExtra: {}, planned: {} };
}

function saveState() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
}

const state = loadState();

function fmt(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function incomeTotal() {
  return BUDGET_DATA.income.reduce((s, x) => s + x.amount, 0);
}

function plannedOf(cat) {
  return state.planned[cat.name] !== undefined ? state.planned[cat.name] : cat.planned;
}

function allTransactions() {
  const removed = new Set(state.removed);
  const base = BUDGET_DATA.transactions.filter((t) => !removed.has(t.date + '|' + t.desc));
  return base.concat(state.addedTx).sort((a, b) => (a.date < b.date ? 1 : -1));
}

function spentTotal() {
  return BUDGET_DATA.categories.reduce((s, c) => s + c.spent, 0)
    + state.addedTx.reduce((s, t) => s + t.amount, 0);
}

function spentOf(catName) {
  const base = (BUDGET_DATA.categories.find((c) => c.name === catName) || { spent: 0 }).spent;
  const extra = state.addedTx
    .filter((t) => t.cat === catName)
    .reduce((s, t) => s + t.amount, 0);
  return base + extra;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const view = document.getElementById('view');

function setActiveNav(route) {
  document.querySelectorAll('.mainnav a').forEach((a) => {
    a.classList.toggle('active', a.dataset.route === route);
  });
}

/* ---------------- Dashboard ---------------- */
function renderDashboard() {
  const income = incomeTotal();
  const spent = spentTotal();
  const left = income - spent;
  const recent = allTransactions().slice(0, 5);
  const slices = BUDGET_DATA.categories.map((c) => ({ label: c.name, value: spentOf(c.name) }));
  view.innerHTML =
    '<div class="page-head"><h1>November at a glance</h1>' +
    '<p>Four people, one paycheque cycle, every dollar accounted for. ' +
    'Maya and Daniel bring home ' + fmt(income) + ' this month.</p></div>' +
    '<div class="grid cols-3">' +
    '<div class="card"><h2>Income</h2><div class="big">' + fmt(income) + '</div>' +
    '<p class="sub">3 sources — salaries plus tutoring</p></div>' +
    '<div class="card"><h2>Spent so far</h2><div class="big">' + fmt(spent) + '</div>' +
    '<p class="sub"><span class="delta good">▼ $245 under plan</span> with 6 days to go</p></div>' +
    '<div class="card"><h2>Left to assign</h2><div class="big">' + fmt(left) + '</div>' +
    '<p class="sub">Unspent income — move it to a goal below</p></div>' +
    '</div>' +
    '<div class="grid cols-2" style="margin-top:16px">' +
    '<div class="card"><h2>Where November went</h2><p class="sub">Spending by category</p>' +
    '<div class="donut-wrap"><canvas class="chart" id="donut" width="220" height="220"></canvas>' +
    '<ul class="legend">' +
    slices.map((s, i) =>
      '<li><span class="swatch" style="background:' + CHART_COLORS[i % CHART_COLORS.length] + '"></span>' +
      esc(s.label) + '<span class="amt">' + fmt(s.value) + '</span></li>').join('') +
    '</ul></div></div>' +
    '<div class="card"><h2>Coming up</h2><p class="sub">Bills before the month ends</p>' +
    BUDGET_DATA.upcoming.map((u) =>
      '<div class="kv"><span>' + esc(u.date) + ' — ' + esc(u.desc) + '</span><b>' + fmt(u.amount) + '</b></div>').join('') +
    '<h3 style="margin-top:16px">Recent spending</h3>' +
    recent.map((t) =>
      '<div class="kv"><span>' + esc(t.date.slice(5)) + ' — ' + esc(t.desc) + '</span><b>' + fmt(t.amount) + '</b></div>').join('') +
    '<p style="margin-top:12px"><a href="#/transactions">See all transactions →</a></p></div>' +
    '</div>' +
    '<div class="card" style="margin-top:16px"><div class="tip"><p><strong>Household tip:</strong> ' +
    esc(BUDGET_DATA.tips[0]) + '</p></div></div>';
  drawDonut(document.getElementById('donut'), slices);
}

/* ---------------- Budget ---------------- */
function renderBudget() {
  const rows = BUDGET_DATA.categories.map((c) => {
    const planned = plannedOf(c);
    const spent = spentOf(c.name);
    const pct = planned > 0 ? Math.round((spent / planned) * 100) : 0;
    const diff = planned - spent;
    return '<tr><td><strong>' + esc(c.name) + '</strong><br><span class="muted">' + esc(c.note) + '</span></td>' +
      '<td class="num"><input type="number" min="0" step="5" value="' + planned + '" data-plan="' +
      esc(c.name) + '" aria-label="Planned amount for ' + esc(c.name) + '" style="width:96px;text-align:right"></td>' +
      '<td class="num">' + fmt(spent) + '</td>' +
      '<td style="min-width:130px"><div class="bar-track"><div class="bar-fill' + (pct > 100 ? ' over' : '') +
      '" style="width:' + Math.min(pct, 100) + '%"></div></div><span class="muted">' + pct + '%</span></td>' +
      '<td class="num"><span class="delta ' + (diff >= 0 ? 'good' : 'over') + '">' +
      (diff >= 0 ? fmt(diff) + ' left' : fmt(-diff) + ' over') + '</span></td></tr>';
  }).join('');
  const totalPlanned = BUDGET_DATA.categories.reduce((s, c) => s + plannedOf(c), 0);
  const totalSpent = spentTotal();
  view.innerHTML =
    '<div class="page-head"><h1>The November budget</h1>' +
    '<p>Every category has a plan. Change a planned amount and the totals move at once — ' +
    'the plan is yours to adjust, not to obey blindly.</p></div>' +
    '<div class="notice">Planned spending <strong>' + fmt(totalPlanned) + '</strong> · ' +
    'spent so far <strong>' + fmt(totalSpent) + '</strong> · planned savings <strong>' +
    fmt(BUDGET_DATA.savingsPlanned) + '</strong> · income <strong>' + fmt(incomeTotal()) + '</strong></div>' +
    '<div class="card"><table><thead><tr><th>Category</th><th class="num">Planned</th>' +
    '<th class="num">Spent</th><th>Progress</th><th class="num">Status</th></tr></thead><tbody>' +
    rows +
    '<tr class="total-row"><td>Total</td><td class="num">' + fmt(totalPlanned) + '</td>' +
    '<td class="num">' + fmt(totalSpent) + '</td><td></td><td class="num">' +
    fmt(totalPlanned - totalSpent) + ' left</td></tr>' +
    '</tbody></table></div>' +
    '<div class="card" style="margin-top:16px"><div class="tip"><p><strong>One over, nine under:</strong> ' +
    'only Dining out is over plan, by $34 after two birthdays. Groceries alone are $72 under — ' +
    'that covers the overspend twice over.</p></div></div>';
  view.querySelectorAll('input[data-plan]').forEach((input) => {
    input.addEventListener('change', () => {
      const v = Math.max(0, Math.round(Number(input.value) || 0));
      state.planned[input.dataset.plan] = v;
      saveState();
      renderBudget();
    });
  });
}

/* ---------------- Transactions ---------------- */
function renderTransactions(filter) {
  const cats = ['All categories'].concat(BUDGET_DATA.categories.map((c) => c.name));
  const list = allTransactions().filter((t) => !filter || filter === 'All categories' || t.cat === filter);
  const total = list.reduce((s, t) => s + t.amount, 0);
  view.innerHTML =
    '<div class="page-head"><h1>Transactions</h1>' +
    '<p>Every dollar out, newest first. Add one and the budget, the dashboard and the reports all update.</p></div>' +
    '<div class="card"><h2>Add a transaction</h2>' +
    '<form id="txForm"><div class="form-row">' +
    '<div class="field"><label for="txDesc">What was it?</label><input type="text" id="txDesc" required maxlength="80" placeholder="e.g. GreenMart weekly shop"></div>' +
    '<div class="field"><label for="txAmount">Amount ($)</label><input type="number" id="txAmount" required min="0.01" step="0.01" placeholder="0.00"></div>' +
    '<div class="field"><label for="txCat">Category</label><select id="txCat">' +
    BUDGET_DATA.categories.map((c) => '<option>' + esc(c.name) + '</option>').join('') + '</select></div>' +
    '<div class="field"><button type="submit">Add it</button></div>' +
    '</div></form></div>' +
    '<div class="card" style="margin-top:16px"><div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">' +
    '<h2 style="margin:0">All spending</h2><span class="muted">' + list.length + ' transactions · ' + fmt(total) + '</span>' +
    '<span style="margin-left:auto"></span><label for="txFilter" style="margin:0">Show</label>' +
    '<select id="txFilter" style="width:auto">' +
    cats.map((c) => '<option' + (c === filter ? ' selected' : '') + '>' + esc(c) + '</option>').join('') +
    '</select></div>' +
    '<table style="margin-top:10px"><thead><tr><th>Date</th><th>What</th><th>Category</th><th class="num">Amount</th><th></th></tr></thead><tbody>' +
    list.map((t) =>
      '<tr><td>' + esc(t.date) + '</td><td>' + esc(t.desc) + '</td><td><span class="pill">' + esc(t.cat) +
      '</span></td><td class="num">' + fmt(t.amount) + '</td>' +
      '<td><button class="small danger" data-del="' + esc(t.date + '|' + t.desc) + '">Remove</button></td></tr>').join('') +
    '</tbody></table></div>';
  document.getElementById('txFilter').addEventListener('change', (e) => renderTransactions(e.target.value));
  document.getElementById('txForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const desc = document.getElementById('txDesc').value.trim();
    const amount = Number(document.getElementById('txAmount').value);
    const cat = document.getElementById('txCat').value;
    if (!desc || !(amount > 0)) return;
    state.addedTx.push({ date: '2026-11-26', desc, cat, amount: Math.round(amount * 100) / 100 });
    saveState();
    renderTransactions(filter);
  });
  view.querySelectorAll('button[data-del]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.removed.push(btn.dataset.del);
      saveState();
      renderTransactions(filter);
    });
  });
}

/* ---------------- Savings goals ---------------- */
function renderGoals() {
  const cards = BUDGET_DATA.goals.map((g, i) => {
    const saved = g.saved + (state.goalExtra[g.name] || 0);
    const pct = Math.min(100, Math.round((saved / g.target) * 100));
    const left = Math.max(0, g.target - saved);
    return '<div class="card"><div class="goal-head"><h2>' + esc(g.name) + '</h2>' +
      '<span class="pill' + (pct >= 100 ? '' : ' warn') + '">' + pct + '% there</span></div>' +
      '<p class="sub">' + esc(g.note) + '</p>' +
      '<div class="big">' + fmt(saved) + ' <small>of ' + fmt(g.target) + '</small></div>' +
      '<div class="bar-track" style="margin:10px 0 8px"><div class="bar-fill gold" style="width:' + pct + '%"></div></div>' +
      '<p class="muted">' + fmt(left) + ' to go · ' +
      (left === 0 ? 'Goal reached — time to celebrate, then set the next one.' : 'about ' + Math.ceil(left / 175) + ' months at $175 a month.') + '</p>' +
      '<button class="small" data-goal="' + i + '">Add $50</button> ' +
      '<button class="small ghost" data-goal-big="' + i + '">Add $175</button></div>';
  }).join('');
  view.innerHTML =
    '<div class="page-head"><h1>Savings goals</h1>' +
    '<p>Four things this household is saving for. Every spare dollar has a destination — ' +
    'tap a button and watch a bar move.</p></div>' +
    '<div class="grid cols-2">' + cards + '</div>' +
    '<div class="card" style="margin-top:16px"><h2>Start a new goal</h2>' +
    '<form id="goalForm"><div class="form-row">' +
    '<div class="field"><label for="goalName">Goal name</label><input type="text" id="goalName" required maxlength="60" placeholder="e.g. New washing machine"></div>' +
    '<div class="field"><label for="goalTarget">Target ($)</label><input type="number" id="goalTarget" required min="1" step="1" placeholder="1000"></div>' +
    '<div class="field"><label for="goalSaved">Already saved ($)</label><input type="number" id="goalSaved" min="0" step="1" value="0"></div>' +
    '<div class="field"><button type="submit">Add goal</button></div>' +
    '</div></form></div>';
  view.querySelectorAll('button[data-goal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const g = BUDGET_DATA.goals[Number(btn.dataset.goal)];
      state.goalExtra[g.name] = (state.goalExtra[g.name] || 0) + 50;
      saveState();
      renderGoals();
    });
  });
  view.querySelectorAll('button[data-goal-big]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const g = BUDGET_DATA.goals[Number(btn.dataset.goalBig)];
      state.goalExtra[g.name] = (state.goalExtra[g.name] || 0) + 175;
      saveState();
      renderGoals();
    });
  });
  document.getElementById('goalForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('goalName').value.trim();
    const target = Math.round(Number(document.getElementById('goalTarget').value) || 0);
    const saved = Math.round(Number(document.getElementById('goalSaved').value) || 0);
    if (!name || target <= 0) return;
    BUDGET_DATA.goals.push({ name, saved, target, note: 'Added by the household, November 2026.' });
    renderGoals();
  });
}

/* ---------------- Reports ---------------- */
function renderReports() {
  const rows = BUDGET_DATA.months;
  const best = rows.reduce((b, r) => ((r.income - r.spent) > (b.income - b.spent) ? r : b), rows[0]);
  view.innerHTML =
    '<div class="page-head"><h1>Six months in review</h1>' +
    '<p>June to November 2026. Spending peaked in August — the holiday month — and has fallen every month since.</p></div>' +
    '<div class="card"><h2>Income vs spending</h2><p class="sub">Green is money in, terracotta is money out</p>' +
    '<canvas class="chart" id="bars" width="900" height="300"></canvas></div>' +
    '<div class="grid cols-2" style="margin-top:16px"><div class="card"><h2>Month by month</h2>' +
    '<table><thead><tr><th>Month</th><th class="num">Income</th><th class="num">Spent</th><th class="num">Kept</th></tr></thead><tbody>' +
    rows.map((r) => '<tr><td>' + esc(r.month) + '</td><td class="num">' + fmt(r.income) + '</td>' +
      '<td class="num">' + fmt(r.spent) + '</td><td class="num"><strong>' + fmt(r.income - r.spent) + '</strong></td></tr>').join('') +
    '</tbody></table></div>' +
    '<div class="card"><h2>What the numbers say</h2>' +
    '<div class="kv"><span>Best saving month</span><b>' + esc(best.month) + ' — ' + fmt(best.income - best.spent) + ' kept</b></div>' +
    '<div class="kv"><span>Average kept per month</span><b>' + fmt(Math.round(rows.reduce((s, r) => s + r.income - r.spent, 0) / rows.length)) + '</b></div>' +
    '<div class="kv"><span>Biggest single category</span><b>Housing — ' + fmt(1650) + ' / month</b></div>' +
    '<div class="kv"><span>Emergency fund cover</span><b>4.9 months of essentials</b></div>' +
    '<div class="tip" style="margin-top:14px"><p><strong>Next month&rsquo;s move:</strong> ' + esc(BUDGET_DATA.tips[1]) + '</p></div>' +
    '<div class="tip" style="margin-top:10px"><p><strong>The trend:</strong> ' + esc(BUDGET_DATA.tips[2]) + '</p></div>' +
    '</div></div>';
  drawMonthBars(document.getElementById('bars'), rows.map((r) => ({ label: r.month, a: r.income, b: r.spent })));
}

/* ---------------- Router ---------------- */
function route() {
  const hash = location.hash.replace(/^#\/?/, '');
  const page = hash.split('/')[0];
  setActiveNav(page === '' ? '' : page);
  window.scrollTo(0, 0);
  if (page === 'budget') renderBudget();
  else if (page === 'transactions') renderTransactions('All categories');
  else if (page === 'goals') renderGoals();
  else if (page === 'reports') renderReports();
  else renderDashboard();
}

window.addEventListener('hashchange', route);
route();
