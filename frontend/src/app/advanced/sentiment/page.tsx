"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BrainCircuit, Newspaper, TrendingUp, AlertTriangle, Zap } from "lucide-react";
import { motion } from "framer-motion";

const API_URL = (process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000") + "/api/v1";

interface NewsItem {
    title: string;
    source: string;
    time: string;
    sentiment: "bullish" | "bearish" | "neutral";
    score: number;
}

interface SentimentData {
    market_sentiment_score: number;
    sentiment_label: string;
    news_analysis: NewsItem[];
    trending_bullish: string[];
    trending_bearish: string[];
}

export default function SentimentLabPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["advanced-sentiment"],
        queryFn: async () => {
            const { data } = await axios.get<SentimentData>(`${API_URL}/advanced/sentiment`);
            return data;
        },
    });

    if (isLoading) return <div className="p-8 text-center animate-pulse">Analyzing Market Sentiment...</div>;
    if (!data) return null;

    // Determine Gauge Color
    const score = data.market_sentiment_score;
    const gaugeColor = score > 60 ? "bg-emerald-500" : score < 40 ? "bg-red-500" : "bg-yellow-500";
    const gaugeText = score > 60 ? "text-emerald-500" : score < 40 ? "text-red-500" : "text-yellow-500";

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-500">
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <BrainCircuit className="w-8 h-8 text-purple-500" />
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                        AI Sentiment Lab
                    </h1>
                </div>
                <p className="text-muted-foreground">
                    Real-time market mood analysis using Natural Language Processing (NLP) on news headlines.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Sentiment Meter */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card rounded-3xl border p-8 text-center shadow-lg relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

                        <h3 className="text-xl font-bold mb-8">Market Fear & Greed</h3>

                        <div className="relative w-48 h-24 mx-auto mb-4 overflow-hidden">
                            {/* Gauge SVG Background */}
                            <div className="absolute inset-0 w-full h-full bg-secondary rounded-t-full opacity-30" />
                            {/* Gauge Fill */}
                            <motion.div
                                initial={{ rotate: -90 }}
                                animate={{ rotate: (score / 100) * 180 - 90 }}
                                transition={{ duration: 1.5, type: "spring" }}
                                className={`absolute bottom-0 left-0 right-0 h-full origin-bottom rounded-t-full opacity-80 ${gaugeColor}`}
                            />
                        </div>

                        <div className="text-5xl font-black font-mono mb-2">{score}</div>
                        <div className={`text-xl font-bold uppercase tracking-widest ${gaugeText}`}>
                            {data.sentiment_label}
                        </div>
                    </div>

                    {/* Trending Lists */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-500 mb-3 uppercase tracking-wider">
                                <TrendingUp className="w-4 h-4" /> AI Bullish Picks
                            </h4>
                            <div className="space-y-2">
                                {data.trending_bullish.map(sym => (
                                    <div key={sym} className="font-mono font-bold">{sym}</div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-red-500 mb-3 uppercase tracking-wider">
                                <AlertTriangle className="w-4 h-4" /> AI Bearish Picks
                            </h4>
                            <div className="space-y-2">
                                {data.trending_bearish.map(sym => (
                                    <div key={sym} className="font-mono font-bold">{sym}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: AI News Feed */}
                <div className="lg:col-span-2">
                    <div className="bg-card rounded-2xl border shadow-sm">
                        <div className="p-6 border-b flex items-center justify-between">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Newspaper className="w-5 h-5 text-primary" /> Analyzed News Feed
                            </h3>
                            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">Live Updates</span>
                        </div>
                        <div className="divide-y divide-border/50">
                            {data.news_analysis.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-6 hover:bg-muted/30 transition-colors group"
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <h4 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors mb-2">
                                                {item.title}
                                            </h4>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <span>{item.source}</span>
                                                <span>•</span>
                                                <span>{item.time}</span>
                                            </div>
                                        </div>

                                        <div className={`flex flex-col items-end min-w-[100px]`}>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase mb-1 ${item.sentiment === 'bullish' ? 'bg-emerald-500/10 text-emerald-500' :
                                                item.sentiment === 'bearish' ? 'bg-red-500/10 text-red-500' :
                                                    'bg-yellow-500/10 text-yellow-500'
                                                }`}>
                                                {item.sentiment}
                                            </span>
                                            <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground" title="AI Confidence Score">
                                                <Zap className="w-3 h-3" />
                                                {Math.abs(item.score).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
