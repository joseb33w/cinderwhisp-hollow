import { createCoin } from '../components/Coin';
import { createScoreBoard } from '../components/ScoreBoard';
import { createRecentStrip } from '../components/RecentStrip';
import { deleteAllFlips, fetchRecentFlips, fetchTotals, insertFlip, signOut } from '../lib/supabase';
import { flipCoin } from '../lib/rng';
import type { CoinResult, FlipRow, FlipTotals } from '../lib/types';

export interface HomeHandle { el: HTMLElement; destroy(): void; }

export function createHome(user: { id: string; email: string | null }): HomeHandle {
  const wrap = document.createElement('div');
  wrap.className = 'w-full max-w-md mx-auto flex flex-col gap-6 sm:gap-8 items-center';

  const header = document.createElement('header');
  header.className = 'w-full flex items-center justify-between gap-3';
  header.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="text-2xl">🪙</span>
      <span class="font-bold text-base">Coin Flipper</span>
    </div>
    <div class="flex items-center gap-2">
      <span class="hidden sm:inline text-xs text-slate-400 truncate max-w-[140px]" title="${user.email ?? ''}">${user.email ?? ''}</span>
      <button data-signout class="text-xs rounded-md px-2.5 py-1.5 bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition">Sign out</button>
    </div>
  `;

  const score = createScoreBoard();
  score.setLoading(true);
  const recent = createRecentStrip();

  let totals: FlipTotals = { heads: 0, tails: 0, total: 0 };
  let latestFlips: FlipRow[] = [];

  const result = document.createElement('div');
  result.className = 'h-6 text-center text-sm font-medium tracking-wide text-slate-300';
  result.setAttribute('aria-live', 'polite');

  const coin = createCoin({ initialFace: 'heads', onTap: () => void onFlip() });

  const actions = document.createElement('div');
  actions.className = 'flex items-center gap-3';

  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'text-xs rounded-lg px-3.5 py-2 bg-rose-500/10 border border-rose-400/30 text-rose-300 hover:bg-rose-500/20 transition disabled:opacity-50';
  resetBtn.textContent = 'Reset totals';
  actions.append(resetBtn);

  wrap.append(header, score.el, coin.el, result, recent.el, actions);

  const signoutBtn = header.querySelector('[data-signout]') as HTMLButtonElement;
  signoutBtn.addEventListener('click', async () => {
    signoutBtn.disabled = true;
    try { await signOut(); } catch (e) { signoutBtn.disabled = false; console.error(e); }
  });

  resetBtn.addEventListener('click', () => void onReset());

  async function refresh(): Promise<void> {
    try {
      const [t, recentRows] = await Promise.all([fetchTotals(), fetchRecentFlips(5)]);
      totals = t; latestFlips = recentRows;
      score.setLoading(false); score.render(totals); recent.render(latestFlips);
      if (latestFlips[0]) coin.setFace(latestFlips[0].result);
    } catch (err) {
      score.setLoading(false);
      const msg = err instanceof Error ? err.message : 'Failed to load';
      result.textContent = `⚠ ${msg}`;
      result.className = 'h-6 text-center text-sm font-medium tracking-wide text-rose-400';
    }
  }

  async function onFlip(): Promise<void> {
    coin.setBusy(true); resetBtn.disabled = true; result.textContent = '';
    const target: CoinResult = flipCoin();
    const animation = coin.flipTo(target);
    const dbWrite = insertFlip(target, user.id).catch((err) => { console.error('Failed to save flip', err); return null; });
    const [, row] = await Promise.all([animation, dbWrite]);
    if (!row) {
      result.textContent = '⚠ Could not save flip';
      result.className = 'h-6 text-center text-sm font-medium tracking-wide text-rose-400';
      coin.setBusy(false); resetBtn.disabled = false; return;
    }
    totals = {
      heads: totals.heads + (target === 'heads' ? 1 : 0),
      tails: totals.tails + (target === 'tails' ? 1 : 0),
      total: totals.total + 1,
    };
    latestFlips = [row, ...latestFlips].slice(0, 5);
    score.render(totals); recent.render(latestFlips);
    result.textContent = target === 'heads' ? '✨ Heads' : '✨ Tails';
    result.className = 'h-6 text-center text-sm font-semibold tracking-wide result-flash ' + (target === 'heads' ? 'text-amber-300' : 'text-slate-200');
    coin.setBusy(false); resetBtn.disabled = false;
  }

  async function onReset(): Promise<void> {
    if (totals.total === 0) return;
    const ok = window.confirm('Delete all your flips? This cannot be undone.');
    if (!ok) return;
    resetBtn.disabled = true; coin.setBusy(true);
    try {
      await deleteAllFlips(user.id);
      totals = { heads: 0, tails: 0, total: 0 }; latestFlips = [];
      score.render(totals); recent.render(latestFlips);
      result.textContent = '🧹 Reset';
      result.className = 'h-6 text-center text-sm font-medium tracking-wide text-slate-400 result-flash';
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Reset failed';
      result.textContent = `⚠ ${msg}`;
      result.className = 'h-6 text-center text-sm font-medium tracking-wide text-rose-400';
    } finally {
      resetBtn.disabled = false; coin.setBusy(false);
    }
  }

  void refresh();

  return { el: wrap, destroy() { wrap.remove(); } };
}
