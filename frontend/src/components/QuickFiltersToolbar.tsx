import { TrendingUp, TrendingDown, BarChart3, X, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useFilter } from "@/context/FilterContext";

interface QuickFiltersToolbarProps {
    filters: any;
    setFilters: (filters: any) => void;
    onReset?: () => void;
    className?: string;
}

export default function QuickFiltersToolbar({ filters, setFilters, onReset, className }: QuickFiltersToolbarProps) {
    const { openDrawer, filterCount } = useFilter();

    const FilterPill = ({ label, active, onClick, icon: Icon }: any) => (
        <button
            onClick={onClick}
            className={cn(
                "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap",
                active
                    ? "text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
        >
            {active && (
                <motion.div
                    layoutId="activePill"
                    className="absolute inset-0 bg-primary rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
            <span className="relative z-10 flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4" />}
                {label}
            </span>
        </button>
    );

    return (
        <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b border-border", className)}>

            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search stocks..."
                    value={filters.search || ""}
                    onChange={(e) => setFilters((p: any) => ({ ...p, search: e.target.value }))}
                    className="w-full pl-9 pr-4 py-2 rounded-full text-sm border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm"
                />
            </div>

            <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
                <div className="flex flex-wrap gap-2 p-1.5 bg-muted/50 rounded-full border border-border/50 overflow-x-auto">
                    <FilterPill
                        label="All"
                        active={!filters.gainers_only && !filters.losers_only && !filters.high_volume_only}
                        onClick={() => setFilters((p: any) => {
                            const { gainers_only, losers_only, high_volume_only, ...rest } = p;
                            return rest;
                        })}
                    />
                    <FilterPill
                        label="Gainers"
                        icon={TrendingUp}
                        active={filters.gainers_only}
                        onClick={() => setFilters((p: any) => ({ ...p, gainers_only: !p.gainers_only, losers_only: false }))}
                    />
                    <FilterPill
                        label="Losers"
                        icon={TrendingDown}
                        active={filters.losers_only}
                        onClick={() => setFilters((p: any) => ({ ...p, losers_only: !p.losers_only, gainers_only: false }))}
                    />
                </div>

                {/* Advanced Filters Trigger */}
                <button
                    onClick={openDrawer}
                    className="relative ml-2 p-2.5 rounded-full bg-card border border-border hover:bg-accent text-muted-foreground transition-colors shadow-sm"
                    title="Advanced Filters"
                >
                    <Filter className="w-5 h-5" />
                    {filterCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm animate-in zoom-in">
                            {filterCount}
                        </span>
                    )}
                </button>
            </div>

            {Object.keys(filters).length > 0 && onReset && (
                <button
                    onClick={onReset}
                    className="px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-full transition-colors flex items-center gap-2 whitespace-nowrap ml-auto sm:ml-0"
                >
                    <X className="w-4 h-4" /> Clear
                </button>
            )}
        </div>
    );
}
