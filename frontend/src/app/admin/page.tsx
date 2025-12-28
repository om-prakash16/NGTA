"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { TrendingUp, FileText, Users, Activity, Server, Database, ArrowUpRight, Clock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
    const { token } = useAuth();
    const [stats, setStats] = useState({
        stocks: 0,
        blogs: 0,
        users: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || 'http://localhost:8000';
                const stocksRes = await fetch(`${baseUrl}/api/v1/watchlist`);
                const stocksData = await stocksRes.json();

                const blogsRes = await fetch(`${baseUrl}/api/v1/blogs`);
                const blogsData = await blogsRes.json();

                setStats({
                    stocks: Array.isArray(stocksData) ? stocksData.length : 0,
                    blogs: Array.isArray(blogsData) ? blogsData.length : 0,
                    users: 1 // Just the current user for now
                });
            } catch (error) {
                console.error("Failed to fetch stats", error);
            }
        };

        if (token) {
            fetchStats();
        }
    }, [token]);

    const statCards = [
        {
            title: "Tracked Stocks",
            value: stats.stocks,
            icon: TrendingUp,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            trend: "+12.5%",
            trendUp: true
        },
        {
            title: "Published Blogs",
            value: stats.blogs,
            icon: FileText,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20",
            trend: "+4.3%",
            trendUp: true
        },
        {
            title: "Total Users",
            value: stats.users,
            icon: Users,
            color: "text-green-400",
            bg: "bg-green-500/10",
            border: "border-green-500/20",
            trend: "+2.1%",
            trendUp: true
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white">Dashboard Overview</h2>
                    <p className="text-gray-400 mt-1">Welcome back, here's what's happening today.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className={cn("bg-[#0F172A]/60 backdrop-blur-xl p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1", stat.border)}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("p-3 rounded-xl", stat.bg)}>
                                <stat.icon className={cn("w-6 h-6", stat.color)} />
                            </div>
                            <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                                <ArrowUpRight className="w-3 h-3" />
                                {stat.trend}
                            </div>
                        </div>
                        <h3 className="text-gray-400 font-medium text-sm">{stat.title}</h3>
                        <p className="text-4xl font-bold text-white mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* System Health Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#0F172A]/60 backdrop-blur-xl p-8 rounded-2xl border border-gray-800">
                    <div className="flex items-center gap-3 mb-6">
                        <Activity className="w-5 h-5 text-blue-400" />
                        <h3 className="text-lg font-semibold text-white">System Health</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400 flex items-center gap-2">
                                    <Server className="w-4 h-4" /> CPU Usage
                                </span>
                                <span className="text-blue-400 font-medium">24%</span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full w-[24%] bg-blue-500 rounded-full" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400 flex items-center gap-2">
                                    <Database className="w-4 h-4" /> Memory Usage
                                </span>
                                <span className="text-purple-400 font-medium">58%</span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full w-[58%] bg-purple-500 rounded-full" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400 flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> API Latency
                                </span>
                                <span className="text-green-400 font-medium">45ms</span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full w-[15%] bg-green-500 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-8 rounded-2xl border border-blue-500/10 flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
                        <ShieldCheck className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Admin Access Secure</h3>
                    <p className="text-gray-400 max-w-xs">
                        You are logged in with superuser privileges. All system modifications are logged for security.
                    </p>
                </div>
            </div>
        </div>
    );
}
