"use client";

import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Stock } from "@/hooks/useStocks";
import { useTheme } from "next-themes";

import { Skeleton } from "@/components/ui/skeleton";

interface StockChartProps {
    stock?: Stock | null;
    height?: number;
    isLoading?: boolean;
}

export default function StockChart({ stock, height = 300, isLoading = false }: StockChartProps) {
    const { theme } = useTheme();

    if (isLoading || !stock) {
        return (
            <div className="w-full bg-card rounded-xl border border-border p-4 shadow-sm h-full">
                <div className="flex items-center justify-between mb-4">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div style={{ height }}>
                    <Skeleton className="w-full h-full rounded-lg" />
                </div>
            </div>
        );
    }

    const data = useMemo(() => {
        return [
            { day: "Day 3", value: stock.history.p_day3 },
            { day: "Day 2", value: stock.history.p_day2 },
            { day: "Day 1", value: stock.history.p_day1 },
            { day: "Today", value: stock.current_change },
        ];
    }, [stock]);

    const isPositive = stock.current_change >= 0;
    const strokeColor = isPositive ? "#10b981" : "#ef4444"; // emerald-500 : red-500
    const fillColor = isPositive ? "#10b981" : "#ef4444";

    return (
        <div className="w-full bg-card rounded-xl border border-border p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">{stock.symbol} Trend</h3>
                    <p className="text-xs text-muted-foreground">3-Day Performance + Current</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {stock.current_change.toFixed(2)}%
                </div>
            </div>

            <div style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={`color${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={fillColor} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={fillColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            hide
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "var(--card)",
                                borderColor: "var(--border)",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            }}
                            itemStyle={{ color: "var(--foreground)" }}
                            cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "4 4" }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={strokeColor}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill={`url(#color${stock.symbol})`}
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
