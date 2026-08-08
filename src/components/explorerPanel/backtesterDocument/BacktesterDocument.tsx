import "./backtesterDocument.css";

function BacktesterDocument() {
  return (
    <div className="backtester-docs">
      <p className="backtester-docs-paragraph">
        The backtester replays historical price data bar-by-bar, running your
        strategy logic at each step to simulate how it would have performed.
      </p>

      <div className="backtester-docs-block">
        <h3 className="backtester-docs-heading">How it works</h3>
        <ol className="backtester-docs-list">
          <li>Historical data is loaded for your selected ticker and date range.</li>
          <li>At each bar, your strategy's signals (buy/sell/hold) are evaluated.</li>
          <li>Fills are simulated based on your execution settings (next bar open, slippage, commission).</li>
          <li>Position size, risk limits, and equity are updated after each trade.</li>
          <li>Results are aggregated into performance stats and the equity curve.</li>
        </ol>
      </div>

      <div className="backtester-docs-block">
        <h3 className="backtester-docs-heading">Key settings</h3>
        <ul className="backtester-docs-list">
          <li><span className="backtester-docs-term">Starting Capital</span> — whether trades execute at the next bar's open or the current bar's close.</li>
          <li><span className="backtester-docs-term">Slippage</span> — the assumed price difference between signal and fill.</li>
          <li><span className="backtester-docs-term">Duration</span> — fixed dollar amount or percent of equity per trade.</li>
        </ul>
      </div>

      <p className="backtester-docs-note">
        Note: this backtest only covers the top 500 top companies from Wikipedia's top 500.
      </p>
    </div>
  );
}

export { BacktesterDocument };