import { BarChart2, Zap, Activity, TrendingUp, Shield, Clock } from "lucide-react";

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-500">
                        How Trade Analyzer Works
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Understanding the logic behind our advanced F&O stock analysis.
                    </p>
                </div>

                {/* Core Concept */}
                <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            <Shield className="w-8 h-8" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold">The Core Philosophy</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Trade Analyzer is built on the principle of <strong>Stability & Strength</strong>. Unlike traditional screeners that chase high volatility, we focus on identifying stocks with consistent, strong trends. Our proprietary ranking algorithm prioritizes stocks that show steady movement, filtering out noise and manipulation.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* 3-Day Average */}
                    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                            <Clock className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-semibold">3-Day Average Logic</h3>
                        <p className="text-sm text-muted-foreground">
                            We calculate the average percentage change over the last 3 <strong>trading days</strong> (excluding weekends and holidays). This smooths out daily fluctuations and reveals the true trend direction.
                        </p>
                        <div className="bg-muted p-3 rounded-lg text-xs font-mono">
                            avg_3day = (Day1% + Day2% + Day3%) / 3
                        </div>
                    </div>

                    {/* Strength Meter */}
                    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                        <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center text-green-500">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-semibold">Strength Meter</h3>
                        <p className="text-sm text-muted-foreground">
                            Our Strength Meter analyzes multiple factors—Price Action, RSI, MACD, and Volume—to determine who is in control: <strong>Buyers</strong> or <strong>Sellers</strong>.
                        </p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                            <li>Buyers Dominating: Strong upward pressure</li>
                            <li>Sellers Dominating: Strong downward pressure</li>
                            <li>Balanced: Indecisive market</li>
                        </ul>
                    </div>

                    {/* Indicators */}
                    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-500">
                            <Activity className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-semibold">Technical Indicators</h3>
                        <p className="text-sm text-muted-foreground">
                            We use standard technical indicators with strict zoning:
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-2">
                            <li className="flex items-center gap-2">
                                <span className="font-semibold">RSI:</span>
                                <span>Overbought (&gt;70), Oversold (&lt;30), Neutral</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="font-semibold">MACD:</span>
                                <span>Above Zero (Bullish), Below Zero (Bearish)</span>
                            </li>
                        </ul>
                    </div>

                    {/* Ranking System */}
                    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                        <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-500">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-semibold">Smart Ranking</h3>
                        <p className="text-sm text-muted-foreground">
                            Stocks are ranked based on their stability. We look for stocks where the 3-Day Average Change is closest to zero, indicating a potential breakout or stable accumulation phase, or sort by highest strength for momentum trading.
                        </p>
                    </div>
                </div>

                {/* User Guide Section */}
                <div className="space-y-8 pt-8 border-t border-border">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
                            User Guide
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Get the most out of Trade Analyzer with this step-by-step guide.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 text-left">
                        {/* Step 1: Dashboard */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">1</div>
                                <h3 className="text-xl font-semibold">The Dashboard</h3>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Your command center. At the top, see the <strong>Market Sentiment</strong> and top movers. The main table lists all F&O stocks ranked by stability (closest to 0% change).
                            </p>
                            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-2 pl-2">
                                <li>Use the <strong>Search Bar</strong> to find specific stocks.</li>
                                <li>Click <strong>Filter Pills</strong> (e.g., "Gainers Only") for quick sorting.</li>
                            </ul>
                        </div>

                        {/* Step 2: Advanced Filters */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">2</div>
                                <h3 className="text-xl font-semibold">Advanced Filters</h3>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Need more precision? Click the <strong>Filter Icon</strong> to open the sidebar.
                            </p>
                            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-2 pl-2">
                                <li>Filter by <strong>Price Range</strong> (e.g., ₹100 - ₹5000).</li>
                                <li>Select specific <strong>Sectors</strong> (e.g., IT, Banking).</li>
                                <li>Isolate stocks by <strong>Trend</strong> (Bullish/Bearish).</li>
                            </ul>
                        </div>

                        {/* Step 3: Stock Details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">3</div>
                                <h3 className="text-xl font-semibold">Stock Insights</h3>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Click any stock row to open its detailed view.
                            </p>
                            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-2 pl-2">
                                <li><strong>Overview:</strong> Key stats like Market Cap, 52W High/Low.</li>
                                <li><strong>Technicals:</strong> RSI, MACD, and Moving Averages (50/200 DMA).</li>
                                <li><strong>Interactive Charts:</strong> Zoom into price history.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="text-center py-8">
                        <p className="text-muted-foreground mb-6">
                            Ready to analyze the market?
                        </p>
                        <a
                            href="/"
                            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-colors shadow-lg hover:shadow-xl"
                        >
                            Go to Dashboard
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
