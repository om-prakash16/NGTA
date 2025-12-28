import { Stock } from "@/hooks/useStocks";

export type FilterType = "text" | "number" | "enum";

export interface FilterState {
    type: FilterType;
    selectedValues?: string[]; // For text/enum
    min?: number; // For number
    max?: number; // For number
}

export const enrichStockData = (data: Stock[]): Stock[] => {
    return data.map(stock => {
        // Avoid re-enriching if already done (check if derived exists and has keys)
        if (stock.derived && stock.derived.indicatorsList) return stock;

        // 3D Average Strength Logic
        let strength3D = "Neutral";
        if (stock.history.avg_3day > 0.5) strength3D = "Strong Buyers";
        else if (stock.history.avg_3day < -0.5) strength3D = "Strong Sellers";

        // Indicators Composite
        const indicatorsList: string[] = [];
        if (stock.indicators.macd_status === "above") indicatorsList.push("MACD Above");
        if (stock.indicators.macd_status === "below") indicatorsList.push("MACD Below");
        if (stock.indicators.macd_status === "neutral") indicatorsList.push("MACD Neutral");

        if (stock.indicators.rsi_zone === "overbought") indicatorsList.push("RSI Over");
        if (stock.indicators.rsi_zone === "oversold") indicatorsList.push("RSI Under");
        if (stock.indicators.rsi_zone === "neutral") indicatorsList.push("RSI Neutral");

        return {
            ...stock,
            current_strength: stock.current_strength || "Balanced",
            day1_strength: stock.day1_strength || "Balanced",
            day2_strength: stock.day2_strength || "Balanced",
            day3_strength: stock.day3_strength || "Balanced",
            avg_3day_strength: stock.avg_3day_strength || "Balanced",
            derived: {
                strength3D,
                indicatorsList,
                macdLabel: stock.indicators.macd_status === "above" ? "Above" :
                    stock.indicators.macd_status === "below" ? "Below" : "Neutral",
                rsiLabel: stock.indicators.rsi_zone === "overbought" ? "Over" :
                    stock.indicators.rsi_zone === "oversold" ? "Under" : "Neutral",

                // Keep this for compatibility if used elsewhere, but we fixed the root ones above
                strengthLabel: stock.indicators.strength_label === "buyers" ? "Buyers Dominating" :
                    stock.indicators.strength_label === "sellers" ? "Sellers Dominating" : "Balanced"
            }
        };
    });
};

export const globalFilter = (data: Stock[], filters: Record<string, any>): Stock[] => {
    if (!data || !filters) return data || [];

    // Data should be enriched before passing here, but we can access properties safely
    return data.filter(stock => {
        // Handle "Quick Filters" (boolean flags from FilterDrawer)

        if (filters.sector && stock.sector !== filters.sector) return false;

        if (filters.min_price && stock.current_price < Number(filters.min_price)) return false;
        if (filters.max_price && stock.current_price > Number(filters.max_price)) return false;

        if (filters.min_change_pct && stock.current_change < Number(filters.min_change_pct)) return false;
        if (filters.max_change_pct && stock.current_change > Number(filters.max_change_pct)) return false;

        if (filters.min_day1_pct && stock.history.p_day1 < Number(filters.min_day1_pct)) return false;
        if (filters.max_day1_pct && stock.history.p_day1 > Number(filters.max_day1_pct)) return false;

        if (filters.min_day2_pct && stock.history.p_day2 < Number(filters.min_day2_pct)) return false;
        if (filters.max_day2_pct && stock.history.p_day2 > Number(filters.max_day2_pct)) return false;

        if (filters.min_day3_pct && stock.history.p_day3 < Number(filters.min_day3_pct)) return false;
        if (filters.max_day3_pct && stock.history.p_day3 > Number(filters.max_day3_pct)) return false;

        if (filters.min_avg_3day_pct && stock.history.avg_3day < Number(filters.min_avg_3day_pct)) return false;
        if (filters.max_avg_3day_pct && stock.history.avg_3day > Number(filters.max_avg_3day_pct)) return false;

        if (filters.constant_only && !stock.flags.is_constant_price) return false;
        if (filters.gainers_only && stock.current_change <= 0) return false;
        if (filters.losers_only && stock.current_change >= 0) return false;
        if (filters.high_volume_only && !stock.flags.is_high_volume) return false;

        if (filters.macd_status && stock.indicators.macd_status !== filters.macd_status) return false;
        if (filters.rsi_zone && stock.indicators.rsi_zone !== filters.rsi_zone) return false; // Fixed: rsi_zone property
        if (filters.strength && stock.indicators.strength_label !== filters.strength) return false;

        return true;
    });
};

// Helper for Column Filters (used inside Table)
export const applyColumnFilters = (data: any[], columnFilters: Record<string, FilterState>) => {
    return data.filter(item => {
        return Object.entries(columnFilters).every(([key, filter]) => {
            let value: any;

            // Map keys to values (using dot notation support)
            value = key.split('.').reduce((o, i) => o?.[i], item);

            if (filter.type === "number") {
                if (typeof value !== "number") return false;
                if (filter.min !== undefined && value < filter.min) return false;
                if (filter.max !== undefined && value > filter.max) return false;
                return true;
            } else {
                // Text/Enum
                if (!filter.selectedValues || filter.selectedValues.length === 0) return true;

                // Handle Array values (if cell contains multiple items)
                if (Array.isArray(value)) {
                    return value.some(v => filter.selectedValues?.some(f => String(v).toUpperCase() === f.toUpperCase()));
                }

                // Standard String Value
                const cellValue = String(value).toUpperCase().trim();
                return filter.selectedValues.some(f => cellValue === f.toUpperCase().trim());
            }
        });
    });
};
