import type { FlipTotals } from '../lib/types';

export interface ScoreBoardHandle {
  el: HTMLElement;
  render(totals: FlipTotals): void;
  setLoading(loading: boolean): void;
}

export function createScoreBoard(): ScoreBoardHandle {
  const wrap = document.createElement('div');
  wrap.className = 'flex items-center justify-center gap-3 sm:gap-4 text-sm sm:text-base font-medium tracking-wide';
  wrap.setAttribute('role', 'status');
  wrap.setAttribute('aria-live', 'polite');

  const cell = (label: string, color: string) => {
    const c = document.createElement('div');
    c.className = `px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur ${color}`;
    c.innerHTML = `<span class="text-[0.65rem] sm:text-xs uppercase tracking-[0.18em] text-slate-400 block leading-none mb-1">${label}</span><span data-value class="text-lg sm:text-xl font-bold tabular-nums">0</span>`;
    return c;
  };

  const heads = cell('Heads', 'text-amber-300');
  const tails = cell('Tails', 'text-slate-200');
  const total = cell('Total', 'text-indigo-300');
  wrap.append(heads, tails, total);

  let loading = false;

  const render = (t: FlipTotals) => {
    if (loading) return;
    (heads.querySelector('[data-value]') as HTMLElement).textContent = String(t.heads);
    (tails.querySelector('[data-value]') as HTMLElement).textContent = String(t.tails);
    (total.querySelector('[data-value]') as HTMLElement).textContent = String(t.total);
  };

  const setLoading = (l: boolean) => {
    loading = l;
    [heads, tails, total].forEach((c) => c.classList.toggle('animate-pulse', l));
  };

  return { el: wrap, render, setLoading };
}
