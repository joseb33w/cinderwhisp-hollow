export type CoinResult = 'heads' | 'tails';

export interface FlipRow {
  id: string;
  user_id: string;
  result: CoinResult;
  flipped_at: string;
}

export interface FlipTotals {
  heads: number;
  tails: number;
  total: number;
}
