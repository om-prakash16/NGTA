"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function LeftHero() {
    return (
        <div className="relative w-full h-full overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/vr-hero.png"
                    alt="Future of Trading"
                    fill
                    className="object-cover"
                    priority
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/40 to-transparent opacity-90" />
                <div className="absolute inset-0 bg-blue-900/20 mix-blend-overlay" />
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-12 text-center z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
                        Analyze. Trade. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            Win the Market.
                        </span>
                    </h1>
                    <p className="text-lg text-gray-300 leading-relaxed max-w-lg mx-auto">
                        Experience next-generation F&O analysis with AI-powered insights and real-time data visualization.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
