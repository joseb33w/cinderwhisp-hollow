import type { FlipRow } from '../lib/types';

export interface RecentStripHandle {
  el: HTMLElement;
  render(flips: FlipRow[]): void;
}

export function createRecentStrip(): RecentStripHandle {
  const wrap = document.createElement('div');
  wrap.className = 'flex flex-col items-center gap-2';
  const label = document.createElement('div');
  label.className = 'text-[0.65rem] uppercase tracking-[0.22em] text-slate-500';
  label.textContent = 'Last 5 flips';
  const strip = document.createElement('div');
  strip.className = 'flex items-center gap-2 min-h-[2.25rem]';
  strip.setAttribute('aria-label', 'Recent flips');
  wrap.append(label, strip);

  const render = (flips: FlipRow[]) => {
    strip.innerHTML = '';
    if (flips.length === 0) {
      const empty = document.createElement('span');
      empty.className = 'text-xs text-slate-500 italic';
      empty.textContent = 'No flips yet — tap the coin';
      strip.append(empty);
      return;
    }
    for (const flip of flips) {
      const pill = document.createElement('span');
      const isHeads = flip.result === 'heads';
      pill.className = `pill ${isHeads ? 'pill--heads' : 'pill--tails'}`;
      pill.textContent = isHeads ? 'H' : 'T';
      pill.title = `${isHeads ? 'Heads' : 'Tails'} • ${new Date(flip.flipped_at).toLocaleString()}`;
      strip.append(pill);
    }
  };

  return { el: wrap, render };
}
