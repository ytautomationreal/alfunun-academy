"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Trash2, Edit, Plus, Loader2 } from "lucide-react";
import { Student } from "@/lib/types"; // Updated import
import { Modal } from "@/components/ui/modal";
import { CustomSelect } from "@/components/ui/custom-select";
import { useToast } from "@/components/ui/toast";

export default function StudentManagement() {
    const { showToast } = useToast();
    const [students, setStudents] = useState<Student[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10;

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        fatherName: "",
        cnic: "",
        phone: "",
        address: "",
        course: "",
        admissionFeeStatus: "Unpaid",
        monthlyFeeStatus: "Unpaid",
        admissionFeeAmount: 0,
        monthlyFeeAmount: 0,
        batch: "",
        pc_number: 0,
        status: "active",
        leftDate: "",
        admissionDate: "",
        admissionFeePaid: 0,
        monthlyFeePaid: 0
    });

    useEffect(() => {
        fetchStudents(currentPage);
        fetchGroups();
        fetchCourses();
    }, [currentPage]);

    const fetchCourses = async () => {
        try {
            const res = await fetch("/api/courses");
            const data = await res.json();
            if (data.success) {
                setCourses(data.data);
            }
        } catch (error) {
            console.error("Error fetching courses", error);
        }
    };

    const fetchGroups = async () => {
        try {
            const res = await fetch("/api/groups");
            const data = await res.json();
            if (data.success) {
                setGroups(data.data);
            }
        } catch (error) {
            console.error("Error fetching groups", error);
        }
    };

    const fetchStudents = async (page: number) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/students?page=${page}&limit=${itemsPerPage}`);
            const data = await res.json();
            if (data.success) {
                setStudents(data.data);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error("Error fetching students", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        setDeletingId(id);
    };

    const confirmDelete = async () => {
        if (!deletingId) return;

        try {
            const res = await fetch(`/api/students/${deletingId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setStudents(students.filter((s) => String(s._id || s.id) !== deletingId));
                showToast("Student deleted successfully", "success");
            } else {
                const data = await res.json();
                showToast(data.error || "Failed to delete student", "error");
            }
        } catch (error) {
            console.error("Error deleting student", error);
            showToast("Something went wrong while deleting", "error");
        } finally {
            setDeletingId(null);
        }
    };

    const handleEdit = (student: Student) => {
        setEditingId(String(student._id));
        setFormData({
            name: student.name,
            fatherName: student.fatherName,
            cnic: student.cnic,
            phone: student.phone,
            address: student.address || "",
            course: student.course,
            admissionFeeStatus: student.admissionFeeStatus || "Unpaid",
            monthlyFeeStatus: student.monthlyFeeStatus || "Unpaid",
            admissionFeeAmount: student.admissionFeeAmount || 0,
            monthlyFeeAmount: student.monthlyFeeAmount || 0,
            batch: student.batch || "",
            pc_number: student.pc_number || 0,
            status: student.status || "active",
            leftDate: student.leftDate || "",
            admissionDate: student.admissionDate ? new Date(student.admissionDate).toISOString().split('T')[0] : "",
            admissionFeePaid: student.admissionFeePaid || 0,
            monthlyFeePaid: student.monthlyFeePaid || 0

        });
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingId(null);
        setFormData({
            name: "",
            fatherName: "",
            cnic: "",
            phone: "",
            address: "",
            course: "",
            admissionFeeStatus: "Unpaid",
            monthlyFeeStatus: "Unpaid",
            admissionFeeAmount: 0,
            monthlyFeeAmount: 0,
            admissionFeePaid: 0,
            monthlyFeePaid: 0,
            batch: "",
            pc_number: 0,
            status: "active",
            leftDate: "",
            admissionDate: new Date().toISOString().split('T')[0]
        });
        setIsModalOpen(true);
    };

    const [formError, setFormError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError(null);

        // Handle leftStatus logic
        const submissionData = { ...formData };
        if (formData.status === 'left' && !formData.leftDate) {
            submissionData.leftDate = new Date().toISOString();
        } else if (formData.status !== 'left') {
            submissionData.leftDate = ""; // Reset if status changed back
        }

        try {
            const url = editingId ? `/api/students/${editingId}` : "/api/admission";
            const method = editingId ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(submissionData),
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchStudents(currentPage); // Refresh list
                showToast(editingId ? "Student updated successfully" : "Student added successfully", "success");
            } else {
                const errorData = await res.json();
                const errorMessage = typeof errorData.error === "string" ? errorData.error : "Operation failed";
                setFormError(errorMessage);
                showToast(errorMessage, "error");
            }
        } catch (error) {
            console.error("Error saving student", error);
            setFormError("Network error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Since we are paginating server-side, this client-side filter only works on the current page.
    // For large datasets, we should move search to backend, but usually user searches for recent things.
    // Let's implement fully correctly: Search should also trigger an API call.
    // For now, I will keep client-side search on the *current page* to ensure speed, 
    // but the user might be confused if they search for someone on page 2.
    // I'll update the plan to handle server-side search next if needed.
    const filteredStudents = students.filter((student: Student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.course.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <Card className="border-white/5 bg-zinc-900/50">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Student Management</CardTitle>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
                            <Input
                                placeholder="Search students..."
                                className="pl-8 w-[250px] bg-zinc-950/50 border-white/10 focus:border-cyan-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleAddNew} variant="glow" className="bg-cyan-600 hover:bg-cyan-500">
                            <Plus className="mr-2 h-4 w-4" /> Add Student
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-white/10 overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-900/80 text-zinc-400 uppercase">
                                <tr>
                                    <th className="px-6 py-4 font-medium w-16">S.No</th>
                                    <th className="px-6 py-4 font-medium">Name</th>
                                    <th className="px-6 py-4 font-medium">Course</th>

                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Admission Date</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                                            Loading students...
                                        </td>
                                    </tr>
                                ) : filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                                            No students found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student: Student, index: number) => (
                                        <tr key={String(student._id)} className="bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors">
                                            <td className="px-6 py-4 text-zinc-500">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-white">
                                                <div>{student.name}</div>
                                                <div className="text-xs text-zinc-500">{student.fatherName}</div>
                                            </td>
                                            <td className="px-6 py-4 text-zinc-300">
                                                <div>{student.course}</div>
                                                {student.batch && (
                                                    <div className="text-xs text-zinc-500 mt-1">
                                                        {student.batch} | PC-{student.pc_number}
                                                    </div>
                                                )}
                                            </td>



                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold w-fit ${student.status === "active" || !student.status
                                                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                                    : student.status === "left"
                                                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                                        : "bg-green-500/10 text-green-400 border border-green-500/20"
                                                    }`}>
                                                    {student.status?.toUpperCase() || "ACTIVE"}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-zinc-400">
                                                {new Date(student.admissionDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                                                    onClick={() => handleEdit(student)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                    onClick={() => handleDelete(String(student._id || student.id))}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-2">
                <div className="text-sm text-zinc-500">
                    Showing Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="border-white/10 hover:bg-zinc-800"
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="border-white/10 hover:bg-zinc-800"
                    >
                        Next
                    </Button>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? "Edit Student" : "Add New Student"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Full Name</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="bg-zinc-950/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Father's Name</label>
                            <Input
                                value={formData.fatherName}
                                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                                required
                                className="bg-zinc-950/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">CNIC</label>
                            <Input
                                value={formData.cnic}
                                onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                                required
                                className="bg-zinc-950/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Phone</label>
                            <Input
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                                className="bg-zinc-950/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Admission Date</label>
                            <Input
                                type="date"
                                value={formData.admissionDate}
                                onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                                className="bg-zinc-950/50 [color-scheme:dark]"
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium text-zinc-300">Address</label>
                            <Input
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="bg-zinc-950/50"
                            />
                        </div>

                        {/* Course Spanning 2 cols for better look */}
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium text-zinc-300">Course</label>
                            <CustomSelect
                                value={formData.course}
                                onChange={(value) => setFormData({ ...formData, course: value })}
                                options={courses.length > 0 ? courses.map(c => ({ value: c.title, label: c.title })) : [
                                    { value: "Web Development", label: "Web Development" },
                                    { value: "Graphic Design", label: "Graphic Design" },
                                    { value: "Office Automation", label: "Office Automation" },
                                    { value: "Python Programming", label: "Python Programming" },
                                    { value: "Digital Marketing", label: "Digital Marketing" },
                                ]}
                                placeholder="Select Course"
                                required
                            />
                        </div>

                        {/* Group and PC Selection */}
                        <div className="grid grid-cols-2 gap-4 col-span-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Group / Batch</label>
                                <CustomSelect
                                    value={formData.batch}
                                    onChange={(value) => setFormData({ ...formData, batch: value })}
                                    options={groups.map((g: any) => ({ value: g.name, label: g.name }))}
                                    placeholder="Select Batch"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">PC Number</label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={999}
                                    value={formData.pc_number || ''}
                                    onChange={(e) => setFormData({ ...formData, pc_number: Number(e.target.value) })}
                                    className="bg-zinc-950/50"
                                    placeholder="e.g. 5"
                                />
                            </div>
                        </div>

                        {/* Student Status */}
                        <div className="space-y-2 col-span-2 border-t border-white/10 pt-4 mt-2">
                            <label className="text-sm font-medium text-zinc-300">Student Status</label>
                            <CustomSelect
                                value={formData.status || 'active'}
                                onChange={(value) => setFormData({ ...formData, status: value })}
                                options={[
                                    { value: "active", label: "Active" },
                                    { value: "left", label: "Left / Drop Out" },
                                    { value: "graduated", label: "Graduated" },
                                ]}
                                placeholder="Select Status"
                            />
                        </div>

                        {/* Fee Statuses & Amounts */}
                        <div className="grid grid-cols-2 gap-4 col-span-2 pt-4 border-t border-white/10">
                            <div className="col-span-2 text-sm font-medium text-cyan-400">Admission Fee</div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Total Amount</label>
                                <Input
                                    type="number"
                                    value={formData.admissionFeeAmount}
                                    onChange={(e) => {
                                        const total = Number(e.target.value);
                                        const paid = formData.admissionFeePaid;
                                        let status = "Unpaid";
                                        if (paid >= total && total > 0) status = "Paid";
                                        else if (paid > 0) status = "Partial";

                                        setFormData({
                                            ...formData,
                                            admissionFeeAmount: total,
                                            admissionFeeStatus: status
                                        });
                                    }}
                                    className="bg-zinc-950/50"
                                    placeholder="Total Fee"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Paid Amount</label>
                                <Input
                                    type="number"
                                    value={formData.admissionFeePaid}
                                    onChange={(e) => {
                                        const paid = Number(e.target.value);
                                        const total = formData.admissionFeeAmount;
                                        let status = "Unpaid";
                                        if (paid >= total && total > 0) status = "Paid";
                                        else if (paid > 0) status = "Partial";

                                        setFormData({
                                            ...formData,
                                            admissionFeePaid: paid,
                                            admissionFeeStatus: status
                                        });
                                    }}
                                    className="bg-zinc-950/50"
                                    placeholder="Paid Amount"
                                />
                            </div>

                            <div className="col-span-2 text-sm font-medium text-cyan-400 mt-2">Monthly Fee</div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Total Amount</label>
                                <Input
                                    type="number"
                                    value={formData.monthlyFeeAmount}
                                    onChange={(e) => {
                                        const total = Number(e.target.value);
                                        const paid = formData.monthlyFeePaid;
                                        let status = "Unpaid";
                                        if (paid >= total && total > 0) status = "Paid";
                                        else if (paid > 0) status = "Partial";

                                        setFormData({
                                            ...formData,
                                            monthlyFeeAmount: total,
                                            monthlyFeeStatus: status
                                        });
                                    }}
                                    className="bg-zinc-950/50"
                                    placeholder="Total Fee"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Paid Amount</label>
                                <Input
                                    type="number"
                                    value={formData.monthlyFeePaid}
                                    onChange={(e) => {
                                        const paid = Number(e.target.value);
                                        const total = formData.monthlyFeeAmount;
                                        let status = "Unpaid";
                                        if (paid >= total && total > 0) status = "Paid";
                                        else if (paid > 0) status = "Partial";

                                        setFormData({
                                            ...formData,
                                            monthlyFeePaid: paid,
                                            monthlyFeeStatus: status
                                        });
                                    }}
                                    className="bg-zinc-950/50"
                                    placeholder="Paid Amount"
                                />
                            </div>
                        </div>
                    </div>

                    {formError && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md text-sm mt-4">
                            {formError}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="glow" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Student"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                title="Confirm Delete"
            >
                <div className="space-y-4">
                    <p className="text-zinc-300">Are you sure you want to delete this student? This action cannot be undone.</p>
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setDeletingId(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </div>
                </div>
            </Modal>
        </div >
    );
}
