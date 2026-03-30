"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Edit, Plus, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

interface Group {
    id: number;
    name: string;
    pc_count: number;
    sort_order: number;
}

export default function GroupManagement() {
    const { showToast } = useToast();
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        pc_count: 20,
        sort_order: 999
    });

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await fetch("/api/groups");
            const data = await res.json();
            if (data.success) {
                setGroups(data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        setDeletingId(id);
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        try {
            const res = await fetch(`/api/groups/${deletingId}`, { method: "DELETE" });
            const data = await res.json();

            if (res.ok) {
                setGroups(groups.filter(g => g.id !== deletingId));
                showToast("Group deleted successfully", "success");
            } else {
                showToast(data.error || "Failed to delete group", "error");
            }
        } catch (error) {
            console.error(error);
            showToast("An error occurred", "error");
        } finally {
            setDeletingId(null);
        }
    };

    const handleEdit = (group: Group) => {
        setEditingGroup(group);
        setFormData({
            name: group.name,
            pc_count: group.pc_count,
            sort_order: group.sort_order || 999
        });
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingGroup(null);
        setFormData({ name: "", pc_count: 20, sort_order: 999 });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const url = editingGroup ? `/api/groups/${editingGroup.id}` : "/api/groups";
            const method = editingGroup ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                fetchGroups();
                setIsModalOpen(false);
                showToast(editingGroup ? "Group updated" : "Group created", "success");
            } else {
                showToast("Operation failed", "error");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-8 pt-24 space-y-6">
            <Card className="border-white/5 bg-zinc-900/50">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white">Group / Batch Management</CardTitle>
                    <Button onClick={handleAddNew} variant="glow" className="bg-cyan-600 hover:bg-cyan-500">
                        <Plus className="mr-2 h-4 w-4" /> Add Group
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-white/10 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-900/80 text-zinc-400 uppercase">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Group Name</th>
                                    <th className="px-6 py-4 font-medium">Total PCs</th>
                                    <th className="px-6 py-4 font-medium">Sort Order</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr><td colSpan={3} className="px-6 py-8 text-center text-zinc-500">Loading...</td></tr>
                                ) : groups.map((group) => (
                                    <tr key={group.id} className="bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{group.name}</td>
                                        <td className="px-6 py-4 text-zinc-300">{group.pc_count}</td>
                                        <td className="px-6 py-4 text-zinc-300">{group.sort_order}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-cyan-400" onClick={() => handleEdit(group)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => handleDelete(group.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingGroup ? "Edit Group" : "Add New Group"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Group Name</label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Morning 09-11"
                            required
                            className="bg-zinc-950/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Total PCs</label>
                        <Input
                            type="number"
                            value={formData.pc_count}
                            onChange={(e) => setFormData({ ...formData, pc_count: Number(e.target.value) })}
                            required
                            className="bg-zinc-950/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Sort Order (Lower appears first)</label>
                        <Input
                            type="number"
                            value={formData.sort_order}
                            onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                            required
                            className="bg-zinc-950/50"
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="glow" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Group"}
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
                    <p className="text-zinc-300">Are you sure you want to delete this group? valid students assigned to this group might be affected.</p>
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setDeletingId(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
