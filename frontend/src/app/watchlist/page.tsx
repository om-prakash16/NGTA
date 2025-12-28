"use client";

import StocksTable from "@/components/StocksTable";
import FilterDrawer from "@/components/FilterDrawer";
import QuickFiltersToolbar from "@/components/QuickFiltersToolbar";
import { useWatchlist } from "@/hooks/useStocks";
import { useState, useMemo, useEffect } from "react";
import { useFilter } from "@/context/FilterContext";
import { globalFilter, enrichStockData } from "@/utils/globalFilter";
import { X, RefreshCcw } from "lucide-react";

export default function WatchlistPage() {
    const { data: stocks, isLoading, refetch } = useWatchlist();
    const [filters, setFilters] = useState<any>({});
    const { isDrawerOpen, closeDrawer, setFilterCount } = useFilter();

    // Sync filter count to context
    useEffect(() => {
        const count = Object.keys(filters).length;
        setFilterCount(count);
    }, [filters, setFilterCount]);

    const handleReset = () => {
        setFilters({});
    };

    // Apply Global Filter to Watchlist Data
    const filteredStocks = useMemo(() => {
        const enriched = enrichStockData(stocks || []);
        return globalFilter(enriched, filters);
    }, [stocks, filters]);

    return (
        <div className="flex flex-col gap-6 min-h-screen">
            <FilterDrawer
                isOpen={isDrawerOpen}
                onClose={closeDrawer}
                filters={filters}
                setFilters={setFilters}
                onReset={handleReset}
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">My Watchlist</h1>
                    <p className="text-muted-foreground mt-1">
                        Tracking {filteredStocks.length} stocks
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {Object.keys(filters).length > 0 && (
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-destructive/10 transition-colors flex items-center gap-2"
                        >
                            <X className="w-4 h-4" /> Clear Filters
                        </button>
                    )}
                    <button
                        onClick={() => refetch()}
                        className="p-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors text-muted-foreground"
                        title="Refresh Data"
                    >
                        <RefreshCcw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {stocks?.length === 0 && !isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-card text-card-foreground rounded-3xl border border-border shadow-sm">
                    <div className="text-muted-foreground mb-2">Your watchlist is empty</div>
                    <p className="text-sm text-muted-foreground">Add stocks from the dashboard to track them here.</p>
                </div>
            ) : (
                <div className="bg-card text-card-foreground rounded-3xl shadow-sm dark:shadow-md border border-border overflow-hidden">
                    <QuickFiltersToolbar
                        filters={filters}
                        setFilters={setFilters}
                        onReset={handleReset}
                    />
                    <StocksTable
                        stocks={filteredStocks}
                        isLoading={isLoading}
                        variant="plain"
                    />
                </div>
            )}
        </div>
    );
}
