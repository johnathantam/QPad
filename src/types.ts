interface Bar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Trade {
  date: string;
  symbol: string;
  action: 'buy' | 'sell';
  size: number;
  price: number;
}

interface EquityPoint {
  date: string;
  equity: number;
}

interface BacktestResult {
  trades: Trade[];
  positions: Record<string, number>;
  final_cash: number;
  equity_curve: EquityPoint[];
}

export type {
  Bar,
  Trade,
  EquityPoint,
  BacktestResult
}