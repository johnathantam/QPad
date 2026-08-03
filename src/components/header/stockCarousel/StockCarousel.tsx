import "./stockCarousel.css";

interface StockCarouselProps {
    tickers: string[];
}

function StockCarousel({ tickers }: StockCarouselProps) {
    // Duplicate the list so the loop is seamless
    const items = [...tickers, ...tickers];

    return (
        <div className="ticker-viewport">
            <div className="ticker-track">
                {items.map((ticker, i) => (
                    <span className="ticker-item" key={i}>
                        {ticker}
                    </span>
                ))}
            </div>
        </div>
    );
}

export { StockCarousel };