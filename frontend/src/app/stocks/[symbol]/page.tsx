"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowUp, ArrowDown, Minus, TrendingUp, Activity, BarChart3, Zap, Layers, Clock, AlertCircle } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, YAxis, AreaChart, Area, XAxis, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000") + "/api/v1";

export default function StockInsights() {
    const params = useParams();
    const router = useRouter();
    const symbol = params.symbol as string;
    const [activeTab, setActiveTab] = useState("Overview");

    const { data: stock, isLoading, error } = useQuery({
        queryKey: ["stock-details", symbol],
        queryFn: async () => {
            const { data } = await axios.get(`${API_URL}/stocks/${symbol}`);
            return data;
        },
        enabled: !!symbol,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !stock) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Stock Not Found</h2>
                <button onClick={() => router.back()} className="text-blue-600 hover:underline">Go Back</button>
            </div>
        );
    }

    // --- Helpers ---

    const getTrendColor = (val: number) => {
        if (val > 0) return "text-green-600 dark:text-green-400";
        if (val < 0) return "text-red-600 dark:text-red-400";
        return "text-gray-500 dark:text-gray-400";
    };

    const getBgColor = (val: number) => {
        if (val > 0) return "bg-green-100 dark:bg-green-900/20";
        if (val < 0) return "bg-red-100 dark:bg-red-900/20";
        return "bg-gray-100 dark:bg-gray-800";
    };

    const getRsiColor = (val: number) => {
        if (val > 70) return "text-red-600 dark:text-red-400"; // Overbought
        if (val < 30) return "text-green-600 dark:text-green-400"; // Oversold
        return "text-blue-600 dark:text-blue-400"; // Neutral
    };

    const getPledgeColor = (val: number) => {
        if (val > 50) return "text-red-600 dark:text-red-400";
        if (val > 10) return "text-yellow-600 dark:text-yellow-400";
        return "text-green-600 dark:text-green-400";
    };

    // --- Components ---

    const TabButton = ({ name }: { name: string }) => (
        <button
            onClick={() => setActiveTab(name)}
            className={cn(
                "px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
                activeTab === name
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
        >
            {name}
        </button>
    );

    const MetricCard = ({ label, value, subValue, colorClass, icon: Icon }: any) => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card p-5 rounded-2xl border border-border shadow-sm dark:shadow-md hover:shadow-lg transition-all duration-300 group"
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
                {Icon && <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />}
            </div>
            <div className={cn("text-xl font-bold tracking-tight", colorClass || "text-foreground")}>
                {value}
            </div>
            {subValue && <div className="text-xs mt-1 font-medium opacity-80">{subValue}</div>}
        </motion.div>
    );

    const SignalCard = ({ title, status, type }: { title: string, status: string, type: "bullish" | "bearish" | "neutral" }) => (
        <div className={cn(
            "flex items-center justify-between p-3 rounded-xl border",
            type === "bullish" ? "bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30" :
                type === "bearish" ? "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30" :
                    "bg-muted/50 border-border"
        )}>
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
            <span className={cn(
                "text-xs font-bold px-2 py-1 rounded-lg uppercase",
                type === "bullish" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                    type === "bearish" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" :
                        "bg-muted text-muted-foreground"
            )}>
                {status}
            </span>
        </div>
    );

    // --- Data Prep ---

    const tabs = ["Overview", "Technicals", "Fundamentals", "Performance"];

    // Determine signals
    const indicators = stock.indicators || {};
    const history = stock.history || {};
    const flags = stock.flags || {};

    const macdSignal = indicators.macd_status === "above" ? "Bullish" : indicators.macd_status === "below" ? "Bearish" : "Neutral";
    const macdType = indicators.macd_status === "above" ? "bullish" : indicators.macd_status === "below" ? "bearish" : "neutral";

    const rsiSignal = indicators.rsi_zone === "oversold" ? "Oversold (Buy)" : indicators.rsi_zone === "overbought" ? "Overbought (Sell)" : "Neutral";
    const rsiType = indicators.rsi_zone === "oversold" ? "bullish" : indicators.rsi_zone === "overbought" ? "bearish" : "neutral";

    const trendSignal = (history.avg_3day || 0) > 0.5 ? "Strong Up" : (history.avg_3day || 0) < -0.5 ? "Strong Down" : "Sideways";
    const trendType = (history.avg_3day || 0) > 0.5 ? "bullish" : (history.avg_3day || 0) < -0.5 ? "bearish" : "neutral";

    return (
        <div className="w-full mx-auto pb-12 space-y-8 animate-in fade-in duration-500">

            {/* Top Navigation */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                <button onClick={() => router.push("/")} className="hover:text-primary transition-colors">Home</button>
                <span className="text-muted-foreground/30">/</span>
                <button onClick={() => router.push("/stocks")} className="hover:text-primary transition-colors">Insights</button>
                <span className="text-muted-foreground/30">/</span>
                <span className="font-semibold text-foreground">{stock.symbol}</span>
            </nav>

            {/* Header Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Overview Panel */}
                <div className="lg:col-span-2 bg-card rounded-3xl p-6 border border-border shadow-sm dark:shadow-md flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full uppercase tracking-wide">F&O</span>
                            <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full uppercase tracking-wide">Large Cap</span>
                            <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-bold rounded-full uppercase tracking-wide">{stock.sector}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-1">{stock.name || stock.symbol}</h1>
                        <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                            {stock.symbol} • NSE
                        </div>
                    </div>

                    <div className="mt-8 flex items-end gap-6 relative z-10">
                        <div>
                            <div className="text-sm text-muted-foreground mb-1 font-medium">Current Price</div>
                            <div className="text-4xl font-bold text-foreground font-mono">₹{stock.current_price.toFixed(2)}</div>
                        </div>
                        <div className="mb-1">
                            <div className={cn("flex items-center gap-1 text-lg font-bold px-3 py-1 rounded-lg", getBgColor(stock.current_change), getTrendColor(stock.current_change))}>
                                {stock.current_change > 0 ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                                {Math.abs(stock.current_change).toFixed(2)}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Sparkline Panel */}
                <div className="bg-card rounded-3xl p-6 border border-border shadow-sm dark:shadow-md flex flex-col justify-center relative overflow-hidden">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-4 absolute top-6 left-6">Price Trend (60D)</h3>
                    <div className="h-[120px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stock.chart_data}>
                                <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={2} fill="url(#colorGradient)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between items-center mt-2 px-2">
                        <div className="text-xs text-muted-foreground">Low: ₹{Math.min(...stock.chart_data.map((d: any) => d.close)).toFixed(0)}</div>
                        <div className="text-xs text-muted-foreground">High: ₹{Math.max(...stock.chart_data.map((d: any) => d.close)).toFixed(0)}</div>
                    </div>
                </div>
            </div>

            {/* Key Signals Module */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <SignalCard title="Trend (3D)" status={trendSignal} type={trendType} />
                <SignalCard title="MACD" status={macdSignal} type={macdType} />
                <SignalCard title="RSI" status={rsiSignal} type={rsiType} />
                <SignalCard title="Volume" status={flags.is_high_volume ? "High" : "Normal"} type={flags.is_high_volume ? "bullish" : "neutral"} />
            </div>

            {/* Tabs & Content */}
            <div>
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    {tabs.map(tab => <TabButton key={tab} name={tab} />)}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {activeTab === "Overview" && (
                            <>
                                <MetricCard label="Market Cap" value={`₹${((stock.market_cap || 0) / 10000000).toFixed(0)} Cr`} icon={Layers} />
                                <MetricCard label="PE Ratio" value={stock.pe_ratio?.toFixed(2) || "-"} />
                                <MetricCard label="Industry PE" value={stock.industry_pe?.toFixed(2) || "-"} />
                                <MetricCard label="52W High" value={`₹${stock.fifty_two_week_high?.toFixed(2) || "-"}`} colorClass="text-green-600 dark:text-green-400" />
                                <MetricCard label="52W Low" value={`₹${stock.fifty_two_week_low?.toFixed(2) || "-"}`} colorClass="text-red-600 dark:text-red-400" />
                                <MetricCard label="Volume" value={`${(stock.volume / 1000000).toFixed(2)}M`} icon={BarChart3} />
                            </>
                        )}

                        {activeTab === "Technicals" && (
                            <>
                                <MetricCard label="RSI (14)" value={indicators.rsi_value?.toFixed(1)} subValue={indicators.rsi_zone} colorClass={getRsiColor(indicators.rsi_value || 50)} icon={Activity} />
                                <MetricCard label="50 DMA" value={`₹${stock.dma_50?.toFixed(2) || "-"}`} />
                                <MetricCard label="200 DMA" value={`₹${stock.dma_200?.toFixed(2) || "-"}`} />
                                <MetricCard label="MTF Eligibility" value={stock.mtf_eligibility ? "Eligible" : "Not Eligible"} colorClass={stock.mtf_eligibility ? "text-green-600" : "text-gray-500"} icon={ShieldCheck} />
                                <MetricCard label="Margin Pledge" value={`${stock.margin_pledge_pct || 0}%`} colorClass={getPledgeColor(stock.margin_pledge_pct || 0)} icon={AlertCircle} />
                                <MetricCard label="MACD Status" value={indicators.macd_status} colorClass={macdType === "bullish" ? "text-green-600" : macdType === "bearish" ? "text-red-600" : "text-gray-500"} icon={Zap} />
                            </>
                        )}

                        {activeTab === "Fundamentals" && (
                            <>
                                <MetricCard label="PB Ratio" value={stock.pb_ratio?.toFixed(2) || "-"} />
                                <MetricCard label="Dividend Yield" value={`${stock.dividend_yield?.toFixed(2)}%`} colorClass="text-green-600" />
                                <MetricCard label="ROE" value={`${stock.roe?.toFixed(2)}%`} colorClass={getTrendColor(stock.roe)} />
                                <MetricCard label="ROCE" value={`${stock.roce?.toFixed(2)}%`} colorClass={getTrendColor(stock.roce)} />
                                <MetricCard label="EPS (TTM)" value={`₹${stock.eps?.toFixed(2) || "-"}`} />
                            </>
                        )}

                        {activeTab === "Performance" && (
                            <>
                                <MetricCard label="1 Month" value={`${stock.returns?.["1M"]}%`} colorClass={getTrendColor(stock.returns?.["1M"])} icon={Clock} />
                                <MetricCard label="3 Months" value={`${stock.returns?.["3M"]}%`} colorClass={getTrendColor(stock.returns?.["3M"])} icon={Clock} />
                                <MetricCard label="1 Year" value={`${stock.returns?.["1Y"]}%`} colorClass={getTrendColor(stock.returns?.["1Y"])} icon={Clock} />
                                <MetricCard label="3 Years" value={`${stock.returns?.["3Y"]}%`} colorClass={getTrendColor(stock.returns?.["3Y"])} icon={Clock} />
                                <MetricCard label="5 Years" value={`${stock.returns?.["5Y"]}%`} colorClass={getTrendColor(stock.returns?.["5Y"])} icon={Clock} />
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Main Chart Section (Always visible at bottom) */}
            <div className="bg-card p-6 rounded-3xl border border-border shadow-sm dark:shadow-md">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" /> Price History
                    </h3>
                    <div className="flex gap-2">
                        <span className="text-xs font-medium px-2 py-1 bg-muted rounded text-muted-foreground">Daily</span>
                    </div>
                </div>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stock.chart_data}>
                            <defs>
                                <linearGradient id="mainChartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                stroke="#9ca3af"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                domain={['auto', 'auto']}
                                stroke="#9ca3af"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => `₹${val}`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--foreground)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="close"
                                stroke="#2563eb"
                                strokeWidth={3}
                                fill="url(#mainChartGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

// Missing icon import shim
function ShieldCheck(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
