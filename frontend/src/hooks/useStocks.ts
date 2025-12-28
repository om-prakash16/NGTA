import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";

// ... existing code ...

export function useGrowwStrength(filters: any) {
    return useQuery({
        queryKey: ["groww-strength", filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    params.append(key, String(value));
                }
            });
            const { data } = await axios.get<StockStrength[]>(`${API_URL}/stocks/strength-analyzer`, { params });
            return data;
        },
        refetchInterval: 15000,
        staleTime: 10000, // Data fresh for 10s
        placeholderData: keepPreviousData, // Instant load on filter change
    });
}
import axios from "axios";

// Types
export interface ChartDataPoint {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    macd?: number;
    signal?: number;
    hist?: number;
    rsi?: number;
}

export interface Stock {
    symbol: string;
    name: string;
    sector: string;
    current_price: number;
    previous_close: number;
    current_change_abs: number;
    current_change: number;
    day_high: number;
    day_low: number;
    volume: number;
    market_cap?: number;
    last_updated: string;
    rank: number;

    history: {
        p_day1: number;
        p_day2: number;
        p_day3: number;
        avg_3day: number;
        volatility_3_day: number;
    };

    indicators: {
        macd_line?: number;
        signal_line?: number;
        macd_histogram?: number;
        macd_status: "above" | "below" | "neutral";
        rsi_value?: number;
        rsi_zone: "overbought" | "oversold" | "neutral";
        trend: string;
        buyer_strength_score: number;
        seller_strength_score: number;
        strength_label: string;
    };

    flags: {
        is_constant_price: boolean;
        is_gainer_today: boolean;
        is_loser_today: boolean;
        is_high_volume: boolean;
        is_breakout_candidate: boolean;
    };

    // Strength Fields
    current_strength: string;
    day1_strength: string;
    day2_strength: string;
    day3_strength: string;
    avg_3day_strength: string;

    derived: any; // For frontend calculated fields

    // Detailed fields (optional as they may not be in list view)
    chart_data?: ChartDataPoint[];

    // Mismatch fix for StockDetailModal which expects rsi_status but interface has rsi_zone
    rsi_status?: "overbought" | "oversold" | "neutral";
}

export interface StockStrength extends Stock { }

const API_URL = (process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || (process.env.NODE_ENV === "production" ? "https://pro-trade.onrender.com" : "http://localhost:8000")) + "/api/v1";

export function useStocks(filters: any) {
    return useQuery({
        queryKey: ["stocks", "fno", filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    params.append(key, String(value));
                }
            });

            const url = `${API_URL}/stocks/fno`;
            const { data } = await axios.get<Stock[]>(url, { params });
            return data;
        },
        refetchInterval: 3000, // 3 seconds for faster updates during incremental load
        staleTime: 10000, // Consider data fresh for 10 seconds
    });
}

export function useStockDetail(symbol: string | null) {
    return useQuery({
        queryKey: ["stock", symbol],
        queryFn: async () => {
            if (!symbol) return null;
            const { data } = await axios.get<Stock>(`${API_URL}/stocks/${symbol}`);
            return data;
        },
        enabled: !!symbol,
        refetchInterval: 15000,
    });
}

export function useWatchlist() {
    return useQuery({
        queryKey: ["watchlist"],
        queryFn: async () => {
            const { data } = await axios.get<Stock[]>(`${API_URL}/watchlist`);
            return data;
        },
        refetchInterval: 5000,
    });
}

export function useToggleWatchlist() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ symbol, action }: { symbol: string; action: "add" | "remove" }) => {
            const { data } = await axios.post(`${API_URL}/watchlist/`, { symbol, action });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["watchlist"] });
        },
    });
}

export function useGainers3Day() {
    return useQuery({
        queryKey: ["stocks", "gainers-3day"],
        queryFn: async () => {
            const { data } = await axios.get<Stock[]>(`${API_URL}/stocks/gainers-3day`);
            return data;
        },
        refetchInterval: 15000,
    });
}

export function useLosers3Day() {
    return useQuery({
        queryKey: ["stocks", "losers-3day"],
        queryFn: async () => {
            const { data } = await axios.get<Stock[]>(`${API_URL}/stocks/losers-3day`);
            return data;
        },
        refetchInterval: 15000,
    });
}

export function useStrengthAnalysis(filters: any) {
    return useQuery({
        queryKey: ["strength-analysis", filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    params.append(key, String(value));
                }
            });
            const { data } = await axios.get<StockStrength[]>(`${API_URL}/stocks/strength-analyzer`, { params });
            return data;
        },
        refetchInterval: 15000,
    });
}



export function useGrowwNews() {
    return useQuery({
        queryKey: ["groww-news"],
        queryFn: async () => {
            const { data } = await axios.get<any>(`${API_URL}/advanced/sentiment`);
            return data.news_analysis || [];
        },
        refetchInterval: 60000, // 1 min
    });
}
