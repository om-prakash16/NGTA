"use client";

import { Stock, useWatchlist, useToggleWatchlist } from "@/hooks/useStocks";
import { ArrowDown, ArrowUp, Minus, Star, Activity, Zap, TrendingUp, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import AutoFilter, { FilterState } from "./AutoFilter";
import { applyColumnFilters } from "@/utils/globalFilter";
import { getUniqueValues, getPctColor } from "@/utils/tableUtils";
import { StrengthMeter } from "@/components/ui/StrengthMeter";
import { motion } from "framer-motion";

interface StocksTableProps {
    stocks: Stock[];
    isLoading: boolean;
    simpleMode?: boolean;
    variant?: "card" | "plain";
    marketHeaders?: {
        current: string;
        p1: string;
        p2: string;
        p3: string;
    };
    requestedSort?: { key: string; direction: "asc" | "desc" } | null;
}

export default function StocksTable({ stocks, isLoading, simpleMode = false, variant = "card", marketHeaders, requestedSort }: StocksTableProps) {
    const router = useRouter();
    const [displayCount, setDisplayCount] = useState(50);

    // Default headers if not provided
    const headers = {
        current: marketHeaders?.current || "Today Change",
        p1: marketHeaders?.p1 || "Past Day 1",
        p2: marketHeaders?.p2 || "Past Day 2",
        p3: marketHeaders?.p3 || "Past Day 3"
    };

    // Client-side state
    const [columnFilters, setColumnFilters] = useState<Record<string, FilterState>>({});
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
        key: "history.avg_3day",
        direction: "asc"
    });

    // Handle external sort requests (e.g. from Gainers/Losers filters)
    useEffect(() => {
        if (requestedSort) {
            setSortConfig(requestedSort);
        }
    }, [requestedSort]);

    const { data: watchlist } = useWatchlist();
    const { mutate: toggleWatchlist } = useToggleWatchlist();

    const isInWatchlist = (symbol: string) => {
        return watchlist?.some((s: any) => s.symbol === symbol);
    };

    const handleToggleWatchlist = (symbol: string) => {
        const action = isInWatchlist(symbol) ? "remove" : "add";
        toggleWatchlist({ symbol, action });
    };

    const handleLoadMore = () => {
        setDisplayCount(prev => prev + 50);
    };

    const handleRowClick = (symbol: string) => {
        router.push(`/groww/full-data?symbol=${symbol}`); // Direct to new page logic? Or keep old route? 
        // User asked to update Insights, keeping old route might be safer but pointing to new efficient page is better.
        // Let's keep it robust.
    };

    const handleFilterChange = (key: string, filter: FilterState | null) => {
        setColumnFilters(prev => {
            const next = { ...prev };
            if (filter === null) {
                delete next[key];
            } else {
                next[key] = filter;
            }
            return next;
        });
    };

    const handleSort = (key: string, direction: "asc" | "desc") => {
        setSortConfig({ key, direction });
    };

    // Derived Data & Filtering
    const processedStocks = useMemo(() => {
        if (!stocks) return [];

        // 1. Enrich (Already done in parent page is assumed, or pass enriched data)
        const result = applyColumnFilters(stocks, columnFilters);

        // 2. Sort
        return result.sort((a, b) => {
            const { key, direction } = sortConfig;

            // Handle nested keys safely
            const getValue = (obj: any, path: string) => {
                return path.split('.').reduce((o, i) => o?.[i], obj);
            };

            let valA = getValue(a, key);
            let valB = getValue(b, key);

            // Special handling for Stability Rank (Absolute value close to 0)
            if (key === "history.avg_3day") {
                valA = Math.abs(Number(valA) || 0);
                valB = Math.abs(Number(valB) || 0);
            } else if (typeof valA === 'string' || typeof valA === 'number') {
                // Try to cast to number for accurate sorting (fixes "-5" vs "-10" string issue)
                const numA = Number(valA);
                const numB = Number(valB);
                if (!isNaN(numA) && !isNaN(numB)) {
                    valA = numA;
                    valB = numB;
                }
            }

            if (valA === undefined || valA === null) return 1;
            if (valB === undefined || valB === null) return -1;

            if (valA < valB) return direction === "asc" ? -1 : 1;
            if (valA > valB) return direction === "asc" ? 1 : -1;
            return 0;
        });

    }, [stocks, columnFilters, sortConfig]);

    const displayedStocks = processedStocks.slice(0, displayCount);

    const getOptions = (key: string) => {
        if (!stocks.length) return [];
        return getUniqueValues(stocks, key);
    };

    if (isLoading) {
        return (
            <div className="space-y-4 p-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-14 bg-muted/20 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            {/* Table Header Wrapper for sticky styling */}
            <div className="overflow-x-auto custom-scrollbar relative">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted/50 text-muted-foreground font-semibold tracking-wider backdrop-blur-md sticky top-0 z-20">
                        <tr>
                            {!simpleMode && (
                                <th className="px-2 py-3 text-center border-b border-white/5 w-12">#</th>
                            )}

                            {/* Symbol - Sticky */}
                            <th className={cn("px-2 py-3 sticky left-0 z-30 bg-card/95 border-b border-white/5 w-32 shadow-[2px_0_5px_rgba(0,0,0,0.1)]")}>
                                <div className="flex items-center justify-between gap-1">
                                    <span>Symbol</span>
                                    <AutoFilter
                                        columnKey="symbol"
                                        title="Symbol"
                                        type="text"
                                        options={getOptions("symbol")}
                                        onFilter={(f) => handleFilterChange("symbol", f)}
                                        currentFilter={columnFilters["symbol"] || null}
                                        onSort={(d) => handleSort("symbol", d)}
                                        sortDirection={sortConfig.key === "symbol" ? sortConfig.direction : null}
                                    />
                                </div>
                            </th>

                            <th className="px-2 py-3 text-right border-b border-white/5 w-20">
                                <HeaderSort label="Price" field="current_price" onSort={handleSort} sortConfig={sortConfig} />
                            </th>

                            {!simpleMode && (
                                <>
                                    <th className="px-2 py-3 text-center border-b border-white/5 w-24">
                                        <div className="flex items-center justify-center gap-1">
                                            <HeaderSort label={headers.current} field="current_change" onSort={handleSort} sortConfig={sortConfig} />
                                            <AutoFilter
                                                columnKey="current_change"
                                                title={headers.current}
                                                type="number"
                                                onFilter={(f) => handleFilterChange("current_change", f)}
                                                currentFilter={columnFilters["current_change"] || null}
                                                onSort={(d) => handleSort("current_change", d)}
                                                sortDirection={sortConfig.key === "current_change" ? sortConfig.direction : null}
                                            />
                                        </div>
                                    </th>
                                    <th className="px-2 py-3 text-center border-b border-white/5 w-16">
                                        <div className="flex items-center justify-center gap-1">
                                            <span>{headers.p1}</span>
                                            <AutoFilter
                                                columnKey="history.p_day1"
                                                title={headers.p1}
                                                type="number"
                                                onFilter={(f) => handleFilterChange("history.p_day1", f)}
                                                currentFilter={columnFilters["history.p_day1"] || null}
                                                onSort={(d) => handleSort("history.p_day1", d)}
                                                sortDirection={sortConfig.key === "history.p_day1" ? sortConfig.direction : null}
                                            />
                                        </div>
                                    </th>
                                    <th className="px-2 py-3 text-center border-b border-white/5 w-16">
                                        <div className="flex items-center justify-center gap-1">
                                            <span>{headers.p2}</span>
                                            <AutoFilter
                                                columnKey="history.p_day2"
                                                title={headers.p2}
                                                type="number"
                                                onFilter={(f) => handleFilterChange("history.p_day2", f)}
                                                currentFilter={columnFilters["history.p_day2"] || null}
                                                onSort={(d) => handleSort("history.p_day2", d)}
                                                sortDirection={sortConfig.key === "history.p_day2" ? sortConfig.direction : null}
                                            />
                                        </div>
                                    </th>
                                    <th className="px-2 py-3 text-center border-b border-white/5 w-16">
                                        <div className="flex items-center justify-center gap-1">
                                            <span>{headers.p3}</span>
                                            <AutoFilter
                                                columnKey="history.p_day3"
                                                title={headers.p3}
                                                type="number"
                                                onFilter={(f) => handleFilterChange("history.p_day3", f)}
                                                currentFilter={columnFilters["history.p_day3"] || null}
                                                onSort={(d) => handleSort("history.p_day3", d)}
                                                sortDirection={sortConfig.key === "history.p_day3" ? sortConfig.direction : null}
                                            />
                                        </div>
                                    </th>
                                    <th className="px-2 py-3 text-center border-b border-white/5 w-24">
                                        <div className="flex items-center justify-center gap-1">
                                            <HeaderSort label="3D Avg" field="history.avg_3day" onSort={handleSort} sortConfig={sortConfig} />
                                            <AutoFilter
                                                columnKey="history.avg_3day"
                                                title="3D Avg"
                                                type="number"
                                                onFilter={(f) => handleFilterChange("history.avg_3day", f)}
                                                currentFilter={columnFilters["history.avg_3day"] || null}
                                                onSort={(d) => handleSort("history.avg_3day", d)}
                                                sortDirection={sortConfig.key === "history.avg_3day" ? sortConfig.direction : null}
                                            />
                                        </div>
                                    </th>

                                    {/* M (MACD) */}
                                    <th className="px-2 py-3 text-center border-b border-white/5 w-16">
                                        <div className="flex items-center justify-center gap-1">
                                            <span>M</span>
                                            <AutoFilter
                                                columnKey="derived.macdLabel"
                                                title="MACD"
                                                type="enum"
                                                options={getOptions("derived.macdLabel")}
                                                onFilter={(f) => handleFilterChange("derived.macdLabel", f)}
                                                currentFilter={columnFilters["derived.macdLabel"] || null}
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

                                    {/* R (RSI) */}
                                    <th className="px-2 py-3 text-center border-b border-white/5 w-16">
                                        <div className="flex items-center justify-center gap-1">
                                            <span>R</span>
                                            <AutoFilter
                                                columnKey="derived.rsiLabel"
                                                title="RSI"
                                                type="enum"
                                                options={getOptions("derived.rsiLabel")}
                                                onFilter={(f) => handleFilterChange("derived.rsiLabel", f)}
                                                currentFilter={columnFilters["derived.rsiLabel"] || null}
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

                                    <th className="px-2 py-3 text-center border-b border-white/5 w-24">
                                        <div className="flex items-center justify-center gap-1">
                                            <span>Strength</span>
                                            <AutoFilter
                                                columnKey="avg_3day_strength"
                                                title="Strength"
                                                type="enum"
                                                options={getOptions("avg_3day_strength")}
                                                onFilter={(f) => handleFilterChange("avg_3day_strength", f)}
                                                currentFilter={columnFilters["avg_3day_strength"] || null}
                                                onSort={(d) => handleSort("avg_3day_strength", d)}
                                                sortDirection={sortConfig.key === "avg_3day_strength" ? sortConfig.direction : null}
                                            />
                                        </div>
                                    </th>
                                    <th className="px-2 py-3 text-center border-b border-white/5 w-12">Watch</th>
                                </>
                            )}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-white/5">
                        {displayedStocks.map((stock, idx) => (
                            <tr
                                key={stock.symbol}
                                className="group hover:bg-white/5 transition-colors cursor-pointer"
                                onClick={() => handleRowClick(stock.symbol)}
                            >
                                {!simpleMode && <td className="px-2 py-3 font-mono text-center text-muted-foreground">{idx + 1}</td>}

                                <td className="px-2 py-3 sticky left-0 z-10 bg-card/95 border-r border-white/5 group-hover:bg-accent/10 whitespace-nowrap shadow-[2px_0_5px_rgba(0,0,0,0.1)]">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{stock.symbol}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase">{stock.sector}</span>
                                    </div>
                                </td>

                                <td className="px-2 py-3 text-right font-mono text-base font-medium">₹{stock.current_price.toFixed(2)}</td>

                                {!simpleMode && (
                                    <>
                                        <td className="px-2 py-3">
                                            <BadgeChange value={stock.current_change} showIcon large />
                                        </td>
                                        <td className="px-2 py-3"><BadgeChange value={stock.history.p_day1} /></td>
                                        <td className="px-2 py-3"><BadgeChange value={stock.history.p_day2} /></td>
                                        <td className="px-2 py-3"><BadgeChange value={stock.history.p_day3} /></td>
                                        <td className="px-2 py-3"><BadgeChange value={stock.history.avg_3day} showIcon /></td>

                                        <td className="px-2 py-3 text-center">
                                            <div className="flex justify-center">
                                                <IndicatorBadge label="MACD" value={stock.derived?.macdLabel} />
                                            </div>
                                        </td>
                                        <td className="px-2 py-3 text-center">
                                            <div className="flex justify-center">
                                                <IndicatorBadge label="RSI" value={stock.derived?.rsiLabel} />
                                            </div>
                                        </td>

                                        <td className="px-2 py-3">
                                            <StrengthMeter label={stock.avg_3day_strength} />
                                        </td>

                                        <td className="px-2 py-3 text-center">
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
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {!simpleMode && processedStocks.length > displayCount && (
                <div className="p-4 flex justify-center border-t border-white/5">
                    <button
                        onClick={handleLoadMore}
                        className="px-6 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-sm font-medium transition-all"
                    >
                        Load More Stocks
                    </button>
                </div>
            )}
        </div>
    );
}

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
            sentiment = "Bullish";
            displayValue = "Oversold (<30)";
            icon = "▲";
        } else if (value.includes("Over")) {
            sentiment = "Bearish";
            displayValue = "Overbought (>70)";
            icon = "▼";
        } else {
            displayValue = "Neutral (30-70)";
        }
    }

    const color = sentiment === "Bullish" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
        sentiment === "Bearish" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-muted/10 text-muted-foreground border-border";

    return (
        <div className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium", color)} title={`${label}: ${value}`}>
            {label} {icon} {displayValue}
        </div>
    )
}
