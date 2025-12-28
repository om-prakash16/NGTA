"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface FilterContextType {
    isDrawerOpen: boolean;
    openDrawer: () => void;
    closeDrawer: () => void;
    toggleDrawer: () => void;
    filterCount: number;
    setFilterCount: (count: number) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [filterCount, setActiveFilterCount] = useState(0);

    const openDrawer = () => setIsDrawerOpen(true);
    const closeDrawer = () => setIsDrawerOpen(false);
    const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);
    const setFilterCount = (count: number) => setActiveFilterCount(count);

    return (
        <FilterContext.Provider
            value={{
                isDrawerOpen,
                openDrawer,
                closeDrawer,
                toggleDrawer,
                filterCount,
                setFilterCount,
            }}
        >
            {children}
        </FilterContext.Provider>
    );
}

export function useFilter() {
    const context = useContext(FilterContext);
    if (context === undefined) {
        throw new Error("useFilter must be used within a FilterProvider");
    }
    return context;
}
