"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, Edit2, Search, Wallet, CreditCard, Share2, Settings, Loader2, CalendarPlus, RefreshCw, CheckCircle, Trash2, Download } from "lucide-react";
import { Student } from "@/lib/types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useToast } from "@/components/ui/toast";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/custom-select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export default function FeeManagement() {
    const { showToast } = useToast();
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isGeneratingFees, setIsGeneratingFees] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [feesAlreadyGenerated, setFeesAlreadyGenerated] = useState(false);
    const [generatedCount, setGeneratedCount] = useState(0);

    // KPI Counts
    const [unpaidAdmissionCount, setUnpaidAdmissionCount] = useState(0);
    const [unpaidMonthlyCount, setUnpaidMonthlyCount] = useState(0);
    const [unpaidAdmissionAmount, setUnpaidAdmissionAmount] = useState(0);
    const [unpaidMonthlyAmount, setUnpaidMonthlyAmount] = useState(0);

    // Share State
    const receiptRef = useRef<HTMLDivElement>(null);
    const [studentToShare, setStudentToShare] = useState<Student | null>(null);
    const [isSharing, setIsSharing] = useState(false);

    // Share Fallback State
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareBlob, setShareBlob] = useState<Blob | null>(null);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [editFormData, setEditFormData] = useState({
        admissionFeeStatus: "",
        admissionFeeAmount: 0,
        admissionFeePaid: 0,
        monthlyFeeStatus: "",
        monthlyFeeAmount: 0,
        monthlyFeePaid: 0,
        base_monthly_fee: 0,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feeHistory, setFeeHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Monthly Fee Records for selected month
    const [monthlyRecords, setMonthlyRecords] = useState<any[]>([]);
    const [loadingMonthlyRecords, setLoadingMonthlyRecords] = useState(false);
    const [monthlySummary, setMonthlySummary] = useState<any>(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        filterStudents();
    }, [students, searchTerm, statusFilter, selectedMonth]);

    // Check if fees are already generated for selected month
    useEffect(() => {
        checkFeesGenerated();
        fetchMonthlyRecords();
    }, [selectedMonth]);

    const checkFeesGenerated = async () => {
        try {
            const res = await fetch(`/api/generate-monthly-fees?month=${selectedMonth}`);
            const data = await res.json();
            if (data.success && data.records) {
                setFeesAlreadyGenerated(data.records.length > 0);
                setGeneratedCount(data.records.length);
            } else {
                setFeesAlreadyGenerated(false);
                setGeneratedCount(0);
            }
        } catch (error) {
            setFeesAlreadyGenerated(false);
            setGeneratedCount(0);
        }
    };

    // Fetch monthly fee records for the selected month
    const fetchMonthlyRecords = async () => {
        setLoadingMonthlyRecords(true);
        try {
            const res = await fetch(`/api/monthly-fee-report?month=${selectedMonth}`);
            const data = await res.json();
            if (data.success) {
                setMonthlyRecords(data.records || []);
                setMonthlySummary(data.summary || null);
            } else {
                setMonthlyRecords([]);
                setMonthlySummary(null);
            }
        } catch (error) {
            console.error('Fetch monthly records error:', error);
            setMonthlyRecords([]);
            setMonthlySummary(null);
        } finally {
            setLoadingMonthlyRecords(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await fetch("/api/students?limit=1000&all=true");
            const data = await res.json();
            if (data.success) {
                setStudents(data.data);
                let admCount = 0;
                let monCount = 0;
                let admAmount = 0;
                let monAmount = 0;

                data.data.forEach((s: Student) => {
                    const admPending = (s.admissionFeeAmount || 0) - (s.admissionFeePaid || 0);
                    if (admPending > 0) {
                        admCount++;
                        admAmount += admPending;
                    }
                    const monPending = (s.monthlyFeeAmount || 0) - (s.monthlyFeePaid || 0);
                    if (monPending > 0) {
                        monCount++;
                        monAmount += monPending;
                    }
                });

                setUnpaidAdmissionCount(admCount);
                setUnpaidMonthlyCount(monCount);
                setUnpaidAdmissionAmount(admAmount);
                setUnpaidMonthlyAmount(monAmount);
            }
        } catch (error) {
            console.error("Failed to fetch students", error);
            showToast("Failed to load students", "error");
        } finally {
            setLoading(false);
        }
    };

    const filterStudents = () => {
        let result = students;

        // Filter by admission date - only show students whose admission month <= selected month
        // Student admitted in Feb should NOT appear in Jan view, but SHOULD appear in Feb & later
        result = result.filter(s => {
            if (!s.admissionDate) return true; // If no admission date, show student
            const admissionMonth = new Date(s.admissionDate).toISOString().slice(0, 7);
            return admissionMonth <= selectedMonth;
        });

        if (statusFilter === 'unpaid') {
            result = result.filter(s => {
                const admMsg = (s.admissionFeeAmount || 0) - (s.admissionFeePaid || 0);
                const monMsg = (s.monthlyFeeAmount || 0) - (s.monthlyFeePaid || 0);
                return admMsg > 0 || monMsg > 0;
            });
        } else if (statusFilter === 'paid') {
            result = result.filter(s => {
                const admMsg = (s.admissionFeeAmount || 0) - (s.admissionFeePaid || 0);
                const monMsg = (s.monthlyFeeAmount || 0) - (s.monthlyFeePaid || 0);
                return admMsg <= 0 && monMsg <= 0;
            });
        }

        if (searchTerm) {
            const lowerInfo = searchTerm.toLowerCase();
            result = result.filter(s =>
                s.name.toLowerCase().includes(lowerInfo) ||
                (s.phone && s.phone.includes(lowerInfo)) ||
                (s.course && s.course.toLowerCase().includes(lowerInfo))
            );
        }

        setFilteredStudents(result);
    };

    const handleEditClick = async (student: Student) => {
        setEditingStudent(student);
        setEditFormData({
            admissionFeeStatus: student.admissionFeeStatus || "Unpaid",
            admissionFeeAmount: student.admissionFeeAmount || 0,
            admissionFeePaid: student.admissionFeePaid || 0,
            monthlyFeeStatus: student.monthlyFeeStatus || "Unpaid",
            monthlyFeeAmount: student.monthlyFeeAmount || 0,
            monthlyFeePaid: student.monthlyFeePaid || 0,
            base_monthly_fee: student.base_monthly_fee || student.monthlyFeeAmount || 0,
        });
        setIsEditModalOpen(true);

        // Fetch fee history
        setLoadingHistory(true);
        try {
            const res = await fetch(`/api/student-fee-history/${student._id || student.id}`);
            const data = await res.json();
            if (data.success) {
                setFeeHistory(data.history || []);
            }
        } catch (error) {
            console.error("Failed to fetch fee history", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleSaveFee = async () => {
        if (!editingStudent) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/students/${editingStudent._id || editingStudent.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editFormData),
            });

            if (res.ok) {
                showToast("Fee status updated successfully", "success");
                setIsEditModalOpen(false);
                fetchStudents();
            } else {
                showToast("Failed to update fees", "error");
            }
        } catch (error) {
            console.error("Error updating fee", error);
            showToast("Error updating fee", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGenerateMonthlyFees = async () => {
        if (feesAlreadyGenerated) {
            showToast(`Fees for ${selectedMonth} are already generated (${generatedCount} students)`, "error");
            return;
        }

        if (!confirm(`Generate monthly fees for ${selectedMonth}? This will add the base monthly fee to all active students plus any previous dues.`)) return;

        setIsGeneratingFees(true);
        try {
            // First run migration to ensure table exists
            await fetch('/api/setup-monthly-fees');

            // Then generate fees
            const res = await fetch('/api/generate-monthly-fees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ month: selectedMonth })
            });

            const data = await res.json();

            if (data.success) {
                showToast(`Fees generated: ${data.generated} students, ${data.skipped} skipped`, "success");
                fetchStudents(); // Refresh the list
                checkFeesGenerated(); // Update the button state
            } else {
                showToast(data.error || "Failed to generate fees", "error");
            }
        } catch (error) {
            console.error("Generate fees error:", error);
            showToast("Error generating fees", "error");
        } finally {
            setIsGeneratingFees(false);
        }
    };

    const downloadMonthlyReport = async () => {
        try {
            const res = await fetch(`/api/monthly-fee-report?month=${selectedMonth}`);
            const data = await res.json();

            if (!data.success || !data.records || data.records.length === 0) {
                showToast('No data available for this month', 'error');
                return;
            }

            const monthName = new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

            // Create PDF
            const pdf = new jsPDF('portrait', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();

            // Header
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.text('ALFUNUN ACADEMY', pageWidth / 2, 15, { align: 'center' });

            pdf.setFontSize(14);
            pdf.text(`Monthly Fee Report - ${monthName}`, pageWidth / 2, 25, { align: 'center' });

            // Summary
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Total Students: ${data.summary.totalStudents}`, 14, 35);
            pdf.text(`Paid: ${data.summary.paidCount} | Partial: ${data.summary.partialCount} | Unpaid: ${data.summary.unpaidCount}`, 14, 41);
            pdf.text(`Total Amount: Rs. ${data.summary.totalAmount.toLocaleString()}`, 14, 47);
            pdf.text(`Collected: Rs. ${data.summary.totalPaid.toLocaleString()} | Pending: Rs. ${data.summary.totalPending.toLocaleString()}`, 14, 53);

            // Table header
            let y = 65;
            pdf.setFillColor(30, 30, 30);
            pdf.rect(14, y - 5, pageWidth - 28, 8, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(9);
            pdf.text('S.No', 16, y);
            pdf.text('Student Name', 28, y);
            pdf.text('Course', 85, y);
            pdf.text('Fee', 120, y);
            pdf.text('Paid', 140, y);
            pdf.text('Due', 160, y);
            pdf.text('Status', 180, y);

            pdf.setTextColor(0, 0, 0);
            pdf.setFont('helvetica', 'normal');
            y += 8;

            // Table rows
            data.records.forEach((record: any, index: number) => {
                if (y > 280) {
                    pdf.addPage();
                    y = 20;
                }

                // Alternate row color
                if (index % 2 === 0) {
                    pdf.setFillColor(245, 245, 245);
                    pdf.rect(14, y - 4, pageWidth - 28, 7, 'F');
                }

                pdf.text(String(index + 1), 16, y);
                pdf.text(record.student_name.substring(0, 25), 28, y);
                pdf.text((record.course || '-').substring(0, 15), 85, y);
                pdf.text(String(record.total_due), 120, y);
                pdf.text(String(record.paid), 140, y);
                pdf.text(String(record.balance), 160, y);

                // Status with color
                const status = record.status === 'paid' ? 'PAID' : record.status === 'partial' ? 'PARTIAL' : 'UNPAID';
                if (record.status === 'paid') pdf.setTextColor(0, 150, 0);
                else if (record.status === 'partial') pdf.setTextColor(200, 150, 0);
                else pdf.setTextColor(200, 0, 0);
                pdf.text(status, 180, y);
                pdf.setTextColor(0, 0, 0);

                y += 7;
            });

            // Footer
            pdf.setFontSize(8);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 290);

            pdf.save(`Fee_Report_${selectedMonth}.pdf`);
            showToast('Report downloaded!', 'success');
        } catch (error) {
            console.error('Download error:', error);
            showToast('Failed to download report', 'error');
        }
    };

    const getPendingAmount = (student: Student) => {
        const admPending = (student.admissionFeeAmount || 0) - (student.admissionFeePaid || 0);
        const monPending = (student.monthlyFeeAmount || 0) - (student.monthlyFeePaid || 0);
        return Math.max(0, admPending) + Math.max(0, monPending);
    };

    const getPendingDescription = (student: Student) => {
        const types = [];
        const admPending = (student.admissionFeeAmount || 0) - (student.admissionFeePaid || 0);
        const monPending = (student.monthlyFeeAmount || 0) - (student.monthlyFeePaid || 0);

        if (admPending > 0) types.push("Admission Fee");
        if (monPending > 0) types.push("Monthly Fee");
        return types.length > 0 ? types.join(" & ") : "All Paid";
    };

    const generateVoucher = async (student: Student, action: 'download' | 'print' = 'download') => {
        try {
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a5'
            });

            const COLORS = {
                CREAM: "#FEFCE8",
                TEAL_DARK: "#064E3B",
                ORANGE: "#D97706",
                ORANGE_BG: "#FFF7ED",
                TEXT_DARK: "#064E3B",
                TEXT_LIGHT: "#FFFFFF",
                BORDER: "#B45309",
                GREY_TEXT: "#4B5563"
            };

            doc.setFont("helvetica");

            const loadImage = (src: string): Promise<HTMLImageElement> => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.crossOrigin = "Anonymous";
                    img.src = src;
                    img.onload = () => resolve(img);
                    img.onerror = reject;
                });
            };

            const formatCurrency = (amount: number | string | undefined) => {
                const num = Number(amount) || 0;
                return num % 1 === 0 ? num.toLocaleString() : num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            };

            let logo: HTMLImageElement | null = null;
            try {
                logo = await loadImage("/logo-new.png");
            } catch (e) {
                console.warn("Logo failed to load", e);
            }

            // --- HEADER RENDERING LOGIC ---
            let y = 10;
            const pageWidth = 148;

            // Draw Background (Common)
            doc.setFillColor(COLORS.CREAM);
            doc.rect(0, 0, 148, 210, "F");
            doc.setFillColor(COLORS.ORANGE_BG);
            doc.rect(0, 100, 148, 110, "F");

            // DESIGN SWITCHER
            const title = "ALFUNUN ACADEMY";
            const tagline = "Premium Learning, Modern Skills";

            // 1. Classic Centered (Fixed overlap)
            y = 15;
            if (logo) {
                const logoSize = 25;
                const x = (pageWidth - logoSize) / 2;
                doc.addImage(logo, "PNG", x, y, logoSize, logoSize);
                y += logoSize + 10;
            } else y += 20;

            doc.setTextColor(COLORS.TEAL_DARK);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(20);
            doc.text(title, (pageWidth - doc.getTextWidth(title)) / 2, y);
            y += 7;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(tagline, (pageWidth - doc.getTextWidth(tagline)) / 2, y);
            y += 8;
            doc.setDrawColor(COLORS.ORANGE);
            doc.setLineWidth(1);
            doc.line(20, y, 128, y);



            y += 10; // Spacing before Student Info

            // --- STUDENT INFO SECTIONS ---
            const drawInfoRow = (label: string, value: string, currentY: number) => {
                const margin = 10;
                const labelWidth = 35;
                const valueWidth = pageWidth - (margin * 2) - labelWidth - 2;

                doc.setFillColor(COLORS.TEAL_DARK);
                doc.rect(margin, currentY, labelWidth, 8, "F");
                doc.setTextColor(COLORS.TEXT_LIGHT);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(9);
                doc.text(label, margin + 2, currentY + 5.5);

                doc.setFillColor("#FFFFFF");
                doc.setDrawColor(COLORS.ORANGE);
                doc.setLineWidth(0.5);
                doc.roundedRect(margin + labelWidth + 2, currentY, valueWidth, 8, 1, 1, "FD");
                doc.setTextColor(COLORS.TEXT_DARK);
                doc.setFont("helvetica", "bold");
                doc.text(value || "-", margin + labelWidth + 5, currentY + 5.5);
            };

            drawInfoRow("Student Name:", student.name, y);
            y += 10;
            drawInfoRow("Father Name:", student.fatherName, y);
            y += 10;
            drawInfoRow("Batch:", student.batch || student.course, y);
            y += 10;
            drawInfoRow("Date:", new Date().toLocaleDateString(), y);
            y += 10;
            if (student.pc_number) {
                drawInfoRow("PC Number:", String(student.pc_number), y);
                y += 10;
            }

            y += 5;

            // --- FEES SECTION ---
            const colMargin = 10;
            const colGap = 5;
            const colWidth = (pageWidth - (colMargin * 2) - colGap) / 2;

            const drawFeeColumn = (title: string, amount: number | undefined, x: number, currY: number) => {
                const value = Number(amount) || 0;

                doc.setFillColor(COLORS.TEAL_DARK);
                doc.rect(x, currY, colWidth, 10, "F");
                doc.setTextColor(COLORS.TEXT_LIGHT);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                doc.text(title, x + (colWidth / 2), currY + 6.5, { align: "center" });

                doc.setFillColor("#FFFFFF");
                doc.setDrawColor(COLORS.ORANGE);
                doc.rect(x, currY + 10, colWidth, 15, "FD");

                doc.setTextColor(COLORS.TEXT_DARK);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(14);
                const displayAmount = value > 0 ? `Rs. ${formatCurrency(value)}` : "Rs. 0";

                doc.text(displayAmount, x + (colWidth / 2), currY + 20, { align: "center" });
            };

            const feesY = y;
            drawFeeColumn("ADMISSION FEE", student.admissionFeeAmount, colMargin, feesY);
            drawFeeColumn("MONTHLY FEE", student.monthlyFeeAmount, colMargin + colWidth + colGap, feesY);

            y = feesY + 40;

            // --- TOTALS SECTION ---
            const totalPending = getPendingAmount(student);

            const admPaid = Number(student.admissionFeePaid) || 0;
            const monPaid = Number(student.monthlyFeePaid) || 0;
            const totalPaid = admPaid + monPaid;

            const admTotal = Number(student.admissionFeeAmount) || 0;
            const monTotal = Number(student.monthlyFeeAmount) || 0;
            const totalPayable = admTotal + monTotal;

            const drawSummaryRow = (label: string, value: string, bgColor: string, txtColor: string, currY: number) => {
                const margin = 10;
                const splitX = 90;
                const fullWidth = pageWidth - (margin * 2);
                const valWidth = fullWidth - (splitX - margin);

                doc.setFillColor(bgColor);
                doc.rect(margin, currY, splitX - margin, 10, "F");
                doc.setTextColor(txtColor);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.text(label, margin + 5, currY + 6.5);

                doc.setFillColor("#FFFFFF");
                doc.setDrawColor(COLORS.ORANGE);
                doc.setLineWidth(0.5);
                doc.rect(splitX, currY, valWidth, 10, "FD");
                doc.setTextColor(COLORS.TEXT_DARK);
                doc.text(value, splitX + 5, currY + 6.5);
            };

            drawSummaryRow("TOTAL PAYABLE:", `Rs. ${formatCurrency(totalPayable)}`, COLORS.TEAL_DARK, COLORS.TEXT_LIGHT, y);
            y += 12;

            drawSummaryRow("PAID AMOUNT:", `Rs. ${formatCurrency(totalPaid)}`, COLORS.ORANGE, COLORS.TEXT_LIGHT, y);
            y += 12;

            drawSummaryRow("BALANCE DUE:", `Rs. ${formatCurrency(totalPending)}`, COLORS.ORANGE, COLORS.TEXT_LIGHT, y);
            y += 25;

            // --- FOOTER SIGNATURES ---
            doc.setDrawColor(COLORS.TEAL_DARK);
            doc.setLineWidth(0.5);

            doc.line(20, y, 60, y);
            doc.setTextColor(COLORS.TEAL_DARK);
            doc.setFontSize(8);
            doc.text("Student Signature", 40, y + 4, { align: "center" });

            doc.line(90, y, 130, y);
            doc.text("Authorized Signature", 110, y + 4, { align: "center" });

            if (action === 'print') {
                doc.autoPrint();
                window.open(doc.output('bloburl'), '_blank');
            } else {
                const cleanName = (student.name || "Student").replace(/[^a-zA-Z0-9]/g, "_");
                doc.save(`fee_voucher_${cleanName}.pdf`);
            }
        } catch (error) {
            console.error("Voucher generation failed", error);
            showToast("Failed to generate voucher", "error");
        }
    };

    const handleShare = (student: Student) => {
        setStudentToShare(student);
        // The useEffect will trigger the actual share once the element is rendered
    };

    useEffect(() => {
        const processShare = async () => {
            if (studentToShare && receiptRef.current) {
                setIsSharing(true);
                try {
                    // Wait a bit not strictly needed for PDF but good for state stability
                    await new Promise(resolve => setTimeout(resolve, 500));

                    // 1. Generate PDF (Reuse existing logic but get Blob)
                    const doc = new jsPDF({
                        orientation: 'portrait',
                        unit: 'mm',
                        format: 'a5'
                    });

                    // We need to re-run the PDF generation logic here or refactor. 
                    // To keep it simple and safe, we will capture the Hidden Ref as an Image and put it in PDF
                    // This creates a perfect visual copy.

                    const canvas = await html2canvas(receiptRef.current, {
                        scale: 2,
                        useCORS: true,
                        backgroundColor: null
                    });

                    const imgData = canvas.toDataURL('image/png');
                    const pdfWidth = doc.internal.pageSize.getWidth();
                    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                    doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    const pdfBlob = doc.output('blob');

                    // 2. Upload to Catbox (Temp File Host)
                    const formData = new FormData();
                    formData.append('reqtype', 'fileupload');
                    formData.append('userhash', ''); // No hash needed for anon
                    formData.append('fileToUpload', pdfBlob, `voucher_${studentToShare.name.replace(/\s+/g, '_')}.pdf`);

                    const uploadRes = await fetch('/api/upload/proxy', {
                        method: 'POST',
                        body: formData
                    });
                    // Force fallback path - external uploads are blocked by CORS
                    throw new Error("Use fallback modal instead");

                    if (uploadRes.ok) {
                        const fileUrl = await uploadRes.text();

                        // 3. Share Line (Text + Link)
                        const currentStudent = studentToShare!;
                        const amount = getPendingAmount(currentStudent);
                        const desc = getPendingDescription(currentStudent);
                        const cleanName = currentStudent.name;

                        const message = amount > 0
                            ? `Dear ${cleanName}, reminder from Alfunun Academy. Pending: ${desc} (PKR ${amount}).\n\nDownload Voucher: ${fileUrl}`
                            : `Dear ${cleanName}, thank you for clearing your dues. Download Voucher: ${fileUrl}`;

                        let phone = currentStudent.phone?.replace(/\D/g, '') || '';
                        if (phone.startsWith('0')) phone = '92' + phone.substring(1);

                        const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
                        window.open(waLink, '_blank');

                        showToast("Link Generated & WhatsApp Opened!", "success");
                    } else {
                        throw new Error("Upload failed");
                    }

                } catch (error) {
                    console.log("Showing share modal");

                    // Generate PNG and show modal
                    const canvas = await html2canvas(receiptRef.current!, { scale: 2 });
                    canvas.toBlob((blob) => {
                        if (blob) {
                            setShareBlob(blob);
                            setIsShareModalOpen(true);
                        }
                    }, 'image/png');
                } finally {
                    setIsSharing(false);
                }
            }
        };

        if (studentToShare) {
            processShare();
        }
    }, [studentToShare]);

    const fallbackShare = (student: Student, canvas: HTMLCanvasElement, message: string) => {
        // Download Image
        saveAsImage(canvas, student.name);

        let phone = student.phone?.replace(/\D/g, '') || '';
        if (phone.startsWith('0')) phone = '92' + phone.substring(1);

        // Open WhatsApp
        const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(waLink, '_blank');

        showToast("Voucher downloaded! Please attach it in WhatsApp.", "success");
    };

    const saveAsImage = (canvas: HTMLCanvasElement, name: string) => {
        const link = document.createElement('a');
        link.download = `fee_voucher_${name.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL();
        link.click();
    };

    const handleCustomWhatsApp = () => {
        if (!studentToShare) return;

        const amount = getPendingAmount(studentToShare);
        const desc = getPendingDescription(studentToShare);
        const message = amount > 0
            ? `Dear ${studentToShare.name},\n\nThis is a reminder from *Alfunun Academy*.\n\n📋 *Pending Dues:*\n${desc}\n\n💰 *Total Amount:* PKR ${amount.toLocaleString()}\n\nPlease clear your dues at your earliest convenience.\n\nThank you! 🙏`
            : `Dear ${studentToShare.name},\n\nThank you for clearing your dues at *Alfunun Academy*! ✅\n\nWe appreciate your timely payment.\n\nThank you! 🙏`;

        let phone = studentToShare.phone?.replace(/\D/g, '') || '';
        if (phone.startsWith('0')) phone = '92' + phone.substring(1);

        const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(waLink, '_blank');

        showToast("WhatsApp opened!", "success");
        setIsShareModalOpen(false);
        setStudentToShare(null);
    };

    const handleCustomDownload = () => {
        if (!studentToShare || !shareBlob) return;

        // Download PNG directly from the shareBlob (same design as print voucher)
        const link = document.createElement('a');
        link.href = URL.createObjectURL(shareBlob);
        link.download = `fee_voucher_${studentToShare.name.replace(/\s+/g, '_')}.png`;
        link.click();

        showToast("PNG Downloaded!", "success");
        setIsShareModalOpen(false);
        setStudentToShare(null);
    };

    const handlePrintList = () => {
        window.print();
    };

    // Helper for formatting currency in render
    const formatCurr = (amount: any) => {
        const num = Number(amount) || 0;
        return num.toLocaleString();
    };

    return (
        <div className="space-y-6 min-h-screen print:w-full print:block">
            {/* Fallback Share Modal */}
            <Modal
                title={`Share ${studentToShare?.name}'s Voucher`}
                isOpen={isShareModalOpen}
                onClose={() => { setIsShareModalOpen(false); setStudentToShare(null); }}
            >
                <p className="text-sm text-zinc-400 mb-4">Choose how you want to share this voucher:</p>
                <div className="flex flex-col gap-4">
                    <Button
                        onClick={handleCustomWhatsApp}
                        className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
                    >
                        <Share2 className="w-4 h-4" />
                        Share via WhatsApp (Direct)
                    </Button>
                    <Button
                        onClick={handleCustomDownload}
                        variant="outline"
                        className="w-full border-green-500/50 text-green-400 hover:bg-green-500/10 flex items-center justify-center gap-2"
                    >
                        <Printer className="w-4 h-4" />
                        Download PNG
                    </Button>
                </div>
            </Modal>

            {/* Hidden Receipt for Sharing */}
            <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
                {studentToShare && (
                    <div
                        ref={receiptRef}
                        className="w-[595px] h-[842px] bg-[#FEFCE8] relative text-[#064E3B] font-sans p-8 box-border flex flex-col"
                        style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
                    >
                        {/* Background Bottom Half */}
                        <div className="absolute bottom-0 left-0 w-full h-[45%] bg-[#FFF7ED] z-0"></div>

                        <div className="relative z-10 flex flex-col h-full">
                            {/* Header */}
                            <div className="flex flex-col items-center justify-center mb-6">
                                <img src="/logo-new.png" alt="Logo" className="w-[80px] h-[80px] mb-4 object-contain" />
                                <h1 className="text-3xl font-bold text-[#064E3B] tracking-wide mb-2">ALFUNUN ACADEMY</h1>
                                <p className="text-[#064E3B] text-sm tracking-widest uppercase">Premium Learning, Modern Skills</p>
                            </div>

                            <div className="w-full h-px bg-[#D97706] mb-8"></div>

                            {/* Student Info */}
                            <div className="space-y-4 mb-8">
                                {[
                                    { l: "Student Name:", v: studentToShare.name },
                                    { l: "Father Name:", v: studentToShare.fatherName },
                                    { l: "Batch:", v: studentToShare.batch || studentToShare.course },
                                    { l: "Date:", v: new Date().toLocaleDateString() },
                                    studentToShare.pc_number ? { l: "PC Number:", v: studentToShare.pc_number } : null
                                ].filter(Boolean).map((item: any, i) => (
                                    <div key={i} className="flex items-center">
                                        <div className="w-32 bg-[#064E3B] text-white text-sm font-bold py-2 px-3 rounded-l-md">
                                            {item.l}
                                        </div>
                                        <div className="flex-1 bg-white border border-[#D97706] text-[#064E3B] font-bold py-2 px-3 rounded-r-md">
                                            {item.v || "-"}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Fees Grid */}
                            <div className="grid grid-cols-2 gap-6 mb-12">
                                {[
                                    { title: "ADMISSION FEE", amount: studentToShare.admissionFeeAmount },
                                    { title: "MONTHLY FEE", amount: studentToShare.monthlyFeeAmount }
                                ].map((fee, i) => (
                                    <div key={i} className="flex flex-col">
                                        <div className="bg-[#064E3B] text-white text-center font-bold py-2 text-sm uppercase rounded-t-lg">
                                            {fee.title}
                                        </div>
                                        <div className="bg-white border border-[#D97706] border-t-0 p-6 flex items-center justify-center rounded-b-lg shadow-sm">
                                            <span className="text-2xl font-bold text-[#064E3B]">
                                                Rs. {formatCurr(fee.amount)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="space-y-3 mb-auto">
                                {[
                                    { l: "TOTAL PAYABLE:", v: (studentToShare.admissionFeeAmount || 0) + (studentToShare.monthlyFeeAmount || 0), bg: "#064E3B", c: "white" },
                                    { l: "PAID AMOUNT:", v: (studentToShare.admissionFeePaid || 0) + (studentToShare.monthlyFeePaid || 0), bg: "#D97706", c: "white" },
                                    { l: "BALANCE DUE:", v: getPendingAmount(studentToShare), bg: "#D97706", c: "white" }
                                ].map((row, i) => (
                                    <div key={i} className="flex items-center">
                                        <div className="w-40 py-2 px-4 text-sm font-bold rounded-l-md" style={{ backgroundColor: row.bg, color: row.c }}>
                                            {row.l}
                                        </div>
                                        <div className="flex-1 bg-white border border-[#D97706] py-2 px-4 text-[#064E3B] font-bold rounded-r-md">
                                            Rs. {formatCurr(row.v)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Signatures */}
                            <div className="flex justify-between mt-12 pt-8 relative">
                                <div className="w-48 text-center">
                                    <div className="border-t border-[#064E3B] pt-2 text-xs text-[#064E3B]">Student Signature</div>
                                </div>
                                <div className="w-48 text-center">
                                    <div className="border-t border-[#064E3B] pt-2 text-xs text-[#064E3B]">Authorized Signature</div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
            {/* Header Cards (KPIs) */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                <Card className="relative overflow-hidden border-none bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 shadow-xl min-h-[140px] group transition-all hover:scale-[1.01]">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wallet className="h-24 w-24 text-white transform rotate-12" />
                    </div>
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-purple-100 flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            Admission Fees Pending
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="flex flex-col gap-1">
                            <div className="text-3xl font-bold text-white tracking-tight">
                                Rs. {unpaidAdmissionAmount.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-2 text-purple-200/80 text-sm mt-1">
                                <span className="bg-white/10 px-2 py-0.5 rounded text-white font-medium">
                                    {unpaidAdmissionCount}
                                </span>
                                <span>students have pending dues</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-none bg-gradient-to-br from-pink-600 via-rose-500 to-orange-500 shadow-xl min-h-[140px] group transition-all hover:scale-[1.01]">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CreditCard className="h-24 w-24 text-white transform -rotate-12" />
                    </div>
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-rose-100 flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Monthly Fees Pending
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="flex flex-col gap-1">
                            <div className="text-3xl font-bold text-white tracking-tight">
                                Rs. {unpaidMonthlyAmount.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-2 text-rose-200/80 text-sm mt-1">
                                <span className="bg-white/10 px-2 py-0.5 rounded text-white font-medium">
                                    {unpaidMonthlyCount}
                                </span>
                                <span>students have pending dues</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Card className="border-white/5 bg-zinc-900/50 print:border-none print:shadow-none print:bg-white">
                <CardHeader className="flex flex-row items-center justify-between print:hidden">
                    <CardTitle className="text-white">Fee Management</CardTitle>
                    <div className="flex gap-2 items-center">
                        <CustomSelect
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={[
                                { value: "all", label: "All Students" },
                                { value: "unpaid", label: "Unpaid Only" },
                                { value: "paid", label: "Paid Only" }
                            ]}
                            placeholder="Filter Status"
                        />
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="h-10 px-3 rounded-md bg-zinc-950/50 border border-white/10 text-white text-sm focus:ring-1 focus:ring-cyan-500 outline-none"
                            style={{ colorScheme: 'dark' }}
                        />
                        <Button
                            onClick={handleGenerateMonthlyFees}
                            variant={feesAlreadyGenerated ? "outline" : "glow"}
                            disabled={isGeneratingFees || feesAlreadyGenerated}
                            className={`whitespace-nowrap ${feesAlreadyGenerated ? 'border-green-500/50 text-green-400 cursor-not-allowed' : ''}`}
                        >
                            {isGeneratingFees ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : feesAlreadyGenerated ? (
                                <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                            ) : (
                                <CalendarPlus className="mr-2 h-4 w-4" />
                            )}
                            {feesAlreadyGenerated ? `Generated (${generatedCount})` : 'Generate Fees'}
                        </Button>
                        <Button
                            onClick={downloadMonthlyReport}
                            variant="outline"
                            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                            disabled={!feesAlreadyGenerated}
                        >
                            <Download className="mr-2 h-4 w-4" /> Download Report
                        </Button>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="rounded-md border border-white/10 overflow-x-auto print:border-none">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-900/80 text-zinc-400 uppercase print:bg-gray-100 print:text-black">
                                <tr>
                                    <th className="px-6 py-4 font-medium w-16">S.No</th>
                                    <th className="px-6 py-4 font-medium">Name</th>
                                    <th className="px-6 py-4 font-medium">Course</th>
                                    <th className="px-6 py-4 font-medium">Admission Fee</th>
                                    <th className="px-6 py-4 font-medium">Monthly Fee ({new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})</th>
                                    <th className="px-6 py-4 font-medium text-right no-print">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 print:divide-gray-200">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center text-zinc-500">Loading...</td></tr>
                                ) : filteredStudents.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center text-zinc-500">No students found.</td></tr>
                                ) : (
                                    filteredStudents.map((student, index) => (
                                        <tr key={String(student._id)} className="bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors print:bg-white">
                                            <td className="px-6 py-4 font-bold text-zinc-500 print:text-black">
                                                {(index + 1).toString().padStart(2, '0')}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-white print:text-black">
                                                {student.name}
                                                <div className="text-xs text-zinc-500">{student.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 text-zinc-300 print:text-black">{student.course}</td>

                                            {/* Admission Fee Column */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold w-fit ${student.admissionFeeStatus === "Paid"
                                                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                                        : student.admissionFeeStatus === "Partial"
                                                            ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                                                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                                                        }`}>
                                                        {student.admissionFeeStatus || 'Unpaid'}
                                                    </span>
                                                    {student.admissionFeeAmount > 0 && (
                                                        <div className="text-xs text-zinc-400">
                                                            <div>Total: Rs. {student.admissionFeeAmount.toLocaleString()}</div>
                                                            <div className="text-zinc-500">Paid: Rs. {(student.admissionFeePaid || 0).toLocaleString()}</div>
                                                            {(student.admissionFeeAmount - (student.admissionFeePaid || 0)) > 0 &&
                                                                <div className="text-red-400">Due: Rs. {(student.admissionFeeAmount - (student.admissionFeePaid || 0)).toLocaleString()}</div>
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Monthly Fee Column - Shows selected month's data */}
                                            <td className="px-6 py-4">
                                                {(() => {
                                                    // Find this student's record for the selected month
                                                    const monthRecord = monthlyRecords.find(r => r.student_id === (student._id || student.id));

                                                    if (loadingMonthlyRecords) {
                                                        return <span className="text-zinc-500 text-xs">Loading...</span>;
                                                    }

                                                    if (!monthRecord) {
                                                        return (
                                                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                                                                No Record
                                                            </span>
                                                        );
                                                    }

                                                    const status = monthRecord.status === 'paid' ? 'Paid' : monthRecord.status === 'partial' ? 'Partial' : 'Unpaid';

                                                    return (
                                                        <div className="flex flex-col gap-1">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold w-fit ${status === "Paid"
                                                                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                                                : status === "Partial"
                                                                    ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                                                                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                                                                }`}>
                                                                {status}
                                                            </span>
                                                            <div className="text-xs text-zinc-400">
                                                                <div>Total: Rs. {Number(monthRecord.total_due).toLocaleString()}</div>
                                                                <div className="text-zinc-500">Paid: Rs. {Number(monthRecord.paid).toLocaleString()}</div>
                                                                {Number(monthRecord.balance) > 0 &&
                                                                    <div className="text-red-400">Due: Rs. {Number(monthRecord.balance).toLocaleString()}</div>
                                                                }
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </td>

                                            <td className="px-6 py-4 text-right no-print">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                                                        onClick={() => handleEditClick(student)}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-zinc-400 hover:text-white"
                                                        onClick={() => generateVoucher(student, 'print')}
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-green-400 hover:text-green-300"
                                                        onClick={() => handleShare(student)}
                                                        disabled={isSharing && studentToShare?._id === student._id}
                                                    >
                                                        {isSharing && studentToShare?._id === student._id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Share2 className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                        onClick={async () => {
                                                            if (!confirm(`Delete ${student.name}? This cannot be undone.`)) return;
                                                            try {
                                                                const res = await fetch(`/api/students/${student._id || student.id}`, { method: 'DELETE' });
                                                                if (res.ok) {
                                                                    showToast('Student deleted', 'success');
                                                                    fetchStudents();
                                                                } else {
                                                                    showToast('Failed to delete', 'error');
                                                                }
                                                            } catch (error) {
                                                                showToast('Error deleting student', 'error');
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={`Edit Fee Status: ${editingStudent?.name}`}
            >
                <div className="space-y-4">
                    <div className="space-y-4">
                        {/* Admission Fee Edit */}
                        <div className="space-y-4 border-b border-white/10 pb-4">
                            <h3 className="text-sm font-medium text-cyan-400">Admission Fee</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Total Amount</label>
                                    <Input
                                        type="number"
                                        value={editFormData.admissionFeeAmount}
                                        onChange={(e) => {
                                            const total = Number(e.target.value);
                                            const paid = editFormData.admissionFeePaid;
                                            let status = "Unpaid";
                                            if (paid >= total && total > 0) status = "Paid";
                                            else if (paid > 0) status = "Partial";

                                            setEditFormData({ ...editFormData, admissionFeeAmount: total, admissionFeeStatus: status });
                                        }}
                                        className="bg-zinc-950/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Paid Amount</label>
                                    <Input
                                        type="number"
                                        value={editFormData.admissionFeePaid}
                                        onChange={(e) => {
                                            const paid = Number(e.target.value);
                                            const total = editFormData.admissionFeeAmount;
                                            let status = "Unpaid";
                                            if (paid >= total && total > 0) status = "Paid";
                                            else if (paid > 0) status = "Partial";

                                            setEditFormData({ ...editFormData, admissionFeePaid: paid, admissionFeeStatus: status });
                                        }}
                                        className="bg-zinc-950/50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Monthly Fee Info - No manual edit, use badges below */}
                        <div className="space-y-2 border-b border-white/10 pb-4">
                            <h3 className="text-sm font-medium text-cyan-400">Monthly Fee</h3>
                            <p className="text-xs text-zinc-400">
                                Use the <span className="text-red-400 font-bold">UNPAID</span> / <span className="text-blue-400 font-bold">SKIP</span> buttons in Month-wise Fee History below to mark payments.
                            </p>
                            <div className="flex gap-4 text-sm">
                                <span className="text-zinc-400">Total: <span className="text-white font-bold">Rs. {editFormData.monthlyFeeAmount.toLocaleString()}</span></span>
                                <span className="text-zinc-400">Paid: <span className="text-green-400 font-bold">Rs. {editFormData.monthlyFeePaid.toLocaleString()}</span></span>
                                <span className="text-zinc-400">Status: <span className={`font-bold ${editFormData.monthlyFeeStatus === 'Paid' ? 'text-green-400' : editFormData.monthlyFeeStatus === 'Partial' ? 'text-yellow-400' : 'text-red-400'}`}>{editFormData.monthlyFeeStatus}</span></span>
                            </div>
                        </div>

                        {/* Base Monthly Fee (for auto-generation) */}
                        <div className="space-y-4 border-t border-white/10 pt-4">
                            <h3 className="text-sm font-medium text-green-400">Base Monthly Fee (Auto-Generate)</h3>
                            <p className="text-xs text-zinc-500">This is the fixed monthly rate used when generating new monthly fees. Set this based on the student's admission agreement (e.g., 2500 or 3000).</p>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Base Rate (PKR)</label>
                                <Input
                                    type="number"
                                    value={editFormData.base_monthly_fee}
                                    onChange={(e) => setEditFormData({ ...editFormData, base_monthly_fee: Number(e.target.value) })}
                                    className="bg-zinc-950/50"
                                    placeholder="e.g., 2500 or 3000"
                                />
                            </div>
                        </div>

                        {/* Month-wise Fee History */}
                        <div className="space-y-4 border-t border-white/10 pt-4">
                            <h3 className="text-sm font-medium text-purple-400">Month-wise Fee History</h3>
                            {loadingHistory ? (
                                <p className="text-xs text-zinc-500">Loading history...</p>
                            ) : feeHistory.length === 0 ? (
                                <p className="text-xs text-zinc-500">No monthly fee records. Click "Generate Fees" to create records for this student.</p>
                            ) : (
                                <div className="max-h-48 overflow-y-auto space-y-2">
                                    {feeHistory.map((record: any) => (
                                        <div
                                            key={record.id}
                                            className={`flex items-center justify-between p-3 rounded-lg border ${record.status === 'paid'
                                                ? 'bg-green-500/10 border-green-500/30'
                                                : record.status === 'partial'
                                                    ? 'bg-yellow-500/10 border-yellow-500/30'
                                                    : 'bg-red-500/10 border-red-500/30'
                                                }`}
                                        >
                                            <div>
                                                <p className="font-medium text-white">
                                                    {new Date(record.month_year + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                </p>
                                                <p className="text-xs text-zinc-400">
                                                    Fee: Rs. {Number(record.amount).toLocaleString()}
                                                    {record.previous_dues > 0 && ` + Dues: Rs. ${Number(record.previous_dues).toLocaleString()}`}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span
                                                    className={`px-2 py-1 rounded text-xs font-bold cursor-pointer transition-all hover:scale-105 ${record.status === 'paid'
                                                        ? 'bg-green-500 text-white hover:bg-red-500'
                                                        : record.status === 'partial'
                                                            ? 'bg-yellow-500 text-black hover:bg-green-500 hover:text-white'
                                                            : 'bg-red-500 text-white hover:bg-green-500'
                                                        }`}
                                                    onClick={async () => {
                                                        if (!editingStudent) return;

                                                        // Toggle: PAID -> UNPAID (set paid to 0), UNPAID/PARTIAL -> PAID (set paid to totalDue)
                                                        const totalDue = Number(record.amount) + Number(record.previous_dues);
                                                        const newPaidAmount = record.status === 'paid' ? 0 : totalDue;

                                                        try {
                                                            const res = await fetch(`/api/student-fee-history/${editingStudent._id || editingStudent.id}`, {
                                                                method: 'PATCH',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({
                                                                    month_year: record.month_year,
                                                                    paid_amount: newPaidAmount
                                                                })
                                                            });

                                                            const result = await res.json();

                                                            if (res.ok && result.success) {
                                                                const newStatusLabel = record.status === 'paid' ? 'Unpaid' : 'Paid';
                                                                showToast(`${record.month_year} marked as ${newStatusLabel}!`, 'success');

                                                                // Update modal form data immediately
                                                                setEditFormData(prev => ({
                                                                    ...prev,
                                                                    monthlyFeePaid: result.totalPaid || prev.monthlyFeePaid,
                                                                    monthlyFeeAmount: result.totalAmount || prev.monthlyFeeAmount,
                                                                    monthlyFeeStatus: result.status || prev.monthlyFeeStatus
                                                                }));

                                                                // Refresh history
                                                                const histRes = await fetch(`/api/student-fee-history/${editingStudent._id || editingStudent.id}`);
                                                                const histData = await histRes.json();
                                                                if (histData.success) {
                                                                    setFeeHistory(histData.history || []);
                                                                }

                                                                // Refresh student list
                                                                await fetchStudents();
                                                            } else {
                                                                showToast(result.error || 'Failed to update', 'error');
                                                            }
                                                        } catch (error) {
                                                            console.error('UNPAID click error:', error);
                                                            showToast('Error updating payment', 'error');
                                                        }
                                                    }}
                                                    title={record.status !== 'paid' ? 'Click to mark as Paid' : 'Already Paid'}
                                                >
                                                    {record.status === 'paid' ? 'PAID' : record.status === 'partial' ? 'PARTIAL' : 'UNPAID'}
                                                </span>
                                                {record.status !== 'paid' && (
                                                    <button
                                                        className="ml-2 px-2 py-1 rounded text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/50 hover:bg-blue-500 hover:text-white transition-all"
                                                        onClick={async () => {
                                                            if (!editingStudent) return;
                                                            if (!confirm('Skip this month? Student was on leave and won\'t be charged.')) return;

                                                            try {
                                                                const res = await fetch(`/api/student-fee-history/${editingStudent._id || editingStudent.id}`, {
                                                                    method: 'PATCH',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({
                                                                        month_year: record.month_year,
                                                                        action: 'waive'
                                                                    })
                                                                });
                                                                const result = await res.json();

                                                                if (res.ok && result.success) {
                                                                    showToast(`${record.month_year} skipped/waived!`, 'success');

                                                                    // Update modal form data if totals are returned
                                                                    if (result.totalPaid !== undefined) {
                                                                        setEditFormData(prev => ({
                                                                            ...prev,
                                                                            monthlyFeePaid: result.totalPaid,
                                                                            monthlyFeeAmount: result.totalAmount || prev.monthlyFeeAmount,
                                                                            monthlyFeeStatus: result.status || prev.monthlyFeeStatus
                                                                        }));
                                                                    }

                                                                    // Refresh history
                                                                    const histRes = await fetch(`/api/student-fee-history/${editingStudent._id || editingStudent.id}`);
                                                                    const histData = await histRes.json();
                                                                    if (histData.success) {
                                                                        setFeeHistory(histData.history || []);
                                                                    }
                                                                    await fetchStudents();
                                                                } else {
                                                                    showToast(result.error || 'Failed to skip', 'error');
                                                                }
                                                            } catch (error) {
                                                                console.error('SKIP click error:', error);
                                                                showToast('Error skipping month', 'error');
                                                            }
                                                        }}
                                                        title="Skip this month (student was on leave)"
                                                    >
                                                        SKIP
                                                    </button>
                                                )}
                                                {/* Partial Payment Input */}
                                                {record.status !== 'paid' && (
                                                    <div className="flex items-center gap-1 mt-2">
                                                        <input
                                                            type="number"
                                                            placeholder="Amount"
                                                            className="w-20 px-2 py-1 text-xs bg-zinc-900 border border-white/20 rounded text-white focus:border-cyan-500 outline-none"
                                                            id={`partial-${record.month_year}`}
                                                            min="0"
                                                            max={Number(record.balance)}
                                                        />
                                                        <button
                                                            className="px-2 py-1 rounded text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500 hover:text-white transition-all"
                                                            onClick={async () => {
                                                                if (!editingStudent) return;
                                                                const input = document.getElementById(`partial-${record.month_year}`) as HTMLInputElement;
                                                                const partialAmount = Number(input?.value) || 0;

                                                                if (partialAmount <= 0) {
                                                                    showToast('Enter a valid amount', 'error');
                                                                    return;
                                                                }

                                                                const currentPaid = Number(record.paid) || 0;
                                                                const newPaidAmount = currentPaid + partialAmount;

                                                                try {
                                                                    const res = await fetch(`/api/student-fee-history/${editingStudent._id || editingStudent.id}`, {
                                                                        method: 'PATCH',
                                                                        headers: { 'Content-Type': 'application/json' },
                                                                        body: JSON.stringify({
                                                                            month_year: record.month_year,
                                                                            paid_amount: newPaidAmount
                                                                        })
                                                                    });

                                                                    const result = await res.json();

                                                                    if (res.ok && result.success) {
                                                                        showToast(`Rs. ${partialAmount} added to ${record.month_year}!`, 'success');
                                                                        input.value = '';

                                                                        setEditFormData(prev => ({
                                                                            ...prev,
                                                                            monthlyFeePaid: result.totalPaid || prev.monthlyFeePaid,
                                                                            monthlyFeeAmount: result.totalAmount || prev.monthlyFeeAmount,
                                                                            monthlyFeeStatus: result.status || prev.monthlyFeeStatus
                                                                        }));

                                                                        const histRes = await fetch(`/api/student-fee-history/${editingStudent._id || editingStudent.id}`);
                                                                        const histData = await histRes.json();
                                                                        if (histData.success) {
                                                                            setFeeHistory(histData.history || []);
                                                                        }
                                                                        await fetchStudents();
                                                                    } else {
                                                                        showToast(result.error || 'Failed to add payment', 'error');
                                                                    }
                                                                } catch (error) {
                                                                    console.error('Partial payment error:', error);
                                                                    showToast('Error adding payment', 'error');
                                                                }
                                                            }}
                                                            title="Add partial payment"
                                                        >
                                                            + ADD
                                                        </button>
                                                    </div>
                                                )}
                                                <p className="text-xs text-zinc-400 mt-1">
                                                    {record.status !== 'paid' && `Due: Rs. ${Number(record.balance).toLocaleString()}`}
                                                    {record.status === 'paid' && record.amount === 0 && 'Waived/Skipped'}
                                                    {record.status === 'paid' && record.amount > 0 && `Paid: Rs. ${Number(record.paid).toLocaleString()}`}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button variant="glow" onClick={handleSaveFee} disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Update Fees"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
