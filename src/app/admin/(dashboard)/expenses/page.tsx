"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Trash2, Calendar, Receipt, DollarSign, Search } from "lucide-react";

interface Expense {
    id: number;
    _id: number;
    title: string;
    amount: string;
    category: string;
    date: string;
    description: string;
}

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Filter State
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [searchTerm, setSearchTerm] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        category: "General",
        date: new Date().toISOString().slice(0, 10),
        description: ""
    });

    useEffect(() => {
        fetchExpenses();
    }, [selectedMonth]);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/expenses?month=${selectedMonth}`);
            const data = await res.json();
            if (data.success) {
                setExpenses(data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/expenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setIsAddModalOpen(false);
                setFormData({ title: "", amount: "", category: "General", date: new Date().toISOString().slice(0, 10), description: "" });
                fetchExpenses();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this expense?")) return;
        try {
            const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchExpenses();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filteredExpenses = expenses.filter(exp =>
        exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    return (
        <div className="min-h-screen bg-background p-8 pt-24 text-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Receipt className="text-cyan-400" /> Expense Management
                    </h1>
                    <p className="text-zinc-400">Track and manage operational costs.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative group flex items-center h-10">
                        <Calendar className="absolute left-3 w-4 h-4 text-zinc-400 group-hover:text-cyan-400 transition-colors z-10" />
                        <input
                            type="month"
                            className="h-full pl-10 pr-4 rounded-md bg-zinc-900 border border-white/10 text-white text-sm focus:ring-1 focus:ring-cyan-500 transition-all outline-none"
                            style={{ colorScheme: 'dark' }}
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => setIsAddModalOpen(true)} variant="glow">
                        <Plus className="w-4 h-4 mr-2" /> Add Expense
                    </Button>
                </div>
            </div>

            {/* Stats Card */}
            <Card className="mb-8 border-white/5 bg-zinc-900/50 backdrop-blur w-full md:w-1/3">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-zinc-400">Total Expenses ({selectedMonth})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-red-400" />
                        PKR {totalExpenses.toLocaleString()}
                    </div>
                </CardContent>
            </Card>

            {/* List */}
            <Card className="border-white/5 bg-zinc-900/50">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Expense List</CardTitle>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                        <Input
                            placeholder="Search expenses..."
                            className="pl-9 bg-black/20 border-white/10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-white/10 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-white/5 text-zinc-400 font-medium">
                                <tr>
                                    <th className="px-4 py-3 text-left">Date</th>
                                    <th className="px-4 py-3 text-left">Title</th>
                                    <th className="px-4 py-3 text-left">Category</th>
                                    <th className="px-4 py-3 text-left">Description</th>
                                    <th className="px-4 py-3 text-right">Amount</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
                                ) : filteredExpenses.length === 0 ? (
                                    <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-500">No expenses found for this month.</td></tr>
                                ) : (
                                    filteredExpenses.map((expense) => (
                                        <tr key={expense.id || expense._id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3 text-zinc-300">
                                                {new Date(expense.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-white">{expense.title}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 rounded-full text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                                    {expense.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-zinc-400 truncate max-w-[200px]">{expense.description}</td>
                                            <td className="px-4 py-3 text-right font-bold text-red-400">
                                                PKR {Number(expense.amount).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => handleDelete(expense.id || expense._id)}
                                                    className="p-2 hover:bg-red-500/20 rounded-lg text-zinc-400 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-zinc-950 border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold mb-4">Add New Expense</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Title</label>
                                <Input
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Internet Bill, Rent"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">Amount (PKR)</label>
                                    <Input
                                        required
                                        type="number"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">Date</label>
                                    <Input
                                        required
                                        type="date"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Category</label>
                                <select
                                    className="w-full h-10 px-3 rounded-md bg-zinc-900 border border-white/10 text-white focus:ring-1 focus:ring-cyan-500 outline-none"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="General">General</option>
                                    <option value="Rent">Rent</option>
                                    <option value="Utilities">Utilities</option>
                                    <option value="Salaries">Salaries</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Equipment">Equipment</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Description (Optional)</label>
                                <Input
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Additional details..."
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                                <Button type="submit" variant="glow">Save Expense</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
