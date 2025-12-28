"use client";

import Link from "next/link";
import { ArrowRight, BarChart2, Zap, Shield, Globe, TrendingUp, Search, Activity, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-background text-foreground animate-in fade-in duration-500">

      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-20 md:pt-32 md:pb-32 container mx-auto px-6">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none opacity-50 dark:opacity-20 mix-blend-screen" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="flex flex-col items-center text-center max-w-5xl mx-auto space-y-8">

          {/* Tagline / Sub-headline */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-primary/20 backdrop-blur-sm text-sm font-medium text-primary mb-4 animate-in slide-in-from-bottom-5 duration-700"
          >
            <Cpu className="w-4 h-4 fill-primary/20 text-primary" />
            <span>AI-Driven Trade Analysis for the Next Generation of Traders.</span>
          </div>

          <h1
            className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent animate-in slide-in-from-bottom-10 duration-1000 delay-100"
          >
            Next-Gen Trade Analysis for <br />
            <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent drop-shadow-sm">Smarter, Faster Decisions</span>
          </h1>

          <p
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed animate-in slide-in-from-bottom-10 duration-1000 delay-200"
          >
            Real-time stock and F&O analytics built for modern traders. <br className="hidden md:block" />
            Identify trends, find top gainers/losers, track market sentiment, and make data-driven trading decisions — instantly.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center gap-4 mt-8 animate-in slide-in-from-bottom-10 duration-1000 delay-300"
          >
            <div>
              <Link href="/dashboard" className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-primary/25 flex items-center gap-2 group transform hover:scale-105 active:scale-95">
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div>
              <Link href="#features" className="px-8 py-4 bg-card hover:bg-accent border border-border rounded-full font-semibold text-lg transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95">
                Explore Features
                <Search className="w-5 h-5 text-muted-foreground" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- TAGLINE & ABOUT SECTION --- */}
      <section className="py-20 bg-muted/30 border-y border-border/50">
        <div className="container mx-auto px-6 text-center max-w-4xl space-y-12 animate-in fade-in zoom-in duration-700 delay-300">

          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Transforming Raw Market Data</h2>
            <p className="text-xl text-muted-foreground">
              Transforming raw market data into meaningful insights using advanced algorithms and intelligent analytics.
            </p>
          </div>

          <div className="bg-card p-8 md:p-12 rounded-3xl border border-border shadow-md text-left md:text-center space-y-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h3 className="text-2xl font-bold">About NG Trade Analysis</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              NG Trade Analysis uses advanced AI models and real-time market intelligence to help traders detect bullish moves, bearish reversals, breakouts, momentum shifts, and high-probability trading opportunities.
            </p>
            <div className="pt-4 border-t border-border">
              <p className="font-semibold text-primary uppercase tracking-widest text-sm">Our Mission</p>
              <p className="text-2xl font-bold mt-2">AI-Powered Insights. Human-Focused Trading Excellence.</p>
            </div>
          </div>

        </div>
      </section>

      {/* --- FEATURES GRID (Existing Preserved) --- */}
      <section id="features" className="py-24 bg-accent/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 space-y-4 animate-in slide-in-from-bottom-10 duration-700 delay-300">
            <h2 className="text-3xl md:text-5xl font-bold">Why NG Trade Analysis?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built for traders who demand precision, speed, and clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={TrendingUp}
              title="Smart Strength Meters"
              description="Instantly gauge Buyer vs Seller dominance with our proprietary strength algorithms."
              delay="delay-100"
            />
            <FeatureCard
              icon={Search}
              title="Advanced Filtering"
              description="Filter by sector, price action, and custom strength indicators in milliseconds."
              delay="delay-200"
            />
            <FeatureCard
              icon={Shield}
              title="Institutional Logic"
              description="Logic derived from institutional trading patterns for higher probability setups."
              delay="delay-300"
            />
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="container mx-auto px-6 text-center space-y-8 animate-in fade-in duration-1000">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Experience AI-Driven Trade Analysis Today</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Smarter insights. Faster decisions. Next-level trading.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-10 py-5 bg-foreground text-background hover:bg-primary hover:text-primary-foreground rounded-full text-xl font-bold transition-all transform hover:scale-105 shadow-2xl">
              Try NG Trade Analysis
              <ArrowRight className="w-6 h-6" />
            </Link>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-10 py-5 bg-card hover:bg-accent border border-border rounded-full text-xl font-medium transition-all transform hover:scale-105">
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, delay }: any) {
  return (
    <div
      className={cn(
        "p-8 rounded-3xl bg-card border border-border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group hover:-translate-y-2 animate-in slide-in-from-bottom-5 duration-700 fill-mode-backwards",
        delay
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <Icon className="w-7 h-7 text-primary group-hover:text-current transition-colors" />
      </div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
