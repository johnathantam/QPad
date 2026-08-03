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
        cost = price * size
        if cost > self.cash:
            _emit_log(f"{self._current_date}: BUY REJECTED {symbol} x{size} — insufficient cash", "error")
            self.trades.append({
                "date": self._current_date,
                "symbol": symbol,
                "action": "buy_rejected",
                "size": size,
                "price": price
            })
            return
        self.cash -= cost
        self.positions[symbol] = self.positions.get(symbol, 0) + size
        _emit_log(f"{self._current_date}: BUY {symbol} x{size} @ {price:.2f}", "success")
        self.trades.append({
            "date": self._current_date,
            "symbol": symbol,
            "action": "buy",
            "size": size,
            "price": price
        })

    def sell(self, symbol, size):
        current_position = self.positions.get(symbol, 0)
        price = self._current_bars[symbol]["close"]
        if size > current_position:
            _emit_log(f"{self._current_date}: SELL REJECTED {symbol} x{size} — insufficient position (have {current_position})", "error")
            self.trades.append({
                "date": self._current_date,
                "symbol": symbol,
                "action": "sell_rejected",
                "size": size,
                "price": price
            })
            return
        self.cash += price * size
        self.positions[symbol] = current_position - size
        _emit_log(f"{self._current_date}: SELL {symbol} x{size} @ {price:.2f}", "success")
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

    total_trades = sum(1 for t in strat.trades if t["action"] in ("buy", "sell"))
    rejected = sum(1 for t in strat.trades if "rejected" in t["action"])
    final_equity = strat.equity_curve[-1]["equity"] if strat.equity_curve else strat.cash
    pnl_pct = ((final_equity - 100000.0) / 100000.0) * 100

    _emit_log(
        f"Backtest complete — {total_trades} trades filled, {rejected} rejected, "
        f"final equity ${final_equity:,.2f} ({pnl_pct:+.2f}%)",
        "success"
    )

    return {
        "trades": strat.trades,
        "positions": strat.positions,
        "final_cash": strat.cash,
        "equity_curve": strat.equity_curve,
    }