"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useState, useEffect } from 'react';

export default function AdmissionsChart({ selectedMonth }: { selectedMonth?: string }) {
    const [data, setData] = useState<{ name: string, students: number, left: number }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const query = selectedMonth ? `?month=${selectedMonth}` : "";
                const res = await fetch(`/api/admin/charts${query}`);
                const json = await res.json();
                if (json.success) {
                    setData(json.data.admissions);
                }
            } catch (error) {
                console.error("Failed to fetch chart data", error);
            }
        };
        fetchData();
    }, [selectedMonth]);

    const formatMonth = (month: string | undefined) => {
        if (!month) return '(Last 30 Days)';
        const [year, m] = month.split('-');
        const date = new Date(Number(year), Number(m) - 1, 1);
        return `(${date.toLocaleString('en-US', { month: 'short', year: 'numeric' })})`;
    };

    return (
        <Card className="border-white/5 bg-zinc-900/50">
            <CardHeader>
                <CardTitle>Admissions & Dropouts {formatMonth(selectedMonth)}</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            hide
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#333' }} />
                        <Bar
                            dataKey="students"
                            name="New Admission"
                            fill="#6366f1"
                            radius={[4, 4, 0, 0]}
                            barSize={20}
                        />
                        <Bar
                            dataKey="left"
                            name="Left/DropOut"
                            fill="#ef4444"
                            radius={[4, 4, 0, 0]}
                            barSize={20}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-zinc-900 border border-white/10 p-3 rounded-lg shadow-xl">
                <p className="text-zinc-400 mb-2 font-medium">{label}</p>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span className="text-sm text-zinc-300">New Admission:</span>
                        <span className="text-sm font-bold text-white ml-auto">
                            {payload[0].value}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-sm text-zinc-300">Left/DropOut:</span>
                        <span className="text-sm font-bold text-white ml-auto">
                            {payload[1]?.value || 0}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};
