import pandas as pd

class Strategy:
    def __init__(self):
        self.trades = []
        self.positions = {}             # instrument_id -> size
        self.cash = 100000.0            
        self.equity_curve = []
        self.current_bars = {}          # instrument_id -> bar dict (shape varies by instrument)
        self.current_date = None

    def on_start(self):
        pass

    def on_bar(self, date, bars):
        pass

    def buy(self, symbol, size):
        price = self._current_bars[symbol]["close"]
        self.cash -= price * size
        self.positions[symbol] = self.positions.get(symbol, 0) + size
        self.trades.append({
            "date": self._current_date, 
            "symbol": symbol,
            "action": "buy", 
            "size": size, 
            "price": price
        })

    def sell(self, symbol, size):
        price = self._current_bars[symbol]["close"]
        self.cash += price * size
        self.positions[symbol] = self.positions.get(symbol, 0) - size
        self.trades.append({
            "date": self._current_date, 
            "symbol": symbol,
            "action": "sell", 
            "size": size, 
            "price": price
        })


def align_data(raw_data):
    frames = {}
    for symbol, bars in raw_data.items():
        df = pd.DataFrame(bars)
        df["date"] = pd.to_datetime(df["date"])
        df.set_index("date", inplace=True)
        frames[symbol] = df
    all_dates = sorted(set().union(*[df.index for df in frames.values()]))
    return frames, all_dates


def run_backtest(strategy_cls, raw_data):
    frames, all_dates = align_data(raw_data)
    strat = strategy_cls()
    strat.on_start()

    for date in all_dates:
        bars_today = {}
        for symbol, df in frames.items():
            if date in df.index:
                row = df.loc[date]
                bars_today[symbol] = {
                    "open": float(row["open"]), "high": float(row["high"]),
                    "low": float(row["low"]), "close": float(row["close"]),
                    "volume": float(row["volume"]),
                }
        if not bars_today:
            continue

        date_str = str(date.date())
        strat._current_date = date_str
        strat._current_bars = bars_today
        strat.on_bar(date_str, bars_today)

        equity = strat.cash + sum(
            strat.positions.get(sym, 0) * bars_today[sym]["close"]
            for sym in bars_today if sym in strat.positions
        )
        strat.equity_curve.append({"date": date_str, "equity": equity})

    return {
        "trades": strat.trades,
        "positions": strat.positions,
        "final_cash": strat.cash,
        "equity_curve": strat.equity_curve,
    }