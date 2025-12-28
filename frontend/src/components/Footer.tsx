import Link from "next/link";
import { Mail, Linkedin, Instagram, Phone, BarChart2 } from "lucide-react";

export default function Footer() {
    return (
        <footer className="relative bg-background border-t border-border mt-auto pt-16 pb-8 overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] -z-10 pointer-events-none" />

            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1 space-y-4">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
                                <BarChart2 className="w-6 h-6 text-primary" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">
                                NG <span className="text-primary">Trade Analysis</span>
                            </span>
                        </Link>
                        <p className="text-muted-foreground leading-relaxed">
                            Advanced F&O analytics platform empowering traders with institutional-grade data and real-time strength signals.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Platform</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
                            <li><Link href="/strength-analyzer" className="hover:text-primary transition-colors">Strength Analyzer</Link></li>
                            <li><Link href="/watchlist" className="hover:text-primary transition-colors">Watchlist</Link></li>
                            <li><Link href="/blog" className="hover:text-primary transition-colors">Market Insights</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Resources</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/how-it-works" className="hover:text-primary transition-colors">Documentation</Link></li>
                            <li><Link href="/admin" className="hover:text-primary transition-colors">Admin Portal</Link></li>
                            <li><a href="#" className="hover:text-primary transition-colors">API Status</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>

                    {/* Contact & Socials */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Connect</h3>
                        <div className="flex flex-col gap-3 text-sm text-muted-foreground mb-6">
                            <a href="mailto:ramuser22@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                                <Mail className="w-4 h-4" /> ramuser22@gmail.com
                            </a>
                            <a href="https://wa.me/918884055695" className="flex items-center gap-2 hover:text-primary transition-colors">
                                <Phone className="w-4 h-4" /> +91 91627 07792
                            </a>
                        </div>
                        <div className="flex gap-3">
                            <SocialLink href="https://www.linkedin.com/in/om-prakash-kr/" icon={Linkedin} />
                            <SocialLink href="https://www.instagram.com/om_prakash__kr/" icon={Instagram} />
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} NG Trade Analysis. All rights reserved.</p>
                    <p>Designed for Professional Traders.</p>
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ href, icon: Icon }: any) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-accent/50 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all duration-300"
        >
            <Icon className="w-4 h-4" />
        </a>
    );
}
