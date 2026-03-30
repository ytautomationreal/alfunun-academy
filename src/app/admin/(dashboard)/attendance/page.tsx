"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CalendarCheck, Download, Share2, Search, CheckCircle, XCircle, Clock } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Student {
    student_id: number;
    student_name: string;
    fatherName: string;
    rollNumber: string;
    present: number;
    absent: number;
    leave: number;
    total: number;
}

export default function AttendancePage() {
    const [view, setView] = useState<'mark' | 'report'>('mark');
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().slice(0, 10));
    const [selectedBatch, setSelectedBatch] = useState("All");
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // For marking
    const [batches, setBatches] = useState<string[]>([]);

    // For marking
    const [attendanceData, setAttendanceData] = useState<{ [key: number]: 'present' | 'absent' | 'leave' }>({});

    // For reports
    const [reportData, setReportData] = useState<Student[]>([]);

    const [reportType, setReportType] = useState<'daily' | 'monthly'>('monthly');
    const [dailyReportData, setDailyReportData] = useState<any[]>([]);

    useEffect(() => {
        fetchBatches();
    }, []);

    useEffect(() => {
        if (view === 'mark') fetchStudentsForMarking();
        if (view === 'report') {
            if (reportType === 'monthly') fetchReportData();
            if (reportType === 'daily') fetchDailyReportData();
        }
    }, [view, currentDate, selectedBatch, reportType]);

    const fetchBatches = async () => {
        try {
            const res = await fetch("/api/admin/batches/list");
            const data = await res.json();
            if (data.success) {
                setBatches(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch batches", error);
        }
    };

    const fetchStudentsForMarking = async () => {
        setLoading(true);
        try {
            // First fetch active students
            // Added explicit all=true to bypass pagination if no batch selected, though usually batch is selected
            const res = await fetch(`/api/students?batch=${selectedBatch !== 'All' ? selectedBatch : ''}&all=true`);
            const data = await res.json();
            if (data.success) {
                setStudents(data.data);
                // Initialize attendance as Present by default
                const initial: any = {};
                data.data.forEach((s: any) => initial[s.id] = 'present');
                setAttendanceData(initial);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const month = currentDate.slice(0, 7);
            const res = await fetch(`/api/attendance/stats?month=${month}&batch=${selectedBatch}`);
            const json = await res.json();
            if (json.success) {
                setReportData(json.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDailyReportData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/attendance/daily?date=${currentDate}&batch=${selectedBatch}`);
            const json = await res.json();
            if (json.success) {
                setDailyReportData(json.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkChange = (id: number, status: 'present' | 'absent' | 'leave') => {
        setAttendanceData(prev => ({ ...prev, [id]: status }));
    };

    const handleSubmitAttendance = async () => {
        if (!confirm(`Mark attendance for ${Object.keys(attendanceData).length} students on ${currentDate}?`)) return;

        try {
            const payload = Object.entries(attendanceData).map(([id, status]) => ({
                studentId: Number(id),
                status
            }));

            const res = await fetch("/api/attendance/mark", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date: currentDate, attendance: payload })
            });

            if (res.ok) {
                alert("Attendance marked successfully!");
                setView('report');
                setReportType('daily'); // Switch to daily report to see what was marked
            } else {
                alert("Failed to mark attendance.");
            }
        } catch (error) {
            console.error(error);
            alert("Error submitting attendance.");
        }
    };

    const handleShareSummary = async () => {
        let summary = "";

        if (reportType === 'monthly') {
            if (reportData.length === 0) {
                alert("No data to share.");
                return;
            }
            const present = reportData.reduce((sum, s) => sum + s.present, 0);
            const absent = reportData.reduce((sum, s) => sum + s.absent, 0);
            const leave = reportData.reduce((sum, s) => sum + s.leave, 0);
            const total = present + absent + leave;
            const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
            summary = `*Monthly Attendance Summary*\nMonth: ${currentDate.slice(0, 7)}\nBatch: ${selectedBatch}\n\nPresent: ${present}\nAbsent: ${absent}\nLeave: ${leave}\nAttendance: ${percentage}%`;
        } else {
            // Daily Report
            if (dailyReportData.length === 0) {
                alert("No data to share.");
                return;
            }
            const present = dailyReportData.filter(d => d.status === 'present').length;
            const absent = dailyReportData.filter(d => d.status === 'absent').length;
            const leave = dailyReportData.filter(d => d.status === 'leave').length;

            summary = `*Daily Attendance Summary*\nDate: ${currentDate}\nBatch: ${selectedBatch}\n\nPresent: ${present}\nAbsent: ${absent}\nLeave: ${leave}`;

            const absentees = dailyReportData.filter(d => d.status === 'absent').map(d => d.student_name).join(', ');
            if (absentees) {
                summary += `\n\nAbsentees: ${absentees}`;
            }
        }

        try {
            await navigator.clipboard.writeText(summary);
            alert("Summary copied to clipboard!");
        } catch (err) {
            console.error("Clipboard failed:", err);
            prompt("Copy this summary manually:", summary);
        }
    };

    const handleDownloadPDF = async () => {
        const doc = new jsPDF() as any;

        // Load Logo
        const logoUrl = '/logo-new.png';
        const logoImg = new Image();
        logoImg.src = logoUrl;
        await new Promise((resolve) => {
            logoImg.onload = resolve;
            logoImg.onerror = resolve;
        });

        if (reportType === 'monthly') {
            if (reportData.length === 0) { alert("No data"); return; }

            // Header
            doc.setFillColor(39, 39, 42); // Zinc-800 equivalent (dark grey)
            doc.rect(0, 0, 210, 28, 'F');

            try {
                doc.addImage(logoImg, 'PNG', 14, 4, 20, 20);
            } catch (e) {
                console.error("Logo fetch failed", e);
            }

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("ALFUNUN ACADEMY", 105, 12, { align: "center" });

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Monthly Attendance Report`, 105, 20, { align: "center" });

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            doc.text(`Month: ${currentDate.slice(0, 7)}`, 14, 38);
            doc.text(`Batch: ${selectedBatch}`, 150, 38);

            autoTable(doc, {
                startY: 42,
                theme: 'plain', // Minimalist theme
                headStyles: { fillColor: [50, 50, 50], textColor: 255, fontSize: 10 },
                styles: { fontSize: 9, cellPadding: 2, lineColor: [200, 200, 200], lineWidth: 0.1 },
                head: [['Name', 'Father Name', 'Present', 'Absent', 'Leave', '%']],
                body: reportData.map(s => {
                    const total = s.present + s.absent + s.leave;
                    const perc = total > 0 ? ((s.present / total) * 100).toFixed(0) + '%' : '-';
                    return [s.student_name, s.fatherName, s.present, s.absent, s.leave, perc];
                }),
                didParseCell: function (data: any) {
                    if (data.section === 'body') {
                        // Absent Column (Index 3) - Red if > 0
                        if (data.column.index === 3 && data.cell.raw > 0) {
                            data.cell.styles.textColor = [220, 38, 38]; // Red
                            data.cell.styles.fontStyle = 'bold';
                        }
                        // Leave Column (Index 4) - Yellow/Orange if > 0
                        if (data.column.index === 4 && data.cell.raw > 0) {
                            data.cell.styles.textColor = [234, 179, 8]; // Yellow-600
                            data.cell.styles.fontStyle = 'bold';
                        }
                        // Percentage Column (Index 5)
                        if (data.column.index === 5) {
                            const val = parseInt(data.cell.raw as string);
                            if (!isNaN(val)) {
                                data.cell.styles.fontStyle = 'bold';
                                if (val >= 80) data.cell.styles.textColor = [22, 163, 74]; // Green
                                else if (val < 50) data.cell.styles.textColor = [220, 38, 38]; // Red
                                else data.cell.styles.textColor = [234, 179, 8]; // Yellow/Orange
                            }
                        }
                    }
                }
            });
            doc.save(`Monthly_Attendance_${currentDate.slice(0, 7)}.pdf`);
        } else {
            // Daily PDF
            if (dailyReportData.length === 0) { alert("No data"); return; }

            // Header
            doc.setFillColor(39, 39, 42);
            doc.rect(0, 0, 210, 28, 'F');

            try {
                doc.addImage(logoImg, 'PNG', 14, 4, 20, 20);
            } catch (e) {
                console.error("Logo fetch failed", e);
            }

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("ALFUNUN ACADEMY", 105, 12, { align: "center" });

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Daily Attendance Report`, 105, 20, { align: "center" });

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            doc.text(`Date: ${currentDate}`, 14, 38);
            doc.text(`Batch: ${selectedBatch}`, 150, 38);

            const presentCount = dailyReportData.filter(d => d.status === 'present').length;
            const absentCount = dailyReportData.filter(d => d.status === 'absent').length;
            const leaveCount = dailyReportData.filter(d => d.status === 'leave').length;

            doc.setFontSize(9);
            doc.setTextColor(80, 80, 80);
            doc.text(`Summary:  Present: ${presentCount}   |   Absent: ${absentCount}   |   Leave: ${leaveCount}`, 14, 44);

            autoTable(doc, {
                startY: 48,
                theme: 'plain', // Minimalist theme
                headStyles: { fillColor: [50, 50, 50], textColor: 255, fontSize: 10 },
                styles: { fontSize: 9, cellPadding: 2, lineColor: [200, 200, 200], lineWidth: 0.1 },
                head: [['Name', 'Father Name', 'Status']],
                body: dailyReportData.map((s, index) => ([
                    s.student_name,
                    s.fatherName,
                    (s.status || '-').toUpperCase()
                ])),
                didParseCell: function (data: any) {
                    if (data.section === 'body' && data.column.index === 2) {
                        data.cell.styles.fontStyle = 'bold';
                        if (data.cell.raw === 'ABSENT') data.cell.styles.textColor = [220, 38, 38];
                        if (data.cell.raw === 'PRESENT') data.cell.styles.textColor = [22, 163, 74];
                        if (data.cell.raw === 'LEAVE') data.cell.styles.textColor = [234, 179, 8];
                    }
                }
            });
            doc.save(`Daily_Attendance_${currentDate}.pdf`);
        }
    };

    return (
        <div className="min-h-screen bg-background p-8 pt-24 text-white">
            {/* ... (Header remains same) ... */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <CalendarCheck className="text-cyan-400" /> Attendance System
                    </h1>
                    <p className="text-zinc-400">Mark daily attendance and generate monthly reports.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={view === 'mark' ? 'glow' : 'outline'}
                        onClick={() => setView('mark')}
                    >
                        Mark Attendance
                    </Button>
                    <Button
                        variant={view === 'report' ? 'glow' : 'outline'}
                        onClick={() => setView('report')}
                    >
                        View Reports
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6 bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                <Input
                    type="date"
                    value={currentDate}
                    onChange={(e) => setCurrentDate(e.target.value)}
                    className="w-40 bg-zinc-950 border-white/10"
                />
                <select
                    className="h-10 px-3 rounded-md bg-zinc-950 border border-white/10 text-white focus:ring-1 focus:ring-cyan-500 outline-none"
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                >
                    <option value="All">All Batches</option>
                    {batches.map(batch => (
                        <option key={batch} value={batch}>{batch}</option>
                    ))}
                </select>

                {view === 'report' && (
                    <div className="ml-auto flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleShareSummary} className="text-green-400 border-green-500/20 hover:bg-green-500/10">
                            <Share2 className="w-4 h-4 mr-2" /> Share Summary
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/10">
                            <Download className="w-4 h-4 mr-2" /> Download PDF
                        </Button>
                    </div>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className="text-center py-20 text-zinc-500">Loading data...</div>
            ) : view === 'mark' ? (
                <Card className="border-white/5 bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle>Mark Daily Attendance</CardTitle>
                        <CardDescription>Toggle status for each student. Default is Present.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {students.length === 0 ? (
                                <p className="text-center text-zinc-500 py-8">No active students found in this batch.</p>
                            ) : (
                                students.map(student => (
                                    <div key={student.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs">
                                                {student.pc_number || '##'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{student.name}</p>
                                                <p className="text-xs text-zinc-400">{student.fatherName}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleMarkChange(student.id, 'present')}
                                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${attendanceData[student.id] === 'present' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'text-zinc-500 hover:text-green-400'}`}
                                            >
                                                Present
                                            </button>
                                            <button
                                                onClick={() => handleMarkChange(student.id, 'absent')}
                                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${attendanceData[student.id] === 'absent' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-zinc-500 hover:text-red-400'}`}
                                            >
                                                Absent
                                            </button>
                                            <button
                                                onClick={() => handleMarkChange(student.id, 'leave')}
                                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${attendanceData[student.id] === 'leave' ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/20' : 'text-zinc-500 hover:text-yellow-400'}`}
                                            >
                                                Leave
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {students.length > 0 && (
                            <div className="mt-8 flex justify-end">
                                <Button onClick={handleSubmitAttendance} variant="glow" size="lg" className="w-full md:w-auto">
                                    <CheckCircle className="w-5 h-5 mr-2" /> Submit Attendance
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-white/5 bg-zinc-900/50">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>
                            {reportType === 'monthly' ? `Monthly Report (${currentDate.slice(0, 7)})` : `Daily Report (${currentDate})`}
                        </CardTitle>
                        <div className="bg-zinc-950 p-1 rounded-lg border border-white/10 flex">
                            <button
                                onClick={() => setReportType('daily')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${reportType === 'daily' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Daily
                            </button>
                            <button
                                onClick={() => setReportType('monthly')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${reportType === 'monthly' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Monthly
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-md border border-white/10">
                            {reportType === 'monthly' ? (
                                <table className="w-full text-sm">
                                    <thead className="bg-white/5 text-zinc-400 font-medium">
                                        <tr>
                                            <th className="px-4 py-3 text-left w-16">S.No</th>
                                            <th className="px-4 py-3 text-left">Student</th>
                                            <th className="px-4 py-3 text-center text-green-400">Present</th>
                                            <th className="px-4 py-3 text-center text-red-400">Absent</th>
                                            <th className="px-4 py-3 text-center text-yellow-400">Leave</th>
                                            <th className="px-4 py-3 text-center">Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {reportData.length === 0 ? (
                                            <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-500">No attendance records for this month.</td></tr>
                                        ) : (
                                            reportData.map((student, idx) => {
                                                const total = student.present + student.absent + student.leave;
                                                const perc = total > 0 ? (student.present / total) * 100 : 0;
                                                return (
                                                    <tr key={student.student_id} className="hover:bg-white/5">
                                                        <td className="px-4 py-3 text-zinc-500">{idx + 1}</td>
                                                        <td className="px-4 py-3 font-medium text-white">
                                                            {student.student_name}
                                                            <span className="block text-xs text-zinc-500">{student.fatherName}</span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">{student.present}</td>
                                                        <td className="px-4 py-3 text-center">{student.absent}</td>
                                                        <td className="px-4 py-3 text-center">{student.leave}</td>
                                                        <td className="px-4 py-3 text-center font-bold">
                                                            <span className={perc < 75 ? "text-red-400" : "text-green-400"}>
                                                                {perc.toFixed(0)}%
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="bg-white/5 text-zinc-400 font-medium">
                                        <tr>
                                            <th className="px-4 py-3 text-left w-16">S.No</th>
                                            <th className="px-4 py-3 text-left">Student</th>
                                            <th className="px-4 py-3 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {dailyReportData.length === 0 ? (
                                            <tr><td colSpan={3} className="px-4 py-8 text-center text-zinc-500">No records found for this date.</td></tr>
                                        ) : (
                                            dailyReportData.map((student, idx) => (
                                                <tr key={idx} className="hover:bg-white/5">
                                                    <td className="px-4 py-3 text-zinc-500">{idx + 1}</td>
                                                    <td className="px-4 py-3 font-medium text-white">
                                                        {student.student_name}
                                                        <span className="block text-xs text-zinc-500">{student.fatherName}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${student.status === 'present' ? 'bg-green-500/10 text-green-400' :
                                                            student.status === 'absent' ? 'bg-red-500/10 text-red-400' :
                                                                student.status === 'leave' ? 'bg-yellow-500/10 text-yellow-400' :
                                                                    'bg-zinc-800 text-zinc-400'
                                                            }`}>
                                                            {(student.status || 'Not Marked').toUpperCase()}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
