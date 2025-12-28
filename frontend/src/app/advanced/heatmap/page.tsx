"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Layers, RefreshCw, Box } from "lucide-react";
import { motion } from "framer-motion";

const API_URL = (process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000") + "/api/v1";

interface SectorData {
    name: string;
    change: number;
    volume: number;
    top_stock: string;
}

interface HeatmapResponse {
    timestamp: string;
    sectors: SectorData[];
}

export default function SectorHeatmapPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["advanced-heatmap"],
        queryFn: async () => {
            const { data } = await axios.get<HeatmapResponse>(`${API_URL}/advanced/heatmap`);
            return data;
        },
    });

    if (isLoading) return <div className="p-8 text-center animate-pulse">Loading Sector Heatmap...</div>;
    if (!data) return null;

    // Helper to size blocks based on volume (simple normalized sizing)
    const maxVol = Math.max(...data.sectors.map(s => s.volume));

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-500 h-[calc(100vh-100px)] flex flex-col">
            <header className="flex-none">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <Layers className="w-8 h-8 text-blue-500" />
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                            Live Sector Heatmap
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Live
                    </div>
                </div>
                <p className="text-muted-foreground">
                    Visualizing aggregated sector performance. Size represents Volume, Color represents Change.
                </p>
            </header>

            <div className="flex-1 w-full bg-card rounded-xl border p-1 shadow-sm overflow-hidden relative">
                <div className="absolute inset-0 flex flex-wrap content-start">
                    {data.sectors.map((sector, idx) => {
                        // Sizing logic: simple proportional width based on random layout for now (CSS Grid would be better for real treemap)
                        // Using flex-grow with base size logic
                        const volScore = Math.max(0.5, (sector.volume / maxVol));

                        const bgClass =
                            sector.change > 2.0 ? "bg-emerald-600" :
                                sector.change > 0.5 ? "bg-emerald-500" :
                                    sector.change > 0 ? "bg-emerald-400" :
                                        sector.change > -0.5 ? "bg-red-400" :
                                            sector.change > -2.0 ? "bg-red-500" : "bg-red-600";

                        return (
                            <motion.div
                                key={sector.name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`
                                    relative p-4 border-2 border-background 
                                    text-white flex flex-col justify-center items-center text-center
                                    cursor-pointer hover:brightness-110 transition-all
                                    ${bgClass}
                                `}
                                style={{
                                    flexGrow: volScore * 10,
                                    width: `${Math.max(15, volScore * 30)}%`, // Dynamic width
                                    height: '50%' // Two rows roughly
                                }}
                            >
                                <div className="font-bold text-lg md:text-xl truncate w-full px-2">{sector.name}</div>
                                <div className="text-2xl md:text-3xl font-black my-1">
                                    {sector.change > 0 ? "+" : ""}{sector.change.toFixed(2)}%
                                </div>
                                <div className="mt-2 text-xs md:text-sm font-medium opacity-90 bg-black/20 px-2 py-1 rounded">
                                    Top: {sector.top_stock}
                                </div>
                                <div className="absolute top-2 right-2 opacity-50">
                                    <Box className="w-4 h-4" />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
