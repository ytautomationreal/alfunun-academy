"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Monitor, User } from "lucide-react";
import { Student } from "@/lib/types";

// Groups fetched dynamically
interface Group {
    id: number;
    name: string;
    pc_count: number;
}

export default function ActiveBatchesPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [grpRes, stuRes] = await Promise.all([
                fetch("/api/groups"),
                fetch("/api/students")
            ]);

            const grpData = await grpRes.json();
            const stuData = await stuRes.json();

            if (grpData.success) {
                setGroups(grpData.data);
                if (grpData.data.length > 0) setSelectedGroup(grpData.data[0]);
            }
            if (stuData.success) {
                setStudents(stuData.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen pt-24 p-8 text-white">Loading...</div>;

    // Default if no groups
    if (!selectedGroup) return <div className="min-h-screen pt-24 p-8 text-white">No active batches/groups found. Please create one in Settings.</div>;

    // Filter students for the selected group
    const groupStudents = students.filter(s => s.batch === selectedGroup.name);

    // Create a map of PC Number -> Student
    const pcMap = new Map<number, Student>();
    groupStudents.forEach(s => {
        if (s.pc_number) pcMap.set(s.pc_number, s);
    });

    return (
        <div className="min-h-screen bg-background p-8 pt-24 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Active Batches & PC Slots</h1>
                    <p className="text-zinc-400">View student allocation per batch.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {groups.map(group => (
                        <Button
                            key={group.id}
                            variant={selectedGroup.id === group.id ? "glow" : "outline"}
                            onClick={() => setSelectedGroup(group)}
                            className="text-xs md:text-sm"
                        >
                            {group.name}
                        </Button>
                    ))}
                </div>
            </div>

            <Card className="border-white/5 bg-zinc-900/50">
                <CardHeader>
                    <CardTitle>{selectedGroup.name} - Lab Status</CardTitle>
                    <CardDescription>
                        {groupStudents.length} Students Occupying PCs (Total Capacity: {selectedGroup.pc_count})
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {Array.from({ length: selectedGroup.pc_count }, (_, i) => i + 1).map(pcNum => {
                            const student = pcMap.get(pcNum);
                            const isOccupied = !!student;

                            return (
                                <div
                                    key={pcNum}
                                    className={`
                                        relative group p-4 rounded-xl border transition-all duration-300
                                        flex flex-col items-center justify-center gap-3 aspect-square
                                        ${isOccupied
                                            ? "bg-red-500/10 border-red-500/20 hover:bg-red-500/20"
                                            : "bg-green-500/10 border-green-500/20 hover:bg-green-500/20"
                                        }
                                    `}
                                >
                                    <div className={`p-3 rounded-full ${isOccupied ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
                                        <Monitor className="w-6 h-6" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm font-bold text-white">PC-{pcNum}</div>
                                        {isOccupied ? (
                                            <div className="text-xs text-red-300 mt-1 font-medium truncate max-w-[100px]">
                                                {student?.name}
                                            </div>
                                        ) : (
                                            <div className="text-xs text-green-300 mt-1">Available</div>
                                        )}
                                    </div>

                                    {/* Tooltip for details */}
                                    {isOccupied && (
                                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex flex-col items-center justify-center p-2 text-center z-10">
                                            <User className="w-5 h-5 text-white mb-2" />
                                            <p className="text-xs text-white font-bold">{student?.name}</p>
                                            <p className="text-[10px] text-zinc-400">{student?.course}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
