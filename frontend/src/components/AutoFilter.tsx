import { useState, useMemo, useEffect } from "react";
import { ArrowDown, ArrowUp, Check, Filter, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterType = "text" | "number" | "enum";

export interface FilterState {
    type: FilterType;
    selectedValues?: string[]; // For text/enum
    min?: number; // For number
    max?: number; // For number
}

interface AutoFilterProps {
    columnKey: string;
    type: FilterType;
    options?: string[]; // Unique values for text/enum
    onFilter: (state: FilterState | null) => void;
    currentFilter: FilterState | null;
    onSort: (direction: "asc" | "desc") => void;
    sortDirection: "asc" | "desc" | null;
    title: string;
    labelFormatter?: (value: string) => string; // Optional formatter
}

export default function AutoFilter({
    columnKey,
    type,
    options = [],
    onFilter,
    currentFilter,
    onSort,
    sortDirection,
    title,
    labelFormatter,
}: AutoFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");

    // Local state for filter inputs
    const [localSelected, setLocalSelected] = useState<string[]>(
        currentFilter?.selectedValues || options
    );
    const [localMin, setLocalMin] = useState<string>(
        currentFilter?.min?.toString() || ""
    );
    const [localMax, setLocalMax] = useState<string>(
        currentFilter?.max?.toString() || ""
    );

    // Sync local options if the prop changes (e.g. data load)
    // Fix: Use stringified options to prevent infinite loop on ref change
    const optionsStr = JSON.stringify(options);
    useEffect(() => {
        if (!currentFilter?.selectedValues) {
            setLocalSelected(JSON.parse(optionsStr));
        }
    }, [optionsStr, currentFilter?.selectedValues]);

    const filteredOptions = useMemo(() => {
        if (!search) return options;
        return options.filter((opt) =>
            opt.toLowerCase().includes(search.toLowerCase())
        );
    }, [options, search]);

    const handleApply = () => {
        if (type === "number") {
            const min = localMin ? parseFloat(localMin) : undefined;
            const max = localMax ? parseFloat(localMax) : undefined;
            if (min === undefined && max === undefined) {
                onFilter(null);
            } else {
                onFilter({ type, min, max });
            }
        } else {
            // Force strict filtering even if all selected
            if (localSelected.length === 0) {
                onFilter(null);
            } else {
                onFilter({ type, selectedValues: localSelected });
            }
        }
        setIsOpen(false);
    };

    const handleClear = () => {
        setLocalSelected(options);
        setLocalMin("");
        setLocalMax("");
        onFilter(null);
        setIsOpen(false);
    };

    const toggleOption = (opt: string) => {
        setLocalSelected((prev) =>
            prev.includes(opt)
                ? prev.filter((p) => p !== opt)
                : [...prev, opt]
        );
    };

    const toggleAll = () => {
        if (localSelected.length === filteredOptions.length) {
            setLocalSelected([]);
        } else {
            setLocalSelected(filteredOptions);
        }
    };

    return (
        <div className="relative inline-block">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className={cn(
                    "p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors",
                    currentFilter || sortDirection ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"
                )}
                title={`Filter ${title}`}
            >
                <Filter className="w-3 h-3" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(false);
                        }}
                    />
                    <div
                        className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl z-50 flex flex-col max-h-[400px]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-3 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                            <span className="font-medium text-gray-900 dark:text-white text-sm">Filter: {title}</span>
                            <button onClick={() => setIsOpen(false)}>
                                <X className="w-4 h-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" />
                            </button>
                        </div>

                        {/* Sorting */}
                        <div className="p-2 border-b border-gray-200 dark:border-slate-700 flex gap-2">
                            <button
                                onClick={() => {
                                    onSort("asc");
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors",
                                    sortDirection === "asc"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                                )}
                            >
                                <ArrowUp className="w-3 h-3" /> Asc
                            </button>
                            <button
                                onClick={() => {
                                    onSort("desc");
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors",
                                    sortDirection === "desc"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                                )}
                            >
                                <ArrowDown className="w-3 h-3" /> Desc
                            </button>
                        </div>

                        {/* Filter Content */}
                        <div className="p-3 flex-1 overflow-y-auto min-h-0">
                            {type === "number" ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Min Value</label>
                                        <input
                                            type="number"
                                            value={localMin}
                                            onChange={(e) => setLocalMin(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-sm text-gray-900 dark:text-white focus:border-blue-500 outline-none"
                                            placeholder="Min"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Max Value</label>
                                        <input
                                            type="number"
                                            value={localMax}
                                            onChange={(e) => setLocalMax(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-sm text-gray-900 dark:text-white focus:border-blue-500 outline-none"
                                            placeholder="Max"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col h-full">
                                    <div className="relative mb-2">
                                        <Search className="w-3 h-3 absolute left-2 top-2 text-gray-500" />
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded pl-7 pr-2 py-1 text-xs text-gray-900 dark:text-white focus:border-blue-500 outline-none"
                                            placeholder="Search..."
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200 dark:border-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={localSelected.length === filteredOptions.length && filteredOptions.length > 0}
                                            onChange={toggleAll}
                                            className="rounded bg-gray-200 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-0"
                                        />
                                        <span className="text-xs text-gray-600 dark:text-gray-300">(Select All)</span>
                                    </div>
                                    <div className="space-y-1 overflow-y-auto max-h-[200px]">
                                        {filteredOptions.map((opt) => (
                                            <label key={opt} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700/50 p-1 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={localSelected.includes(opt)}
                                                    onChange={() => toggleOption(opt)}
                                                    className="rounded bg-gray-200 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-0"
                                                />
                                                <span className="text-xs text-gray-700 dark:text-gray-300 break-all">
                                                    {labelFormatter ? labelFormatter(opt) : opt}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="p-3 border-t border-gray-200 dark:border-slate-700 flex justify-between gap-2">
                            <button
                                onClick={handleClear}
                                className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                Clear
                            </button>
                            <button
                                onClick={handleApply}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
