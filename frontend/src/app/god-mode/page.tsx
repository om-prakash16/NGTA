"use client";

import { useStrengthAnalysis } from "@/hooks/useStocks";
import { globalFilter, enrichStockData } from "@/utils/globalFilter";
import StrengthTable from "@/components/StrengthTable";
import StockChart from "@/components/StockChart";
import { useMemo, useState } from "react";
import FilterDrawer from "@/components/FilterDrawer";
import { Filter, BarChart3, TrendingUp, TrendingDown, Search, Layers, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { FilterState } from "@/components/AutoFilter";
import { useFilter } from "@/context/FilterContext";
import MarketStats from "@/components/MarketStats";

export default function GodModePage() {
    const [filters, setFilters] = useState({});
    const [columnFilters, setColumnFilters] = useState<Record<string, FilterState>>({});
    const { isDrawerOpen, closeDrawer, openDrawer } = useFilter();
    const [searchQuery, setSearchQuery] = useState("");
    const [quickFilter, setQuickFilter] = useState<'all' | 'gainers' | 'losers'>('all');

    // 1. Load Data from Generic Source (since Groww Service is removed, we use generic strength endpoint)
    // Note: We pass empty object to Hook because we are doing Client-Side filtering for instant reactivity
    const { data: stocks, isLoading } = useStrengthAnalysis({}); // Was useGrowwStrength(filters)

    // 2. Enrich
    const enrichedStocks = useMemo(() => {
        if (!stocks) return [];
        return enrichStockData(stocks);
    }, [stocks]);

    // 3. Filter by Search Query, Quick Filters, AND Drawer Filters
    const filteredStocks = useMemo(() => {
        // Step A: Apply Global Filters (Drawer)
        let result = globalFilter(enrichedStocks, filters);

        // Search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(stock =>
                stock.symbol.toLowerCase().includes(lowerQuery)
            );
        }

        // Quick Filters (Today's Change)
        if (quickFilter === 'gainers') {
            result = result.filter(s => (s.current_change || 0) > 0);
        } else if (quickFilter === 'losers') {
            result = result.filter(s => (s.current_change || 0) < 0);
        }

        return result;
    }, [enrichedStocks, searchQuery, quickFilter]);

    // 4. Select Top Stocks for Charting
    const topPicks = useMemo(() => {
        if (!enrichedStocks.length) return [];
        return [...enrichedStocks]
            .sort((a, b) => b.current_change - a.current_change) // Highest gainers
            .slice(0, 3);
    }, [enrichedStocks]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">

            {/* Header Stats */}
            <MarketStats stocks={enrichedStocks} />

            {/* Top Picks Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topPicks.map(stock => (
                    <StockChart key={stock.symbol} stock={stock} height={250} />
                ))}
            </div>

            {/* Main Data Table */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <h2 className="font-semibold flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Detailed Analysis {searchQuery && <span className="text-muted-foreground text-sm font-normal">(Found {filteredStocks.length})</span>}
                    </h2>

                    <div className="flex items-center gap-4">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search stocks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 w-40 md:w-64 transition-all text-sm font-medium"
                            />
                        </div>

                        {/* Quick Filters */}
                        <div className="flex items-center gap-2 p-1 bg-background/50 rounded-lg border border-border/50">
                            <button
                                onClick={() => setQuickFilter('all')}
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5",
                                    quickFilter === 'all'
                                        ? "bg-primary/10 text-primary shadow-sm border border-primary/20"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <Layers className="w-3.5 h-3.5" />
                                All
                            </button>
                            <button
                                onClick={() => setQuickFilter('gainers')}
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5",
                                    quickFilter === 'gainers'
                                        ? "bg-emerald-500/10 text-emerald-500 shadow-sm border border-emerald-500/20"
                                        : "text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/5"
                                )}
                            >
                                <TrendingUp className="w-3.5 h-3.5" />
                                Gainers
                            </button>
                            <button
                                onClick={() => setQuickFilter('losers')}
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5",
                                    quickFilter === 'losers'
                                        ? "bg-red-500/10 text-red-500 shadow-sm border border-red-500/20"
                                        : "text-muted-foreground hover:text-red-500 hover:bg-red-500/5"
                                )}
                            >
                                <TrendingDown className="w-3.5 h-3.5" />
                                Losers
                            </button>
                        </div>

                        {/* Clear Filter Button */}
                        {(searchQuery || quickFilter !== 'all' || Object.keys(columnFilters).length > 0) && (
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setQuickFilter('all');
                                    setColumnFilters({});
                                }}
                                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                                title="Clear All Filters"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}

                        {/* Global Filter Button REMOVED as per request */}
                        {/* <button
                            onClick={openDrawer}
                            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg transition-colors border border-border"
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                        </button> */}
                    </div>
                </div>
                <StrengthTable
                    stocks={filteredStocks}
                    isLoading={isLoading}
                    externalColumnFilters={columnFilters}
                    onColumnFilterChange={setColumnFilters}
                />
            </div>

            {/* Filter Drawer REMOVED */}
            {/* <FilterDrawer
                isOpen={isDrawerOpen}
                onClose={closeDrawer}
                filters={filters}
                setFilters={setFilters}
                onReset={() => setFilters({})}
            /> */}
        </div>
    );
}
