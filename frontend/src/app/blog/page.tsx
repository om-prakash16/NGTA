"use client";

import { blogPosts } from "@/data/blogPosts";
import Link from "next/link";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";

export default function BlogIndex() {
    return (
        <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto space-y-4">
                <h1 className="text-4xl font-bold text-foreground tracking-tight">Market Insights & News</h1>
                <p className="text-lg text-muted-foreground">
                    Stay updated with the latest trends, analysis, and strategies from the world of F&O trading.
                </p>
            </div>

            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
                {blogPosts.map((post) => (
                    <Link
                        key={post.id}
                        href={`/blog/${post.id}`}
                        className="group flex flex-col bg-card rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-md dark:hover:shadow-lg transition-all duration-300"
                    >
                        {/* Image Placeholder */}
                        <div className="h-48 bg-muted relative overflow-hidden">
                            <img
                                src={post.imageUrl}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-4 left-4">
                                <span className="px-3 py-1 bg-background/90 backdrop-blur-sm text-xs font-bold text-primary rounded-full uppercase tracking-wide">
                                    {post.category}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {post.date}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {post.readTime}
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                {post.title}
                            </h2>

                            <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">
                                {post.excerpt}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-border">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                        {post.author.charAt(0)}
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground">{post.author}</span>
                                </div>
                                <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    Read <ArrowRight className="w-4 h-4" />
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
