"use client";

import { useGrowwNews } from "@/hooks/useStocks";
import { ExternalLink, Newspaper } from "lucide-react";

export default function NewsSection() {
    const { data: news, isLoading } = useGrowwNews();

    if (isLoading) {
        return <div className="p-4 text-center text-muted-foreground">Loading Market News...</div>;
    }

    if (!news || news.length === 0) {
        return <div className="p-4 text-center text-muted-foreground">No recent news available.</div>;
    }

    return (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">Market News (Live)</h2>
            </div>
            <div className="divide-y divide-border">
                {news.slice(0, 5).map((item: any) => ( // limit to 5
                    <a
                        key={item.uuid}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 hover:bg-accent/50 transition-colors group"
                    >
                        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors flex items-start gap-2 justify-between">
                            {item.title}
                            <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </h3>
                        {item.publisher && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {item.publisher} • {new Date(item.providerPublishTime * 1000).toLocaleTimeString()}
                            </p>
                        )}
                    </a>
                ))}
            </div>
        </div>
    );
}
