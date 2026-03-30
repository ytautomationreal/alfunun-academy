"use client";

import { useEffect, useState } from "react";
import { Users, CreditCard, GraduationCap, DollarSign, Calendar } from "lucide-react";
import RevenueChart from "@/components/admin/RevenueChart";
import AdmissionsChart from "@/components/admin/AdmissionsChart";
import KPICard from "@/components/admin/KPICard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Add declaration for autotable
declare module "jspdf" {
    interface jsPDF {
        lastAutoTable: { finalY: number };
        autoTable: (options: any) => void;
    }
}

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeBatches: 8,
        unpaidFees: 0,
        revenue: "PKR 1.2M",
        totalExpenses: 0,
        netProfit: 0,
        breakdown: {
            admission: { revenue: 0, paid: 0, unpaid: 0 },
            monthly: { revenue: 0, paid: 0, unpaid: 0 }
        }
    });

    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    const fetchStats = async () => {
        try {
            const query = selectedMonth ? `?month=${selectedMonth}` : "";
            const res = await fetch(`/api/admin/stats${query}`);
            const data = await res.json();
            if (data.success) {
                setStats({
                    totalStudents: data.data.totalStudents,
                    activeBatches: data.data.activeBatches,
                    unpaidFees: data.data.unpaidFees,
                    revenue: `PKR ${data.data.revenue.toLocaleString()}`,
                    totalExpenses: data.data.totalExpenses || 0,
                    netProfit: data.data.netProfit || 0,
                    breakdown: data.data.breakdown || {
                        admission: { revenue: 0, paid: 0, unpaid: 0 },
                        monthly: { revenue: 0, paid: 0, unpaid: 0 }
                    }
                });
            }
        } catch (error) {
            console.error("Failed to fetch stats", error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [selectedMonth]);

    const handleDownloadReport = () => {
        try {
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'legal'
            });

            // Header
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("ALFUNUN ACADEMY", 105, 20, { align: "center" });

            doc.setFontSize(14);
            doc.setFont("helvetica", "normal");
            doc.text("Financial & Performance Report", 105, 30, { align: "center" });
            doc.text(`Period: ${selectedMonth || "All Time"}`, 105, 38, { align: "center" });

            let y = 50;

            // Executive Summary Table
            autoTable(doc, {
                startY: y,
                head: [['Metric', 'Value']],
                body: [
                    ['Total Revenue', String(stats.revenue || "0")],
                    ['Total Expenses', `PKR ${stats.totalExpenses.toLocaleString()}`],
                    ['Net Profit', `PKR ${stats.netProfit.toLocaleString()}`],
                    ['Total Registered Students', String(stats.totalStudents || 0)],
                    ['Active Batches', String(stats.activeBatches || 0)],
                ],
                theme: 'grid',
                headStyles: { fillColor: [0, 188, 212] }, // Cyan color
                styles: { fontSize: 12, cellPadding: 3 }
            });

            // Update Y for next table - SAFE CHECK
            const finalY = (doc as any).lastAutoTable?.finalY || (y + 60);
            y = finalY + 15;

            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Detailed Fee Breakdown", 14, y);
            y += 5;

            const bd = stats.breakdown || { admission: { revenue: 0, paid: 0, unpaid: 0 }, monthly: { revenue: 0, paid: 0, unpaid: 0 } };
            const admission = bd.admission || { revenue: 0, paid: 0, unpaid: 0 };
            const monthly = bd.monthly || { revenue: 0, paid: 0, unpaid: 0 };

            // Detailed Breakdown Table
            autoTable(doc, {
                startY: y,
                head: [['Fee Type', 'Revenue Collected (PKR)', 'Paid Count', 'Unpaid Count']],
                body: [
                    [
                        'Admission Fees',
                        String((admission.revenue || 0).toLocaleString()),
                        String(admission.paid || 0),
                        String(admission.unpaid || 0)
                    ],
                    [
                        'Monthly Fees',
                        String((monthly.revenue || 0).toLocaleString()),
                        String(monthly.paid || 0),
                        String(monthly.unpaid || 0)
                    ],
                    [
                        'Total',
                        String(((admission.revenue || 0) + (monthly.revenue || 0)).toLocaleString()),
                        String((admission.paid || 0) + (monthly.paid || 0)),
                        String((admission.unpaid || 0) + (monthly.unpaid || 0))
                    ]
                ],
                theme: 'grid',
                headStyles: { fillColor: [50, 50, 50] },
                styles: { fontSize: 11, cellPadding: 3 }
            });

            const filename = `Alfunun_Report_${selectedMonth || "AllTime"}_Legal.pdf`;
            doc.save(filename);
        } catch (error) {
            console.error("Error generating report:", error);
            // Show the actual error message to the user for easier debugging
            alert(`Failed to generate report: ${(error as Error).message}`);
        }
    };

    return (
        <div className="min-h-screen bg-background p-8 pt-24">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                <div className="flex gap-4 items-center">
                    <div className="relative group flex items-center h-10">
                        <Calendar className="absolute left-3 w-4 h-4 text-zinc-400 group-hover:text-cyan-400 transition-colors z-10" />
                        <input
                            type="month"
                            className="h-full pl-10 pr-4 rounded-md bg-zinc-900 border border-white/10 text-white text-sm focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none cursor-pointer hover:border-cyan-500/50 [color-scheme:dark]"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleDownloadReport} variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-950">
                        <DollarSign className="w-4 h-4 mr-2" /> Download Report
                    </Button>
                    <Link href="/admin/students">
                        <Button variant="outline">Manage Students</Button>
                    </Link>
                    <Link href="/admin/fees">
                        <Button variant="glow">Fee Management</Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Link href="/admin/students" className="block h-full transition-transform hover:scale-105">
                    <KPICard
                        title="Total Students"
                        value={stats.totalStudents.toString()}
                        icon={Users}
                        description="Registered students"
                    />
                </Link>
                <Link href="/admin/fees" className="block h-full transition-transform hover:scale-105">
                    <KPICard
                        title={selectedMonth ? "Revenue" : "Total Revenue"}
                        value={stats.revenue}
                        icon={DollarSign}
                        description={selectedMonth ? `For ${selectedMonth}` : "Gross Income"}
                    />
                </Link>
                <Link href="/admin/expenses" className="block h-full transition-transform hover:scale-105">
                    <KPICard
                        title="Total Expenses"
                        value={`PKR ${stats.totalExpenses.toLocaleString()}`}
                        icon={CreditCard}
                        description="Operational costs"
                    />
                </Link>
                <div className="block h-full transition-transform hover:scale-105">
                    <KPICard
                        title="Net Profit"
                        value={`PKR ${stats.netProfit.toLocaleString()}`}
                        icon={DollarSign} // Using DollarSign as it's profit
                        description="Revenue - Expenses"
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <RevenueChart selectedMonth={selectedMonth} />
                <AdmissionsChart selectedMonth={selectedMonth} />
            </div>
        </div>
    );
}
