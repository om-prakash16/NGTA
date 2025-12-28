"use client";

import { blogPosts } from "@/data/blogPosts";
import { useParams, useRouter } from "next/navigation";
import { Calendar, Clock, User, ArrowLeft, Share2, ThumbsUp, ThumbsDown, Linkedin, Twitter, Copy, Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function BlogPostPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [copied, setCopied] = useState(false);
    const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

    const post = blogPosts.find(p => p.id === id);
    const relatedPosts = blogPosts.filter(p => p.id !== id).slice(0, 3);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy link:", err);
        }
    };

    if (!post) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Post Not Found</h2>
                <button onClick={() => router.back()} className="text-blue-600 hover:underline">Go Back</button>
            </div>
        );
    }

    return (
        <article className="max-w-4xl mx-auto pb-12 animate-in fade-in duration-500 px-4 md:px-6">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-8 mt-4"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Blog
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
                {/* Main Content Column */}
                <div>
                    {/* Header */}
                    <header className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full uppercase tracking-wide">
                                {post.category}
                            </span>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {post.readTime}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                            {post.title}
                        </h1>

                        <div className="flex items-center gap-3 py-4 border-y border-gray-200 dark:border-slate-700">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-lg font-bold text-gray-600 dark:text-gray-300">
                                {post.author.charAt(0)}
                            </div>
                            <div>
                                <div className="font-medium text-gray-900 dark:text-white">{post.author}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{post.date}</div>
                            </div>
                        </div>
                    </header>

                    {/* Featured Image */}
                    <div className="mb-10 rounded-3xl overflow-hidden shadow-sm">
                        <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-full h-auto object-cover max-h-[400px]"
                        />
                    </div>

                    {/* Content */}
                    <div
                        className="prose prose-lg dark:prose-invert max-w-none 
                        prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                        prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                        prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-gray-900 dark:prose-strong:text-white
                        prose-li:text-gray-600 dark:prose-li:text-gray-300"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Feedback Section */}
                    <div className="mt-12 p-6 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Was this article helpful?</h3>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setFeedback("up")}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
                                    feedback === "up"
                                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
                                        : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700"
                                )}
                            >
                                <ThumbsUp className="w-4 h-4" /> Yes
                            </button>
                            <button
                                onClick={() => setFeedback("down")}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
                                    feedback === "down"
                                        ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
                                        : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700"
                                )}
                            >
                                <ThumbsDown className="w-4 h-4" /> No
                            </button>
                        </div>

                        {/* Comments Section Disabled */}
                        {/* <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Comments (0)</h3>
                            <textarea
                                placeholder="Share your thoughts..."
                                className="w-full p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-32"
                            />
                            <div className="mt-2 flex justify-end">
                                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    Post Comment
                                </button>
                            </div>
                        </div> */}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Social Share Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm sticky top-24">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Share this post</h3>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleCopyLink}
                                className="flex items-center justify-between w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors group"
                            >
                                <span className="flex items-center gap-3">
                                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    <span className="text-sm font-medium">{copied ? "Copied!" : "Copy Link"}</span>
                                </span>
                            </button>

                            <button
                                onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                                className="flex items-center justify-between w-full p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 transition-colors"
                            >
                                <span className="flex items-center gap-3">
                                    <Twitter className="w-4 h-4" />
                                    <span className="text-sm font-medium">Twitter</span>
                                </span>
                            </button>

                            <button
                                onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                                className="flex items-center justify-between w-full p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 transition-colors"
                            >
                                <span className="flex items-center gap-3">
                                    <Linkedin className="w-4 h-4" />
                                    <span className="text-sm font-medium">LinkedIn</span>
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Related Posts */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Articles</h3>
                        <div className="space-y-4">
                            {relatedPosts.map(post => (
                                <Link
                                    key={post.id}
                                    href={`/blog/${post.id}`}
                                    className="block group bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                                >
                                    <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                                        {post.title}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <span>{post.date}</span>
                                        <span>•</span>
                                        <span>{post.readTime}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
