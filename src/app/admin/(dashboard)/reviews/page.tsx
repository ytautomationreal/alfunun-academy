"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Trash2, Plus, Star, Edit, X } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/components/ui/toast";
import { Review } from "@/lib/types";

export default function ReviewManagement() {
    const { showToast } = useToast();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        rating: 5,
        reviewText: "",
        timeAgo: "1 month ago",
        reviewLink: "",
        imageUrl: "https://placehold.co/100x100/1e293b/06b6d4?text=User"
    });

    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await fetch("/api/reviews");
            const data = await res.json();
            if (data.success) {
                setReviews(data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: number) => {
        setDeletingId(id);
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        try {
            const res = await fetch(`/api/reviews/${deletingId}`, { method: "DELETE" });
            const data = await res.json();

            if (res.ok && data.success) {
                setReviews(reviews.filter((r) => r.id !== deletingId));
                showToast("Review deleted successfully", "success");
                setDeletingId(null);
            } else {
                showToast(data.error || "Failed to delete review", "error");
            }
        } catch (error) {
            showToast("An error occurred while deleting", "error");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        try {
            let finalImageUrl = formData.imageUrl;

            // 1. Upload Image (if selected)
            if (file) {
                const uploadFormData = new FormData();
                uploadFormData.append("file", file);
                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: uploadFormData,
                });
                const uploadData = await uploadRes.json();
                if (uploadData.success) {
                    finalImageUrl = uploadData.url;
                } else {
                    throw new Error(uploadData.error);
                }
            }

            // 2. Save Review (Create or Update)
            const url = editingId ? `/api/reviews/${editingId}` : "/api/reviews";
            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, imageUrl: finalImageUrl }),
            });
            const data = await res.json();

            if (data.success) {
                showToast(editingId ? "Review updated successfully!" : "Review added successfully!", "success");
                setFormData({
                    name: "",
                    rating: 5,
                    reviewText: "",
                    timeAgo: "1 month ago",
                    reviewLink: "",
                    imageUrl: "https://placehold.co/100x100/1e293b/06b6d4?text=User"
                });
                setFile(null);
                setEditingId(null);
                fetchReviews();
            } else {
                showToast(editingId ? "Failed to update review" : "Failed to add review", "error");
            }
        } catch (error) {
            showToast((error as Error).message || "Something went wrong", "error");
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (review: Review) => {
        setEditingId(review.id);
        setFormData({
            name: review.name,
            rating: review.rating,
            reviewText: review.reviewText,
            timeAgo: review.timeAgo,
            reviewLink: review.reviewLink,
            imageUrl: review.imageUrl
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({
            name: "",
            rating: 5,
            reviewText: "",
            timeAgo: "1 month ago",
            reviewLink: "",
            imageUrl: "https://placehold.co/100x100/1e293b/06b6d4?text=User"
        });
        setFile(null);
    };



    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Review Management</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Add Review Form */}
                <Card className="lg:col-span-1 border-white/5 bg-zinc-900/50 h-fit">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            {editingId ? "Edit Review" : "Add Manual Review"}
                            {editingId && (
                                <Button size="sm" variant="ghost" onClick={cancelEdit}>
                                    <X className="w-4 h-4 mr-1" /> Cancel
                                </Button>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Name</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-zinc-950/50"
                                    placeholder="Student Name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Profile Picture</label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="bg-zinc-950/50 cursor-pointer"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Rating (1-5)</label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={formData.rating}
                                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                                    className="bg-zinc-950/50"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Time Label</label>
                                <Input
                                    value={formData.timeAgo}
                                    onChange={(e) => setFormData({ ...formData, timeAgo: e.target.value })}
                                    className="bg-zinc-950/50"
                                    placeholder="e.g. 2 weeks ago"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Google Review Link</label>
                                <Input
                                    value={formData.reviewLink}
                                    onChange={(e) => setFormData({ ...formData, reviewLink: e.target.value })}
                                    className="bg-zinc-950/50"
                                    placeholder="https://maps.google.com/..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Review Text</label>
                                <textarea
                                    value={formData.reviewText}
                                    onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                                    className="flex w-full rounded-md border border-input bg-zinc-950/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                                    placeholder="Copy paste the review content here..."
                                    required
                                />
                            </div>

                            <Button type="submit" variant="glow" className="w-full">
                                {editingId ? (
                                    <>
                                        <Edit className="w-4 h-4 mr-2" /> Update Review
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" /> Add Review
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Review List */}
                <div className="lg:col-span-2 space-y-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="p-4 rounded-lg bg-zinc-900/40 border border-white/5 flex gap-4">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                                <Image
                                    src={review.imageUrl}
                                    alt={review.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-white">{review.name}</h4>
                                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                                            <span>{review.timeAgo}</span>
                                            <span className="flex text-yellow-500">
                                                {[...Array(review.rating)].map((_, i) => (
                                                    <Star key={i} className="w-3 h-3 fill-current" />
                                                ))}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 h-8 w-8 p-0" onClick={() => handleEdit(review)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 h-8 w-8 p-0" onClick={() => handleDelete(review.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <p className="mt-2 text-sm text-zinc-300">{review.reviewText}</p>
                                {review.reviewLink && (
                                    <a href={review.reviewLink} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-500 hover:underline mt-1 block">
                                        View on Maps
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                    {reviews.length === 0 && !loading && (
                        <div className="text-center py-10 text-zinc-500">
                            No reviews added yet.
                        </div>
                    )}
                </div>
            </div>
            {/* DELETE CONFIRMATION MODAL */}
            <Modal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                title="Confirm Removal"
            >
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                        <Trash2 className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Are you sure?</h3>
                        <p className="text-zinc-400 text-sm">Do you really want to delete this review? This action cannot be undone.</p>
                    </div>
                    <div className="flex gap-3 justify-center pt-2">
                        <Button variant="ghost" onClick={() => setDeletingId(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete Review</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
