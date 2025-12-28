"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { BarChart2, TrendingUp, TrendingDown, Target, Activity, AlertCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const OptionsChart = dynamic(() => import("@/components/advanced/OptionsChart"), {
    loading: () => <div className="h-[400px] w-full flex items-center justify-center bg-muted/10 animate-pulse text-muted-foreground">Loading Options Chart...</div>,
    ssr: false
});

const API_URL = (process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000") + "/api/v1";

interface OptionStrike {
    strike: number;
    call_oi: number;
    put_oi: number;
    call_volume: number;
    put_volume: number;
}

interface OptionData {
    symbol: string;
    spot_price: number;
    pcr: number;
    max_pain: number;
    atm_strike: number;
    expiry: string;
    option_chain: OptionStrike[];
}

function OptionsContent() {
    const searchParams = useSearchParams();
    const symbol = searchParams.get("symbol") || "NIFTY";

    const { data, isLoading, error } = useQuery({
        queryKey: ["advanced-options", symbol],
        queryFn: async () => {
            const { data } = await axios.get<OptionData>(`${API_URL}/advanced/options/${symbol}`);
            return data;
        },
        refetchInterval: 30000,
    });

    if (isLoading) return <div className="p-8 text-center animate-pulse">Loading Options Intelligence...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Failed to load data</div>;

    if (!data) return null;

    const pcrColor = data.pcr > 1.2 ? "text-emerald-500" : data.pcr < 0.8 ? "text-red-500" : "text-yellow-500";
    const pcrLabel = data.pcr > 1.2 ? "Bullish" : data.pcr < 0.8 ? "Bearish" : "Neutral";

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            <header className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <Target className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                        Options Intelligence
                    </h1>
                </div>
                <p className="text-muted-foreground">Deep dive into Open Interest, PCR, and Max Pain for <strong>{symbol}</strong></p>
            </header>

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatsCard
                    title="Spot Price"
                    value={data.spot_price.toLocaleString()}
                    icon={Activity}
                    subValue={`ATM: ${data.atm_strike}`}
                />
                <StatsCard
                    title="Put-Call Ratio (PCR)"
                    value={data.pcr.toFixed(2)}
                    valueColor={pcrColor}
                    icon={BarChart2}
                    subValue={pcrLabel}
                />
                <StatsCard
                    title="Max Pain"
                    value={data.max_pain.toLocaleString()}
                    icon={Target}
                    subValue={`Expiry: ${data.expiry}`}
                    highlight
                />
                <StatsCard
                    title="Total OI"
                    value={(data.option_chain.reduce((acc, curr) => acc + curr.call_oi + curr.put_oi, 0) / 1000).toFixed(1) + "k"}
                    icon={TrendingUp}
                    subValue="Contracts"
                />
            </div>

            {/* Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main OI Chart */}
                <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-sm">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-primary" /> Open Interest Distribution
                    </h3>
                    <OptionsChart data={data.option_chain} />
                </div>

                {/* Insights Panel */}
                <div className="space-y-4">
                    <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex gap-3 items-start">
                        <Target className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-primary mb-1">Max Pain Insight</h4>
                            <p className="text-sm">
                                Market is likely to expire near <strong>{data.max_pain}</strong> to cause maximum loss to option buyers.
                            </p>
                        </div>
                    </div>

                    <div className="bg-card rounded-2xl border p-6">
                        <h3 className="font-semibold mb-4 text-lg">Quick Interpretation</h3>
                        <div className="space-y-4 text-sm text-muted-foreground">
                            <div className="flex gap-3">
                                <div className="w-1 bg-red-500 rounded-full h-full min-h-[40px]" />
                                <div>
                                    <strong className="text-foreground block">Call OI &gt; Put OI</strong>
                                    Indicates <strong>Resistance</strong>. Traders are betting the price won't go above this level.
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-1 bg-green-500 rounded-full h-full min-h-[40px]" />
                                <div>
                                    <strong className="text-foreground block">Put OI &gt; Call OI</strong>
                                    Indicates <strong>Support</strong>. Traders are betting the price won't fall below this level.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon: Icon, subValue, highlight, valueColor }: any) {
    return (
        <div className={`p-6 rounded-2xl border ${highlight ? 'bg-primary/10 border-primary-20 ring-1 ring-primary/20' : 'bg-card border-border'} shadow-sm transition-all hover:-translate-y-1`}>
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">{title}</span>
                <div className={`p-2 rounded-lg ${highlight ? 'bg-background' : 'bg-secondary'}`}>
                    <Icon className="w-4 h-4 text-primary" />
                </div>
            </div>
            <div className={`text-3xl font-bold font-mono ${valueColor || ''}`}>
                {value}
            </div>
            {subValue && (
                <div className="text-xs text-muted-foreground mt-1 font-medium">
                    {subValue}
                </div>
            )}
        </div>
    );
}

export default function OptionsIntelligencePage() {
    return (
        <Suspense fallback={<div className="p-8 text-center animate-pulse">Loading Options Module...</div>}>
            <OptionsContent />
        </Suspense>
    );
}
