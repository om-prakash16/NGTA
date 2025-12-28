"use client";

import { useGrowwStrength } from "@/hooks/useStocks"; // Changed to useGrowwStrength
import StocksTable from "@/components/StocksTable";
import { useState, useMemo, useEffect } from "react";
import { Search, RefreshCcw, X, Target } from "lucide-react";
import { useFilter } from "@/context/FilterContext";
import FilterDrawer from "@/components/FilterDrawer";
import QuickFiltersToolbar from "@/components/QuickFiltersToolbar";
import { globalFilter, enrichStockData } from "@/utils/globalFilter";
import { motion } from "framer-motion";

export default function StocksIndex() {
    const { data: stocks, isLoading, refetch } = useGrowwStrength({}); // Using Groww hook
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState<any>({});
    const { isDrawerOpen, closeDrawer, setFilterCount } = useFilter();

    // Sync filter count to context
    useEffect(() => {
        const count = Object.keys(filters).length;
        setFilterCount(count);
    }, [filters, setFilterCount]);

    const handleReset = () => {
        setFilters({});
        setSearch("");
    };

    // Apply Global Filter + Search
    const filteredStocks = useMemo(() => {
        let result = stocks || [];

        // 0. Enrich Data (Centralized Logic)
        result = enrichStockData(result);

        // 1. Search
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(s =>
                s.symbol.toLowerCase().includes(q) ||
                s.name?.toLowerCase().includes(q)
            );
        }

        // 2. Filters
        return globalFilter(result, filters);
    }, [stocks, search, filters]);

    return (
        <div className="flex flex-col gap-6 min-h-screen">
            <FilterDrawer
                isOpen={isDrawerOpen}
                onClose={closeDrawer}
                filters={filters}
                setFilters={setFilters}
                onReset={handleReset}
            />

            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/50 pb-6"
            >
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
                        <Target className="text-emerald-400" /> Groww Insights
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Professional Analysis of {filteredStocks.length} Stocks
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by symbol..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card/50 backdrop-blur focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {Object.keys(filters).length > 0 && (
                        <button
                            onClick={handleReset}
                            className="px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                        >
                            <X className="w-4 h-4" /> Clear
                        </button>
                    )}

                    <button
                        onClick={() => refetch()}
                        className="p-2.5 bg-card border border-border rounded-xl hover:bg-accent hover:scale-105 transition-all text-muted-foreground hover:text-foreground"
                        title="Refresh Data"
                    >
                        <RefreshCcw className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
            >
                <QuickFiltersToolbar
                    filters={filters}
                    setFilters={setFilters}
                    onReset={handleReset}
                />

                <div className="rounded-3xl shadow-2xl shadow-black/5 dark:shadow-emerald-500/5 overflow-hidden">
                    <StocksTable
                        stocks={filteredStocks}
                        isLoading={isLoading}
                        variant="card"
                    />
                </div>
            </motion.div>
        </div>
    );
}
