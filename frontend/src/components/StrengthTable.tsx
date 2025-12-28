"use client";

import { ArrowDown, ArrowUp, Minus, Star, Activity, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import AutoFilter, { FilterState } from "./AutoFilter";
import { applyColumnFilters } from "@/utils/globalFilter";
import { useToggleWatchlist, useWatchlist, StockStrength } from "@/hooks/useStocks";
import { getUniqueValues, getPctColor } from "@/utils/tableUtils";
import { StrengthMeter } from "@/components/ui/StrengthMeter";

interface StrengthTableProps {
    stocks: StockStrength[];
    isLoading: boolean;
    marketHeaders?: {
        current: string;
        p1: string;
        p2: string;
        p3: string;
    };
    // Controlled state props (optional)
    externalColumnFilters?: Record<string, FilterState>;
    onColumnFilterChange?: (filters: Record<string, FilterState>) => void;
}

export default function StrengthTable({ stocks, isLoading, marketHeaders, externalColumnFilters, onColumnFilterChange }: StrengthTableProps) {
    const router = useRouter();
    const [displayCount, setDisplayCount] = useState(50);

    // Default headers if not provided
    const headers = {
        current: marketHeaders?.current || "Today Change",
        p1: marketHeaders?.p1 || "Past Day 1 %",
        p2: marketHeaders?.p2 || "Past Day 2 %",
        p3: marketHeaders?.p3 || "Past Day 3 %"
    };

    // Client-side state (Fallbacks if not controlled)
    const [internalColumnFilters, setInternalColumnFilters] = useState<Record<string, FilterState>>({});

    // Derived: specific which filters to use
    const activeColumnFilters = externalColumnFilters || internalColumnFilters;

    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
        key: "history.avg_3day",
        direction: "asc"
    });

    const { data: watchlist } = useWatchlist();
    const { mutate: toggleWatchlist } = useToggleWatchlist();

    const isInWatchlist = (symbol: string) => {
        return watchlist?.some((s: any) => s.symbol === symbol);
    };

    const handleToggleWatchlist = (symbol: string) => {
        const action = isInWatchlist(symbol) ? "remove" : "add";
        toggleWatchlist({ symbol, action });
    };

    const handleRowClick = (symbol: string) => {
        router.push(`/stocks/${symbol}`);
    };

    const handleFilterChange = (key: string, filter: FilterState | null) => {
        const updateFn = (prev: Record<string, FilterState>) => {
            const next = { ...prev };
            if (filter === null) {
                delete next[key];
            } else {
                next[key] = filter;
            }
            return next;
        };

        if (onColumnFilterChange) {
            // Controlled mode: calculate next state and notify parent
            onColumnFilterChange(updateFn(activeColumnFilters));
        } else {
            // Uncontrolled mode: update local state
            setInternalColumnFilters(prev => updateFn(prev));
        }
    };

    const handleSort = (key: string, direction: "asc" | "desc") => {
        setSortConfig({ key, direction });
    };

    // Derived Data & Filtering
    const processedStocks = useMemo(() => {
        if (!stocks) return [];

        // 2. Apply Column Filters
        const filtered = applyColumnFilters(stocks, activeColumnFilters);

        // 3. Sort
        return filtered.sort((a, b) => {
            const { key, direction } = sortConfig;
            let valA: any, valB: any;

            // Special key handling for StrengthTable
            if (key === "current_change") valA = a.current_change;
            else if (key === "history.p_day1") valA = a.history?.p_day1;
            else if (key === "day1_strength") valA = a.day1_strength;
            else if (key === "history.p_day2") valA = a.history?.p_day2;
            else if (key === "day2_strength") valA = a.day2_strength;
            else if (key === "history.p_day3") valA = a.history?.p_day3;
            else if (key === "day3_strength") valA = a.day3_strength;
            else if (key === "history.avg_3day") valA = a.history?.avg_3day; // Capture value first
            else if (key === "avg_3day_strength") valA = a.avg_3day_strength;
            else if (key === "derived.macdLabel") valA = a.derived?.macdLabel;
            else if (key === "derived.rsiLabel") valA = a.derived?.rsiLabel;
            else if (key === "derived.indicatorsList") valA = a.derived?.indicatorsList;
            else {
                valA = key.split('.').reduce((o: any, i: any) => o?.[i], a);
            }

            // Capture B
            if (valB === undefined) {
                if (key === "current_change") valB = b.current_change;
                else if (key === "history.p_day1") valB = b.history?.p_day1;
                else if (key === "day1_strength") valB = b.day1_strength;
                else if (key === "history.p_day2") valB = b.history?.p_day2;
                else if (key === "day2_strength") valB = b.day2_strength;
                else if (key === "history.p_day3") valB = b.history?.p_day3;
                else if (key === "day3_strength") valB = b.day3_strength;
                else if (key === "history.avg_3day") valB = b.history?.avg_3day;
                else if (key === "avg_3day_strength") valB = b.avg_3day_strength;
                else if (key === "derived.macdLabel") valB = b.derived?.macdLabel;
                else if (key === "derived.rsiLabel") valB = b.derived?.rsiLabel;
                else if (key === "derived.indicatorsList") valB = b.derived?.indicatorsList;
                else {
                    valB = key.split('.').reduce((o: any, i: any) => o?.[i], b);
                }
            }

            // Special handling for Stability Rank (Absolute value close to 0)
            if (key === "history.avg_3day") {
                valA = Math.abs(valA || 0);
                valB = Math.abs(valB || 0);
            }

            if (valA === undefined || valA === null) return 1;
            if (valB === undefined || valB === null) return -1;

            if (valA < valB) return direction === "asc" ? -1 : 1;
            if (valA > valB) return direction === "asc" ? 1 : -1;
            return 0;
        });

    }, [stocks, activeColumnFilters, sortConfig]);

    const displayedStocks = processedStocks.slice(0, displayCount);

    const handleLoadMore = () => {
        setDisplayCount(prev => prev + 50);
    };

    const getOptions = (key: string) => {
        if (!stocks) return [];
        return getUniqueValues(stocks, key);
    };

    return (
        <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="w-full overflow-x-auto custom-scrollbar relative min-h-[600px]">
                <table className="w-full text-sm text-left border-separate border-spacing-0">
                    <thead className="text-xs uppercase bg-muted/50 text-muted-foreground font-semibold tracking-wider backdrop-blur-md sticky top-0 z-20">
                        <tr>
                            {/* 1. Symbol (w-24) - Sticky Left */}
                            <th className={cn("px-2 py-3 sticky left-0 z-30 bg-card/95 border-b border-white/5 w-24 shadow-[2px_0_5px_rgba(0,0,0,0.1)]")}>
                                <div className="flex items-center justify-between gap-1">
                                    <span>Symbol</span>
                                </div>
                            </th>
                            <th className="px-2 py-3 text-center border-b border-white/5 w-24">
                                <div className="flex items-center justify-center gap-1">
                                    <HeaderSort label={headers.current} field="current_change" onSort={handleSort} sortConfig={sortConfig} />
                                    <AutoFilter
                                        columnKey="current_change"
                                        title={headers.current}
                                        type="number"
                                        onFilter={(f) => handleFilterChange("current_change", f)}
                                        currentFilter={activeColumnFilters["current_change"] || null}
                                        onSort={(d) => handleSort("current_change", d)}
                                        sortDirection={sortConfig.key === "current_change" ? sortConfig.direction : null}
                                    />
                                </div>
                            </th>
                            {/* Today Str */}
                            <th className="px-2 py-3 text-center border-b border-white/5 w-28">
                                <div className="flex items-center justify-center gap-1">
                                    <span>Today Str</span>
                                    <AutoFilter
                                        columnKey="current_strength"
                                        title="Today Str"
                                        type="enum"
                                        options={getOptions("current_strength")}
                                        onFilter={(f) => handleFilterChange("current_strength", f)}
                                        currentFilter={activeColumnFilters["current_strength"] || null}
                                        onSort={(d) => handleSort("current_strength", d)}
                                        sortDirection={sortConfig.key === "current_strength" ? sortConfig.direction : null}
                                    />
                                </div>
                            </th>

                            {/* P1 Change */}
                            <th className="px-2 py-3 text-center border-b border-white/5 w-24">
                                <div className="flex items-center justify-center gap-1">
                                    <HeaderSort label={headers.p1} field="history.p_day1" onSort={handleSort} sortConfig={sortConfig} />
                                    <AutoFilter
                                        columnKey="history.p_day1"
                                        title={headers.p1}
                                        type="number"
                                        onFilter={(f) => handleFilterChange("history.p_day1", f)}
                                        currentFilter={activeColumnFilters["history.p_day1"] || null}
                                        onSort={(d) => handleSort("history.p_day1", d)}
                                        sortDirection={sortConfig.key === "history.p_day1" ? sortConfig.direction : null}
                                    />
                                </div>
                            </th>

                            {/* P1 Str */}
                            <th className="px-2 py-3 text-center border-b border-white/5 w-28">
                                <div className="flex items-center justify-center gap-1">
                                    <span>P1 Str</span>
                                    <AutoFilter
                                        columnKey="day1_strength"
                                        title="P1 Str"
                                        type="enum"
                                        options={getOptions("day1_strength")}
                                        onFilter={(f) => handleFilterChange("day1_strength", f)}
                                        currentFilter={activeColumnFilters["day1_strength"] || null}
                                        onSort={(d) => handleSort("day1_strength", d)}
                                        sortDirection={sortConfig.key === "day1_strength" ? sortConfig.direction : null}
                                    />
                                </div>
                            </th>

                            {/* P2 Change */}
                            <th className="px-2 py-3 text-center border-b border-white/5 w-24">
                                <div className="flex items-center justify-center gap-1">
                                    <HeaderSort label={headers.p2} field="history.p_day2" onSort={handleSort} sortConfig={sortConfig} />
                                    <AutoFilter
                                        columnKey="history.p_day2"
                                        title={headers.p2}
                                        type="number"
                                        onFilter={(f) => handleFilterChange("history.p_day2", f)}
                                        currentFilter={activeColumnFilters["history.p_day2"] || null}
                                        onSort={(d) => handleSort("history.p_day2", d)}
                                        sortDirection={sortConfig.key === "history.p_day2" ? sortConfig.direction : null}
                                    />
                                </div>
                            </th>

                            {/* P2 Str */}
                            <th className="px-2 py-3 text-center border-b border-white/5 w-28">
                                <div className="flex items-center justify-center gap-1">
                                    <span>P2 Str</span>
                                    <AutoFilter
                                        columnKey="day2_strength"
                                        title="P2 Str"
                                        type="enum"
                                        options={getOptions("day2_strength")}
                                        onFilter={(f) => handleFilterChange("day2_strength", f)}
                                        currentFilter={activeColumnFilters["day2_strength"] || null}
                                        onSort={(d) => handleSort("day2_strength", d)}
                                        sortDirection={sortConfig.key === "day2_strength" ? sortConfig.direction : null}
                                    />
                                </div>
                            </th>
                            <th className="px-2 py-3 text-center border-b border-white/5 w-24">
                                <div className="flex items-center justify-center gap-1">
                                    <HeaderSort label={headers.p3} field="history.p_day3" onSort={handleSort} sortConfig={sortConfig} />
                                    <AutoFilter
                                        columnKey="history.p_day3"
                                        title={headers.p3}
                                        type="number"
                                        onFilter={(f) => handleFilterChange("history.p_day3", f)}
                                        currentFilter={activeColumnFilters["history.p_day3"] || null}
                                        onSort={(d) => handleSort("history.p_day3", d)}
                                        sortDirection={sortConfig.key === "history.p_day3" ? sortConfig.direction : null}
                                    />
                                </div>
                            </th>
                            <th className="px-2 py-3 text-center border-b border-white/5 w-28">
                                <div className="flex items-center justify-center gap-1">
                                    <span>P3 Str</span>
                                    <AutoFilter
                                        columnKey="day3_strength"
                                        title="P3 Str"
                                        type="enum"
                                        options={getOptions("day3_strength")}
                                        onFilter={(f) => handleFilterChange("day3_strength", f)}
                                        currentFilter={activeColumnFilters["day3_strength"] || null}
                                        onSort={(d) => handleSort("day3_strength", d)}
                                        sortDirection={sortConfig.key === "day3_strength" ? sortConfig.direction : null}
                                    />
                                </div>
                            </th>
                            <th className="px-2 py-3 text-center border-b border-white/5 w-24">
                                <div className="flex items-center justify-center gap-1">
                                    <HeaderSort label="3D Avg %" field="history.avg_3day" onSort={handleSort} sortConfig={sortConfig} />
                                    <AutoFilter
                                        columnKey="history.avg_3day"
                                        title="3D Avg"
                                        type="number"
                                        onFilter={(f) => handleFilterChange("history.avg_3day", f)}
                                        currentFilter={activeColumnFilters["history.avg_3day"] || null}
                                        onSort={(d) => handleSort("history.avg_3day", d)}
                                        sortDirection={sortConfig.key === "history.avg_3day" ? sortConfig.direction : null}
                                    />
                                </div>
                            </th>
                            <th className="px-2 py-3 text-center border-b border-white/5 w-32">
                                <div className="flex items-center justify-center gap-1">
                                    <span>3D Avg Str</span>
                                    <AutoFilter
                                        columnKey="avg_3day_strength"
                                        title="3D Avg Str"
                                        type="enum"
                                        options={getOptions("avg_3day_strength")}
                                        onFilter={(f) => handleFilterChange("avg_3day_strength", f)}
                                        currentFilter={activeColumnFilters["avg_3day_strength"] || null}
                                        onSort={(d) => handleSort("avg_3day_strength", d)}
                                        sortDirection={sortConfig.key === "avg_3day_strength" ? sortConfig.direction : null}
                                    />
                                </div>
                            </th>

                            {/* 12. Indicators (w-44) */}
                            <th className="px-2 py-3 text-center border-b border-white/5 w-36">
                                <div className="flex items-center justify-center gap-1">
                                    <span>Indicators</span>
                                    <AutoFilter
                                        columnKey="derived.indicatorsList"
                                        title="Indicators"
                                        type="enum"
                                        options={getOptions("derived.indicatorsList")}
                                        onFilter={(f) => handleFilterChange("derived.indicatorsList", f)}
                                        currentFilter={activeColumnFilters["derived.indicatorsList"] || null}
                                        onSort={(d) => handleSort("derived.indicatorsList", d)}
                                        sortDirection={sortConfig.key === "derived.indicatorsList" ? sortConfig.direction : null}
                                    />
                                </div>
                            </th>

                            {/* 13. M (w-24) */}
                            <th className="px-2 py-3 text-center border-b border-white/5 w-16">
                                <div className="flex items-center justify-center gap-1">
                                    <span>M</span>
                                    <AutoFilter
                                        columnKey="derived.macdLabel"
                                        title="MACD"
                                        type="enum"
                                        options={getOptions("derived.macdLabel")}
                                        onFilter={(f) => handleFilterChange("derived.macdLabel", f)}
                                        currentFilter={activeColumnFilters["derived.macdLabel"] || null}
                                        onSort={(d) => handleSort("derived.macdLabel", d)}
                                        sortDirection={sortConfig.key === "derived.macdLabel" ? sortConfig.direction : null}
                                        labelFormatter={(val) => {
                                            if (val.includes("Above")) return "Above Zero (Bullish)";
                                            if (val.includes("Below")) return "Below Zero (Bearish)";
                                            if (val.includes("Neutral")) return "Near Zero (Neutral)";
                                            return val;
                                        }}
                                    />
                                </div>
                            </th>

                            {/* 14. R (w-24) */}
                            <th className="px-2 py-3 text-center border-b border-white/5 w-16">
                                <div className="flex items-center justify-center gap-1">
                                    <span>R</span>
                                    <AutoFilter
                                        columnKey="derived.rsiLabel"
                                        title="RSI"
                                        type="enum"
                                        options={getOptions("derived.rsiLabel")}
                                        onFilter={(f) => handleFilterChange("derived.rsiLabel", f)}
                                        currentFilter={activeColumnFilters["derived.rsiLabel"] || null}
                                        onSort={(d) => handleSort("derived.rsiLabel", d)}
                                        sortDirection={sortConfig.key === "derived.rsiLabel" ? sortConfig.direction : null}
                                        labelFormatter={(val) => {
                                            if (val.includes("Under")) return "Oversold (<30)";
                                            if (val.includes("Over")) return "Overbought (>70)";
                                            if (val.includes("Neutral")) return "Neutral (30-70)";
                                            return val;
                                        }}
                                    />
                                </div>
                            </th>

                            {/* 15. Action (w-12) */}
                            <th className="px-2 py-3 text-center border-b border-white/5 w-12">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {displayedStocks.map((stock) => (
                            <tr
                                key={stock.symbol}
                                className="group hover:bg-white/5 transition-colors cursor-pointer"
                                onClick={() => handleRowClick(stock.symbol)}
                            >
                                {/* 1. Symbol */}
                                <td className="px-4 py-3 sticky left-0 z-10 bg-card/95 border-r border-white/5 group-hover:bg-accent/10 whitespace-nowrap shadow-[2px_0_5px_rgba(0,0,0,0.1)]">
                                    <div className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{stock.symbol}</div>
                                </td>

                                {/* 2. Change % */}
                                <td className="px-4 py-3 text-center">
                                    <BadgeChange value={stock.current_change} />
                                </td>

                                {/* 3. Strength */}
                                <td className="px-4 py-3 text-center whitespace-nowrap">
                                    <StrengthMeter
                                        label={stock.current_strength}
                                    />
                                </td>

                                {/* 4. Day 1 % */}
                                <td className="px-4 py-3 text-center"><BadgeChange value={stock.history.p_day1} /></td>
                                <td className="px-4 py-3 text-center"><StrengthMeter label={stock.day1_strength} /></td>

                                {/* 6. Day 2 % */}
                                <td className="px-4 py-3 text-center"><BadgeChange value={stock.history.p_day2} /></td>
                                <td className="px-4 py-3 text-center"><StrengthMeter label={stock.day2_strength} /></td>

                                {/* 8. Day 3 % */}
                                <td className="px-4 py-3 text-center"><BadgeChange value={stock.history.p_day3} /></td>
                                <td className="px-4 py-3 text-center"><StrengthMeter label={stock.day3_strength} /></td>

                                {/* 10. 3D Avg % */}
                                <td className="px-4 py-3 text-center"><BadgeChange value={stock.history.avg_3day} showIcon /></td>
                                <td className="px-4 py-3 text-center"><StrengthMeter label={stock.avg_3day_strength} /></td>

                                {/* 12. Indicators */}
                                <td className="px-4 py-3 text-center">
                                    <div className="flex flex-col items-center gap-1">
                                        <IndicatorBadge label="MACD" value={stock.derived?.macdLabel} />
                                        <IndicatorBadge label="RSI" value={stock.derived?.rsiLabel} />
                                    </div>
                                </td>

                                {/* 13. M */}
                                <td className="px-4 py-3 text-center">
                                    <Activity className={cn("w-4 h-4 mx-auto", stock.derived?.macdLabel === "Above" ? "text-emerald-500" : stock.derived?.macdLabel === "Below" ? "text-red-500" : "text-muted-foreground")} />
                                </td>

                                {/* 14. R */}
                                <td className="px-4 py-3 text-center">
                                    <Zap className={cn("w-4 h-4 mx-auto", stock.derived?.rsiLabel === "Under" ? "text-emerald-500" : stock.derived?.rsiLabel === "Over" ? "text-red-500" : "text-blue-400")} />
                                </td>

                                {/* 15. Action */}
                                <td className="px-4 py-3 text-center">
                                    <button
                                        className="p-2 hover:bg-yellow-500/10 rounded-full transition-colors group/star"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleWatchlist(stock.symbol);
                                        }}
                                    >
                                        <Star className={cn("w-4 h-4 transition-colors", isInWatchlist(stock.symbol) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground group-hover/star:text-yellow-500")} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {processedStocks.length > displayCount && (
                <div className="p-4 flex justify-center border-t border-white/5">
                    <button
                        onClick={handleLoadMore}
                        className="px-6 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-sm font-medium transition-all"
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>
    );
}

// --- Helper Components (Matches StocksTable) ---

function HeaderSort({ label, field, onSort, sortConfig }: any) {
    const isActive = sortConfig.key === field;
    return (
        <div
            className="flex items-center justify-center gap-1 cursor-pointer hover:text-primary transition-colors select-none"
            onClick={() => onSort(field, isActive && sortConfig.direction === 'desc' ? 'asc' : 'desc')}
        >
            <span>{label}</span>
            <div className="flex flex-col">
                <ArrowUp className={cn("w-2 h-2", isActive && sortConfig.direction === 'asc' ? 'text-primary' : 'text-muted-foreground/30')} />
                <ArrowDown className={cn("w-2 h-2", isActive && sortConfig.direction === 'desc' ? 'text-primary' : 'text-muted-foreground/30')} />
            </div>
        </div>
    );
}

function BadgeChange({ value, showIcon = false, large = false }: { value: number, showIcon?: boolean, large?: boolean }) {
    if (value === undefined || value === null) return <span className="text-muted-foreground text-xs text-center block">-</span>;
    const isPos = value >= 0;
    const isNeg = value < 0;

    return (
        <div className={cn("flex items-center justify-center gap-1",
            isPos ? "text-emerald-500" : isNeg ? "text-red-500" : "text-muted-foreground",
            large ? "font-bold text-sm" : "font-medium text-xs"
        )}>
            {showIcon && (isPos ? <ArrowUp className="w-3 h-3" /> : isNeg ? <ArrowDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />)}
            {Math.abs(value).toFixed(2)}%
        </div>
    );
}

function IndicatorBadge({ label, value }: { label: string, value: string }) {
    if (!value) return null;

    let displayValue = "Neutral (30-70)";
    let sentiment: "Bullish" | "Bearish" | "Neutral" = "Neutral";
    let icon = "-";

    if (label === "MACD") {
        displayValue = "Near Zero (Neutral)";
        if (value.includes("Above")) {
            sentiment = "Bullish";
            displayValue = "Above Zero (Bullish)";
            icon = "▲";
        }
        if (value.includes("Below")) {
            sentiment = "Bearish";
            displayValue = "Below Zero (Bearish)";
            icon = "▼";
        }
    } else if (label === "RSI") {
        if (value.includes("Under")) {
            sentiment = "Bullish"; // Buying opportunity
            displayValue = "Oversold (<30)";
            icon = "▲";
        } else if (value.includes("Over")) {
            sentiment = "Bearish"; // Selling pressure
            displayValue = "Overbought (>70)";
            icon = "▼";
        } else {
            displayValue = "Neutral (30-70)";
        }
    }

    const color = sentiment === "Bullish" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
        sentiment === "Bearish" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-muted/10 text-muted-foreground border-border";

    return (
        <div className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium whitespace-nowrap", color)} title={`${label}: ${value}`}>
            {label} {icon} {displayValue}
        </div>
    )
}
