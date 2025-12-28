"use client";

import { useState, useEffect, useMemo } from "react";
import StocksTable from "@/components/StocksTable";
import FilterDrawer from "@/components/FilterDrawer";
import QuickFiltersToolbar from "@/components/QuickFiltersToolbar";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Stock } from "@/hooks/useStocks";
import { useFilter } from "@/context/FilterContext";
import { globalFilter, enrichStockData } from "@/utils/globalFilter";
import { Search, RefreshCcw, X } from "lucide-react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000") + "/api/v1";

export default function Nifty100Page() {
    const [filters, setFilters] = useState<any>({});
    const [search, setSearch] = useState("");
    const { isDrawerOpen, closeDrawer, setFilterCount } = useFilter();

    // Sync filter count to context
    useEffect(() => {
        const count = Object.keys(filters).length;
        setFilterCount(count);
    }, [filters, setFilterCount]);

    const { data: stocks, isLoading, error, refetch } = useQuery({
        queryKey: ["stocks_nifty100"],
        queryFn: async () => {
            const { data } = await axios.get<Stock[]>(`${API_URL}/stocks/nifty100`);
            return data;
        },
        refetchInterval: 60000, // Refresh every minute
    });

    const handleReset = () => {
        setFilters({});
        setSearch("");
    };

    // Apply Global Filter + Search
    const filteredStocks = useMemo(() => {
        let result = stocks || [];

        // 0. Enrich Data
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">NIFTY 100 Analysis</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Tracking {filteredStocks.length} constituents of NIFTY 100 index
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search symbol..."
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {Object.keys(filters).length > 0 && (
                        <button
                            onClick={handleReset}
                            className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 whitespace-nowrap"
                        >
                            <X className="w-4 h-4" /> Clear
                        </button>
                    )}

                    <button
                        onClick={() => refetch()}
                        className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-gray-600 dark:text-gray-300"
                        title="Refresh Data"
                    >
                        <RefreshCcw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-300">
                    Error loading data: {(error as Error).message}. Ensure backend is running.
                </div>
            )}

            {/* Main Content */}
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
        </div>
    );
}
