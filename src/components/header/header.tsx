import "./header.css";
import { StockCarousel } from "./stockCarousel/StockCarousel";

function Header() {
    return (
        <>
            <header className="header-container">
                <div className="header-icon"></div>

                <h1 className="header-title">Roller Pad</h1>

                <div className="header-carousel-container">
                    <StockCarousel
                        tickers={[
                            "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA",
                            "META", "TSLA", "AVGO", "ORCL", "NFLX",
                            "AMD", "CRM", "ADBE", "INTC", "QCOM",
                            "JPM", "BAC", "GS", "V", "MA",
                            "WMT", "COST", "DIS", "NKE", "SBUX",
                            "XOM", "CVX", "BA", "CAT", "GE",
                            "SPY", "QQQ", "DIA", "BTC-USD", "ETH-USD",
                        ]}
                    ></StockCarousel>
                </div>
            </header>
        </>
    )
}

export { Header }