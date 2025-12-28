"use client";

import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";

interface OptionStrike {
    strike: number;
    call_oi: number;
    put_oi: number;
    call_volume: number;
    put_volume: number;
}

interface OptionsChartProps {
    data: OptionStrike[];
}

export default function OptionsChart({ data }: OptionsChartProps) {
    return (
        <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="strike" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(val) => (val / 1000).toFixed(0) + 'k'} />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                        itemStyle={{ color: 'var(--foreground)' }}
                        cursor={{ fill: 'var(--accent)', opacity: 0.2 }}
                    />
                    <Legend />
                    <Bar dataKey="call_oi" name="Call OI (Resistance)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="put_oi" name="Put OI (Support)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
