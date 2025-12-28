"use client";

import { Stock, useStockDetail, ChartDataPoint } from "@/hooks/useStocks";
import { X, TrendingUp, TrendingDown, Activity, BarChart2 } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, ComposedChart, ReferenceLine, Area, AreaChart } from "recharts";
import { format } from "date-fns";
import { useState } from "react";

interface StockDetailModalProps {
    stock: Stock | null;
    onClose: () => void;
}

export default function StockDetailModal({ stock: initialStock, onClose }: StockDetailModalProps) {
    // We use the hook to fetch detailed data including chart_data
    const { data: detailedStock, isLoading } = useStockDetail(initialStock?.symbol || null);

    // Use detailed stock if available, otherwise fallback to initial stock (which has no chart data)
    const stock = detailedStock || initialStock;

    if (!stock) return null;

    const chartData = stock.chart_data || [];
    const hasChartData = chartData.length > 0;

    // Calculate price change for header
    const isPositive = stock.current_change >= 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl w-full max-w-6xl max-h-[95vh] overflow-y-auto shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{stock.symbol}</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">{stock.name}</p>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white">₹{stock.current_price.toFixed(2)}</div>
                            <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                {stock.current_change_abs > 0 ? '+' : ''}{stock.current_change_abs.toFixed(2)} ({stock.current_change.toFixed(2)}%)
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors group">
                        <X className="w-6 h-6 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                    {/* Main Chart Area (2/3 width) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Price & Volume Chart */}
                        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700 h-[400px] flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> Price & Volume
                                </h3>
                                <div className="flex gap-2">
                                    {/* Timeframe selectors could go here */}
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="flex-1 flex items-center justify-center text-gray-500">Loading Chart Data...</div>
                            ) : hasChartData ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="date"
                                            stroke="#4b5563"
                                            fontSize={10}
                                            tickFormatter={(str) => format(new Date(str), 'MMM d')}
                                            minTickGap={30}
                                        />
                                        <YAxis
                                            yAxisId="left"
                                            domain={['auto', 'auto']}
                                            stroke="#4b5563"
                                            fontSize={10}
                                            tickFormatter={(val) => `₹${val}`}
                                        />
                                        <YAxis
                                            yAxisId="right"
                                            orientation="right"
                                            stroke="#4b5563"
                                            fontSize={10}
                                            tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6' }}
                                            itemStyle={{ color: '#f3f4f6' }}
                                            labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                                        />
                                        <Area
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="close"
                                            stroke="#3b82f6"
                                            fillOpacity={1}
                                            fill="url(#colorPrice)"
                                            strokeWidth={2}
                                            name="Price"
                                        />
                                        <Bar
                                            yAxisId="right"
                                            dataKey="volume"
                                            fill="#374151"
                                            opacity={0.5}
                                            name="Volume"
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-500">No chart data available</div>
                            )}
                        </div>

                        {/* Indicators (MACD & RSI) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[200px]">
                            {/* MACD */}
                            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700 flex flex-col">
                                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">MACD</h3>
                                {hasChartData ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={chartData}>
                                            <XAxis dataKey="date" hide />
                                            <YAxis domain={['auto', 'auto']} hide />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '12px' }}
                                                labelStyle={{ display: 'none' }}
                                            />
                                            <Line type="monotone" dataKey="macd" stroke="#3b82f6" dot={false} strokeWidth={1.5} />
                                            <Line type="monotone" dataKey="signal" stroke="#f59e0b" dot={false} strokeWidth={1.5} />
                                            <Bar dataKey="hist" fill="#10b981" />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                ) : <div className="flex-1 bg-gray-800/20 rounded animate-pulse" />}
                            </div>

                            {/* RSI */}
                            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700 flex flex-col">
                                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">RSI (14)</h3>
                                {hasChartData ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData}>
                                            <XAxis dataKey="date" hide />
                                            <YAxis domain={[0, 100]} hide />
                                            <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" />
                                            <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '12px' }}
                                                labelStyle={{ display: 'none' }}
                                            />
                                            <Line type="monotone" dataKey="rsi" stroke="#8b5cf6" dot={false} strokeWidth={1.5} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : <div className="flex-1 bg-gray-800/20 rounded animate-pulse" />}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Stats (1/3 width) */}
                    <div className="space-y-6">
                        {/* Key Stats Grid */}
                        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                                <BarChart2 className="w-4 h-4" /> Market Stats
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Day High</div>
                                    <div className="font-mono text-gray-900 dark:text-white">₹{stock.day_high.toFixed(2)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Day Low</div>
                                    <div className="font-mono text-gray-900 dark:text-white">₹{stock.day_low.toFixed(2)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Prev Close</div>
                                    <div className="font-mono text-gray-900 dark:text-white">₹{stock.previous_close.toFixed(2)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Volume</div>
                                    <div className="font-mono text-gray-900 dark:text-white">{(stock.volume / 1000000).toFixed(2)}M</div>
                                </div>
                            </div>
                        </div>

                        {/* Technical Summary */}
                        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Technical Summary</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Trend</span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${stock.indicators.trend === 'uptrend' ? 'bg-green-500/10 text-green-500' :
                                        stock.indicators.trend === 'downtrend' ? 'bg-red-500/10 text-red-500' : 'bg-gray-500/10 text-gray-500 dark:text-gray-400'
                                        }`}>{stock.indicators.trend}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">RSI Status</span>
                                    <span className={`text-sm font-medium ${stock.indicators.rsi_zone === 'overbought' ? 'text-red-500 dark:text-red-400' :
                                        stock.indicators.rsi_zone === 'oversold' ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-300'
                                        }`}>{stock.indicators.rsi_zone.replace('_', ' ')}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400">MACD Signal</span>
                                <span className={`text-sm font-medium ${stock.indicators.macd_status.includes('bullish') ? 'text-green-500 dark:text-green-400' :
                                    stock.indicators.macd_status.includes('bearish') ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-300'
                                    }`}>{stock.indicators.macd_status.replace('_', ' ')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Strength Meter */}
                    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Market Sentiment</h3>
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-green-400">Buyers {stock.indicators.buyer_strength_score}%</span>
                            <span className="text-red-400">Sellers {stock.indicators.seller_strength_score}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden flex mb-2">
                            <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${stock.indicators.buyer_strength_score}%` }} />
                            <div className="bg-red-500 h-full transition-all duration-500" style={{ width: `${stock.indicators.seller_strength_score}%` }} />
                        </div>
                        <div className="text-center text-sm font-medium text-gray-900 dark:text-white">
                            {stock.indicators.strength_label}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
