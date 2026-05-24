import type { CoinResult } from '../lib/types';

export interface CoinHandle {
  el: HTMLElement;
  flipTo(result: CoinResult): Promise<void>;
  setFace(result: CoinResult): void;
  setBusy(busy: boolean): void;
}

const FLIP_DURATION_MS = 1200;
const REST_ROTATION: Record<CoinResult, number> = { heads: 0, tails: 180 };

export function createCoin(opts: { initialFace?: CoinResult; onTap: () => void; }): CoinHandle {
  const wrapper = document.createElement('div');
  wrapper.className = 'coin-stage flex flex-col items-center justify-center select-none';

  const coin = document.createElement('button');
  coin.type = 'button';
  coin.className = 'coin focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/60 rounded-full';
  coin.setAttribute('aria-label', 'Flip the coin');
  const initial: CoinResult = opts.initialFace ?? 'heads';
  coin.dataset.face = initial;
  coin.style.transform = `rotateY(${REST_ROTATION[initial]}deg)`;

  const heads = document.createElement('div');
  heads.className = 'coin__face coin__face--heads';
  heads.innerHTML = `<span class="coin__face-label">H</span><span class="coin__face-sub">HEADS</span>`;

  const tails = document.createElement('div');
  tails.className = 'coin__face coin__face--tails';
  tails.innerHTML = `<span class="coin__face-label">T</span><span class="coin__face-sub">TAILS</span>`;

  const edge = document.createElement('div');
  edge.className = 'coin__edge';

  coin.append(edge, heads, tails);

  const shadow = document.createElement('div');
  shadow.className = 'coin-shadow';

  wrapper.append(coin, shadow);

  let busy = false;
  let currentRotation = REST_ROTATION[initial];

  coin.addEventListener('click', () => { if (busy) return; opts.onTap(); });

  function flipTo(result: CoinResult): Promise<void> {
    coin.classList.add('is-flipping');
    coin.dataset.target = result;
    const spins = 5;
    const start = currentRotation;
    const endBase = result === 'heads' ? 0 : 180;
    const end = start + spins * 360 + ((endBase - (start % 360) + 360) % 360);
    const anim = coin.animate(
      [
        { transform: `rotateY(${start}deg) translateY(0)` },
        { transform: `rotateY(${start + 360 * 3}deg) translateY(-40px) scale(1.05)`, offset: 0.4 },
        { transform: `rotateY(${start + 360 * 4 + 90}deg) translateY(-12px) scale(1.02)`, offset: 0.7 },
        { transform: `rotateY(${end}deg) translateY(0)` },
      ],
      { duration: FLIP_DURATION_MS, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)', fill: 'forwards' },
    );
    return new Promise<void>((resolve) => {
      const done = () => {
        currentRotation = end;
        anim.cancel();
        coin.style.transform = `rotateY(${end}deg)`;
        coin.classList.remove('is-flipping');
        coin.dataset.face = result;
        delete coin.dataset.target;
        resolve();
      };
      anim.onfinish = done;
      anim.oncancel = () => resolve();
      window.setTimeout(() => { if (coin.classList.contains('is-flipping')) done(); }, FLIP_DURATION_MS + 400);
    });
  }

  function setFace(result: CoinResult) {
    coin.dataset.face = result;
    currentRotation = REST_ROTATION[result];
    coin.style.transform = `rotateY(${currentRotation}deg)`;
  }

  function setBusy(b: boolean) {
    busy = b;
    coin.setAttribute('aria-disabled', String(b));
  }

  return { el: wrapper, flipTo, setFace, setBusy };
}
