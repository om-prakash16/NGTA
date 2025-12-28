"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Plus, Trash2, Search, TrendingUp, AlertCircle, Globe, ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stock {
    symbol: string;
    current_price: number;
    rank: number;
    current_change_pct: number;
}

export default function ManageStocks() {
    const { token } = useAuth();
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [viewMode, setViewMode] = useState<'watchlist' | 'fno'>('watchlist');
    const [newSymbol, setNewSymbol] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchStocks = async () => {
        setIsLoading(true);
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || 'http://localhost:8000';
            const endpoint = viewMode === 'watchlist'
                ? `${baseUrl}/api/v1/watchlist`
                : `${baseUrl}/api/v1/stocks/fno`;

            const res = await fetch(endpoint);
            const data = await res.json();
            setStocks(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch stocks", error);
            setStocks([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStocks();
    }, [viewMode]);

    const handleAddStock = async (symbol: string) => {
        if (!symbol) return;

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || 'http://localhost:8000';
            const res = await fetch(`${baseUrl}/api/v1/admin/stocks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ symbol: symbol.toUpperCase(), action: "add" })
            });

            if (res.ok) {
                setNewSymbol("");
                if (viewMode === 'watchlist') fetchStocks();
                alert(`Added ${symbol} to watchlist`);
            } else {
                alert("Failed to add stock");
            }
        } catch (error) {
            console.error(error);
            alert("Error adding stock");
        }
    };

    const handleDeleteStock = async (symbol: string) => {
        if (!confirm(`Are you sure you want to delete ${symbol}?`)) return;

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || 'http://localhost:8000';
            const res = await fetch(`${baseUrl}/api/v1/admin/stocks/${symbol}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                fetchStocks();
            } else {
                alert("Failed to delete stock");
            }
        } catch (error) {
            console.error(error);
            alert("Error deleting stock");
        }
    };

    const filteredStocks = stocks.filter(stock =>
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white">Manage Stocks</h2>
                    <p className="text-gray-400 mt-1">
                        {viewMode === 'watchlist' ? "Managing your global watchlist." : "Browsing full F&O market list."}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-gray-800/50 p-1 rounded-lg border border-gray-700">
                        <button
                            onClick={() => setViewMode('watchlist')}
                            className={cn(
                                "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                                viewMode === 'watchlist'
                                    ? "bg-blue-600 text-white shadow-lg"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <ListFilter className="w-4 h-4" />
                            Watchlist
                        </button>
                        <button
                            onClick={() => setViewMode('fno')}
                            className={cn(
                                "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                                viewMode === 'fno'
                                    ? "bg-blue-600 text-white shadow-lg"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Globe className="w-4 h-4" />
                            All F&O
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Stock Form (Only in Watchlist Mode) */}
            {viewMode === 'watchlist' && (
                <div className="bg-[#0F172A]/60 backdrop-blur-xl p-6 rounded-2xl border border-gray-800 shadow-xl">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-blue-400" />
                        Add New Stock
                    </h3>
                    <form onSubmit={(e) => { e.preventDefault(); handleAddStock(newSymbol); }} className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Enter Stock Symbol (e.g., RELIANCE)"
                                value={newSymbol}
                                onChange={(e) => setNewSymbol(e.target.value)}
                                className="w-full bg-[#0B1221] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25"
                        >
                            <Plus className="w-5 h-5" />
                            Add Stock
                        </button>
                    </form>
                </div>
            )}

            {/* Search Bar for List */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder={`Search in ${viewMode === 'watchlist' ? 'watchlist' : 'F&O list'}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0F172A]/60 backdrop-blur-xl border border-gray-800 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                />
            </div>

            {/* Stocks List */}
            <div className="bg-[#0F172A]/60 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
                {isLoading ? (
                    <div className="p-12 flex justify-center">
                        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-900/50 border-b border-gray-800">
                            <tr>
                                <th className="p-5 text-gray-400 font-medium text-sm uppercase tracking-wider">Symbol</th>
                                <th className="p-5 text-gray-400 font-medium text-sm uppercase tracking-wider">Price</th>
                                <th className="p-5 text-gray-400 font-medium text-sm uppercase tracking-wider">Rank</th>
                                <th className="p-5 text-gray-400 font-medium text-sm uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {filteredStocks.map((stock) => (
                                <tr key={stock.symbol} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center font-bold text-gray-400 group-hover:text-white group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-all">
                                                {stock.symbol[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">{stock.symbol}</p>
                                                <p className="text-xs text-gray-500">NSE</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="font-medium text-white">₹{stock.current_price.toFixed(2)}</div>
                                    </td>
                                    <td className="p-5">
                                        <div className={cn(
                                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                            stock.rank <= 10
                                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                                : "bg-gray-800 text-gray-400 border-gray-700"
                                        )}>
                                            #{stock.rank}
                                        </div>
                                    </td>
                                    <td className="p-5 text-right">
                                        {viewMode === 'watchlist' ? (
                                            <button
                                                onClick={() => handleDeleteStock(stock.symbol)}
                                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                title="Remove from Watchlist"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleAddStock(stock.symbol)}
                                                className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                title="Add to Watchlist"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredStocks.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-500">
                                            <AlertCircle className="w-10 h-10 opacity-50" />
                                            <p>No stocks found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
