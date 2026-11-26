# Hearth & Ledger — Household Budget

[![make.fun](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/jawaddevisser-coder/makefun-best-household-budget-site/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/jawaddevisser-coder/makefun-best-household-budget-site/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)

Entry for the [best household budget site bounty](https://make.fun/bounty/best-household-budget-site-20261126-1457) on make.fun.

## What it is

**Hearth & Ledger** is a working household budget site for one family — the
Alvarezes (Maya, Daniel, Sofia, and Leo) — keeping their November 2026 money
in order. Plain static files under `app/`, no build step, no network requests:
open `app/index.html` in any browser and it works, on desktop and on a phone.

## Pages (all reached from the top navigation)

- **Dashboard** — income, spending, and money left to assign for the month;
  a donut chart of spending by category; bills coming up; recent transactions.
- **Budget** — every category with its plan, actual spending, a progress bar,
  and over/under status. Planned amounts are editable and totals update live.
- **Transactions** — the full spending list, filterable by category, with a
  working add form and a remove button on every row.
- **Savings goals** — four goals with progress bars; "Add $50" / "Add $175"
  buttons move the bars at once, and new goals can be added.
- **Reports** — six months of income vs. spending as a bar chart, a
  month-by-month table, and plain-language notes on what the numbers say.

Changes are saved in the browser only (localStorage); the seeded figures are
the household's real November 2026 numbers.

## Files

- `app/index.html` — page shell and navigation
- `app/style.css` — the site's own look (deep green, cream paper, terracotta)
- `app/data.js` — the household's figures: income, categories, transactions, goals, six months of history
- `app/charts.js` — small canvas charts (donut, grouped bars), no library
- `app/app.js` — hash router, views, and every control's behaviour
- `main.ts` — hand-in program: copies `app/` and `screenshots/` to the output
  directory and writes `dossier.json` with the vendored make.fun library

## Run it

Serve `app/` with any static server, e.g. `python3 -m http.server` from
`app/`, then open http://localhost:8000/ — or open `app/index.html` directly.

## License

MIT — see `LICENSE`.
