import type { CoinResult } from './types';

export function flipCoin(): CoinResult {
  const bytes = new Uint8Array(1);
  crypto.getRandomValues(bytes);
  return (bytes[0] & 1) === 0 ? 'heads' : 'tails';
}
