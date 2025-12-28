"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Plus, Trash2, Edit, X, FileText, Search, Image as ImageIcon, Tag, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    created_at: string;
    is_published: boolean;
    category: string;
}

export default function ManageBlogs() {
    const { token } = useAuth();
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        excerpt: "",
        image_url: "",
        category: ""
    });

    const fetchBlogs = async () => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || 'http://localhost:8000';
            const res = await fetch(`${baseUrl}/api/v1/blogs`);
            const data = await res.json();
            setBlogs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch blogs", error);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const handleCreateBlog = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || 'http://localhost:8000';
            const res = await fetch(`${baseUrl}/api/v1/admin/blogs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsCreating(false);
                setFormData({ title: "", content: "", excerpt: "", image_url: "", category: "" });
                fetchBlogs();
            } else {
                alert("Failed to create blog");
            }
        } catch (error) {
            console.error(error);
            alert("Error creating blog");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteBlog = async (id: number) => {
        if (!confirm("Are you sure you want to delete this post?")) return;

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || 'http://localhost:8000';
            const res = await fetch(`${baseUrl}/api/v1/admin/blogs/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                fetchBlogs();
            } else {
                alert("Failed to delete blog");
            }
        } catch (error) {
            console.error(error);
            alert("Error deleting blog");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white">Manage Blogs</h2>
                    <p className="text-gray-400 mt-1">Create, edit, and manage your blog posts.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                >
                    <Plus className="w-5 h-5" />
                    New Post
                </button>
            </div>

            {/* Blogs List */}
            <div className="bg-[#0F172A]/60 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
                <table className="w-full text-left">
                    <thead className="bg-gray-900/50 border-b border-gray-800">
                        <tr>
                            <th className="p-5 text-gray-400 font-medium text-sm uppercase tracking-wider">Title</th>
                            <th className="p-5 text-gray-400 font-medium text-sm uppercase tracking-wider">Category</th>
                            <th className="p-5 text-gray-400 font-medium text-sm uppercase tracking-wider">Date</th>
                            <th className="p-5 text-gray-400 font-medium text-sm uppercase tracking-wider">Status</th>
                            <th className="p-5 text-gray-400 font-medium text-sm uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {blogs.map((blog) => (
                            <tr key={blog.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-all">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white line-clamp-1">{blog.title}</p>
                                            <p className="text-xs text-gray-500 font-mono">{blog.slug}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-800 text-gray-300 text-xs font-medium border border-gray-700">
                                        <Tag className="w-3 h-3" />
                                        {blog.category || "Uncategorized"}
                                    </span>
                                </td>
                                <td className="p-5 text-gray-400 text-sm">
                                    {new Date(blog.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </td>
                                <td className="p-5">
                                    <span className={cn(
                                        "px-2.5 py-1 rounded-full text-xs font-medium border",
                                        blog.is_published
                                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                                            : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                    )}>
                                        {blog.is_published ? "Published" : "Draft"}
                                    </span>
                                </td>
                                <td className="p-5 text-right flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a
                                        href={`/blog/${blog.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                        title="View Post"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                    <button className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Edit">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteBlog(blog.id)}
                                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {blogs.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-12 text-center">
                                    <div className="flex flex-col items-center gap-3 text-gray-500">
                                        <FileText className="w-12 h-12 opacity-20" />
                                        <p>No blog posts yet.</p>
                                        <button onClick={() => setIsCreating(true)} className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                                            Create your first post &rarr;
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-[#0F172A] w-full max-w-4xl rounded-2xl border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-gray-800 sticky top-0 bg-[#0F172A] z-10">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Plus className="w-5 h-5 text-purple-400" />
                                Create New Post
                            </h3>
                            <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8">
                            <form onSubmit={handleCreateBlog} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-[#0B1221] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                            placeholder="Enter post title..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Category</label>
                                        <div className="relative">
                                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                type="text"
                                                value={formData.category}
                                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full bg-[#0B1221] border border-gray-700 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                                placeholder="e.g., Market Analysis"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Cover Image URL</label>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="text"
                                            value={formData.image_url}
                                            onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                            className="w-full bg-[#0B1221] border border-gray-700 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Excerpt</label>
                                    <textarea
                                        rows={2}
                                        value={formData.excerpt}
                                        onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                        className="w-full bg-[#0B1221] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
                                        placeholder="Brief summary of the post..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Content (Markdown supported)</label>
                                    <textarea
                                        rows={12}
                                        required
                                        value={formData.content}
                                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                                        className="w-full bg-[#0B1221] border border-gray-700 rounded-xl p-4 text-white font-mono text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                        placeholder="# Write your masterpiece here..."
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreating(false)}
                                        className="px-6 py-2.5 text-gray-400 hover:text-white font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-2.5 rounded-xl font-medium shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all"
                                    >
                                        {isLoading ? "Publishing..." : "Publish Post"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
