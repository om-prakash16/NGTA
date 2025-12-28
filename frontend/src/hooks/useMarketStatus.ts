import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface MarketHeaders {
    current: string;
    p1: string;
    p2: string;
    p3: string;
}

export interface MarketStatus {
    status: string;
    current_time: string;
    message: string;
    headers: MarketHeaders;
}

export const useMarketStatus = () => {
    return useQuery<MarketStatus>({
        queryKey: ['market-status'],
        queryFn: async () => {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || (process.env.NODE_ENV === "production" ? "https://pro-trade.onrender.com" : "http://localhost:8000");
            const response = await axios.get(`${baseUrl}/api/v1/stocks/market-status`);
            return response.data;
        },
        staleTime: 60 * 1000, // 1 minute
    });
};
