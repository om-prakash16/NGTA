export interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    date: string;
    category: string;
    imageUrl: string;
    readTime: string;
}

export const blogPosts: BlogPost[] = [
    {
        id: "om-trading-journey",
        title: "My Trading Journey: From Novice to Pro",
        excerpt: "A personal look into my trading experiences, the challenges I faced, and the key lessons that shaped my career.",
        content: `
            <p>Trading is not just about numbers; it's about discipline, psychology, and continuous learning. In this post, I share my journey from placing my first trade to becoming a consistent trader.</p>
            
            <h3>The Beginning</h3>
            <p>Like many, I started with the hope of making quick money. I made mistakes, blew up accounts, and learned the hard way that there are no shortcuts in the market.</p>
            
            <h3>The Turning Point</h3>
            <p>The shift happened when I stopped focusing on profits and started focusing on the <em>process</em>. Risk management became my priority, and consistency followed.</p>
            
            <hr class="my-6 border-gray-200 dark:border-gray-700" />
            <p><strong>Connect with me:</strong></p>
            <ul class="list-none pl-0 space-y-2">
                <li>
                    <a href="https://www.linkedin.com/in/om-prakash-kr/" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline flex items-center gap-2">
                        LinkedIn: Om Prakash
                    </a>
                </li>
                <li>
                    <a href="https://www.instagram.com/om_prakash__kr/" target="_blank" rel="noopener noreferrer" class="text-pink-600 hover:underline flex items-center gap-2">
                        Instagram: @om_prakash__kr
                    </a>
                </li>
            </ul>
        `,
        author: "Om",
        date: "Dec 04, 2025",
        category: "Personal",
        imageUrl: "/blog/trading-journey.png",
        readTime: "5 min read"
    },
    {
        id: "market-psychology-mastery",
        title: "Understanding Market Psychology",
        excerpt: "Why mindset matters more than strategy. Learn how to control your emotions and trade with a clear head.",
        content: `
            <p>You can have the best strategy in the world, but if you can't control your emotions, you will lose money. Market psychology is the unsung hero of successful trading.</p>
            
            <h3>Fear and Greed</h3>
            <p>These two emotions drive the market. Learning to identify when you are acting out of fear (selling too early) or greed (holding too long) is crucial.</p>
            
            <h3>Discipline</h3>
            <p>Sticking to your plan when the market is going against you requires immense discipline. This is what separates the pros from the amateurs.</p>
            
            <hr class="my-6 border-gray-200 dark:border-gray-700" />
            <p><strong>Connect with me:</strong></p>
            <ul class="list-none pl-0 space-y-2">
                <li>
                    <a href="https://www.linkedin.com/in/om-prakash-kr/" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline flex items-center gap-2">
                        LinkedIn: Om Prakash
                    </a>
                </li>
                <li>
                    <a href="https://www.instagram.com/om_prakash__kr/" target="_blank" rel="noopener noreferrer" class="text-pink-600 hover:underline flex items-center gap-2">
                        Instagram: @om_prakash__kr
                    </a>
                </li>
            </ul>
        `,
        author: "Om",
        date: "Dec 03, 2025",
        category: "Psychology",
        imageUrl: "/blog/market-psychology.png",
        readTime: "4 min read"
    },
    {
        id: "top-trading-mistakes",
        title: "Top 5 Mistakes New Traders Make",
        excerpt: "Avoid these common pitfalls to protect your capital and accelerate your learning curve.",
        content: `
            <p>I've seen countless traders make the same mistakes over and over again. Here are the top 5 to avoid:</p>
            
            <ol>
                <li><strong>Overleveraging:</strong> Taking on too much risk per trade.</li>
                <li><strong>Revenge Trading:</strong> Trying to win back losses immediately.</li>
                <li><strong>Lack of a Plan:</strong> Entering trades without a clear entry and exit strategy.</li>
                <li><strong>Ignoring Stop Losses:</strong> Letting small losses turn into big disasters.</li>
                <li><strong>Following Tips:</strong> Relying on others instead of doing your own analysis.</li>
            </ol>
            
            <hr class="my-6 border-gray-200 dark:border-gray-700" />
            <p><strong>Connect with me:</strong></p>
            <ul class="list-none pl-0 space-y-2">
                <li>
                    <a href="https://www.linkedin.com/in/om-prakash-kr/" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline flex items-center gap-2">
                        LinkedIn: Om Prakash
                    </a>
                </li>
                <li>
                    <a href="https://www.instagram.com/om_prakash__kr/" target="_blank" rel="noopener noreferrer" class="text-pink-600 hover:underline flex items-center gap-2">
                        Instagram: @om_prakash__kr
                    </a>
                </li>
            </ul>
        `,
        author: "Om",
        date: "Dec 02, 2025",
        category: "Education",
        imageUrl: "/blog/trading-mistakes.png",
        readTime: "6 min read"
    },
    {
        id: "mr-aakash-market-insights",
        title: "Exclusive Market Insights: Nifty & Bank Nifty Analysis",
        excerpt: "Deep dive into the current market structure, key support/resistance levels, and what to expect in the coming week.",
        content: `
            <p>The market is currently at a critical juncture. In this post, I break down the technicals for Nifty and Bank Nifty.</p>
            
            <h3>Nifty 50 Analysis</h3>
            <p>We are seeing a consolidation phase near the all-time highs. A breakout above the resistance zone could trigger a fresh rally, while a breakdown could lead to a healthy correction.</p>
            
            <h3>Bank Nifty Outlook</h3>
            <p>Bank Nifty has been showing relative strength. Keep an eye on the banking heavyweights as they will dictate the next move.</p>
            
            <hr class="my-6 border-gray-200 dark:border-gray-700" />
            <p><strong>Follow for daily updates:</strong></p>
            <ul class="list-none pl-0 space-y-2">
                <li>
                    <a href="https://www.instagram.com/waahsky/" target="_blank" rel="noopener noreferrer" class="text-pink-600 hover:underline flex items-center gap-2">
                        Instagram: @waahsky
                    </a>
                </li>
            </ul>
        `,
        author: "Mr Aakash",
        date: "Dec 04, 2025",
        category: "Market Analysis",
        imageUrl: "/blog/market-analysis.png",
        readTime: "3 min read"
    },
    {
        id: "fno-strategies-masterclass",
        title: "Mastering F&O Strategies for Consistent Profits",
        excerpt: "Learn the difference between option buying and selling, and how to deploy hedged strategies for consistent returns.",
        content: `
            <p>Futures and Options (F&O) can be a wealth-building tool if used correctly. It's not about gambling; it's about probability and risk management.</p>
            
            <h3>Option Buying vs. Selling</h3>
            <p>Option buying offers unlimited profit potential but has a lower probability of success due to theta decay. Option selling offers higher probability but requires strict risk management.</p>
            
            <h3>Hedging is Key</h3>
            <p>Never trade naked options overnight. Always use spreads (Bull Call, Bear Put, Iron Condor) to define your risk and sleep peacefully.</p>
            
            <hr class="my-6 border-gray-200 dark:border-gray-700" />
            <p><strong>Follow for daily updates:</strong></p>
            <ul class="list-none pl-0 space-y-2">
                <li>
                    <a href="https://www.instagram.com/waahsky/" target="_blank" rel="noopener noreferrer" class="text-pink-600 hover:underline flex items-center gap-2">
                        Instagram: @waahsky
                    </a>
                </li>
            </ul>
        `,
        author: "Mr Aakash",
        date: "Dec 01, 2025",
        category: "F&O Strategies",
        imageUrl: "/blog/fno-strategies.png",
        readTime: "5 min read"
    }
];
