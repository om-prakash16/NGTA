"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, FileText, TrendingUp, Settings, LogOut, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading) {
            if (!user || !user.is_admin) {
                router.push("/");
            }
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0B1221] text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!user || !user.is_admin) {
        return null;
    }

    const navItems = [
        { href: "/admin", label: "Overview", icon: LayoutDashboard },
        { href: "/admin/stocks", label: "Manage Stocks", icon: TrendingUp },
        { href: "/admin/blogs", label: "Manage Blogs", icon: FileText },
    ];

    return (
        <div className="flex min-h-screen bg-[#0B1221] text-white font-sans selection:bg-blue-500/30">
            {/* Glassmorphism Sidebar */}
            <aside className="w-72 bg-[#0F172A]/60 backdrop-blur-xl border-r border-white/5 flex flex-col fixed h-full z-50">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg shadow-blue-500/20">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                Admin Panel
                            </h1>
                            <p className="text-xs text-gray-500 font-medium tracking-wide">SUPERUSER ACCESS</p>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                        isActive
                                            ? "bg-blue-600/10 text-blue-400 shadow-[0_0_20px_-5px_rgba(37,99,235,0.3)] border border-blue-500/20"
                                            : "text-gray-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-blue-400" : "text-gray-500 group-hover:text-white")} />
                                    <span className="font-medium relative z-10">{item.label}</span>
                                    {isActive && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent opacity-50" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-white/5 bg-[#0F172A]/40">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[2px]">
                            <div className="w-full h-full rounded-full bg-[#0F172A] flex items-center justify-center">
                                <span className="font-bold text-sm text-white">
                                    {user.first_name?.[0]}{user.last_name?.[0]}
                                </span>
                            </div>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user.first_name} {user.last_name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all border border-red-500/10 hover:border-red-500/30 text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-72 p-8 overflow-y-auto min-h-screen relative">
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />
                <div className="relative z-10 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
