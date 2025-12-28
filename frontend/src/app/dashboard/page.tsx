"use client";

import { useState, useEffect, useMemo } from "react";
import StocksTable from "@/components/StocksTable";
import FilterDrawer from "@/components/FilterDrawer";
import QuickFiltersToolbar from "@/components/QuickFiltersToolbar";
import { useStocks } from "@/hooks/useStocks";
import { globalFilter, enrichStockData } from "@/utils/globalFilter";
import { X, TrendingUp, TrendingDown, Activity, BarChart3 } from "lucide-react";
import { useFilter } from "@/context/FilterContext";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Home Page (Dashboard)
 * 
 * Displays the main dashboard with market statistics (sentiment, top gainers/losers)
 * and a filterable table of F&O stocks.
 */
import MarketStats from "@/components/MarketStats";

export default function Dashboard() {
    const [filters, setFilters] = useState<any>({});
    const { isDrawerOpen, closeDrawer, setFilterCount } = useFilter();

    const { data: stocks, isLoading, error } = useStocks(filters);

    // Enrich data for table display
    const enrichedStocks = useMemo(() => {
        if (!stocks) return [];
        return enrichStockData(stocks);
    }, [stocks]);

    // Sync filter count to context
    useEffect(() => {
        const count = Object.keys(filters).length;
        setFilterCount(count);
    }, [filters, setFilterCount]);

    const handleReset = () => {
        setFilters({});
    };

    // Components
    /**
     * FilterPill Component
     * A clickable pill button for quick filtering.
     * 
     * @param {string} label - Button text
     * @param {boolean} active - Whether the filter is active
     * @param {Function} onClick - Click handler
     * @param {React.ComponentType} [icon] - Optional icon
     */
    const FilterPill = ({ label, active, onClick, icon: Icon }: any) => (
        <button
            onClick={onClick}
            className={cn(
                "relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
                active
                    ? "text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
        >
            {active && (
                <motion.div
                    layoutId="activePill"
                    className="absolute inset-0 bg-primary rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
            <span className="relative z-10 flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4" />}
                {label}
            </span>
        </button>
    );

    // Determine default sort based on active filters
    const requestedSort = useMemo(() => {
        if (filters.gainers_only) return { key: "current_change", direction: "desc" as const };
        if (filters.losers_only) return { key: "current_change", direction: "asc" as const };
        return null;
    }, [filters.gainers_only, filters.losers_only]);

    return (
        <div className="flex flex-col gap-8 pb-10 animate-in fade-in duration-500 container mx-auto pt-6">
            {/* Added container and padding for dashboard view */}
            <FilterDrawer
                isOpen={isDrawerOpen}
                onClose={closeDrawer}
                filters={filters}
                setFilters={setFilters}
                onReset={handleReset}
            />

            {/* Header & Stats */}
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-semibold text-foreground tracking-tight">Trade Analyzer Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Professional F&O analysis with strict trading-day logic</p>
                </div>

                <MarketStats stocks={stocks || []} />
            </div>

            {/* Main Content Area */}
            <div className="bg-card text-card-foreground rounded-3xl border border-border shadow-sm dark:shadow-md overflow-hidden">

                {/* Toolbar */}
                <QuickFiltersToolbar
                    filters={filters}
                    setFilters={setFilters}
                    onReset={handleReset}
                />

                {/* Table */}
                <div className="min-h-[500px]">
                    {error ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                                <X className="w-6 h-6 text-destructive" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">Connection Error</h3>
                            <p className="text-muted-foreground max-w-sm">
                                Could not connect to backend: {error instanceof Error ? error.message : String(error)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2 font-mono bg-muted p-1 rounded">
                                {(error as any)?.response?.data?.detail || "No details"}
                            </p>
                        </div>
                    ) : (
                        <StocksTable
                            stocks={enrichedStocks}
                            isLoading={isLoading}
                            variant="plain"
                            requestedSort={requestedSort}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
