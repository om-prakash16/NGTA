"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition, Disclosure } from "@headlessui/react";
import { X, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    filters: any;
    setFilters: (filters: any) => void;
    onReset: () => void;
}

export default function FilterDrawer({
    isOpen,
    onClose,
    filters,
    setFilters,
    onReset,
}: FilterDrawerProps) {
    // Persist filters to localStorage
    useEffect(() => {
        const saved = localStorage.getItem("stockFilters");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Only load if not empty to avoid overwriting initial state if needed
                if (Object.keys(parsed).length > 0) {
                    // We don't auto-set here to avoid infinite loops or hydration mismatch
                    // But we could offer a "Load Saved" or just init state in parent.
                    // For now, let's just save when changed.
                }
            } catch (e) {
                console.error("Failed to load filters", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("stockFilters", JSON.stringify(filters));
    }, [filters]);

    const handleInputChange = (key: string, value: any) => {
        setFilters((prev: any) => {
            const next = { ...prev, [key]: value };
            if (value === "" || value === null) delete next[key];
            return next;
        });
    };

    const handleCheckboxChange = (key: string, checked: boolean) => {
        setFilters((prev: any) => {
            const next = { ...prev, [key]: checked };
            if (!checked) delete next[key];
            return next;
        });
    };

    const FilterSection = ({ title, children, defaultOpen = true }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => (
        <Disclosure defaultOpen={defaultOpen}>
            {({ open }) => (
                <div className="border-b border-border py-4">
                    <Disclosure.Button className="flex w-full justify-between items-center text-left text-sm font-medium text-foreground focus:outline-none hover:text-primary transition-colors">
                        <span>{title}</span>
                        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </Disclosure.Button>
                    <Disclosure.Panel className="pt-4 space-y-4">
                        {children}
                    </Disclosure.Panel>
                </div>
            )}
        </Disclosure>
    );

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-10">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-300 sm:duration-500"
                                enterFrom="-translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-300 sm:duration-500"
                                leaveFrom="translate-x-0"
                                leaveTo="-translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                    <div className="flex h-full flex-col overflow-y-scroll bg-background text-foreground shadow-2xl border-r border-border">
                                        <div className="px-4 py-6 sm:px-6 border-b border-border bg-muted/20">
                                            <div className="flex items-start justify-between">
                                                <Dialog.Title className="text-xl font-bold tracking-tight text-foreground">
                                                    Advanced Filters
                                                </Dialog.Title>
                                                <div className="ml-3 flex h-7 items-center">
                                                    <button
                                                        type="button"
                                                        className="relative -m-2 p-2 text-muted-foreground hover:text-foreground transition-colors"
                                                        onClick={onClose}
                                                    >
                                                        <span className="absolute -inset-0.5" />
                                                        <span className="sr-only">Close panel</span>
                                                        <X className="h-6 w-6" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="relative flex-1 px-4 py-6 sm:px-6">



                                            {/* Sections */}
                                            <FilterSection title="Market Data">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Min Price</label>
                                                        <input
                                                            type="number"
                                                            className="w-full bg-secondary/30 border border-input rounded px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-all"
                                                            value={filters.min_price || ""}
                                                            onChange={(e) => handleInputChange("min_price", e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Max Price</label>
                                                        <input
                                                            type="number"
                                                            className="w-full bg-secondary/30 border border-input rounded px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-all"
                                                            value={filters.max_price || ""}
                                                            onChange={(e) => handleInputChange("max_price", e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Sector</label>
                                                    <select
                                                        className="w-full bg-secondary/30 border border-input rounded px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-all appearance-none"
                                                        value={filters.sector || ""}
                                                        onChange={(e) => handleInputChange("sector", e.target.value)}
                                                    >
                                                        <option value="">All Sectors</option>
                                                        <option value="Nifty 50">Nifty 50</option>
                                                        <option value="Bank Nifty">Bank Nifty</option>
                                                        <option value="IT">IT</option>
                                                        <option value="Auto">Auto</option>
                                                        <option value="Pharma">Pharma</option>
                                                        <option value="FMCG">FMCG</option>
                                                        <option value="Metals">Metals</option>
                                                        <option value="Energy">Energy</option>
                                                    </select>
                                                </div>
                                            </FilterSection>

                                            <FilterSection title="Performance (Today)">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Min Change %</label>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            className="w-full bg-secondary/30 border border-input rounded px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-all"
                                                            value={filters.min_change_pct || ""}
                                                            onChange={(e) => handleInputChange("min_change_pct", e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Max Change %</label>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            className="w-full bg-secondary/30 border border-input rounded px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-all"
                                                            value={filters.max_change_pct || ""}
                                                            onChange={(e) => handleInputChange("max_change_pct", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </FilterSection>

                                            <FilterSection title="Performance (History)">
                                                {/* Day 1 */}
                                                <div className="mb-4">
                                                    <label className="block text-xs font-semibold text-muted-foreground mb-2">Past Day 1 %</label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            placeholder="Min"
                                                            className="w-full bg-secondary/30 border border-input rounded px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                                                            value={filters.min_day1_pct || ""}
                                                            onChange={(e) => handleInputChange("min_day1_pct", e.target.value)}
                                                        />
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            placeholder="Max"
                                                            className="w-full bg-secondary/30 border border-input rounded px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                                                            value={filters.max_day1_pct || ""}
                                                            onChange={(e) => handleInputChange("max_day1_pct", e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Day 2 */}
                                                <div className="mb-4">
                                                    <label className="block text-xs font-semibold text-muted-foreground mb-2">Past Day 2 %</label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            placeholder="Min"
                                                            className="w-full bg-secondary/30 border border-input rounded px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                                                            value={filters.min_day2_pct || ""}
                                                            onChange={(e) => handleInputChange("min_day2_pct", e.target.value)}
                                                        />
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            placeholder="Max"
                                                            className="w-full bg-secondary/30 border border-input rounded px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                                                            value={filters.max_day2_pct || ""}
                                                            onChange={(e) => handleInputChange("max_day2_pct", e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Day 3 */}
                                                <div className="mb-4">
                                                    <label className="block text-xs font-semibold text-muted-foreground mb-2">Past Day 3 %</label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            placeholder="Min"
                                                            className="w-full bg-secondary/30 border border-input rounded px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                                                            value={filters.min_day3_pct || ""}
                                                            onChange={(e) => handleInputChange("min_day3_pct", e.target.value)}
                                                        />
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            placeholder="Max"
                                                            className="w-full bg-secondary/30 border border-input rounded px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                                                            value={filters.max_day3_pct || ""}
                                                            onChange={(e) => handleInputChange("max_day3_pct", e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                {/* 3D Avg */}
                                                <div>
                                                    <label className="block text-xs font-semibold text-muted-foreground mb-2">3-Day Average %</label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            placeholder="Min"
                                                            className="w-full bg-secondary/30 border border-input rounded px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                                                            value={filters.min_avg_3day_pct || ""}
                                                            onChange={(e) => handleInputChange("min_avg_3day_pct", e.target.value)}
                                                        />
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            placeholder="Max"
                                                            className="w-full bg-secondary/30 border border-input rounded px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                                                            value={filters.max_avg_3day_pct || ""}
                                                            onChange={(e) => handleInputChange("max_avg_3day_pct", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </FilterSection>

                                            <FilterSection title="Quick Filters">
                                                <div className="space-y-3">
                                                    {[
                                                        { key: "constant_only", label: "Constant Price (Stability)" },
                                                        { key: "gainers_only", label: "Gainers Only" },
                                                        { key: "losers_only", label: "Losers Only" },
                                                        { key: "high_volume_only", label: "High Volume Only" },
                                                    ].map((opt) => (
                                                        <label key={opt.key} className="flex items-center gap-3 cursor-pointer group">
                                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${filters[opt.key] ? 'bg-primary border-primary' : 'border-input bg-background'}`}>
                                                                <input
                                                                    type="checkbox"
                                                                    className="hidden"
                                                                    checked={filters[opt.key] || false}
                                                                    onChange={(e) => handleCheckboxChange(opt.key, e.target.checked)}
                                                                />
                                                                {filters[opt.key] && <RotateCcw className="w-3 h-3 text-primary-foreground rotate-45" style={{ transform: 'rotate(0deg)' }} />} {/* Use check icon usually but RotateCcw fallback */}
                                                            </div>
                                                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{opt.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </FilterSection>

                                            <FilterSection title="Technical Indicators">
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">MACD Status</label>
                                                        <select
                                                            className="w-full bg-secondary/30 border border-input rounded px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-all"
                                                            value={filters.macd_status || ""}
                                                            onChange={(e) => handleInputChange("macd_status", e.target.value)}
                                                        >
                                                            <option value="">Any</option>
                                                            <option value="above">Above Zero (Bullish)</option>
                                                            <option value="below">Below Zero (Bearish)</option>
                                                            <option value="neutral">Near Zero (Neutral)</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">RSI Zone</label>
                                                        <select
                                                            className="w-full bg-secondary/30 border border-input rounded px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-all"
                                                            value={filters.rsi_zone || ""}
                                                            onChange={(e) => handleInputChange("rsi_zone", e.target.value)}
                                                        >
                                                            <option value="">Any</option>
                                                            <option value="overbought">Overbought</option>
                                                            <option value="oversold">Oversold</option>
                                                            <option value="neutral">Neutral</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Strength</label>
                                                        <select
                                                            className="w-full bg-secondary/30 border border-input rounded px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-all"
                                                            value={filters.strength || ""}
                                                            onChange={(e) => handleInputChange("strength", e.target.value)}
                                                        >
                                                            <option value="">Any</option>
                                                            <option value="BUYERS">Buyers Dominating</option>
                                                            <option value="SELLERS">Sellers Dominating</option>
                                                            <option value="BALANCED">Balanced</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </FilterSection>
                                        </div>

                                        <div className="border-t border-border bg-muted/20 px-4 py-6 sm:px-6">
                                            <button
                                                type="button"
                                                className="flex w-full items-center justify-center rounded-lg bg-destructive hover:bg-destructive/90 transition-colors px-3 py-3 text-sm font-semibold text-destructive-foreground shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive"
                                                onClick={onReset}
                                            >
                                                <RotateCcw className="w-4 h-4 mr-2" />
                                                Reset All Filters
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
