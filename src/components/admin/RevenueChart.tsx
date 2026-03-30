"use client";

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RevenueData {
    admissionRevenue: number;
    monthlyRevenue: number;
    expenses: number;
    totalRevenue: number;
    netRevenue: number;
}

export default function RevenueChart({ selectedMonth }: { selectedMonth?: string }) {
    const [data, setData] = useState<RevenueData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const query = selectedMonth ? `?month=${selectedMonth}` : "";
                const res = await fetch(`/api/admin/charts${query}`);
                const json = await res.json();
                if (json.success && json.data.revenue.length > 0) {
                    setData(json.data.revenue[0]);
                } else {
                    setData({ admissionRevenue: 0, monthlyRevenue: 0, expenses: 0, totalRevenue: 0, netRevenue: 0 });
                }
            } catch (error) {
                console.error("Failed to fetch chart data", error);
                setData({ admissionRevenue: 0, monthlyRevenue: 0, expenses: 0, totalRevenue: 0, netRevenue: 0 });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedMonth]);

    // Transform to chart data - 3 separate bars
    const chartData = data ? [
        { name: 'Admission Fees', value: data.admissionRevenue, fill: '#06b6d4' },
        { name: 'Monthly Fees', value: data.monthlyRevenue, fill: '#8b5cf6' },
        { name: 'Expenses', value: data.expenses, fill: '#ef4444' }
    ] : [];

    const formatMonth = (month: string | undefined) => {
        if (!month) return '';
        const [year, m] = month.split('-');
        const date = new Date(Number(year), Number(m) - 1, 1);
        return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    };

    return (
        <Card className="border-white/5 bg-zinc-900/50">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                    <span>Revenue vs Expenses</span>
                    {selectedMonth && (
                        <span className="text-sm font-normal text-zinc-400">
                            {formatMonth(selectedMonth)}
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="h-[280px] flex items-center justify-center">
                        <span className="text-zinc-500">Loading...</span>
                    </div>
                ) : (
                    <>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={true} vertical={false} />
                                <XAxis
                                    type="number"
                                    stroke="#888888"
                                    fontSize={11}
                                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={11}
                                    width={90}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const item = payload[0].payload;
                                            return (
                                                <div className="bg-zinc-900 border border-white/10 p-2 rounded-lg shadow-xl">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded" style={{ backgroundColor: item.fill }} />
                                                        <span className="text-sm text-zinc-300">{item.name}:</span>
                                                        <span className="text-sm font-bold text-white ml-2">
                                                            PKR {item.value.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar
                                    dataKey="value"
                                    radius={[0, 6, 6, 0]}
                                    barSize={35}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>

                        {/* Summary Section */}
                        <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <span className="text-xs text-zinc-500">Total Revenue</span>
                                <span className="text-lg font-bold text-emerald-400">
                                    PKR {(data?.totalRevenue || 0).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-zinc-500">Net Profit/Loss</span>
                                <span className={`text-lg font-bold ${(data?.netRevenue || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    PKR {(data?.netRevenue || 0).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
