"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, BarChart2, Home, Activity, FileText, Sun, Moon, Laptop, TrendingUp, TrendingDown, Newspaper, Target, Brain, LayoutGrid, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useFilter } from "@/context/FilterContext";
import { Filter as FilterIcon } from "lucide-react";

// Navigation Links
const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: BarChart2 },
    // "Strength" (formerly God Mode)
    { name: "Strength", href: "/god-mode", icon: Activity },
    {
        name: "Advanced", href: "#", icon: Zap, children: [
            { name: "Options", href: "/advanced/options", icon: Target },
            { name: "Sentiment", href: "/advanced/sentiment", icon: Brain },
            { name: "Heatmap", href: "/advanced/heatmap", icon: LayoutGrid },
        ]
    },
    // News removed for performance
    // { name: "News", href: "/news", icon: Newspaper },
    { name: "Blogs", href: "/blog", icon: FileText },
];

export default function GlobalNav() {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const { user, logout } = useAuth();
    const { openDrawer, filterCount } = useFilter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Real Indices Data
    const [indices, setIndices] = useState<{ name: string, value: string, change: string, isPositive: boolean }[]>([]);

    useEffect(() => {
        const fetchIndices = async () => {
            try {
                // Use absolute path with sanitized base URL
                const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || (process.env.NODE_ENV === "production" ? "https://pro-trade.onrender.com" : "http://localhost:8000");
                const res = await fetch(`${baseUrl}/api/v1/advanced/indices`);
                if (res.ok) {
                    const data = await res.json();
                    setIndices(data);
                }
            } catch (error) {
                console.error("Failed to fetch indices", error);
            }
        };

        fetchIndices();
        const interval = setInterval(fetchIndices, 10000); // Update every 10 seconds for fresher feel
        return () => clearInterval(interval);
    }, []);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        setMounted(true);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (!mounted) return null;

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                    isScrolled
                        ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm py-2"
                        : "bg-transparent py-4"
                )}
            >
                <div className="container mx-auto px-4 lg:px-6">
                    <div className="flex items-center justify-between">

                        {/* Left: Logo & Ticker */}
                        <div className="flex items-center gap-6">
                            <Link href="/" className="flex items-center gap-2 group">
                                <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
                                    <BarChart2 className="w-6 h-6 text-primary" />
                                </div>
                                <span className="text-xl font-bold tracking-tight hidden sm:inline-block">
                                    NG <span className="text-primary">Trade</span>
                                </span>
                            </Link>

                            {/* Mini Ticker (Hidden on Mobile) */}
                            <div className="hidden lg:flex items-center gap-4 text-xs font-mono border-l border-border pl-4">
                                {indices.map(idx => (
                                    <div key={idx.name} className="flex flex-col leading-tight">
                                        <span className="text-muted-foreground font-semibold">{idx.name}</span>
                                        <span className={`font-bold flex items-center gap-1 ${idx.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {idx.value}
                                            {idx.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                            {idx.change}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = pathname === link.href || (link.children && link.children.some(c => pathname === c.href));

                                if (link.children) {
                                    return (
                                        <div key={link.name} className="relative group px-3 py-2">
                                            <button className={cn(
                                                "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary",
                                                isActive ? "text-foreground" : "text-muted-foreground"
                                            )}>
                                                <Icon className="w-4 h-4" />
                                                {link.name}
                                                <Activity className="w-3 h-3 opacity-50 rotate-90" /> {/* Chevron proxy */}
                                            </button>

                                            {/* Dropdown */}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top">
                                                <div className="bg-popover border border-border rounded-xl shadow-xl overflow-hidden min-w-[180px] p-1">
                                                    {link.children.map(child => (
                                                        <Link
                                                            key={child.name}
                                                            href={child.href}
                                                            className="flex items-center gap-2 px-3 py-2 text-sm text-popover-foreground hover:bg-accent rounded-lg transition-colors"
                                                        >
                                                            <child.icon className="w-4 h-4 text-muted-foreground" />
                                                            {child.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                            "relative px-3 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2",
                                            isActive
                                                ? "text-primary-foreground bg-primary shadow-lg shadow-primary/25"
                                                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                        )}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Right Actions */}
                        <div className="hidden md:flex items-center gap-3">
                            {/* Global Filter Button REMOVED as per request */}
                            {/* {(pathname === "/god-mode" || pathname === "/stocks" || pathname === "/watchlist") && (
                                <button
                                    onClick={openDrawer}
                                    className="relative p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors"
                                    title="Advanced Filters"
                                >
                                    <FilterIcon className="w-5 h-5" />
                                    {activeFilterCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </button>
                            )} */}

                            {/* Theme Toggle */}
                            <button
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className="relative flex items-center justify-center p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors w-10 h-10"
                            >
                                <Sun className="w-5 h-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute w-5 h-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            </button>

                            {/* Auth Buttons */}
                            {user ? (
                                <div className="flex items-center gap-3 pl-3 border-l border-border">
                                    <div className="text-sm font-medium hidden xl:block">
                                        Hi, {user.first_name}
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="text-xs font-semibold text-red-500 hover:text-red-600 bg-red-500/10 px-3 py-1.5 rounded-full transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link
                                        href="/signin"
                                        className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-full shadow-lg shadow-primary/25"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-[280px] bg-background border-l border-border z-50 p-6 md:hidden shadow-2xl overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <span className="font-bold text-lg">Menu</span>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 hover:bg-accent rounded-full"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex flex-col gap-2">
                                {navLinks.map((link) => {
                                    if (link.children) {
                                        return (
                                            <div key={link.name} className="flex flex-col gap-2 p-2 bg-accent/30 rounded-xl">
                                                <div className="flex items-center gap-3 px-2 font-medium text-muted-foreground">
                                                    <link.icon className="w-5 h-5 text-primary" />
                                                    {link.name}
                                                </div>
                                                <div className="flex flex-col gap-1 pl-4 border-l border-border ml-2">
                                                    {link.children.map(child => (
                                                        <Link
                                                            key={child.name}
                                                            href={child.href}
                                                            onClick={() => setMobileMenuOpen(false)}
                                                            className="py-2 px-3 text-sm rounded-lg hover:bg-accent flex items-center gap-2"
                                                        >
                                                            <child.icon className="w-4 h-4 opacity-70" />
                                                            {child.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }
                                    const Icon = link.icon;
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={cn(
                                                "flex items-center gap-4 px-4 py-3 rounded-xl text-lg font-medium transition-colors",
                                                pathname === link.href
                                                    ? "bg-primary/10 text-primary"
                                                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                            )}
                                        >
                                            <Icon className="w-5 h-5" />
                                            {link.name}
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Mobile Auth Buttons */}
                            <div className="px-4 py-4 border-t border-border mt-4">
                                {user ? (
                                    <div className="flex flex-col gap-3">
                                        <div className="text-sm font-medium text-muted-foreground">
                                            Signed in as {user.first_name}
                                        </div>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setMobileMenuOpen(false);
                                            }}
                                            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold rounded-xl transition-colors border border-red-500/20"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <Link
                                            href="/signin"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="w-full py-3 text-center bg-accent hover:bg-accent/80 text-foreground font-semibold rounded-xl transition-colors"
                                        >
                                            Log In
                                        </Link>
                                        <Link
                                            href="/signup"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="w-full py-3 text-center bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-colors shadow-lg shadow-primary/25"
                                        >
                                            Sign Up
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence >
        </>
    );
}
