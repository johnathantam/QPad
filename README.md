# QPad

A browser-based backtesting game. Write a Python trading strategy, run it against historical price data, and see how you did — all in-browser, no backend.

## How it works

- Write a `Strategy` subclass in the built-in code editor (`on_start`, `on_bar`, `buy`, `sell`)
- Configure starting capital, commission, slippage, and date range in the Settings panel
- Runs entirely client-side via [Pyodide](https://pyodide.org/) (Python compiled to WebAssembly) in a Web Worker, so the UI never freezes
- View results as an equity curve, trade log, and summary stats (return, drawdown, trade count)

class MyStrategy(Strategy):
    def on_start(self):
        # runs once before the backtest begins — set up state here
        self.symbol = "AAPL"
        self.short_window = 10
        self.long_window = 30
        self.price_history = []

    def on_bar(self, date, bar):
        # runs once per day — bar is {symbol: {"open", "high", "low", "close", "volume"}}
        if self.symbol not in bar:
            return

        price = bar[self.symbol]["close"]
        self.price_history.append(price)

        if len(self.price_history) < self.long_window:
            return

        short_avg = sum(self.price_history[-self.short_window:]) / self.short_window
        long_avg = sum(self.price_history[-self.long_window:]) / self.long_window
        position = self.positions.get(self.symbol, 0)

        if short_avg > long_avg and position == 0:
            size = int((self.cash * 0.10) / price)
            if size > 0:
                self.buy(self.symbol, size)
        elif short_avg < long_avg and position > 0:
            self.sell(self.symbol, position)

## Stack

React + TypeScript + Vite, Zustand for state, Recharts for charts, Pyodide for Python execution.

