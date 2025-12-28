"use client";

import { useGainers3Day, useLosers3Day } from "@/hooks/useStocks";
import StocksTable from "@/components/StocksTable";
import { useParams } from "next/navigation";
import { RefreshCcw } from "lucide-react";

export default function MoversPage() {
    const params = useParams();
    const type = params.type as string; // 'gainers' or 'losers'

    // We use the specific hooks which already sort by default
    const { data: gainers, isLoading: loadingGainers, error: errorGainers, refetch: refetchGainers } = useGainers3Day();
    const { data: losers, isLoading: loadingLosers, error: errorLosers, refetch: refetchLosers } = useLosers3Day();

    const stocks = type === "gainers" ? gainers : losers;
    const isLoading = type === "gainers" ? loadingGainers : loadingLosers;
    const error = type === "gainers" ? errorGainers : errorLosers;
    const refetch = type === "gainers" ? refetchGainers : refetchLosers;

    const title = type === "gainers" ? "Top 3-Day Gainers" : "Top 3-Day Losers";
    const description = type === "gainers"
        ? "Stocks with the highest average percentage change over the last 3 days."
        : "Stocks with the lowest average percentage change over the last 3 days.";

    return (
        <div className="flex flex-col gap-6 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900 dark:text-white capitalize">{title}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {description}
                    </p>
                </div>

                <div className="flex items-center gap-3">
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
                <StocksTable
                    stocks={stocks || []}
                    isLoading={isLoading}
                    variant="plain"
                />
            </div>
        </div>
    );
}
