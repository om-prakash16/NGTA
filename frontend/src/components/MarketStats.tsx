"use client";

import { useMemo } from "react";
import { Activity, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MarketStatsProps {
    stocks: any[];
    className?: string;
}

export default function MarketStats({ stocks, className }: MarketStatsProps) {
    const stats = useMemo(() => {
        if (!stocks || stocks.length === 0) return null;

        const total = stocks.length;
        const advances = stocks.filter(s => s.current_change > 0).length;
        const declines = stocks.filter(s => s.current_change < 0).length;

        const sortedByChange = [...stocks].sort((a, b) => b.current_change - a.current_change);
        const topGainer = sortedByChange[0];
        const topLoser = sortedByChange[sortedByChange.length - 1];

        const sentiment = advances > declines ? "Bullish" : declines > advances ? "Bearish" : "Neutral";

        return { total, advances, declines, topGainer, topLoser, sentiment };
    }, [stocks]);

    if (!stats) return null;

    const StatCard = ({ title, value, subValue, icon: Icon, colorClass }: any) => (
        <div className="bg-card text-card-foreground p-5 rounded-3xl border border-border shadow-sm dark:shadow-md flex items-center justify-between transition-all hover:shadow-md dark:hover:shadow-lg">
            <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-foreground">{value}</h3>
                {subValue && <p className={cn("text-xs font-medium mt-1", colorClass)}>{subValue}</p>}
            </div>
            <div className={cn("p-3 rounded-2xl opacity-20", colorClass?.replace("text-", "bg-"))}>
                <Icon className={cn("w-7 h-7", colorClass)} />
            </div>
        </div>
    );

    return (
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
            <StatCard
                title="Market Sentiment"
                value={stats.sentiment}
                subValue={`${stats.advances} Adv / ${stats.declines} Dec`}
                icon={Activity}
                colorClass={stats.sentiment === "Bullish" ? "text-green-600 dark:text-green-400" : stats.sentiment === "Bearish" ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}
            />
            <StatCard
                title="Top Gainer"
                value={stats.topGainer?.symbol}
                subValue={`+${stats.topGainer?.current_change?.toFixed(2) || "0.00"}%`}
                icon={TrendingUp}
                colorClass="text-green-600 dark:text-green-400"
            />
            <StatCard
                title="Top Loser"
                value={stats.topLoser?.symbol}
                subValue={`${stats.topLoser?.current_change?.toFixed(2) || "0.00"}%`}
                icon={TrendingDown}
                colorClass="text-red-600 dark:text-red-400"
            />
            <StatCard
                title="Active Stocks"
                value={stats.total}
                subValue="Tracked Symbols"
                icon={BarChart3}
                colorClass="text-blue-600 dark:text-blue-400"
            />
        </div>
    );
}
