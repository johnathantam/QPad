import "./header.css";
import { useEffect, useState } from "react";
import { getAllInstrumentIds } from "../../lib/loadData";
import { StockCarousel } from "./stockCarousel/StockCarousel";

function Header() {
    const [instrumentIds, setInstrumentIds] = useState<string[]>([]);

    useEffect(() => {
        async function loadSymbols() {
            const symbols = await getAllInstrumentIds();
            setInstrumentIds(symbols);
        }
        loadSymbols();
    }, []); 

    return (
        <>
            <header className="header-container">
                <div className="header-icon"></div>

                <h1 className="header-title">Qoller Pad</h1>

                <div className="header-carousel-container">
                    <StockCarousel
                        tickers={instrumentIds}
                    ></StockCarousel>
                </div>
            </header>
        </>
    )
}

export { Header }