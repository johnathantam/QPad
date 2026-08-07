import pandas as pd

class Strategy:
    def __init__(self):
        self.trades = []
        self.positions = {}
        self.cash = 100000.0
        self.equity_curve = []
        self.current_bars = {}
        self.current_date = None
        self._commission = 0.0
        self._slippage_percentage = 0.0

    def on_start(self):
        pass

    def on_bar(self, date, bars):
        pass

    def buy(self, symbol, size):
        raw_price = self._current_bars[symbol]["close"]
        price = raw_price * (1 + self._slippage_percentage)
        cost = price * size + self._commission
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
        self.trades.append({
            "date": self._current_date,
            "symbol": symbol,
            "action": "buy",
            "size": size,
            "price": price,
            "commission": self._commission
        })

    def sell(self, symbol, size):
        current_position = self.positions.get(symbol, 0)
        raw_price = self._current_bars[symbol]["close"]
        price = raw_price * (1 - self._slippage_percentage)
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
        proceeds = price * size - self._commission
        self.cash += proceeds
        self.positions[symbol] = current_position - size
        self.trades.append({
            "date": self._current_date,
            "symbol": symbol,
            "action": "sell",
            "size": size,
            "price": price,
            "commission": self._commission
        })


def align_data(raw_data):
    frames = {}
    for symbol, bars in raw_data.items():
        df = pd.DataFrame(bars)
        df["date"] = pd.to_datetime(df["date"])
        df.set_index("date", inplace=True)
        frames[symbol] = df
    all_dates = sorted(set().union(*[df.index for df in frames.values()]))

    # Reindex every frame to the full date union ONCE, then pull out
    # plain numpy arrays. Positional array access is much cheaper
    # than repeated pandas .loc[date] lookups inside the hot loop.
    aligned = {}
    for symbol, df in frames.items():
        reindexed = df.reindex(all_dates)
        aligned[symbol] = {
            "open": reindexed["open"].to_numpy(),
            "high": reindexed["high"].to_numpy(),
            "low": reindexed["low"].to_numpy(),
            "close": reindexed["close"].to_numpy(),
            "volume": reindexed["volume"].to_numpy(),
            "valid": reindexed["close"].notna().to_numpy(),  # was there real data this day?
        }
    return aligned, all_dates


def run_backtest(strategy_cls, backtestSettings, raw_data):
    settings = backtestSettings or {}
    starting_capital = float(settings.get("startingCapital", 100000.0))
    commission = float(settings.get("commissionPerTrade", 0.0))
    slippage_percentage = float(settings.get("slippagePercentage", 0.0)) / 100.0
    start_date = settings.get("startDate")
    end_date = settings.get("endDate")

    aligned, all_dates = align_data(raw_data)

    # figure out the index range once, instead of filtering the date list per-day
    start_idx, end_idx = 0, len(all_dates)
    if start_date:
        start_ts = pd.Timestamp(start_date)
        start_idx = next((i for i, d in enumerate(all_dates) if d >= start_ts), len(all_dates))
    if end_date:
        end_ts = pd.Timestamp(end_date)
        end_idx = next((i for i, d in enumerate(all_dates) if d > end_ts), len(all_dates))

    strat = strategy_cls()
    strat.cash = starting_capital
    strat._commission = commission
    strat._slippage_percentage = slippage_percentage
    strat.on_start()

    for i in range(start_idx, end_idx):
        date = all_dates[i]
        bars_today = {}
        for symbol, arrs in aligned.items():
            if arrs["valid"][i]:
                bars_today[symbol] = {
                    "open": float(arrs["open"][i]),
                    "high": float(arrs["high"][i]),
                    "low": float(arrs["low"][i]),
                    "close": float(arrs["close"][i]),
                    "volume": float(arrs["volume"][i]),
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
    pnl_percentage = ((final_equity - starting_capital) / starting_capital) * 100

    _emit_log(
        f"Backtest complete — {total_trades} trades filled, {rejected} rejected, "
        f"final equity ${final_equity:,.2f} ({pnl_percentage:+.2f}%)",
        "success"
    )

    return {
        "trades": strat.trades,
        "positions": strat.positions,
        "final_cash": strat.cash,
        "equity_curve": strat.equity_curve,
    }