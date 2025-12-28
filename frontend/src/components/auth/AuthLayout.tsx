import LeftHero from "./LeftHero";
import { motion } from "framer-motion";
import Link from "next/link";
import { BarChart2 } from "lucide-react";

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-[#0B1220] flex flex-col items-center justify-center p-4 md:p-8">
            {/* HEADER */}
            <div className="text-center space-y-3 mb-8">
                <Link href="/" className="inline-flex items-center gap-2 group">
                    <div className="bg-blue-600 p-2 rounded-xl group-hover:scale-105 transition-transform shadow-lg shadow-blue-500/20">
                        <BarChart2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                        NSE Analyzer
                    </span>
                </Link>
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
                    <p className="text-gray-400 mt-2 text-sm md:text-base">{subtitle}</p>
                </motion.div>
            </div>

            {/* SPLIT CARD */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-[#111827] rounded-3xl overflow-hidden shadow-2xl border border-gray-800"
            >
                {/* Left Side - Hero Image */}
                <div className="hidden lg:block relative h-full min-h-[600px]">
                    <LeftHero />
                </div>

                {/* Right Side - Form */}
                <div className="flex items-center justify-center p-8 md:p-12 lg:p-16 bg-[#111827]">
                    <div className="w-full max-w-md space-y-6">
                        {children}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
