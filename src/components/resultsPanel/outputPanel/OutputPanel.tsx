import { useMemo, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from "recharts";
import { useCodeEditorStore } from "../../../store/useCodeEditorStore";
import { type Trade, type EquityPoint } from "../../../types";
import "./outputPanel.css";

const STARTING_CASH = 100000;
const PAGE = 15;

// ─── Stat computation ───────────────────────────────────────────────────────
// The Python harness only returns raw trades/equity_curve — no derived stats —
// so we compute them here once per result, rather than in the hot backtest loop.

function computeStats(equityCurve: EquityPoint[], trades: Trade[]) {
  if (equityCurve.length === 0) {
    return null;
  }

  const finalEquity = equityCurve[equityCurve.length - 1].equity;
  const totalReturn = ((finalEquity - STARTING_CASH) / STARTING_CASH) * 100;

  let peak = equityCurve[0].equity;
  let maxDd = 0;
  for (const point of equityCurve) {
    if (point.equity > peak) peak = point.equity;
    const dd = ((peak - point.equity) / peak) * 100;
    if (dd > maxDd) maxDd = dd;
  }

  const filledTrades = trades.filter((t) => t.action === "buy" || t.action === "sell");
  const rejectedTrades = trades.filter((t) => t.action.includes("rejected"));

  return {
    finalEquity,
    totalReturn,
    maxDd,
    totalTrades: filledTrades.length,
    rejectedTrades: rejectedTrades.length,
  };
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function StatCard({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" | "neutral" }) {
  return (
    <div className="output-stat-card">
      <div className="output-stat-label">{label}</div>
      <div className={`output-stat-value ${tone ?? "neutral"}`}>{value}</div>
    </div>
  );
}

function EquityChart({ data }: { data: EquityPoint[] }) {
  return (
    <div className="output-chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 6" stroke="#e5e5ea" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#858585", fontFamily: "'DM Mono', monospace" }}
            tickLine={false}
            axisLine={false}
            interval={Math.max(0, Math.floor(data.length / 6))}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#858585", fontFamily: "'DM Mono', monospace" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            width={46}
          />
          <Tooltip
            contentStyle={{
              background: "#1a1a1a",
              border: "1px solid #333",
              borderRadius: 5,
              fontSize: 11,
              fontFamily: "'DM Mono', monospace",
              color: "#fff",
            }}
            formatter={(v) => [`$${Number(v).toLocaleString()}`, "Equity"]}
          />
          <Area type="monotone" dataKey="equity" stroke="#22c55e" strokeWidth={1.5} fill="url(#equityGradient)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function TradeLog({ trades }: { trades: Trade[] }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(trades.length / PAGE);
  const paged = trades.slice(page * PAGE, page * PAGE + PAGE);

  if (trades.length === 0) {
    return <div className="output-empty">No trades were recorded for this run.</div>;
  }

  return (
    <div className="output-trade-log">
      <div className="output-trade-log-scroll">
        <table className="output-trade-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Symbol</th>
              <th>Action</th>
              <th>Size</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((t, i) => (
              <tr key={i} className={t.action.includes("rejected") ? "rejected" : t.action}>
                <td>{t.date}</td>
                <td>{t.instrumentId}</td>
                <td>{t.action.replace("_", " ")}</td>
                <td>{t.size}</td>
                <td>${t.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="output-trade-pagination">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>← Prev</button>
          <span>{page + 1} / {totalPages}</span>
          <button disabled={page === totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

function OutputPanel() {
  const result = useCodeEditorStore((s) => s.backtestResult);

  const stats = useMemo(() => {
    if (!result) return null;
    return computeStats(result.equity_curve, result.trades);
  }, [result]);

  if (!result || !stats) {
    return (
      <div className="output-tab-placeholder">
        <span>Charts and stats will show up here after a run.</span>
      </div>
    );
  }

  return (
    <div className="output-panel-container">
      <div className="output-stats-row">
        <StatCard
          label="Total Return"
          value={`${stats.totalReturn >= 0 ? "+" : ""}${stats.totalReturn.toFixed(2)}%`}
          tone={stats.totalReturn > 0 ? "up" : stats.totalReturn < 0 ? "down" : "neutral"}
        />
        <StatCard label="Final Equity" value={`$${stats.finalEquity.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
        <StatCard label="Max Drawdown" value={`-${stats.maxDd.toFixed(2)}%`} tone="down" />
        <StatCard label="Trades" value={`${stats.totalTrades}`} />
        <StatCard label="Rejected" value={`${stats.rejectedTrades}`} tone={stats.rejectedTrades > 0 ? "down" : "neutral"} />
      </div>

      <EquityChart data={result.equity_curve} />

      <TradeLog trades={result.trades} />
    </div>
  );
}

export { OutputPanel };